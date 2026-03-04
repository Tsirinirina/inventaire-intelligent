// ─── Statut de synchronisation ──────────────────────────────────────────────
export type SyncStatus = "pending" | "synced" | "failed";

// ─── Champs ajoutés à chaque entité synchronisable ──────────────────────────
export interface SyncMeta {
  /** UUID assigné par le serveur après la première sync réussie */
  syncId: string | null;
  /** État local de la synchronisation */
  syncStatus: SyncStatus;
  /** ISO timestamp de la dernière sync réussie */
  syncedAt: string | null;
}

// ─── Résultat retourné par le sync orchestrator ──────────────────────────────
export interface SyncResult {
  synced: number;
  failed: number;
  errors: string[];
  pulled: number;
}

// ─── Progression en temps réel ───────────────────────────────────────────────
export type SyncPhase =
  | "images"
  | "products"
  | "accessories"
  | "sales"
  | "pull-products"
  | "pull-accessories";

export interface SyncProgress {
  phase: SyncPhase;
  current: number;
  total: number;
}

// ─── Données serveur reçues lors du PULL ─────────────────────────────────────
export interface ServerProduct {
  syncId: string;
  name: string;
  brand: string;
  category: string;
  description?: string;
  basePrice: number;
  quantity: number;
  imageUri?: string;
  createdAt: string;
  stockUpdatedAt: string;
}

export interface ServerAccessory {
  syncId: string;
  name: string;
  category: string;
  description?: string;
  basePrice: number;
  quantity: number;
  imageUri?: string;
  createdAt: string;
  stockUpdatedAt: string;
}
