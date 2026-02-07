import { PRODUCT_CATEGORIES } from "@/core/constants/categories";
import { useInventory } from "@/core/contexts/InventoryContext";
import { formatAriary } from "@/core/utils/currency.utils";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { AlertCircle, Plus, Search, X } from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { PRODUCT_BRANDS } from "../../../core/constants/brands";
import type { Product } from "../../../core/types/inventory";

const CustomStickyHeader: React.FC<{ title: string }> = ({ title }) => (
  <View>
    <Text>{title}</Text>
  </View>
);

export default function ProductsScreen() {
  const router = useRouter();
  const { products, isLoadingProducts, deleteProduct, isDeletingProduct } =
    useInventory();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesBrand = !selectedBrand || product.brand === selectedBrand;
      const matchesCategory =
        !selectedCategory || product.category === selectedCategory;

      return matchesSearch && matchesBrand && matchesCategory;
    });
  }, [products, searchQuery, selectedBrand, selectedCategory]);

  const handleDeleteProduct = (id: number, name: string) => {
    Alert.alert(
      "Supprimer le produit",
      `Êtes-vous sûr de vouloir supprimer "${name}"?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteProduct(id);
            } catch (error) {
              Alert.alert("Error", "Échec de la suppression du produit");
              console.error("Erreur de suppression:", error);
            }
          },
        },
      ],
    );
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <Pressable
      style={styles.productCard}
      onPress={() => router.push(`/(tabs)/products/edit/${item.id}`)}
      onLongPress={() => handleDeleteProduct(item.id, item.name)}
    >
      <View style={styles.productImageContainer}>
        {item.imageUri ? (
          <Image
            source={{ uri: item.imageUri }}
            style={styles.productImage}
            contentFit="cover"
          />
        ) : (
          <View style={styles.productImagePlaceholder}>
            <Text style={styles.placeholderText}>Aucune image</Text>
          </View>
        )}
        {item.quantity <= 5 && (
          <View style={styles.lowStockBadge}>
            <AlertCircle size={12} color="#FFF" />
            <Text style={styles.lowStockText}>Faible</Text>
          </View>
        )}
        {item.category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{item.category}</Text>
          </View>
        )}
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.productBrand} numberOfLines={1}>
          {item.brand}
        </Text>
        <View style={styles.productDetails}>
          <Text style={styles.productPrice}>{formatAriary(item.price)}</Text>
          <Text style={styles.productQuantity}>Stock: {item.quantity}</Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Search size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher des produits..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
          {searchQuery.length > 0 && (
            <Pressable
              onPress={() => setSearchQuery("")}
              style={styles.clearButton}
            >
              <X size={20} color="#666" />
            </Pressable>
          )}
        </View>
      </View>

      <View style={styles.filterContainer}>
        <Text style={styles.filterTitle}>Marques des produits</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.brandFilterContainer}
          contentContainerStyle={styles.brandFilterContent}
        >
          <Pressable
            style={[
              styles.brandChipAll,
              !selectedBrand && styles.brandChipActive,
            ]}
            onPress={() => setSelectedBrand(null)}
          >
            <Text
              style={[
                styles.brandChipText,
                !selectedBrand && styles.brandChipTextActive,
              ]}
            >
              Tout
            </Text>
          </Pressable>
          {PRODUCT_BRANDS.map((brand) => (
            <Pressable
              key={brand}
              style={[
                styles.brandChip,
                selectedBrand === brand && styles.brandChipActive,
              ]}
              onPress={() => setSelectedBrand(brand)}
            >
              <Text
                style={[
                  styles.brandChipText,
                  selectedBrand === brand && styles.brandChipTextActive,
                ]}
              >
                {brand}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={styles.filterContainer}>
        <Text style={styles.filterTitle}>Catégories des produits</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.brandFilterContainer}
          contentContainerStyle={styles.brandFilterContent}
        >
          <Pressable
            style={[
              styles.brandChipAll,
              !selectedCategory && styles.brandChipActive,
            ]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text
              style={[
                styles.brandChipText,
                !selectedCategory && styles.brandChipTextActive,
              ]}
            >
              Tout
            </Text>
          </Pressable>
          {PRODUCT_CATEGORIES.map((cat) => (
            <Pressable
              key={cat}
              style={[
                styles.brandChip,
                selectedCategory === cat && styles.brandChipActive,
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                style={[
                  styles.brandChipText,
                  selectedCategory === cat && styles.brandChipTextActive,
                ]}
              >
                {cat}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {isLoadingProducts || isDeletingProduct ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : filteredProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {products.length === 0
              ? "Aucun produit pour l'instant"
              : "Aucun produit trouvé"}
          </Text>
          {products.length === 0 && (
            <Text style={styles.emptySubtext}>
              Appuyez sur + pour ajouter votre premier produit
            </Text>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.productList}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Pressable
        style={styles.fab}
        onPress={() => router.push("/(tabs)/products/add")}
      >
        <Plus size={28} color="#FFF" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingTop: 30,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: "#FFF",
  },
  searchInputWrapper: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "#F5F5F7",
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: "#000",
  },
  clearButton: {
    padding: 4,
  },

  filterContainer: { backgroundColor: "#ffffff", minHeight: 70, maxHeight: 70 },
  filterTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#252525",
    paddingLeft: 14,
  },
  // BRANCH CHIPS
  brandFilterContainer: {
    paddingVertical: 10,
    paddingLeft: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#bdb9b9",
  },
  brandFilterContent: {
    gap: 8,
    height: "auto",
  },
  brandChip: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#E5E5EA",
    elevation: 5,
  },
  brandChipAll: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#1eee41",
  },
  brandChipActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  brandChipText: {
    fontSize: 14,
    fontWeight: "800" as const,
    color: "#666",
  },

  brandChipTextActive: {
    color: "#FFF",
  },

  // CONTAINER
  loadingContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: "#666",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: "#999",
    textAlign: "center" as const,
  },
  productList: {
    padding: 12,
  },
  productCard: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 8,
    margin: 4,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImageContainer: {
    position: "relative" as const,
  },
  productImage: {
    width: "100%",
    height: 140,
  },
  productImagePlaceholder: {
    width: "100%",
    height: 140,
    backgroundColor: "#F5F5F7",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  placeholderText: {
    color: "#999",
    fontSize: 14,
  },
  lowStockBadge: {
    position: "absolute" as const,
    top: 8,
    right: 8,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "#FF3B30",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  lowStockText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600" as const,
  },
  categoryBadge: {
    position: "absolute" as const,
    top: 8,
    left: 8,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "#ffffff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  categoryBadgeText: {
    color: "#3d3d3d",
    fontSize: 12,
    fontWeight: "600" as const,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#000",
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  productDetails: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#007AFF",
  },
  productQuantity: {
    fontSize: 13,
    color: "#666",
  },
  fab: {
    position: "absolute" as const,
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#007AFF",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
