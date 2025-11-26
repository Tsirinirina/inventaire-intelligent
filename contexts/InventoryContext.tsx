import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as FileSystem from "expo-file-system";
import * as SQLite from "expo-sqlite";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import type {
  Accessory,
  NewAccessory,
  NewProduct,
  NewSale,
  Product,
  Sale,
} from "../types/inventory";

const DATABASE_NAME = "inventaire.db";
const PRODUCTS_KEY = "inventory_products";
const SALES_KEY = "inventory_sales";
const ACCESSORIES_KEY = "inventory_accessories";

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
      category TEXT NOT NULL,
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

  db.execSync(`
  CREATE TABLE IF NOT EXISTS accessories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    quantity INTEGER NOT NULL,
    dateAdded TEXT NOT NULL,
    imageUri TEXT
  );
`);

  return db;
}

export const [InventoryProvider, useInventory] = createContextHook(() => {
  const [db] = useState(() => initDatabase());
  const queryClient = useQueryClient();
  const [webProducts, setWebProducts] = useState<Product[]>([]);
  const [webSales, setWebSales] = useState<Sale[]>([]);
  const [webAccessories, setWebAccessories] = useState<Accessory[]>([]);

  useEffect(() => {
    if (Platform.OS === "web") {
      AsyncStorage.getItem(PRODUCTS_KEY).then((data) => {
        if (data) {
          setWebProducts(JSON.parse(data));
        }
      });
      AsyncStorage.getItem(ACCESSORIES_KEY).then((data) => {
        if (data) setWebAccessories(JSON.parse(data));
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

  const accessoriesQuery = useQuery({
    queryKey: ["accessories"],
    queryFn: (): Accessory[] => {
      if (Platform.OS === "web") {
        return webAccessories;
      }
      return db!.getAllSync<Accessory>(
        "SELECT * FROM accessories ORDER BY dateAdded DESC"
      );
    },
    enabled: Platform.OS !== "web" || webAccessories !== undefined,
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
        `INSERT INTO products (name, brand, price, category, description, quantity, dateAdded, imageUri) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          product.name,
          product.brand,
          product.price,
          product.category,
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
         SET name = ?, brand = ?, price = ?, category = ?, description = ?, quantity = ?, imageUri = ?
         WHERE id = ?`,
        [
          product.name,
          product.brand,
          product.price,
          product.category,
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
          console.error(
            "Erreur lors de la suppression du fichier image:",
            error
          );
        }
      }
      db!.runSync("DELETE FROM products WHERE id = ?", [id]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const addAccessoryMutation = useMutation({
    mutationFn: async (accessory: NewAccessory) => {
      if (Platform.OS === "web") {
        const newId =
          webAccessories.length > 0
            ? Math.max(...webAccessories.map((a) => a.id)) + 1
            : 1;

        const newAccessory: Accessory = { ...accessory, id: newId };
        const updated = [...webAccessories, newAccessory];
        setWebAccessories(updated);
        await AsyncStorage.setItem(ACCESSORIES_KEY, JSON.stringify(updated));

        return newId;
      }

      const result = db!.runSync(
        `INSERT INTO accessories (name, price, category, description, quantity, dateAdded, imageUri)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          accessory.name,
          accessory.price,
          accessory.category,
          accessory.description || null,
          accessory.quantity,
          accessory.dateAdded,
          accessory.imageUri || null,
        ]
      );

      return result.lastInsertRowId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accessories"] });
    },
  });

  const updateAccessoryMutation = useMutation({
    mutationFn: async (accessory: Accessory) => {
      if (Platform.OS === "web") {
        const updated = webAccessories.map((a) =>
          a.id === accessory.id ? accessory : a
        );
        setWebAccessories(updated);
        await AsyncStorage.setItem(ACCESSORIES_KEY, JSON.stringify(updated));
        return;
      }

      db!.runSync(
        `UPDATE accessories
         SET name = ?, price = ?, category = ?, description = ?, quantity = ?, imageUri = ?
       WHERE id = ?`,
        [
          accessory.name,
          accessory.price,
          accessory.category,
          accessory.description || null,
          accessory.quantity,
          accessory.imageUri || null,
          accessory.id,
        ]
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accessories"] });
    },
  });

  const deleteAccessoryMutation = useMutation({
    mutationFn: async (id: number) => {
      if (Platform.OS === "web") {
        const updated = webAccessories.filter((a) => a.id !== id);
        setWebAccessories(updated);
        await AsyncStorage.setItem(ACCESSORIES_KEY, JSON.stringify(updated));
        return;
      }

      const accessory = db!.getFirstSync<Accessory>(
        "SELECT imageUri FROM accessories WHERE id = ?",
        [id]
      );

      if (accessory?.imageUri) {
        try {
          const fileInfo = await FileSystem.getInfoAsync(accessory.imageUri);
          if (fileInfo.exists) {
            await FileSystem.deleteAsync(accessory.imageUri);
          }
        } catch (error) {
          console.error("Error deleting accessory image:", error);
        }
      }

      db!.runSync("DELETE FROM accessories WHERE id = ?", [id]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accessories"] });
    },
  });

  const addSaleMutation = useMutation({
    mutationFn: async (sale: NewSale) => {
      if (Platform.OS === "web") {
        const product = webProducts.find((p) => p.id === sale.productId);

        if (!product) {
          throw new Error("Produit introuvable");
        }

        if (product.quantity < sale.quantity) {
          throw new Error("Stock insuffisant");
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
        throw new Error("Produit introuvable");
      }

      if (product.quantity < sale.quantity) {
        throw new Error("Stock insuffisant");
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
    accessories: accessoriesQuery.data || [],
    sales: salesQuery.data || [],
    // loading
    isLoadingProducts: productsQuery.isLoading,
    isLoadingSales: salesQuery.isLoading,
    isLoadingAccessories: accessoriesQuery.isLoading,
    // mutation
    addProduct: addProductMutation.mutateAsync,
    updateProduct: updateProductMutation.mutateAsync,
    deleteProduct: deleteProductMutation.mutateAsync,
    addSale: addSaleMutation.mutateAsync,
    addAccessory: addAccessoryMutation.mutateAsync,
    updateAccessory: updateAccessoryMutation.mutateAsync,
    deleteAccessory: deleteAccessoryMutation.mutateAsync,
    // mutation loading
    isAddingProduct: addProductMutation.isPending,
    isUpdatingProduct: updateProductMutation.isPending,
    isDeletingProduct: deleteProductMutation.isPending,
    isAddingSale: addSaleMutation.isPending,
    isAddingAccessory: addAccessoryMutation.isPending,
    isUpdatingAccessory: updateAccessoryMutation.isPending,
    isDeletingAccessory: deleteAccessoryMutation.isPending,
  };
});
