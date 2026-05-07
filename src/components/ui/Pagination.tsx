'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PropsPagination {
  page: number
  nbPages: number
  total: number
  limite: number
  surChangement: (page: number) => void
}

export default function Pagination({
  page,
  nbPages,
  total,
  limite,
  surChangement,
}: PropsPagination) {
  if (nbPages <= 1) return null

  const debut = (page - 1) * limite + 1
  const fin = Math.min(page * limite, total)

  const pages: (number | '...')[] = []
  for (let i = 1; i <= nbPages; i++) {
    if (i === 1 || i === nbPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...')
    }
  }

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-zinc-500">
        Affichage {debut} à {fin} sur {total} discours
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => surChangement(page - 1)}
          disabled={page === 1}
          className="rounded p-1.5 text-zinc-500 hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Page précédente"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-zinc-400">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => surChangement(p as number)}
              className={cn(
                'h-8 w-8 rounded text-sm font-medium transition-colors',
                p === page
                  ? 'bg-zinc-900 text-white'
                  : 'text-zinc-600 hover:bg-zinc-100'
              )}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => surChangement(page + 1)}
          disabled={page === nbPages}
          className="rounded p-1.5 text-zinc-500 hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Page suivante"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
