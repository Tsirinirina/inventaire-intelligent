import { useAuth } from "@/core/contexts/AuthContext";
import { SellableItem } from "@/core/entity/sale.entity";
import { CartItem, useCartStore } from "@/core/store/cart.store";
import { useTheme } from "@/theme/ThemeProvider";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CheckCircle } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function AddToCartScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const { item: itemStr } = useLocalSearchParams<{ item: string }>();
  const item: SellableItem = JSON.parse(itemStr);
  const { currentSeller } = useAuth();
  const addItem = useCartStore((s) => s.addItem);

  const [quantity, setQuantity] = useState("1");
  const [unitPrice, setUnitPrice] = useState(item.basePrice.toString());
  const [imei, setImei] = useState("");
  const [color, setColor] = useState("");
  const [ram, setRam] = useState("");
  const [rom, setRom] = useState("");

  const isSmartphone = item.category === "smartphone";
  const qty = Number(quantity) || 0;
  const price = Number(unitPrice) || 0;
  const subtotal = qty * price;

  const handleAdd = () => {
    if (qty <= 0 || qty > item.quantity) {
      Alert.alert(
        "Quantité invalide",
        `Stock disponible : ${item.quantity} unité(s)`,
      );
      return;
    }
    if (price <= 0) {
      Alert.alert("Prix invalide", "Veuillez entrer un prix valide.");
      return;
    }
    if (isSmartphone && !imei.trim()) {
      Alert.alert("IMEI manquant", "Veuillez entrer l'IMEI du smartphone.");
      return;
    }

    const cartItem: CartItem = {
      cartId: `${item.type}-${item.id}-${Date.now()}`,
      itemId: item.id,
      type: item.type,
      name: item.name,
      imageUri: item.imageUri,
      category: item.category,
      brand: item.brand,
      availableStock: item.quantity,
      sellerId: currentSeller?.id ?? 1,
      quantity: qty,
      unitPrice: price,
      imei: imei.trim() || undefined,
      color: color.trim() || undefined,
      ram: ram ? Number(ram) : undefined,
      rom: rom ? Number(rom) : undefined,
    };

    addItem(cartItem);
    router.back();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      {/* En-tête item */}
      <View style={styles.itemHeader}>
        <View style={styles.itemTitleRow}>
          <Text style={styles.itemName}>{item.name}</Text>
          {item.brand && <Text style={styles.itemBrand}>{item.brand}</Text>}
        </View>
        <View style={styles.stockPill}>
          <Text style={styles.stockText}>Stock : {item.quantity}</Text>
        </View>
      </View>

      {/* Sous-total dynamique */}
      {qty > 0 && price > 0 && (
        <View style={styles.subtotalBanner}>
          <Text style={styles.subtotalLabel}>Sous-total</Text>
          <Text style={styles.subtotalValue}>
            {subtotal.toLocaleString()} Ar
          </Text>
        </View>
      )}

      {/* Champs */}
      <Text style={styles.label}>Quantité</Text>
      <TextInput
        style={styles.input}
        placeholder={`max ${item.quantity}`}
        placeholderTextColor={colors.textMuted}
        keyboardType="numeric"
        value={quantity}
        onChangeText={setQuantity}
      />

      <Text style={styles.label}>Prix unitaire (Ar)</Text>
      <TextInput
        style={styles.input}
        placeholder="Prix de vente"
        placeholderTextColor={colors.textMuted}
        keyboardType="numeric"
        value={unitPrice}
        onChangeText={setUnitPrice}
      />

      {isSmartphone && (
        <>
          <Text style={styles.label}>IMEI *</Text>
          <TextInput
            style={styles.input}
            placeholder="15 chiffres"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            value={imei}
            onChangeText={setImei}
            maxLength={15}
          />
        </>
      )}

      <Text style={styles.label}>Couleur</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Noir, Blanc..."
        placeholderTextColor={colors.textMuted}
        value={color}
        onChangeText={setColor}
      />

      {isSmartphone && (
        <>
          <Text style={styles.label}>RAM (Go)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 8"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            value={ram}
            onChangeText={setRam}
          />

          <Text style={styles.label}>ROM (Go)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 128"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            value={rom}
            onChangeText={setRom}
          />
        </>
      )}

      <TouchableOpacity style={styles.button} onPress={handleAdd}>
        <CheckCircle size={20} color={colors.textInverse} />
        <Text style={styles.buttonText}>Ajouter au panier</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 20,
      paddingBottom: 40,
    },
    itemHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    itemTitleRow: {
      flex: 1,
      marginRight: 12,
    },
    itemName: {
      color: colors.text,
      fontSize: 20,
      fontWeight: "700",
    },
    itemBrand: {
      color: colors.textMuted,
      fontSize: 14,
      marginTop: 2,
    },
    stockPill: {
      backgroundColor: colors.success + "22",
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 4,
    },
    stockText: {
      color: colors.success,
      fontSize: 13,
      fontWeight: "600",
    },
    subtotalBanner: {
      backgroundColor: colors.primary + "18",
      borderRadius: 12,
      padding: 14,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    subtotalLabel: {
      color: colors.primary,
      fontSize: 15,
      fontWeight: "500",
    },
    subtotalValue: {
      color: colors.primary,
      fontSize: 18,
      fontWeight: "700",
    },
    label: {
      color: colors.textSecondary,
      fontSize: 13,
      fontWeight: "600",
      marginBottom: 6,
      marginTop: 4,
    },
    input: {
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 12,
      padding: 14,
      color: colors.inputText,
      fontSize: 16,
      marginBottom: 14,
    },
    button: {
      backgroundColor: colors.primary,
      borderRadius: 14,
      padding: 16,
      marginTop: 8,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 10,
    },
    buttonText: {
      color: colors.textInverse,
      fontSize: 16,
      fontWeight: "700",
    },
  });
