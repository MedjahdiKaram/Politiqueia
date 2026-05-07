import { NextRequest, NextResponse } from 'next/server'
import { creerClientServeur, creerClientAdmin } from '@/lib/supabase/server'
import { z } from 'zod'
import type { Abonnement } from '@/types'

const schemaCreation = z.object({
  nom:     z.string().min(1, 'Le nom est requis').max(200, 'Nom trop long'),
  contenu: z.string().min(1, 'Le contenu est requis'),
})

// GET /api/discours – Liste des discours de l'utilisateur connecté
export async function GET(requete: NextRequest) {
  const supabase      = await creerClientServeur()
  const supabaseAdmin = await creerClientAdmin()
  const { data: { user }, error: erreurAuth } = await supabase.auth.getUser()

  if (erreurAuth || !user) {
    return NextResponse.json({ erreur: 'Non authentifié' }, { status: 401 })
  }

  const { searchParams } = new URL(requete.url)
  const page   = parseInt(searchParams.get('page')  ?? '1')
  const limite = parseInt(searchParams.get('limite') ?? '20')
  const statut = searchParams.get('statut')

  let requeteDB = supabaseAdmin
    .from('discours')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range((page - 1) * limite, page * limite - 1)

  if (statut) {
    requeteDB = requeteDB.eq('statut', statut) as typeof requeteDB
  }

  const { data, count, error } = await requeteDB

  if (error) {
    return NextResponse.json({ erreur: error.message }, { status: 500 })
  }

  return NextResponse.json({
    data,
    total:    count ?? 0,
    page,
    limite,
    nb_pages: Math.ceil((count ?? 0) / limite),
  })
}

// POST /api/discours – Créer un nouveau discours
export async function POST(requete: NextRequest) {
  const supabase      = await creerClientServeur()
  const supabaseAdmin = await creerClientAdmin()
  const { data: { user }, error: erreurAuth } = await supabase.auth.getUser()

  if (erreurAuth || !user) {
    return NextResponse.json({ erreur: 'Non authentifié' }, { status: 401 })
  }

  // Vérifier le quota
  const { data: abonnement } = await supabaseAdmin
    .from('abonnements')
    .select('*')
    .eq('user_id', user.id)
    .eq('actif', true)
    .order('date_fin', { ascending: false })
    .limit(1)
    .single<Abonnement>()

  if (!abonnement || new Date(abonnement.date_fin) < new Date()) {
    return NextResponse.json(
      { erreur: 'Aucun abonnement actif. Veuillez souscrire à un forfait.' },
      { status: 403 }
    )
  }

  if (abonnement.quota_utilise >= abonnement.quota_total) {
    return NextResponse.json(
      { erreur: 'Quota de discours épuisé pour cet abonnement.' },
      { status: 403 }
    )
  }

  // Valider le corps
  let corps: z.infer<typeof schemaCreation>
  try {
    const json = await requete.json()
    corps = schemaCreation.parse(json)
  } catch (e) {
    return NextResponse.json({ erreur: 'Données invalides.' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('discours')
    .insert({
      user_id: user.id,
      nom:     corps.nom,
      contenu: corps.contenu,
      statut:  'brouillon',
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ erreur: error.message }, { status: 500 })
  }

  return NextResponse.json({ data }, { status: 201 })
}
