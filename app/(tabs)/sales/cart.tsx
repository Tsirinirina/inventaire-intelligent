import { useAccessory } from "@/core/contexts/AccessoryContext";
import { useProduct } from "@/core/contexts/ProductContext";
import { useSale } from "@/core/contexts/SaleContext";
import { NewSale } from "@/core/entity/sale.entity";
import { useTheme } from "@/theme/ThemeProvider";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function CartScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const { sale: saleStr } = useLocalSearchParams<{ sale: string }>();
  const sale: NewSale = JSON.parse(saleStr);

  const { addSale } = useSale();
  const { products, updateProduct } = useProduct();
  const { accessorys: accessories, updateAccessory } = useAccessory();

  const total = sale.quantity * sale.unitPrice;

  const handleConfirm = async () => {
    await addSale(sale);

    if (sale.productId) {
      const p = products.find((x) => x.id === sale.productId);
      if (p) {
        await updateProduct({
          ...p,
          quantity: p.quantity - sale.quantity,
          stockUpdatedAt: new Date().toISOString(),
        });
      }
    } else if (sale.accessoryId) {
      const a = accessories.find((x) => x.id === sale.accessoryId);
      if (a) {
        await updateAccessory({
          ...a,
          quantity: a.quantity - sale.quantity,
          stockUpdatedAt: new Date().toISOString(),
        });
      }
    }

    router.replace("/(tabs)/sales");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Panier</Text>

      <FlatList
        data={[sale]}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.text}>Quantité: {item.quantity}</Text>
            <Text style={styles.muted}>Prix: {item.unitPrice} Ar</Text>
            {item.imei && <Text style={styles.muted}>IMEI: {item.imei}</Text>}
          </View>
        )}
      />

      <View style={styles.footer}>
        <Text style={styles.total}>Total: {total.toLocaleString()} Ar</Text>

        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <Text style={styles.confirmText}>Confirmer la vente</Text>
        </TouchableOpacity>
      </View>
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
      padding: 16,
      borderRadius: 16,
      marginBottom: 12,
    },
    text: {
      color: colors.text,
      fontWeight: "600",
    },
    muted: {
      color: colors.textMuted,
      marginTop: 4,
    },
    footer: {
      marginTop: 20,
    },
    total: {
      color: colors.text,
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 16,
    },
    confirmButton: {
      backgroundColor: colors.primary,
      padding: 16,
      borderRadius: 16,
    },
    confirmText: {
      color: colors.textInverse,
      textAlign: "center",
      fontWeight: "bold",
    },
  });
