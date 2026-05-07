import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, FileText, Zap, CreditCard, Settings, MessageCircle } from 'lucide-react'

export const metadata: Metadata = { title: 'Aide – Politiqueia' }

const RUBRIQUES = [
  {
    icon: FileText,
    titre: 'Créer et soumettre un discours',
    contenu: [
      'Cliquez sur « Nouveau discours » dans le menu latéral.',
      'Donnez un nom à votre discours, puis saisissez le contenu dans l\'éditeur.',
      'Sauvegardez votre discours à tout moment avec le bouton « Sauvegarder ».',
      'Une fois satisfait, cliquez sur « Demander l\'évaluation » pour lancer l\'analyse IA.',
      'Après soumission, le discours n\'est plus modifiable.',
    ],
  },
  {
    icon: Zap,
    titre: 'Comprendre les résultats d\'analyse',
    contenu: [
      'Score de persuasion : mesure la force rhétorique de votre discours (0 à 100).',
      'Indice de clarté : évalue la lisibilité et la cohérence du message (0 à 100).',
      'Points forts : aspects positifs identifiés par l\'IA.',
      'Axes d\'amélioration : pistes concrètes pour renforcer le discours.',
      'Reformulation (Premium) : proposition de réécriture optimisée.',
    ],
  },
  {
    icon: CreditCard,
    titre: 'Gestion de l\'abonnement',
    contenu: [
      'Consultez votre quota restant dans l\'onglet « Abonnement ».',
      'Le quota indique le nombre de discours que vous pouvez encore soumettre.',
      'Votre abonnement expire à la date indiquée ; renouvelez-le via la page Contact.',
      'Les brouillons non soumis ne consomment pas de quota.',
    ],
  },
  {
    icon: Settings,
    titre: 'Paramètres du compte',
    contenu: [
      'Pour réinitialiser votre mot de passe, déconnectez-vous et cliquez sur « Mot de passe oublié ».',
      'Pour modifier vos informations personnelles, contactez l\'administrateur.',
    ],
  },
]

export default function PageAide() {
  return (
    <div className="ml-56 flex-1 p-8">
      <Link
        href="/tableau-de-bord"
        className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour au tableau de bord
      </Link>

      <h1 className="text-2xl font-bold text-zinc-900 mb-1">Centre d&apos;aide</h1>
      <p className="text-sm text-zinc-500 mb-10">
        Tout ce qu&apos;il faut savoir pour utiliser Politiqueia efficacement.
      </p>

      <div className="max-w-2xl space-y-6">
        {RUBRIQUES.map(({ icon: Icon, titre, contenu }) => (
          <div key={titre} className="rounded-xl border border-zinc-200 bg-white p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-lg bg-zinc-100 p-2">
                <Icon className="h-5 w-5 text-zinc-600" />
              </div>
              <h2 className="font-semibold text-zinc-900">{titre}</h2>
            </div>
            <ol className="space-y-2 pl-2">
              {contenu.map((item, i) => (
                <li key={i} className="flex gap-2 text-sm text-zinc-600">
                  <span className="font-medium text-zinc-400 shrink-0">{i + 1}.</span>
                  {item}
                </li>
              ))}
            </ol>
          </div>
        ))}

        {/* Contacter le support */}
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 flex items-start gap-4">
          <MessageCircle className="h-6 w-6 text-zinc-400 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-zinc-900">Besoin d&apos;aide supplémentaire ?</p>
            <p className="text-sm text-zinc-500 mt-1">
              Notre équipe répond à vos questions via la page Contact.
            </p>
            <Link
              href="/contact"
              className="mt-3 inline-block rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
            >
              Contacter le support
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
