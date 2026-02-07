import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { getDatabase } from "../database";
import {
  NewProduct,
  Product,
  PRODUCT_QUERY_KEY,
} from "../entity/product.entity";
import {
  addProduct,
  getAllProduct,
  updateProduct,
} from "../services/product.service";

/**
 * GetAll product Query
 * @returns
 */
export function useGetAllProductsQuery() {
  const db = getDatabase();
  return useQuery({
    queryKey: [PRODUCT_QUERY_KEY],
    queryFn: () => getAllProduct(db),
  });
}

export function useAddProductQuery(queryClient: QueryClient) {
  const db = getDatabase();
  return useMutation({
    mutationFn: async (dto: NewProduct) => {
      return addProduct(db, dto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [PRODUCT_QUERY_KEY],
      });
    },
  });
}

export function useUpdateProductQuery(queryClient: QueryClient) {
  const db = getDatabase();
  return useMutation({
    mutationFn: async (dto: Product) => {
      return updateProduct(db, dto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [PRODUCT_QUERY_KEY],
      });
    },
  });
}
