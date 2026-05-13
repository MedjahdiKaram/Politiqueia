'use client'

import { forwardRef, ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

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
  primaire:   'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
  secondaire: 'bg-slate-100 text-slate-900 hover:bg-slate-200 active:bg-slate-300',
  contour:    'border border-slate-300 text-slate-700 hover:bg-slate-50 active:bg-slate-100',
  fantome:    'text-slate-600 hover:bg-slate-100 active:bg-slate-200',
  danger:     'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
}

const tailleClasses: Record<TailleBouton, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
}

/** Spinner élégant : anneau pulsé + arc rotatif */
function SpinnerBouton({ classe }: { classe?: string }) {
  return (
    <span className={cn('relative inline-flex h-4 w-4 shrink-0', classe)}>
      {/* Anneau de fond */}
      <span className="absolute inset-0 rounded-full border-2 border-current opacity-20" />
      {/* Arc rotatif */}
      <span
        className="absolute inset-0 rounded-full border-2 border-transparent border-t-current animate-spin"
        style={{ animationDuration: '0.65s' }}
      />
      {/* Point central pulsé */}
      <span className="absolute inset-[5px] rounded-full bg-current animate-ping opacity-60" />
    </span>
  )
}

export { SpinnerBouton }

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
          'transition-all duration-150 focus-visible:outline-none',
          'focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2',
          'disabled:opacity-60 disabled:cursor-not-allowed',
          varianteClasses[variante],
          tailleClasses[taille],
          pleineLargeur && 'w-full',
          className
        )}
        {...props}
      >
        {chargement ? (
          <SpinnerBouton />
        ) : iconGauche ? (
          <span className="shrink-0">{iconGauche}</span>
        ) : null}
        <span className={cn('transition-opacity', chargement && 'opacity-60')}>
          {children}
        </span>
        {!chargement && iconDroite && (
          <span className="shrink-0">{iconDroite}</span>
        )}
      </button>
    )
  }
)

Bouton.displayName = 'Bouton'

export default Bouton
