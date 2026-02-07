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

import { ACCESSORY_CATEGORIES } from "@/core/constants/categories";
import { useAccessory } from "@/core/contexts/AccessoryContext";
import { Accessory } from "@/core/entity/accessory.entity";
import { useTheme } from "@/theme/ThemeProvider";
import { ThemeColors } from "@/theme/colors";

export default function AccessoriesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const {
    accessorys: accessories,
    accessorysLoading: accessoriessLoading,
    accessorysRefetch,
  } = useAccessory();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    return accessories.filter((accessory) => {
      const matchesSearch =
        accessory.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        accessory.description
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesBrand =
        !selectedCategory || accessory.category === selectedCategory;

      return matchesSearch && matchesBrand;
    });
  }, [accessories, searchQuery, selectedCategory]);

  const handleDeleteAccessory = (id: number, name: string) => {
    Alert.alert(
      "Supprimer l'accessoire",
      `Êtes-vous sûr de vouloir supprimer "${name}"?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              // await deleteAccessory(id);
            } catch (error) {
              Alert.alert("Error", "Échec de la suppression de l'accessoire");
              console.error("Erreur de suppression:", error);
            }
          },
        },
      ],
    );
  };

  const renderProduct = ({ item }: { item: Accessory }) => (
    <Pressable
      style={styles.productCard}
      onPress={() => router.push(`/(tabs)/accessory/edit/${item.id}`)}
      onLongPress={() => handleDeleteAccessory(item.id, item.name)}
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
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.productBrand} numberOfLines={1}>
          {item.category}
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
            placeholder="Rechercher des accessoires..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
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
          {ACCESSORY_CATEGORIES.map((category) => (
            <Pressable
              key={category}
              style={[
                styles.brandChip,
                selectedCategory === category && styles.brandChipActive,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.brandChipText,
                  selectedCategory === category && styles.brandChipTextActive,
                ]}
              >
                {category}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {accessoriessLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : filteredProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {accessories.length === 0
              ? "Aucun accessoire pour l'instant"
              : "Aucun accessoire trouvé"}
          </Text>
          {accessories.length === 0 && (
            <Text style={styles.emptySubtext}>
              Appuyez sur + pour ajouter votre premier accessoire
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
        onPress={() => router.push("/(tabs)/accessory/add")}
      >
        <Plus size={28} color={colors.textInverse} />
      </Pressable>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
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
      flexDirection: "row" as const,
      alignItems: "center" as const,
      backgroundColor: colors.inputBackground,
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
      fontWeight: "600" as const,
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
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      elevation: 5,
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
      fontWeight: "800" as const,
      color: colors.textSecondary,
    },
    brandChipTextActive: {
      color: colors.textInverse,
    },
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
      color: colors.textSecondary,
      marginBottom: 8,
    },
    emptySubtext: {
      fontSize: 16,
      color: colors.textMuted,
      textAlign: "center" as const,
    },
    productList: {
      padding: 12,
    },
    productCard: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: 16,
      margin: 4,
      overflow: "hidden",
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
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
      backgroundColor: colors.inputBackground,
      justifyContent: "center" as const,
      alignItems: "center" as const,
    },
    placeholderText: {
      color: colors.textMuted,
      fontSize: 14,
    },
    lowStockBadge: {
      position: "absolute" as const,
      top: 8,
      right: 8,
      flexDirection: "row" as const,
      alignItems: "center" as const,
      backgroundColor: colors.danger,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      gap: 4,
    },
    lowStockText: {
      color: colors.textInverse,
      fontSize: 12,
      fontWeight: "600" as const,
    },
    productInfo: {
      padding: 12,
    },
    productName: {
      fontSize: 16,
      fontWeight: "600" as const,
      color: colors.text,
      marginBottom: 4,
    },
    productBrand: {
      fontSize: 14,
      color: colors.textSecondary,
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
      color: colors.primary,
    },
    productQuantity: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    fab: {
      position: "absolute" as const,
      bottom: 24,
      right: 24,
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.primary,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
  });
