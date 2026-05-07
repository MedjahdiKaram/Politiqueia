import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Mentions légales – Politiqueia',
}

export default function PageMentionsLegales() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à l&apos;accueil
      </Link>

      <h1 className="text-3xl font-bold text-zinc-900 mb-2">Mentions légales</h1>
      <p className="text-sm text-zinc-400 mb-10">Dernière mise à jour : janvier 2024</p>

      <div className="prose prose-zinc max-w-none space-y-8 text-sm text-zinc-700 leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-zinc-900 mb-3">Éditeur</h2>
          <p>
            Politiqueia est une plateforme académique développée dans le cadre d&apos;un Projet de
            Fin d&apos;Études (PFE) Startup – Master – Université Abou Bekr Belkaïd Tlemcen (UABT),
            par <strong>Hind Chohra</strong>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900 mb-3">Hébergement</h2>
          <p>
            L&apos;application est hébergée sur la plateforme <strong>Vercel, Inc.</strong>, 340
            Pine Street, Suite 700, San Francisco, CA 94104, États-Unis.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900 mb-3">
            Propriété intellectuelle
          </h2>
          <p>
            L&apos;ensemble des contenus présents sur Politiqueia (code source, design, textes,
            logos) sont protégés par le droit de la propriété intellectuelle. Toute reproduction,
            même partielle, est interdite sans autorisation préalable.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900 mb-3">Responsabilité</h2>
          <p>
            Les analyses générées par l&apos;intelligence artificielle sont fournies à titre
            indicatif. Politiqueia ne saurait être tenu responsable de l&apos;utilisation qui est
            faite des résultats d&apos;analyse par les utilisateurs.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-zinc-900 mb-3">Contact</h2>
          <p>
            Pour toute question relative à ces mentions légales, contactez-nous via la page{' '}
            <Link href="/contact" className="text-zinc-900 underline">
              Contact
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  )
}
