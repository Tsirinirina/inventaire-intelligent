import { SQLiteDatabase } from "expo-sqlite";
import { NewStockMovement, StockMovement } from "../entity/stock_movement.entity";

export function getAllStockMovements(db: SQLiteDatabase): StockMovement[] {
  return db.getAllSync<StockMovement>(
    "SELECT * FROM stock_movements ORDER BY createdAt DESC",
  );
}

export function addStockMovement(
  db: SQLiteDatabase,
  dto: NewStockMovement,
): void {
  db.runSync(
    `INSERT INTO stock_movements (itemType, itemId, itemName, quantity, createdAt)
     VALUES (?, ?, ?, ?, ?)`,
    [dto.itemType, dto.itemId, dto.itemName, dto.quantity, dto.createdAt],
  );
}
