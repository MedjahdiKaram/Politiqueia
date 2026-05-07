'use client'

import { forwardRef, InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface PropsChampSaisie extends InputHTMLAttributes<HTMLInputElement> {
  libelle?: string
  erreur?: string
  description?: string
  iconGauche?: React.ReactNode
  iconDroite?: React.ReactNode
}

const ChampSaisie = forwardRef<HTMLInputElement, PropsChampSaisie>(
  ({ libelle, erreur, description, iconGauche, iconDroite, className, id, ...props }, ref) => {
    const champId = id || libelle?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {libelle && (
          <label
            htmlFor={champId}
            className="text-sm font-medium text-zinc-700"
          >
            {libelle}
            {props.required && <span className="ml-1 text-red-500">*</span>}
          </label>
        )}
        <div className="relative">
          {iconGauche && (
            <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-400">
              {iconGauche}
            </div>
          )}
          <input
            ref={ref}
            id={champId}
            className={cn(
              'w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5',
              'text-sm text-zinc-900 placeholder-zinc-400',
              'transition-colors duration-150',
              'focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-200',
              'disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-400',
              erreur && 'border-red-400 focus:border-red-400 focus:ring-red-100',
              iconGauche && 'pl-10',
              iconDroite && 'pr-10',
              className
            )}
            {...props}
          />
          {iconDroite && (
            <div className="absolute inset-y-0 right-3 flex items-center text-zinc-400">
              {iconDroite}
            </div>
          )}
        </div>
        {description && !erreur && (
          <p className="text-xs text-zinc-500">{description}</p>
        )}
        {erreur && (
          <p className="text-xs text-red-500">{erreur}</p>
        )}
      </div>
    )
  }
)

ChampSaisie.displayName = 'ChampSaisie'

export default ChampSaisie
