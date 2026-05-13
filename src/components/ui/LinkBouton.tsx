'use client'

import { useState, MouseEvent, ReactNode } from 'react'
import Link, { LinkProps } from 'next/link'
import { cn } from '@/lib/utils'
import { SpinnerBouton } from './Bouton'

type VarianteLinkBouton =
  | 'primaire'
  | 'secondaire'
  | 'contour'
  | 'fantome'
  | 'danger'

type TailleLinkBouton = 'sm' | 'md' | 'lg'

interface PropsLinkBouton extends Omit<LinkProps, 'className'> {
  variante?: VarianteLinkBouton
  taille?: TailleLinkBouton
  className?: string
  children?: ReactNode
  iconGauche?: ReactNode
  iconDroite?: ReactNode
  pleineLargeur?: boolean
}

const varianteClasses: Record<VarianteLinkBouton, string> = {
  primaire:   'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
  secondaire: 'bg-slate-100 text-slate-900 hover:bg-slate-200 active:bg-slate-300',
  contour:    'border border-slate-300 text-slate-700 hover:bg-slate-50 active:bg-slate-100',
  fantome:    'text-slate-600 hover:bg-slate-100 active:bg-slate-200',
  danger:     'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
}

const tailleClasses: Record<TailleLinkBouton, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
}

/**
 * Lien stylé comme un bouton, avec spinner au clic pendant la navigation.
 * Remplace les <Link className="...bouton..."> à travers l'app.
 */
export default function LinkBouton({
  variante = 'primaire',
  taille = 'md',
  className,
  children,
  iconGauche,
  iconDroite,
  pleineLargeur = false,
  onClick,
  ...props
}: PropsLinkBouton) {
  const [chargement, setChargement] = useState(false)

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    setChargement(true)
    if (onClick) onClick(e as unknown as MouseEvent<HTMLAnchorElement>)
    // Réinitialise si navigation annulée (back/forward)
    const reset = () => setChargement(false)
    setTimeout(reset, 4000) // sécurité
  }

  return (
    <Link
      {...props}
      onClick={handleClick}
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium',
        'transition-all duration-150 focus-visible:outline-none',
        'focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2',
        varianteClasses[variante],
        tailleClasses[taille],
        pleineLargeur && 'w-full',
        chargement && 'opacity-80 pointer-events-none',
        className
      )}
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
    </Link>
  )
}
