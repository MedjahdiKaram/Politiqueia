import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowLeft, CreditCard } from 'lucide-react'
import { creerClientServeur, creerClientAdmin } from '@/lib/supabase/server'
import { Carte } from '@/components/ui/Carte'
import { Badge } from '@/components/ui/Badge'
import BarreProgression from '@/components/ui/BarreProgression'
import PiedPage from '@/components/layout/PiedPage'
import { formaterDateCourte, initiales } from '@/lib/utils'
import type { Abonnement, Profil } from '@/types'

export const metadata: Metadata = { title: 'Historique abonnements' }

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PageHistoriqueAbonnements({ params }: PageProps) {
  const { id } = await params

  const supabase      = await creerClientServeur()
  const supabaseAdmin = await creerClientAdmin()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  // Vérifier que l'utilisateur connecté est admin
  const { data: profilAdmin } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single<Pick<Profil, 'role'>>()

  if (profilAdmin?.role !== 'admin') redirect('/tableau-de-bord')

  // Récupérer le profil cible
  const { data: profilCible } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single<Profil>()

  if (!profilCible) notFound()

  // Récupérer tous les abonnements de cet utilisateur
  const { data: abonnements } = await supabaseAdmin
    .from('abonnements')
    .select('*')
    .eq('user_id', id)
    .order('created_at', { ascending: false })

  const liste = (abonnements ?? []) as Abonnement[]

  const abActif       = liste.find((a) => a.actif && new Date(a.date_fin) > new Date()) ?? null
  const totalDepense  = liste.length   // approximation — pas de prix stocké
  const nbSimple      = liste.filter((a) => a.type === 'simple').length
  const nbPremium     = liste.filter((a) => a.type === 'premium').length

  return (
    <div className="flex flex-col flex-1">
      <div className="flex-1 p-8 max-w-4xl">

        {/* Fil d'Ariane */}
        <Link
          href="/admin/utilisateurs"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux utilisateurs
        </Link>

        {/* En-tête utilisateur */}
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 text-white text-lg font-bold">
            {initiales(profilCible.prenom, profilCible.nom)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">
              {profilCible.prenom} {profilCible.nom}
            </h1>
            <p className="mt-0.5 text-sm text-zinc-500">
              {profilCible.email ?? profilCible.fonction ?? '—'}
            </p>
          </div>
          <div className="ml-auto">
            <Badge variante={profilCible.actif ? 'succes' : 'erreur'}>
              {profilCible.actif ? 'Compte actif' : 'Compte désactivé'}
            </Badge>
          </div>
        </div>

        {/* Abonnement actif actuel */}
        {abActif ? (
          <Carte className="mb-6 border-l-4 border-l-green-500">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-green-600">
                  Abonnement actif
                </p>
                <h2 className="mt-1 text-lg font-bold text-zinc-900">
                  {abActif.type === 'premium' ? 'Pack Premium' : 'Pack Simple'}
                </h2>
              </div>
              <p className="text-sm text-zinc-500">
                Expire le <strong className="text-zinc-900">{formaterDateCourte(abActif.date_fin)}</strong>
              </p>
            </div>
            <BarreProgression
              valeur={abActif.quota_utilise}
              max={abActif.quota_total}
              libelle={`${abActif.quota_utilise} utilisés sur ${abActif.quota_total} discours`}
              afficherPourcentage
              couleur={
                abActif.quota_utilise >= abActif.quota_total
                  ? 'rouge'
                  : abActif.quota_total - abActif.quota_utilise < 3
                  ? 'ambre'
                  : 'zinc'
              }
            />
          </Carte>
        ) : (
          <div className="mb-6 rounded-xl border-2 border-dashed border-zinc-200 p-6 text-center">
            <CreditCard className="mx-auto h-8 w-8 text-zinc-300 mb-2" />
            <p className="text-sm font-medium text-zinc-600">Aucun abonnement actif</p>
          </div>
        )}

        {/* Récap mini-stats */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          <Carte>
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Total souscriptions</p>
            <p className="mt-1 text-3xl font-bold text-zinc-900">{liste.length}</p>
          </Carte>
          <Carte>
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Pack Simple</p>
            <p className="mt-1 text-3xl font-bold text-zinc-900">{nbSimple}</p>
          </Carte>
          <Carte>
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Pack Premium</p>
            <p className="mt-1 text-3xl font-bold text-zinc-900">{nbPremium}</p>
          </Carte>
        </div>

        {/* Historique complet */}
        <h2 className="mb-4 text-lg font-bold text-zinc-900">Historique complet</h2>
        <Carte rembourrement={false}>
          {liste.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-zinc-400">
              Aucun abonnement trouvé pour cet utilisateur.
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-100">
                  {['Type', 'Début', 'Fin', 'Utilisation', 'Statut'].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {liste.map((ab) => {
                  const estExpire   = new Date(ab.date_fin) < new Date()
                  const quotaRestant = Math.max(0, ab.quota_total - ab.quota_utilise)
                  const statut = !ab.actif
                    ? 'inactif'
                    : estExpire
                    ? 'expire'
                    : quotaRestant === 0
                    ? 'epuise'
                    : 'actif'

                  return (
                    <tr key={ab.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          ab.type === 'premium'
                            ? 'bg-zinc-900 text-white'
                            : 'bg-zinc-100 text-zinc-700'
                        }`}>
                          {ab.type === 'premium' ? 'Premium' : 'Simple'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-zinc-600">
                        {formaterDateCourte(ab.date_debut)}
                      </td>
                      <td className="px-5 py-3 text-sm text-zinc-600">
                        {formaterDateCourte(ab.date_fin)}
                      </td>
                      <td className="px-5 py-3 text-sm text-zinc-600">
                        <span className={quotaRestant === 0 ? 'text-red-500 font-medium' : ''}>
                          {ab.quota_utilise}
                        </span>
                        <span className="text-zinc-400">/{ab.quota_total}</span>
                        <span className="ml-1.5 text-xs text-zinc-400">
                          ({quotaRestant} restant{quotaRestant !== 1 ? 's' : ''})
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <Badge
                          variante={
                            statut === 'actif'   ? 'succes'
                            : statut === 'epuise' ? 'erreur'
                            : statut === 'expire' ? 'avertissement'
                            : 'defaut'
                          }
                        >
                          {statut === 'actif'   ? 'Actif'
                           : statut === 'epuise' ? 'Quota épuisé'
                           : statut === 'expire' ? 'Expiré'
                           : 'Inactif'}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </Carte>
      </div>
      <PiedPage />
    </div>
  )
}
