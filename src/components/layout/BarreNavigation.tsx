'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { SpinnerBouton } from '@/components/ui/Bouton'
import type { Profil } from '@/types'
import {
  LayoutDashboard,
  FilePlus,
  FileText,
  Users,
  Settings,
  CreditCard,
  UserCircle,
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
  { href: '/tableau-de-bord',    libelle: 'Tableau de bord',   icon: LayoutDashboard },
  { href: '/discours/nouveau',   libelle: 'Nouveau corpus',     icon: FilePlus },
  { href: '/discours',           libelle: 'Mes corpus',         icon: FileText },
  { href: '/admin/utilisateurs', libelle: 'Utilisateurs',       icon: Users,      roleRequis: 'admin' },
  { href: '/admin/configuration',libelle: 'Configuration IA',   icon: Settings,   roleRequis: 'admin' },
  { href: '/abonnement',         libelle: 'Abonnement',         icon: CreditCard,  roleRequis: 'client' },
  { href: '/profil',             libelle: 'Mon profil',         icon: UserCircle },
]

interface PropsBarreNavigation {
  profil: Profil
  surDeconnexion: () => void
}

export default function BarreNavigation({ profil, surDeconnexion }: PropsBarreNavigation) {
  const chemin = usePathname()
  const [enChargement, setEnChargement] = useState<string | null>(null)

  // Efface le spinner dès que le chemin change (navigation terminée)
  useEffect(() => {
    setEnChargement(null)
  }, [chemin])

  const liensVisibles = LIENS_NAVIGATION.filter(
    (l) => !l.roleRequis || l.roleRequis === profil.role
  )

  return (
    <aside className="flex h-screen w-56 flex-col fixed left-0 top-0 z-40"
           style={{ backgroundColor: '#0d1f3c' }}>

      {/* Logo */}
      <div className="flex flex-col items-start px-4 py-5 border-b border-white/10">
        <Link href="/tableau-de-bord" className="block">
          <Image
            src="/Logo_ideoscole.png"
            alt="Idéoscope"
            width={140}
            height={40}
            className="object-contain"
            priority
          />
        </Link>
        {profil.fonction && (
          <span className="mt-1.5 text-[10px] text-blue-300/60 uppercase tracking-widest truncate w-full">
            {profil.fonction}
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {liensVisibles.map((lien) => {
          const Icon = lien.icon
          const estActif =
            chemin === lien.href ||
            (lien.href !== '/tableau-de-bord' && chemin.startsWith(lien.href))
          const estEnChargement = enChargement === lien.href && !estActif

          return (
            <Link
              key={lien.href}
              href={lien.href}
              onClick={() => {
                if (!estActif) setEnChargement(lien.href)
              }}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all',
                estActif
                  ? 'bg-blue-600/20 text-white font-medium border-l-2 border-blue-400 pl-[10px]'
                  : estEnChargement
                  ? 'bg-white/8 text-slate-200'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
              )}
            >
              {estEnChargement ? (
                <SpinnerBouton classe="text-blue-400 h-4 w-4" />
              ) : (
                <Icon className={cn('h-4 w-4 shrink-0', estActif ? 'text-blue-400' : '')} />
              )}
              <span className={cn(estEnChargement && 'opacity-70')}>{lien.libelle}</span>
              {estEnChargement && (
                <span className="ml-auto h-1 w-1 rounded-full bg-blue-400 animate-ping" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bas */}
      <div className="px-3 pb-4 space-y-0.5 border-t border-white/10 pt-3">
        <Link
          href="/aide"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-400 hover:bg-white/5 hover:text-slate-100 transition-colors"
        >
          <HelpCircle className="h-4 w-4 shrink-0" />
          Aide
        </Link>
        <button
          onClick={surDeconnexion}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-400 hover:bg-white/5 hover:text-slate-100 transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Déconnexion
        </button>
      </div>

      {/* CTA Nouveau corpus */}
      <div className="px-3 pb-5">
        <Link
          href="/discours/nouveau"
          onClick={() => {
            if (chemin !== '/discours/nouveau') setEnChargement('__cta__')
          }}
          className="flex items-center justify-center gap-2 w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          {enChargement === '__cta__' ? (
            <SpinnerBouton classe="text-white" />
          ) : (
            <FilePlus className="h-4 w-4" />
          )}
          Nouveau corpus
        </Link>
      </div>
    </aside>
  )
}
