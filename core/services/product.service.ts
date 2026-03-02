import { NewProduct, Product } from "@/core/entity/product.entity";
import { SQLiteDatabase } from "expo-sqlite";
import { addStockMovement } from "./stock_movement.service";

/**
 * Get all product
 * @param db
 * @returns
 */
export function getAllProduct(db: SQLiteDatabase): Product[] {
  const result = db!.getAllSync<Product>(
    "SELECT * FROM products ORDER BY stockUpdatedAt DESC",
  );
  return result;
}

/**
 * Add product
 * @param db
 * @param product
 * @returns
 */
export function addProduct(db: SQLiteDatabase, dto: NewProduct): number {
  const result = db!.runSync(
    `INSERT INTO products (name, brand, category, description, basePrice, quantity, imageUri, createdAt, stockUpdatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      dto.name,
      dto.brand,
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
      itemType: "product",
      itemId: id,
      itemName: dto.name,
      quantity: dto.quantity,
      createdAt: dto.createdAt,
    });
  }
  return id;
}

/**
 * Update product
 * @param db
 * @param dto
 * @returns
 */
export function updateProduct(db: SQLiteDatabase, dto: Product): boolean {
  const old = db.getFirstSync<{ quantity: number }>(
    "SELECT quantity FROM products WHERE id = ?",
    [dto.id],
  );
  db!.runSync(
    `UPDATE products
         SET name = ?, brand = ?, category = ?, description = ?, basePrice = ?, quantity = ?, imageUri = ?, createdAt = ?, stockUpdatedAt = ?
         WHERE id = ?`,
    [
      dto.name,
      dto.brand,
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
  // Enregistrer un mouvement si le stock a augmenté (réapprovisionnement manuel)
  if (old && dto.quantity > old.quantity) {
    addStockMovement(db, {
      itemType: "product",
      itemId: dto.id,
      itemName: dto.name,
      quantity: dto.quantity - old.quantity,
      createdAt: dto.stockUpdatedAt,
    });
  }
  return true;
}

export function deleteProduct(db: SQLiteDatabase, id: number): boolean {
  db.runSync(`DELETE FROM products WHERE id = ?`, [id]);
  return true;
}

// ─── Sync helpers ────────────────────────────────────────────────────────────

export function getPendingProducts(db: SQLiteDatabase): Product[] {
  return db.getAllSync<Product>(
    "SELECT * FROM products WHERE sync_status = 'pending' OR sync_status = 'failed'",
  );
}

export function updateProductSyncMeta(
  db: SQLiteDatabase,
  id: number,
  syncId: string,
  status: "synced" | "failed",
): void {
  db.runSync(
    `UPDATE products SET sync_id = ?, sync_status = ?, synced_at = ? WHERE id = ?`,
    [syncId, status, status === "synced" ? new Date().toISOString() : null, id],
  );
}

export function markProductPending(db: SQLiteDatabase, id: number): void {
  db.runSync(`UPDATE products SET sync_status = 'pending' WHERE id = ?`, [id]);
}
