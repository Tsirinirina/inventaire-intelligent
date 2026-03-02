import { SyncMeta } from "@/core/types/sync.types";

export type ProductCategory = "smartphone" | "laptop" | "tablet" | "autre";

export interface Product extends SyncMeta {
  id: number;
  name: string;
  brand: string;
  category: ProductCategory;
  description?: string;
  basePrice: number;
  quantity: number;
  imageUri?: string;
  createdAt: string;
  stockUpdatedAt: string;
}

export type NewProduct = Omit<Product, "id" | "syncId" | "syncStatus" | "syncedAt">;
export const PRODUCT_QUERY_KEY = "product";
