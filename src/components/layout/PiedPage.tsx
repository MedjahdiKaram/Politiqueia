import Link from 'next/link'
import Image from 'next/image'

export default function PiedPage() {
  return (
    <footer className="border-t border-slate-200 bg-white py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex flex-col items-center gap-1 sm:items-start">
            <Image
              src="/Logo_ideoscole.png"
              alt="Idéoscope"
              width={110}
              height={32}
              className="object-contain mb-0.5"
            />
            <span className="text-xs text-slate-500">
              © {new Date().getFullYear()} Idéoscope. Analyse discursive & IA.
            </span>
            <span className="text-xs text-slate-400">
              Réalisé pour le PFE Startup – Master – UABT – Par{' '}
              <strong className="text-slate-600">Hind Chohra</strong>
            </span>
          </div>

          <nav className="flex flex-wrap justify-center gap-4 text-xs text-slate-500">
            <Link href="/mentions-legales" className="hover:text-slate-900 transition-colors">
              Mentions légales
            </Link>
            <Link href="/confidentialite" className="hover:text-slate-900 transition-colors">
              Confidentialité
            </Link>
            <Link href="/tarifs" className="hover:text-slate-900 transition-colors">
              Tarifs
            </Link>
            <Link href="/contact" className="hover:text-slate-900 transition-colors">
              Contact
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
