import { SellableItem } from "@/core/entity/sale.entity";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity
} from "react-native";

const COLORS = {
  background: "#0F172A",
  card: "#1E293B",
  primary: "#22C55E",
  text: "#F8FAFC",
  muted: "#94A3B8",
};

export default function AddToCartScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { item } = route.params as { item: SellableItem };

  const [quantity, setQuantity] = useState("1");
  const [unitPrice, setUnitPrice] = useState(item.basePrice.toString());
  const [imei, setImei] = useState("");
  const [color, setColor] = useState("");
  const [ram, setRam] = useState("");
  const [rom, setRom] = useState("");

  const handleAdd = () => {
    navigation.navigate("Cart", {
      sale: {
        sellerId: 1,
        productId: item.type === "product" ? item.id : undefined,
        accessoryId: item.type === "accessory" ? item.id : undefined,
        quantity: Number(quantity),
        unitPrice: Number(unitPrice),
        imei,
        color,
        ram: ram ? Number(ram) : undefined,
        rom: rom ? Number(rom) : undefined,
        createdAt: new Date().toISOString(),
      },
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{item.name}</Text>

      <TextInput
        style={styles.input}
        placeholder="Quantité"
        placeholderTextColor={COLORS.muted}
        keyboardType="numeric"
        value={quantity}
        onChangeText={setQuantity}
      />

      <TextInput
        style={styles.input}
        placeholder="Prix unitaire"
        placeholderTextColor={COLORS.muted}
        keyboardType="numeric"
        value={unitPrice}
        onChangeText={setUnitPrice}
      />

      {item.category === "smartphone" && (
        <TextInput
          style={styles.input}
          placeholder="IMEI"
          placeholderTextColor={COLORS.muted}
          value={imei}
          onChangeText={setImei}
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Couleur"
        placeholderTextColor={COLORS.muted}
        value={color}
        onChangeText={setColor}
      />

      <TextInput
        style={styles.input}
        placeholder="RAM"
        keyboardType="numeric"
        placeholderTextColor={COLORS.muted}
        value={ram}
        onChangeText={setRam}
      />

      <TextInput
        style={styles.input}
        placeholder="ROM"
        keyboardType="numeric"
        placeholderTextColor={COLORS.muted}
        value={rom}
        onChangeText={setRom}
      />

      <TouchableOpacity style={styles.button} onPress={handleAdd}>
        <Text style={styles.buttonText}>Ajouter au panier</Text>
      </TouchableOpacity>
    </ScrollView>
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
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    backgroundColor: COLORS.card,
    padding: 14,
    borderRadius: 14,
    color: COLORS.text,
    marginBottom: 14,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 16,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
});
