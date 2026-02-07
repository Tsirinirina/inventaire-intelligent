import { AccessoryCategory } from "./accessory.entity";
import { ProductCategory } from "./product.entity";

export interface Sale {
  id: number;
  sellerId: number;
  productId?: number;
  accessoryId?: number;
  quantity: number;
  unitPrice: number;
  color?: string;
  imei?: string;
  ram?: number;
  rom?: number;
  apn?: number;
  attachmentUri?: string;
  createdAt: string;
}

export type NewSale = Omit<Sale, "id">;

export interface SellableItem {
  id: number;
  type: "product" | "accessory";
  name: string;
  brand?: string;
  category: ProductCategory | AccessoryCategory;
  basePrice: number;
  quantity: number;
  imageUri?: string;
}
