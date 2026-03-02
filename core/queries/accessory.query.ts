import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { getDatabase } from "../database";
import {
  Accessory,
  ACCESSORY_QUERY_KEY,
  NewAccessory,
} from "../entity/accessory.entity";
import { STOCK_MOVEMENT_QUERY_KEY } from "../entity/stock_movement.entity";
import {
  addAccessory,
  deleteAccessory,
  getAllAccessory,
  updateAccessory,
} from "../services/accessories.service";

/**
 * GetAll Accessories Query
 * @returns
 */
export function useGetAllAccessoryQuery() {
  const db = getDatabase();
  return useQuery({
    queryKey: [ACCESSORY_QUERY_KEY],
    queryFn: () => getAllAccessory(db),
  });
}

/**
 * Add Accessory Mutation
 */
export function useAddAccessoryQuery(queryClient: QueryClient) {
  const db = getDatabase();
  return useMutation({
    mutationFn: async (dto: NewAccessory) => {
      return addAccessory(db, dto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ACCESSORY_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [STOCK_MOVEMENT_QUERY_KEY] });
    },
  });
}

/**
 * Update Accessory Mutation
 */
export function useUpdateAccessoryQuery(queryClient: QueryClient) {
  const db = getDatabase();
  return useMutation({
    mutationFn: async (dto: Accessory) => {
      return updateAccessory(db, dto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ACCESSORY_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [STOCK_MOVEMENT_QUERY_KEY] });
    },
  });
}

/**
 * Delete Accessory Mutation
 */
export function useDeleteAccessoryQuery(queryClient: QueryClient) {
  const db = getDatabase();
  return useMutation({
    mutationFn: async (id: number) => {
      return deleteAccessory(db, id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [ACCESSORY_QUERY_KEY],
      });
    },
  });
}
