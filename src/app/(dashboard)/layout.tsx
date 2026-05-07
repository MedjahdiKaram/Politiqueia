import { redirect } from 'next/navigation'
import { creerClientServeur, creerClientAdmin } from '@/lib/supabase/server'
import ClientDeconnexion from './ClientDeconnexion'
import type { Profil } from '@/types'

export default async function LayoutTableauBord({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await creerClientServeur()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const supabaseAdmin = await creerClientAdmin()
  const { data: profil } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single<Profil>()

  if (!profil) redirect('/connexion')
  if (!profil.actif) redirect('/connexion?erreur=compte-desactive')

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <ClientDeconnexion profil={profil} />
      <main className="ml-56 flex-1 flex flex-col min-h-screen">
        {children}
      </main>
    </div>
  )
}
