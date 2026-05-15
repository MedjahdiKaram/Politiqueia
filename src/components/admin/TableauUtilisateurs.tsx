'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  UserPlus, Filter, RotateCcw, UserX, UserCheck,
  History, Trash2, CreditCard, X, Eye, EyeOff,
  ShieldCheck, User as UserIcon,
} from 'lucide-react'
import { Carte } from '@/components/ui/Carte'
import { Badge } from '@/components/ui/Badge'
import Bouton, { SpinnerBouton } from '@/components/ui/Bouton'
import LinkBouton from '@/components/ui/LinkBouton'
import { formaterDateCourte, initiales } from '@/lib/utils'
import type { StatsAdmin } from '@/types'

// ── Types ─────────────────────────────────────────────────────────────────────

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

// ── Modale générique ──────────────────────────────────────────────────────────

function Modale({ titre, onFermer, children }: {
  titre: string
  onFermer: () => void
  children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onFermer}
      />
      {/* Carte */}
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="font-semibold text-slate-900">{titre}</h2>
          <button
            onClick={onFermer}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

// ── Champ de saisie dans modale ───────────────────────────────────────────────

function Champ({
  libelle, type = 'text', value, onChange, placeholder, required, description,
  droite,
}: {
  libelle: string; type?: string; value: string
  onChange: (v: string) => void; placeholder?: string
  required?: boolean; description?: string; droite?: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
        {libelle}{required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900
                     placeholder-slate-300 focus:border-blue-400 focus:outline-none focus:ring-2
                     focus:ring-blue-100 transition-colors pr-10"
        />
        {droite && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">{droite}</span>
        )}
      </div>
      {description && <p className="mt-1 text-xs text-slate-400">{description}</p>}
    </div>
  )
}

// ── Modale : Invitation utilisateur ──────────────────────────────────────────

function ModaleInvitation({
  onFermer,
  onSucces,
}: { onFermer: () => void; onSucces: () => void }) {
  const [form, setForm] = useState({
    prenom: '', nom: '', email: '', motDePasse: '', telephone: '', fonction: '',
    role: 'client' as 'client' | 'admin',
  })
  const [afficherMdp, setAfficherMdp] = useState(false)
  const [chargement, setChargement]   = useState(false)
  const [erreur, setErreur]           = useState<string | null>(null)

  const maj = (champ: keyof typeof form) => (v: string) =>
    setForm((p) => ({ ...p, [champ]: v }))

  async function soumettre(e: React.FormEvent) {
    e.preventDefault()
    setErreur(null)
    setChargement(true)
    try {
      const res = await fetch('/api/admin/utilisateurs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok) { setErreur(json.erreur ?? 'Erreur.'); return }
      onSucces()
    } catch {
      setErreur('Erreur inattendue.')
    } finally {
      setChargement(false)
    }
  }

  return (
    <Modale titre="Inviter un utilisateur" onFermer={onFermer}>
      <form onSubmit={soumettre} className="space-y-4">
        {erreur && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
            <p className="text-sm text-red-600">{erreur}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Champ libelle="Prénom" value={form.prenom} onChange={maj('prenom')} placeholder="Jean" required />
          <Champ libelle="Nom"    value={form.nom}    onChange={maj('nom')}    placeholder="Dupont" required />
        </div>

        <Champ
          libelle="Email institutionnel"
          type="email"
          value={form.email}
          onChange={maj('email')}
          placeholder="jean.dupont@universite.fr"
          required
        />

        <Champ
          libelle="Mot de passe temporaire"
          type={afficherMdp ? 'text' : 'password'}
          value={form.motDePasse}
          onChange={maj('motDePasse')}
          placeholder="••••••••"
          required
          description="8 caractères minimum. L'utilisateur pourra le modifier."
          droite={
            <button
              type="button"
              onClick={() => setAfficherMdp((v) => !v)}
              className="text-slate-400 hover:text-slate-600"
            >
              {afficherMdp ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
        />

        <div className="grid grid-cols-2 gap-3">
          <Champ libelle="Téléphone"       value={form.telephone} onChange={maj('telephone')} placeholder="+213 6…" />
          <Champ libelle="Affiliation / Fonction" value={form.fonction} onChange={maj('fonction')} placeholder="Chercheur…" />
        </div>

        {/* Rôle */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Rôle <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            {([
              { v: 'client', label: 'Chercheur / Client', icon: UserIcon,    desc: 'Accès à la plateforme d\'analyse' },
              { v: 'admin',  label: 'Administrateur',     icon: ShieldCheck, desc: 'Accès complet + gestion' },
            ] as const).map(({ v, label, icon: Icon, desc }) => (
              <button
                key={v}
                type="button"
                onClick={() => setForm((p) => ({ ...p, role: v }))}
                className={`flex items-start gap-3 rounded-xl border-2 p-3 text-left transition-all ${
                  form.role === v
                    ? v === 'admin'
                      ? 'border-orange-400 bg-orange-50'
                      : 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${
                  form.role === v
                    ? v === 'admin' ? 'text-orange-500' : 'text-blue-600'
                    : 'text-slate-400'
                }`} />
                <div>
                  <p className={`text-xs font-semibold ${form.role === v ? (v === 'admin' ? 'text-orange-700' : 'text-blue-700') : 'text-slate-700'}`}>
                    {label}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
          <Bouton type="button" variante="contour" taille="sm" onClick={onFermer}>
            Annuler
          </Bouton>
          <Bouton
            type="submit"
            variante="primaire"
            taille="sm"
            chargement={chargement}
            iconGauche={!chargement ? <UserPlus className="h-3.5 w-3.5" /> : undefined}
          >
            Créer l&apos;utilisateur
          </Bouton>
        </div>
      </form>
    </Modale>
  )
}

// ── Modale : Attribution d'abonnement ─────────────────────────────────────────

function ModaleAbonnement({
  utilisateurId,
  nomUtilisateur,
  onFermer,
  onSucces,
}: {
  utilisateurId: string
  nomUtilisateur: string
  onFermer: () => void
  onSucces: () => void
}) {
  const [typePack, setTypePack]     = useState<'simple' | 'premium' | null>(null)
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur]         = useState<string | null>(null)

  const maintenant  = new Date()
  const dateDebut   = maintenant.toLocaleDateString('fr-FR')
  const dateFinSi   = (mois: number) => {
    const d = new Date(maintenant)
    d.setMonth(d.getMonth() + mois)
    return d.toLocaleDateString('fr-FR')
  }

  const PACKS = [
    {
      type: 'simple' as const,
      titre: 'Accès Essentiel',
      duree: '1 mois',
      dateFin: dateFinSi(1),
      quota: '3 corpus',
      couleur: 'border-slate-300',
      couleurActif: 'border-blue-500 bg-blue-50',
      badge: 'bg-slate-100 text-slate-600',
    },
    {
      type: 'premium' as const,
      titre: 'Accès Recherche',
      duree: '3 mois',
      dateFin: dateFinSi(3),
      quota: '20 corpus',
      couleur: 'border-slate-300',
      couleurActif: 'border-blue-600 bg-blue-600',
      badge: 'bg-blue-600 text-white',
    },
  ]

  async function attribuer() {
    if (!typePack) return
    setErreur(null)
    setChargement(true)
    try {
      const res = await fetch('/api/admin/abonnements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: utilisateurId, type: typePack }),
      })
      const json = await res.json()
      if (!res.ok) { setErreur(json.erreur ?? 'Erreur.'); return }
      onSucces()
    } catch {
      setErreur('Erreur inattendue.')
    } finally {
      setChargement(false)
    }
  }

  return (
    <Modale titre={`Attribuer un abonnement — ${nomUtilisateur}`} onFermer={onFermer}>
      <div className="space-y-4">
        {erreur && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
            <p className="text-sm text-red-600">{erreur}</p>
          </div>
        )}

        <p className="text-sm text-slate-500">
          Sélectionnez le forfait à attribuer. Les dates sont calculées automatiquement
          à partir d&apos;aujourd&apos;hui et tout abonnement actif existant sera remplacé.
        </p>

        <div className="grid grid-cols-2 gap-3">
          {PACKS.map((pack) => {
            const estSelectionne = typePack === pack.type
            const estPremium     = pack.type === 'premium'
            return (
              <button
                key={pack.type}
                type="button"
                onClick={() => setTypePack(pack.type)}
                className={`rounded-xl border-2 p-4 text-left transition-all ${
                  estSelectionne ? pack.couleurActif : pack.couleur + ' hover:border-slate-400'
                }`}
              >
                <div className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold mb-2 ${
                  estSelectionne && estPremium ? 'bg-white/20 text-white' : pack.badge
                }`}>
                  {pack.titre}
                </div>
                <p className={`text-lg font-bold ${estSelectionne && estPremium ? 'text-white' : 'text-slate-900'}`}>
                  {pack.quota}
                </p>
                <div className={`mt-2 space-y-1 text-xs ${estSelectionne && estPremium ? 'text-blue-100' : 'text-slate-400'}`}>
                  <p>Durée : {pack.duree}</p>
                  <p>Début : {dateDebut}</p>
                  <p>Fin : {pack.dateFin}</p>
                </div>
              </button>
            )
          })}
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
          <Bouton type="button" variante="contour" taille="sm" onClick={onFermer}>
            Annuler
          </Bouton>
          <Bouton
            type="button"
            variante="primaire"
            taille="sm"
            chargement={chargement}
            disabled={!typePack}
            onClick={attribuer}
            iconGauche={!chargement ? <CreditCard className="h-3.5 w-3.5" /> : undefined}
          >
            Attribuer
          </Bouton>
        </div>
      </div>
    </Modale>
  )
}

// ── Modale : Confirmation de suppression ──────────────────────────────────────

function ModaleConfirmSuppression({
  utilisateur,
  onFermer,
  onConfirme,
  chargement,
}: {
  utilisateur: UtilisateurAvecAbonnement
  onFermer: () => void
  onConfirme: () => void
  chargement: boolean
}) {
  return (
    <Modale titre="Confirmer la suppression" onFermer={onFermer}>
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-xl bg-red-50 border border-red-200 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 shrink-0">
            <Trash2 className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <p className="font-semibold text-red-800">
              {utilisateur.prenom} {utilisateur.nom}
            </p>
            <p className="text-xs text-red-600 mt-0.5">{utilisateur.email ?? '—'}</p>
          </div>
        </div>

        <p className="text-sm text-slate-600">
          Cette action est <strong>irréversible</strong>. Elle supprimera définitivement :
        </p>
        <ul className="space-y-1 text-sm text-slate-500">
          {[
            'Le compte utilisateur et ses données d\'authentification',
            'Tous les corpus et analyses associés',
            'L\'historique complet des abonnements',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-400 shrink-0" />
              {item}
            </li>
          ))}
        </ul>

        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
          <Bouton type="button" variante="contour" taille="sm" onClick={onFermer} disabled={chargement}>
            Annuler
          </Bouton>
          <Bouton
            type="button"
            variante="danger"
            taille="sm"
            chargement={chargement}
            onClick={onConfirme}
            iconGauche={!chargement ? <Trash2 className="h-3.5 w-3.5" /> : undefined}
          >
            Supprimer définitivement
          </Bouton>
        </div>
      </div>
    </Modale>
  )
}

// ── Composant principal ───────────────────────────────────────────────────────

export default function TableauUtilisateurs({ utilisateurs, stats }: PropsTableau) {
  const router = useRouter()

  // États de chargement des actions inline
  const [actionId, setActionId] = useState<string | null>(null)

  // Modales
  const [modaleInvitation,   setModaleInvitation]   = useState(false)
  const [modaleAbonnement,   setModaleAbonnement]   = useState<UtilisateurAvecAbonnement | null>(null)
  const [modaleSuppression,  setModaleSuppression]  = useState<UtilisateurAvecAbonnement | null>(null)
  const [suppressionEnCours, setSuppressionEnCours] = useState(false)

  const obtenirAbonnementActif = (u: UtilisateurAvecAbonnement) =>
    u.abonnements?.find((a) => a.actif) ?? null

  async function toggleActif(id: string, actifActuel: boolean) {
    setActionId(id + '-toggle')
    try {
      await fetch(`/api/admin/utilisateurs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actif: !actifActuel }),
      })
      router.refresh()
    } finally {
      setActionId(null)
    }
  }

  async function reinitialiserMdp(id: string, email: string) {
    if (!confirm(`Envoyer un email de réinitialisation à ${email} ?`)) return
    setActionId(id + '-reset')
    try {
      await fetch(`/api/admin/utilisateurs/${id}/reset-password`, { method: 'POST' })
      alert('Email de réinitialisation envoyé.')
    } finally {
      setActionId(null)
    }
  }

  async function supprimerUtilisateur() {
    if (!modaleSuppression) return
    setSuppressionEnCours(true)
    try {
      const res = await fetch(`/api/admin/utilisateurs/${modaleSuppression.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const json = await res.json()
        alert(json.erreur ?? 'Erreur lors de la suppression.')
        return
      }
      setModaleSuppression(null)
      router.refresh()
    } finally {
      setSuppressionEnCours(false)
    }
  }

  return (
    <div>
      {/* Modales */}
      {modaleInvitation && (
        <ModaleInvitation
          onFermer={() => setModaleInvitation(false)}
          onSucces={() => { setModaleInvitation(false); router.refresh() }}
        />
      )}
      {modaleAbonnement && (
        <ModaleAbonnement
          utilisateurId={modaleAbonnement.id}
          nomUtilisateur={`${modaleAbonnement.prenom} ${modaleAbonnement.nom}`}
          onFermer={() => setModaleAbonnement(null)}
          onSucces={() => { setModaleAbonnement(null); router.refresh() }}
        />
      )}
      {modaleSuppression && (
        <ModaleConfirmSuppression
          utilisateur={modaleSuppression}
          onFermer={() => !suppressionEnCours && setModaleSuppression(null)}
          onConfirme={supprimerUtilisateur}
          chargement={suppressionEnCours}
        />
      )}

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
          <Bouton
            taille="sm"
            iconGauche={<UserPlus className="h-3.5 w-3.5" />}
            onClick={() => setModaleInvitation(true)}
          >
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
                {['Utilisateur', 'Email', 'Rôle', 'Fin d\'abonnement', 'Quota restant', 'Historique', 'Actions'].map((h) => (
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
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-zinc-400">
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              ) : (
                utilisateurs.map((u) => {
                  const ab           = obtenirAbonnementActif(u)
                  const quotaRestant = ab ? Math.max(0, ab.quota_total - ab.quota_utilise) : null
                  const estExpire    = ab ? new Date(ab.date_fin) < new Date() : false
                  const estClient    = u.role === 'client'

                  return (
                    <tr key={u.id} className={`hover:bg-zinc-50 transition-colors ${!u.actif ? 'opacity-50' : ''}`}>

                      {/* Utilisateur */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                            {initiales(u.prenom, u.nom)}
                          </div>
                          <div>
                            <p className="font-medium text-sm text-zinc-900 leading-tight">
                              {u.prenom} {u.nom}
                            </p>
                            {u.telephone && (
                              <p className="text-[10px] text-zinc-400">{u.telephone}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3 text-sm text-zinc-500 max-w-[160px] truncate">
                        {u.email ?? '–'}
                      </td>

                      {/* Rôle */}
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          u.role === 'admin'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {u.role === 'admin'
                            ? <><ShieldCheck className="h-3 w-3" /> Admin</>
                            : <><UserIcon className="h-3 w-3" /> Client</>
                          }
                        </span>
                      </td>

                      {/* Fin abonnement */}
                      <td className="px-4 py-3 text-sm">
                        {ab ? (
                          <span className={estExpire ? 'text-red-500 font-medium' : 'text-zinc-700'}>
                            {estExpire ? 'Expiré' : formaterDateCourte(ab.date_fin)}
                          </span>
                        ) : (
                          <span className="text-zinc-400">–</span>
                        )}
                      </td>

                      {/* Quota restant */}
                      <td className="px-4 py-3 text-sm">
                        {quotaRestant !== null ? (
                          <Badge variante={quotaRestant === 0 ? 'erreur' : quotaRestant < 3 ? 'avertissement' : 'succes'}>
                            {quotaRestant}
                          </Badge>
                        ) : (
                          <span className="text-zinc-400">–</span>
                        )}
                      </td>

                      {/* Historique abonnements */}
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
                        <div className="flex items-center gap-1 flex-wrap">

                          {/* Attribuer abonnement (clients uniquement) */}
                          {estClient && (
                            <button
                              onClick={() => setModaleAbonnement(u)}
                              title="Attribuer un abonnement"
                              className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2 py-1 text-[11px] font-medium text-blue-700 hover:bg-blue-100 transition-colors whitespace-nowrap"
                            >
                              <CreditCard className="h-3 w-3" />
                              Abonnement
                            </button>
                          )}

                          {/* Réinitialiser MDP */}
                          <button
                            onClick={() => reinitialiserMdp(u.id, u.email ?? '')}
                            disabled={!!actionId}
                            className="rounded p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors disabled:opacity-40"
                            title="Réinitialiser le mot de passe"
                          >
                            {actionId === u.id + '-reset'
                              ? <SpinnerBouton classe="text-zinc-400" />
                              : <RotateCcw className="h-3.5 w-3.5" />
                            }
                          </button>

                          {/* Activer / Désactiver */}
                          <button
                            onClick={() => toggleActif(u.id, u.actif)}
                            disabled={!!actionId}
                            className="rounded p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors disabled:opacity-40"
                            title={u.actif ? 'Désactiver le compte' : 'Activer le compte'}
                          >
                            {actionId === u.id + '-toggle' ? (
                              <SpinnerBouton classe="text-zinc-400" />
                            ) : u.actif ? (
                              <UserX className="h-3.5 w-3.5" />
                            ) : (
                              <UserCheck className="h-3.5 w-3.5 text-green-600" />
                            )}
                          </button>

                          {/* Supprimer */}
                          <button
                            onClick={() => setModaleSuppression(u)}
                            disabled={!!actionId}
                            className="rounded p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-40"
                            title="Supprimer l'utilisateur"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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
              {utilisateurs.length} utilisateur{utilisateurs.length !== 1 ? 's' : ''} · {stats.abonnements_actifs} abonnement{stats.abonnements_actifs !== 1 ? 's' : ''} actif{stats.abonnements_actifs !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </Carte>
    </div>
  )
}
