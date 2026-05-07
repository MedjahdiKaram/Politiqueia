# Politiqueia

**Plateforme d'évaluation de discours politiques assistée par IA**

> Réalisé pour le PFE Startup – Master – UABT – Par **Hind Chohra**

---

## Aperçu du projet

Politiqueia est une plateforme web complète permettant à des professionnels de la politique d'analyser et d'améliorer leurs discours grâce à l'intelligence artificielle. L'interface est intégralement en français.

### Technologies utilisées

| Couche | Technologie |
|--------|-------------|
| Frontend | Next.js 14 (App Router, React Server Components) |
| Styles | Tailwind CSS |
| Backend | Supabase (PostgreSQL + Auth + RLS) |
| IA | OpenAI GPT-4o-mini |
| Déploiement | Vercel |
| Tests | Jest + React Testing Library |

---

## Structure du projet

```
politiqueai/
├── src/
│   ├── app/
│   │   ├── (public)/           # Pages publiques (landing, auth)
│   │   ├── (dashboard)/        # Pages authentifiées
│   │   │   ├── tableau-de-bord/
│   │   │   ├── discours/
│   │   │   ├── abonnement/
│   │   │   └── admin/          # Pages admin uniquement
│   │   └── api/                # API Routes
│   │       ├── discours/
│   │       ├── admin/
│   │       └── cron/
│   ├── components/
│   │   ├── ui/                 # Composants réutilisables
│   │   ├── layout/             # Sidebar, header, footer
│   │   ├── discours/           # Composants métier discours
│   │   └── admin/              # Composants admin
│   ├── lib/
│   │   ├── supabase/           # Clients Supabase (browser + server)
│   │   ├── ai/                 # Évaluateur IA (OpenAI)
│   │   └── utils.ts            # Utilitaires
│   ├── types/                  # Types TypeScript
│   ├── middleware.ts            # Auth middleware
│   └── __tests__/              # Tests unitaires
├── supabase/
│   └── schema.sql              # Schéma complet + RLS + triggers
├── vercel.json                 # Configuration cron Vercel
└── .env.local.example
```

---

## Installation locale

### 1. Prérequis

- Node.js 20+
- Compte Supabase (gratuit)
- Compte OpenAI (pour la clé API)

### 2. Cloner et installer

```bash
git clone https://github.com/votre-repo/politiqueai.git
cd politiqueai
npm install
```

### 3. Configurer les variables d'environnement

```bash
cp .env.local.example .env.local
```

Remplir `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key
SUPABASE_SERVICE_ROLE_KEY=votre-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
CRON_SECRET=une-cle-secrete-aleatoire
OPENAI_API_KEY=sk-...  # Optionnel, peut être configuré via l'interface admin
```

### 4. Initialiser la base de données Supabase

1. Ouvrez votre projet Supabase → **SQL Editor**
2. Copiez et exécutez le contenu de `supabase/schema.sql`
3. Vérifiez que les tables suivantes existent :
   - `profiles`
   - `abonnements`
   - `discours`
   - `configuration_plateforme`

> **Important** : Ajoutez aussi cette fonction SQL pour le quota :
```sql
CREATE OR REPLACE FUNCTION public.incrementer_quota(p_user_id UUID)
RETURNS VOID AS $$
  UPDATE public.abonnements
  SET quota_utilise = quota_utilise + 1
  WHERE user_id = p_user_id AND actif = true
  ORDER BY date_fin DESC
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.somme_quota_restant()
RETURNS INTEGER AS $$
  SELECT COALESCE(SUM(quota_total - quota_utilise), 0)::INTEGER
  FROM public.abonnements
  WHERE actif = true;
$$ LANGUAGE sql SECURITY DEFINER;
```

### 5. Configurer l'authentification Supabase

Dans Supabase → **Authentication** → **Settings** :
- Désactiver la confirmation email (optionnel pour le développement)
- Ajouter `http://localhost:3000/**` dans les **Redirect URLs**

