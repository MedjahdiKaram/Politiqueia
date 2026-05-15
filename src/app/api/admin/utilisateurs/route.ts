import { NextRequest, NextResponse } from 'next/server'
import { creerClientServeur, creerClientAdmin } from '@/lib/supabase/server'
import { z } from 'zod'

const schemaCreation = z.object({
  prenom:     z.string().min(1, 'Prénom requis'),
  nom:        z.string().min(1, 'Nom requis'),
  email:      z.string().email('Email invalide'),
  motDePasse: z.string().min(8, 'Mot de passe : 8 caractères minimum'),
  telephone:  z.string().optional(),
  fonction:   z.string().optional(),
  role:       z.enum(['client', 'admin']).default('client'),
})

// POST /api/admin/utilisateurs — Créer un utilisateur (invitation admin)
export async function POST(requete: NextRequest) {
  const supabase      = await creerClientServeur()
  const supabaseAdmin = creerClientAdmin()
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

  let corps: z.infer<typeof schemaCreation>
  try {
    corps = schemaCreation.parse(await requete.json())
  } catch (e: unknown) {
    const msg = e instanceof z.ZodError ? e.errors[0]?.message : 'Données invalides.'
    return NextResponse.json({ erreur: msg }, { status: 400 })
  }

  // Créer l'utilisateur via l'API admin (email auto-confirmé)
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email:            corps.email,
    password:         corps.motDePasse,
    email_confirm:    true,
    user_metadata: {
      prenom:    corps.prenom,
      nom:       corps.nom,
      fonction:  corps.fonction ?? '',
      telephone: corps.telephone ?? '',
    },
  })

  if (authError || !authData.user) {
    const msg = authError?.message?.includes('already registered')
      ? 'Cette adresse email est déjà utilisée.'
      : (authError?.message ?? 'Erreur lors de la création.')
    return NextResponse.json({ erreur: msg }, { status: 400 })
  }

  // Mettre à jour le profil avec les données complètes + rôle
  // (le trigger handle_new_user crée le profil, on le met à jour ensuite)
  await supabaseAdmin
    .from('profiles')
    .update({
      prenom:    corps.prenom,
      nom:       corps.nom,
      email:     corps.email,
      telephone: corps.telephone ?? null,
      fonction:  corps.fonction  ?? null,
      role:      corps.role,
      actif:     true,
    })
    .eq('id', authData.user.id)

  return NextResponse.json(
    { data: authData.user, message: 'Utilisateur créé avec succès.' },
    { status: 201 }
  )
}
