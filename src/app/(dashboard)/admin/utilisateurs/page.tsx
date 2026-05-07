import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { creerClientServeur, creerClientAdmin } from '@/lib/supabase/server'
import TableauUtilisateurs from '@/components/admin/TableauUtilisateurs'
import PiedPage from '@/components/layout/PiedPage'
import type { Profil } from '@/types'

export const metadata: Metadata = { title: 'Gestion des utilisateurs' }

export default async function PageAdminUtilisateurs() {
  const supabase      = await creerClientServeur()
  const supabaseAdmin = await creerClientAdmin()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: profil } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single<Pick<Profil, 'role'>>()

  if (profil?.role !== 'admin') redirect('/tableau-de-bord')

  // Récupérer les utilisateurs avec leur abonnement actif
  const { data: utilisateurs } = await supabaseAdmin
    .from('profiles')
    .select(`
      *,
      abonnements(
        type, quota_total, quota_utilise, date_fin, actif
      )
    `)
    .order('created_at', { ascending: false })

  const { count: totalUtilisateurs } = await supabaseAdmin
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  const { count: abonnementsActifs } = await supabaseAdmin
    .from('abonnements')
    .select('*', { count: 'exact', head: true })
    .eq('actif', true)

  let analysesRestantes = 0
  try {
    const { data: quotaData } = await supabaseAdmin.rpc('somme_quota_restant').single()
    analysesRestantes = (quotaData as number) ?? 0
  } catch {
    analysesRestantes = 0
  }

  return (
    <div className="flex flex-col flex-1">
      <div className="flex-1 p-8">
        <TableauUtilisateurs
          utilisateurs={utilisateurs ?? []}
          stats={{
            total_utilisateurs:  totalUtilisateurs  ?? 0,
            abonnements_actifs:  abonnementsActifs  ?? 0,
            analyses_restantes:  analysesRestantes  ?? 0,
            activite_24h:        0,
          }}
        />
      </div>
      <PiedPage />
    </div>
  )
}
