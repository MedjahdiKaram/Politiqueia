'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RotateCcw, MoreVertical, Archive, Trash2 } from 'lucide-react'
import { BadgeStatut } from '@/components/ui/Badge'
import { Carte } from '@/components/ui/Carte'
import Bouton from '@/components/ui/Bouton'
import { formaterDateCourte } from '@/lib/utils'
import type { DiscoursAvecProfil } from '@/types'

interface PropsTableau {
  discours: DiscoursAvecProfil[]
  totalDiscours: number
  totalAnalyses: number
}

export default function TableauAdminDiscours({
  discours,
  totalDiscours,
  totalAnalyses,
}: PropsTableau) {
  const router = useRouter()
  const [selectionnes, setSelectionnes] = useState<string[]>([])
  const [relance, setRelance]           = useState<string | null>(null)
  const [menuOuvert, setMenuOuvert]     = useState<string | null>(null)

  function toggleSelection(id: string) {
    setSelectionnes((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  function toutSelectionner() {
    setSelectionnes(
      selectionnes.length === discours.length ? [] : discours.map((d) => d.id)
    )
  }

  async function relancerEvaluation(id: string) {
    setRelance(id)
    try {
      await fetch(`/api/discours/${id}/evaluer`, { method: 'POST' })
      router.refresh()
    } finally {
      setRelance(null)
    }
  }

  return (
    <div>
      {/* En-tête */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Administration des discours</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Gestion globale des analyses et contenus clients.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Bouton variante="contour" taille="sm" iconGauche={<Archive className="h-3.5 w-3.5" />}>
            Archiver la sélection
          </Bouton>
          <Bouton variante="danger" taille="sm" iconGauche={<Trash2 className="h-3.5 w-3.5" />}>
            Supprimer
          </Bouton>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 max-w-xs">
        <Carte>
          <p className="text-xs text-zinc-500 uppercase tracking-wider">Total analyses</p>
          <p className="mt-1 text-3xl font-bold text-zinc-900">
            {totalDiscours.toLocaleString('fr-FR')}
          </p>
        </Carte>
        <Carte>
          <p className="text-xs text-zinc-500 uppercase tracking-wider">Analysées</p>
          <p className="mt-1 text-3xl font-bold text-zinc-900">
            {totalAnalyses.toLocaleString('fr-FR')}
          </p>
        </Carte>
      </div>

      {/* Tableau */}
      <Carte rembourrement={false}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectionnes.length === discours.length && discours.length > 0}
                    onChange={toutSelectionner}
                    className="rounded border-zinc-300"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Titre du discours
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Nom du client
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Statut
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Clarté
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {discours.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-zinc-400">
                    Aucun discours trouvé.
                  </td>
                </tr>
              ) : (
                discours.map((d) => (
                  <tr key={d.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectionnes.includes(d.id)}
                        onChange={() => toggleSelection(d.id)}
                        className="rounded border-zinc-300"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-zinc-900">{d.nom}</p>
                        <p className="text-xs text-zinc-400">ID : #{d.id.slice(0, 8)}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-700">
                      {d.profil
                        ? `${d.profil.prenom} ${d.profil.nom}`
                        : '–'}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-500">
                      {formaterDateCourte(d.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <BadgeStatut statut={d.statut} />
                    </td>
                    <td className="px-4 py-3">
                      {d.score_clarte !== null ? (
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-zinc-100">
                            <div
                              className="h-full rounded-full bg-zinc-800"
                              style={{ width: `${d.score_clarte}%` }}
                            />
                          </div>
                          <span className="text-xs text-zinc-500">{d.score_clarte}%</span>
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-400">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {d.statut === 'soumis' && (
                          <button
                            onClick={() => relancerEvaluation(d.id)}
                            disabled={relance === d.id}
                            className="rounded p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors disabled:opacity-40"
                            title="Relancer l'évaluation IA"
                          >
                            <RotateCcw className={`h-4 w-4 ${relance === d.id ? 'animate-spin' : ''}`} />
                          </button>
                        )}
                        <button
                          onClick={() => setMenuOuvert(menuOuvert === d.id ? null : d.id)}
                          className="rounded p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination info */}
        {discours.length > 0 && (
          <div className="px-4 py-3 border-t border-zinc-100">
            <p className="text-xs text-zinc-400">
              Affichage 1 à {discours.length} sur {discours.length} discours
            </p>
          </div>
        )}
      </Carte>
    </div>
  )
}
