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
     (sellerId, productId, accessoryId, quantity, unitPrice, color, imei, ram, rom, apn, attachmentUri, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      dto.sellerId,
      dto.productId || null, // clé étrangère facultative
      dto.accessoryId || null, // clé étrangère facultative
      dto.quantity,
      dto.unitPrice,
      dto.color || null,
      dto.imei || null,
      dto.ram || null,
      dto.rom || null,
      dto.apn || null,
      dto.attachmentUri || null,
      dto.createdAt,
    ],
  );
  return result.lastInsertRowId;
}
/**
 * Update sale
 */
export function updateSale(db: SQLiteDatabase, dto: Sale): boolean {
  db!.runSync(
    `UPDATE sales
       SET sellerId = ?, productId = ?, accessoryId = ?, quantity = ?, unitPrice = ?, color = ?, imei = ?, ram = ?, rom = ?, apn = ?, attachmentUri = ?, createdAt = ?
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
      dto.createdAt,
      dto.id,
    ],
  );
  return true;
}
