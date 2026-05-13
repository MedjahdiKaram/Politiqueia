import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { User, Mail, Phone, Briefcase, ShieldCheck, CalendarDays } from 'lucide-react'
import { creerClientServeur, creerClientAdmin } from '@/lib/supabase/server'
import { Carte } from '@/components/ui/Carte'
import { Badge } from '@/components/ui/Badge'
import BarreProgression from '@/components/ui/BarreProgression'
import PiedPage from '@/components/layout/PiedPage'
import { formaterDateCourte, enrichirAbonnement, initiales } from '@/lib/utils'
import type { Abonnement, Profil } from '@/types'

export const metadata: Metadata = { title: 'Mon profil' }

export default async function PageProfil() {
  const supabase      = await creerClientServeur()
  const supabaseAdmin = await creerClientAdmin()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/connexion')

  const { data: profil } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single<Profil>()

  if (!profil) redirect('/connexion')

  const { data: abonnement } = await supabaseAdmin
    .from('abonnements')
    .select('*')
    .eq('user_id', user.id)
    .eq('actif', true)
    .order('date_fin', { ascending: false })
    .limit(1)
    .single<Abonnement>()

  const ab = abonnement ? enrichirAbonnement(abonnement) : null

  const champs = [
    { icon: User,        libelle: 'Prénom',      valeur: profil.prenom },
    { icon: User,        libelle: 'Nom',          valeur: profil.nom },
    { icon: Mail,        libelle: 'Email',         valeur: profil.email ?? user.email },
    { icon: Phone,       libelle: 'Téléphone',     valeur: profil.telephone ?? '—' },
    { icon: Briefcase,   libelle: 'Affiliation',   valeur: profil.fonction ?? '—' },
  ]

  return (
    <div className="flex flex-col flex-1">
      <div className="flex-1 p-8 max-w-2xl">

        {/* En-tête */}
        <div className="mb-8 flex items-center gap-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl text-white text-xl font-bold shadow-md"
               style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' }}>
            {initiales(profil.prenom, profil.nom)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {profil.prenom} {profil.nom}
            </h1>
            <div className="mt-1 flex items-center gap-2">
              <Badge variante={profil.actif ? 'succes' : 'erreur'}>
                {profil.actif ? 'Compte actif' : 'Désactivé'}
              </Badge>
              <Badge variante={profil.role === 'admin' ? 'avertissement' : 'defaut'}>
                {profil.role === 'admin' ? 'Administrateur' : 'Chercheur'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Informations personnelles */}
        <Carte className="mb-6">
          <div className="mb-4 flex items-center gap-2">
            <User className="h-4 w-4 text-blue-600" />
            <h2 className="font-semibold text-slate-900">Informations personnelles</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {champs.map(({ icon: Icon, libelle, valeur }) => (
              <div key={libelle}>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                  {libelle}
                </p>
                <div className="flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <p className="text-sm font-medium text-slate-800">{valeur ?? '—'}</p>
                </div>
              </div>
            ))}
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                Membre depuis
              </p>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <p className="text-sm font-medium text-slate-800">
                  {formaterDateCourte(profil.created_at)}
                </p>
              </div>
            </div>
          </div>
        </Carte>

        {/* Abonnement actif */}
        <Carte>
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            <h2 className="font-semibold text-slate-900">Abonnement & quota</h2>
          </div>

          {ab ? (
            <>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900">
                    {ab.type === 'premium' ? 'Accès Recherche' : 'Accès Essentiel'}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Expire le {formaterDateCourte(ab.date_fin)}
                    {!ab.est_expire && (
                      <span className="ml-2 text-slate-500">· {ab.jours_restants} jour(s) restant(s)</span>
                    )}
                  </p>
                </div>
                <Badge variante={ab.est_expire ? 'erreur' : ab.quota_restant === 0 ? 'avertissement' : 'succes'}>
                  {ab.est_expire ? 'Expiré' : ab.quota_restant === 0 ? 'Quota épuisé' : 'Actif'}
                </Badge>
              </div>

              <BarreProgression
                valeur={ab.quota_utilise}
                max={ab.quota_total}
                afficherPourcentage
                libelle={`${ab.quota_utilise} corpus analysés sur ${ab.quota_total}`}
                couleur={ab.quota_restant === 0 ? 'rouge' : ab.quota_restant < 3 ? 'ambre' : 'zinc'}
              />

              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-slate-500">
                  <strong className="text-slate-900 text-lg">{ab.quota_restant}</strong>
                  {' '}corpus restant{ab.quota_restant !== 1 ? 's' : ''}
                </span>
                <span className="text-xs text-slate-400">
                  sur {ab.quota_total} au total
                </span>
              </div>
            </>
          ) : (
            <div className="rounded-xl border-2 border-dashed border-slate-200 p-6 text-center">
              <p className="text-sm font-medium text-slate-600">Aucun abonnement actif</p>
              <p className="mt-1 text-xs text-slate-400">
                Souscrivez à un forfait pour commencer vos analyses.
              </p>
            </div>
          )}
        </Carte>
      </div>
      <PiedPage />
    </div>
  )
}
