import { NextRequest, NextResponse } from 'next/server'
import { creerClientServeur, creerClientAdmin } from '@/lib/supabase/server'
import { z } from 'zod'
import type { Discours } from '@/types'

const schemaMiseAJour = z.object({
  nom:     z.string().min(1).max(200).optional(),
  contenu: z.string().min(1).optional(),
})

interface PropsRoute {
  params: { id: string }
}

// GET /api/discours/[id]
export async function GET(_: NextRequest, { params }: PropsRoute) {
  const supabase      = await creerClientServeur()
  const supabaseAdmin = await creerClientAdmin()
  const { data: { user }, error: erreurAuth } = await supabase.auth.getUser()

  if (erreurAuth || !user) {
    return NextResponse.json({ erreur: 'Non authentifié' }, { status: 401 })
  }

  const { data, error } = await supabaseAdmin
    .from('discours')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single<Discours>()

  if (error || !data) {
    return NextResponse.json({ erreur: 'Discours introuvable.' }, { status: 404 })
  }

  return NextResponse.json({ data })
}

// PATCH /api/discours/[id] – Modifier un discours (brouillon seulement)
export async function PATCH(requete: NextRequest, { params }: PropsRoute) {
  const supabase      = await creerClientServeur()
  const supabaseAdmin = await creerClientAdmin()
  const { data: { user }, error: erreurAuth } = await supabase.auth.getUser()

  if (erreurAuth || !user) {
    return NextResponse.json({ erreur: 'Non authentifié' }, { status: 401 })
  }

  const { data: discours } = await supabaseAdmin
    .from('discours')
    .select('id, statut, user_id')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single<Pick<Discours, 'id' | 'statut' | 'user_id'>>()

  if (!discours) {
    return NextResponse.json({ erreur: 'Discours introuvable.' }, { status: 404 })
  }

  if (discours.statut !== 'brouillon') {
    return NextResponse.json(
      { erreur: 'Ce discours ne peut plus être modifié après soumission.' },
      { status: 422 }
    )
  }

  let corps: z.infer<typeof schemaMiseAJour>
  try {
    const json = await requete.json()
    corps = schemaMiseAJour.parse(json)
  } catch {
    return NextResponse.json({ erreur: 'Données invalides.' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('discours')
    .update(corps)
    .eq('id', params.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ erreur: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}

// DELETE /api/discours/[id] – Supprimer un discours brouillon
export async function DELETE(_: NextRequest, { params }: PropsRoute) {
  const supabase      = await creerClientServeur()
  const supabaseAdmin = await creerClientAdmin()
  const { data: { user }, error: erreurAuth } = await supabase.auth.getUser()

  if (erreurAuth || !user) {
    return NextResponse.json({ erreur: 'Non authentifié' }, { status: 401 })
  }

  const { data: discours } = await supabaseAdmin
    .from('discours')
    .select('statut')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single<Pick<Discours, 'statut'>>()

  if (!discours) {
    return NextResponse.json({ erreur: 'Discours introuvable.' }, { status: 404 })
  }

  if (discours.statut !== 'brouillon') {
    return NextResponse.json(
      { erreur: 'Seuls les brouillons peuvent être supprimés.' },
      { status: 422 }
    )
  }

  const { error } = await supabaseAdmin
    .from('discours')
    .delete()
    .eq('id', params.id)
    .eq('user_id', user.id)   // double-vérification ownership dans la requête finale

  if (error) {
    return NextResponse.json({ erreur: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: 'Discours supprimé.' })
}
