import { SQLiteDatabase } from "expo-sqlite";
import { Accessory, NewAccessory } from "../entity/accessory.entity";
import { ServerAccessory } from "../types/sync.types";
import { addStockMovement } from "./stock_movement.service";

/**
 * Get all accessories
 * @param db
 * @returns
 */
export function getAllAccessory(db: SQLiteDatabase): Accessory[] {
  const result = db!.getAllSync<Accessory>(
    "SELECT * FROM accessories ORDER BY stockUpdatedAt DESC",
  );
  return result;
}

/**
 * Add Accessory
 * @param db
 * @param dto
 * @returns
 */
export function addAccessory(db: SQLiteDatabase, dto: NewAccessory): number {
  const result = db!.runSync(
    `INSERT INTO accessories
      (name, category, description, basePrice, quantity, imageUri, createdAt, stockUpdatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      dto.name,
      dto.category,
      dto.description || null,
      dto.basePrice,
      dto.quantity,
      dto.imageUri || null,
      dto.createdAt,
      dto.stockUpdatedAt,
    ],
  );
  const id = result.lastInsertRowId;
  if (dto.quantity > 0) {
    addStockMovement(db, {
      itemType: "accessory",
      itemId: id,
      itemName: dto.name,
      quantity: dto.quantity,
      createdAt: dto.createdAt,
    });
  }
  return id;
}

/**
 * Update Accessory
 * @param db
 * @param dto
 * @returns
 */
export function updateAccessory(db: SQLiteDatabase, dto: Accessory): boolean {
  const old = db.getFirstSync<{ quantity: number }>(
    "SELECT quantity FROM accessories WHERE id = ?",
    [dto.id],
  );
  db!.runSync(
    `UPDATE accessories
       SET name = ?, category = ?, description = ?, basePrice = ?, quantity = ?, imageUri = ?, createdAt = ?, stockUpdatedAt = ?
       WHERE id = ?`,
    [
      dto.name,
      dto.category,
      dto.description || null,
      dto.basePrice,
      dto.quantity,
      dto.imageUri || null,
      dto.createdAt,
      dto.stockUpdatedAt,
      dto.id,
    ],
  );
  if (old && dto.quantity > old.quantity) {
    addStockMovement(db, {
      itemType: "accessory",
      itemId: dto.id,
      itemName: dto.name,
      quantity: dto.quantity - old.quantity,
      createdAt: dto.stockUpdatedAt,
    });
  }
  return true;
}

export function deleteAccessory(db: SQLiteDatabase, id: number): boolean {
  db.runSync(`DELETE FROM accessories WHERE id = ?`, [id]);
  return true;
}

// ─── Sync helpers ────────────────────────────────────────────────────────────

export function getPendingAccessories(db: SQLiteDatabase): Accessory[] {
  return db.getAllSync<Accessory>(
    "SELECT * FROM accessories WHERE sync_status = 'pending' OR sync_status = 'failed'",
  );
}

export function updateAccessorySyncMeta(
  db: SQLiteDatabase,
  id: number,
  syncId: string,
  status: "synced" | "failed",
): void {
  db.runSync(
    `UPDATE accessories SET sync_id = ?, sync_status = ?, synced_at = ? WHERE id = ?`,
    [syncId, status, status === "synced" ? new Date().toISOString() : null, id],
  );
}

export function markAccessoryPending(db: SQLiteDatabase, id: number): void {
  db.runSync(`UPDATE accessories SET sync_status = 'pending' WHERE id = ?`, [id]);
}

// ─── Pull sync helpers ──────────────────────────────────────────────────────

/**
 * Upsert un accessoire reçu du serveur dans SQLite.
 *
 * - Aucun enregistrement local avec ce sync_id → INSERT (sync_status = 'synced')
 * - Enregistrement local avec sync_status pending/failed → SKIP (ne pas écraser)
 * - Enregistrement local synced + serveur plus récent → UPDATE (last-write-wins)
 */
export function upsertPulledAccessory(
  db: SQLiteDatabase,
  server: ServerAccessory,
): "inserted" | "updated" | "skipped" {
  const existing = db.getFirstSync<{
    id: number;
    sync_status: string;
    stockUpdatedAt: string;
  }>(
    "SELECT id, sync_status, stockUpdatedAt FROM accessories WHERE sync_id = ?",
    [server.syncId],
  );

  if (!existing) {
    db.runSync(
      `INSERT INTO accessories
        (name, category, description, basePrice, quantity, imageUri, createdAt, stockUpdatedAt, sync_id, sync_status, synced_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'synced', ?)`,
      [
        server.name,
        server.category,
        server.description || null,
        server.basePrice,
        server.quantity,
        server.imageUri || null,
        server.createdAt,
        server.stockUpdatedAt,
        server.syncId,
        new Date().toISOString(),
      ],
    );
    return "inserted";
  }

  if (existing.sync_status === "pending" || existing.sync_status === "failed") {
    return "skipped";
  }

  const serverTime = new Date(server.stockUpdatedAt).getTime();
  const localTime = new Date(existing.stockUpdatedAt).getTime();

  if (serverTime <= localTime) {
    return "skipped";
  }

  db.runSync(
    `UPDATE accessories
     SET name = ?, category = ?, description = ?, basePrice = ?,
         quantity = ?, imageUri = ?, createdAt = ?, stockUpdatedAt = ?, synced_at = ?
     WHERE id = ?`,
    [
      server.name,
      server.category,
      server.description || null,
      server.basePrice,
      server.quantity,
      server.imageUri || null,
      server.createdAt,
      server.stockUpdatedAt,
      new Date().toISOString(),
      existing.id,
    ],
  );
  return "updated";
}
