'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { creerClientSupabase } from '@/lib/supabase/client'
import Bouton from '@/components/ui/Bouton'
import LinkBouton from '@/components/ui/LinkBouton'
import ChampSaisie from '@/components/ui/ChampSaisie'
import { BookOpen, FlaskConical, Globe } from 'lucide-react'

export default function PageInscription() {
  const router = useRouter()
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur]         = useState<string | null>(null)
  const [succes, setSucces]         = useState(false)

  const [formulaire, setFormulaire] = useState({
    prenom:     '',
    nom:        '',
    fonction:   '',
    email:      '',
    telephone:  '',
    motDePasse: '',
  })

  function mettreAJour(champ: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setFormulaire((prev) => ({ ...prev, [champ]: e.target.value }))
  }

  async function gererSoumission(e: FormEvent) {
    e.preventDefault()
    setErreur(null)
    setChargement(true)

    if (formulaire.motDePasse.length < 8) {
      setErreur('Le mot de passe doit contenir au moins 8 caractères.')
      setChargement(false)
      return
    }

    try {
      const supabase = creerClientSupabase()
      const { error } = await supabase.auth.signUp({
        email: formulaire.email,
        password: formulaire.motDePasse,
        options: {
          data: {
            nom:       formulaire.nom,
            prenom:    formulaire.prenom,
            fonction:  formulaire.fonction,
            telephone: formulaire.telephone,
          },
          emailRedirectTo: `${window.location.origin}/tableau-de-bord`,
        },
      })

      if (error) {
        setErreur(
          error.message.includes('already registered')
            ? 'Cette adresse email est déjà associée à un compte.'
            : error.message
        )
        return
      }

      setSucces(true)
    } catch {
      setErreur('Une erreur inattendue est survenue.')
    } finally {
      setChargement(false)
    }
  }

  if (succes) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
            <span className="text-2xl">✓</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Compte créé avec succès !</h2>
          <p className="mt-3 text-sm text-slate-500">
            Un email de confirmation vous a été envoyé à{' '}
            <strong>{formulaire.email}</strong>. Cliquez sur le lien pour activer votre accès.
          </p>
          <LinkBouton
            href="/connexion"
            variante="primaire"
            taille="md"
            className="mt-6 px-6"
          >
            Retour à la connexion
          </LinkBouton>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md">

        {/* En-tête */}
        <div className="mb-8 text-center">
          <Link href="/">
            <Image
              src="/Logo_ideoscole_with_tagline.png"
              alt="Idéoscope"
              width={180}
              height={54}
              className="object-contain mx-auto"
            />
          </Link>
          <p className="mt-3 text-sm text-slate-500">
            Créez votre accès à la plateforme d&apos;analyse discursive.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          {erreur && (
            <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
              <p className="text-sm text-red-600">{erreur}</p>
            </div>
          )}

          <form onSubmit={gererSoumission} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <ChampSaisie
                libelle="Prénom"
                type="text"
                value={formulaire.prenom}
                onChange={mettreAJour('prenom')}
                placeholder="Jean"
                required
                autoComplete="given-name"
              />
              <ChampSaisie
                libelle="Nom"
                type="text"
                value={formulaire.nom}
                onChange={mettreAJour('nom')}
                placeholder="Dupont"
                required
                autoComplete="family-name"
              />
            </div>

            <ChampSaisie
              libelle="Fonction / Affiliation"
              type="text"
              value={formulaire.fonction}
              onChange={mettreAJour('fonction')}
              placeholder="Chercheur, Doctorant, Analyste..."
              required
            />

            <ChampSaisie
              libelle="Email institutionnel"
              type="email"
              value={formulaire.email}
              onChange={mettreAJour('email')}
              placeholder="jean.dupont@universite.fr"
              required
              autoComplete="email"
            />

            <ChampSaisie
              libelle="Téléphone"
              type="tel"
              value={formulaire.telephone}
              onChange={mettreAJour('telephone')}
              placeholder="+213 6 12 34 56 78"
              autoComplete="tel"
            />

            <ChampSaisie
              libelle="Mot de passe"
              type="password"
              value={formulaire.motDePasse}
              onChange={mettreAJour('motDePasse')}
              placeholder="••••••••"
              required
              autoComplete="new-password"
              description="Au moins 8 caractères"
            />

            <Bouton
              type="submit"
              pleineLargeur
              chargement={chargement}
              taille="lg"
              iconDroite={!chargement ? <span>→</span> : undefined}
              className="mt-2"
            >
              Créer mon accès
            </Bouton>

            <p className="text-center text-sm text-slate-500">
              Vous avez déjà un compte ?{' '}
              <Link href="/connexion" className="font-semibold text-blue-600 hover:underline">
                Se connecter
              </Link>
            </p>
          </form>
        </div>

        {/* Publics */}
        <div className="mt-8 flex justify-center gap-10 text-slate-300">
          <BookOpen className="h-7 w-7" />
          <FlaskConical className="h-7 w-7" />
          <Globe className="h-7 w-7" />
        </div>
      </div>
    </div>
  )
}
