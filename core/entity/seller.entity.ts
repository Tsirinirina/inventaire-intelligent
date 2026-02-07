export interface Seller {
  id: number;
  name: string;
  passcode: string;
  lastUpdateDate?: string;
}

export type NewSeller = Omit<Seller, "id">;
