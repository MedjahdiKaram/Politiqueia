import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight, CheckCircle, Microscope, Brain, Network,
  BookOpen, FlaskConical, Globe, Building2, Users,
  LayoutDashboard, UserCircle,
} from 'lucide-react'
import { creerClientServeur, creerClientAdmin } from '@/lib/supabase/server'
import { formaterPrix, enrichirAbonnement, initiales } from '@/lib/utils'
import type { Abonnement, ConfigurationPlateforme, Profil } from '@/types'
import HeroDiscursif from '@/components/hero/HeroDiscursif'
import LinkBouton from '@/components/ui/LinkBouton'

export const metadata: Metadata = { title: 'Accueil' }

async function obtenirConfiguration(): Promise<ConfigurationPlateforme | null> {
  try {
    const supabase = await creerClientServeur()
    const { data } = await supabase.from('configuration_plateforme').select('*').single()
    return data
  } catch {
    return null
  }
}

interface SessionUtilisateur {
  profil: Profil
  quotaRestant: number
  quotaTotal: number
  typeAbonnement: 'simple' | 'premium' | null
}

async function obtenirSession(): Promise<SessionUtilisateur | null> {
  try {
    const supabase      = await creerClientServeur()
    const supabaseAdmin = await creerClientAdmin()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const [{ data: profil }, { data: abonnement }] = await Promise.all([
      supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single<Profil>(),
      supabaseAdmin
        .from('abonnements')
        .select('*')
        .eq('user_id', user.id)
        .eq('actif', true)
        .order('date_fin', { ascending: false })
        .limit(1)
        .single<Abonnement>(),
    ])

    if (!profil) return null
    const ab = abonnement ? enrichirAbonnement(abonnement) : null

    return {
      profil,
      quotaRestant: ab?.quota_restant ?? 0,
      quotaTotal:   ab?.quota_total   ?? 0,
      typeAbonnement: (ab?.type as 'simple' | 'premium') ?? null,
    }
  } catch {
    return null
  }
}

const PUBLICS = [
  { icon: BookOpen,   label: 'Universités & Laboratoires' },
  { icon: FlaskConical, label: 'Incubateurs & Pôles d\'innovation' },
  { icon: Globe,      label: 'Observatoires politiques' },
  { icon: Building2,  label: 'Cabinets de conseil stratégique' },
  { icon: Users,      label: 'ONG & Institutions publiques' },
  { icon: Network,    label: 'Colloques & Recherche académique' },
]

const FONCTIONNALITES = [
  {
    icon: Microscope,
    couleur: 'bg-blue-50 text-blue-600',
    titre: 'Analyse des stratégies discursives',
    description:
      'Notre moteur IA décompose chaque corpus en unités sémantiques pour identifier les procédés rhétoriques, les figures de style et les stratégies d\'argumentation mobilisées.',
  },
  {
    icon: Brain,
    couleur: 'bg-orange-50 text-orange-500',
    titre: 'Détection des orientations idéologiques',
    description:
      'Quantification des tensions idéologiques et cartographie des positionnements discursifs. Idéoscope situe chaque corpus dans son spectre interprétatif.',
  },
  {
    icon: Network,
    couleur: 'bg-emerald-50 text-emerald-600',
    titre: 'Interprétation contextualisée',
    description:
      'Approche hybride IA + sciences du langage (SHS) : les résultats sont mis en perspective avec le contexte institutionnel, médiatique et socio-politique.',
  },
]

