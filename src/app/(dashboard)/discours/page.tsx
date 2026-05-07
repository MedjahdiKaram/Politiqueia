import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { FilePlus } from 'lucide-react'
import { creerClientServeur, creerClientAdmin } from '@/lib/supabase/server'
import { BadgeStatut } from '@/components/ui/Badge'
import { Carte } from '@/components/ui/Carte'
import PiedPage from '@/components/layout/PiedPage'
import { formaterDateCourte, enrichirAbonnement, initiales } from '@/lib/utils'
import type { Abonnement, Discours, Profil } from '@/types'

export const metadata: Metadata = { title: 'Mes discours' }

interface DiscoursAvecProfil extends Discours {
  profiles: Pick<Profil, 'nom' | 'prenom'> | null
}

export default async function PageDiscours() {
  const supabase      = await creerClientServeur()
  const supabaseAdmin = await creerClientAdmin()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  // Rôle de l'utilisateur connecté
  const { data: profil } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single<Pick<Profil, 'role'>>()

  const estAdmin = profil?.role === 'admin'

  // Admin → tous les discours + profil auteur ; client → les siens uniquement
  const requeteDiscours = estAdmin
    ? supabaseAdmin
        .from('discours')
        .select('*, profiles(nom, prenom)')
        .order('created_at', { ascending: false })
    : supabaseAdmin
        .from('discours')
        .select('*, profiles(nom, prenom)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

  const [{ data: discours }, { data: abonnement }] = await Promise.all([
    requeteDiscours,
    estAdmin
      ? Promise.resolve({ data: null })
      : supabaseAdmin
          .from('abonnements')
          .select('*')
          .eq('user_id', user.id)
          .eq('actif', true)
          .order('date_fin', { ascending: false })
          .limit(1)
          .single<Abonnement>(),
  ])

  const liste = (discours ?? []) as DiscoursAvecProfil[]
  const ab    = abonnement ? enrichirAbonnement(abonnement as Abonnement) : null

  return (
    <div className="flex flex-col flex-1">
      <div className="flex-1 p-8">
        {/* En-tête */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">
              {estAdmin ? 'Tous les discours' : 'Mes discours'}
            </h1>
            {estAdmin ? (
              <p className="mt-1 text-sm text-zinc-500">
                Vue administrateur — {liste.length} discours sur la plateforme
              </p>
            ) : ab ? (
              <p className="mt-1 text-sm text-zinc-500">
                {ab.quota_restant} discours restants · Fin du pack le{' '}
                {formaterDateCourte(ab.date_fin)}
              </p>
            ) : null}
          </div>
          {!estAdmin && (
            <Link
              href="/discours/nouveau"
              className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
            >
              <FilePlus className="h-4 w-4" />
              Nouveau discours
            </Link>
          )}
        </div>

        {/* Tableau */}
        <Carte rembourrement={false}>
          {/* En-têtes */}
          <div className="px-6 py-3 border-b border-zinc-100">
            <div className={`grid gap-4 text-xs font-medium uppercase tracking-wider text-zinc-400 ${estAdmin ? 'grid-cols-12' : 'grid-cols-12'}`}>
              <span className={estAdmin ? 'col-span-3' : 'col-span-5'}>Nom du discours</span>
              {estAdmin && (
                <span className="col-span-2">Utilisateur</span>
              )}
              <span className="col-span-2">Statut</span>
              <span className={estAdmin ? 'col-span-3' : 'col-span-3'}>Dernière modification</span>
              <span className="col-span-2 text-right">Actions</span>
            </div>
          </div>

          {liste.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <FilePlus className="mx-auto h-10 w-10 text-zinc-300" />
              <p className="mt-3 font-medium text-zinc-700">Aucun discours</p>
              <p className="mt-1 text-sm text-zinc-400">
                {estAdmin
                  ? 'Aucun discours sur la plateforme pour le moment.'
                  : "Créez votre premier discours pour commencer l'analyse."}
              </p>
              {!estAdmin && (!ab || ab.quota_restant > 0) && (
                <Link
                  href="/discours/nouveau"
                  className="mt-4 inline-block rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700"
                >
                  Créer un discours
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-zinc-50">
              {liste.map((d) => (
                <div
                  key={d.id}
                  className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-zinc-50 transition-colors items-center"
                >
                  {/* Nom du discours */}
                  <div className={estAdmin ? 'col-span-3' : 'col-span-5'}>
                    <Link
                      href={`/discours/${d.id}`}
                      className="font-medium text-zinc-900 hover:underline text-sm block truncate"
                    >
                      {d.nom}
                    </Link>
                  </div>

                  {/* Colonne Utilisateur (admin seulement) */}
                  {estAdmin && (
                    <div className="col-span-2">
                      {d.profiles ? (
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-[10px] font-medium text-zinc-600">
                            {initiales(d.profiles.prenom, d.profiles.nom)}
                          </div>
                          <span className="text-xs text-zinc-600 truncate">
                            {d.profiles.prenom} {d.profiles.nom}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-400">–</span>
                      )}
                    </div>
                  )}

                  {/* Statut */}
                  <div className="col-span-2">
                    <BadgeStatut statut={d.statut} />
                  </div>

                  {/* Date */}
                  <div className="col-span-3 text-sm text-zinc-500">
                    {formaterDateCourte(d.updated_at)}
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 flex justify-end gap-2">
                    <Link
                      href={`/discours/${d.id}`}
                      className="rounded px-2.5 py-1 text-xs text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors border border-zinc-200"
                    >
                      Voir
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {liste.length > 0 && (
            <div className="px-6 py-3 border-t border-zinc-100">
              <p className="text-xs text-zinc-400">
                {liste.length} discours affichés
              </p>
            </div>
          )}
        </Carte>
      </div>
      <PiedPage />
    </div>
  )
}
