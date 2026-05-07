import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * GET /api/cron/abonnements
 * Cron job Vercel : désactive les abonnements expirés.
 * Configuré dans vercel.json – exécuté quotidiennement à 01h00 UTC.
 *
 * Sécurisé par Authorization: Bearer <CRON_SECRET>
 */
export async function GET(requete: NextRequest) {
  // Vérification du secret cron
  const autorisation = requete.headers.get('authorization')
  const cronSecret   = process.env.CRON_SECRET

  if (cronSecret && autorisation !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ erreur: 'Non autorisé.' }, { status: 401 })
  }

  // Client admin (service role)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    const { data, error } = await supabase.rpc('desactiver_abonnements_expires')

    if (error) throw error

    const nbDesactives = data as number

    console.log(`[CRON] Abonnements désactivés : ${nbDesactives}`)

    return NextResponse.json({
      succes:        true,
      nb_desactives: nbDesactives,
      horodatage:    new Date().toISOString(),
    })
  } catch (erreur: unknown) {
    console.error('[CRON] Erreur :', erreur)
    return NextResponse.json(
      { erreur: erreur instanceof Error ? erreur.message : 'Erreur inconnue.' },
      { status: 500 }
    )
  }
}
