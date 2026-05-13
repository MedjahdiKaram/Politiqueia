'use client'

import { useState, FormEvent, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, ShieldCheck, Microscope } from 'lucide-react'
import { creerClientSupabase } from '@/lib/supabase/client'
import Bouton from '@/components/ui/Bouton'
import ChampSaisie from '@/components/ui/ChampSaisie'

const STATS = [
  { valeur: '2 000+', libelle: 'corpus analysés' },
  { valeur: '98 %',   libelle: 'précision sémantique' },
  { valeur: '< 60 s', libelle: 'par analyse' },
]

function ContenuConnexion() {
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

      {/* ── Colonne gauche : visuel ── */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        <Image
          src="/politicien.png"
          alt="Analyse de corpus discursif"
          fill
          className="object-cover object-center"
          priority
        />
        {/* Dégradé navy */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(13,31,60,0.88) 0%, rgba(13,31,60,0.55) 60%, transparent 100%)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(13,31,60,0.75) 0%, transparent 50%)' }} />

        {/* Contenu */}
        <div className="relative z-10 flex flex-col justify-between h-full px-12 py-10">
          {/* Logo */}
          <Image src="/Logo_ideoscole.png" alt="Idéoscope" width={140} height={40} className="object-contain" />

          {/* Accroche */}
          <div className="max-w-md">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1">
              <Microscope className="h-3.5 w-3.5 text-blue-400" />
              <span className="text-xs text-blue-300 font-medium">IA + Sciences du Langage</span>
            </div>
            <h1 className="text-4xl font-bold text-white leading-tight">
              Du texte au discours.<br />
              <span className="text-blue-300">De l&apos;analyse à l&apos;interprétation.</span>
            </h1>

            <blockquote className="mt-8 border-l-2 border-blue-400/40 pl-5">
              <p className="text-sm text-white/70 leading-relaxed italic">
                &laquo;&nbsp;Idéoscope propose un changement de paradigme en passant du traitement du texte
                à l&apos;analyse du discours, dans toute sa complexité idéologique et interprétative.&nbsp;&raquo;
              </p>
              <footer className="mt-3 text-xs font-medium text-white/50">
                Comité Scientifique Idéoscope
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

      {/* ── Colonne droite : formulaire ── */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-12 bg-white">
        <div className="mx-auto w-full max-w-sm">

          {/* Logo mobile */}
          <div className="mb-8 lg:hidden">
            <Image src="/Logo_ideoscole_with_tagline.png" alt="Idéoscope" width={160} height={48} className="object-contain" />
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Connexion</h2>
            <p className="mt-1 text-sm text-slate-500">
              Accédez à votre espace d&apos;analyse discursive
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
                  className="hover:text-slate-600 transition-colors"
                  aria-label={afficherMdp ? 'Masquer' : 'Afficher'}
                >
                  {afficherMdp ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />

            <div className="flex justify-end">
              <Link href="/mot-de-passe-oublie" className="text-xs text-slate-500 hover:text-slate-900 transition-colors">
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

          <p className="mt-6 text-center text-sm text-slate-500">
            Pas encore de compte ?{' '}
            <Link href="/inscription" className="font-semibold text-blue-600 hover:underline">
              Demander un accès
            </Link>
          </p>

          {/* Badge confiance */}
          <div className="mt-10 flex items-center justify-center gap-6 text-slate-300">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span className="text-xs">Données sécurisées</span>
            </div>
            <div className="h-3 w-px bg-slate-200" />
            <div className="flex items-center gap-1.5">
              <Microscope className="h-3.5 w-3.5" />
              <span className="text-xs">Approche scientifique</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SpinnerPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <span className="relative inline-flex h-8 w-8">
        <span className="absolute inset-0 rounded-full border-2 border-blue-200" />
        <span className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-600 animate-spin" style={{ animationDuration: '0.65s' }} />
        <span className="absolute inset-[10px] rounded-full bg-blue-600 animate-ping opacity-50" />
      </span>
    </div>
  )
}

export default function PageConnexion() {
  return (
    <Suspense fallback={<SpinnerPage />}>
      <ContenuConnexion />
    </Suspense>
  )
}
