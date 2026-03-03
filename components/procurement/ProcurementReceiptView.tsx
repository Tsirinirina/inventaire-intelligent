import { ProcurementItem } from "@/core/store/procurement.store";
import { formatAriary } from "@/core/utils/currency.utils";
import { formatDate } from "@/core/utils/date.utils";
import { capitalizeWords } from "@/core/utils/capitalize.utils";
import React, { forwardRef } from "react";
import { View, Text, StyleSheet } from "react-native";

interface Props {
  items: ProcurementItem[];
}

const ProcurementReceiptView = forwardRef<View, Props>(({ items }, ref) => {
  const totalQty = items.reduce((s, i) => s + i.quantityToOrder, 0);
  const totalCost = items.reduce(
    (s, i) => s + (i.estimatedUnitCost ?? 0) * i.quantityToOrder,
    0,
  );

  return (
    <View ref={ref} style={styles.container} collapsable={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Liste d'Approvisionnement</Text>
        <Text style={styles.date}>{formatDate(new Date().toISOString())}</Text>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Items */}
      {items.map((item, index) => (
        <View key={item.cartId} style={styles.itemRow}>
          <Text style={styles.itemIndex}>{index + 1}.</Text>
          <View style={styles.itemBody}>
            <Text style={styles.itemName}>
              {item.name}
              {item.brand ? ` (${item.brand})` : ""}
            </Text>
            <Text style={styles.itemCategory}>
              {capitalizeWords(item.category)}
            </Text>
            <Text style={styles.itemDetail}>
              Stock actuel : {item.currentStock} | À commander :{" "}
              {item.quantityToOrder}
            </Text>
            {item.estimatedUnitCost != null && item.estimatedUnitCost > 0 && (
              <Text style={styles.itemCost}>
                {formatAriary(item.estimatedUnitCost * item.quantityToOrder)}
              </Text>
            )}
            {item.notes && (
              <Text style={styles.itemNotes}>Note : {item.notes}</Text>
            )}
          </View>
        </View>
      ))}

      {/* Footer */}
      <View style={styles.divider} />
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Total articles : {items.length}
        </Text>
        <Text style={styles.footerText}>Total quantité : {totalQty}</Text>
        {totalCost > 0 && (
          <Text style={styles.footerTotal}>
            Coût total estimé : {formatAriary(totalCost)}
          </Text>
        )}
      </View>

      {/* Watermark */}
      <Text style={styles.watermark}>Généré par Inventaire Intelligent</Text>
    </View>
  );
});

ProcurementReceiptView.displayName = "ProcurementReceiptView";

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 16,
    width: 380,
  },
  header: {
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
  },
  date: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 12,
  },
  itemRow: {
    flexDirection: "row",
    marginBottom: 12,
    gap: 8,
  },
  itemIndex: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
    width: 24,
  },
  itemBody: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0F172A",
  },
  itemCategory: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 1,
  },
  itemDetail: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },
  itemCost: {
    fontSize: 14,
    fontWeight: "700",
    color: "#00A87D",
    marginTop: 2,
  },
  itemNotes: {
    fontSize: 12,
    color: "#94A3B8",
    fontStyle: "italic",
    marginTop: 2,
  },
  footer: {
    gap: 4,
  },
  footerText: {
    fontSize: 14,
    color: "#334155",
    fontWeight: "500",
  },
  footerTotal: {
    fontSize: 16,
    fontWeight: "700",
    color: "#00A87D",
    marginTop: 4,
  },
  watermark: {
    fontSize: 10,
    color: "#CBD5E1",
    textAlign: "center",
    marginTop: 16,
  },
});

export default ProcurementReceiptView;
