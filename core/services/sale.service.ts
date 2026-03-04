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

/**
 * Résout les FK locales (productId, accessoryId) en sync_id MongoDB
 * pour pouvoir envoyer la vente à l'API.
 * Le sellerSyncId est passé depuis l'orchestrateur (retourné par findOrCreateSeller).
 * Retourne null si un ID référencé n'a pas encore de sync_id.
 */
export function buildSalePayload(
  db: SQLiteDatabase,
  sale: Sale,
  sellerSyncId: string,
): Record<string, unknown> | null {
  let productSyncId: string | undefined;
  if (sale.productId) {
    const product = db.getFirstSync<{ sync_id: string | null }>(
      "SELECT sync_id FROM products WHERE id = ?",
      [sale.productId],
    );
    if (!product?.sync_id) return null;
    productSyncId = product.sync_id;
  }

  let accessorySyncId: string | undefined;
  if (sale.accessoryId) {
    const accessory = db.getFirstSync<{ sync_id: string | null }>(
      "SELECT sync_id FROM accessories WHERE id = ?",
      [sale.accessoryId],
    );
    if (!accessory?.sync_id) return null;
    accessorySyncId = accessory.sync_id;
  }

  return {
    sellerId: sellerSyncId,
    productId: productSyncId,
    accessoryId: accessorySyncId,
    quantity: sale.quantity,
    unitPrice: sale.unitPrice,
    color: sale.color || undefined,
    imei: sale.imei || undefined,
    ram: sale.ram || undefined,
    rom: sale.rom || undefined,
    apn: sale.apn || undefined,
    attachmentUri: sale.attachmentUri || undefined,
    buyerName: sale.buyerName || undefined,
    buyerCin: sale.buyerCin || undefined,
    createdAt: sale.createdAt,
  };
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
