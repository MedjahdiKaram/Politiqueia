'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Sparkles, ArrowRight, Zap } from 'lucide-react'
import Bouton from '@/components/ui/Bouton'
import { formaterPrix } from '@/lib/utils'
import type { ConfigurationPlateforme } from '@/types'

interface PropsChoixPack {
  config: ConfigurationPlateforme | null
  raison: 'nouveau' | 'expire' | 'quota_epuise'
}

type TypePack = 'simple' | 'premium'

const MESSAGES_RAISON: Record<PropsChoixPack['raison'], { titre: string; description: string }> = {
  nouveau: {
    titre: 'Bienvenue sur Politiqueia !',
    description: 'Choisissez un forfait pour commencer à analyser vos discours politiques.',
  },
  expire: {
    titre: 'Votre abonnement a expiré',
    description: 'Renouvelez votre forfait pour continuer à soumettre et analyser vos discours.',
  },
  quota_epuise: {
    titre: 'Quota d\'analyses épuisé',
    description: 'Vous avez utilisé tous vos crédits d\'analyse. Souscrivez à un nouveau forfait pour continuer.',
  },
}

export default function ChoixPack({ config, raison }: PropsChoixPack) {
  const router  = useRouter()
  const [selectionne, setSelectionne] = useState<TypePack | null>(null)
  const [chargement, setChargement]   = useState(false)
  const [erreur, setErreur]           = useState<string | null>(null)

  const prixSimple   = config?.prix_pack_simple        ?? 2000
  const prixPremium  = config?.prix_pack_premium        ?? 7000
  const quotaSimple  = config?.quota_pack_simple        ?? 3
  const quotaPremium = config?.quota_pack_premium       ?? 20
  const dureeSimple  = config?.duree_pack_simple_mois   ?? 1
  const dureePremium = config?.duree_pack_premium_mois  ?? 3

  const message = MESSAGES_RAISON[raison]

  const packs = [
    {
      type: 'simple' as TypePack,
      titre: 'Pack Simple',
      prix: prixSimple,
      quota: quotaSimple,
      duree: dureeSimple,
      features: [
        `${quotaSimple} discours analysés`,
        'Analyse IA complète',
        'Score de persuasion et de clarté',
        'Points forts et axes d\'amélioration',
        'Support par email',
      ],
      inclutReformulation: false,
      premium: false,
    },
    {
      type: 'premium' as TypePack,
      titre: 'Pack Premium',
      prix: prixPremium,
      quota: quotaPremium,
      duree: dureePremium,
      features: [
        `${quotaPremium} discours analysés`,
        'Analyse IA approfondie',
        'Score de persuasion et de clarté',
        'Points forts et axes d\'amélioration',
        'Reformulation IA incluse',
        'Variante réseaux sociaux',
        'Support prioritaire',
      ],
      inclutReformulation: true,
      premium: true,
    },
  ]

  async function souscrire() {
    if (!selectionne) {
      setErreur('Veuillez sélectionner un forfait.')
      return
    }

    setErreur(null)
    setChargement(true)

    try {
      const reponse = await fetch('/api/abonnements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: selectionne }),
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
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center px-4 py-12">
      {/* En-tête */}
      <div className="mb-10 text-center max-w-xl">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900">
          <Zap className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-zinc-900">{message.titre}</h1>
        <p className="mt-3 text-zinc-500">{message.description}</p>
      </div>

      {erreur && (
        <div className="mb-6 w-full max-w-2xl rounded-lg bg-red-50 border border-red-200 px-4 py-3">
          <p className="text-sm text-red-600 text-center">{erreur}</p>
        </div>
      )}

      {/* Cartes des packs */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 w-full max-w-2xl">
        {packs.map((pack) => {
          const estSelectionne = selectionne === pack.type
          return (
            <button
              key={pack.type}
              type="button"
              onClick={() => setSelectionne(pack.type)}
              className={`
                relative text-left rounded-2xl border-2 p-7 transition-all cursor-pointer
                ${pack.premium
                  ? estSelectionne
                    ? 'border-zinc-900 bg-zinc-950 text-white ring-4 ring-zinc-900/20'
                    : 'border-zinc-700 bg-zinc-950 text-white hover:border-zinc-900'
                  : estSelectionne
                    ? 'border-zinc-900 bg-white ring-4 ring-zinc-900/10'
                    : 'border-zinc-200 bg-white hover:border-zinc-400'
                }
              `}
            >
              {/* Badge recommandé */}
              {pack.premium && (
                <div className="absolute -top-3 right-5 flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-zinc-900 shadow border border-zinc-200">
                  <Sparkles className="h-3 w-3" />
                  Recommandé
                </div>
              )}

              {/* Indicateur de sélection */}
              {estSelectionne && (
                <div className={`absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full ${pack.premium ? 'bg-white' : 'bg-zinc-900'}`}>
                  <CheckCircle className={`h-5 w-5 ${pack.premium ? 'text-zinc-900' : 'text-white'}`} />
                </div>
              )}

              <p className={`text-xs font-semibold uppercase tracking-wider ${pack.premium ? 'text-zinc-400' : 'text-zinc-500'}`}>
                {pack.titre}
              </p>
              <p className={`mt-2 text-4xl font-bold ${pack.premium ? 'text-white' : 'text-zinc-900'}`}>
                {formaterPrix(pack.prix)}
              </p>
              <p className={`mt-1 text-sm ${pack.premium ? 'text-zinc-400' : 'text-zinc-400'}`}>
                Paiement unique · {pack.duree} mois d&apos;accès
              </p>

              <div className={`my-5 border-t ${pack.premium ? 'border-zinc-800' : 'border-zinc-100'}`} />

              <ul className="space-y-2.5">
                {pack.features.map((f) => (
                  <li key={f} className={`flex items-start gap-2 text-sm ${pack.premium ? 'text-zinc-300' : 'text-zinc-600'}`}>
                    <CheckCircle className={`h-4 w-4 shrink-0 mt-0.5 ${pack.premium ? 'text-zinc-500' : 'text-zinc-400'}`} />
                    {f}
                  </li>
                ))}
                {!pack.inclutReformulation && (
                  <li className={`flex items-start gap-2 text-sm ${pack.premium ? 'text-zinc-600' : 'text-zinc-300'}`}>
                    <CheckCircle className="h-4 w-4 shrink-0 mt-0.5 opacity-40" />
                    Reformulation IA non incluse
                  </li>
                )}
              </ul>
            </button>
          )
        })}
      </div>

      {/* Bouton de confirmation */}
      <div className="mt-8 w-full max-w-2xl">
        <Bouton
          variante="primaire"
          pleineLargeur
          taille="lg"
          onClick={souscrire}
          chargement={chargement}
          iconDroite={!chargement ? <ArrowRight className="h-4 w-4" /> : undefined}
          className={!selectionne ? 'opacity-50 cursor-not-allowed' : ''}
        >
          {selectionne
            ? `Activer le ${selectionne === 'premium' ? 'Pack Premium' : 'Pack Simple'}`
            : 'Sélectionnez un forfait'}
        </Bouton>
        <p className="mt-3 text-center text-xs text-zinc-400">
          L&apos;abonnement est activé instantanément. Les précédents abonnements seront désactivés.
        </p>
      </div>
    </div>
  )
}
