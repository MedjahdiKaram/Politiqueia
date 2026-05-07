-- ============================================================
-- PolitiqueAi – Fonctions SQL supplémentaires
-- À exécuter après schema.sql
-- ============================================================

-- Incrémenter le quota utilisé pour l'abonnement actif d'un utilisateur
CREATE OR REPLACE FUNCTION public.incrementer_quota(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.abonnements
  SET quota_utilise = quota_utilise + 1
  WHERE user_id = p_user_id
    AND actif = true
    AND date_fin >= NOW()
    AND quota_utilise < quota_total;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Calculer la somme des quotas restants sur tous les abonnements actifs
CREATE OR REPLACE FUNCTION public.somme_quota_restant()
RETURNS INTEGER AS $$
  SELECT COALESCE(SUM(GREATEST(0, quota_total - quota_utilise)), 0)::INTEGER
  FROM public.abonnements
  WHERE actif = true AND date_fin >= NOW();
$$ LANGUAGE sql SECURITY DEFINER;

-- Vue pour les statistiques admin
CREATE OR REPLACE VIEW public.vue_stats_admin AS
SELECT
  (SELECT COUNT(*)::INTEGER FROM public.profiles WHERE role = 'client') AS total_utilisateurs,
  (SELECT COUNT(*)::INTEGER FROM public.abonnements WHERE actif = true AND date_fin >= NOW()) AS abonnements_actifs,
  public.somme_quota_restant() AS analyses_restantes,
  (SELECT COUNT(*)::INTEGER FROM public.discours
   WHERE created_at >= NOW() - INTERVAL '24 hours') AS activite_24h;

-- Accorder l'accès à la vue aux utilisateurs authentifiés admin
GRANT SELECT ON public.vue_stats_admin TO authenticated;
