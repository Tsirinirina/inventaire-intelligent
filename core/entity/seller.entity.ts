export interface Seller {
  id: number;
  name: string;
  passcode?: string;
  lastUpdateDate?: string;
  syncId?: string | null;
}

export type NewSeller = Omit<Seller, "id" | "syncId">;
export const SELLER_QUERY_KEY = "seller";
