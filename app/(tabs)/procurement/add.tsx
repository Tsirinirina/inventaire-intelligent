import { SellableItem } from "@/core/entity/sale.entity";
import {
  ProcurementItem,
  useProcurementStore,
} from "@/core/store/procurement.store";
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
import { formatAriary } from "../../../core/utils/currency.utils";

export default function AddToProcurementScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const { item: itemStr } = useLocalSearchParams<{ item: string }>();
  const item: SellableItem = JSON.parse(itemStr);
  const addItem = useProcurementStore((s) => s.addItem);

  const [quantity, setQuantity] = useState("1");
  const [estimatedCost, setEstimatedCost] = useState(item.basePrice.toString());
  const [notes, setNotes] = useState("");

  const qty = Number(quantity) || 0;
  const cost = Number(estimatedCost) || 0;
  const subtotal = qty * cost;

  const handleAdd = () => {
    if (qty <= 0) {
      Alert.alert(
        "Quantité invalide",
        "Veuillez entrer une quantité supérieure à 0.",
      );
      return;
    }

    const procurementItem: ProcurementItem = {
      cartId: `${item.type}-${item.id}-${Date.now()}`,
      itemId: item.id,
      type: item.type,
      name: item.name,
      imageUri: item.imageUri,
      category: item.category,
      brand: item.brand,
      currentStock: item.quantity,
      quantityToOrder: qty,
      estimatedUnitCost: cost > 0 ? cost : undefined,
      notes: notes.trim() || undefined,
    };

    addItem(procurementItem);
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
      {qty > 0 && cost > 0 && (
        <View style={styles.subtotalBanner}>
          <Text style={styles.subtotalLabel}>Coût total estimé</Text>
          <Text style={styles.subtotalValue}>{formatAriary(subtotal)}</Text>
        </View>
      )}

      {/* Quantité à commander */}
      <Text style={styles.label}>Quantité à commander</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: 10"
        placeholderTextColor={colors.textMuted}
        keyboardType="numeric"
        value={quantity}
        onChangeText={setQuantity}
      />

      {/* Coût unitaire estimé */}
      <Text style={styles.label}>Coût unitaire estimé (Fmg)</Text>
      <TextInput
        style={styles.input}
        placeholder="Prix d'achat estimé"
        placeholderTextColor={colors.textMuted}
        keyboardType="numeric"
        value={estimatedCost}
        onChangeText={setEstimatedCost}
      />

      {/* Notes */}
      <Text style={styles.label}>Notes (optionnel)</Text>
      <TextInput
        style={[styles.input, styles.notesInput]}
        placeholder="Ex: Commander chez fournisseur X, couleur noire..."
        placeholderTextColor={colors.textMuted}
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />

      {/* Bouton ajouter */}
      <TouchableOpacity style={styles.button} onPress={handleAdd}>
        <CheckCircle size={20} color={colors.textInverse} />
        <Text style={styles.buttonText}>Ajouter au panier d'appro</Text>
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
    notesInput: {
      minHeight: 80,
      paddingTop: 14,
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
