import { NextRequest, NextResponse } from 'next/server'
import { creerClientServeur, creerClientAdmin } from '@/lib/supabase/server'
import { z } from 'zod'
import { addMonths } from 'date-fns'

const schemaAbonnement = z.object({
  user_id:    z.string().uuid('UUID utilisateur invalide'),
  type:       z.enum(['simple', 'premium']),
  quota:      z.number().int().positive().optional(), // si null, utilise les valeurs par défaut
})

// POST /api/admin/abonnements – Créer un abonnement pour un utilisateur
export async function POST(requete: NextRequest) {
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

  let corps: z.infer<typeof schemaAbonnement>
  try {
    corps = schemaAbonnement.parse(await requete.json())
  } catch (e) {
    return NextResponse.json({ erreur: 'Données invalides.' }, { status: 400 })
  }

  // Récupérer la config pour les quotas et durées par défaut
  const { data: config } = await supabaseAdmin
    .from('configuration_plateforme')
    .select('quota_pack_simple, quota_pack_premium, duree_pack_simple_mois, duree_pack_premium_mois')
    .single<{
      quota_pack_simple: number
      quota_pack_premium: number
      duree_pack_simple_mois: number
      duree_pack_premium_mois: number
    }>()

  const quotaParDefaut = corps.type === 'premium'
    ? (config?.quota_pack_premium ?? 20)
    : (config?.quota_pack_simple  ?? 3)

  const dureeMois = corps.type === 'premium'
    ? (config?.duree_pack_premium_mois ?? 3)
    : (config?.duree_pack_simple_mois  ?? 1)

  const maintenant  = new Date()
  const dateFin     = addMonths(maintenant, dureeMois)

  // Désactiver les abonnements actifs existants
  await supabaseAdmin
    .from('abonnements')
    .update({ actif: false })
    .eq('user_id', corps.user_id)
    .eq('actif', true)

  const { data, error } = await supabaseAdmin
    .from('abonnements')
    .insert({
      user_id:       corps.user_id,
      type:          corps.type,
      quota_total:   corps.quota ?? quotaParDefaut,
      quota_utilise: 0,
      date_debut:    maintenant.toISOString(),
      date_fin:      dateFin.toISOString(),
      actif:         true,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ erreur: error.message }, { status: 500 })

  return NextResponse.json({ data, message: 'Abonnement créé avec succès.' }, { status: 201 })
}
