import createContextHook from "@nkzw/create-context-hook";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { Accessory, ACCESSORY_QUERY_KEY } from "../entity/accessory.entity";
import { Product, PRODUCT_QUERY_KEY } from "../entity/product.entity";
import { Sale, SALE_QUERY_KEY } from "../entity/sale.entity";
import { Seller, SELLER_QUERY_KEY } from "../entity/seller.entity";

export const [InventoryProvider, useInventory] = createContextHook(() => {
  const queryClient = useQueryClient();

  const products = useMemo(
    () => queryClient.getQueryData<Product[]>([PRODUCT_QUERY_KEY]) ?? [],
    [queryClient],
  );

  const accessories = useMemo(
    () => queryClient.getQueryData<Accessory[]>([ACCESSORY_QUERY_KEY]) ?? [],
    [queryClient],
  );

  const sales = useMemo(
    () => queryClient.getQueryData<Sale[]>([SALE_QUERY_KEY]) ?? [],
    [queryClient],
  );

  const sellers = useMemo(
    () => queryClient.getQueryData<Seller[]>([SELLER_QUERY_KEY]) ?? [],
    [queryClient],
  );

  // 📊 Calculs métiers (memoisés)
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

    // Brand stats (top brand)
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

    const todaySales = sales.filter(
      (s) => new Date(s.createdAt).toDateString() === today,
    );

    const todayRevenue = todaySales.reduce(
      (sum, s) => sum + s.unitPrice * s.quantity,
      0,
    );

    /* =======================
       GLOBAL
    ======================== */
    const totalGain = totalProductPrice + totalAccessoryPrice;

    return {
      // Products
      totalProducts,
      totalProductStock,
      totalProductPrice,
      lowStockProducts,
      outOfStockProducts,
      topBrand,

      // Accessories
      totalAccessory,
      totalAccessoryStock,
      totalAccessoryPrice,
      lowStockAccessories,
      outOfStockAccessories,

      // Sales
      totalSales,
      totalRevenue,
      todaySales: todaySales.length,
      todayRevenue,

      // Sellers
      totalSellers: sellers.length,

      // Global
      totalGain,
    };
  }, [products, accessories, sales, sellers]);

  return {
    stats,
    products,
    accessories,
    sales,
    sellers,
  };
});
