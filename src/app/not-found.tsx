import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PageIntrouvable() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-4">
          Erreur 404
        </p>
        <h1 className="text-4xl font-bold text-zinc-900">Page introuvable</h1>
        <p className="mt-4 text-zinc-500 max-w-sm mx-auto">
          La page que vous recherchez n&apos;existe pas ou a été déplacée.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à l&apos;accueil
          </Link>
          <Link
            href="/tableau-de-bord"
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
          >
            Tableau de bord
          </Link>
        </div>
      </div>
    </div>
  )
}
