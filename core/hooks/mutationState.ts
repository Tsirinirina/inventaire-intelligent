import { UseMutationResult } from "@tanstack/react-query";

const ACTION_SUFFIX: Record<"add" | "update" | "delete", string> = {
  add: "Adding",
  update: "Updating",
  delete: "Deleting",
};

export function useMutationState<
  TData,
  TVariables,
  TName extends string,
  TAction extends "add" | "update" | "delete",
>(
  action: TAction,
  name: TName,
  mutation: UseMutationResult<TData, unknown, TVariables>,
): {
  [K in
    | `${TAction}${Capitalize<TName>}`
    | `${Lowercase<TName>}${(typeof ACTION_SUFFIX)[TAction]}`
    | `${Lowercase<TName>}Error`]: K extends `${TAction}${Capitalize<TName>}`
    ? (dto: TVariables) => Promise<TData>
    : K extends `${Lowercase<TName>}${(typeof ACTION_SUFFIX)[TAction]}`
      ? boolean
      : unknown;
} {
  const capitalizedName = `${name.charAt(0).toUpperCase()}${name.slice(1)}`;
  const lowerName = `${name.charAt(0).toLowerCase()}${name.slice(1)}`;

  return {
    [`${action}${capitalizedName}`]: mutation.mutateAsync,
    [`${lowerName}${ACTION_SUFFIX[action]}`]: mutation.isPending,
    [`${lowerName}${ACTION_SUFFIX[action]}Error`]: mutation.error,
  } as any;
}
