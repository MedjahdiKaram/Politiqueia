'use client'

import { forwardRef, ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

type VarianteBouton = 'primaire' | 'secondaire' | 'contour' | 'fantome' | 'danger'
type TailleBouton = 'sm' | 'md' | 'lg'

interface PropsBouton extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: VarianteBouton
  taille?: TailleBouton
  chargement?: boolean
  iconGauche?: React.ReactNode
  iconDroite?: React.ReactNode
  pleineLargeur?: boolean
}

const varianteClasses: Record<VarianteBouton, string> = {
  primaire:   'bg-zinc-900 text-white hover:bg-zinc-700 active:bg-zinc-800',
  secondaire: 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 active:bg-zinc-300',
  contour:    'border border-zinc-300 text-zinc-700 hover:bg-zinc-50 active:bg-zinc-100',
  fantome:    'text-zinc-600 hover:bg-zinc-100 active:bg-zinc-200',
  danger:     'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
}

const tailleClasses: Record<TailleBouton, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
}

const Bouton = forwardRef<HTMLButtonElement, PropsBouton>(
  (
    {
      variante = 'primaire',
      taille = 'md',
      chargement = false,
      iconGauche,
      iconDroite,
      pleineLargeur = false,
      className,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || chargement}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium',
          'transition-colors duration-150 focus-visible:outline-none',
          'focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          varianteClasses[variante],
          tailleClasses[taille],
          pleineLargeur && 'w-full',
          className
        )}
        {...props}
      >
        {chargement ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : iconGauche ? (
          <span className="shrink-0">{iconGauche}</span>
        ) : null}
        {children}
        {!chargement && iconDroite && (
          <span className="shrink-0">{iconDroite}</span>
        )}
      </button>
    )
  }
)

Bouton.displayName = 'Bouton'

export default Bouton
