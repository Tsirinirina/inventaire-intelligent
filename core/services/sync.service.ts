import { getDatabase } from "@/core/database";
import { SyncPhase, SyncProgress, SyncResult } from "@/core/types/sync.types";
import { useSyncStore } from "@/core/store/sync.store";
import { accessoryApi } from "./api/accessory.api";
import { authApi } from "./api/auth.api";
import { productApi } from "./api/product.api";
import { saleApi } from "./api/sale.api";
import { uploadImage } from "./api/image.api";
import {
  getPendingAccessories,
  updateAccessorySyncMeta,
} from "./accessories.service";
import { getPendingProducts, updateProductSyncMeta } from "./product.service";
import { getPendingSales, updateSaleSyncMeta } from "./sale.service";

export interface SyncOptions {
  onProgress?: (p: SyncProgress) => void;
  /** Credentials du vendeur connecté, nécessaires pour obtenir un JWT */
  sellerName: string;
  sellerPasscode: string;
}

/**
 * Orchestrateur principal de synchronisation.
 *
 * Flux :
 *  1. Récupère tous les items 'pending' ou 'failed' depuis SQLite
 *  2. Pour chaque item avec une image locale → upload image en premier
 *  3. POST (création) ou PUT (mise à jour) vers NestJS
 *  4. Met à jour le sync_status + sync_id dans SQLite
 *
 * Resolution de conflits : last-write-wins via stockUpdatedAt.
 * Si le serveur retourne 409 Conflict, on garde la version serveur (future).
 */
export async function runSync(options: SyncOptions): Promise<SyncResult> {
  const db = getDatabase();
  const result: SyncResult = { synced: 0, failed: 0, errors: [] };

  const notify = (phase: SyncPhase, current: number, total: number) => {
    options.onProgress?.({ phase, current, total });
  };

  // ── 0. Authentification serveur ─────────────────────────────────────────
  // Crée le vendeur côté serveur s'il n'existe pas, puis obtient un JWT.
  await authApi.findOrCreateSeller(options.sellerName, options.sellerPasscode);
  const loginRes = await authApi.login(options.sellerName, options.sellerPasscode);
  useSyncStore.getState().setAuthToken(loginRes.token);

  // ── Collecte des éléments en attente ──────────────────────────────────────
  const pendingProducts = getPendingProducts(db);
  const pendingAccessories = getPendingAccessories(db);
  const pendingSales = getPendingSales(db);
  const total =
    pendingProducts.length + pendingAccessories.length + pendingSales.length;

  if (total === 0) return result;

  // ── 1. Produits ───────────────────────────────────────────────────────────
  for (let i = 0; i < pendingProducts.length; i++) {
    const product = pendingProducts[i];
    notify("products", i, pendingProducts.length);
    try {
      let imageUri = product.imageUri;
      if (imageUri && !imageUri.startsWith("http")) {
        notify("images", 0, 1);
        imageUri = await uploadImage(imageUri, "product");
      }

      const payload = { ...product, imageUri };
      const res = product.syncId
        ? await productApi.update(product.syncId, payload)
        : await productApi.create(payload);

      updateProductSyncMeta(db, product.id, res.syncId, "synced");
      result.synced++;
    } catch (err) {
      updateProductSyncMeta(
        db,
        product.id,
        product.syncId ?? "",
        "failed",
      );
      result.failed++;
      result.errors.push(
        `Produit « ${product.name} » : ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  // ── 2. Accessoires ────────────────────────────────────────────────────────
  for (let i = 0; i < pendingAccessories.length; i++) {
    const accessory = pendingAccessories[i];
    notify("accessories", i, pendingAccessories.length);
    try {
      let imageUri = accessory.imageUri;
      if (imageUri && !imageUri.startsWith("http")) {
        notify("images", 0, 1);
        imageUri = await uploadImage(imageUri, "accessory");
      }

      const payload = { ...accessory, imageUri };
      const res = accessory.syncId
        ? await accessoryApi.update(accessory.syncId, payload)
        : await accessoryApi.create(payload);

      updateAccessorySyncMeta(db, accessory.id, res.syncId, "synced");
      result.synced++;
    } catch (err) {
      updateAccessorySyncMeta(
        db,
        accessory.id,
        accessory.syncId ?? "",
        "failed",
      );
      result.failed++;
      result.errors.push(
        `Accessoire « ${accessory.name} » : ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  // ── 3. Ventes ─────────────────────────────────────────────────────────────
  for (let i = 0; i < pendingSales.length; i++) {
    const sale = pendingSales[i];
    notify("sales", i, pendingSales.length);
    try {
      const res = await saleApi.create(sale);
      updateSaleSyncMeta(db, sale.id, res.syncId, "synced");
      result.synced++;
    } catch (err) {
      updateSaleSyncMeta(db, sale.id, sale.syncId ?? "", "failed");
      result.failed++;
      result.errors.push(
        `Vente #${sale.id} : ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  return result;
}

/**
 * Compte les items en attente de sync (pour affichage dans les Paramètres).
 */
export function countPendingItems(): number {
  const db = getDatabase();
  return (
    getPendingProducts(db).length +
    getPendingAccessories(db).length +
    getPendingSales(db).length
  );
}
