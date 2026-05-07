import Link from 'next/link'

export default function PiedPage() {
  return (
    <footer className="border-t border-zinc-200 bg-white py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex flex-col items-center gap-1 sm:items-start">
            <span className="text-sm font-semibold text-zinc-900">Politiqueia</span>
            <span className="text-xs text-zinc-500">
              © 2024 Politiqueia. Expertise et Analyse Politique.
            </span>
            <span className="text-xs text-zinc-400">
              Réalisé pour le PFE Startup – Master – UABT – Par{' '}
              <strong className="text-zinc-600">Hind Chohra</strong>
            </span>
          </div>

          <nav className="flex flex-wrap justify-center gap-4 text-xs text-zinc-500">
            <Link href="/mentions-legales" className="hover:text-zinc-900 transition-colors">
              Mentions Légales
            </Link>
            <Link href="/confidentialite" className="hover:text-zinc-900 transition-colors">
              Confidentialité
            </Link>
            <Link href="/tarifs" className="hover:text-zinc-900 transition-colors">
              Tarifs
            </Link>
            <Link href="/contact" className="hover:text-zinc-900 transition-colors">
              Contact
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
