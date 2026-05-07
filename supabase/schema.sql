-- ============================================================
-- PolitiqueAi – Schéma Supabase (PostgreSQL)
-- ============================================================

-- -------------------------------------------------------
-- Extension UUID
-- -------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -------------------------------------------------------
-- TABLE : profiles
-- Étend auth.users de Supabase
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nom         TEXT        NOT NULL,
  prenom      TEXT        NOT NULL,
  fonction    TEXT,
  telephone   TEXT,
  role        TEXT        NOT NULL DEFAULT 'client'
                          CHECK (role IN ('client', 'admin')),
  actif       BOOLEAN     NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.profiles IS 'Profils utilisateurs, extension de auth.users';

-- -------------------------------------------------------
-- TABLE : abonnements
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.abonnements (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type            TEXT        NOT NULL CHECK (type IN ('simple', 'premium')),
  quota_total     INTEGER     NOT NULL,
  quota_utilise   INTEGER     NOT NULL DEFAULT 0,
  date_debut      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  date_fin        TIMESTAMPTZ NOT NULL,
  actif           BOOLEAN     NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT quota_valide CHECK (quota_utilise >= 0 AND quota_utilise <= quota_total)
);

COMMENT ON TABLE public.abonnements IS 'Abonnements utilisateurs avec quotas de discours';

-- -------------------------------------------------------
-- TABLE : discours
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.discours (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nom             TEXT        NOT NULL,
  contenu         TEXT        NOT NULL DEFAULT '',
  statut          TEXT        NOT NULL DEFAULT 'brouillon'
                              CHECK (statut IN ('brouillon', 'soumis', 'en_cours', 'analyse')),
  evaluation      TEXT,
  reformulation   TEXT,
  score_persuasion INTEGER    CHECK (score_persuasion BETWEEN 0 AND 100),
  score_clarte    INTEGER     CHECK (score_clarte BETWEEN 0 AND 100),
  soumis_at       TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.discours IS 'Discours politiques soumis pour évaluation IA';
COMMENT ON COLUMN public.discours.statut IS 'brouillon=en rédaction, soumis=en attente, en_cours=traitement IA, analyse=terminé';

-- -------------------------------------------------------
-- TABLE : configuration_plateforme
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.configuration_plateforme (
  id                    UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  cle_api_ia            TEXT,
  prompt_evaluation     TEXT    NOT NULL DEFAULT 'Vous êtes un expert en analyse institutionnelle. Votre tâche est d''évaluer le discours fourni selon les critères de rigueur, de clarté et de force de persuasion. Analysez la clarté sémantique, la cohérence thématique, la rhétorique. Fournissez un score de 0 à 100 pour chaque axe.',
  prompt_reformulation  TEXT    NOT NULL DEFAULT 'Reformulez les segments de texte sélectionnés pour améliorer l''impact rhétorique tout en préservant l''intention originale de l''orateur. Utilisez un ton formel et institutionnel.',
  prix_pack_simple      INTEGER NOT NULL DEFAULT 2000,
  prix_pack_premium     INTEGER NOT NULL DEFAULT 7000,
  quota_pack_simple     INTEGER NOT NULL DEFAULT 3,
  quota_pack_premium    INTEGER NOT NULL DEFAULT 20,
  duree_pack_simple_mois  INTEGER NOT NULL DEFAULT 1,
  duree_pack_premium_mois INTEGER NOT NULL DEFAULT 3,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.configuration_plateforme IS 'Configuration globale de la plateforme (clé IA, prompts, tarifs)';

-- Insérer la configuration par défaut (singleton)
INSERT INTO public.configuration_plateforme (id)
VALUES ('00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------
-- TRIGGERS : updated_at automatique
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trigger_abonnements_updated_at
  BEFORE UPDATE ON public.abonnements
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trigger_discours_updated_at
  BEFORE UPDATE ON public.discours
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trigger_configuration_updated_at
  BEFORE UPDATE ON public.configuration_plateforme
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- -------------------------------------------------------
-- TRIGGER : créer le profil automatiquement à l'inscription
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nom, prenom, fonction, telephone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nom', ''),
    COALESCE(NEW.raw_user_meta_data->>'prenom', ''),
    NEW.raw_user_meta_data->>'fonction',
    NEW.raw_user_meta_data->>'telephone'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- -------------------------------------------------------
-- TRIGGER : marquer soumis_at lors de la soumission
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_discours_soumission()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.statut = 'soumis' AND OLD.statut = 'brouillon' THEN
    NEW.soumis_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_discours_soumission
  BEFORE UPDATE ON public.discours
  FOR EACH ROW EXECUTE FUNCTION public.handle_discours_soumission();

-- -------------------------------------------------------
-- FUNCTION : désactiver les abonnements expirés (cron)
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION public.desactiver_abonnements_expires()
RETURNS INTEGER AS $$
DECLARE
  nb_desactives INTEGER;
BEGIN
  UPDATE public.abonnements
  SET actif = false
  WHERE actif = true AND date_fin < NOW();

  GET DIAGNOSTICS nb_desactives = ROW_COUNT;
  RETURN nb_desactives;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -------------------------------------------------------
-- ROW LEVEL SECURITY (RLS)
-- -------------------------------------------------------

ALTER TABLE public.profiles                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.abonnements             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discours                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuration_plateforme ENABLE ROW LEVEL SECURITY;

-- Profiles : chaque utilisateur voit/modifie son propre profil
-- Les admins voient tout
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_admin_all" ON public.profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Abonnements : client voit le sien, admin voit tout
CREATE POLICY "abonnements_select_own" ON public.abonnements
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "abonnements_admin_all" ON public.abonnements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Discours : client voit les siens uniquement
CREATE POLICY "discours_select_own" ON public.discours
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "discours_insert_own" ON public.discours
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "discours_update_brouillon" ON public.discours
  FOR UPDATE USING (
    user_id = auth.uid() AND statut = 'brouillon'
  );

CREATE POLICY "discours_admin_all" ON public.discours
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Configuration : lecture pour tous les authentifiés, écriture admin
CREATE POLICY "config_select_authenticated" ON public.configuration_plateforme
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "config_admin_write" ON public.configuration_plateforme
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- -------------------------------------------------------
-- INDEX
-- -------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_discours_user_id    ON public.discours(user_id);
CREATE INDEX IF NOT EXISTS idx_discours_statut     ON public.discours(statut);
CREATE INDEX IF NOT EXISTS idx_discours_created_at ON public.discours(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_abonnements_user_id ON public.abonnements(user_id);
CREATE INDEX IF NOT EXISTS idx_abonnements_actif   ON public.abonnements(actif);
CREATE INDEX IF NOT EXISTS idx_profiles_role       ON public.profiles(role);
