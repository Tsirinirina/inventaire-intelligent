import { Product } from "@/core/entity/product.entity";
import { apiClient } from "./api.client";

/** Réponse serveur après création / mise à jour */
export interface ProductApiResponse {
  syncId: string;
  updatedAt: string;
}

/**
 * NestJS endpoints attendus :
 *   POST   /api/v1/products          → créer un produit
 *   PUT    /api/v1/products/:syncId   → mettre à jour
 *   GET    /api/v1/products/pending   → pull (future)
 */
export const productApi = {
  create(product: Omit<Product, "id">): Promise<ProductApiResponse> {
    return apiClient.post<ProductApiResponse>("/products", product);
  },

  update(
    syncId: string,
    product: Omit<Product, "id">,
  ): Promise<ProductApiResponse> {
    return apiClient.put<ProductApiResponse>(`/products/${syncId}`, product);
  },

  /** Pull des changements depuis le serveur (pour la sync bidirectionnelle) */
  fetchSince(since: string): Promise<Product[]> {
    return apiClient.get<Product[]>(`/products?since=${encodeURIComponent(since)}`);
  },
};
