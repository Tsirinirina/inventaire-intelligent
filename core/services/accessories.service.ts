import { SQLiteDatabase } from "expo-sqlite";
import { Accessory, NewAccessory } from "../entity/accessory.entity";

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
  return result.lastInsertRowId;
}

/**
 * Update Accessory
 * @param db
 * @param dto
 * @returns
 */
export function updateAccessory(db: SQLiteDatabase, dto: Accessory): boolean {
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
  return true;
}
