import { create } from "zustand";

export interface ProcurementItem {
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
  // Stock actuel (référence)
  currentStock: number;
  // Champs d'approvisionnement
  quantityToOrder: number;
  estimatedUnitCost?: number;
  notes?: string;
}

interface ProcurementStore {
  items: ProcurementItem[];
  addItem: (item: ProcurementItem) => void;
  updateItem: (
    cartId: string,
    updates: Partial<
      Pick<ProcurementItem, "quantityToOrder" | "estimatedUnitCost" | "notes">
    >,
  ) => void;
  removeItem: (cartId: string) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalQuantity: () => number;
  totalEstimatedCost: () => number;
}

export const useProcurementStore = create<ProcurementStore>((set, get) => ({
  items: [],

  addItem: (item) =>
    set((state) => ({ items: [...state.items, item] })),

  updateItem: (cartId, updates) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.cartId === cartId ? { ...i, ...updates } : i,
      ),
    })),

  removeItem: (cartId) =>
    set((state) => ({
      items: state.items.filter((i) => i.cartId !== cartId),
    })),

  clearCart: () => set({ items: [] }),

  totalItems: () => get().items.length,

  totalQuantity: () =>
    get().items.reduce((sum, i) => sum + i.quantityToOrder, 0),

  totalEstimatedCost: () =>
    get().items.reduce(
      (sum, i) => sum + (i.estimatedUnitCost ?? 0) * i.quantityToOrder,
      0,
    ),
}));
