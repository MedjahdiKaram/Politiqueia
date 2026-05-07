import { cn } from '@/lib/utils'
import { LIBELLES_STATUT, COULEURS_STATUT } from '@/lib/utils'
import type { StatutDiscours } from '@/types'

interface PropsBadgeStatut {
  statut: StatutDiscours
  className?: string
}

export function BadgeStatut({ statut, className }: PropsBadgeStatut) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        COULEURS_STATUT[statut],
        className
      )}
    >
      {LIBELLES_STATUT[statut]}
    </span>
  )
}

interface PropsBadge {
  children: React.ReactNode
  variante?: 'defaut' | 'succes' | 'avertissement' | 'erreur' | 'info'
  className?: string
}

const variantesBadge = {
  defaut:       'bg-zinc-100 text-zinc-700',
  succes:       'bg-green-100 text-green-700',
  avertissement:'bg-amber-100 text-amber-700',
  erreur:       'bg-red-100 text-red-700',
  info:         'bg-blue-100 text-blue-700',
}

export function Badge({ children, variante = 'defaut', className }: PropsBadge) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantesBadge[variante],
        className
      )}
    >
      {children}
    </span>
  )
}
