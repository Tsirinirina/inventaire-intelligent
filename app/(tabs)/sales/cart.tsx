import { useCartStore } from "@/core/store/cart.store";
import React from "react";
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

  export default function CartScreen() {
    const { items, total, increaseQuantity, decreaseQuantity } = useCartStore();

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Panier</Text>

        <FlatList
          data={[sale]}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.text}>Quantité: {item.quantity}</Text>
              <Text style={styles.muted}>Prix: {item.basePrice} Ar</Text>
              {item.imei && <Text style={styles.muted}>IMEI: {item.imei}</Text>}
            </View>
          )}
        />

        <View style={styles.footer}>
          <Text style={styles.total}>Total: {total.toLocaleString()} Ar</Text>

          <TouchableOpacity style={styles.confirmButton}>
            <Text style={styles.confirmText}>Ajouter</Text>
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
}
