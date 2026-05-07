-- ============================================================
-- FIX : Récursion infinie dans les politiques RLS profiles
-- À exécuter dans Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Créer une fonction SECURITY DEFINER pour vérifier le rôle admin
--    sans déclencher les politiques RLS (évite la récursion)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (SELECT role = 'admin' FROM public.profiles WHERE id = auth.uid()),
    FALSE
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 2. Supprimer les politiques récursives sur profiles
DROP POLICY IF EXISTS "profiles_select_own"  ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_all"   ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own"  ON public.profiles;

-- 3. Recréer les politiques sans récursion
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id
    OR public.is_admin()
  );

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_admin_all" ON public.profiles
  FOR ALL USING (public.is_admin());

-- 4. Mettre à jour les politiques des autres tables pour utiliser is_admin()
--    (optionnel mais plus efficace - évite les subqueries répétées)

-- abonnements
DROP POLICY IF EXISTS "abonnements_select_own" ON public.abonnements;
DROP POLICY IF EXISTS "abonnements_admin_all"  ON public.abonnements;

CREATE POLICY "abonnements_select_own" ON public.abonnements
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "abonnements_admin_all" ON public.abonnements
  FOR ALL USING (public.is_admin());

-- discours
DROP POLICY IF EXISTS "discours_select_own"       ON public.discours;
DROP POLICY IF EXISTS "discours_insert_own"        ON public.discours;
DROP POLICY IF EXISTS "discours_update_brouillon"  ON public.discours;
DROP POLICY IF EXISTS "discours_admin_all"         ON public.discours;

CREATE POLICY "discours_select_own" ON public.discours
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "discours_insert_own" ON public.discours
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "discours_update_brouillon" ON public.discours
  FOR UPDATE USING (
    (user_id = auth.uid() AND statut = 'brouillon')
    OR public.is_admin()
  );

CREATE POLICY "discours_admin_all" ON public.discours
  FOR ALL USING (public.is_admin());

-- configuration_plateforme
DROP POLICY IF EXISTS "config_admin_write" ON public.configuration_plateforme;

CREATE POLICY "config_admin_write" ON public.configuration_plateforme
  FOR ALL USING (public.is_admin());
