import { useInventory } from "@/core/contexts/InventoryContext";
import { formatAriary } from "@/core/utils/currency.utils";
import { useRouter } from "expo-router";
import {
  DollarSign,
  LucidePiggyBank,
  Package,
  ShoppingCart,
  TabletSmartphone,
  TrendingUp,
} from "lucide-react-native";
import { useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function DashboardScreen() {
  const router = useRouter();
  const {
    products,
    sales,
    accessories,
    isLoadingProducts,
    isLoadingSales,
    isLoadingAccessories,
  } = useInventory();

  const stats = useMemo(() => {
    // Product memo
    const totalProducts = products.length;
    const totalProductStock = products.reduce((sum, p) => sum + p.quantity, 0);
    const totalProductPrice = products.reduce(
      (sum, p) => sum + p.basePrice * p.quantity,
      0,
    );
    const lowStockProducts = products.filter((p) => p.quantity <= 5);
    const outOfStockProducts = products.filter((p) => p.quantity === 0);

    // Sales memo
    const totalSales = sales.length;
    console.log("total = ", sales);

    const totalRevenue = 0;
    // const totalRevenue = sales.reduce((sum, s) => sum + s.totalPrice, 0);
    // const todaySales = sales.filter(
    //   (s) => new Date(s.saleDate).toDateString() === new Date().toDateString()
    // );
    const todaySales = [] as any;
    // const todayRevenue = todaySales.reduce((sum, s) => sum + s.totalPrice, 0);
    const todayRevenue = 0;

    const brandStats = products.reduce(
      (acc, p) => {
        acc[p.brand] = (acc[p.brand] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const topBrand = Object.entries(brandStats).sort((a, b) => b[1] - a[1])[0];

    // Accessory memo
    const totalAccessory = accessories.length;
    const totalAccessoryStock = accessories.reduce(
      (sum, acc) => sum + acc.quantity,
      0,
    );
    const totalAccessoryPrice = accessories.reduce(
      (sum, acc) => sum + acc.basePrice * acc.quantity,
      0,
    );
    const lowStockAccessories = accessories.filter((acc) => acc.quantity <= 5);
    const ouOfStockAccessories = accessories.filter(
      (acc) => acc.quantity === 0,
    );

    // Total product & accessory
    const totalGain = totalProductPrice + totalAccessoryPrice;

    return {
      totalProducts,
      totalProductStock,
      totalProductPrice,
      lowStockProducts,
      outOfStockProducts,
      totalSales,
      totalRevenue,
      todaySales: todaySales.length,
      todayRevenue,
      topBrand: topBrand ? { name: topBrand[0], count: topBrand[1] } : null,
      totalAccessory,
      totalAccessoryStock,
      totalAccessoryPrice,
      lowStockAccessories,
      ouOfStockAccessories,
      totalGain,
    };
  }, [products, sales, accessories]);

  if (isLoadingProducts || isLoadingSales || isLoadingAccessories) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tableau de bord</Text>
        <Text style={styles.headerSubtitle}>Aperçu de votre magasin</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.statCardSecondary]}>
            <View style={styles.statIcon}>
              <TabletSmartphone size={24} color="#FFF" />
            </View>
            <View style={styles.statGroup}>
              <Text style={styles.statValue}>{stats.totalProducts}</Text>
              <Text style={styles.statLabel}>Produit</Text>
            </View>
            <View style={styles.statGroup}>
              <Text style={styles.statValue}>{stats.totalProductStock}</Text>
              <Text style={styles.statLabel}>En stock</Text>
            </View>
            <Text style={styles.statValue}>
              {formatAriary(stats.totalProductPrice)}
            </Text>
          </View>

          <View style={[styles.statCard, styles.statCardSecondary]}>
            <View style={styles.statIcon}>
              <Package size={24} color="#FFF" />
            </View>
            <View style={styles.statGroup}>
              <Text style={styles.statValue}>{stats.totalAccessory}</Text>
              <Text style={styles.statLabel}>Produit</Text>
            </View>
            <View style={styles.statGroup}>
              <Text style={styles.statValue}>{stats.totalAccessoryStock}</Text>
              <Text style={styles.statLabel}>En stock</Text>
            </View>
            <Text style={styles.statValue}>
              {formatAriary(stats.totalAccessoryPrice)}
            </Text>
          </View>
        </View>

        {/*  */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.statCardWarning]}>
            <View style={styles.statIcon}>
              <ShoppingCart size={24} color="#FFF" />
            </View>
            <Text style={styles.statValue}>{stats.totalSales}</Text>
            <Text style={styles.statLabel}>Ventes totales</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.statCardSuccess]}>
            <View style={styles.statIcon}>
              <LucidePiggyBank size={24} color="#FFF" />
            </View>
            <Text style={styles.statValue}>
              {formatAriary(stats.totalGain)}
            </Text>
            <Text style={styles.statLabel}>Valeur d&apos;inventaire</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Performance d&lsquo;aujourd&apos;hui
          </Text>
          <View style={styles.performanceCard}>
            <View style={styles.performanceRow}>
              <View style={styles.performanceItem}>
                <TrendingUp size={20} color="#34C759" />
                <Text style={styles.performanceValue}>{stats.todaySales}</Text>
                <Text style={styles.performanceLabel}>
                  Ventes aujourd&apos;hui
                </Text>
              </View>
              <View style={styles.performanceDivider} />
              <View style={styles.performanceItem}>
                <DollarSign size={20} color="#007AFF" />
                <Text style={styles.performanceValue}>
                  {formatAriary(stats.todayRevenue)}
                </Text>
                <Text style={styles.performanceLabel}>
                  Revenus aujourd&apos;hui
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Résumé des ventes</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Revenu total</Text>
              <Text style={styles.summaryValue}>
                {formatAriary(stats.totalRevenue)}
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Vente moyenne</Text>
              <Text style={styles.summaryValue}>
                {stats.totalSales > 0
                  ? formatAriary(stats.totalRevenue / stats.totalSales)
                  : "0 Ar"}
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>TOP Marque</Text>
              <Text style={styles.summaryValue}>
                {stats.topBrand
                  ? `${stats.topBrand.name} (${stats.topBrand.count})`
                  : "N/A"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.quickActions}>
          <Pressable
            style={styles.quickActionButton}
            onPress={() => router.push("/(tabs)/products/add")}
          >
            <Package size={24} color="#007AFF" />
            <Text style={styles.quickActionText}>Ajouter produit</Text>
          </Pressable>
          <Pressable
            style={styles.quickActionButton}
            onPress={() => router.push("/(tabs)/sales")}
          >
            <ShoppingCart size={24} color="#007AFF" />
            <Text style={styles.quickActionText}>Record de vente</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F7",
    paddingTop: 30,
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: "#000",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666",
  },
  alertsSection: {
    gap: 12,
    marginBottom: 24,
  },
  alert: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#000",
    marginBottom: 2,
  },
  alertText: {
    fontSize: 14,
    color: "#666",
  },
  statsGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: "47%",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statCardPrimary: {
    backgroundColor: "#007AFF",
  },
  statCardSecondary: {
    backgroundColor: "#5856D6",
  },
  statCardSuccess: {
    backgroundColor: "#34C759",
  },
  statCardWarning: {
    backgroundColor: "#FF9500",
  },
  statIcon: {
    marginBottom: 12,
  },
  statGroup: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 10,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: "#FFF",
    marginBottom: 4,
  },
  statValueGrouped: {
    width: 100,
  },
  statLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: "#000",
    marginBottom: 12,
  },
  performanceCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  performanceRow: {
    flexDirection: "row" as const,
    justifyContent: "space-around" as const,
  },
  performanceItem: {
    alignItems: "center" as const,
    gap: 8,
  },
  performanceDivider: {
    width: 1,
    backgroundColor: "#E5E5EA",
  },
  performanceValue: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#000",
  },
  performanceLabel: {
    fontSize: 14,
    color: "#666",
  },
  summaryCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: "#E5E5EA",
    marginVertical: 16,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#666",
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#000",
  },
  quickActions: {
    flexDirection: "row" as const,
    gap: 12,
    marginTop: 8,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 20,
    alignItems: "center" as const,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#007AFF",
  },
});
