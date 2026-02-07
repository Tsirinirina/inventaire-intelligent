import { PRODUCT_BRANDS } from "@/core/constants/brands";
import { PRODUCT_CATEGORIES } from "@/core/constants/categories";
import { useProduct } from "@/core/contexts/ProductContext";
import { Product } from "@/core/entity/product.entity";
import { formatAriary } from "@/core/utils/currency.utils";
import { useTheme } from "@/theme/ThemeProvider";
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

export default function ProductsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { products, productsLoading, productsError, productsRefetch } =
    useProduct();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const styles = useMemo(() => createStyles(colors), [colors]);

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
              // await deleteProduct(id);
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
            <AlertCircle size={12} color={colors.textInverse} />
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
          <Text style={styles.productPrice}>
            {formatAriary(item.basePrice)}
          </Text>
          <Text style={styles.productQuantity}>Stock: {item.quantity}</Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Search
            size={20}
            color={colors.textMuted}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher des produits..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.inputPlaceholder}
          />
          {searchQuery.length > 0 && (
            <Pressable
              onPress={() => setSearchQuery("")}
              style={styles.clearButton}
            >
              <X size={20} color={colors.textMuted} />
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

      {productsLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
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
        <Plus size={28} color={colors.textInverse} />
      </Pressable>
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: 30,
    },
    searchContainer: {
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 8,
      backgroundColor: colors.surface,
    },
    searchInputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.inputBackground,
      borderRadius: 12,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: colors.inputBorder,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      height: 44,
      fontSize: 16,
      color: colors.inputText,
    },
    clearButton: {
      padding: 4,
    },
    filterContainer: {
      backgroundColor: colors.surface,
      minHeight: 70,
      maxHeight: 70,
    },
    filterTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      paddingLeft: 14,
    },
    brandFilterContainer: {
      paddingVertical: 10,
      paddingLeft: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
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
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1,
      borderColor: colors.border,
    },
    brandChipAll: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 16,
      borderRadius: 20,
      backgroundColor: colors.success,
    },
    brandChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    brandChipText: {
      fontSize: 14,
      fontWeight: "800",
      color: colors.textSecondary,
    },
    brandChipTextActive: {
      color: colors.textInverse,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 40,
    },
    emptyText: {
      fontSize: 20,
      fontWeight: "600",
      color: colors.textSecondary,
      marginBottom: 8,
    },
    emptySubtext: {
      fontSize: 16,
      color: colors.textMuted,
      textAlign: "center",
    },
    productList: {
      padding: 12,
    },
    productCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 12,
      margin: 4,
      overflow: "hidden",
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 3,
      borderWidth: 1,
      borderColor: colors.border,
    },
    productImageContainer: {
      position: "relative",
    },
    productImage: {
      width: "100%",
      height: 140,
    },
    productImagePlaceholder: {
      width: "100%",
      height: 140,
      backgroundColor: colors.inputBackground,
      justifyContent: "center",
      alignItems: "center",
    },
    placeholderText: {
      color: colors.textMuted,
      fontSize: 14,
    },
    lowStockBadge: {
      position: "absolute",
      top: 8,
      right: 8,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.danger,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      gap: 4,
    },
    lowStockText: {
      color: colors.textInverse,
      fontSize: 12,
      fontWeight: "600",
    },
    categoryBadge: {
      position: "absolute",
      top: 8,
      left: 8,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surfaceElevated,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      gap: 4,
    },
    categoryBadgeText: {
      color: colors.text,
      fontSize: 12,
      fontWeight: "600",
    },
    productInfo: {
      padding: 12,
    },
    productName: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 4,
    },
    productBrand: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    productDetails: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    productPrice: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.primary,
    },
    productQuantity: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    fab: {
      position: "absolute",
      bottom: 24,
      right: 24,
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
  });
