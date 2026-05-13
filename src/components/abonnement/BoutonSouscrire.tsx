'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Bouton from '@/components/ui/Bouton'

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
      <Bouton
        type="button"
        onClick={souscrire}
        chargement={chargement}
        pleineLargeur
        variante={estPremium ? 'secondaire' : 'contour'}
        taille="md"
        className={estPremium ? 'font-semibold text-blue-700 hover:bg-blue-50' : ''}
      >
        Souscrire
      </Bouton>
    </div>
  )
}
