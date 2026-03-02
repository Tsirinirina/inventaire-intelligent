# Spécifications Backend — Inventaire Intelligent
> Document de référence pour le développement de l'API NestJS + MongoDB.
> Généré depuis le code source React Native Expo existant.

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Entités & Schémas MongoDB](#2-entités--schémas-mongodb)
3. [Schéma SQLite Client (référence)](#3-schéma-sqlite-client-référence)
4. [Architecture de Synchronisation](#4-architecture-de-synchronisation)
5. [API Endpoints](#5-api-endpoints)
6. [Upload d'Images](#6-upload-dimages)
7. [Authentification](#7-authentification)
8. [Validation & DTOs](#8-validation--dtos)
9. [Constantes & Enums](#9-constantes--enums)
10. [Structure NestJS recommandée](#10-structure-nestjs-recommandée)
11. [Zones incomplètes (côté client)](#11-zones-incomplètes-côté-client)

---

## 1. Vue d'ensemble

| Champ | Valeur |
|-------|--------|
| **App mobile** | React Native + Expo 54 |
| **Backend cible** | NestJS + MongoDB (Mongoose) |
| **API prefix** | `/api/v1` |
| **Auth** | Bearer JWT |
| **Package Android** | `com.patrick256.inventaireintelligentv1` |
| **Version app** | 1.0.0 |
| **Stratégie sync** | Offline-first, last-write-wins via `stockUpdatedAt` |

### Stack client
```
React Native 0.81.5 · Expo 54 · expo-sqlite 16 · Zustand 5
React Query 5 · react-hook-form 7 · Zod 4
```

---

## 2. Entités & Schémas MongoDB

### 2.1 SyncMeta (interface partagée)

Tous les documents synchronisables (Product, Accessory, Sale) étendent cette interface.

```typescript
interface SyncMeta {
  syncId: string | null;      // UUID attribué par le serveur à la première sync
  syncStatus: SyncStatus;     // "pending" | "synced" | "failed"
  syncedAt: string | null;    // ISO 8601 de la dernière sync réussie
}

type SyncStatus = "pending" | "synced" | "failed";
```

> **Règle** : Le serveur génère le `syncId` (UUID v4) à la création. Il est renvoyé dans la réponse et sauvegardé côté client pour les mises à jour ultérieures.

---

### 2.2 Product

**Interface TypeScript (client)**
```typescript
interface Product extends SyncMeta {
  id: number;
  name: string;
  brand: string;
  category: "smartphone" | "laptop" | "tablet" | "autre";
  description?: string;
  basePrice: number;
  quantity: number;
  imageUri?: string;          // URL distante après upload
  createdAt: string;          // ISO 8601
  stockUpdatedAt: string;     // ISO 8601 — utilisé pour la résolution de conflits
  syncId: string | null;
  syncStatus: SyncStatus;
  syncedAt: string | null;
}

type NewProduct = Omit<Product, "id" | "syncId" | "syncStatus" | "syncedAt">;
```

**Schéma Mongoose**
```typescript
@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  brand: string;

  @Prop({ required: true, enum: ["smartphone", "laptop", "tablet", "autre"] })
  category: string;

  @Prop()
  description?: string;

  @Prop({ required: true, min: 0 })
  basePrice: number;

  @Prop({ required: true, min: 0 })
  quantity: number;

  @Prop()
  imageUri?: string;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: true })
  stockUpdatedAt: Date;
}
```

**Index MongoDB**
```javascript
{ name: 1 }             // index unique recommandé
{ category: 1 }
{ brand: 1 }
{ createdAt: -1 }       // tri par défaut
```

---

### 2.3 Accessory

**Interface TypeScript (client)**
```typescript
interface Accessory extends SyncMeta {
  id: number;
  name: string;
  category: "housse" | "cable" | "chargeur" | "ecouteur" | "boitier" | "autre";
  description?: string;
  basePrice: number;
  quantity: number;
  imageUri?: string;
  createdAt: string;
  stockUpdatedAt: string;
  syncId: string | null;
  syncStatus: SyncStatus;
  syncedAt: string | null;
}

type NewAccessory = Omit<Accessory, "id" | "syncId" | "syncStatus" | "syncedAt">;
```

**Schéma Mongoose**
```typescript
@Schema({ timestamps: true })
export class Accessory {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: ["housse", "cable", "chargeur", "ecouteur", "boitier", "autre"] })
  category: string;

  @Prop()
  description?: string;

  @Prop({ required: true, min: 0 })
  basePrice: number;

  @Prop({ required: true, min: 0 })
  quantity: number;

  @Prop()
  imageUri?: string;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ required: true })
  stockUpdatedAt: Date;
}
```

---

### 2.4 Sale

> **Règle** : Une vente référence soit un `productId` soit un `accessoryId`, jamais les deux.
> Les ventes sont **immuables** sur le serveur (pas de PUT).

**Interface TypeScript (client)**
```typescript
interface Sale extends SyncMeta {
  id: number;
  sellerId: number;
  productId?: number;       // XOR avec accessoryId
  accessoryId?: number;
  quantity: number;
  unitPrice: number;        // Prix au moment de la vente
  color?: string;
  imei?: string;            // Unique — pour les smartphones
  ram?: number;             // en GB
  rom?: number;             // en GB
  apn?: number;
  attachmentUri?: string;   // URL reçu/preuve
  buyerName?: string;
  buyerCin?: string;
  createdAt: string;
  syncId: string | null;
  syncStatus: SyncStatus;
  syncedAt: string | null;
}

type NewSale = Omit<Sale, "id" | "syncId" | "syncStatus" | "syncedAt">;
```

**Schéma Mongoose**
```typescript
@Schema({ timestamps: true })
export class Sale {
  @Prop({ required: true, type: Types.ObjectId, ref: "Seller" })
  sellerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Product" })
  productId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Accessory" })
  accessoryId?: Types.ObjectId;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true, min: 0 })
  unitPrice: number;

  @Prop()
  color?: string;

  @Prop({ sparse: true, unique: true })  // unique si non null
  imei?: string;

  @Prop()
  ram?: number;

  @Prop()
  rom?: number;

  @Prop()
  apn?: number;

  @Prop()
  attachmentUri?: string;

  @Prop()
  buyerName?: string;

  @Prop()
  buyerCin?: string;

  @Prop({ required: true })
  createdAt: Date;
}
```

**Index MongoDB**
```javascript
{ sellerId: 1 }
{ productId: 1 }
{ accessoryId: 1 }
{ createdAt: -1 }
{ imei: 1 }          // sparse unique
```

---

### 2.5 Seller

**Interface TypeScript (client)**
```typescript
interface Seller {
  id: number;
  name: string;        // UNIQUE
  passcode: string;    // Stocké en clair côté SQLite — à hasher côté serveur
  lastUpdateDate?: string;
}
```

**Schéma Mongoose**
```typescript
@Schema({ timestamps: true })
export class Seller {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })        // bcrypt hash côté serveur
  passcode: string;

  @Prop()
  lastUpdateDate?: Date;

  @Prop({ default: true })
  isActive: boolean;
}
```

> **Vendeur par défaut** : Un seller est créé au premier démarrage de l'app mobile (`name: "Vendeur Défaut"`). Le serveur doit accepter un endpoint pour créer/trouver des sellers.

---

### 2.6 StockMovement (Audit trail)

**Interface TypeScript (client)**
```typescript
interface StockMovement {
  id: number;
  itemType: "product" | "accessory";
  itemId: number;
  itemName: string;      // Dénormalisé
  quantity: number;      // Toujours positif
  createdAt: string;
}
```

**Schéma Mongoose**
```typescript
@Schema({ timestamps: false })
export class StockMovement {
  @Prop({ required: true, enum: ["product", "accessory"] })
  itemType: string;

  @Prop({ required: true, type: Types.ObjectId })
  itemId: Types.ObjectId;

  @Prop({ required: true })
  itemName: string;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true })
  createdAt: Date;

  @Prop({ enum: ["initial", "restock", "sale", "adjustment"] })
  reason?: string;
}
```

---

## 3. Schéma SQLite Client (référence)

> Ce schéma est en lecture seule pour le serveur. Il sert de référence pour comprendre les données envoyées.

```sql
CREATE TABLE sellers (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL UNIQUE,
  passcode    TEXT NOT NULL,
  lastUpdateDate TEXT
);

CREATE TABLE products (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  name           TEXT NOT NULL,
  brand          TEXT NOT NULL,
  category       TEXT NOT NULL,
  description    TEXT,
  basePrice      REAL NOT NULL,
  quantity       INTEGER NOT NULL,
  imageUri       TEXT,
  createdAt      TEXT NOT NULL,
  stockUpdatedAt TEXT NOT NULL,
  -- colonnes sync (ajoutées par migrations)
  sync_id        TEXT,
  sync_status    TEXT DEFAULT 'pending',
  synced_at      TEXT
);

CREATE TABLE accessories (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  name           TEXT NOT NULL,
  category       TEXT NOT NULL,
  description    TEXT,
  basePrice      REAL NOT NULL,
  quantity       INTEGER NOT NULL,
  imageUri       TEXT,
  createdAt      TEXT NOT NULL,
  stockUpdatedAt TEXT NOT NULL,
  sync_id        TEXT,
  sync_status    TEXT DEFAULT 'pending',
  synced_at      TEXT
);

CREATE TABLE sales (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  sellerId      INTEGER NOT NULL REFERENCES sellers(id),
  productId     INTEGER REFERENCES products(id),
  accessoryId   INTEGER REFERENCES accessories(id),
  quantity      INTEGER NOT NULL,
  unitPrice     REAL NOT NULL,
  color         TEXT,
  imei          TEXT UNIQUE,
  ram           INTEGER,
  rom           INTEGER,
  apn           INTEGER,
  attachmentUri TEXT,
  buyerName     TEXT,
  buyerCin      TEXT,
  createdAt     TEXT NOT NULL,
  sync_id       TEXT,
  sync_status   TEXT DEFAULT 'pending',
  synced_at     TEXT
);

CREATE TABLE stock_movements (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  itemType  TEXT NOT NULL,
  itemId    INTEGER NOT NULL,
  itemName  TEXT NOT NULL,
  quantity  INTEGER NOT NULL,
  createdAt TEXT NOT NULL
);
```

---

## 4. Architecture de Synchronisation

### 4.1 Flux général

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENT (React Native)                       │
│                                                                 │
│  Mutation UI                                                    │
│      │                                                          │
│      ▼                                                          │
│  SQLite (sync_status = 'pending')                               │
│      │                                                          │
│      ▼  [Déclenchement manuel depuis Paramètres]                │
│  runSync()                                                      │
│      │                                                          │
│      ├─ 1. getPendingProducts()  ──────────────────────────┐   │
│      ├─ 2. getPendingAccessories() ────────────────────────┤   │
│      └─ 3. getPendingSales()  ─────────────────────────────┤   │
│                                                            │   │
│  Pour chaque item :                                        │   │
│      ├─ imageUri locale ? → POST /uploads/image → URL      │   │
│      ├─ syncId absent ?  → POST /products          (create)│   │
│      └─ syncId présent ? → PUT  /products/:syncId  (update)│   │
│                                                            │   │
│  Réponse :                                                 │   │
│      ├─ Succès → sync_status='synced', sync_id=response.id │   │
│      └─ Échec  → sync_status='failed'                      │   │
└────────────────────────────────────────────────────────────────┘
                              │
                     HTTP (Bearer JWT)
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SERVEUR (NestJS)                             │
│                                                                 │
│  POST /api/v1/products                                         │
│      │                                                          │
│      ├─ Valider DTO                                             │
│      ├─ Insérer en MongoDB                                      │
│      └─ Retourner { syncId: ObjectId.toString(), updatedAt }   │
│                                                                 │
│  PUT /api/v1/products/:syncId                                  │
│      │                                                          │
│      ├─ Résolution conflits : comparer stockUpdatedAt           │
│      ├─ Si serveur plus récent → retourner 409 (futur)          │
│      └─ Sinon → mettre à jour + retourner { syncId, updatedAt }│
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Types de synchronisation

```typescript
type SyncStatus = "pending" | "synced" | "failed";
type SyncPhase  = "images" | "products" | "accessories" | "sales";

interface SyncProgress {
  phase:   SyncPhase;
  current: number;
  total:   number;
}

interface SyncResult {
  synced: number;      // Nombre d'items synchronisés avec succès
  failed: number;      // Nombre d'items en échec
  errors: string[];    // Messages d'erreur par item
}
```

### 4.3 État Zustand (côté client)

```typescript
interface SyncState {
  // Config persistée (AsyncStorage)
  serverUrl:  string;          // ex: "http://192.168.1.10:3000"
  authToken:  string | null;   // JWT

  // Résultat persisté
  lastSyncAt:  string | null;
  lastResult:  SyncResult | null;

  // État transitoire (non persisté)
  runStatus:  "idle" | "syncing" | "success" | "error";
  lastError:  string | null;
  progress:   SyncProgress | null;
}
```

### 4.4 Résolution de conflits

| Scénario | Comportement actuel | Comportement futur |
|----------|---------------------|-------------------|
| Client plus récent | Écrase le serveur (last-write-wins) | Comparaison `stockUpdatedAt` |
| Serveur plus récent | Non géré | Serveur retourne `409`, client garde version serveur |
| IMEI dupliqué | Erreur serveur `400` | Client bloqué à la saisie |
| Vente dupliquée | Pas de PUT (immuable) | Déduplication par `createdAt + sellerId` |

---

## 5. API Endpoints

### Configuration client HTTP

```
Base URL    : {serverUrl}/api/v1
Timeout     : 15 000 ms
Auth Header : Authorization: Bearer {authToken}
Content-Type: application/json
```

---

### 5.1 Products

#### `POST /api/v1/products` — Créer un produit
```
Headers:
  Authorization: Bearer {token}
  Content-Type: application/json

Body:
{
  "name":           "iPhone 14 Pro",
  "brand":          "Apple",
  "category":       "smartphone",
  "description":    "Excellent état",        // optionnel
  "basePrice":      1200000,
  "quantity":       5,
  "imageUri":       "https://api.../uuid.jpg", // optionnel, URL distante
  "createdAt":      "2024-01-15T10:30:00.000Z",
  "stockUpdatedAt": "2024-01-15T10:30:00.000Z"
}

Response 201:
{
  "syncId":    "507f1f77bcf86cd799439011",  // MongoDB _id en string
  "updatedAt": "2024-01-15T10:30:00.000Z"
}

Errors:
  400 — Validation échouée
  401 — Token manquant/invalide
  409 — Conflit (futur)
```

#### `PUT /api/v1/products/:syncId` — Mettre à jour un produit
```
Params:
  syncId: string  (MongoDB _id)

Body: (identique à POST)

Response 200:
{
  "syncId":    "507f1f77bcf86cd799439011",
  "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

#### `GET /api/v1/products?since=:iso8601` — Fetch depuis une date (futur)
```
Query:
  since: ISO 8601 timestamp (ex: 2024-01-01T00:00:00.000Z)

Response 200:
[
  {
    "syncId":    "...",
    "name":      "iPhone 14 Pro",
    "brand":     "Apple",
    "category":  "smartphone",
    "basePrice": 1200000,
    "quantity":  5,
    ...
  }
]
```

---

### 5.2 Accessories

#### `POST /api/v1/accessories` — Créer un accessoire
```
Body:
{
  "name":           "Coque iPhone 14",
  "category":       "housse",
  "description":    "Silicone noir",       // optionnel
  "basePrice":      15000,
  "quantity":       20,
  "imageUri":       "https://...",          // optionnel
  "createdAt":      "2024-01-15T10:30:00.000Z",
  "stockUpdatedAt": "2024-01-15T10:30:00.000Z"
}

Response 201:
{
  "syncId":    "507f1f77bcf86cd799439012",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

#### `PUT /api/v1/accessories/:syncId` — Mettre à jour un accessoire
```
Body: (identique à POST)
Response 200: { "syncId", "updatedAt" }
```

#### `GET /api/v1/accessories?since=:iso8601` — Fetch depuis une date (futur)

---

### 5.3 Sales

> Les ventes sont **immuables** côté serveur. Pas de PUT.

#### `POST /api/v1/sales` — Créer une vente
```
Body:
{
  "sellerId":       "507f1f77bcf86cd799439020",  // syncId du vendeur
  "productId":      "507f1f77bcf86cd799439011",  // XOR avec accessoryId
  "accessoryId":    null,
  "quantity":       1,
  "unitPrice":      1150000,
  "color":          "Noir",            // optionnel
  "imei":           "352999001761481", // optionnel, unique
  "ram":            6,                 // optionnel, en GB
  "rom":            128,               // optionnel, en GB
  "apn":            null,              // optionnel
  "attachmentUri":  "https://...",     // optionnel, URL reçu
  "buyerName":      "Jean Dupont",     // optionnel
  "buyerCin":       "101 234 567",     // optionnel
  "createdAt":      "2024-01-15T14:00:00.000Z"
}

Response 201:
{
  "syncId":    "507f1f77bcf86cd799439030",
  "createdAt": "2024-01-15T14:00:00.000Z"
}

Errors:
  400 — IMEI dupliqué, productId ET accessoryId absent, quantité invalide
  401 — Token manquant/invalide
```

#### `GET /api/v1/sales?since=:iso8601` — Fetch depuis une date (futur)

---

## 6. Upload d'Images

#### `POST /api/v1/uploads/image` — Upload image produit/accessoire
```
Headers:
  Authorization: Bearer {token}
  Content-Type: multipart/form-data

Body (FormData):
  file: <binaire JPEG/PNG>
  type: "product" | "accessory"

Response 200:
{
  "url":      "https://api.example.com/uploads/images/a1b2c3d4.jpg",
  "filename": "a1b2c3d4.jpg"
}

Errors:
  400 — Type de fichier non supporté, paramètre `type` manquant
  401 — Unauthorized
  413 — Fichier trop grand (limite recommandée: 5 MB)
```

**Comportement client :**
```typescript
// Le client vérifie si l'URI est déjà distante :
if (imageUri.startsWith("http")) {
  // Déjà uploadée → pas de nouvel upload
  return imageUri;
}
// Sinon → upload et remplace l'URI locale par l'URL distante
const { url } = await uploadImage(localUri, "product");
```

**Stockage recommandé :**
- Disque local : `./uploads/images/{uuid}.jpg`
- Ou S3/Cloudflare R2 pour la production
- Servir les fichiers via `ServeStaticModule` ou via CDN

---

## 7. Authentification

### 7.1 Flow actuel (client)

```typescript
// Le client stocke le token dans Zustand + AsyncStorage
// Il est passé dans chaque requête :
headers: { Authorization: `Bearer ${authToken}` }
```

### 7.2 Login vendeur (endpoint requis)
```
POST /api/v1/auth/login

Body:
{
  "name":     "Vendeur Défaut",
  "passcode": "1234"
}

Response 200:
{
  "token":  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "seller": {
    "syncId": "507f1f77bcf86cd799439020",
    "name":   "Vendeur Défaut"
  }
}

Errors:
  401 — Nom ou code incorrect
```

### 7.3 Recommandations sécurité
| Élément | Recommandation |
|---------|---------------|
| Passcode | `bcrypt` hash (salt rounds: 10) |
| Token JWT | Expiration: 30 jours (app offline-first) |
| Token refresh | Optionnel (implémenter si nécessaire) |
| HTTPS | Obligatoire en production |

---

## 8. Validation & DTOs

### 8.1 CreateProductDto
```typescript
export class CreateProductDto {
  @IsString() @IsNotEmpty()
  name: string;

  @IsString() @IsNotEmpty()
  brand: string;

  @IsEnum(["smartphone", "laptop", "tablet", "autre"])
  category: string;

  @IsString() @IsOptional()
  description?: string;

  @IsNumber() @Min(0)
  basePrice: number;

  @IsNumber() @Min(0) @IsInt()
  quantity: number;

  @IsUrl() @IsOptional()
  imageUri?: string;

  @IsISO8601()
  createdAt: string;

  @IsISO8601()
  stockUpdatedAt: string;
}
```

### 8.2 CreateAccessoryDto
```typescript
export class CreateAccessoryDto {
  @IsString() @IsNotEmpty()
  name: string;

  @IsEnum(["housse", "cable", "chargeur", "ecouteur", "boitier", "autre"])
  category: string;

  @IsString() @IsOptional()
  description?: string;

  @IsNumber() @Min(0)
  basePrice: number;

  @IsNumber() @Min(0) @IsInt()
  quantity: number;

  @IsUrl() @IsOptional()
  imageUri?: string;

  @IsISO8601()
  createdAt: string;

  @IsISO8601()
  stockUpdatedAt: string;
}
```

### 8.3 CreateSaleDto
```typescript
export class CreateSaleDto {
  @IsMongoId()
  sellerId: string;

  @IsMongoId() @IsOptional()
  productId?: string;

  @IsMongoId() @IsOptional()
  accessoryId?: string;

  @IsNumber() @Min(1) @IsInt()
  quantity: number;

  @IsNumber() @Min(0)
  unitPrice: number;

  @IsString() @IsOptional()
  color?: string;

  @IsString() @IsOptional()         // Validation IMEI possible (15 chiffres)
  imei?: string;

  @IsNumber() @Min(0) @IsOptional()
  ram?: number;

  @IsNumber() @Min(0) @IsOptional()
  rom?: number;

  @IsNumber() @IsOptional()
  apn?: number;

  @IsUrl() @IsOptional()
  attachmentUri?: string;

  @IsString() @IsOptional()
  buyerName?: string;

  @IsString() @IsOptional()
  buyerCin?: string;

  @IsISO8601()
  createdAt: string;
}
```

### 8.4 LoginDto
```typescript
export class LoginDto {
  @IsString() @IsNotEmpty()
  name: string;

  @IsString() @IsNotEmpty()
  passcode: string;
}
```

### 8.5 Format de réponse standardisé
```typescript
// Toutes les réponses wrappées dans :
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Exemple succès :
{ "success": true, "data": { "syncId": "...", "updatedAt": "..." } }

// Exemple erreur :
{ "success": false, "message": "Validation failed", "errors": [...] }
```

---

## 9. Constantes & Enums

### 9.1 Catégories produits
```typescript
type ProductCategory = "smartphone" | "laptop" | "tablet" | "autre";
```

### 9.2 Catégories accessoires
```typescript
type AccessoryCategory = "housse" | "cable" | "chargeur" | "ecouteur" | "boitier" | "autre";
```

### 9.3 Marques (101 entrées)
```
Apple, Samsung, Google, Xiaomi, Redmi, OnePlus, Oppo, Vivo, Huawei, Honor,
Motorola, Sony, Nokia, Asus, Realme, Lenovo, LG, HTC, ZTE, Meizu,
Asus ROG, Nubia, ZTE RedMagic, Black Shark, Lenovo Legion, CAT, Ulefone,
Doogee, Blackview, Oukitel, AGM, Kyocera, Sonim, Tecno, Infinix, Itel,
LeEco, Coolpad, Gionee, Lava, Micromax, Karbonn, InFocus, BLU, Wiko,
Alcatel, TCL, Symphony, QMobile, Condor, Evertek, Mobell, iTel, Walton,
Tecno Spark, Tecno Camon, Vodafone Smart, JioPhone, Kazuna, Hisense, Sharp,
BQ, Prestigio, Archos, IMO, Verykool, Goophone, HDC, Sophone, Lephone,
No Name, Generic, MTK Clone, Fake iPhone, Fake Samsung, Shenzhen Brand,
Palm, BlackBerry, Siemens, BenQ, Sagem, Philips, Toshiba, Panasonic, NEC,
Fujitsu, Ericsson, Autres
```

---

## 10. Structure NestJS recommandée

```
src/
├── main.ts
├── app.module.ts
│
├── common/
│   ├── filters/
│   │   └── http-exception.filter.ts    # Gestion globale des erreurs
│   ├── interceptors/
│   │   └── transform.interceptor.ts    # Wrapping des réponses
│   ├── guards/
│   │   └── jwt-auth.guard.ts
│   └── decorators/
│       └── public.decorator.ts         # @Public() pour les routes non protégées
│
├── auth/
│   ├── auth.module.ts
│   ├── auth.service.ts                 # Validation seller + génération JWT
│   ├── auth.controller.ts              # POST /auth/login
│   ├── jwt.strategy.ts
│   └── dto/
│       └── login.dto.ts
│
├── sellers/
│   ├── sellers.module.ts
│   ├── sellers.service.ts
│   ├── sellers.controller.ts
│   ├── schemas/
│   │   └── seller.schema.ts
│   └── dto/
│       └── create-seller.dto.ts
│
├── products/
│   ├── products.module.ts
│   ├── products.service.ts             # CRUD + résolution conflits
│   ├── products.controller.ts          # POST, PUT /:syncId, GET ?since=
│   ├── schemas/
│   │   └── product.schema.ts
│   └── dto/
│       ├── create-product.dto.ts
│       └── update-product.dto.ts
│
├── accessories/
│   ├── accessories.module.ts
│   ├── accessories.service.ts
│   ├── accessories.controller.ts
│   ├── schemas/
│   │   └── accessory.schema.ts
│   └── dto/
│       ├── create-accessory.dto.ts
│       └── update-accessory.dto.ts
│
├── sales/
│   ├── sales.module.ts
│   ├── sales.service.ts                # CREATE only (immuable)
│   ├── sales.controller.ts             # POST, GET ?since=
│   ├── schemas/
│   │   └── sale.schema.ts
│   └── dto/
│       └── create-sale.dto.ts
│
├── stock-movements/
│   ├── stock-movements.module.ts
│   ├── stock-movements.service.ts
│   ├── schemas/
│   │   └── stock-movement.schema.ts
│   └── dto/
│       └── create-stock-movement.dto.ts
│
├── uploads/
│   ├── uploads.module.ts
│   ├── uploads.service.ts              # Multer + gestion fichiers
│   ├── uploads.controller.ts           # POST /uploads/image
│   └── multer.config.ts
│
└── database/
    └── database.module.ts              # MongooseModule.forRootAsync
```

### Variables d'environnement (`.env`)
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/inventaire_intelligent
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=30d
UPLOAD_DEST=./uploads/images
MAX_FILE_SIZE=5242880        # 5 MB en bytes
```

---

## 11. Zones incomplètes (côté client)

Ces fonctionnalités existent côté client mais sont partiellement implémentées.
Le backend doit les anticiper :

| Fonctionnalité | État client | Action backend |
|----------------|-------------|----------------|
| **Dashboard stats** | Données mockées | Prévoir `GET /api/v1/stats` (total produits, ventes du jour, CA) |
| **Décrément stock après vente** | Non implémenté | Le serveur doit décrémenter `quantity` sur `POST /sales` |
| **Suppression produit/accessoire** | Commentée | Prévoir `DELETE /products/:syncId` avec soft delete |
| **Résolution conflits 409** | Non géré côté client | Implémenter `stockUpdatedAt` comparison |
| **Pull sync (fetch serveur)** | `fetchSince()` existe mais non appelé | `GET /products?since=` doit être fonctionnel |
| **Auth route guards** | Contexts OK, guards non actifs | `POST /auth/login` prioritaire |
| **OCR / Scanner** | Composants créés, non intégrés | Pas d'endpoint nécessaire pour l'instant |

---

*Document généré le 2026-03-02 depuis le code source de l'app mobile.*
