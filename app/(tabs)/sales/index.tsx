import { useAccessory } from "@/core/contexts/AccessoryContext";
import { useProduct } from "@/core/contexts/ProductContext";
import { SellableItem } from "@/core/entity/sale.entity";
import { useCartStore } from "@/core/store/cart.store";
import { capitalizeWords } from "@/core/utils/capitalize.utils";
import { useTheme } from "@/theme/ThemeProvider";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ShoppingCart } from "lucide-react-native";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function SaleScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const { products, productsLoading } = useProduct();
  const { accessorys: accessories, accessorysLoading } = useAccessory();
  const totalItems = useCartStore((s) => s.totalItems);

  const sellableItems: SellableItem[] = useMemo(
    () => [
      ...products.map((p) => ({
        id: p.id,
        type: "product" as const,
        name: p.name,
        brand: p.brand,
        category: p.category,
        basePrice: p.basePrice,
        quantity: p.quantity,
        imageUri: p.imageUri,
      })),
      ...accessories.map((a) => ({
        id: a.id,
        type: "accessory" as const,
        name: a.name,
        category: a.category,
        basePrice: a.basePrice,
        quantity: a.quantity,
        imageUri: a.imageUri,
      })),
    ],
    [products, accessories],
  );

  const cartCount = totalItems();

  if (productsLoading || accessorysLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const renderItem = ({ item }: { item: SellableItem }) => {
    const outOfStock = item.quantity === 0;
    return (
      <View
        style={[styles.card, outOfStock && { opacity: 0.5 }]}
      >
        {/* Badge stock */}
        <View
          style={[
            styles.stockBadge,
            item.quantity >= 2 ? styles.stockOk : styles.stockLow,
          ]}
        >
          <Text style={styles.stockBadgeText}>{item.quantity}</Text>
        </View>

        {/* Image */}
        {item.imageUri ? (
          <Image source={{ uri: item.imageUri }} style={styles.image} contentFit="cover" />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]} />
        )}

        {/* Infos */}
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          {item.type === "product" && item.brand ? (
            <Text style={styles.sub}>{item.brand}</Text>
          ) : (
            <Text style={styles.sub}>{capitalizeWords(item.category)}</Text>
          )}
          <Text style={styles.price}>{item.basePrice.toLocaleString()} Ar</Text>
        </View>

        {/* Bouton ajouter */}
        <TouchableOpacity
          style={[styles.addBtn, outOfStock && styles.addBtnDisabled]}
          disabled={outOfStock}
          onPress={() =>
            router.push({
              pathname: "/(tabs)/sales/add",
              params: { item: JSON.stringify(item) },
            })
          }
        >
          <ShoppingCart size={20} color={colors.textInverse} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={sellableItems}
        keyExtractor={(item) => item.type + item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB panier */}
      {cartCount > 0 && (
        <Pressable
          style={styles.cartFab}
          onPress={() => router.push("/(tabs)/sales/cart")}
        >
          <ShoppingCart size={24} color={colors.textInverse} />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{cartCount}</Text>
          </View>
          <Text style={styles.cartFabText}>Voir le panier</Text>
        </Pressable>
      )}
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    list: {
      padding: 16,
      paddingBottom: 100,
    },
    card: {
      position: "relative",
      backgroundColor: colors.surface,
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
      gap: 12,
    },
    stockBadge: {
      position: "absolute",
      top: -8,
      left: 8,
      width: 22,
      height: 22,
      borderRadius: 11,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1,
    },
    stockOk: { backgroundColor: colors.success },
    stockLow: { backgroundColor: colors.warning },
    stockBadgeText: {
      color: colors.textInverse,
      fontSize: 11,
      fontWeight: "700",
    },
    image: {
      width: 52,
      height: 52,
      borderRadius: 10,
    },
    imagePlaceholder: {
      backgroundColor: colors.inputBackground,
    },
    info: {
      flex: 1,
      gap: 2,
    },
    name: {
      color: colors.text,
      fontSize: 15,
      fontWeight: "600",
    },
    sub: {
      color: colors.textMuted,
      fontSize: 12,
    },
    price: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: "700",
      marginTop: 4,
    },
    addBtn: {
      backgroundColor: colors.primary,
      width: 40,
      height: 40,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
    },
    addBtnDisabled: {
      backgroundColor: colors.border,
    },
    cartFab: {
      position: "absolute",
      bottom: 24,
      left: 24,
      right: 24,
      backgroundColor: colors.accent,
      borderRadius: 16,
      paddingVertical: 14,
      paddingHorizontal: 20,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    cartFabText: {
      color: colors.textInverse,
      fontSize: 16,
      fontWeight: "700",
    },
    badge: {
      backgroundColor: colors.danger,
      borderRadius: 10,
      minWidth: 20,
      height: 20,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 4,
    },
    badgeText: {
      color: "#fff",
      fontSize: 11,
      fontWeight: "700",
    },
  });
