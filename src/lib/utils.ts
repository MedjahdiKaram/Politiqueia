import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, differenceInDays, isPast } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { StatutDiscours, Abonnement, AbonnementAvecQuota } from '@/types'

// -------------------------------------------------------
// Utilitaire de classes CSS
// -------------------------------------------------------
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// -------------------------------------------------------
// Formatage de dates en français
// -------------------------------------------------------
export function formaterDate(date: string | Date, formatStr = 'dd MMMM yyyy'): string {
  return format(new Date(date), formatStr, { locale: fr })
}

export function formaterDateCourte(date: string | Date): string {
  return format(new Date(date), 'dd/MM/yyyy', { locale: fr })
}

export function formaterDateHeure(date: string | Date): string {
  return format(new Date(date), "dd MMM yyyy 'à' HH:mm", { locale: fr })
}

// -------------------------------------------------------
// Libellés de statut
// -------------------------------------------------------
export const LIBELLES_STATUT: Record<StatutDiscours, string> = {
  brouillon: 'Brouillon',
  soumis: 'Soumis',
  en_cours: 'En cours',
  analyse: 'Analysé',
}

export const COULEURS_STATUT: Record<StatutDiscours, string> = {
  brouillon: 'bg-gray-100 text-gray-600',
  soumis:    'bg-amber-100 text-amber-700',
  en_cours:  'bg-blue-100 text-blue-700',
  analyse:   'bg-green-100 text-green-700',
}

// -------------------------------------------------------
// Abonnement
// -------------------------------------------------------
export function enrichirAbonnement(ab: Abonnement): AbonnementAvecQuota {
  const jours = differenceInDays(new Date(ab.date_fin), new Date())
  return {
    ...ab,
    quota_restant: Math.max(0, ab.quota_total - ab.quota_utilise),
    jours_restants: Math.max(0, jours),
    est_expire: isPast(new Date(ab.date_fin)),
  }
}

export const LIBELLES_PACK: Record<string, string> = {
  simple:  'Pack Simple',
  premium: 'Pack Premium',
}

// -------------------------------------------------------
// Formatage des nombres
// -------------------------------------------------------
export function formaterPrix(montant: number): string {
  return new Intl.NumberFormat('fr-DZ').format(montant) + ' DA'
}

// -------------------------------------------------------
// Troncature de texte
// -------------------------------------------------------
export function tronquer(texte: string, longueur = 100): string {
  if (texte.length <= longueur) return texte
  return texte.slice(0, longueur).trimEnd() + '…'
}

// -------------------------------------------------------
// Nettoyage HTML (pour afficher le contenu WYSIWYG en texte)
// -------------------------------------------------------
export function nettoyerHTML(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
}

export function compterCaracteres(html: string): number {
  return nettoyerHTML(html).length
}

// -------------------------------------------------------
// Génération d'initiales
// -------------------------------------------------------
export function initiales(prenom: string, nom: string): string {
  return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase()
}

// -------------------------------------------------------
// Validation email
// -------------------------------------------------------
export function estEmailValide(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
