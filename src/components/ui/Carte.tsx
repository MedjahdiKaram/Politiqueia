import { cn } from '@/lib/utils'

interface PropsCarte {
  children: React.ReactNode
  className?: string
  rembourrement?: boolean
}

export function Carte({ children, className, rembourrement = true }: PropsCarte) {
  return (
    <div
      className={cn(
        'rounded-xl border border-zinc-200 bg-white shadow-sm',
        rembourrement && 'p-6',
        className
      )}
    >
      {children}
    </div>
  )
}

export function CarteTitre({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <h3 className={cn('text-base font-semibold text-zinc-900', className)}>
      {children}
    </h3>
  )
}

export function CarteDescription({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <p className={cn('text-sm text-zinc-500', className)}>
      {children}
    </p>
  )
}
