'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RotateCcw, FileText, Sparkles } from 'lucide-react'
import type { Discours } from '@/types'
import BarreProgression from '@/components/ui/BarreProgression'
import Bouton from '@/components/ui/Bouton'
import { formaterDateHeure } from '@/lib/utils'

interface PropsPanneau {
  discours: Discours
  aReformulation: boolean
}

type Onglet = 'evaluation' | 'reformulation'

export default function PanneauEvaluation({ discours, aReformulation }: PropsPanneau) {
  const router = useRouter()
  const [onglet, setOnglet]     = useState<Onglet>('evaluation')
  const [relance, setRelance]   = useState(false)

  async function relancerEvaluation() {
    if (!confirm('Voulez-vous relancer l\'évaluation IA pour ce discours ?')) return
    setRelance(true)
    try {
      await fetch(`/api/discours/${discours.id}/evaluer`, { method: 'POST' })
      router.refresh()
    } finally {
      setRelance(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* En-tête */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="text-xs text-zinc-400 uppercase tracking-widest">
              Contenu du discours
            </span>
            <span className="text-zinc-300">/</span>
            <span className="text-xs font-semibold text-zinc-900 uppercase tracking-widest">
              Évaluation du discours
            </span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900">{discours.nom}</h1>
          {discours.soumis_at && (
            <p className="mt-1 text-xs text-zinc-400">
              Analysé le {formaterDateHeure(discours.soumis_at)}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Bouton
            variante="contour"
            taille="sm"
            onClick={relancerEvaluation}
            chargement={relance}
            iconGauche={<RotateCcw className="h-3.5 w-3.5" />}
          >
            Régénérer
          </Bouton>
        </div>
      </div>

      {/* Scores */}
      {(discours.score_persuasion !== null || discours.score_clarte !== null) && (
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <p className="text-xs text-zinc-500 mb-2">Score de Persuasion</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-zinc-900">
                {discours.score_persuasion ?? '–'}
              </span>
              <span className="text-sm text-zinc-400 mb-0.5">/100</span>
            </div>
            <BarreProgression
              valeur={discours.score_persuasion ?? 0}
              className="mt-2"
              couleur={
                (discours.score_persuasion ?? 0) >= 70 ? 'vert' :
                (discours.score_persuasion ?? 0) >= 40 ? 'ambre' : 'rouge'
              }
            />
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <p className="text-xs text-zinc-500 mb-2">Indice de Clarté</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-zinc-900">
                {discours.score_clarte ?? '–'}
              </span>
              <span className="text-sm text-zinc-400 mb-0.5">/100</span>
            </div>
            <BarreProgression
              valeur={discours.score_clarte ?? 0}
              className="mt-2"
              couleur={
                (discours.score_clarte ?? 0) >= 70 ? 'vert' :
                (discours.score_clarte ?? 0) >= 40 ? 'ambre' : 'rouge'
              }
            />
          </div>
        </div>
      )}

      {/* Contenu en deux colonnes */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Évaluation */}
        <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
          <div className="flex items-center gap-2 border-b border-zinc-100 px-5 py-3">
            <FileText className="h-4 w-4 text-zinc-400" />
            <h2 className="text-sm font-semibold text-zinc-900">
              Analyse de la Clarté et de l&apos;Impact
            </h2>
          </div>
          <div className="p-5">
            {discours.evaluation ? (
              <div
                className="evaluation-ia"
                dangerouslySetInnerHTML={{ __html: discours.evaluation }}
              />
            ) : (
              <p className="text-sm text-zinc-400 italic">
                L&apos;évaluation n&apos;est pas encore disponible.
              </p>
            )}
          </div>
        </div>

        {/* Reformulation */}
        <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
          <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-zinc-400" />
              <h2 className="text-sm font-semibold text-zinc-900">Reformulation IA</h2>
            </div>
            {!aReformulation && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700 font-medium">
                Premium
              </span>
            )}
          </div>
          <div className="p-5">
            {!aReformulation ? (
              <div className="flex flex-col items-center py-8 text-center">
                <Sparkles className="h-8 w-8 text-zinc-300 mb-3" />
                <p className="text-sm font-medium text-zinc-700">
                  Reformulation disponible en Pack Premium
                </p>
                <p className="mt-1 text-xs text-zinc-400">
                  Mettez à niveau votre abonnement pour accéder aux reformulations.
                </p>
                <a
                  href="/abonnement"
                  className="mt-4 rounded-lg bg-zinc-900 px-4 py-2 text-xs font-medium text-white hover:bg-zinc-700"
                >
                  Passer au Premium
                </a>
              </div>
            ) : discours.reformulation ? (
              <div
                className="reformulation-ia"
                dangerouslySetInnerHTML={{ __html: discours.reformulation }}
              />
            ) : (
              <p className="text-sm text-zinc-400 italic">
                La reformulation n&apos;est pas encore disponible.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
