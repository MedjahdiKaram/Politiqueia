'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface PropsBoutonSouscrire {
  typePack: 'simple' | 'premium'
  estPremium?: boolean
}

export default function BoutonSouscrire({ typePack, estPremium = false }: PropsBoutonSouscrire) {
  const router = useRouter()
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState<string | null>(null)

  async function souscrire() {
    setErreur(null)
    setChargement(true)

    try {
      const reponse = await fetch('/api/abonnements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: typePack }),
      })

      if (!reponse.ok) {
        const donnees = await reponse.json()
        throw new Error(donnees.erreur ?? 'Erreur lors de la souscription.')
      }

      router.push('/tableau-de-bord')
      router.refresh()
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : 'Erreur inattendue.')
      setChargement(false)
    }
  }

  return (
    <div className="mt-5">
      {erreur && (
        <p className={`mb-2 text-xs text-center ${estPremium ? 'text-red-300' : 'text-red-500'}`}>
          {erreur}
        </p>
      )}
      <button
        type="button"
        onClick={souscrire}
        disabled={chargement}
        className={`flex w-full items-center justify-center rounded-lg py-2.5 text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
          estPremium
            ? 'bg-white text-zinc-900 hover:bg-zinc-100'
            : 'border border-zinc-200 text-zinc-900 hover:bg-zinc-50'
        }`}
      >
        {chargement ? 'Activation…' : 'Souscrire'}
      </button>
    </div>
  )
}
