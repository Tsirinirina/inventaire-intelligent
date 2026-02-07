import createContextHook from "@nkzw/create-context-hook";
import { useQueryClient } from "@tanstack/react-query";
import { SALE_QUERY_KEY } from "../entity/sale.entity";
import { useMutationState } from "../hooks/mutationState";
import { useQueryState } from "../hooks/queryState";
import {
  useAddSaleQuery,
  useGetAllSalesQuery,
  useUpdateSaleQuery,
} from "../queries/sale.query";

export const [SaleProvider, useSale] = createContextHook(() => {
  const queryClient = useQueryClient();

  /**
   * Get all sales query
   */
  const getAllSalesQuery = useGetAllSalesQuery();
  const getAllSalesState = useQueryState(
    `${SALE_QUERY_KEY}s`,
    getAllSalesQuery,
    [],
  );

  /**
   * Add sale mutation
   */
  const addSaleQuery = useAddSaleQuery(queryClient);
  const addSaleState = useMutationState("add", SALE_QUERY_KEY, addSaleQuery);

  /**
   * Update sale mutation
   */
  const updateSaleQuery = useUpdateSaleQuery(queryClient);
  const updateSaleState = useMutationState(
    "update",
    SALE_QUERY_KEY,
    updateSaleQuery,
  );

  return {
    ...getAllSalesState,
    ...addSaleState,
    ...updateSaleState,
  };
});
