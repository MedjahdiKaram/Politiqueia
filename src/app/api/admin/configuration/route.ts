import { NextRequest, NextResponse } from 'next/server'
import { creerClientServeur, creerClientAdmin } from '@/lib/supabase/server'
import { z } from 'zod'

const schemaConfiguration = z.object({
  cle_api_ia:           z.string().optional(),
  prompt_evaluation:    z.string().min(10, 'Prompt trop court').optional(),
  prompt_reformulation: z.string().min(10, 'Prompt trop court').optional(),
  prix_pack_simple:     z.number().int().positive().optional(),
  prix_pack_premium:    z.number().int().positive().optional(),
  quota_pack_simple:    z.number().int().positive().optional(),
  quota_pack_premium:   z.number().int().positive().optional(),
})

// GET /api/admin/configuration
export async function GET() {
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
    .from('configuration_plateforme')
    .select('*')
    .single()

  if (error) return NextResponse.json({ erreur: error.message }, { status: 500 })

  // Masquer la clé API dans la réponse
  return NextResponse.json({
    data: {
      ...data,
      cle_api_ia: data.cle_api_ia ? '••••••••••••••••' : null,
    },
  })
}

// PUT /api/admin/configuration
export async function PUT(requete: NextRequest) {
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

  let corps: z.infer<typeof schemaConfiguration>
  try {
    corps = schemaConfiguration.parse(await requete.json())
  } catch (e: unknown) {
    const erreurs = e instanceof z.ZodError ? e.errors.map((err) => err.message).join(', ') : 'Données invalides'
    return NextResponse.json({ erreur: erreurs }, { status: 400 })
  }

  // Ne pas écraser la clé si elle est masquée (••••)
  const miseAJour: Record<string, unknown> = { ...corps }
  if (corps.cle_api_ia?.startsWith('••')) {
    delete miseAJour.cle_api_ia
  }

  const { data, error } = await supabaseAdmin
    .from('configuration_plateforme')
    .update(miseAJour)
    .eq('id', '00000000-0000-0000-0000-000000000001')
    .select()
    .single()

  if (error) return NextResponse.json({ erreur: error.message }, { status: 500 })

  return NextResponse.json({ data, message: 'Configuration sauvegardée.' })
}
