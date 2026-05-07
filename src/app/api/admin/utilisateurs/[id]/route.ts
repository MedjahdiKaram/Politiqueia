import { NextRequest, NextResponse } from 'next/server'
import { creerClientServeur, creerClientAdmin } from '@/lib/supabase/server'
import { z } from 'zod'

interface PropsRoute {
  params: { id: string }
}

const schemaMiseAJour = z.object({
  actif: z.boolean().optional(),
  role:  z.enum(['client', 'admin']).optional(),
})

// GET /api/admin/utilisateurs/[id]
export async function GET(_: NextRequest, { params }: PropsRoute) {
  const supabase      = await creerClientServeur()
  const supabaseAdmin = await creerClientAdmin()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ erreur: 'Non authentifié' }, { status: 401 })

  const { data: profil } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single<{ role: string }>()

  if (profil?.role !== 'admin') {
    return NextResponse.json({ erreur: 'Accès interdit.' }, { status: 403 })
  }

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*, abonnements(type, quota_total, quota_utilise, date_fin, actif)')
    .eq('id', params.id)
    .single()

  if (error || !data) return NextResponse.json({ erreur: 'Utilisateur introuvable.' }, { status: 404 })

  return NextResponse.json({ data })
}

// PATCH /api/admin/utilisateurs/[id] – Activer/désactiver ou changer le rôle
export async function PATCH(requete: NextRequest, { params }: PropsRoute) {
  const supabase      = await creerClientServeur()
  const supabaseAdmin = await creerClientAdmin()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ erreur: 'Non authentifié' }, { status: 401 })

  const { data: profil } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single<{ role: string }>()

  if (profil?.role !== 'admin') {
    return NextResponse.json({ erreur: 'Accès interdit.' }, { status: 403 })
  }

  let corps: z.infer<typeof schemaMiseAJour>
  try {
    corps = schemaMiseAJour.parse(await requete.json())
  } catch {
    return NextResponse.json({ erreur: 'Données invalides.' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update(corps)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ erreur: error.message }, { status: 500 })

  return NextResponse.json({ data })
}
