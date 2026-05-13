import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import LinkBouton from '@/components/ui/LinkBouton'

export default function PageIntrouvable() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="text-center">
        <Image
          src="/Logo_ideoscole.png"
          alt="Idéoscope"
          width={130}
          height={38}
          className="object-contain mx-auto mb-8"
        />
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">
          Erreur 404
        </p>
        <h1 className="text-4xl font-bold text-slate-900">Page introuvable</h1>
        <p className="mt-4 text-slate-500 max-w-sm mx-auto">
          La page que vous recherchez n&apos;existe pas ou a été déplacée.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <LinkBouton
            href="/"
            variante="primaire"
            taille="md"
            className="px-5"
            iconGauche={<ArrowLeft className="h-4 w-4" />}
          >
            Retour à l&apos;accueil
          </LinkBouton>
          <LinkBouton
            href="/tableau-de-bord"
            variante="contour"
            taille="md"
            className="px-5"
          >
            Tableau de bord
          </LinkBouton>
        </div>
      </div>
    </div>
  )
}
