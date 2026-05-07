import { NextRequest, NextResponse } from 'next/server'
import { creerClientServeur, creerClientAdmin } from '@/lib/supabase/server'

interface PropsRoute {
  params: { id: string }
}

// POST /api/admin/utilisateurs/[id]/reset-password
export async function POST(_: NextRequest, { params }: PropsRoute) {
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
  const { data: utilisateur, error: erreurUser } = await supabaseAdmin.auth.admin.getUserById(params.id)

  if (erreurUser || !utilisateur?.user) {
    return NextResponse.json({ erreur: 'Utilisateur introuvable.' }, { status: 404 })
  }

  const email = utilisateur.user.email
  if (!email) {
    return NextResponse.json({ erreur: 'Aucun email associé à ce compte.' }, { status: 400 })
  }

  const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/nouveau-mot-de-passe`,
  })

  if (error) {
    return NextResponse.json({ erreur: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: `Email de réinitialisation envoyé à ${email}.` })
}
