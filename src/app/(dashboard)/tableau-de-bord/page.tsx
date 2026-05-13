import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { FilePlus, TrendingUp, Clock, CheckCircle } from 'lucide-react'
import LinkBouton from '@/components/ui/LinkBouton'
import { creerClientServeur, creerClientAdmin } from '@/lib/supabase/server'
import { abonnementEstValide } from '@/lib/abonnement'
import { BadgeStatut } from '@/components/ui/Badge'
import { Carte } from '@/components/ui/Carte'
import BarreProgression from '@/components/ui/BarreProgression'
import PiedPage from '@/components/layout/PiedPage'
import { formaterDateCourte, enrichirAbonnement } from '@/lib/utils'
import type { Abonnement, Discours, Profil } from '@/types'

export const metadata: Metadata = { title: 'Tableau de bord' }

export default async function PageTableauBord() {
  const supabase = await creerClientServeur()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const supabaseAdmin = await creerClientAdmin()

  // Vérifier le rôle : les admins ne sont pas soumis à la vérification d'abonnement
  const { data: profil } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single<Pick<Profil, 'role'>>()

  // Abonnement actif
  const { data: abonnement } = await supabaseAdmin
    .from('abonnements')
    .select('*')
    .eq('user_id', user.id)
    .eq('actif', true)
    .order('date_fin', { ascending: false })
    .limit(1)
    .single<Abonnement>()

  // Forcer le choix de pack pour les clients sans abonnement valide
  if (profil?.role !== 'admin' && !abonnementEstValide(abonnement)) {
    redirect('/choisir-pack')
  }

  // Discours récents
  const { data: discours } = await supabaseAdmin
    .from('discours')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const ab = abonnement ? enrichirAbonnement(abonnement) : null
  const listeDiscours = (discours ?? []) as Discours[]

  const nbAnalyses  = listeDiscours.filter((d) => d.statut === 'analyse').length
  const nbEnCours   = listeDiscours.filter((d) => d.statut === 'en_cours' || d.statut === 'soumis').length

  return (
    <div className="flex flex-col flex-1">
      <div className="flex-1 p-8">
        {/* En-tête */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Mes corpus</h1>
            <p className="mt-1 text-sm text-slate-500">
              Gérez et suivez vos analyses de corpus discursifs.
            </p>
          </div>
          <div className="flex items-center gap-6">
            {ab && (
              <div className="text-right">
                <p className="text-xs text-slate-500 uppercase tracking-wider">Corpus restants</p>
                <p className="text-2xl font-bold text-slate-900">
                  {ab.quota_restant}{' '}
                  <span className="text-base font-normal text-slate-400">/ {ab.quota_total}</span>
                </p>
              </div>
            )}
            {ab && (
              <div className="text-right">
                <p className="text-xs text-slate-500 uppercase tracking-wider">Fin du pack</p>
                <p className="text-base font-semibold text-slate-900">
                  {formaterDateCourte(ab.date_fin)}
                </p>
              </div>
            )}
            <LinkBouton
              href="/discours/nouveau"
              variante="primaire"
              taille="md"
              iconGauche={<FilePlus className="h-4 w-4" />}
            >
              Nouveau corpus
            </LinkBouton>
          </div>
        </div>

        {/* Statistiques */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Carte>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-slate-100 p-2.5">
                <CheckCircle className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Analyses terminées</p>
                <p className="text-2xl font-bold text-slate-900">{nbAnalyses}</p>
              </div>
            </div>
          </Carte>
          <Carte>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-50 p-2.5">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">En cours de traitement</p>
                <p className="text-2xl font-bold text-slate-900">{nbEnCours}</p>
              </div>
            </div>
          </Carte>
          <Carte>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-slate-100 p-2.5">
                <TrendingUp className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Total corpus</p>
                <p className="text-2xl font-bold text-slate-900">{listeDiscours.length}</p>
              </div>
            </div>
          </Carte>
        </div>

        {/* Quota abonnement */}
        {ab && (
          <Carte className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-slate-900">Quota d&apos;abonnement</h2>
              <span className="text-xs text-slate-500">
                Expire le {formaterDateCourte(ab.date_fin)}
                {ab.est_expire && (
                  <span className="ml-2 text-red-500 font-medium">· Expiré</span>
                )}
              </span>
            </div>
            <BarreProgression
              valeur={ab.quota_utilise}
              max={ab.quota_total}
              afficherPourcentage
              libelle={`${ab.quota_utilise} discours utilisés sur ${ab.quota_total}`}
              couleur={ab.quota_restant === 0 ? 'rouge' : ab.quota_restant < 3 ? 'ambre' : 'zinc'}
            />
          </Carte>
        )}

        {/* Liste des discours récents */}
        <Carte rembourrement={false}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
            <h2 className="font-semibold text-slate-900">Historique des corpus</h2>
            <Link href="/discours" className="text-xs text-slate-500 hover:text-slate-900">
              Voir tout →
            </Link>
          </div>

          {listeDiscours.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <FilePlus className="mx-auto h-10 w-10 text-zinc-300" />
              <p className="mt-3 font-medium text-zinc-700">Aucun discours pour le moment</p>
              <p className="mt-1 text-sm text-slate-400">
                Commencez par créer votre première analyse.
              </p>
              <LinkBouton
                href="/discours/nouveau"
                variante="primaire"
                taille="sm"
                className="mt-4"
              >
                Créer un discours
              </LinkBouton>
            </div>
          ) : (
            <div className="divide-y divide-zinc-50">
              {/* En-tête tableau */}
              <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-medium uppercase tracking-wider text-slate-400">
                <span className="col-span-5">Nom du discours</span>
                <span className="col-span-2">Statut</span>
                <span className="col-span-3">Dernière modification</span>
                <span className="col-span-2 text-right">Actions</span>
              </div>
              {listeDiscours.map((d) => (
                <div
                  key={d.id}
                  className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-zinc-50 transition-colors items-center"
                >
                  <div className="col-span-5">
                    <Link
                      href={`/discours/${d.id}`}
                      className="font-medium text-slate-900 hover:underline text-sm"
                    >
                      {d.nom}
                    </Link>
                  </div>
                  <div className="col-span-2">
                    <BadgeStatut statut={d.statut} />
                  </div>
                  <div className="col-span-3 text-sm text-slate-500">
                    {formaterDateCourte(d.updated_at)}
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <Link
                      href={`/discours/${d.id}`}
                      className="rounded px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                    >
                      Voir →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Carte>

        {/* Bannière aide */}
        {!ab && (
          <div className="mt-8 rounded-xl bg-slate-900 text-white p-6 flex items-center justify-between">
            <div>
              <p className="font-semibold">Accédez à l&apos;analyse discursive complète</p>
              <p className="mt-1 text-sm text-slate-400">
                Souscrivez à un forfait pour accéder aux analyses discursives.
              </p>
            </div>
            <LinkBouton
              href="/abonnement"
              variante="secondaire"
              taille="sm"
            >
              Voir les offres
            </LinkBouton>
          </div>
        )}
      </div>
      <PiedPage />
    </div>
  )
}
