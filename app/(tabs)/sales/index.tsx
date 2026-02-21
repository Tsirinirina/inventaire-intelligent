import { useAccessory } from "@/core/contexts/AccessoryContext";
import { useProduct } from "@/core/contexts/ProductContext";
import { useSale } from "@/core/contexts/SaleContext";
import { SellableItem } from "@/core/entity/sale.entity";
import { capitalizeWords } from "@/core/utils/capitalize.utils";
import { useTheme } from "@/theme/ThemeProvider";
import { useNavigation } from "@react-navigation/native";
import { ShoppingCart } from "lucide-react-native";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  items: SellableItem[];
}

export default function SaleScreen() {
  const { sales, salesLoading } = useSale();
  const {
    products,
    productsLoading,
    productsError,
    productsRefetch,
    addProduct,
  } = useProduct();
  const {
    accessorys: accessories,
    accessorysLoading: accessoriessLoading,
    accessorysRefetch,
  } = useAccessory();

  const sellableItems: SellableItem[] = useMemo(() => {
    console.log("Product =", products);

    const mappedProducts: SellableItem[] = products.map((product) => ({
      id: product.id,
      type: "product",
      name: product.name,
      brand: product.brand,
      category: product.category,
      basePrice: product.basePrice,
      quantity: product.quantity,
      imageUri: product.imageUri,
    }));

    const mappedAccessories: SellableItem[] = accessories.map((accessory) => ({
      id: accessory.id,
      type: "accessory",
      name: accessory.name,
      category: accessory.category,
      basePrice: accessory.basePrice,
      quantity: accessory.quantity,
      imageUri: accessory.imageUri,
    }));

    return [...mappedProducts, ...mappedAccessories];
  }, [products, accessories]);

  console.log("Selleble items =", sellableItems);

  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const renderItem = ({ item }: { item: SellableItem }) => (
    <View style={styles.card}>
      <View
        style={[
          styles.stockItem,
          item.quantity >= 2 ? styles.regularStock : styles.outOfStock,
        ]}
      >
        <Text style={styles.stock}>{item.quantity}</Text>
      </View>
      <Image
        source={{ uri: item.imageUri || "https://via.placeholder.com/80" }}
        style={styles.image}
      />

      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>

        {item.type === "accessory" && (
          <Text style={styles.brand}>{capitalizeWords(item.category)}</Text>
        )}
        {item.type === "product" && item.brand && (
          <Text style={styles.brand}>{item.brand}</Text>
        )}

        <Text style={styles.price}>{item.basePrice.toLocaleString()} Ar</Text>
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("AddToCart", { item })}
      >
        <Text style={styles.addText}>
          <ShoppingCart size={24} color={colors.textInverse} />
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (productsLoading || accessoriessLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={sellableItems}
        keyExtractor={(item) => item.type + item.id}
        renderItem={renderItem}
      />
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 16,
    },
    title: {
      color: colors.text,
      fontSize: 24,
      fontWeight: "bold",
    },
    card: {
      position: "relative",
      backgroundColor: colors.surface,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 0,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: "row",
      alignItems: "center",
      marginTop: 14,
      gap: 12,
    },
    image: {
      width: 46,
      height: 46,
      borderRadius: 12,
    },
    info: {
      flex: 1,
    },
    name: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "600",
    },
    brand: {
      color: colors.textMuted,
      fontSize: 13,
      marginTop: 2,
    },
    price: {
      color: colors.primary,
      fontWeight: "bold",
      marginTop: 6,
    },
    //
    stockItem: {
      borderRadius: 50,
      position: "absolute",
      top: -10,
      left: 0,
      width: 24,
      height: 24,
      justifyContent: "center",
      alignItems: "center",
    },
    stock: {
      color: colors.textInverse,
      fontSize: 14,
      fontWeight: "bold",
      marginTop: 2,
    },
    outOfStock: { borderRadius: 50, backgroundColor: colors.warning },
    regularStock: { borderRadius: 50, backgroundColor: colors.accentLight },

    //
    addButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 12,
    },
    addText: {
      color: "#fff",
      fontWeight: "600",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
  });
