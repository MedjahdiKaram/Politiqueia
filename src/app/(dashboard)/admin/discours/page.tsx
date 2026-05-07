import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { creerClientServeur, creerClientAdmin } from '@/lib/supabase/server'
import TableauAdminDiscours from '@/components/admin/TableauAdminDiscours'
import PiedPage from '@/components/layout/PiedPage'
import type { Profil, DiscoursAvecProfil } from '@/types'

export const metadata: Metadata = { title: 'Administration des discours' }

export default async function PageAdminDiscours() {
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

  const { data: discours } = await supabaseAdmin
    .from('discours')
    .select(`
      *,
      profil:profiles!discours_user_id_fkey(nom, prenom, fonction)
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  // Stats
  const { count: totalDiscours } = await supabaseAdmin
    .from('discours')
    .select('*', { count: 'exact', head: true })

  const { count: totalAnalyses } = await supabaseAdmin
    .from('discours')
    .select('*', { count: 'exact', head: true })
    .eq('statut', 'analyse')

  return (
    <div className="flex flex-col flex-1">
      <div className="flex-1 p-8">
        <TableauAdminDiscours
          discours={(discours ?? []) as DiscoursAvecProfil[]}
          totalDiscours={totalDiscours ?? 0}
          totalAnalyses={totalAnalyses ?? 0}
        />
      </div>
      <PiedPage />
    </div>
  )
}
