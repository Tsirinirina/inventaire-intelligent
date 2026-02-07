export type AccessoryCategory =
  | "housse"
  | "cable"
  | "chargeur"
  | "ecouteur"
  | "boitier"
  | "autre";

export interface Accessory {
  id: number;
  name: string;
  category: AccessoryCategory;
  description?: string;
  basePrice: number;
  quantity: number;
  imageUri?: string;
  createdAt: string;
}

export type NewAccessory = Omit<Accessory, "id">;
