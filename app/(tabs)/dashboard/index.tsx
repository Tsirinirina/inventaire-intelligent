import CustomButton from "@/components/ui/CustomButton";
import { useProduct } from "@/core/contexts/ProductContext";
import { PRODUCT_MOCK } from "@/core/mock/productMock";
import { formatAriary } from "@/core/utils/currency.utils";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function DashboardScreen() {
  const { products, productsLoading, addProduct, productsRefetch } =
    useProduct();

  const onCreate = () => {
    for (const dto of PRODUCT_MOCK) {
      addProduct(dto);
    }
  };

  if (productsLoading) {
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
        <CustomButton title="Créer produit" onPress={onCreate} />
        <CustomButton title="Reload" onPress={productsRefetch} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {products.length > 0 &&
          products.map((product) => (
            <View key={product.id}>
              <Text>Nom: {product.name}</Text>
              <Text>Prix: {formatAriary(product.basePrice)}</Text>
              <Text>Prix: {product.brand}</Text>
              <Text>Prix: {product.category}</Text>
              <Text>Prix: {product.imageUri}</Text>
              <Text>Prix: {product.quantity}</Text>
              <Text>Prix: {product.stockUpdatedAt}</Text>
            </View>
          ))}
        {products.length === 0 && (
          <View>
            <Text>Aucun données</Text>
          </View>
        )}
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
