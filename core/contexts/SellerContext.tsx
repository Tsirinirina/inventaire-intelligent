/* eslint-disable react-hooks/rules-of-hooks */
import createContextHook from "@nkzw/create-context-hook";
import { useQueryClient } from "@tanstack/react-query";
import { SELLER_QUERY_KEY } from "../entity/seller.entity";
import { useMutationState } from "../hooks/mutationState";
import { useQueryState } from "../hooks/queryState";
import {
  useCreateSellerQuery,
  useGetSellerByIdQuery,
  useGetSellerByNameQuery,
} from "../queries/seller.query";

export const [SellerProvider, useSeller] = createContextHook(() => {
  const queryClient = useQueryClient();

  /**
   * Create seller
   */
  const createSellerQuery = useCreateSellerQuery(queryClient);
  const createSellerState = useMutationState(
    "add",
    SELLER_QUERY_KEY,
    createSellerQuery,
  );

  /**
   * Get seller by id (lazy)
   */
  const getSellerById = (id: number) => {
    const query = useGetSellerByIdQuery(id);
    return useQueryState("getById", query, null);
  };

  /**
   * Get seller by name (lazy)
   */
  const getSellerByName = (name: string) => {
    const query = useGetSellerByNameQuery(name);
    return useQueryState("getByName", query, null);
  };

  return {
    ...createSellerState,
    getSellerById,
    getSellerByName,
  };
});
