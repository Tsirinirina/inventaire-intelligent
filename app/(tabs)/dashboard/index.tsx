import { useAccessory } from "@/core/contexts/AccessoryContext";
import { useInventory } from "@/core/contexts/InventoryContext";
import { useProduct } from "@/core/contexts/ProductContext";
import { useSale } from "@/core/contexts/SaleContext";
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
  const { stats } = useInventory();
  const { productsLoading } = useProduct();
  const { accessorysLoading } = useAccessory();
  const { salesLoading } = useSale();

  if (productsLoading || salesLoading || accessorysLoading) {
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
              <Text style={styles.statLabel}>Accessoire</Text>
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
            Performance d&apos;aujourd&apos;hui
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
            onPress={() => router.push("/(tabs)/stock/product/add")}
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
