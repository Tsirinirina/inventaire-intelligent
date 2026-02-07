import createContextHook from "@nkzw/create-context-hook";
import { useQueryClient } from "@tanstack/react-query";
import { ACCESSORY_QUERY_KEY } from "../entity/accessory.entity";
import { useMutationState } from "../hooks/mutationState";
import { useQueryState } from "../hooks/queryState";
import {
  useAddAccessoryQuery,
  useGetAllAccessoryQuery,
  useUpdateAccessoryQuery,
} from "../queries/accessory.query";

export const [AccessoryProvider, useAccessory] = createContextHook(() => {
  const queryClient = useQueryClient();

  /**
   * Get all accessories query
   */
  const getAllAccessoriesQuery = useGetAllAccessoryQuery();
  const getAllAccessoriesState = useQueryState(
    `${ACCESSORY_QUERY_KEY}s`,
    getAllAccessoriesQuery,
    [],
  );

  /**
   * Add accessory mutation
   */
  const addAccessoryQuery = useAddAccessoryQuery(queryClient);
  const { addAccessory, accessoryAdding, accessoryAddingError } =
    useMutationState("add", ACCESSORY_QUERY_KEY, addAccessoryQuery);

  /**
   * Update accessory mutation
   */
  const updateAccessoryQuery = useUpdateAccessoryQuery(queryClient);
  const updateAccessoryState = useMutationState(
    "update",
    ACCESSORY_QUERY_KEY,
    updateAccessoryQuery,
  );

  return {
    ...getAllAccessoriesState,
    addAccessory,
    accessoryAdding,
    accessoryAddingError,
    ...updateAccessoryState,
  };
});
