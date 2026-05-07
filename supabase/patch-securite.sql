-- ============================================================
-- PolitiqueAi – Patch de sécurité
-- À exécuter dans Supabase → SQL Editor après schema.sql
-- ============================================================

-- -------------------------------------------------------
-- 1. Durcissement du trigger handle_new_user
--    Force role = 'client' peu importe ce qu'un attaquant
--    pourrait passer dans raw_user_meta_data.
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nom, prenom, fonction, telephone, role, actif)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nom',      ''),
    COALESCE(NEW.raw_user_meta_data->>'prenom',   ''),
    NEW.raw_user_meta_data->>'fonction',
    NEW.raw_user_meta_data->>'telephone',
    'client',   -- rôle TOUJOURS client à l'inscription, jamais depuis les métadonnées
    true
  )
  ON CONFLICT (id) DO NOTHING;  -- idempotent si le profil existe déjà
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- -------------------------------------------------------
-- 2. Politique RLS : configuration accessible en lecture
--    uniquement aux utilisateurs authentifiés (pour les
--    pages tarifs/abonnement), en écriture admin seulement.
--    On supprime et recrée pour éviter les doublons.
-- -------------------------------------------------------
DROP POLICY IF EXISTS "config_select_authenticated" ON public.configuration_plateforme;
DROP POLICY IF EXISTS "config_admin_write"           ON public.configuration_plateforme;

-- Lecture : tous les utilisateurs authentifiés (pour charger les prix)
CREATE POLICY "config_select_authenticated" ON public.configuration_plateforme
  FOR SELECT USING (auth.role() = 'authenticated');

-- Écriture (INSERT/UPDATE/DELETE) : admin uniquement
CREATE POLICY "config_admin_write" ON public.configuration_plateforme
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );


-- -------------------------------------------------------
-- 3. Politique RLS discours : interdire à un client de
--    modifier un discours qui n'est pas en brouillon.
--    (Déjà en place dans schema.sql, on recrée proprement)
-- -------------------------------------------------------
DROP POLICY IF EXISTS "discours_update_brouillon" ON public.discours;

CREATE POLICY "discours_update_brouillon" ON public.discours
  FOR UPDATE
  USING (
    user_id = auth.uid()
    AND statut = 'brouillon'
  )
  WITH CHECK (
    user_id = auth.uid()
    AND statut = 'brouillon'
  );


-- -------------------------------------------------------
-- 4. Fonctions utilitaires de quota
--    (idempotentes, peuvent être réexécutées sans risque)
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION public.incrementer_quota(p_user_id UUID)
RETURNS VOID AS $$
  UPDATE public.abonnements
  SET quota_utilise = quota_utilise + 1
  WHERE id = (
    SELECT id
    FROM   public.abonnements
    WHERE  user_id  = p_user_id
      AND  actif    = true
      AND  date_fin > NOW()
    ORDER BY date_fin DESC
    LIMIT 1
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.somme_quota_restant()
RETURNS INTEGER AS $$
  SELECT COALESCE(SUM(quota_total - quota_utilise), 0)::INTEGER
  FROM public.abonnements
  WHERE actif = true AND date_fin > NOW();
$$ LANGUAGE sql SECURITY DEFINER;
