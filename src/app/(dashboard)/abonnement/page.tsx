import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { CheckCircle } from 'lucide-react'
import { creerClientServeur, creerClientAdmin } from '@/lib/supabase/server'
import { Carte } from '@/components/ui/Carte'
import { Badge } from '@/components/ui/Badge'
import BarreProgression from '@/components/ui/BarreProgression'
import PiedPage from '@/components/layout/PiedPage'
import BoutonSouscrire from '@/components/abonnement/BoutonSouscrire'
import { formaterDateCourte, formaterPrix, enrichirAbonnement } from '@/lib/utils'
import type { Abonnement, ConfigurationPlateforme } from '@/types'

export const metadata: Metadata = { title: 'Mon abonnement' }

export default async function PageAbonnement() {
  const supabase      = await creerClientServeur()
  const supabaseAdmin = await creerClientAdmin()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const [{ data: abonnement }, { data: historique }, { data: config }] = await Promise.all([
    supabaseAdmin
      .from('abonnements')
      .select('*')
      .eq('user_id', user.id)
      .eq('actif', true)
      .order('date_fin', { ascending: false })
      .limit(1)
      .single<Abonnement>(),
    supabaseAdmin
      .from('abonnements')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10),
    supabaseAdmin
      .from('configuration_plateforme')
      .select('*')
      .single<ConfigurationPlateforme>(),
  ])

  const ab = abonnement ? enrichirAbonnement(abonnement) : null
  const listeHistorique = (historique ?? []) as Abonnement[]

  return (
    <div className="flex flex-col flex-1">
      <div className="flex-1 p-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900">Mon abonnement</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Gérez votre abonnement et vos quotas d&apos;analyse.
          </p>
        </div>

        {/* Abonnement actif */}
        {ab ? (
          <Carte className="mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <Badge variante={ab.est_expire ? 'erreur' : 'succes'}>
                  {ab.est_expire ? 'Expiré' : 'Actif'}
                </Badge>
                <h2 className="mt-2 text-lg font-bold text-zinc-900">
                  {ab.type === 'premium' ? 'Accès Recherche' : 'Accès Essentiel'}
                </h2>
              </div>
              <div className="text-right">
                <p className="text-xs text-zinc-500">Expire le</p>
                <p className="font-semibold text-zinc-900">{formaterDateCourte(ab.date_fin)}</p>
                {!ab.est_expire && (
                  <p className="text-xs text-zinc-400">{ab.jours_restants} jour(s) restant(s)</p>
                )}
              </div>
            </div>
            <BarreProgression
              valeur={ab.quota_utilise}
              max={ab.quota_total}
              libelle={`${ab.quota_utilise} utilisés sur ${ab.quota_total} discours`}
              afficherPourcentage
              couleur={ab.quota_restant === 0 ? 'rouge' : 'zinc'}
            />
            <p className="mt-3 text-sm text-zinc-500">
              <strong className="text-zinc-900">{ab.quota_restant}</strong> discours restants
            </p>
          </Carte>
        ) : (
          <div className="mb-6 rounded-xl border-2 border-dashed border-zinc-200 p-8 text-center">
            <p className="font-medium text-zinc-700">Aucun abonnement actif</p>
            <p className="mt-1 text-sm text-zinc-400">
              Souscrivez à un forfait pour commencer à analyser vos corpus.
            </p>
          </div>
        )}

        {/* Offres */}
        <h2 className="mb-4 text-lg font-bold text-zinc-900">Nos forfaits</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-8">
          {[
            {
              type:     'simple' as const,
              titre:    'Accès Essentiel',
              prix:     config?.prix_pack_simple  ?? 2000,
              quota:    config?.quota_pack_simple  ?? 3,
              duree:    `${config?.duree_pack_simple_mois  ?? 1} mois`,
              features: [
                `${config?.quota_pack_simple ?? 3} corpus analysés`,
                'Analyse IA complète',
                'Support standard',
              ],
              inclutReformulation: false,
            },
            {
              type:     'premium' as const,
              titre:    'Accès Recherche',
              prix:     config?.prix_pack_premium ?? 7000,
              quota:    config?.quota_pack_premium ?? 20,
              duree:    `${config?.duree_pack_premium_mois ?? 3} mois`,
              features: [
                `${config?.quota_pack_premium ?? 20} corpus analysés`,
                'Analyse IA approfondie',
                'Reformulation IA incluse',
                'Support prioritaire',
              ],
              inclutReformulation: true,
            },
          ].map((pack) => (
            <div
              key={pack.type}
              className={`rounded-xl border p-6 ${
                pack.type === 'premium'
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-zinc-200'
              }`}
            >
              <p className={`text-xs font-semibold uppercase tracking-wider ${pack.type === 'premium' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                {pack.titre}
              </p>
              <p className={`mt-2 text-3xl font-bold ${pack.type === 'premium' ? 'text-white' : 'text-zinc-900'}`}>
                {formaterPrix(pack.prix)}
              </p>
              <p className={`text-xs mt-1 ${pack.type === 'premium' ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Valable {pack.duree}
              </p>
              <ul className="mt-4 space-y-2">
                {pack.features.map((f) => (
                  <li key={f} className={`flex items-center gap-2 text-sm ${pack.type === 'premium' ? 'text-zinc-300' : 'text-zinc-600'}`}>
                    <CheckCircle className={`h-4 w-4 shrink-0 ${pack.type === 'premium' ? 'text-zinc-500' : 'text-zinc-400'}`} />
                    {f}
                  </li>
                ))}
              </ul>
              <BoutonSouscrire typePack={pack.type} estPremium={pack.type === 'premium'} />
            </div>
          ))}
        </div>

        {/* Historique */}
        {listeHistorique.length > 0 && (
          <div>
            <h2 className="mb-4 text-lg font-bold text-zinc-900">Historique des abonnements</h2>
            <Carte rembourrement={false}>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-100">
                    {['Type', 'Début', 'Fin', 'Discours', 'Statut'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {listeHistorique.map((a) => (
                    <tr key={a.id} className="hover:bg-zinc-50">
                      <td className="px-4 py-3 text-sm font-medium text-zinc-900">
                        {a.type === 'premium' ? 'Premium' : 'Simple'}
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-500">
                        {formaterDateCourte(a.date_debut)}
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-500">
                        {formaterDateCourte(a.date_fin)}
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-500">
                        {a.quota_utilise}/{a.quota_total}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variante={a.actif ? 'succes' : 'defaut'}>
                          {a.actif ? 'Actif' : 'Expiré'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Carte>
          </div>
        )}
      </div>
      <PiedPage />
    </div>
  )
}
