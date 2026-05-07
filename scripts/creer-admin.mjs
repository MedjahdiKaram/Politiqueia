/**
 * Script de création du compte administrateur
 * Usage : node scripts/creer-admin.mjs
 *
 * Nécessite les variables d'environnement dans .env.local :
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

// ── Charger .env.local manuellement ──────────────────────────────────────────
const __dir = dirname(fileURLToPath(import.meta.url))
const envPath = join(__dir, '..', '.env')

try {
  const contenu = readFileSync(envPath, 'utf8')
  for (const ligne of contenu.split('\n')) {
    const [cle, ...vals] = ligne.trim().split('=')
    if (cle && !cle.startsWith('#') && vals.length) {
      process.env[cle] = vals.join('=').replace(/^["']|["']$/g, '')
    }
  }
} catch {
  console.warn('⚠  Impossible de lire .env.local — variables d\'env système utilisées.')
}

// ── Configuration admin ───────────────────────────────────────────────────────
const ADMIN_EMAIL = 'kar.giga+admin@gmail.com'
const ADMIN_MDP   = 'Passpass**13000'
const ADMIN_NOM   = 'Admin'
const ADMIN_PRENOM = 'Politiqueia'
const ADMIN_FONCTION = 'Administrateur plateforme'

// ── Client Supabase (service role = ignore RLS) ───────────────────────────────
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('❌  Variables manquantes : NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ── Création du compte ────────────────────────────────────────────────────────
console.log(`\n🔧 Création du compte admin : ${ADMIN_EMAIL}`)

const { data: authData, error: authError } = await supabase.auth.admin.createUser({
  email:             ADMIN_EMAIL,
  password:          ADMIN_MDP,
  email_confirm:     true,          // confirmer l'email directement
  user_metadata: {
    nom:      ADMIN_NOM,
    prenom:   ADMIN_PRENOM,
    fonction: ADMIN_FONCTION,
  },
})

if (authError) {
  // Si l'utilisateur existe déjà, on récupère son ID
  if (authError.message?.includes('already been registered') || authError.message?.includes('already exists')) {
    console.warn('⚠  L\'utilisateur existe déjà. Mise à jour du rôle admin...')
  } else {
    console.error('❌  Erreur création auth :', authError.message)
    process.exit(1)
  }
}

const userId = authData?.user?.id

// Si l'utilisateur existait déjà, chercher son ID
let uid = userId
if (!uid) {
  const { data: users } = await supabase.auth.admin.listUsers()
  const existant = users?.users?.find((u) => u.email === ADMIN_EMAIL)
  if (!existant) {
    console.error('❌  Impossible de retrouver l\'utilisateur après création.')
    process.exit(1)
  }
  uid = existant.id
  console.log(`ℹ  Utilisateur existant trouvé : ${uid}`)
} else {
  console.log(`✅ Compte auth créé : ${uid}`)
}

// ── Patienter que le trigger crée le profil ───────────────────────────────────
await new Promise((r) => setTimeout(r, 1500))

// ── Vérifier / créer le profil ────────────────────────────────────────────────
const { data: profil, error: errProfil } = await supabase
  .from('profiles')
  .select('id, role')
  .eq('id', uid)
  .single()

if (errProfil || !profil) {
  console.log('ℹ  Profil non trouvé — création manuelle...')
  const { error: insErr } = await supabase.from('profiles').insert({
    id:       uid,
    nom:      ADMIN_NOM,
    prenom:   ADMIN_PRENOM,
    fonction: ADMIN_FONCTION,
    role:     'admin',
    actif:    true,
  })
  if (insErr) {
    console.error('❌  Erreur création profil :', insErr.message)
    process.exit(1)
  }
  console.log('✅ Profil admin créé.')
} else {
  // Mettre à jour le rôle en admin
  const { error: updateErr } = await supabase
    .from('profiles')
    .update({ role: 'admin', actif: true })
    .eq('id', uid)

  if (updateErr) {
    console.error('❌  Erreur mise à jour rôle :', updateErr.message)
    process.exit(1)
  }
  console.log(`✅ Rôle mis à jour : ${profil.role} → admin`)
}

// ── Résumé ────────────────────────────────────────────────────────────────────
console.log('\n──────────────────────────────────────────')
console.log('✅  Compte admin prêt !')
console.log(`   Email    : ${ADMIN_EMAIL}`)
console.log(`   Mot passe: ${ADMIN_MDP}`)
console.log(`   UUID     : ${uid}`)
console.log('──────────────────────────────────────────\n')
