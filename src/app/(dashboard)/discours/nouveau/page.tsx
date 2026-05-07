import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { creerClientServeur, creerClientAdmin } from '@/lib/supabase/server'
import { abonnementEstValide } from '@/lib/abonnement'
import EditeurDiscours from '@/components/discours/EditeurDiscours'
import PiedPage from '@/components/layout/PiedPage'
import type { Abonnement, Profil } from '@/types'

export const metadata: Metadata = { title: 'Nouveau discours' }

export default async function PageNouveauDiscours() {
  const supabase      = await creerClientServeur()
  const supabaseAdmin = await creerClientAdmin()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  // Vérifier le rôle
  const { data: profil } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single<Pick<Profil, 'role'>>()

  // Vérifier l'abonnement (sauf admin)
  if (profil?.role !== 'admin') {
    const { data: abonnement } = await supabaseAdmin
      .from('abonnements')
      .select('*')
      .eq('user_id', user.id)
      .eq('actif', true)
      .order('date_fin', { ascending: false })
      .limit(1)
      .single<Abonnement>()

    if (!abonnementEstValide(abonnement)) {
      redirect('/choisir-pack')
    }
  }

  return (
    <div className="flex flex-col flex-1">
      <div className="flex-1 p-8">
        <EditeurDiscours mode="creation" />
      </div>
      <PiedPage />
    </div>
  )
}
