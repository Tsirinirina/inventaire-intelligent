import { useAccessory } from "@/core/contexts/AccessoryContext";
import { useProduct } from "@/core/contexts/ProductContext";
import { SellableItem } from "@/core/entity/sale.entity";
import { useTheme } from "@/theme/ThemeProvider";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function SaleScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const { products } = useProduct();
  const { accessorys: accessories } = useAccessory();

  const items: SellableItem[] = useMemo(
    () => [
      ...products.map((p) => ({ ...p, type: "product" as const })),
      ...accessories.map((a) => ({ ...a, type: "accessory" as const })),
    ],
    [products, accessories],
  );

  const renderItem = ({ item }: { item: SellableItem }) => (
    <View style={styles.card}>
      {item.imageUri ? (
        <Image source={{ uri: item.imageUri }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]} />
      )}

      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>

        {item.brand && <Text style={styles.brand}>{item.brand}</Text>}

        <Text style={styles.price}>{item.basePrice.toLocaleString()} Ar</Text>

        <Text style={styles.stock}>Stock: {item.quantity}</Text>
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() =>
          router.push({
            pathname: "/(tabs)/sales/add",
            params: { item: JSON.stringify(item) },
          })
        }
      >
        <Text style={styles.addText}>Ajouter</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nouvelle Vente</Text>

      <FlatList
        data={items}
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
      marginBottom: 16,
    },
    card: {
      backgroundColor: colors.surfaceElevated,
      borderRadius: 20,
      padding: 16,
      marginBottom: 12,
      flexDirection: "row",
      alignItems: "center",
    },
    image: {
      width: 64,
      height: 64,
      borderRadius: 12,
      marginRight: 16,
    },
    imagePlaceholder: {
      backgroundColor: colors.inputBackground,
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
    stock: {
      color: colors.textMuted,
      fontSize: 12,
      marginTop: 2,
    },
    addButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 12,
    },
    addText: {
      color: colors.textInverse,
      fontWeight: "600",
    },
  });
