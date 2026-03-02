export type StockMovementItemType = "product" | "accessory";

export interface StockMovement {
  id: number;
  itemType: StockMovementItemType;
  itemId: number;
  itemName: string;
  quantity: number; // toujours positif (quantité ajoutée)
  createdAt: string;
}

export type NewStockMovement = Omit<StockMovement, "id">;
export const STOCK_MOVEMENT_QUERY_KEY = "stockMovement";
