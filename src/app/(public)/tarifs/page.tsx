import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react'
import { creerClientServeur } from '@/lib/supabase/server'
import { formaterPrix } from '@/lib/utils'
import type { ConfigurationPlateforme } from '@/types'

export const metadata: Metadata = { title: 'Tarifs – Politiqueia' }

async function obtenirConfig(): Promise<ConfigurationPlateforme | null> {
  try {
    const supabase = await creerClientServeur()
    const { data } = await supabase.from('configuration_plateforme').select('*').single()
    return data
  } catch {
    return null
  }
}

export default async function PageTarifs() {
  const config = await obtenirConfig()

  const prixSimple    = config?.prix_pack_simple        ?? 2000
  const prixPremium   = config?.prix_pack_premium       ?? 7000
  const quotaSimple   = config?.quota_pack_simple       ?? 3
  const quotaPremium  = config?.quota_pack_premium      ?? 20
  const dureeSimple   = config?.duree_pack_simple_mois  ?? 1
  const dureePremium  = config?.duree_pack_premium_mois ?? 3

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900">
        <ArrowLeft className="h-4 w-4" />
        Retour à l&apos;accueil
      </Link>

      <div className="text-center mb-14">
        <h1 className="text-4xl font-bold text-zinc-900">Tarifs</h1>
        <p className="mt-4 text-zinc-500 max-w-xl mx-auto">
          Choisissez le forfait adapté à vos besoins d&apos;analyse de discours politiques.
          Paiement unique, sans abonnement récurrent.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 max-w-2xl mx-auto">
        {/* Pack Simple */}
        <div className="rounded-2xl border border-zinc-200 p-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
            Pack Simple
          </p>
          <p className="text-4xl font-bold text-zinc-900">{formaterPrix(prixSimple)}</p>
          <p className="text-sm text-zinc-400 mt-1">Paiement unique · {dureeSimple} mois d&apos;accès</p>

          <div className="my-6 border-t border-zinc-100" />

          <ul className="space-y-3 text-sm text-zinc-700">
            {[
              `${quotaSimple} discours analysés`,
              'Analyse IA complète',
              'Scores de persuasion et de clarté',
              'Points forts et axes d\'amélioration',
              'Support par email',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
            <li className="flex items-start gap-2 text-zinc-400">
              <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
              Reformulation IA non incluse
            </li>
          </ul>

          <Link
            href="/inscription"
            className="mt-8 flex items-center justify-center gap-2 rounded-lg border border-zinc-200 py-3 text-sm font-medium text-zinc-900 hover:bg-zinc-50 transition-colors"
          >
            Commencer
          </Link>
        </div>

        {/* Pack Premium */}
        <div className="relative rounded-2xl border-2 border-zinc-900 bg-zinc-950 p-8 text-white">
          <div className="absolute -top-3 right-6 rounded-full bg-white px-3 py-1 text-xs font-semibold text-zinc-900 shadow">
            Recommandé
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
            Pack Premium
          </p>
          <p className="text-4xl font-bold text-white">{formaterPrix(prixPremium)}</p>
          <p className="text-sm text-zinc-400 mt-1">Paiement unique · {dureePremium} mois d&apos;accès</p>

          <div className="my-6 border-t border-zinc-800" />

          <ul className="space-y-3 text-sm text-zinc-300">
            {[
              `${quotaPremium} discours analysés`,
              'Analyse IA approfondie',
              'Scores de persuasion et de clarté',
              'Points forts et axes d\'amélioration',
              'Reformulation IA incluse',
              'Variante réseaux sociaux',
              'Support prioritaire',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-zinc-500 shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>

          <Link
            href="/inscription"
            className="mt-8 flex items-center justify-center gap-2 rounded-lg bg-white py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-100 transition-colors"
          >
            Commencer maintenant
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-20 max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-zinc-900 text-center mb-10">
          Questions fréquentes
        </h2>
        <div className="space-y-6">
          {[
            {
              q: 'Comment est calculé le quota de discours ?',
              r: 'Chaque discours soumis pour évaluation IA consomme 1 crédit de votre quota. Les brouillons non soumis ne consomment pas de crédit.',
            },
            {
              q: 'La reformulation IA est-elle disponible en Pack Simple ?',
              r: 'Non, la reformulation est une fonctionnalité exclusive au Pack Premium. Elle génère une réécriture optimisée de votre discours.',
            },
            {
              q: 'Que se passe-t-il à l\'expiration de mon abonnement ?',
              r: 'Vos discours et analyses restent accessibles en lecture. Vous ne pourrez plus soumettre de nouveaux discours sans renouveler votre abonnement.',
            },
            {
              q: 'Comment souscrire à un abonnement ?',
              r: 'Après votre inscription, contactez-nous via la page Contact pour procéder au paiement et à l\'activation de votre abonnement.',
            },
          ].map(({ q, r }) => (
            <div key={q} className="rounded-xl border border-zinc-200 p-5">
              <p className="font-semibold text-zinc-900 mb-2">{q}</p>
              <p className="text-sm text-zinc-500">{r}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
