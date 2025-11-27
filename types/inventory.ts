export interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  description: string;
  quantity: number;
  category: "smartphone" | "laptop" | "tablet" | "autre";
  dateAdded: string;
  imageUri?: string;
}

export interface Sale {
  id: number;
  productUniqueId: string;
  productName: string;
  category: string;
  type: "product" | "accessory";
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  saleDate: string;
}

export interface Accessory {
  id: number;
  name: string;
  price: number;
  category: "housse" | "cable" | "chargeur" | "ecouteur" | "boitier" | "autre";
  description?: string;
  quantity: number;
  dateAdded: string;
  imageUri?: string;
}

export interface ProductAndAccessory {
  id: number;
  name: string;
  brand: string;
  price: number;
  description: string;
  quantity: number;
  category:
    | "smartphone"
    | "laptop"
    | "tablet"
    | "autre"
    | "housse"
    | "cable"
    | "chargeur"
    | "ecouteur"
    | "boitier"
    | "autre";
  dateAdded: string;
  imageUri?: string;
}

export type NewProduct = Omit<Product, "id">;
export type NewSale = Omit<Sale, "id">;
export type NewAccessory = Omit<Accessory, "id">;
