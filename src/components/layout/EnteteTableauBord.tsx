'use client'

import { Search, Bell, User } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import type { Profil } from '@/types'
import { initiales } from '@/lib/utils'

interface PropsEntete {
  profil: Profil
  titrePage?: string
}

export default function EnteteTableauBord({ profil, titrePage }: PropsEntete) {
  const [recherche, setRecherche] = useState('')

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-100 bg-white px-6">
      {/* Recherche */}
      <div className="relative max-w-xs flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="Rechercher un discours..."
          className="h-9 w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-9 pr-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:bg-white focus:outline-none"
        />
      </div>

      {/* Droite */}
      <div className="flex items-center gap-3">
        <button
          className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </button>

        <Link
          href="/profil"
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-zinc-100 transition-colors"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white">
            {initiales(profil.prenom, profil.nom)}
          </div>
          <span className="text-sm text-zinc-700 hidden md:block">
            {profil.prenom} {profil.nom}
          </span>
        </Link>
      </div>
    </header>
  )
}
