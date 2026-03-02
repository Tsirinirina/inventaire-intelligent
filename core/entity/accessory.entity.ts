import { SyncMeta } from "@/core/types/sync.types";

export type AccessoryCategory =
  | "housse"
  | "cable"
  | "chargeur"
  | "ecouteur"
  | "boitier"
  | "autre";

export interface Accessory extends SyncMeta {
  id: number;
  name: string;
  category: AccessoryCategory;
  description?: string;
  basePrice: number;
  quantity: number;
  imageUri?: string;
  createdAt: string;
  stockUpdatedAt: string;
}

export type NewAccessory = Omit<Accessory, "id" | "syncId" | "syncStatus" | "syncedAt">;
export const ACCESSORY_QUERY_KEY = "accessory";
