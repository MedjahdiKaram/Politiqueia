import { NextRequest, NextResponse } from 'next/server'
import { creerClientServeur, creerClientAdmin } from '@/lib/supabase/server'
import { addMonths } from 'date-fns'
import { z } from 'zod'
import type { ConfigurationPlateforme } from '@/types'

const schemaChoixPack = z.object({
  type: z.enum(['simple', 'premium']),
})

// POST /api/abonnements
// Permet à un client connecté de souscrire à un pack.
// Crée l'abonnement et désactive tous les précédents.
export async function POST(requete: NextRequest) {
  const supabase      = await creerClientServeur()
  const supabaseAdmin = await creerClientAdmin()

  const { data: { user }, error: erreurAuth } = await supabase.auth.getUser()
  if (erreurAuth || !user) {
    return NextResponse.json({ erreur: 'Non authentifié.' }, { status: 401 })
  }

  // Vérifier que l'utilisateur est bien un client actif (pas admin)
  const { data: profil } = await supabaseAdmin
    .from('profiles')
    .select('role, actif')
    .eq('id', user.id)
    .single<{ role: string; actif: boolean }>()

  if (!profil?.actif) {
    return NextResponse.json({ erreur: 'Compte désactivé.' }, { status: 403 })
  }

  // Valider le corps
  let corps: z.infer<typeof schemaChoixPack>
  try {
    corps = schemaChoixPack.parse(await requete.json())
  } catch {
    return NextResponse.json({ erreur: 'Type de pack invalide.' }, { status: 400 })
  }

  // Charger la configuration pour les quotas et durées
  const { data: config } = await supabaseAdmin
    .from('configuration_plateforme')
    .select('quota_pack_simple, quota_pack_premium, duree_pack_simple_mois, duree_pack_premium_mois')
    .single<Pick<
      ConfigurationPlateforme,
      'quota_pack_simple' | 'quota_pack_premium' |
      'duree_pack_simple_mois' | 'duree_pack_premium_mois'
    >>()

  const quotaTotal = corps.type === 'premium'
    ? (config?.quota_pack_premium  ?? 20)
    : (config?.quota_pack_simple   ?? 3)

  const dureeMois = corps.type === 'premium'
    ? (config?.duree_pack_premium_mois ?? 3)
    : (config?.duree_pack_simple_mois  ?? 1)

  const maintenant = new Date()
  const dateFin    = addMonths(maintenant, dureeMois)

  // Désactiver tous les abonnements existants de cet utilisateur
  await supabaseAdmin
    .from('abonnements')
    .update({ actif: false })
    .eq('user_id', user.id)
    .eq('actif', true)

  // Créer le nouvel abonnement
  const { data, error } = await supabaseAdmin
    .from('abonnements')
    .insert({
      user_id:       user.id,
      type:          corps.type,
      quota_total:   quotaTotal,
      quota_utilise: 0,
      date_debut:    maintenant.toISOString(),
      date_fin:      dateFin.toISOString(),
      actif:         true,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ erreur: error.message }, { status: 500 })
  }

  return NextResponse.json(
    { data, message: `Abonnement ${corps.type} activé avec succès.` },
    { status: 201 }
  )
}
