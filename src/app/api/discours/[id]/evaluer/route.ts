import { NextRequest, NextResponse } from 'next/server'
import { creerClientServeur, creerClientAdmin } from '@/lib/supabase/server'
import { evaluerDiscours } from '@/lib/ai/evaluateur'
import { nettoyerHTML } from '@/lib/utils'
import type { Discours, ConfigurationPlateforme, Abonnement } from '@/types'

interface PropsRoute {
  params: { id: string }
}

// POST /api/discours/[id]/evaluer
// Soumet un discours pour évaluation IA
export async function POST(requete: NextRequest, { params }: PropsRoute) {
  const supabase      = await creerClientServeur()
  const supabaseAdmin = await creerClientAdmin()

  const { data: { user }, error: erreurAuth } = await supabase.auth.getUser()

  if (erreurAuth || !user) {
    return NextResponse.json({ erreur: 'Non authentifié' }, { status: 401 })
  }

  // Utilise le client admin pour contourner les RLS récursives
  const { data: discours } = await supabaseAdmin
    .from('discours')
    .select('*')
    .eq('id', params.id)
    .single<Discours>()

  if (!discours) {
    return NextResponse.json({ erreur: 'Discours introuvable.' }, { status: 404 })
  }

  // Vérifier ownership (sauf admin)
  const { data: profil } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single<{ role: string }>()

  if (profil?.role !== 'admin' && discours.user_id !== user.id) {
    return NextResponse.json({ erreur: 'Accès interdit.' }, { status: 403 })
  }

  // Vérifier que le discours n'est pas déjà en traitement ou analysé
  if (discours.statut === 'en_cours') {
    return NextResponse.json({ erreur: 'Évaluation déjà en cours.' }, { status: 409 })
  }
  if (discours.statut === 'analyse') {
    return NextResponse.json({ erreur: 'Ce discours a déjà été analysé.' }, { status: 409 })
  }

  // Vérification du contenu (texte brut, sans HTML)
  const contenuTexte = nettoyerHTML(discours.contenu ?? '')
  if (!contenuTexte || contenuTexte.trim().length < 50) {
    return NextResponse.json(
      { erreur: 'Le contenu du discours est trop court pour être analysé (minimum 50 caractères).' },
      { status: 422 }
    )
  }

  // Vérifier abonnement du propriétaire
  if (profil?.role !== 'admin') {
    const { data: abonnement } = await supabaseAdmin
      .from('abonnements')
      .select('*')
      .eq('user_id', discours.user_id)
      .eq('actif', true)
      .order('date_fin', { ascending: false })
      .limit(1)
      .single<Abonnement>()

    if (!abonnement || new Date(abonnement.date_fin) < new Date()) {
      return NextResponse.json({ erreur: 'Abonnement expiré ou inexistant.' }, { status: 403 })
    }

    if (abonnement.quota_utilise >= abonnement.quota_total) {
      return NextResponse.json({ erreur: 'Quota épuisé.' }, { status: 403 })
    }
  }

  // Récupérer la configuration IA
  const { data: config } = await supabaseAdmin
    .from('configuration_plateforme')
    .select('*')
    .single<ConfigurationPlateforme>()

  const cleApi = config?.cle_api_ia ?? process.env.OPENAI_API_KEY ?? ''

  if (!cleApi) {
    return NextResponse.json(
      { erreur: 'Clé API IA non configurée. Contactez l\'administrateur.' },
      { status: 503 }
    )
  }

  // Marquer en cours
  await supabaseAdmin
    .from('discours')
    .update({
      statut:    'en_cours',
      soumis_at: discours.soumis_at ?? new Date().toISOString(),
    })
    .eq('id', params.id)

  try {
    const resultat = await evaluerDiscours({
      cleApi,
      promptEvaluation:    config?.prompt_evaluation    ?? '',
      promptReformulation: config?.prompt_reformulation ?? '',
      contenuDiscours:     contenuTexte,
      nomDiscours:         discours.nom,
    })

    // Vérifier le type d'abonnement pour la reformulation
    const { data: abonnementProprio } = await supabaseAdmin
      .from('abonnements')
      .select('type, actif')
      .eq('user_id', discours.user_id)
      .eq('actif', true)
      .limit(1)
      .single<Pick<Abonnement, 'type' | 'actif'>>()

    const inclureReformulation = profil?.role === 'admin' || abonnementProprio?.type === 'premium'

    // Sauvegarder les résultats
    await supabaseAdmin
      .from('discours')
      .update({
        statut:           'analyse',
        evaluation:       resultat.evaluation,
        reformulation:    inclureReformulation ? resultat.reformulation : null,
        score_persuasion: resultat.score_persuasion,
        score_clarte:     resultat.score_clarte,
      })
      .eq('id', params.id)

    // Incrémenter le quota utilisé
    if (profil?.role !== 'admin') {
      await supabaseAdmin.rpc('incrementer_quota', { p_user_id: discours.user_id })
    }

    return NextResponse.json({
      message: 'Évaluation terminée avec succès.',
      data: { score_persuasion: resultat.score_persuasion, score_clarte: resultat.score_clarte },
    })
  } catch (erreur: unknown) {
    // En cas d'erreur, repasser en statut soumis
    await supabaseAdmin
      .from('discours')
      .update({ statut: 'soumis' })
      .eq('id', params.id)

    const message = erreur instanceof Error ? erreur.message : 'Erreur lors de l\'évaluation IA.'
    return NextResponse.json({ erreur: message }, { status: 500 })
  }
}
