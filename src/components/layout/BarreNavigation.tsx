'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { Profil } from '@/types'
import {
  LayoutDashboard,
  FilePlus,
  FileText,
  Users,
  Settings,
  CreditCard,
  HelpCircle,
  LogOut,
} from 'lucide-react'

interface LienNavigation {
  href: string
  libelle: string
  icon: React.ComponentType<{ className?: string }>
  roleRequis?: 'admin' | 'client'
}

const LIENS_NAVIGATION: LienNavigation[] = [
  { href: '/tableau-de-bord', libelle: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/discours/nouveau',libelle: 'Nouvelle analyse', icon: FilePlus },
  { href: '/discours',        libelle: 'Mes discours',     icon: FileText },
  { href: '/admin/utilisateurs', libelle: 'Utilisateurs',  icon: Users,    roleRequis: 'admin' },
  { href: '/admin/configuration',libelle: 'Configuration IA', icon: Settings, roleRequis: 'admin' },
  { href: '/abonnement',      libelle: 'Abonnement',       icon: CreditCard, roleRequis: 'client' },
]

interface PropsBarreNavigation {
  profil: Profil
  surDeconnexion: () => void
}

export default function BarreNavigation({ profil, surDeconnexion }: PropsBarreNavigation) {
  const chemin = usePathname()

  const liensVisibles = LIENS_NAVIGATION.filter(
    (l) => !l.roleRequis || l.roleRequis === profil.role
  )

  return (
    <aside className="flex h-screen w-56 flex-col bg-zinc-950 text-zinc-100 fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="flex flex-col px-5 py-6 border-b border-zinc-800">
        <Link href="/tableau-de-bord" className="text-lg font-bold text-white tracking-tight">
          Politiqueia
        </Link>
        {profil.fonction && (
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">
            {profil.fonction}
          </span>
        )}
      </div>

      {/* Navigation principale */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {liensVisibles.map((lien) => {
          const Icon = lien.icon
          const estActif =
            chemin === lien.href ||
            (lien.href !== '/tableau-de-bord' && chemin.startsWith(lien.href))

          return (
            <Link
              key={lien.href}
              href={lien.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                estActif
                  ? 'bg-zinc-800 text-white font-medium'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {lien.libelle}
            </Link>
          )
        })}
      </nav>

      {/* Bas de la barre */}
      <div className="px-3 pb-4 space-y-0.5 border-t border-zinc-800 pt-3">
        <Link
          href="/aide"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100 transition-colors"
        >
          <HelpCircle className="h-4 w-4 shrink-0" />
          Aide
        </Link>
        <button
          onClick={surDeconnexion}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100 transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Déconnexion
        </button>
      </div>

      {/* Bouton Nouveau Discours */}
      <div className="px-3 pb-4">
        <Link
          href="/discours/nouveau"
          className="flex items-center justify-center gap-2 w-full rounded-lg bg-zinc-800 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
        >
          <FilePlus className="h-4 w-4" />
          Nouveau Discours
        </Link>
      </div>
    </aside>
  )
}
