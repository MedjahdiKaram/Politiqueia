'use client'

import { useState } from 'react'
import { FileText, Sparkles, Clock } from 'lucide-react'
import EditeurDiscours from './EditeurDiscours'
import PanneauEvaluation from './PanneauEvaluation'
import type { Discours } from '@/types'

interface PropsOnglets {
  discours: Discours
  aReformulation: boolean
}

type Onglet = 'contenu' | 'evaluation'

export default function OngletDiscours({ discours, aReformulation }: PropsOnglets) {
  // Si le discours est analysé, ouvrir directement l'onglet évaluation
  const [ongletActif, setOngletActif] = useState<Onglet>(
    discours.statut === 'analyse' ? 'evaluation' : 'contenu'
  )

  const estEditable   = discours.statut === 'brouillon'
  const estAnalyse    = discours.statut === 'analyse'
  const estEnAttente  = discours.statut === 'soumis' || discours.statut === 'en_cours'

  return (
    <div className="flex flex-col flex-1">
      {/* Barre d'onglets */}
      <div className="border-b border-zinc-200 bg-white px-8">
        <nav className="-mb-px flex gap-1">
          <button
            onClick={() => setOngletActif('contenu')}
            className={`
              inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors
              ${ongletActif === 'contenu'
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300'}
            `}
          >
            <FileText className="h-4 w-4" />
            Contenu du discours
          </button>

          <button
            onClick={() => setOngletActif('evaluation')}
            className={`
              inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors
              ${ongletActif === 'evaluation'
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300'}
            `}
          >
            <Sparkles className="h-4 w-4" />
            Évaluation IA
            {/* Badge statut */}
            {estAnalyse && (
              <span className="ml-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                Prête
              </span>
            )}
            {estEnAttente && (
              <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                En cours
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Contenu de l'onglet actif */}
      <div className="flex-1 p-8">
        {ongletActif === 'contenu' ? (
          <EditeurDiscours
            mode={estEditable ? 'edition' : 'lecture'}
            discours={discours}
          />
        ) : (
          <>
            {estAnalyse ? (
              <PanneauEvaluation discours={discours} aReformulation={aReformulation} />
            ) : (
              <EvaluationEnAttente statut={discours.statut} />
            )}
          </>
        )}
      </div>
    </div>
  )
}

function EvaluationEnAttente({ statut }: { statut: Discours['statut'] }) {
  const estEnCours = statut === 'en_cours'

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className={`mb-4 rounded-full p-4 ${estEnCours ? 'bg-amber-50' : 'bg-zinc-100'}`}>
        <Clock className={`h-8 w-8 ${estEnCours ? 'text-amber-500' : 'text-zinc-400'}`} />
      </div>
      <h2 className="text-lg font-semibold text-zinc-900">
        {estEnCours ? 'Évaluation en cours…' : 'Discours en attente d\'évaluation'}
      </h2>
      <p className="mt-2 max-w-sm text-sm text-zinc-500">
        {estEnCours
          ? 'L\'analyse IA est en cours de traitement. Rechargez la page dans quelques instants.'
          : 'Votre discours a été soumis. L\'analyse sera disponible sous peu.'}
      </p>
      {estEnCours && (
        <div className="mt-6 flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-2 w-2 rounded-full bg-amber-400 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
