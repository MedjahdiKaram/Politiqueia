import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { creerClientServeur, creerClientAdmin } from '@/lib/supabase/server'
import { abonnementEstValide, raisonAbonnementInvalide } from '@/lib/abonnement'
import ChoixPack from '@/components/abonnement/ChoixPack'
import type { Abonnement, ConfigurationPlateforme, Profil } from '@/types'

export const metadata: Metadata = { title: 'Choisir un forfait – Politiqueia' }

export default async function PageChoisirPack() {
  const supabase      = await creerClientServeur()
  const supabaseAdmin = await creerClientAdmin()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: profil } = await supabaseAdmin
    .from('profiles')
    .select('role, actif')
    .eq('id', user.id)
    .single<Pick<Profil, 'role' | 'actif'>>()

  if (!profil?.actif) redirect('/connexion?erreur=compte-desactive')

  // Les admins ne passent pas par cette page
  if (profil?.role === 'admin') redirect('/tableau-de-bord')

  // Abonnement actif éventuel
  const { data: abonnement } = await supabaseAdmin
    .from('abonnements')
    .select('*')
    .eq('user_id', user.id)
    .eq('actif', true)
    .order('date_fin', { ascending: false })
    .limit(1)
    .single<Abonnement>()

  // Si l'abonnement est déjà valide → pas besoin de choisir
  if (abonnementEstValide(abonnement)) {
    redirect('/tableau-de-bord')
  }

  const raison = raisonAbonnementInvalide(abonnement)

  const { data: config } = await supabaseAdmin
    .from('configuration_plateforme')
    .select('*')
    .single<ConfigurationPlateforme>()

  return (
    <div className="flex-1">
      <ChoixPack config={config} raison={raison} />
    </div>
  )
}
