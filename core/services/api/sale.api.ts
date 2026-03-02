import { Sale } from "@/core/entity/sale.entity";
import { apiClient } from "./api.client";

export interface SaleApiResponse {
  syncId: string;
  createdAt: string;
}

export const saleApi = {
  create(sale: Omit<Sale, "id">): Promise<SaleApiResponse> {
    return apiClient.post<SaleApiResponse>("/sales", sale);
  },

  fetchSince(since: string): Promise<Sale[]> {
    return apiClient.get<Sale[]>(`/sales?since=${encodeURIComponent(since)}`);
  },
};
