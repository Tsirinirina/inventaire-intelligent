import { NewProduct, Product } from "@/core/entity/product.entity";
import { SQLiteDatabase } from "expo-sqlite";

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
  return result.lastInsertRowId;
}

/**
 * Update product
 * @param db
 * @param dto
 * @returns
 */
export function updateProduct(db: SQLiteDatabase, dto: Product): boolean {
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
  return true;
}
