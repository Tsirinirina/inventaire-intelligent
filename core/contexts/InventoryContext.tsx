import { getDatabase } from "@/core/database";
import { Accessory } from "@/core/entity/accessory.entity";
import { NewProduct, Product } from "@/core/entity/product.entity";
import { Sale } from "@/core/entity/sale.entity";
import createContextHook from "@nkzw/create-context-hook";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as FileSystem from "expo-file-system";

export const [InventoryProvider, useInventory] = createContextHook(() => {
  const db = getDatabase();
  const queryClient = useQueryClient();

  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: (): Product[] => {
      const result = db!.getAllSync<Product>(
        "SELECT * FROM products ORDER BY dateAdded DESC",
      );
      return result;
    },
  });

  const salesQuery = useQuery({
    queryKey: ["sales"],
    queryFn: (): Sale[] => {
      const result = db!.getAllSync<Sale>(
        "SELECT * FROM sales ORDER BY saleDate DESC",
      );

      return result;
    },
  });

  const accessoriesQuery = useQuery({
    queryKey: ["accessories"],
    queryFn: (): Accessory[] => {
      return db!.getAllSync<Accessory>(
        "SELECT * FROM accessories ORDER BY dateAdded DESC",
      );
    },
  });

  const addProductMutation = useMutation({
    mutationFn: async (product: NewProduct) => {
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
        ],
      );
      return result.lastInsertRowId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async (product: Product) => {
      db!.runSync(
        `UPDATE products 
         SET name = ?, brand = ?, price = ?, category = ?, description = ?, quantity = ?, imageUri = ?
         WHERE id = ?`,
        [
          product.name,
          product.brand,
          product.basePrice,
          product.category,
          product.description,
          product.quantity,
          product.imageUri || null,
          product.id,
        ],
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      const product = db!.getFirstSync<Product>(
        "SELECT imageUri FROM products WHERE id = ?",
        [id],
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
            error,
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
        ],
      );

      return result.lastInsertRowId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accessories"] });
    },
  });

  const updateAccessoryMutation = useMutation({
    mutationFn: async (accessory: Accessory) => {
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
        ],
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accessories"] });
    },
  });

  const deleteAccessoryMutation = useMutation({
    mutationFn: async (id: number) => {
      const accessory = db!.getFirstSync<Accessory>(
        "SELECT imageUri FROM accessories WHERE id = ?",
        [id],
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
      let item: Product | Accessory | undefined | any;

      if (sale.type === "product") {
        item = db!.getFirstSync<Product>(
          "SELECT * FROM products WHERE id = ?",
          [parseInt(sale.productUniqueId.replace("product-", ""), 10)],
        );
      } else if (sale.type === "accessory") {
        item = db!.getFirstSync<Accessory>(
          "SELECT * FROM accessories WHERE id = ?",
          [parseInt(sale.productUniqueId.replace("accessory-", ""), 10)],
        );
      }

      if (!item) throw new Error("Article introuvable");
      if (item.quantity < sale.quantity) throw new Error("Stock insuffisant");

      // Insert sale
      const result = db!.runSync(
        `INSERT INTO sales 
    (productUniqueId, productName, category, type, quantity, unitPrice, totalPrice, saleDate)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          sale.productUniqueId,
          sale.productName,
          sale.category,
          sale.type,
          sale.quantity,
          sale.unitPrice,
          sale.totalPrice,
          sale.saleDate,
        ],
      );

      // Update stock
      db!.runSync(
        sale.type === "product"
          ? "UPDATE products SET quantity = quantity - ? WHERE id = ?"
          : "UPDATE accessories SET quantity = quantity - ? WHERE id = ?",
        [sale.quantity, item.id],
      );

      return { ...sale, id: result.lastInsertRowId };
    },

    onSuccess: (newSale) => {
      // Met à jour React Query pour Web et Mobile
      queryClient.setQueryData(["sales"], (old: Sale[] | undefined) => {
        return old ? [...old, newSale] : [newSale];
      });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["accessories"] });
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
