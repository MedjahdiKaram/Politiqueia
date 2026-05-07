import type { Abonnement } from '@/types'

/**
 * Retourne vrai si l'abonnement est valide :
 * actif, non expiré, et quota non épuisé.
 */
export function abonnementEstValide(ab: Abonnement | null | undefined): boolean {
  if (!ab) return false
  if (!ab.actif) return false
  if (new Date(ab.date_fin) <= new Date()) return false
  if (ab.quota_utilise >= ab.quota_total) return false
  return true
}

/**
 * Détermine la raison d'un abonnement invalide pour personnaliser le message.
 */
export function raisonAbonnementInvalide(
  ab: Abonnement | null | undefined
): 'nouveau' | 'expire' | 'quota_epuise' {
  if (!ab) return 'nouveau'
  if (ab.quota_utilise >= ab.quota_total) return 'quota_epuise'
  return 'expire'
}
