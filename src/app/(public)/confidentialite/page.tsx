import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Politique de confidentialité – Politiqueia',
}

export default function PageConfidentialite() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900">
        <ArrowLeft className="h-4 w-4" />
        Retour à l&apos;accueil
      </Link>

      <h1 className="text-3xl font-bold text-zinc-900 mb-2">Politique de confidentialité</h1>
      <p className="text-sm text-zinc-400 mb-10">Dernière mise à jour : janvier 2024</p>

      <div className="space-y-8 text-sm text-zinc-700 leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-zinc-900 mb-3">Données collectées</h2>
          <p>
            Lors de votre inscription, nous collectons : nom, prénom, fonction, adresse email et
            numéro de téléphone. Ces données sont nécessaires au fonctionnement du service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900 mb-3">Utilisation des données</h2>
          <p>Vos données personnelles sont utilisées pour :</p>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Gérer votre compte et votre abonnement</li>
            <li>Traiter et analyser vos discours via l&apos;IA</li>
            <li>Vous contacter en cas de besoin</li>
            <li>Améliorer la plateforme</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900 mb-3">Contenus des discours</h2>
          <p>
            Les discours soumis à l&apos;analyse sont transmis à l&apos;API OpenAI pour traitement.
            Ils ne sont pas utilisés pour entraîner des modèles tiers. Les résultats d&apos;analyse
            sont stockés sur nos serveurs sécurisés (Supabase) pendant la durée de votre compte.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900 mb-3">Sécurité</h2>
          <p>
            Vos données sont protégées par Row Level Security (RLS) côté base de données. Chaque
            utilisateur n&apos;a accès qu&apos;à ses propres données. Les communications sont
            chiffrées via HTTPS.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900 mb-3">Droits des utilisateurs</h2>
          <p>
            Vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression de vos
            données personnelles. Pour exercer ces droits, contactez-nous via la page{' '}
            <Link href="/contact" className="text-zinc-900 underline">Contact</Link>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900 mb-3">Cookies</h2>
          <p>
            Politiqueia utilise des cookies de session strictement nécessaires au fonctionnement
            de l&apos;authentification. Aucun cookie publicitaire ou de traçage n&apos;est utilisé.
          </p>
        </section>
      </div>
    </div>
  )
}
