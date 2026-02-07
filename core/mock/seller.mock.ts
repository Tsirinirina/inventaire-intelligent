import { NewSeller } from "../entity/seller.entity";

export const DEFAULT_SELLER_MOCK: NewSeller = {
  name: "vendeur",
  passcode: "0000",
  lastUpdateDate: new Date().toDateString(),
};
