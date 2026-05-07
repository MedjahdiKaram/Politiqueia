'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { ArrowLeft, Send, CheckCircle } from 'lucide-react'
import Bouton from '@/components/ui/Bouton'
import ChampSaisie from '@/components/ui/ChampSaisie'

export default function PageContact() {
  const [chargement, setChargement] = useState(false)
  const [envoye, setEnvoye]         = useState(false)
  const [formulaire, setFormulaire] = useState({
    nom:     '',
    email:   '',
    sujet:   '',
    message: '',
  })

  function mettreAJour(champ: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFormulaire((prev) => ({ ...prev, [champ]: e.target.value }))
  }

  async function gererSoumission(e: FormEvent) {
    e.preventDefault()
    setChargement(true)
    // Simulation d'envoi (à connecter à un vrai service d'email)
    await new Promise((r) => setTimeout(r, 1000))
    setEnvoye(true)
    setChargement(false)
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900">
        <ArrowLeft className="h-4 w-4" />
        Retour à l&apos;accueil
      </Link>

      <h1 className="text-3xl font-bold text-zinc-900 mb-2">Contact</h1>
      <p className="text-zinc-500 mb-10">
        Une question sur Politiqueia ou votre abonnement ? Écrivez-nous.
      </p>

      {envoye ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center shadow-sm">
          <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
          <h2 className="text-xl font-bold text-zinc-900">Message envoyé !</h2>
          <p className="mt-2 text-sm text-zinc-500">
            Nous avons bien reçu votre message et vous répondrons dans les plus brefs délais.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block text-sm text-zinc-600 hover:text-zinc-900 underline"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          <form onSubmit={gererSoumission} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <ChampSaisie
                libelle="Nom"
                value={formulaire.nom}
                onChange={mettreAJour('nom')}
                placeholder="Dupont"
                required
              />
              <ChampSaisie
                libelle="Email"
                type="email"
                value={formulaire.email}
                onChange={mettreAJour('email')}
                placeholder="nom@email.fr"
                required
              />
            </div>

            <ChampSaisie
              libelle="Sujet"
              value={formulaire.sujet}
              onChange={mettreAJour('sujet')}
              placeholder="Ex. : Question sur mon abonnement"
              required
            />

            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formulaire.message}
                onChange={mettreAJour('message')}
                rows={5}
                required
                placeholder="Décrivez votre demande..."
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none resize-none"
              />
            </div>

            <Bouton
              type="submit"
              pleineLargeur
              chargement={chargement}
              taille="lg"
              iconGauche={<Send className="h-4 w-4" />}
              className="mt-2"
            >
              Envoyer le message
            </Bouton>
          </form>
        </div>
      )}
    </div>
  )
}
