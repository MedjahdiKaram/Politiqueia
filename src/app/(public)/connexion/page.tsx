'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, ShieldCheck, BarChart2, Sparkles } from 'lucide-react'
import { creerClientSupabase } from '@/lib/supabase/client'
import Bouton from '@/components/ui/Bouton'
import ChampSaisie from '@/components/ui/ChampSaisie'

const STATS = [
  { valeur: '2 000+', libelle: 'discours analysés' },
  { valeur: '98 %',   libelle: 'de précision IA' },
  { valeur: '< 60 s', libelle: 'par analyse' },
]

export default function PageConnexion() {
  const router = useRouter()
  const params = useSearchParams()
  const [email, setEmail]             = useState('')
  const [motDePasse, setMotDePasse]   = useState('')
  const [afficherMdp, setAfficherMdp] = useState(false)
  const [chargement, setChargement]   = useState(false)
  const [erreur, setErreur]           = useState<string | null>(null)

  const messageErreurParam = params.get('erreur') === 'compte-desactive'
    ? "Votre compte a été désactivé. Veuillez contacter l'administrateur."
    : null

  async function gererSoumission(e: FormEvent) {
    e.preventDefault()
    setErreur(null)
    setChargement(true)

    try {
      const supabase = creerClientSupabase()
      const { error } = await supabase.auth.signInWithPassword({ email, password: motDePasse })

      if (error) {
        setErreur(
          error.message.includes('Invalid login credentials')
            ? 'Identifiants incorrects. Vérifiez votre email et mot de passe.'
            : 'Une erreur est survenue. Veuillez réessayer.'
        )
        return
      }

      router.push('/tableau-de-bord')
      router.refresh()
    } catch {
      setErreur('Une erreur inattendue est survenue.')
    } finally {
      setChargement(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* ── Colonne gauche : visuel ───────────────────────────── */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        {/* Photo */}
        <Image
          src="https://images.unsplash.com/photo-1541872705-1f73c6400ec9?w=1400&q=80"
          alt="Politicien donnant un discours"
          fill
          className="object-cover object-center"
          priority
          unoptimized
        />

        {/* Dégradé sombre */}
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/80 via-zinc-950/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/70 via-transparent to-transparent" />

        {/* Contenu superposé */}
        <div className="relative z-10 flex flex-col justify-between h-full px-12 py-10">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">Politiqueia</span>
          </div>

          {/* Accroche centrale */}
          <div className="max-w-md">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-4">
              Analyse politique par IA
            </p>
            <h1 className="text-4xl font-bold text-white leading-tight">
              L&apos;intelligence artificielle au service de{' '}
              <span className="text-white/70">la rigueur politique.</span>
            </h1>

            <blockquote className="mt-8 border-l-2 border-white/30 pl-5">
              <p className="text-sm text-white/70 leading-relaxed italic">
                &laquo;&nbsp;La clarté du discours est le premier rempart de la démocratie.
                Politiqueia fournit les outils nécessaires pour décrypter chaque mot,
                chaque intention.&nbsp;&raquo;
              </p>
              <footer className="mt-3 flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-white/20 backdrop-blur-sm" />
                <span className="text-xs font-medium text-white/60">
                  Comité d&apos;Analyse Politique
                </span>
              </footer>
            </blockquote>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-8">
            {STATS.map((s) => (
              <div key={s.libelle}>
                <p className="text-2xl font-bold text-white">{s.valeur}</p>
                <p className="text-xs text-white/50 mt-0.5">{s.libelle}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Colonne droite : formulaire ───────────────────────── */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-12 bg-white">
        <div className="mx-auto w-full max-w-sm">

          {/* Logo mobile */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-base font-bold text-zinc-900">Politiqueia</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-zinc-900">Connexion</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Accédez à votre tableau de bord
            </p>
          </div>

          {(erreur || messageErreurParam) && (
            <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
              <p className="text-sm text-red-600">{erreur || messageErreurParam}</p>
            </div>
          )}

          <form onSubmit={gererSoumission} className="space-y-5">
            <ChampSaisie
              libelle="Email institutionnel"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nom@institution.fr"
              required
              autoComplete="email"
              iconGauche={<Mail className="h-4 w-4" />}
            />

            <ChampSaisie
              libelle="Mot de passe"
              type={afficherMdp ? 'text' : 'password'}
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              iconGauche={<Lock className="h-4 w-4" />}
              iconDroite={
                <button
                  type="button"
                  onClick={() => setAfficherMdp(!afficherMdp)}
                  className="hover:text-zinc-600 transition-colors"
                  aria-label={afficherMdp ? 'Masquer' : 'Afficher'}
                >
                  {afficherMdp ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />

            <div className="flex justify-end">
              <Link
                href="/mot-de-passe-oublie"
                className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            <Bouton
              type="submit"
              pleineLargeur
              chargement={chargement}
              taille="lg"
              iconDroite={!chargement ? <span>→</span> : undefined}
            >
              Se connecter
            </Bouton>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500">
            Pas encore de compte ?{' '}
            <Link href="/inscription" className="font-semibold text-zinc-900 hover:underline">
              S&apos;inscrire
            </Link>
          </p>

          {/* Badges de confiance */}
          <div className="mt-10 flex items-center justify-center gap-6 text-zinc-300">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span className="text-xs">Données sécurisées</span>
            </div>
            <div className="h-3 w-px bg-zinc-200" />
            <div className="flex items-center gap-1.5">
              <BarChart2 className="h-3.5 w-3.5" />
              <span className="text-xs">Analyse en temps réel</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
