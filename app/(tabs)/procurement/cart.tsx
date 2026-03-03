import ProcurementReceiptView from "@/components/procurement/ProcurementReceiptView";
import { useToast } from "@/components/ui/Toast";
import {
  ProcurementItem,
  useProcurementStore,
} from "@/core/store/procurement.store";
import { formatProcurementListAsText } from "@/core/utils/procurement-export.utils";
import { capitalizeWords } from "@/core/utils/capitalize.utils";
import { ThemeColors } from "@/theme/colors";
import { useTheme } from "@/theme/ThemeProvider";
import * as Clipboard from "expo-clipboard";
import * as Sharing from "expo-sharing";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
  ClipboardCopy,
  ImageIcon,
  Share2,
  Trash2,
  XCircle,
} from "lucide-react-native";
import React, { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { captureRef } from "react-native-view-shot";

export default function ProcurementCartScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const items = useProcurementStore((s) => s.items);
  const removeItem = useProcurementStore((s) => s.removeItem);
  const clearCart = useProcurementStore((s) => s.clearCart);
  const totalQuantity = useProcurementStore((s) =>
    s.items.reduce((sum, i) => sum + i.quantityToOrder, 0),
  );
  const totalCost = useProcurementStore((s) =>
    s.items.reduce(
      (sum, i) => sum + (i.estimatedUnitCost ?? 0) * i.quantityToOrder,
      0,
    ),
  );

  const { showToast } = useToast();
  const receiptRef = useRef<View>(null);
  const [exporting, setExporting] = useState(false);

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

  const handleClearCart = () => {
    Alert.alert(
      "Vider le panier",
      "Voulez-vous vraiment vider tout le panier d'approvisionnement ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Vider",
          style: "destructive",
          onPress: () => {
            clearCart();
            showToast("info", "Panier vidé");
          },
        },
      ],
    );
  };

  const handleCopyText = async () => {
    try {
      const text = formatProcurementListAsText(items);
      await Clipboard.setStringAsync(text);
      showToast("success", "Liste copiée dans le presse-papiers");
    } catch {
      showToast("error", "Erreur lors de la copie");
    }
  };

  const captureImage = async (): Promise<string | null> => {
    try {
      setExporting(true);
      const uri = await captureRef(receiptRef, {
        format: "png",
        quality: 1,
        result: "tmpfile",
      });
      return uri;
    } catch (error) {
      console.error("captureImage error:", error);
      showToast("error", "Erreur lors de l'export de l'image");
      return null;
    } finally {
      setExporting(false);
    }
  };

  const handleExportImage = async () => {
    const uri = await captureImage();
    if (uri) {
      showToast("success", "Image exportée avec succès");
    }
  };

  const handleShare = async () => {
    const uri = await captureImage();
    if (!uri) return;

    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      showToast("error", "Le partage n'est pas disponible sur cet appareil");
      return;
    }

    try {
      await Sharing.shareAsync(uri, {
        mimeType: "image/png",
        dialogTitle: "Partager la liste d'approvisionnement",
      });
    } catch {
      showToast("error", "Erreur lors du partage");
    }
  };

  const renderItem = ({ item }: { item: ProcurementItem }) => (
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
        <Text style={styles.cardCategory}>
          {capitalizeWords(item.category)}
        </Text>

        <View style={styles.cardDetails}>
          <View style={styles.detailPill}>
            <Text style={styles.detailPillText}>
              Stock : {item.currentStock}
            </Text>
          </View>
          <View style={[styles.detailPill, styles.detailPillAccent]}>
            <Text style={styles.detailPillAccentText}>
              À commander : {item.quantityToOrder}
            </Text>
          </View>
        </View>

        {item.estimatedUnitCost != null && item.estimatedUnitCost > 0 && (
          <Text style={styles.cardCost}>
            {(item.estimatedUnitCost * item.quantityToOrder).toLocaleString()}{" "}
            Ar
          </Text>
        )}
        {item.notes && (
          <Text style={styles.cardNotes} numberOfLines={2}>
            {item.notes}
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
          Ajoutez des articles depuis la liste d'approvisionnement
        </Text>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Retour aux articles</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.cartId}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <View style={styles.summarySection}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total articles</Text>
              <Text style={styles.summaryValue}>{items.length}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total quantité</Text>
              <Text style={styles.summaryValue}>{totalQuantity}</Text>
            </View>
            {totalCost > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Coût total estimé</Text>
                <Text style={styles.summaryTotal}>
                  {totalCost.toLocaleString()} Ar
                </Text>
              </View>
            )}
          </View>
        }
      />

      {/* Footer actions */}
      <View style={styles.footer}>
        {/* Action buttons row */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleCopyText}
          >
            <ClipboardCopy size={20} color={colors.primary} />
            <Text style={styles.actionBtnText}>Copier</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleExportImage}
            disabled={exporting}
          >
            {exporting ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <ImageIcon size={20} color={colors.primary} />
            )}
            <Text style={styles.actionBtnText}>Image</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnShare]}
            onPress={handleShare}
            disabled={exporting}
          >
            <Share2 size={20} color={colors.textInverse} />
            <Text style={styles.actionBtnShareText}>Partager</Text>
          </TouchableOpacity>
        </View>

        {/* Clear cart button */}
        <TouchableOpacity
          style={styles.clearBtn}
          onPress={handleClearCart}
        >
          <XCircle size={16} color={colors.danger} />
          <Text style={styles.clearBtnText}>Vider le panier</Text>
        </TouchableOpacity>
      </View>

      {/* Hidden receipt view for image capture */}
      <View style={styles.hiddenReceipt}>
        <ProcurementReceiptView ref={receiptRef} items={items} />
      </View>
    </View>
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
      alignItems: "flex-start",
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
    cardCategory: {
      color: colors.textMuted,
      fontSize: 11,
    },
    cardDetails: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
      marginTop: 6,
    },
    detailPill: {
      backgroundColor: colors.surfaceElevated,
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    detailPillText: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: "500",
    },
    detailPillAccent: {
      backgroundColor: colors.primary + "20",
    },
    detailPillAccentText: {
      color: colors.primary,
      fontSize: 12,
      fontWeight: "600",
    },
    cardCost: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: "700",
      marginTop: 4,
    },
    cardNotes: {
      color: colors.textMuted,
      fontSize: 12,
      fontStyle: "italic",
      marginTop: 2,
    },
    removeBtn: {
      padding: 8,
    },
    summarySection: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      marginBottom: 8,
      gap: 10,
    },
    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    summaryLabel: {
      color: colors.textSecondary,
      fontSize: 14,
    },
    summaryValue: {
      color: colors.text,
      fontSize: 15,
      fontWeight: "600",
    },
    summaryTotal: {
      color: colors.primary,
      fontSize: 18,
      fontWeight: "700",
    },
    footer: {
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      padding: 16,
      paddingBottom: 32,
      gap: 12,
    },
    actionsRow: {
      flexDirection: "row",
      gap: 10,
    },
    actionBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: colors.primary,
      backgroundColor: colors.background,
    },
    actionBtnText: {
      color: colors.primary,
      fontSize: 13,
      fontWeight: "600",
    },
    actionBtnShare: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    actionBtnShareText: {
      color: colors.textInverse,
      fontSize: 13,
      fontWeight: "600",
    },
    clearBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingVertical: 10,
    },
    clearBtnText: {
      color: colors.danger,
      fontSize: 14,
      fontWeight: "500",
    },
    hiddenReceipt: {
      position: "absolute",
      left: -9999,
      top: 0,
    },
  });
