'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus, Filter, RotateCcw, UserX, UserCheck, History } from 'lucide-react'
import { Carte } from '@/components/ui/Carte'
import { Badge } from '@/components/ui/Badge'
import Bouton, { SpinnerBouton } from '@/components/ui/Bouton'
import LinkBouton from '@/components/ui/LinkBouton'
import { formaterDateCourte, initiales } from '@/lib/utils'
import type { StatsAdmin } from '@/types'

interface UtilisateurAvecAbonnement {
  id: string
  nom: string
  prenom: string
  email?: string
  telephone: string | null
  role: string
  actif: boolean
  created_at: string
  abonnements: Array<{
    type: string
    quota_total: number
    quota_utilise: number
    date_fin: string
    actif: boolean
  }>
}

interface PropsTableau {
  utilisateurs: UtilisateurAvecAbonnement[]
  stats: StatsAdmin
}

export default function TableauUtilisateurs({ utilisateurs, stats }: PropsTableau) {
  const router = useRouter()
  const [action, setAction] = useState<string | null>(null)

  const obtenirAbonnementActif = (u: UtilisateurAvecAbonnement) =>
    u.abonnements?.find((a) => a.actif) ?? null

  async function toggleActif(id: string, actifActuel: boolean) {
    setAction(id)
    try {
      await fetch(`/api/admin/utilisateurs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actif: !actifActuel }),
      })
      router.refresh()
    } finally {
      setAction(null)
    }
  }

  async function reinitialiserMdp(id: string, email: string) {
    if (!confirm(`Envoyer un email de réinitialisation à ${email} ?`)) return
    setAction(id)
    try {
      await fetch(`/api/admin/utilisateurs/${id}/reset-password`, { method: 'POST' })
      alert('Email de réinitialisation envoyé.')
    } finally {
      setAction(null)
    }
  }

  return (
    <div>
      {/* En-tête */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Gestion des utilisateurs</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Supervisez les accès, les abonnements et les quotas d&apos;analyse de la plateforme.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Bouton variante="contour" taille="sm" iconGauche={<Filter className="h-3.5 w-3.5" />}>
            Filtrer
          </Bouton>
          <Bouton taille="sm" iconGauche={<UserPlus className="h-3.5 w-3.5" />}>
            Inviter
          </Bouton>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 max-w-md">
        <Carte>
          <p className="text-xs text-zinc-500 uppercase tracking-wider">Total utilisateurs</p>
          <p className="mt-1 text-3xl font-bold text-zinc-900">
            {stats.total_utilisateurs.toLocaleString('fr-FR')}
          </p>
        </Carte>
        <Carte>
          <p className="text-xs text-zinc-500 uppercase tracking-wider">Abonnements actifs</p>
          <p className="mt-1 text-3xl font-bold text-zinc-900">
            {stats.abonnements_actifs.toLocaleString('fr-FR')}
          </p>
        </Carte>
      </div>

      {/* Tableau */}
      <Carte rembourrement={false}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100">
                {['Nom', 'Prénom', 'Email', 'Téléphone', 'Fin d\'abonnement', 'Discours restants', 'Abonnements', 'Actions'].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {utilisateurs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-zinc-400">
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              ) : (
                utilisateurs.map((u) => {
                  const ab = obtenirAbonnementActif(u)
                  const quotaRestant = ab
                    ? Math.max(0, ab.quota_total - ab.quota_utilise)
                    : null
                  const estExpire = ab
                    ? new Date(ab.date_fin) < new Date()
                    : false

                  return (
                    <tr key={u.id} className={`hover:bg-zinc-50 transition-colors ${!u.actif ? 'opacity-60' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-medium text-zinc-600">
                            {initiales(u.prenom, u.nom)}
                          </div>
                          <span className="font-medium text-sm text-zinc-900">{u.nom}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-700">{u.prenom}</td>
                      <td className="px-4 py-3 text-sm text-zinc-500">{u.email ?? '–'}</td>
                      <td className="px-4 py-3 text-sm text-zinc-500">{u.telephone ?? '–'}</td>
                      <td className="px-4 py-3 text-sm">
                        {ab ? (
                          <span className={estExpire ? 'text-red-500 font-medium' : 'text-zinc-700'}>
                            {estExpire ? 'Expiré' : formaterDateCourte(ab.date_fin)}
                          </span>
                        ) : (
                          <span className="text-zinc-400">–</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {quotaRestant !== null ? (
                          <Badge variante={quotaRestant === 0 ? 'erreur' : quotaRestant < 3 ? 'avertissement' : 'succes'}>
                            {quotaRestant}
                          </Badge>
                        ) : (
                          <span className="text-zinc-400">–</span>
                        )}
                      </td>
                      {/* Bouton historique abonnements */}
                      <td className="px-4 py-3">
                        <LinkBouton
                          href={`/admin/utilisateurs/${u.id}/abonnements`}
                          variante="contour"
                          taille="sm"
                          iconGauche={<History className="h-3.5 w-3.5" />}
                          className="whitespace-nowrap text-xs"
                        >
                          Historique
                        </LinkBouton>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => reinitialiserMdp(u.id, u.email ?? '')}
                            disabled={action === u.id}
                            className="rounded p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors disabled:opacity-40"
                            title="Réinitialiser le mot de passe"
                          >
                            {action === u.id
                              ? <SpinnerBouton classe="text-zinc-400" />
                              : <RotateCcw className="h-4 w-4" />
                            }
                          </button>
                          <button
                            onClick={() => toggleActif(u.id, u.actif)}
                            disabled={action === u.id}
                            className="rounded p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors disabled:opacity-40"
                            title={u.actif ? 'Désactiver le compte' : 'Activer le compte'}
                          >
                            {action === u.id ? (
                              <SpinnerBouton classe="text-zinc-400" />
                            ) : u.actif ? (
                              <UserX className="h-4 w-4" />
                            ) : (
                              <UserCheck className="h-4 w-4 text-green-600" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {utilisateurs.length > 0 && (
          <div className="px-4 py-3 border-t border-zinc-100">
            <p className="text-xs text-zinc-400">
              Affichage 1 à {utilisateurs.length} sur {stats.total_utilisateurs} utilisateurs
            </p>
          </div>
        )}
      </Carte>
    </div>
  )
}
