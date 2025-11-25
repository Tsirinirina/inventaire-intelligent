import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as FileSystem from "expo-file-system";
import * as SQLite from "expo-sqlite";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import type { NewProduct, NewSale, Product, Sale } from "../types/inventory";

const DATABASE_NAME = "inventory.db";
const PRODUCTS_KEY = "inventory_products";
const SALES_KEY = "inventory_sales";

function initDatabase() {
  if (Platform.OS === "web") {
    return null;
  }

  const db = SQLite.openDatabaseSync(DATABASE_NAME);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      brand TEXT NOT NULL,
      price REAL NOT NULL,
      description TEXT,
      quantity INTEGER NOT NULL,
      dateAdded TEXT NOT NULL,
      imageUri TEXT
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      productId INTEGER NOT NULL,
      productName TEXT NOT NULL,
      brand TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unitPrice REAL NOT NULL,
      totalPrice REAL NOT NULL,
      saleDate TEXT NOT NULL
    );
  `);

  return db;
}

export const [InventoryProvider, useInventory] = createContextHook(() => {
  const [db] = useState(() => initDatabase());
  const queryClient = useQueryClient();
  const [webProducts, setWebProducts] = useState<Product[]>([]);
  const [webSales, setWebSales] = useState<Sale[]>([]);

  useEffect(() => {
    if (Platform.OS === "web") {
      AsyncStorage.getItem(PRODUCTS_KEY).then((data) => {
        if (data) {
          setWebProducts(JSON.parse(data));
        }
      });
      AsyncStorage.getItem(SALES_KEY).then((data) => {
        if (data) {
          setWebSales(JSON.parse(data));
        }
      });
    }
  }, []);

  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: (): Product[] => {
      if (Platform.OS === "web") {
        return webProducts;
      }
      const result = db!.getAllSync<Product>(
        "SELECT * FROM products ORDER BY dateAdded DESC"
      );
      return result;
    },
    enabled: Platform.OS !== "web" || webProducts !== undefined,
  });

  const salesQuery = useQuery({
    queryKey: ["sales"],
    queryFn: (): Sale[] => {
      if (Platform.OS === "web") {
        return webSales;
      }
      const result = db!.getAllSync<Sale>(
        "SELECT * FROM sales ORDER BY saleDate DESC"
      );
      return result;
    },
    enabled: Platform.OS !== "web" || webSales !== undefined,
  });

  const addProductMutation = useMutation({
    mutationFn: async (product: NewProduct) => {
      if (Platform.OS === "web") {
        const newId =
          webProducts.length > 0
            ? Math.max(...webProducts.map((p) => p.id)) + 1
            : 1;
        const newProduct: Product = { ...product, id: newId };
        const updated = [...webProducts, newProduct];
        setWebProducts(updated);
        await AsyncStorage.setItem(PRODUCTS_KEY, JSON.stringify(updated));
        return newId;
      }
      const result = db!.runSync(
        `INSERT INTO products (name, brand, price, description, quantity, dateAdded, imageUri) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          product.name,
          product.brand,
          product.price,
          product.description,
          product.quantity,
          product.dateAdded,
          product.imageUri || null,
        ]
      );
      return result.lastInsertRowId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async (product: Product) => {
      if (Platform.OS === "web") {
        const updated = webProducts.map((p) =>
          p.id === product.id ? product : p
        );
        setWebProducts(updated);
        await AsyncStorage.setItem(PRODUCTS_KEY, JSON.stringify(updated));
        return;
      }
      db!.runSync(
        `UPDATE products 
         SET name = ?, brand = ?, price = ?, description = ?, quantity = ?, imageUri = ?
         WHERE id = ?`,
        [
          product.name,
          product.brand,
          product.price,
          product.description,
          product.quantity,
          product.imageUri || null,
          product.id,
        ]
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      if (Platform.OS === "web") {
        const updated = webProducts.filter((p) => p.id !== id);
        setWebProducts(updated);
        await AsyncStorage.setItem(PRODUCTS_KEY, JSON.stringify(updated));
        return;
      }
      const product = db!.getFirstSync<Product>(
        "SELECT imageUri FROM products WHERE id = ?",
        [id]
      );
      if (product?.imageUri) {
        try {
          const fileInfo = await FileSystem.getInfoAsync(product.imageUri);
          if (fileInfo.exists) {
            await FileSystem.deleteAsync(product.imageUri);
          }
        } catch (error) {
          console.error("Error deleting image file:", error);
        }
      }
      db!.runSync("DELETE FROM products WHERE id = ?", [id]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const addSaleMutation = useMutation({
    mutationFn: async (sale: NewSale) => {
      if (Platform.OS === "web") {
        const product = webProducts.find((p) => p.id === sale.productId);

        if (!product) {
          throw new Error("Product not found");
        }

        if (product.quantity < sale.quantity) {
          throw new Error("Insufficient stock");
        }

        const newSaleId =
          webSales.length > 0 ? Math.max(...webSales.map((s) => s.id)) + 1 : 1;
        const newSale: Sale = { ...sale, id: newSaleId };
        const updatedSales = [...webSales, newSale];
        setWebSales(updatedSales);
        await AsyncStorage.setItem(SALES_KEY, JSON.stringify(updatedSales));

        const updatedProducts = webProducts.map((p) =>
          p.id === sale.productId
            ? { ...p, quantity: p.quantity - sale.quantity }
            : p
        );
        setWebProducts(updatedProducts);
        await AsyncStorage.setItem(
          PRODUCTS_KEY,
          JSON.stringify(updatedProducts)
        );
        return;
      }

      const product = db!.getFirstSync<Product>(
        "SELECT * FROM products WHERE id = ?",
        [sale.productId]
      );

      if (!product) {
        throw new Error("Product not found");
      }

      if (product.quantity < sale.quantity) {
        throw new Error("Insufficient stock");
      }

      db!.runSync(
        `INSERT INTO sales (productId, productName, brand, quantity, unitPrice, totalPrice, saleDate) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          sale.productId,
          sale.productName,
          sale.brand,
          sale.quantity,
          sale.unitPrice,
          sale.totalPrice,
          sale.saleDate,
        ]
      );

      db!.runSync("UPDATE products SET quantity = quantity - ? WHERE id = ?", [
        sale.quantity,
        sale.productId,
      ]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["sales"] });
    },
  });

  return {
    products: productsQuery.data || [],
    sales: salesQuery.data || [],
    isLoadingProducts: productsQuery.isLoading,
    isLoadingSales: salesQuery.isLoading,
    addProduct: addProductMutation.mutateAsync,
    updateProduct: updateProductMutation.mutateAsync,
    deleteProduct: deleteProductMutation.mutateAsync,
    addSale: addSaleMutation.mutateAsync,
    isAddingProduct: addProductMutation.isPending,
    isUpdatingProduct: updateProductMutation.isPending,
    isDeletingProduct: deleteProductMutation.isPending,
    isAddingSale: addSaleMutation.isPending,
  };
});
