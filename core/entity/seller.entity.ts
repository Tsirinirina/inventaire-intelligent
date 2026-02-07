export interface Seller {
  id: number;
  name: string;
  passcode: string;
  lastUpdateDate?: string;
}

export type NewSeller = Omit<Seller, "id">;
export const SELLER_QUERY_KEY = "seller";
