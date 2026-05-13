'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { Mail, ArrowLeft } from 'lucide-react'
import { creerClientSupabase } from '@/lib/supabase/client'
import Bouton from '@/components/ui/Bouton'
import ChampSaisie from '@/components/ui/ChampSaisie'

export default function PageMotDePasseOublie() {
  const [email, setEmail]       = useState('')
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur]     = useState<string | null>(null)
  const [envoye, setEnvoye]     = useState(false)

  async function gererSoumission(e: FormEvent) {
    e.preventDefault()
    setErreur(null)
    setChargement(true)

    try {
      const supabase = creerClientSupabase()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/nouveau-mot-de-passe`,
      })

      if (error) {
        setErreur('Une erreur est survenue. Vérifiez votre adresse email.')
        return
      }

      setEnvoye(true)
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
          <Link href="/" className="text-xl font-bold text-slate-900">Idéoscope</Link>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          {envoye ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-lg font-bold text-zinc-900">Email envoyé</h2>
              <p className="mt-2 text-sm text-zinc-500">
                Si un compte est associé à <strong>{email}</strong>, vous recevrez
                un lien de réinitialisation dans quelques minutes.
              </p>
              <Link
                href="/connexion"
                className="mt-6 inline-flex items-center gap-2 text-sm text-zinc-600 hover:text-zinc-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour à la connexion
              </Link>
            </div>
          ) : (
            <>
              <h2 className="mb-1 text-xl font-bold text-zinc-900">Mot de passe oublié</h2>
              <p className="mb-6 text-sm text-zinc-500">
                Saisissez votre adresse email. Nous vous enverrons un lien de réinitialisation.
              </p>

              {erreur && (
                <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                  <p className="text-sm text-red-600">{erreur}</p>
                </div>
              )}

              <form onSubmit={gererSoumission} className="space-y-4">
                <ChampSaisie
                  libelle="Adresse email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@institution.fr"
                  required
                  autoComplete="email"
                  iconGauche={<Mail className="h-4 w-4" />}
                />

                <Bouton
                  type="submit"
                  pleineLargeur
                  chargement={chargement}
                  taille="lg"
                >
                  Envoyer le lien
                </Bouton>
              </form>

              <div className="mt-4 text-center">
                <Link
                  href="/connexion"
                  className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Retour à la connexion
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
