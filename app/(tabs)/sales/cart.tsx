import { useToast } from "@/components/ui/Toast";
import { useAccessory } from "@/core/contexts/AccessoryContext";
import { useProduct } from "@/core/contexts/ProductContext";
import { useSale } from "@/core/contexts/SaleContext";
import { CartItem, useCartStore } from "@/core/store/cart.store";
import { formatAriary } from "@/core/utils/currency.utils";
import { useTheme } from "@/theme/ThemeProvider";
import { ThemeColors } from "@/theme/colors";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Trash2, User } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function CartScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const totalAmount = useCartStore((s) =>
    s.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
  );

  const { showToast } = useToast();
  const { addSale } = useSale();
  const { products, updateProduct } = useProduct();
  const { accessorys: accessories, updateAccessory } = useAccessory();

  const [confirming, setConfirming] = useState(false);
  const [buyerName, setBuyerName] = useState("");
  const [buyerCin, setBuyerCin] = useState("");

  const handleRemove = (cartId: string, name: string) => {
    Alert.alert("Retirer du panier", `Retirer "${name}" du panier ?`, [
      { text: "Annuler", style: "cancel" },
      {
        text: "Retirer",
        style: "destructive",
        onPress: () => removeItem(cartId),
      },
    ]);
  };

  const handleConfirm = async () => {
    if (items.length === 0) return;

    const buyer = buyerName.trim() || null;
    const cin = buyerCin.trim() || null;

    Alert.alert(
      "Confirmer la vente",
      `${items.length} article(s) — Total : ${totalAmount.toLocaleString()} Fmg\n\nCette action va enregistrer toutes les ventes et mettre à jour le stock.`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Confirmer",
          style: "default",
          onPress: async () => {
            setConfirming(true);
            try {
              for (const item of items) {
                await addSale({
                  sellerId: item.sellerId,
                  productId: item.type === "product" ? item.itemId : undefined,
                  accessoryId:
                    item.type === "accessory" ? item.itemId : undefined,
                  quantity: item.quantity,
                  unitPrice: item.unitPrice,
                  imei: item.imei,
                  color: item.color,
                  ram: item.ram,
                  rom: item.rom,
                  buyerName: buyer ?? undefined,
                  buyerCin: cin ?? undefined,
                  createdAt: new Date().toISOString(),
                });

                if (item.type === "product") {
                  const p = products.find((x) => x.id === item.itemId);
                  if (p) {
                    await updateProduct({
                      ...p,
                      quantity: Math.max(0, p.quantity - item.quantity),
                      stockUpdatedAt: new Date().toISOString(),
                    });
                  }
                } else {
                  const a = accessories.find((x) => x.id === item.itemId);
                  if (a) {
                    await updateAccessory({
                      ...a,
                      quantity: Math.max(0, a.quantity - item.quantity),
                      stockUpdatedAt: new Date().toISOString(),
                    });
                  }
                }
              }

              clearCart();
              showToast(
                "success",
                `${items.length} vente(s) enregistrée(s) avec succès`,
              );
              router.replace("/(tabs)/sales");
            } catch (error) {
              Alert.alert(
                "Erreur",
                "Une erreur s'est produite lors de la confirmation.",
              );
              console.error(error);
            } finally {
              setConfirming(false);
            }
          },
        },
      ],
    );
  };

  const renderItem = ({ item }: { item: CartItem }) => (
    <View style={styles.card}>
      {item.imageUri ? (
        <Image
          source={{ uri: item.imageUri }}
          style={styles.image}
          contentFit="cover"
        />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]} />
      )}

      <View style={styles.cardInfo}>
        <Text style={styles.cardName} numberOfLines={1}>
          {item.name}
        </Text>
        {item.brand && <Text style={styles.cardSub}>{item.brand}</Text>}
        <View style={styles.cardDetails}>
          <Text style={styles.cardQty}>×{item.quantity}</Text>
          <Text style={styles.cardPrice}>
            {formatAriary(item.quantity * item.unitPrice)}
          </Text>
        </View>
        {item.imei && <Text style={styles.cardMeta}>IMEI : {item.imei}</Text>}
        {item.color && (
          <Text style={styles.cardMeta}>Couleur : {item.color}</Text>
        )}
        {item.ram && (
          <Text style={styles.cardMeta}>
            RAM {item.ram} Go
            {item.rom
              ? ` / ROM ${item.rom >= 1024 ? `${item.rom / 1024} To` : `${item.rom} Go`}`
              : ""}
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.removeBtn}
        onPress={() => handleRemove(item.cartId, item.name)}
      >
        <Trash2 size={18} color={colors.danger} />
      </TouchableOpacity>
    </View>
  );

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Panier vide</Text>
        <Text style={styles.emptySub}>
          Ajoutez des articles depuis la liste de vente
        </Text>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Retour aux articles</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <FlatList
        data={items}
        keyExtractor={(item) => item.cartId}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <View style={styles.buyerSection}>
            <View style={styles.buyerHeader}>
              <User size={16} color={colors.textSecondary} />
              <Text style={styles.buyerTitle}>Informations acheteur</Text>
              <Text style={styles.buyerOptional}>(optionnel)</Text>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Nom complet"
              placeholderTextColor={colors.inputPlaceholder}
              value={buyerName}
              onChangeText={setBuyerName}
              autoCapitalize="words"
            />
            <TextInput
              style={styles.input}
              placeholder="Numéro CIN"
              placeholderTextColor={colors.inputPlaceholder}
              value={buyerCin}
              onChangeText={setBuyerCin}
              keyboardType="number-pad"
            />
          </View>
        }
      />

      {/* Footer total + confirmation */}
      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>
            {items.length} article{items.length > 1 ? "s" : ""}
          </Text>
          <Text style={styles.totalAmount}>{formatAriary(totalAmount)}</Text>
        </View>

        <TouchableOpacity
          style={[styles.confirmBtn, confirming && styles.confirmBtnDisabled]}
          onPress={handleConfirm}
          disabled={confirming}
        >
          {confirming ? (
            <ActivityIndicator color={colors.textInverse} />
          ) : (
            <Text style={styles.confirmText}>Confirmer la vente</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    list: {
      padding: 16,
      paddingBottom: 8,
    },
    emptyContainer: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: "center",
      alignItems: "center",
      gap: 12,
      padding: 32,
    },
    emptyText: {
      color: colors.text,
      fontSize: 22,
      fontWeight: "700",
    },
    emptySub: {
      color: colors.textMuted,
      fontSize: 15,
      textAlign: "center",
    },
    backBtn: {
      marginTop: 8,
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingHorizontal: 24,
      paddingVertical: 12,
    },
    backBtnText: {
      color: colors.textInverse,
      fontWeight: "600",
      fontSize: 15,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
      gap: 12,
    },
    image: {
      width: 56,
      height: 56,
      borderRadius: 10,
    },
    imagePlaceholder: {
      backgroundColor: colors.inputBackground,
    },
    cardInfo: {
      flex: 1,
      gap: 2,
    },
    cardName: {
      color: colors.text,
      fontSize: 15,
      fontWeight: "600",
    },
    cardSub: {
      color: colors.textMuted,
      fontSize: 12,
    },
    cardDetails: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 4,
    },
    cardQty: {
      color: colors.textSecondary,
      fontSize: 14,
      fontWeight: "600",
    },
    cardPrice: {
      color: colors.primary,
      fontSize: 15,
      fontWeight: "700",
    },
    cardMeta: {
      color: colors.textMuted,
      fontSize: 12,
      marginTop: 2,
    },
    removeBtn: {
      padding: 8,
    },
    buyerSection: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      marginBottom: 8,
    },
    buyerHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 14,
    },
    buyerTitle: {
      color: colors.text,
      fontSize: 15,
      fontWeight: "600",
    },
    buyerOptional: {
      color: colors.textMuted,
      fontSize: 13,
    },
    input: {
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      color: colors.inputText,
      fontSize: 15,
      marginBottom: 10,
    },
    footer: {
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      padding: 20,
      paddingBottom: 36,
      gap: 14,
    },
    totalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    totalLabel: {
      color: colors.textSecondary,
      fontSize: 15,
    },
    totalAmount: {
      color: colors.text,
      fontSize: 22,
      fontWeight: "700",
    },
    confirmBtn: {
      backgroundColor: colors.primary,
      borderRadius: 14,
      paddingVertical: 16,
      alignItems: "center",
    },
    confirmBtnDisabled: {
      opacity: 0.6,
    },
    confirmText: {
      color: colors.textInverse,
      fontSize: 16,
      fontWeight: "700",
    },
  });
