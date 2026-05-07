'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Send, Bold, Italic, List, Quote, Undo, Redo, RotateCcw } from 'lucide-react'
import Bouton from '@/components/ui/Bouton'
import { compterCaracteres } from '@/lib/utils'
import type { Discours } from '@/types'

interface PropsEditeur {
  mode: 'creation' | 'edition' | 'lecture'
  discours?: Discours
}

export default function EditeurDiscours({ mode, discours }: PropsEditeur) {
  const router = useRouter()
  const [nom, setNom]             = useState(discours?.nom ?? '')
  const [contenu, setContenu]     = useState(discours?.contenu ?? '')
  const [sauvegarde, setSauvegarde] = useState(false)
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur]         = useState<string | null>(null)
  const editeurRef = useRef<HTMLDivElement>(null)

  const nbCaracteres = compterCaracteres(contenu)
  const estLecture   = mode === 'lecture'

  // Initialise le contenu HTML une seule fois au montage (évite le reset du curseur)
  useEffect(() => {
    if (editeurRef.current) {
      editeurRef.current.innerHTML = discours?.contenu ?? ''
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Commandes de formatage
  function formater(commande: string, valeur?: string) {
    document.execCommand(commande, false, valeur)
    if (editeurRef.current) {
      setContenu(editeurRef.current.innerHTML)
    }
  }

  const mettreAJourContenu = useCallback(() => {
    if (editeurRef.current) {
      setContenu(editeurRef.current.innerHTML)
    }
  }, [])

  async function sauvegarder() {
    if (!nom.trim()) {
      setErreur('Veuillez donner un nom à votre discours.')
      return
    }
    if (nbCaracteres < 10) {
      setErreur('Le contenu du discours est trop court.')
      return
    }

    setErreur(null)
    setChargement(true)

    try {
      const url    = mode === 'creation' ? '/api/discours' : `/api/discours/${discours!.id}`
      const method = mode === 'creation' ? 'POST' : 'PATCH'

      const reponse = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nom, contenu }),
      })

      if (!reponse.ok) {
        const donnees = await reponse.json()
        throw new Error(donnees.erreur ?? 'Erreur lors de la sauvegarde')
      }

      const donnees = await reponse.json()
      setSauvegarde(true)
      setTimeout(() => setSauvegarde(false), 3000)

      if (mode === 'creation') {
        router.push(`/discours/${donnees.data.id}`)
      } else {
        router.refresh()
      }
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : 'Erreur lors de la sauvegarde.')
    } finally {
      setChargement(false)
    }
  }

  async function demanderEvaluation() {
    if (!discours?.id) {
      await sauvegarder()
      return
    }

    if (!confirm('Voulez-vous soumettre ce discours pour évaluation ? Il ne pourra plus être modifié.')) {
      return
    }

    setErreur(null)
    setChargement(true)

    try {
      const reponse = await fetch(`/api/discours/${discours.id}/evaluer`, {
        method: 'POST',
      })

      if (!reponse.ok) {
        const donnees = await reponse.json()
        throw new Error(donnees.erreur ?? "Erreur lors de la soumission")
      }

      router.refresh()
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : 'Erreur lors de la soumission.')
    } finally {
      setChargement(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* En-tête */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">
            {mode === 'creation' ? 'Nouveau discours' : 'Éditeur'}
          </h1>
          <div className="mt-1 flex items-center gap-3 text-xs text-zinc-400">
            {discours && (
              <>
                <span>ID : #{discours.id.slice(0, 8)}</span>
                <span>·</span>
              </>
            )}
            <span className={nbCaracteres > 10000 ? 'text-red-500' : ''}>
              {nbCaracteres.toLocaleString('fr-FR')} caractères
            </span>
            {sauvegarde && (
              <>
                <span>·</span>
                <span className="text-green-600">✓ Sauvegardé</span>
              </>
            )}
          </div>
        </div>

        {!estLecture && (
          <div className="flex items-center gap-3">
            <Bouton
              variante="contour"
              taille="sm"
              onClick={sauvegarder}
              chargement={chargement}
              iconGauche={<Save className="h-3.5 w-3.5" />}
            >
              Sauvegarder
            </Bouton>
            {discours && discours.statut === 'brouillon' && (
              <Bouton
                variante="primaire"
                taille="sm"
                onClick={demanderEvaluation}
                chargement={chargement}
                iconGauche={<Send className="h-3.5 w-3.5" />}
              >
                Demander l&apos;évaluation
              </Bouton>
            )}
          </div>
        )}
      </div>

      {erreur && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
          <p className="text-sm text-red-600">{erreur}</p>
        </div>
      )}

      {/* Nom du discours */}
      <div className="mb-4">
        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
          Nom du discours
        </label>
        {estLecture ? (
          <p className="text-xl font-bold text-zinc-900">{nom}</p>
        ) : (
          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder="Ex. : Discours d'investiture – Janvier 2024"
            className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-lg font-semibold text-zinc-900 placeholder-zinc-300 focus:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-100"
          />
        )}
      </div>

      {/* Éditeur WYSIWYG */}
      <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
        {!estLecture && (
          <div className="flex items-center gap-1 border-b border-zinc-200 p-2 bg-zinc-50">
            <button
              type="button"
              onClick={() => formater('bold')}
              className="rounded p-1.5 text-zinc-600 hover:bg-zinc-200 transition-colors"
              title="Gras"
            >
              <Bold className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => formater('italic')}
              className="rounded p-1.5 text-zinc-600 hover:bg-zinc-200 transition-colors"
              title="Italique"
            >
              <Italic className="h-4 w-4" />
            </button>
            <div className="w-px h-4 bg-zinc-300 mx-1" />
            <button
              type="button"
              onClick={() => formater('insertUnorderedList')}
              className="rounded p-1.5 text-zinc-600 hover:bg-zinc-200 transition-colors"
              title="Liste"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => formater('formatBlock', 'blockquote')}
              className="rounded p-1.5 text-zinc-600 hover:bg-zinc-200 transition-colors"
              title="Citation"
            >
              <Quote className="h-4 w-4" />
            </button>
            <div className="w-px h-4 bg-zinc-300 mx-1" />
            <button
              type="button"
              onClick={() => formater('undo')}
              className="rounded p-1.5 text-zinc-600 hover:bg-zinc-200 transition-colors"
              title="Annuler"
            >
              <Undo className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => formater('redo')}
              className="rounded p-1.5 text-zinc-600 hover:bg-zinc-200 transition-colors"
              title="Rétablir"
            >
              <Redo className="h-4 w-4" />
            </button>
          </div>
        )}

        <div
          ref={editeurRef}
          contentEditable={!estLecture}
          suppressContentEditableWarning
          onInput={mettreAJourContenu}
          className={`
            min-h-[320px] p-5 text-sm text-zinc-800 leading-relaxed
            focus:outline-none
            [&_p]:mb-3 [&_ul]:pl-5 [&_ul]:space-y-1 [&_blockquote]:border-l-4
            [&_blockquote]:border-zinc-300 [&_blockquote]:pl-4 [&_blockquote]:italic
            [&_blockquote]:text-zinc-600 [&_strong]:font-semibold
            ${estLecture ? 'cursor-default' : ''}
          `}
          data-placeholder="Saisissez votre discours ici..."
        />
      </div>

      {/* Compteur */}
      <div className="mt-2 flex justify-end">
        <span className={`text-xs ${nbCaracteres > 10000 ? 'text-red-500' : 'text-zinc-400'}`}>
          Mots : {contenu.split(/\s+/).filter(Boolean).length} · Caractères : {nbCaracteres.toLocaleString('fr-FR')}
        </span>
      </div>
    </div>
  )
}
