'use client'

import { useRouter } from 'next/navigation'
import BarreNavigation from '@/components/layout/BarreNavigation'
import { creerClientSupabase } from '@/lib/supabase/client'
import type { Profil } from '@/types'

export default function ClientDeconnexion({ profil }: { profil: Profil }) {
  const router = useRouter()

  async function seDeconnecter() {
    const supabase = creerClientSupabase()
    await supabase.auth.signOut()
    router.push('/connexion')
    router.refresh()
  }

  return <BarreNavigation profil={profil} surDeconnexion={seDeconnecter} />
}
