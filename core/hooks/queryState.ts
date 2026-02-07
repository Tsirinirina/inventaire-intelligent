import { UseQueryResult } from "@tanstack/react-query";

export function useQueryState<TData, TName extends string>(
  queryKey: TName,
  query: UseQueryResult<TData>,
  fallback: TData,
): {
  [K in
    | TName
    | `${TName}Loading`
    | `${TName}Error`
    | `${TName}Refetch`]: K extends TName
    ? TData
    : K extends `${TName}Loading`
      ? boolean
      : K extends `${TName}Refetch`
        ? () => Promise<void>
        : unknown;
} {
  return {
    [`${queryKey}`]: query.data ?? fallback,
    [`${queryKey}Loading`]: query.isLoading,
    [`${queryKey}Error`]: query.error,
    [`${queryKey}Refetch`]: query.refetch,
  } as any;
}
