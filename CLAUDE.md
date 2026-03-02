# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Start with cache cleared (recommended during development)
npx expo start -c

# Start normally
npx expo start

# Run on Android / iOS
npx expo run:android
npx expo run:ios

# Lint
npx expo lint
```

There are no tests in this project.

## Architecture

**React Native + Expo** mobile app for offline-first inventory management (smartphones, accessories, sales).

### Data Flow

```
UI (app/) → Context (core/contexts/) → React Query (core/queries/) → Service (core/services/) → SQLite (core/database/)
```

Every domain follows this exact 4-layer pattern. The SQLite database (`inventaire1.db`) is the single source of truth. React Query wraps all DB access and handles cache invalidation automatically after mutations.

### Key Structural Patterns

**Context + `createContextHook`** — All domain state is exposed via `@nkzw/create-context-hook`. Each context exports `[Provider, useHook]`. Providers are stacked in `app/_layout.tsx`.

```tsx
export const [ProductProvider, useProduct] = createContextHook(() => { ... });
```

**`useMutationState` helper** — Wraps a React Query mutation and returns dynamically-typed keys:
- `addProduct` (the mutateAsync fn)
- `productAdding` (isPending boolean)
- `productAddingError` (the error)

**`useQueryState` helper** — Wraps a `useQuery` result and exposes typed data with a default fallback.

**Forms** — All forms use `react-hook-form` + `zod` resolver. Zod schemas are in `core/forms/`. Note: numeric fields (price, quantity) are stored as `z.string()` and converted to numbers at submit time.

### Domain Entities

Defined in `core/entity/`:
- `Product` — smartphone/laptop/tablet. Fields: `name, brand, category, description, basePrice, quantity, imageUri, createdAt, stockUpdatedAt`
- `Accessory` — housse/câble/chargeur/écouteur/boîtier/autre. Same structure minus `brand`.
- `Sale` — links to a `sellerId` + either `productId` or `accessoryId`. Includes `imei, ram, rom, color, unitPrice, quantity`.
- `Seller` — `name, passcode`. A default seller is seeded at DB init.

Use `NewProduct = Omit<Product, "id">` pattern for create DTOs.

### Navigation

File-based routing via `expo-router`. Main structure:
```
app/(auth)/
  login.tsx       # Écran de connexion (react-hook-form + zod + useTheme)
app/(tabs)/
  dashboard/      # Stats temps réel via useInventory()
  stock/
    product/      # add.tsx + edit/[id].tsx
    accessory/    # add.tsx + edit/[id].tsx
  sales/
    index.tsx     # Liste produits+accessoires vendables
    add.tsx       # Formulaire ajout panier (avec scanner IMEI)
    cart.tsx      # Panier + confirmation (addSale + stock decrement + toast)
```

### Theme

`useTheme()` from `theme/ThemeProvider.tsx` returns the current theme object. Always use this hook for colors — never hardcode hex values. Light and dark palettes are defined in `theme/colors.ts`.

### Toast Notifications

Use the `useToast()` hook (from `components/ui/Toast`) for user feedback. The `ToastContainer` is mounted at the root.

### Image Handling

Images are saved to the local file system (`expo-file-system`) and their URI stored in the DB column `imageUri`. `expo-image-picker` and `expo-camera` are both used for capture.

## Fonctionnalités complètes

- **Dashboard** : stats temps réel depuis SQLite via `InventoryContext`
- **Delete** : `deleteProduct` / `deleteAccessory` opérationnels (service + context + UI)
- **Sales confirmation** : `cart.tsx` enregistre les ventes, décrémente le stock, toast succès
- **Auth** : login screen + `_layout.tsx` redirige vers `/(auth)/login` si non authentifié
- **Scanner IMEI** : `NumberScanner` (OCR) intégré dans `sales/add.tsx`
