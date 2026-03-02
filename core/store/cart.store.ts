import { create } from "zustand";

export interface CartItem {
  // Identifiant unique de la ligne panier
  cartId: string;
  // Référence à l'item en stock
  itemId: number;
  type: "product" | "accessory";
  // Infos d'affichage
  name: string;
  imageUri?: string;
  category: string;
  brand?: string;
  availableStock: number;
  // Champs de vente
  sellerId: number;
  quantity: number;
  unitPrice: number;
  imei?: string;
  color?: string;
  ram?: number;
  rom?: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (cartId: string) => void;
  clearCart: () => void;
  totalAmount: () => number;
  totalItems: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addItem: (item) =>
    set((state) => ({ items: [...state.items, item] })),

  removeItem: (cartId) =>
    set((state) => ({
      items: state.items.filter((i) => i.cartId !== cartId),
    })),

  clearCart: () => set({ items: [] }),

  totalAmount: () =>
    get().items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),

  totalItems: () =>
    get().items.reduce((sum, i) => sum + i.quantity, 0),
}));
