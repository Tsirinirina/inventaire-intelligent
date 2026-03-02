import createContextHook from "@nkzw/create-context-hook";
import { useMemo } from "react";
import { useAccessory } from "./AccessoryContext";
import { useProduct } from "./ProductContext";
import { useSale } from "./SaleContext";

export const [InventoryProvider, useInventory] = createContextHook(() => {
  // Souscriptions réactives — re-render automatique à chaque mutation
  const { products } = useProduct();
  const { accessorys: accessories } = useAccessory();
  const { sales } = useSale();

  const stats = useMemo(() => {
    /* =======================
       PRODUCTS
    ======================== */
    const totalProducts = products.length;
    const totalProductStock = products.reduce((sum, p) => sum + p.quantity, 0);
    const totalProductPrice = products.reduce(
      (sum, p) => sum + p.basePrice * p.quantity,
      0,
    );
    const lowStockProducts = products.filter((p) => p.quantity <= 5);
    const outOfStockProducts = products.filter((p) => p.quantity === 0);

    const brandStats = products.reduce(
      (acc, p) => {
        acc[p.brand] = (acc[p.brand] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
    const topBrandEntry = Object.entries(brandStats).sort(
      (a, b) => b[1] - a[1],
    )[0];
    const topBrand = topBrandEntry
      ? { name: topBrandEntry[0], count: topBrandEntry[1] }
      : null;

    /* =======================
       ACCESSORIES
    ======================== */
    const totalAccessory = accessories.length;
    const totalAccessoryStock = accessories.reduce(
      (sum, a) => sum + a.quantity,
      0,
    );
    const totalAccessoryPrice = accessories.reduce(
      (sum, a) => sum + a.basePrice * a.quantity,
      0,
    );
    const lowStockAccessories = accessories.filter((a) => a.quantity <= 5);
    const outOfStockAccessories = accessories.filter((a) => a.quantity === 0);

    /* =======================
       SALES
    ======================== */
    const totalSales = sales.length;
    const totalRevenue = sales.reduce(
      (sum, s) => sum + s.unitPrice * s.quantity,
      0,
    );

    const today = new Date().toDateString();
    const todaySalesList = sales.filter(
      (s) => new Date(s.createdAt).toDateString() === today,
    );
    const todaySales = todaySalesList.length;
    const todayRevenue = todaySalesList.reduce(
      (sum, s) => sum + s.unitPrice * s.quantity,
      0,
    );

    /* =======================
       GLOBAL
    ======================== */
    const totalGain = totalProductPrice + totalAccessoryPrice;

    return {
      totalProducts,
      totalProductStock,
      totalProductPrice,
      lowStockProducts,
      outOfStockProducts,
      topBrand,
      totalAccessory,
      totalAccessoryStock,
      totalAccessoryPrice,
      lowStockAccessories,
      outOfStockAccessories,
      totalSales,
      totalRevenue,
      todaySales,
      todayRevenue,
      totalGain,
    };
  }, [products, accessories, sales]);

  return { stats, products, accessories, sales };
});
