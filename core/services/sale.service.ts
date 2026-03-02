import { SQLiteDatabase } from "expo-sqlite";
import { NewSale, Sale } from "../entity/sale.entity";

/**
 * Get all sales
 */
export function getAllSales(db: SQLiteDatabase): Sale[] {
  return db!.getAllSync<Sale>("SELECT * FROM sales ORDER BY createdAt DESC");
}

/**
 * Add sale
 */
export function addSale(db: SQLiteDatabase, dto: NewSale): number {
  const result = db!.runSync(
    `INSERT INTO sales
     (sellerId, productId, accessoryId, quantity, unitPrice, color, imei, ram, rom, apn, attachmentUri, buyerName, buyerCin, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      dto.sellerId,
      dto.productId || null,
      dto.accessoryId || null,
      dto.quantity,
      dto.unitPrice,
      dto.color || null,
      dto.imei || null,
      dto.ram || null,
      dto.rom || null,
      dto.apn || null,
      dto.attachmentUri || null,
      dto.buyerName || null,
      dto.buyerCin || null,
      dto.createdAt,
    ],
  );
  return result.lastInsertRowId;
}
/**
 * Update sale
 */
// ─── Sync helpers ────────────────────────────────────────────────────────────

export function getPendingSales(db: SQLiteDatabase): Sale[] {
  return db.getAllSync<Sale>(
    "SELECT * FROM sales WHERE sync_status = 'pending' OR sync_status = 'failed'",
  );
}

export function updateSaleSyncMeta(
  db: SQLiteDatabase,
  id: number,
  syncId: string,
  status: "synced" | "failed",
): void {
  db.runSync(
    `UPDATE sales SET sync_id = ?, sync_status = ?, synced_at = ? WHERE id = ?`,
    [syncId, status, status === "synced" ? new Date().toISOString() : null, id],
  );
}

export function updateSale(db: SQLiteDatabase, dto: Sale): boolean {
  db!.runSync(
    `UPDATE sales
       SET sellerId = ?, productId = ?, accessoryId = ?, quantity = ?, unitPrice = ?, color = ?, imei = ?, ram = ?, rom = ?, apn = ?, attachmentUri = ?, buyerName = ?, buyerCin = ?, createdAt = ?
       WHERE id = ?`,
    [
      dto.sellerId,
      dto.productId || null,
      dto.accessoryId || null,
      dto.quantity,
      dto.unitPrice,
      dto.color || null,
      dto.imei || null,
      dto.ram || null,
      dto.rom || null,
      dto.apn || null,
      dto.attachmentUri || null,
      dto.buyerName || null,
      dto.buyerCin || null,
      dto.createdAt,
      dto.id,
    ],
  );
  return true;
}
