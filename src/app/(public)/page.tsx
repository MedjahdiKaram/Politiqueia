import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CheckCircle, Zap, Shield } from 'lucide-react'
import { creerClientServeur } from '@/lib/supabase/server'
import { formaterPrix } from '@/lib/utils'
import type { ConfigurationPlateforme } from '@/types'

export const metadata: Metadata = {
  title: 'Accueil',
}

async function obtenirConfiguration(): Promise<ConfigurationPlateforme | null> {
  try {
    const supabase = await creerClientServeur()
    const { data } = await supabase
      .from('configuration_plateforme')
      .select('*')
      .single()
    return data
  } catch {
    return null
  }
}

export default async function PageAccueil() {
  const config = await obtenirConfiguration()

  const prixSimple  = config?.prix_pack_simple  ?? 2000
  const prixPremium = config?.prix_pack_premium ?? 7000
  const quotaSimple  = config?.quota_pack_simple  ?? 3
  const quotaPremium = config?.quota_pack_premium ?? 20

  return (
    <div className="bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-zinc-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <span className="text-lg font-bold text-zinc-900">Politiqueia</span>
          <div className="flex items-center gap-2">
            <Link
              href="/connexion"
              className="rounded-lg px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-100 transition-colors"
            >
              Connexion
            </Link>
            <Link
              href="/inscription"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
            >
              S&apos;inscrire
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-zinc-950 text-white">
        {/* Image d'arrière-plan */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1600&q=80')" }}
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="max-w-2xl">
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-zinc-400">
              Plateforme d&apos;analyse politique
            </p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Évaluation de discours{' '}
              <span className="text-zinc-300">politique assistée</span>
              {' '}par IA
            </h1>
            <p className="mt-6 text-lg text-zinc-400 leading-relaxed">
              Décryptez l&apos;impact de votre communication politique grâce à notre
              analyse rhétorique. Politiqueia évalue votre discours, identifie
              vos forces et vous propose des reformulations optimisées.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/inscription"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-100 transition-colors"
              >
                Commencer l&apos;analyse
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#tarifs"
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-6 py-3 text-sm font-medium text-zinc-300 hover:bg-zinc-900 transition-colors"
              >
                Voir les tarifs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Fonctionnalités */}
      <section className="py-20 bg-zinc-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-zinc-900">
              Analyse de Clarté et d&apos;Impact
            </h2>
            <p className="mt-3 text-zinc-500">
              Notre IA évalue chaque aspect de votre discours pour maximiser votre impact.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              {
                icon: Zap,
                titre: 'Analyse en temps réel',
                description:
                  "Notre moteur IA traite votre discours en quelques secondes et génère une analyse structurée avec scores de persuasion et de clarté.",
              },
              {
                icon: CheckCircle,
                titre: 'Points forts identifiés',
                description:
                  "Comprenez immédiatement ce qui fonctionne : cohérence thématique, fluidité rhétorique, force des arguments, registre de langue.",
              },
              {
                icon: Shield,
                titre: 'Reformulation intelligente',
                description:
                  "Obtenez une proposition de reformulation optimisée pour amplifier l'impact de votre message tout en préservant votre intention.",
              },
            ].map((feature) => (
              <div key={feature.titre} className="rounded-xl bg-white p-6 shadow-sm border border-zinc-100">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100">
                  <feature.icon className="h-5 w-5 text-zinc-700" />
                </div>
                <h3 className="mb-2 font-semibold text-zinc-900">{feature.titre}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tarifs */}
      <section id="tarifs" className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-zinc-900">Nos Forfaits</h2>
            <p className="mt-3 text-zinc-500">
              Choisissez le forfait adapté à vos besoins d&apos;analyse.
            </p>
          </div>

          <div className="mx-auto grid max-w-3xl grid-cols-1 gap-8 sm:grid-cols-2">
            {/* Pack Simple */}
            <div className="rounded-2xl border border-zinc-200 p-8">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Pack Simple
              </div>
              <div className="mt-2 text-4xl font-bold text-zinc-900">
                {formaterPrix(prixSimple)}
              </div>
              <p className="mt-1 text-sm text-zinc-500">Paiement unique · Valable 1 mois</p>
              <ul className="mt-6 space-y-3 text-sm text-zinc-700">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-zinc-400 shrink-0" />
                  {quotaSimple} discours analysés
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-zinc-400 shrink-0" />
                  Analyse IA complète
                </li>
                <li className="flex items-center gap-2 text-zinc-400">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  Reformulation non incluse
                </li>
              </ul>
              <Link
                href="/inscription"
                className="mt-8 flex items-center justify-center rounded-lg border border-zinc-200 py-3 text-sm font-medium text-zinc-900 hover:bg-zinc-50 transition-colors"
              >
                Choisir ce plan
              </Link>
            </div>

            {/* Pack Premium */}
            <div className="relative rounded-2xl border-2 border-zinc-900 bg-zinc-950 p-8 text-white">
              <div className="absolute -top-3 right-6 rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold border border-zinc-700 text-zinc-300">
                Recommandé
              </div>
              <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Pack Premium
              </div>
              <div className="mt-2 text-4xl font-bold text-white">
                {formaterPrix(prixPremium)}
              </div>
              <p className="mt-1 text-sm text-zinc-400">Paiement unique · Valable 3 mois</p>
              <ul className="mt-6 space-y-3 text-sm text-zinc-300">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-zinc-500 shrink-0" />
                  {quotaPremium} discours analysés
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-zinc-500 shrink-0" />
                  Analyse IA approfondie
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-zinc-500 shrink-0" />
                  Reformulation incluse
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-zinc-500 shrink-0" />
                  Support prioritaire
                </li>
              </ul>
              <Link
                href="/inscription"
                className="mt-8 flex items-center justify-center gap-2 rounded-lg bg-white py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-100 transition-colors"
              >
                S&apos;abonner maintenant
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-zinc-950 py-16 text-white">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-2xl font-bold">
            Prêt à analyser votre prochain discours ?
          </h2>
          <p className="mt-4 text-zinc-400">
            Rejoignez les professionnels de la politique qui font confiance à Politiqueia
            pour affiner leur communication.
          </p>
          <Link
            href="/inscription"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-100 transition-colors"
          >
            Commencer gratuitement
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
