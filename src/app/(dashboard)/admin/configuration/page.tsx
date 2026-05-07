import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { creerClientServeur, creerClientAdmin } from '@/lib/supabase/server'
import FormulaireConfiguration from '@/components/admin/FormulaireConfiguration'
import PiedPage from '@/components/layout/PiedPage'
import type { Profil, ConfigurationPlateforme } from '@/types'

export const metadata: Metadata = { title: 'Configuration de l\'IA' }

export default async function PageConfiguration() {
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

  const { data: config } = await supabaseAdmin
    .from('configuration_plateforme')
    .select('*')
    .single<ConfigurationPlateforme>()

  return (
    <div className="flex flex-col flex-1">
      <div className="flex-1 p-8">
        <FormulaireConfiguration config={config} />
      </div>
      <PiedPage />
    </div>
  )
}
