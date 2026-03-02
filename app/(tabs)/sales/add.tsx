import { useAuth } from "@/core/contexts/AuthContext";
import { SellableItem } from "@/core/entity/sale.entity";
import { useTheme } from "@/theme/ThemeProvider";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";

export default function AddToCartScreen() {
  const router = useRouter();
  const { item: itemStr } = useLocalSearchParams<{ item: string }>();
  const item: SellableItem = JSON.parse(itemStr);
  const { currentSeller } = useAuth();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [quantity, setQuantity] = useState("1");
  const [unitPrice, setUnitPrice] = useState(item.basePrice.toString());
  const [imei, setImei] = useState("");
  const [color, setColor] = useState("");
  const [ram, setRam] = useState("");
  const [rom, setRom] = useState("");

  const handleAdd = () => {
    const sale = {
      sellerId: currentSeller?.id ?? 1,
      productId: item.type === "product" ? item.id : undefined,
      accessoryId: item.type === "accessory" ? item.id : undefined,
      quantity: Number(quantity),
      unitPrice: Number(unitPrice),
      imei: imei || undefined,
      color: color || undefined,
      ram: ram ? Number(ram) : undefined,
      rom: rom ? Number(rom) : undefined,
      createdAt: new Date().toISOString(),
    };

    router.push({
      pathname: "/(tabs)/sales/cart",
      params: { sale: JSON.stringify(sale) },
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{item.name}</Text>

      <TextInput
        style={styles.input}
        placeholder="Quantité"
        placeholderTextColor={colors.textMuted}
        keyboardType="numeric"
        value={quantity}
        onChangeText={setQuantity}
      />

      <TextInput
        style={styles.input}
        placeholder="Prix unitaire"
        placeholderTextColor={colors.textMuted}
        keyboardType="numeric"
        value={unitPrice}
        onChangeText={setUnitPrice}
      />

      {item.category === "smartphone" && (
        <TextInput
          style={styles.input}
          placeholder="IMEI"
          placeholderTextColor={colors.textMuted}
          value={imei}
          onChangeText={setImei}
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Couleur"
        placeholderTextColor={colors.textMuted}
        value={color}
        onChangeText={setColor}
      />

      <TextInput
        style={styles.input}
        placeholder="RAM"
        keyboardType="numeric"
        placeholderTextColor={colors.textMuted}
        value={ram}
        onChangeText={setRam}
      />

      <TextInput
        style={styles.input}
        placeholder="ROM"
        keyboardType="numeric"
        placeholderTextColor={colors.textMuted}
        value={rom}
        onChangeText={setRom}
      />

      <TouchableOpacity style={styles.button} onPress={handleAdd}>
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
      padding: 16,
    },
    title: {
      color: colors.text,
      fontSize: 22,
      fontWeight: "bold",
      marginBottom: 20,
    },
    input: {
      backgroundColor: colors.surfaceElevated,
      padding: 14,
      borderRadius: 14,
      color: colors.text,
      marginBottom: 14,
    },
    button: {
      backgroundColor: colors.primary,
      padding: 16,
      borderRadius: 16,
      marginTop: 10,
    },
    buttonText: {
      color: colors.textInverse,
      textAlign: "center",
      fontWeight: "bold",
      fontSize: 16,
    },
  });
