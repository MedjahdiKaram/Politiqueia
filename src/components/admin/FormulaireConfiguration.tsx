'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Cpu, Save } from 'lucide-react'
import { Carte } from '@/components/ui/Carte'
import Bouton from '@/components/ui/Bouton'
import ChampSaisie from '@/components/ui/ChampSaisie'
import type { ConfigurationPlateforme } from '@/types'

interface PropsFormulaire {
  config: ConfigurationPlateforme | null
}

export default function FormulaireConfiguration({ config }: PropsFormulaire) {
  const router = useRouter()
  const [afficherCle, setAfficherCle] = useState(false)
  const [chargement, setChargement]   = useState(false)
  const [erreur, setErreur]           = useState<string | null>(null)
  const [succes, setSucces]           = useState(false)

  const [valeurs, setValeurs] = useState({
    cle_api_ia:           config?.cle_api_ia           ?? '',
    prompt_evaluation:    config?.prompt_evaluation    ?? '',
    prompt_reformulation: config?.prompt_reformulation ?? '',
    prix_pack_simple:     config?.prix_pack_simple     ?? 2000,
    prix_pack_premium:    config?.prix_pack_premium    ?? 7000,
    quota_pack_simple:    config?.quota_pack_simple    ?? 3,
    quota_pack_premium:   config?.quota_pack_premium   ?? 20,
  })

  function mettreAJour(champ: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const val = e.target.type === 'number' ? Number(e.target.value) : e.target.value
      setValeurs((prev) => ({ ...prev, [champ]: val }))
    }
  }

  async function sauvegarder(e: FormEvent) {
    e.preventDefault()
    setErreur(null)
    setChargement(true)

    try {
      const reponse = await fetch('/api/admin/configuration', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(valeurs),
      })

      if (!reponse.ok) {
        const donnees = await reponse.json()
        throw new Error(donnees.erreur ?? 'Erreur lors de la sauvegarde')
      }

      setSucces(true)
      setTimeout(() => setSucces(false), 3000)
      router.refresh()
    } catch (e: unknown) {
      setErreur(e instanceof Error ? e.message : 'Erreur inconnue.')
    } finally {
      setChargement(false)
    }
  }

  return (
    <div className="max-w-3xl">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Configuration de l&apos;IA</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Gérez vos paramètres d&apos;accès aux modèles de langage et personnalisez les instructions d&apos;analyse institutionnelle.
        </p>
      </div>

      {erreur && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
          <p className="text-sm text-red-600">{erreur}</p>
        </div>
      )}

      {succes && (
        <div className="mb-6 rounded-lg bg-green-50 border border-green-200 px-4 py-3">
          <p className="text-sm text-green-600">✓ Configuration sauvegardée avec succès.</p>
        </div>
      )}

      <form onSubmit={sauvegarder} className="space-y-6">
        {/* Moteur IA */}
        <Carte>
          <div className="flex items-center gap-3 mb-5">
            <div className="rounded-lg bg-zinc-100 p-2">
              <Cpu className="h-5 w-5 text-zinc-600" />
            </div>
            <div>
              <h2 className="font-semibold text-zinc-900">Moteur IA</h2>
              <p className="text-xs text-zinc-400">
                La clé API est chiffrée avant d&apos;être stockée. Les prompts définissent l&apos;expertise et la neutralité de l&apos;outil.
              </p>
            </div>
          </div>

          {/* Clé API */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
              Clé d&apos;API{' '}
              <span className="ml-1 text-zinc-400 font-normal text-xs">(OpenAI)</span>
            </label>
            <div className="relative">
              <input
                type={afficherCle ? 'text' : 'password'}
                value={valeurs.cle_api_ia}
                onChange={mettreAJour('cle_api_ia')}
                placeholder="sk-..."
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 pr-10 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setAfficherCle(!afficherCle)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                {afficherCle ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Prompt évaluation */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
              Prompt d&apos;évaluation de discours politique
            </label>
            <p className="mb-2 text-xs text-zinc-400">
              Vous êtes un expert en analyse institutionnelle. Définissez les critères de rigueur, de clarté et de force de persuasion.
            </p>
            <textarea
              value={valeurs.prompt_evaluation}
              onChange={mettreAJour('prompt_evaluation')}
              rows={5}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none resize-none"
            />
          </div>

          {/* Prompt reformulation */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
              Prompt de reformulation
            </label>
            <p className="mb-2 text-xs text-zinc-400">
              Définit la manière dont l&apos;IA propose des variantes alternatives les plus impactantes du texte.
            </p>
            <textarea
              value={valeurs.prompt_reformulation}
              onChange={mettreAJour('prompt_reformulation')}
              rows={4}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 focus:border-zinc-400 focus:outline-none resize-none"
            />
          </div>
        </Carte>

        {/* Tarifs */}
        <Carte>
          <h2 className="font-semibold text-zinc-900 mb-4">Tarifs et quotas des packs</h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-zinc-700">Pack Simple</h3>
              <ChampSaisie
                libelle="Prix (DA)"
                type="number"
                value={valeurs.prix_pack_simple}
                onChange={mettreAJour('prix_pack_simple')}
                min={0}
              />
              <ChampSaisie
                libelle="Nombre de discours"
                type="number"
                value={valeurs.quota_pack_simple}
                onChange={mettreAJour('quota_pack_simple')}
                min={1}
              />
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-zinc-700">Pack Premium</h3>
              <ChampSaisie
                libelle="Prix (DA)"
                type="number"
                value={valeurs.prix_pack_premium}
                onChange={mettreAJour('prix_pack_premium')}
                min={0}
              />
              <ChampSaisie
                libelle="Nombre de discours"
                type="number"
                value={valeurs.quota_pack_premium}
                onChange={mettreAJour('quota_pack_premium')}
                min={1}
              />
            </div>
          </div>
        </Carte>

        <div className="flex justify-end">
          <Bouton
            type="submit"
            chargement={chargement}
            taille="lg"
            iconGauche={<Save className="h-4 w-4" />}
          >
            Sauvegarder
          </Bouton>
        </div>
      </form>
    </div>
  )
}
