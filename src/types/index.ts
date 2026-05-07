// ============================================================
// PolitiqueAi – Types TypeScript centralisés
// ============================================================

export type Role = 'client' | 'admin'

export type StatutDiscours = 'brouillon' | 'soumis' | 'en_cours' | 'analyse'

export type TypeAbonnement = 'simple' | 'premium'

// -------------------------------------------------------
// Profil utilisateur
// -------------------------------------------------------
export interface Profil {
  id: string
  nom: string
  prenom: string
  email: string | null
  fonction: string | null
  telephone: string | null
  role: Role
  actif: boolean
  created_at: string
  updated_at: string
}

export interface ProfilComplet extends Profil {
  email: string
  abonnement_actif?: Abonnement | null
}

// -------------------------------------------------------
// Abonnement
// -------------------------------------------------------
export interface Abonnement {
  id: string
  user_id: string
  type: TypeAbonnement
  quota_total: number
  quota_utilise: number
  date_debut: string
  date_fin: string
  actif: boolean
  created_at: string
  updated_at: string
}

export interface AbonnementAvecQuota extends Abonnement {
  quota_restant: number
  jours_restants: number
  est_expire: boolean
}

// -------------------------------------------------------
// Discours
// -------------------------------------------------------
export interface Discours {
  id: string
  user_id: string
  nom: string
  contenu: string
  statut: StatutDiscours
  evaluation: string | null
  reformulation: string | null
  score_persuasion: number | null
  score_clarte: number | null
  soumis_at: string | null
  created_at: string
  updated_at: string
}

export interface DiscoursAvecProfil extends Discours {
  profil: Pick<Profil, 'nom' | 'prenom' | 'fonction'>
}

// -------------------------------------------------------
// Configuration plateforme
// -------------------------------------------------------
export interface ConfigurationPlateforme {
  id: string
  cle_api_ia: string | null
  prompt_evaluation: string
  prompt_reformulation: string
  prix_pack_simple: number
  prix_pack_premium: number
  quota_pack_simple: number
  quota_pack_premium: number
  duree_pack_simple_mois: number
  duree_pack_premium_mois: number
  created_at: string
  updated_at: string
}

// -------------------------------------------------------
// Formulaires
// -------------------------------------------------------
export interface FormulaireInscription {
  nom: string
  prenom: string
  fonction: string
  email: string
  telephone: string
  motDePasse: string
}

export interface FormulaireConnexion {
  email: string
  motDePasse: string
}

export interface FormulaireDiscours {
  nom: string
  contenu: string
}

export interface FormulaireConfiguration {
  cle_api_ia: string
  prompt_evaluation: string
  prompt_reformulation: string
  prix_pack_simple: number
  prix_pack_premium: number
}

// -------------------------------------------------------
// Réponses API
// -------------------------------------------------------
export interface ReponseAPI<T = unknown> {
  data?: T
  erreur?: string
  message?: string
}

export interface ReponseEvaluation {
  evaluation: string
  reformulation: string
  score_persuasion: number
  score_clarte: number
}

// -------------------------------------------------------
// Pagination
// -------------------------------------------------------
export interface ParametresPagination {
  page: number
  limite: number
}

export interface ResultatPagine<T> {
  donnees: T[]
  total: number
  page: number
  limite: number
  nb_pages: number
}

// -------------------------------------------------------
// Stats admin
// -------------------------------------------------------
export interface StatsAdmin {
  total_utilisateurs: number
  abonnements_actifs: number
  analyses_restantes: number
  activite_24h: number
}
