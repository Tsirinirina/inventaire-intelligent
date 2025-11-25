export interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  description: string;
  quantity: number;
  dateAdded: string;
  imageUri?: string;
}

export interface Sale {
  id: number;
  productId: number;
  productName: string;
  brand: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  saleDate: string;
}

export type NewProduct = Omit<Product, "id">;
export type NewSale = Omit<Sale, "id">;
