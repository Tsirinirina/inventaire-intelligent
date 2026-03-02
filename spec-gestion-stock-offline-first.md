# 🚀 Spécification Technique -- Application Mobile Gestion de Stock (Offline-First)

## 🎯 Objectif

Créer une application **React Native professionnelle de gestion de stock
pour un magasin d'électronique (smartphones + accessoires)**.

L'application doit être :

-   100% Offline First
-   Basée sur SQLite
-   Synchronisable plus tard avec une API NestJS
-   Architecture propre, maintenable et scalable

------------------------------------------------------------------------

# 🧱 Stack Technique Obligatoire

-   Expo (latest)
-   TypeScript strict
-   expo-sqlite
-   Drizzle ORM (priorité absolue)
-   Zustand (state management)
-   expo-router
-   react-query (préparer futur sync)
-   zod (validation)
-   dayjs (dates)
-   uuid
-   react-native-chart-kit
-   lucide-react-native

------------------------------------------------------------------------

# 🧠 Architecture Offline-First (DDD Simplifiée)

    /app
    /domain
       /entities
       /types
    /database
       db.ts
       schema.ts
       migrations.ts
       repositories/
    /infrastructure
       api/
       sync/
       network/
    /store
    /screens
    /components
    /theme
    /utils

------------------------------------------------------------------------

# 🗃️ Stratégie Offline First

## Source of Truth = SQLite

Zustand ne doit jamais être la source principale.\
SQLite = vérité absolue.

Flow applicatif :

    UI → Store → Repository → SQLite
                      ↓
                  Sync Queue

------------------------------------------------------------------------

# 🔄 Préparation Synchronisation Future (NestJS)

Chaque table doit inclure :

-   syncStatus: "synced" \| "pending" \| "deleted"
-   remoteId?: string
-   updatedAt: string

Objectifs : - Sync montante - Sync descendante - Résolution de
conflits - Soft delete

------------------------------------------------------------------------

# 📦 Entités Métier

Les structures existantes doivent être conservées (Product, Accessory,
Sale, Seller).

Ajouts obligatoires : - syncStatus - remoteId - updatedAt

------------------------------------------------------------------------

# 🗄️ Base SQLite

Tables : - products - accessories - sales - sellers - sync_queue

Optimisations : - Index sur createdAt - Index sur updatedAt - Foreign
keys activées

PRAGMA requis :

``` sql
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
```

------------------------------------------------------------------------

# 🔁 Système de Synchronisation

Créer :

    /infrastructure/sync/sync.service.ts

Méthodes :

-   pushPendingChanges()
-   pullRemoteChanges()
-   resolveConflicts()
-   markAsSynced()

Utiliser axios pour future API NestJS.

------------------------------------------------------------------------

# 📡 Monitoring Réseau

Créer :

    /infrastructure/network/useNetworkStatus.ts

Utiliser expo-network.

Si online : → lancer sync automatique

------------------------------------------------------------------------

# 🧠 Structure Zustand

Chaque store doit :

-   Charger depuis SQLite
-   Mettre à jour SQLite
-   Marquer syncStatus = pending
-   Ajouter entrée dans sync_queue
-   Gérer loading / error

Aucune logique base de données dans les composants UI.

------------------------------------------------------------------------

# 💰 Logique Métier Importante

## Vente

-   Transaction SQLite obligatoire
-   Décrémentation stock atomique
-   Empêcher vente si quantité insuffisante
-   IMEI obligatoire si catégorie smartphone

------------------------------------------------------------------------

# 📊 Dashboard

Afficher :

-   Stock total
-   Produits en alerte
-   Chiffre d'affaire du jour
-   Chiffre du mois
-   Top vendeur
-   Graphique ventes sur 7 jours

------------------------------------------------------------------------

# 🎨 UI / UX

-   ThemeProvider
-   useThemeStore
-   Dark / Light toggle
-   Design moderne
-   Cards professionnelles
-   Boutons arrondis
-   Animations légères

------------------------------------------------------------------------

# 📤 Export & Backup

Fonctionnalités :

-   Export CSV des ventes
-   Backup base SQLite
-   Import backup

------------------------------------------------------------------------

# 🔐 Sécurité

-   Passcode vendeur hashé
-   Validation Zod
-   Try/catch globalisé
-   Logger propre

------------------------------------------------------------------------

# 🧪 Testabilité

-   Repositories testables
-   Services isolés
-   Logique métier hors UI

------------------------------------------------------------------------

# 📈 Scalabilité Future

Préparer :

-   Multi-magasin
-   Multi-device
-   Synchronisation backend NestJS
-   Auth JWT
-   GraphQL ready

------------------------------------------------------------------------

# 📦 Livrables Attendus

1.  Structure complète projet
2.  Schéma Drizzle complet
3.  Exemple repository
4.  Exemple store Zustand
5.  Exemple transaction vente
6.  Service sync prêt
7.  Dashboard screen
8.  Theme provider
9.  Exemple écran CRUD produit
10. Documentation architecture

------------------------------------------------------------------------

# 🔥 Niveau d'Exigence

Cette application doit être :

-   Professionnelle
-   Optimisée performance
-   Maintenable
-   Prête production
-   Évolutive vers SaaS
