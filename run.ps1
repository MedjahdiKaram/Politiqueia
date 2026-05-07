# Création du dossier racine
New-Item -ItemType Directory -Path ".claude" -Force

# Sous-dossiers
New-Item -ItemType Directory -Path ".claude/agents" -Force
New-Item -ItemType Directory -Path ".claude/prompts" -Force

# =========================
# context.md
# =========================
@"
# Contexte Projet - PolitiqueAi

Plateforme SaaS d’évaluation de discours politiques.

Langue : Français strict
Cible : Étudiants, chercheurs, analystes politiques

Fonctionnalités clés :
- Analyse IA
- Reformulation
- Gestion abonnements
- Interface admin complète

Stack :
- Next.js 14
- Supabase
- Tailwind
- Vercel

Contraintes :
- UX simple
- Responsive total
- Sécurité forte
"@ | Set-Content ".claude/context.md"

# =========================
# rules.md
# =========================
@"
# Règles Globales

- Code propre et modulaire
- Respect strict du français (UI)
- Ne jamais mélanger admin/customer
- Toujours valider les permissions
- Tests obligatoires

## Sécurité
- RLS Supabase obligatoire
- Validation backend obligatoire

## UX
- Minimaliste
- Rapide
- Clair

## IA
- Prompts stockés en base
- Modifiables par admin uniquement
"@ | Set-Content ".claude/rules.md"

# =========================
# AGENTS
# =========================

@"
# Frontend Agent

Responsable de :
- UI/UX
- Pages Next.js
- Responsive design

Stack :
- Next.js App Router
- Tailwind CSS

Règles :
- Composants réutilisables
- Design minimal
"@ | Set-Content ".claude/agents/frontend.agent.md"

@"
# Backend Agent

Responsable de :
- API routes
- Auth
- Business logic

Fonctions :
- CRUD discours
- Gestion abonnement
- Permissions

Règles :
- Vérification utilisateur
- Validation stricte
"@ | Set-Content ".claude/agents/backend.agent.md"

@"
# AI Agent

Responsable :
- Intégration API IA
- Génération évaluation
- Reformulation

Contraintes :
- Français parfait
- Texte structuré
"@ | Set-Content ".claude/agents/ai.agent.md"

@"
# Database Agent

Responsable :
- Schéma Supabase
- RLS policies

Tables :
- Users
- Subscription
- Discours
- PlatformConfiguration
"@ | Set-Content ".claude/agents/database.agent.md"

@"
# Testing Agent

Responsable :
- Tests unitaires
- Tests composants
- Tests API

Outils :
- Jest
- React Testing Library
"@ | Set-Content ".claude/agents/testing.agent.md"

# =========================
# PROMPTS
# =========================

@"
# Prompt UI

Créer une interface moderne, minimaliste et responsive.
Langue : Français uniquement.
Utiliser Tailwind CSS.
"@ | Set-Content ".claude/prompts/ui.prompt.md"

@"
# Prompt API

Créer des API sécurisées avec validation.
Respecter les permissions utilisateur.
"@ | Set-Content ".claude/prompts/api.prompt.md"

@"
# Prompt Evaluation Discours

Analyse ce discours politique selon :
- Clarté
- Cohérence
- Argumentation
- Impact émotionnel
- Crédibilité

Donne :
1. Analyse détaillée
2. Points forts
3. Points faibles
4. Score global /10
"@ | Set-Content ".claude/prompts/ai.prompt.md"

@"
# Prompt Reformulation

Reformule ce discours pour :
- Améliorer la clarté
- Renforcer l’impact
- Corriger les erreurs

Style : professionnel, fluide, convaincant
"@ | Set-Content ".claude/prompts/db.prompt.md"

Write-Host "✅ Structure .claude créée avec succès !"