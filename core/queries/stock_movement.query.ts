import { useQuery } from "@tanstack/react-query";
import { getDatabase } from "../database";
import { STOCK_MOVEMENT_QUERY_KEY } from "../entity/stock_movement.entity";
import { getAllStockMovements } from "../services/stock_movement.service";

export function useGetAllStockMovementsQuery() {
  const db = getDatabase();
  return useQuery({
    queryKey: [STOCK_MOVEMENT_QUERY_KEY],
    queryFn: () => getAllStockMovements(db),
  });
}
