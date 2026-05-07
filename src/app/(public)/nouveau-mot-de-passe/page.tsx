'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, CheckCircle } from 'lucide-react'
import { creerClientSupabase } from '@/lib/supabase/client'
import Bouton from '@/components/ui/Bouton'
import ChampSaisie from '@/components/ui/ChampSaisie'

export default function PageNouveauMotDePasse() {
  const router = useRouter()
  const [motDePasse, setMotDePasse]       = useState('')
  const [confirmation, setConfirmation]   = useState('')
  const [afficher, setAfficher]           = useState(false)
  const [chargement, setChargement]       = useState(false)
  const [erreur, setErreur]               = useState<string | null>(null)
  const [succes, setSucces]               = useState(false)
  const [sessionValide, setSessionValide] = useState(false)

  useEffect(() => {
    // Vérifier qu'on a bien une session de réinitialisation
    const supabase = creerClientSupabase()
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionValide(true)
      }
    })
    // Tenter de récupérer la session existante
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setSessionValide(true)
    })
  }, [])

  async function gererSoumission(e: FormEvent) {
    e.preventDefault()
    setErreur(null)

    if (motDePasse.length < 8) {
      setErreur('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    if (motDePasse !== confirmation) {
      setErreur('Les mots de passe ne correspondent pas.')
      return
    }

    setChargement(true)
    try {
      const supabase = creerClientSupabase()
      const { error } = await supabase.auth.updateUser({ password: motDePasse })
      if (error) {
        setErreur(error.message)
        return
      }
      setSucces(true)
      setTimeout(() => router.push('/connexion'), 2500)
    } catch {
      setErreur('Une erreur inattendue est survenue.')
    } finally {
      setChargement(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="text-xl font-bold text-zinc-900">Politiqueia</span>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          {succes ? (
            <div className="text-center">
              <CheckCircle className="mx-auto mb-4 h-12 w-12 text-green-500" />
              <h2 className="text-lg font-bold text-zinc-900">Mot de passe mis à jour !</h2>
              <p className="mt-2 text-sm text-zinc-500">
                Redirection vers la page de connexion…
              </p>
            </div>
          ) : (
            <>
              <h2 className="mb-1 text-xl font-bold text-zinc-900">
                Nouveau mot de passe
              </h2>
              <p className="mb-6 text-sm text-zinc-500">
                Choisissez un nouveau mot de passe sécurisé pour votre compte.
              </p>

              {erreur && (
                <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                  <p className="text-sm text-red-600">{erreur}</p>
                </div>
              )}

              <form onSubmit={gererSoumission} className="space-y-4">
                <div className="relative">
                  <ChampSaisie
                    libelle="Nouveau mot de passe"
                    type={afficher ? 'text' : 'password'}
                    value={motDePasse}
                    onChange={(e) => setMotDePasse(e.target.value)}
                    placeholder="••••••••"
                    required
                    description="Au moins 8 caractères"
                    iconDroite={
                      <button
                        type="button"
                        onClick={() => setAfficher(!afficher)}
                        className="hover:text-zinc-600"
                      >
                        {afficher ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    }
                  />
                </div>

                <ChampSaisie
                  libelle="Confirmer le mot de passe"
                  type={afficher ? 'text' : 'password'}
                  value={confirmation}
                  onChange={(e) => setConfirmation(e.target.value)}
                  placeholder="••••••••"
                  required
                  erreur={
                    confirmation && motDePasse !== confirmation
                      ? 'Les mots de passe ne correspondent pas.'
                      : undefined
                  }
                />

                <Bouton
                  type="submit"
                  pleineLargeur
                  chargement={chargement}
                  taille="lg"
                  className="mt-2"
                >
                  Enregistrer le nouveau mot de passe
                </Bouton>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
