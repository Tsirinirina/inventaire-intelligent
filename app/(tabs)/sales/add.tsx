import NumberScanner from "@/components/scanner/NumberScanner";
import { useAuth } from "@/core/contexts/AuthContext";
import { SellableItem } from "@/core/entity/sale.entity";
import { CartItem, useCartStore } from "@/core/store/cart.store";
import { useTheme } from "@/theme/ThemeProvider";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Check, CheckCircle, ScanLine } from "lucide-react-native";
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

const RAM_VALUES = [1, 2, 3, 4, 6, 8, 12, 16] as const;
const ROM_VALUES = [16, 32, 64, 128, 256, 512, 1024] as const;

const PRESET_COLORS = [
  { name: "Noir", hex: "#1C1C1E" },
  { name: "Blanc", hex: "#F5F5F7" },
  { name: "Argent", hex: "#B0B0B8" },
  { name: "Gris", hex: "#636366" },
  { name: "Or", hex: "#D4AF37" },
  { name: "Bleu", hex: "#1A73E8" },
  { name: "Marine", hex: "#1A237E" },
  { name: "Rouge", hex: "#E53935" },
  { name: "Rose", hex: "#EC407A" },
  { name: "Vert", hex: "#43A047" },
  { name: "Violet", hex: "#7B1FA2" },
  { name: "Jaune", hex: "#FDD835" },
] as const;

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
  const [ram, setRam] = useState<number | null>(null);
  const [rom, setRom] = useState<number | null>(null);
  const [showScanner, setShowScanner] = useState(false);

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
      ram: ram ?? undefined,
      rom: rom ?? undefined,
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

      {item.basePrice && (
        <View style={styles.subtotalBanner}>
          <Text style={styles.subtotalLabel}>Prix de base</Text>
          <Text style={styles.subtotalValue}>
            {formatAriary(item.basePrice)}
          </Text>
        </View>
      )}

      {/* Sous-total dynamique */}
      {qty > 0 && price > 0 && (
        <View style={styles.subtotalBanner}>
          <Text style={styles.subtotalLabel}>Sous-total</Text>
          <Text style={styles.subtotalValue}>{formatAriary(subtotal)}</Text>
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

      <Text style={styles.label}>Prix unitaire (Fmg)</Text>
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
          <View style={styles.imeiRow}>
            <TextInput
              style={[styles.input, styles.imeiInput]}
              placeholder="15 chiffres"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={imei}
              onChangeText={setImei}
              maxLength={15}
            />
            <TouchableOpacity
              style={styles.scanBtn}
              onPress={() => setShowScanner(true)}
            >
              <ScanLine size={22} color={colors.textInverse} />
            </TouchableOpacity>
          </View>
        </>
      )}

      {showScanner && (
        <NumberScanner
          onScan={(value) => {
            setImei(value.slice(0, 15));
            setShowScanner(false);
          }}
          onClose={() => setShowScanner(false)}
        />
      )}

      <View style={styles.colorLabelRow}>
        <Text style={styles.label}>Couleur</Text>
        {color ? (
          <Text style={styles.colorSelected}>{color}</Text>
        ) : (
          <Text style={styles.colorNone}>Aucune</Text>
        )}
      </View>
      <View style={styles.colorGrid}>
        {PRESET_COLORS.map((c) => {
          const isSelected = color === c.name;
          const isLight =
            c.hex === "#F5F5F7" || c.hex === "#FDD835" || c.hex === "#D4AF37";
          return (
            <TouchableOpacity
              key={c.name}
              style={[
                styles.colorSwatch,
                { backgroundColor: c.hex },
                isSelected && styles.colorSwatchSelected,
              ]}
              onPress={() => setColor(isSelected ? "" : c.name)}
              activeOpacity={0.75}
            >
              {isSelected && (
                <Check
                  size={16}
                  color={isLight ? "#000" : "#fff"}
                  strokeWidth={3}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {isSmartphone && (
        <>
          <View style={styles.chipLabelRow}>
            <Text style={styles.label}>RAM (Go)</Text>
            {ram !== null && (
              <Text style={styles.chipLabelValue}>{ram} Go</Text>
            )}
          </View>
          <View style={styles.chipRow}>
            {RAM_VALUES.map((v) => {
              const isSelected = ram === v;
              return (
                <TouchableOpacity
                  key={v}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                  onPress={() => setRam(isSelected ? null : v)}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.chipText,
                      isSelected && styles.chipTextSelected,
                    ]}
                  >
                    {v}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.chipLabelRow}>
            <Text style={styles.label}>ROM (Go)</Text>
            {rom !== null && (
              <Text style={styles.chipLabelValue}>
                {rom >= 1024 ? `${rom / 1024} To` : `${rom} Go`}
              </Text>
            )}
          </View>
          <View style={styles.chipRow}>
            {ROM_VALUES.map((v) => {
              const isSelected = rom === v;
              const label = v >= 1024 ? `${v / 1024}To` : `${v}`;
              return (
                <TouchableOpacity
                  key={v}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                  onPress={() => setRom(isSelected ? null : v)}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.chipText,
                      isSelected && styles.chipTextSelected,
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
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
    imeiRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 14,
    },
    imeiInput: {
      flex: 1,
      marginBottom: 0,
    },
    scanBtn: {
      width: 52,
      height: 52,
      borderRadius: 12,
      backgroundColor: colors.accent,
      justifyContent: "center",
      alignItems: "center",
    },
    chipLabelRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 8,
      marginTop: 4,
    },
    chipLabelValue: {
      color: colors.primary,
      fontSize: 13,
      fontWeight: "600",
    },
    chipRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 14,
    },
    chip: {
      paddingHorizontal: 16,
      paddingVertical: 9,
      borderRadius: 20,
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1.5,
      borderColor: colors.inputBorder,
    },
    chipSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    chipText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.textSecondary,
    },
    chipTextSelected: {
      color: colors.textInverse,
    },
    colorLabelRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 8,
      marginTop: 4,
    },
    colorSelected: {
      color: colors.primary,
      fontSize: 13,
      fontWeight: "600",
    },
    colorNone: {
      color: colors.textMuted,
      fontSize: 13,
    },
    colorGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      marginBottom: 14,
    },
    colorSwatch: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1.5,
      borderColor: "rgba(0,0,0,0.12)",
    },
    colorSwatchSelected: {
      borderWidth: 3,
      borderColor: colors.primary,
      transform: [{ scale: 1.12 }],
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
