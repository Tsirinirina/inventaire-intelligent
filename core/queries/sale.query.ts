import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { getDatabase } from "../database";
import { NewSale, Sale, SALE_QUERY_KEY } from "../entity/sale.entity";
import { addSale, getAllSales, updateSale } from "../services/sale.service";

/**
 * Get all sales query
 */
export function useGetAllSalesQuery() {
  const db = getDatabase();
  return useQuery({
    queryKey: [SALE_QUERY_KEY],
    queryFn: () => getAllSales(db),
  });
}

/**
 * Add sale mutation
 */
export function useAddSaleQuery(queryClient: QueryClient) {
  const db = getDatabase();
  return useMutation({
    mutationFn: async (dto: NewSale) => addSale(db, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SALE_QUERY_KEY] });
    },
  });
}

/**
 * Update sale mutation
 */
export function useUpdateSaleQuery(queryClient: QueryClient) {
  const db = getDatabase();
  return useMutation({
    mutationFn: async (dto: Sale) => updateSale(db, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SALE_QUERY_KEY] });
    },
  });
}
