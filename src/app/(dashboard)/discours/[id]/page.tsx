import { redirect, notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { creerClientServeur, creerClientAdmin } from '@/lib/supabase/server'
import OngletDiscours from '@/components/discours/OngletDiscours'
import { BadgeStatut } from '@/components/ui/Badge'
import PiedPage from '@/components/layout/PiedPage'
import { formaterDateCourte } from '@/lib/utils'
import type { Discours, Abonnement } from '@/types'

interface PropsPage {
  params: { id: string }
}

export async function generateMetadata({ params }: PropsPage): Promise<Metadata> {
  const supabase = await creerClientAdmin()
  const { data } = await supabase
    .from('discours')
    .select('nom')
    .eq('id', params.id)
    .single<Pick<Discours, 'nom'>>()

  return { title: data?.nom ? `${data.nom} – Politiqueia` : 'Discours – Politiqueia' }
}

export default async function PageDiscours({ params }: PropsPage) {
  const supabase      = await creerClientServeur()
  const supabaseAdmin = await creerClientAdmin()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: discours } = await supabaseAdmin
    .from('discours')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single<Discours>()

  if (!discours) notFound()

  // Abonnement pour vérifier le type (reformulation premium)
  const { data: abonnement } = await supabaseAdmin
    .from('abonnements')
    .select('type, actif')
    .eq('user_id', user.id)
    .eq('actif', true)
    .limit(1)
    .single<Pick<Abonnement, 'type' | 'actif'>>()

  const aReformulation = abonnement?.type === 'premium'

  return (
    <div className="flex flex-col flex-1">
      {/* En-tête de navigation */}
      <div className="border-b border-zinc-200 bg-white px-8 py-4 flex items-center justify-between">
        <Link
          href="/discours"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Mes discours
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-400">
            Créé le {formaterDateCourte(discours.created_at)}
          </span>
          <BadgeStatut statut={discours.statut} />
        </div>
      </div>

      {/* Onglets : Contenu / Évaluation */}
      <OngletDiscours discours={discours} aReformulation={aReformulation} />

      <PiedPage />
    </div>
  )
}
