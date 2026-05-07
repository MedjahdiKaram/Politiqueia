import { cn } from '@/lib/utils'

interface PropsBarreProgression {
  valeur: number
  max?: number
  className?: string
  couleur?: 'zinc' | 'vert' | 'bleu' | 'ambre' | 'rouge'
  libelle?: string
  afficherPourcentage?: boolean
}

const couleursClasses = {
  zinc:  'bg-zinc-800',
  vert:  'bg-green-500',
  bleu:  'bg-blue-500',
  ambre: 'bg-amber-500',
  rouge: 'bg-red-500',
}

export default function BarreProgression({
  valeur,
  max = 100,
  className,
  couleur = 'zinc',
  libelle,
  afficherPourcentage = false,
}: PropsBarreProgression) {
  const pourcentage = Math.min(100, Math.max(0, (valeur / max) * 100))

  return (
    <div className={cn('space-y-1', className)}>
      {(libelle || afficherPourcentage) && (
        <div className="flex justify-between text-xs text-zinc-500">
          {libelle && <span>{libelle}</span>}
          {afficherPourcentage && <span>{Math.round(pourcentage)}%</span>}
        </div>
      )}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
        <div
          className={cn('h-full rounded-full transition-all duration-300', couleursClasses[couleur])}
          style={{ width: `${pourcentage}%` }}
          role="progressbar"
          aria-valuenow={valeur}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  )
}
