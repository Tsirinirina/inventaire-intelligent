import { useAccessory } from "@/core/contexts/AccessoryContext";
import { useProduct } from "@/core/contexts/ProductContext";
import { SellableItem } from "@/core/entity/sale.entity";
import { useProcurementStore } from "@/core/store/procurement.store";
import { capitalizeWords } from "@/core/utils/capitalize.utils";
import { useTheme } from "@/theme/ThemeProvider";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { PackagePlus, Search, ShoppingBasket } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ProcurementScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const { products, productsLoading } = useProduct();
  const { accessorys: accessories, accessorysLoading } = useAccessory();
  const cartCount = useProcurementStore((s) => s.items.length);

  const [search, setSearch] = useState("");

  const items: SellableItem[] = useMemo(() => {
    const combined = [
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
    ];

    // Tri par stock croissant (stock faible en premier)
    combined.sort((a, b) => a.quantity - b.quantity);

    // Filtre par recherche
    if (search.trim()) {
      const q = search.toLowerCase();
      return combined.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          ("brand" in i && i.brand?.toLowerCase().includes(q)) ||
          i.category.toLowerCase().includes(q),
      );
    }

    return combined;
  }, [products, accessories, search]);

  if (productsLoading || accessorysLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const getStockBadgeStyle = (qty: number) => {
    if (qty === 0) return styles.stockDanger;
    if (qty <= 5) return styles.stockWarning;
    return styles.stockOk;
  };

  const renderItem = ({ item }: { item: SellableItem }) => (
    <View style={styles.card}>
      {/* Badge stock */}
      <View style={[styles.stockBadge, getStockBadgeStyle(item.quantity)]}>
        <Text style={styles.stockBadgeText}>{item.quantity}</Text>
      </View>

      {/* Image */}
      {item.imageUri ? (
        <Image
          source={{ uri: item.imageUri }}
          style={styles.image}
          contentFit="cover"
        />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]} />
      )}

      {/* Infos */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>
        {item.type === "product" && item.brand ? (
          <Text style={styles.sub}>{item.brand}</Text>
        ) : (
          <Text style={styles.sub}>{capitalizeWords(item.category)}</Text>
        )}
        <Text style={styles.price}>
          {item.basePrice.toLocaleString()} Ar
        </Text>
      </View>

      {/* Bouton ajouter */}
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() =>
          router.push({
            pathname: "/(tabs)/procurement/add" as any,
            params: { item: JSON.stringify(item) },
          })
        }
      >
        <PackagePlus size={20} color={colors.textInverse} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <Search size={18} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un produit ou accessoire..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
        />
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.type + item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucun article trouvé</Text>
          </View>
        }
      />

      {/* FAB panier */}
      {cartCount > 0 && (
        <Pressable
          style={styles.cartFab}
          onPress={() => router.push("/(tabs)/procurement/cart" as any)}
        >
          <ShoppingBasket size={24} color={colors.textInverse} />
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
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      marginHorizontal: 16,
      marginTop: 12,
      marginBottom: 4,
      paddingHorizontal: 14,
      gap: 10,
    },
    searchInput: {
      flex: 1,
      paddingVertical: 12,
      fontSize: 15,
      color: colors.text,
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
    stockWarning: { backgroundColor: colors.warning },
    stockDanger: { backgroundColor: colors.danger },
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
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingTop: 60,
    },
    emptyText: {
      color: colors.textMuted,
      fontSize: 16,
    },
  });
