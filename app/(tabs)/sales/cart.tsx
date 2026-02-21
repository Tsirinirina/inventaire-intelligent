import { useCartStore } from "@/core/store/cart.store";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const COLORS = {
  background: "#0F172A",
  card: "#1E293B",
  primary: "#22C55E",
  accent: "#3B82F6",
  text: "#F8FAFC",
  muted: "#94A3B8",
};

export default function CartScreen() {
  const { items, total, increaseQuantity, decreaseQuantity } = useCartStore();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Panier</Text>

      <FlatList
        data={items}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  title: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  card: {
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  text: {
    color: COLORS.text,
    fontWeight: "600",
  },
  muted: {
    color: COLORS.muted,
    marginTop: 4,
  },
  footer: {
    marginTop: 20,
  },
  total: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  confirmButton: {
    backgroundColor: COLORS.accent,
    padding: 16,
    borderRadius: 16,
  },
  confirmText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});
