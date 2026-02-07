import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { getDatabase } from "../database";
import { NewSeller, SELLER_QUERY_KEY } from "../entity/seller.entity";
import {
  createSeller,
  getSellerById,
  getSellerByName,
  loginSeller,
} from "../services/seller.service";

/**
 * Get seller by id
 */
export function useGetSellerByIdQuery(id?: number) {
  const db = getDatabase();

  return useQuery({
    queryKey: [SELLER_QUERY_KEY, "id", id],
    queryFn: () => (id ? getSellerById(db, id) : null),
    enabled: !!id,
  });
}

/**
 * Get seller by name
 */
export function useGetSellerByNameQuery(name?: string) {
  const db = getDatabase();

  return useQuery({
    queryKey: [SELLER_QUERY_KEY, "name", name],
    queryFn: () => (name ? getSellerByName(db, name) : null),
    enabled: !!name,
  });
}

/**
 * Create seller
 */
export function useCreateSellerQuery(queryClient: QueryClient) {
  const db = getDatabase();

  return useMutation({
    mutationFn: async (dto: NewSeller) => createSeller(db, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SELLER_QUERY_KEY] });
    },
  });
}

/**
 * Login seller
 */
export function useLoginSellerQuery() {
  const db = getDatabase();

  return useMutation({
    mutationFn: async ({
      name,
      passcode,
    }: {
      name: string;
      passcode: string;
    }) => loginSeller(db, name, passcode),
  });
}