### 6. Créer le premier compte admin

```sql
-- Après inscription, mettre à jour le rôle :
UPDATE public.profiles
SET role = 'admin'
WHERE id = 'uuid-de-votre-compte';
```

### 7. Lancer le serveur de développement

```bash
npm run dev
```

Accès : [http://localhost:3000](http://localhost:3000)

---

## Déploiement sur Vercel

### 1. Pousser sur GitHub

```bash
git add .
git commit -m "init: Politiqueia v1.0"
git push origin main
```

### 2. Importer dans Vercel

1. Allez sur [vercel.com](https://vercel.com)
2. **Add New Project** → importer votre dépôt GitHub
3. Framework : **Next.js** (détecté automatiquement)

### 3. Variables d'environnement Vercel

Dans **Settings → Environment Variables**, ajoutez :

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de votre projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service role (secrète) |
| `NEXT_PUBLIC_APP_URL` | URL de votre app Vercel (ex: `https://politiqueai.vercel.app`) |
| `CRON_SECRET` | Secret aléatoire pour sécuriser le cron |
| `OPENAI_API_KEY` | Clé OpenAI (optionnel si configuré via l'admin) |

### 4. Mettre à jour les Redirect URLs Supabase

Supabase → Authentication → Settings → **Redirect URLs** :
```
https://votre-domaine.vercel.app/**
```

### 5. Déployer

Cliquez **Deploy** dans Vercel. Le déploiement prend ~2 minutes.

---

## Cron Job (désactivation des abonnements expirés)

Le fichier `vercel.json` configure un cron quotidien à 01h00 UTC :

```json
{
  "crons": [{
    "path": "/api/cron/abonnements",
    "schedule": "0 1 * * *"
  }]
}
```

> **Note** : Les cron jobs Vercel nécessitent un plan Pro ou supérieur.  
> En alternative, utilisez un service externe (EasyCron, cron-job.org) pointant vers `/api/cron/abonnements` avec l'header `Authorization: Bearer <CRON_SECRET>`.

---

## Tests

```bash
# Lancer tous les tests
npm test

# Mode watch
npm run test:watch

# Couverture de code
npm run test:coverage
```

Les tests couvrent :
- `src/__tests__/lib/utils.test.ts` — Fonctions utilitaires
- `src/__tests__/components/Bouton.test.tsx` — Composant Bouton
- `src/__tests__/components/Badge.test.tsx` — Composants Badge
- `src/__tests__/components/BarreProgression.test.tsx` — Barre de progression
- `src/__tests__/components/ChampSaisie.test.tsx` — Champ de saisie
- `src/__tests__/api/discours.test.ts` — Logique métier des discours

---

## Fonctionnalités

### Espace Client
- ✅ Tableau de bord avec quota et historique
- ✅ Création et édition de discours (WYSIWYG)
- ✅ Soumission pour évaluation IA
- ✅ Visualisation des résultats (scores, analyse, reformulation)
- ✅ Gestion de l'abonnement

### Espace Admin
- ✅ Liste globale de tous les discours
- ✅ Relance d'évaluation IA
- ✅ Gestion des utilisateurs (activer/désactiver, reset mdp)
- ✅ Configuration IA (clé API, prompts, tarifs)

### Sécurité
- ✅ Row Level Security (RLS) sur toutes les tables
- ✅ Middleware d'authentification Next.js
- ✅ Discours non éditable après soumission
- ✅ Isolation des données par utilisateur
- ✅ Cron sécurisé par secret

---

## Packs disponibles

| Pack | Prix | Discours | Durée | Reformulation |
|------|------|----------|-------|---------------|
| Simple | 2 000 DA | 3 | 1 mois | Non |
| Premium | 7 000 DA | 20 | 3 mois | Oui |

---

## Licence

Projet académique – PFE Startup, Master, Université Abou Bekr Belkaïd Tlemcen (UABT).  
© 2024 Politiqueia – Expertise et Analyse Politique.
