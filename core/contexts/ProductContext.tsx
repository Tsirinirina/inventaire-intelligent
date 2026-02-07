import createContextHook from "@nkzw/create-context-hook";
import { useQueryClient } from "@tanstack/react-query";
import { PRODUCT_QUERY_KEY } from "../entity/product.entity";
import { useMutationState } from "../hooks/mutationState";
import { useQueryState } from "../hooks/queryState";
import {
  useAddProductQuery,
  useGetAllProductsQuery,
  useUpdateProductQuery,
} from "../queries/product.query";

export const [ProductProvider, useProduct] = createContextHook(() => {
  const queryClient = useQueryClient();

  /**
   * Get all products query
   */
  const getAllProductsQuery = useGetAllProductsQuery();
  const getAllProductsState = useQueryState(
    `${PRODUCT_QUERY_KEY}s`,
    getAllProductsQuery,
    [],
  );

  /**
   * Ad product Query
   */
  const addProductQuery = useAddProductQuery(queryClient);
  const addProductState = useMutationState(
    "add",
    PRODUCT_QUERY_KEY,
    addProductQuery,
  );

  /**
   * Update product query
   */
  const updateProductQuery = useUpdateProductQuery(queryClient);
  const updateProductState = useMutationState(
    "update",
    PRODUCT_QUERY_KEY,
    updateProductQuery,
  );

  return {
    ...getAllProductsState,
    ...addProductState,
    ...updateProductState,
  };
});
