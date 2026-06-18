# BricoMaroc — Code source page d'accueil

Plateforme de mise en relation artisans/clients au Maroc.
Stack : **Next.js 14 (App Router)** + **Supabase** (PostgreSQL + Auth + Storage) + **Tailwind CSS**.

## 📁 Structure du projet

```
bricomaroc/
├── app/
│   ├── layout.tsx              # Layout racine, metadata SEO, police Inter
│   └── page.tsx                # Page d'accueil complète (Server Component)
├── components/
│   ├── ui/index.tsx            # Button, Badge, Stars, Avatar, Card, Skeleton
│   ├── layout/Navbar.tsx       # Navigation responsive avec auth
│   └── home/
│       ├── SearchBar.tsx       # Barre de recherche (Client Component)
│       ├── CategoriesGrid.tsx  # Grille des 10 catégories métiers
│       └── ArtisanCard.tsx     # Carte artisan réutilisable
├── lib/
│   ├── supabase.ts             # Clients Supabase (browser + server)
│   ├── artisans.ts             # Data layer : recherche, stats, IA budget
│   └── database.types.ts       # Types générés depuis le schéma SQL
├── types/index.ts              # Types métier (Artisan, Demande, Avis...)
├── supabase/migrations/
│   └── 001_init.sql            # Schéma complet : 10 tables + RLS + triggers
├── styles/globals.css          # Design tokens, classes utilitaires
├── tailwind.config.ts          # Palette de couleurs BricoMaroc
└── .env.example                # Toutes les variables d'environnement
```

## 🚀 Installation

```bash
# 1. Installer les dépendances
npm install

# 2. Créer un projet Supabase sur https://supabase.com
#    puis copier .env.example en .env.local et remplir les clés

cp .env.example .env.local

# 3. Exécuter la migration SQL dans Supabase
#    Dashboard Supabase → SQL Editor → coller le contenu de
#    supabase/migrations/001_init.sql → Run

# 4. Lancer le serveur de développement
npm run dev
```

L'app sera disponible sur `http://localhost:3000`.

## 🗄️ Schéma de base de données

Le fichier `001_init.sql` crée :

- **10 tables** : users, categories, artisans, artisan_categories, demandes, devis, paiements, messages, avis, signalements, portfolio, wallet_transactions
- **Triggers automatiques** :
  - Recalcul de `note_moyenne` à chaque nouvel avis
  - **Exclusion automatique** si note < 3.5★ (conforme cahier des charges)
  - Attribution badge **Élite** si note ≥ 4.5★ et ≥ 50 missions
  - **Suspension automatique** après 3 signalements
- **Row Level Security (RLS)** activée sur toutes les tables sensibles
- **Index optimisés** pour recherche géographique et full-text

Pour régénérer les types TypeScript depuis votre schéma réel :

```bash
npx supabase gen types typescript --project-id VOTRE_PROJECT_REF > lib/database.types.ts
```

## 🎨 Design system

Les couleurs sont définies dans `tailwind.config.ts` :

| Token | Hex | Usage |
|---|---|---|
| `green-500` | `#1B7A56` | Couleur principale, CTA, confiance |
| `gold-500` | `#C9922A` | Badge Élite, premium |
| `orange-500` | `#E8622A` | CTA artisan, urgence |
| `sand` | `#F7F5F0` | Fond de page |

## 🔌 Intégrations à connecter (selon roadmap)

| Service | Variable .env | Statut |
|---|---|---|
| Supabase (DB + Auth) | `NEXT_PUBLIC_SUPABASE_*` | ✅ Code prêt |
| CMI Maroc (paiement) | `CMI_*` | 🔲 À implémenter (Phase 3) |
| Stripe (cartes intl.) | `STRIPE_*` | 🔲 À implémenter (Phase 3) |
| Infobip (SMS Maroc) | `INFOBIP_*` | 🔲 À implémenter (Phase 1) |
| WhatsApp Business | `WHATSAPP_*` | 🔲 À implémenter (Phase 1) |
| Google Maps | `NEXT_PUBLIC_GOOGLE_MAPS_KEY` | 🔲 À implémenter (Phase 1) |
| OpenAI (matching IA) | `OPENAI_API_KEY` | 🔲 À implémenter (Phase 3) |
| Firebase (push) | `NEXT_PUBLIC_FIREBASE_*` | 🔲 À implémenter (Phase 1) |

## 📦 Déploiement

Recommandé : **Vercel** (gratuit pour démarrer, intégration Next.js native).

```bash
npm install -g vercel
vercel
```

Pensez à ajouter toutes les variables de `.env.local` dans les Environment Variables du projet Vercel.

## ✅ Ce qui est fonctionnel dans ce code

- Page d'accueil 100% connectée à Supabase (pas de données mockées)
- Recherche d'artisans par catégorie et ville
- Calcul dynamique des statistiques plateforme (nb artisans, missions, note moyenne)
- Système de badges (Vérifié / Élite) calculé automatiquement en base
- SEO optimisé (metadata, Open Graph, structure sémantique)
- Responsive mobile-first
- Skeleton loaders pendant le chargement des données

## 🔲 Prochaines pages à générer sur le même modèle

- `/artisans/[id]` — Profil artisan détaillé
- `/demande/nouvelle` — Formulaire de demande client
- `/artisans/inscription` — Onboarding artisan + upload CIN
- `/dashboard/artisan` — Tableau de bord artisan
- `/admin` — Interface de modération
