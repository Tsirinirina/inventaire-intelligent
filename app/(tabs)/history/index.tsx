import { useAccessory } from "@/core/contexts/AccessoryContext";
import { useProduct } from "@/core/contexts/ProductContext";
import { useSale } from "@/core/contexts/SaleContext";
import { STOCK_MOVEMENT_QUERY_KEY, StockMovement } from "@/core/entity/stock_movement.entity";
import { getAllStockMovements } from "@/core/services/stock_movement.service";
import { getDatabase } from "@/core/database";
import { formatAriary } from "@/core/utils/currency.utils";
import { useTheme } from "@/theme/ThemeProvider";
import { ThemeColors } from "@/theme/colors";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  CalendarDays,
  Package,
  ShoppingCart,
  TabletSmartphone,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type TabType = "sales" | "restock";
type DateFilter = "today" | "week" | "month" | "all";
type TypeFilter = "all" | "product" | "accessory";

const DATE_FILTERS: { key: DateFilter; label: string }[] = [
  { key: "today", label: "Auj." },
  { key: "week", label: "7 jours" },
  { key: "month", label: "Ce mois" },
  { key: "all", label: "Tout" },
];

function isInRange(dateStr: string, filter: DateFilter): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  if (filter === "today") {
    return d.toDateString() === now.toDateString();
  }
  if (filter === "week") {
    const cutoff = new Date(now);
    cutoff.setDate(now.getDate() - 6);
    cutoff.setHours(0, 0, 0, 0);
    return d >= cutoff;
  }
  if (filter === "month") {
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  }
  return true;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HistoryScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [activeTab, setActiveTab] = useState<TabType>("sales");
  const [dateFilter, setDateFilter] = useState<DateFilter>("month");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  const { sales, salesLoading } = useSale();
  const { products } = useProduct();
  const { accessorys: accessories } = useAccessory();

  const db = getDatabase();
  const { data: movements = [], isLoading: movementsLoading } = useQuery({
    queryKey: [STOCK_MOVEMENT_QUERY_KEY],
    queryFn: () => getAllStockMovements(db),
  });

  // Ventes enrichies avec le nom de l'article
  const enrichedSales = useMemo(() => {
    return sales
      .filter((s) => {
        if (!isInRange(s.createdAt, dateFilter)) return false;
        if (typeFilter === "product" && !s.productId) return false;
        if (typeFilter === "accessory" && !s.accessoryId) return false;
        return true;
      })
      .map((s) => {
        let itemName = "Article inconnu";
        let itemType: "product" | "accessory" = "product";
        if (s.productId) {
          const p = products.find((p) => p.id === s.productId);
          itemName = p?.name ?? `Produit #${s.productId}`;
          itemType = "product";
        } else if (s.accessoryId) {
          const a = accessories.find((a) => a.id === s.accessoryId);
          itemName = a?.name ?? `Accessoire #${s.accessoryId}`;
          itemType = "accessory";
        }
        return { ...s, itemName, itemType };
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [sales, products, accessories, dateFilter, typeFilter]);

  const filteredMovements = useMemo(() => {
    return movements
      .filter((m) => {
        if (!isInRange(m.createdAt, dateFilter)) return false;
        if (typeFilter === "product" && m.itemType !== "product") return false;
        if (typeFilter === "accessory" && m.itemType !== "accessory") return false;
        return true;
      });
  }, [movements, dateFilter, typeFilter]);

  const totalSalesAmount = useMemo(
    () => enrichedSales.reduce((sum, s) => sum + s.unitPrice * s.quantity, 0),
    [enrichedSales],
  );
  const totalRestockQty = useMemo(
    () => filteredMovements.reduce((sum, m) => sum + m.quantity, 0),
    [filteredMovements],
  );

  const isLoading = activeTab === "sales" ? salesLoading : movementsLoading;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Historique</Text>

        {/* Tabs */}
        <View style={styles.tabs}>
          <Pressable
            style={[styles.tab, activeTab === "sales" && styles.tabActive]}
            onPress={() => setActiveTab("sales")}
          >
            <ShoppingCart
              size={16}
              color={activeTab === "sales" ? colors.textInverse : colors.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "sales" && styles.tabTextActive,
              ]}
            >
              Ventes
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === "restock" && styles.tabActive]}
            onPress={() => setActiveTab("restock")}
          >
            <ArrowUpCircle
              size={16}
              color={activeTab === "restock" ? colors.textInverse : colors.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === "restock" && styles.tabTextActive,
              ]}
            >
              Réapprovisionnement
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Filtres */}
      <View style={styles.filtersContainer}>
        {/* Filtre date */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          <CalendarDays size={16} color={colors.textMuted} style={{ marginRight: 4 }} />
          {DATE_FILTERS.map((f) => (
            <Pressable
              key={f.key}
              style={[
                styles.filterChip,
                dateFilter === f.key && styles.filterChipActive,
              ]}
              onPress={() => setDateFilter(f.key)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  dateFilter === f.key && styles.filterChipTextActive,
                ]}
              >
                {f.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Filtre type */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {(
            [
              { key: "all", label: "Tout" },
              { key: "product", label: "Produits", Icon: TabletSmartphone },
              { key: "accessory", label: "Accessoires", Icon: Package },
            ] as const
          ).map(({ key, label, Icon }) => (
            <Pressable
              key={key}
              style={[
                styles.filterChip,
                typeFilter === key && styles.filterChipActive,
              ]}
              onPress={() => setTypeFilter(key)}
            >
              {Icon && (
                <Icon
                  size={13}
                  color={
                    typeFilter === key ? colors.textInverse : colors.textSecondary
                  }
                />
              )}
              <Text
                style={[
                  styles.filterChipText,
                  typeFilter === key && styles.filterChipTextActive,
                ]}
              >
                {label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Résumé */}
      <View style={styles.summary}>
        {activeTab === "sales" ? (
          <>
            <Text style={styles.summaryCount}>{enrichedSales.length} vente(s)</Text>
            <Text style={styles.summaryAmount}>{formatAriary(totalSalesAmount)}</Text>
          </>
        ) : (
          <>
            <Text style={styles.summaryCount}>
              {filteredMovements.length} mouvement(s)
            </Text>
            <Text style={styles.summaryAmount}>+{totalRestockQty} unité(s)</Text>
          </>
        )}
      </View>

      {/* Liste */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : activeTab === "sales" ? (
        <FlatList
          data={enrichedSales}
          keyExtractor={(s) => s.id.toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Aucune vente sur cette période</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View
                style={[
                  styles.cardIcon,
                  {
                    backgroundColor:
                      item.itemType === "product"
                        ? colors.accent + "22"
                        : colors.warning + "22",
                  },
                ]}
              >
                {item.itemType === "product" ? (
                  <TabletSmartphone
                    size={18}
                    color={colors.accent}
                  />
                ) : (
                  <Package size={18} color={colors.warning} />
                )}
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardName} numberOfLines={1}>
                  {item.itemName}
                </Text>
                <Text style={styles.cardMeta}>
                  ×{item.quantity} · {formatAriary(item.unitPrice)} / unité
                  {item.color ? ` · ${item.color}` : ""}
                  {item.imei ? `\nIMEI : ${item.imei}` : ""}
                  {item.buyerName ? `\nAcheteur : ${item.buyerName}` : ""}
                  {item.buyerCin ? ` · CIN : ${item.buyerCin}` : ""}
                </Text>
                <Text style={styles.cardDate}>{formatDate(item.createdAt)}</Text>
              </View>
              <View style={styles.cardRight}>
                <ArrowDownCircle size={16} color={colors.danger} />
                <Text style={styles.cardTotal}>
                  {formatAriary(item.unitPrice * item.quantity)}
                </Text>
              </View>
            </View>
          )}
        />
      ) : (
        <FlatList
          data={filteredMovements}
          keyExtractor={(m) => m.id.toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Aucun réapprovisionnement sur cette période</Text>
            </View>
          }
          renderItem={({ item }: { item: StockMovement }) => (
            <View style={styles.card}>
              <View
                style={[
                  styles.cardIcon,
                  {
                    backgroundColor:
                      item.itemType === "product"
                        ? colors.accent + "22"
                        : colors.warning + "22",
                  },
                ]}
              >
                {item.itemType === "product" ? (
                  <TabletSmartphone size={18} color={colors.accent} />
                ) : (
                  <Package size={18} color={colors.warning} />
                )}
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardName} numberOfLines={1}>
                  {item.itemName}
                </Text>
                <Text style={styles.cardDate}>{formatDate(item.createdAt)}</Text>
              </View>
              <View style={styles.cardRight}>
                <ArrowUpCircle size={16} color={colors.success} />
                <Text style={[styles.cardTotal, { color: colors.success }]}>
                  +{item.quantity} unité(s)
                </Text>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 12,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 14,
    },
    tabs: {
      flexDirection: "row",
      backgroundColor: colors.surfaceElevated,
      borderRadius: 12,
      padding: 4,
    },
    tab: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingVertical: 9,
      borderRadius: 9,
    },
    tabActive: {
      backgroundColor: colors.primary,
    },
    tabText: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.textSecondary,
    },
    tabTextActive: {
      color: colors.textInverse,
    },
    filtersContainer: {
      paddingHorizontal: 16,
      gap: 6,
      marginBottom: 4,
    },
    filterRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingVertical: 4,
    },
    filterChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterChipText: {
      fontSize: 13,
      fontWeight: "500",
      color: colors.textSecondary,
    },
    filterChipTextActive: {
      color: colors.textInverse,
    },
    summary: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginHorizontal: 16,
      marginVertical: 8,
      paddingHorizontal: 16,
      paddingVertical: 10,
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    summaryCount: {
      color: colors.textSecondary,
      fontSize: 14,
      fontWeight: "500",
    },
    summaryAmount: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: "700",
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    list: {
      padding: 16,
      paddingBottom: 32,
    },
    empty: {
      paddingVertical: 48,
      alignItems: "center",
    },
    emptyText: {
      color: colors.textMuted,
      fontSize: 15,
    },
    card: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      marginBottom: 10,
      gap: 12,
    },
    cardIcon: {
      width: 40,
      height: 40,
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center",
    },
    cardBody: {
      flex: 1,
      gap: 3,
    },
    cardName: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "600",
    },
    cardMeta: {
      color: colors.textSecondary,
      fontSize: 12,
      lineHeight: 18,
    },
    cardDate: {
      color: colors.textMuted,
      fontSize: 11,
      marginTop: 2,
    },
    cardRight: {
      alignItems: "flex-end",
      gap: 4,
    },
    cardTotal: {
      color: colors.danger,
      fontSize: 13,
      fontWeight: "700",
    },
  });