export default async function PageAccueil() {
  const [config, session] = await Promise.all([
    obtenirConfiguration(),
    obtenirSession(),
  ])

  const prixSimple   = config?.prix_pack_simple   ?? 2000
  const prixPremium  = config?.prix_pack_premium  ?? 7000
  const quotaSimple  = config?.quota_pack_simple  ?? 3
  const quotaPremium = config?.quota_pack_premium ?? 20

  const connecte = session !== null
  const jauge = connecte && session.quotaTotal > 0
    ? Math.round((session.quotaRestant / session.quotaTotal) * 100)
    : null

  return (
    <div className="bg-white">

      {/* ── Navigation ─────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/">
            <Image
              src="/Logo_ideoscole.png"
              alt="Idéoscope"
              width={130}
              height={36}
              className="object-contain"
              priority
            />
          </Link>

          {connecte ? (
            /* ── Utilisateur connecté ── */
            <div className="flex items-center gap-3">
              {/* Jauge quota */}
              {jauge !== null && (
                <div className="hidden sm:flex flex-col items-end gap-0.5 mr-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <span className="font-semibold text-slate-800">
                      {session!.quotaRestant}
                    </span>
                    <span>/ {session!.quotaTotal} corpus</span>
                    {session!.typeAbonnement && (
                      <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                        session!.typeAbonnement === 'premium'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {session!.typeAbonnement === 'premium' ? 'Recherche' : 'Essentiel'}
                      </span>
                    )}
                  </div>
                  <div className="w-32 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        jauge === 0 ? 'bg-red-500'
                        : jauge < 30 ? 'bg-orange-400'
                        : 'bg-emerald-500'
                      }`}
                      style={{ width: `${jauge}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Lien tableau de bord */}
              <LinkBouton
                href="/tableau-de-bord"
                variante="secondaire"
                taille="sm"
                iconGauche={<LayoutDashboard className="h-3.5 w-3.5" />}
              >
                Tableau de bord
              </LinkBouton>

              {/* Avatar / profil */}
              <Link
                href="/profil"
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-100 transition-colors"
                title="Mon profil"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white text-[11px] font-bold">
                  {initiales(session!.profil.prenom, session!.profil.nom)}
                </div>
                <span className="hidden sm:inline text-sm font-medium text-slate-700">
                  {session!.profil.prenom}
                </span>
                <UserCircle className="h-3.5 w-3.5 text-slate-400 sm:hidden" />
              </Link>
            </div>
          ) : (
            /* ── Visiteur ── */
            <div className="flex items-center gap-2">
              <LinkBouton href="/connexion" variante="fantome" taille="sm">
                Connexion
              </LinkBouton>
              <LinkBouton href="/inscription" variante="primaire" taille="sm">
                Inscription
              </LinkBouton>
            </div>
          )}
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <HeroDiscursif />

      {/* ── Publics cibles ─────────────────────────────────────── */}
      <section className="py-14 border-b border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-400 mb-8">
            Conçu pour la recherche, l&apos;expertise et la décision
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {PUBLICS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-2 rounded-xl bg-white border border-slate-100 p-4 text-center shadow-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                  <Icon className="h-4.5 w-4.5 text-blue-600 h-5 w-5" />
                </div>
                <span className="text-xs font-medium text-slate-700 leading-snug">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Fonctionnalités ────────────────────────────────────── */}
      <section id="fonctionnalites" className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3">
              Approche hybride IA + SHS
            </p>
            <h2 className="text-3xl font-bold text-slate-900">
              Interface entre complexité discursive<br className="hidden sm:block" />
              et analyse institutionnelle
            </h2>
            <p className="mt-4 text-slate-500 max-w-xl mx-auto">
              Idéoscope transforme des corpus complexes en rapports interprétatifs
              exploitables pour la recherche et la prise de décision.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {FONCTIONNALITES.map((f) => (
              <div key={f.titre} className="rounded-2xl border border-slate-100 bg-slate-50 p-7 hover:shadow-md transition-shadow">
                <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${f.couleur}`}>
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-3 font-semibold text-slate-900">{f.titre}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>

          {/* Apports */}
          <div className="mt-16 rounded-2xl bg-slate-900 p-8 text-white">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { titre: 'Texte → Discours',       desc: 'Passage de l\'analyse textuelle à l\'analyse discursive' },
                { titre: 'Stratégies discursives',  desc: 'Identification des procédés rhétoriques et argumentatifs' },
                { titre: 'Orientations idéolo.',    desc: 'Cartographie des positionnements et tensions idéologiques' },
                { titre: 'Rapports exploitables',  desc: 'Exportables pour mémoires, thèses, articles ou projets' },
              ].map((a) => (
                <div key={a.titre} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">{a.titre}</p>
                    <p className="mt-1 text-xs text-slate-400 leading-relaxed">{a.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Tarifs ─────────────────────────────────────────────── */}
      <section id="tarifs" className="py-24 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3">
              Accès à la plateforme
            </p>
            <h2 className="text-3xl font-bold text-slate-900">Forfaits d&apos;analyse</h2>
            <p className="mt-3 text-slate-500">
              Choisissez le volume d&apos;analyse adapté à votre projet de recherche.
            </p>
          </div>

          <div className="mx-auto grid max-w-3xl grid-cols-1 gap-8 sm:grid-cols-2">
            {/* Pack Essentiel */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Accès Essentiel
              </div>
              <div className="mt-2 text-4xl font-bold text-slate-900">
                {formaterPrix(prixSimple)}
              </div>
              <p className="mt-1 text-sm text-slate-500">Paiement unique · Valable 1 mois</p>
              <ul className="mt-6 space-y-3 text-sm text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                  {quotaSimple} corpus analysés
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                  Analyse discursive complète
                </li>
                <li className="flex items-center gap-2 text-slate-400">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  Reformulation non incluse
                </li>
              </ul>
              <LinkBouton
                href="/inscription"
                variante="contour"
                taille="lg"
                pleineLargeur
                className="mt-8 rounded-xl"
              >
                Choisir ce forfait
              </LinkBouton>
            </div>

            {/* Pack Recherche */}
            <div className="relative rounded-2xl border-2 border-blue-600 bg-blue-600 p-8 text-white">
              <div className="absolute -top-3 right-6 rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white">
                Recommandé
              </div>
              <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-blue-200">
                Accès Recherche
              </div>
              <div className="mt-2 text-4xl font-bold text-white">
                {formaterPrix(prixPremium)}
              </div>
              <p className="mt-1 text-sm text-blue-200">Paiement unique · Valable 3 mois</p>
              <ul className="mt-6 space-y-3 text-sm text-blue-100">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-200 shrink-0" />
                  {quotaPremium} corpus analysés
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-200 shrink-0" />
                  Analyse discursive approfondie
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-200 shrink-0" />
                  Reformulation contextualisée incluse
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-200 shrink-0" />
                  Support prioritaire
                </li>
              </ul>
              <LinkBouton
                href="/inscription"
                variante="secondaire"
                taille="lg"
                pleineLargeur
                className="mt-8 rounded-xl font-semibold text-blue-700 hover:bg-blue-50"
                iconDroite={<ArrowRight className="h-4 w-4" />}
              >
                Accéder à la recherche
              </LinkBouton>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA final ──────────────────────────────────────────── */}
      <section className="section-tarifs-navy py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <Image
            src="/Logo_ideoscole_with_tagline.png"
            alt="Idéoscope"
            width={200}
            height={60}
            className="object-contain mx-auto mb-8"
          />
          <h2 className="text-2xl font-bold text-white">
            Prêt à analyser votre prochain corpus ?
          </h2>
          <p className="mt-4 text-slate-400 max-w-xl mx-auto">
            Rejoignez universités, laboratoires et observatoires qui s&apos;appuient
            sur Idéoscope pour transformer leurs corpus en rapports interprétatifs exploitables.
          </p>
          <LinkBouton
            href="/inscription"
            variante="primaire"
            taille="lg"
            className="mt-8 px-8 rounded-xl"
            iconDroite={<ArrowRight className="h-4 w-4" />}
          >
            Démarrer l&apos;analyse
          </LinkBouton>
        </div>
      </section>
    </div>
  )
}
