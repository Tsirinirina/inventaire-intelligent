import { ACCESSORY_CATEGORIES } from "@/core/constants/categories";
import { useAccessory } from "@/core/contexts/AccessoryContext";
import { Accessory } from "@/core/entity/accessory.entity";
import { formatAriary } from "@/core/utils/currency.utils";
import { capitalizeWords } from "@/core/utils/capitalize.utils";
import { useTheme } from "@/theme/ThemeProvider";
import { ThemeColors } from "@/theme/colors";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
  AlertTriangle,
  ChevronRight,
  Package,
  Plus,
  Search,
  X,
} from "lucide-react-native";
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

function StockBadge({
  quantity,
  colors,
}: {
  quantity: number;
  colors: ThemeColors;
}) {
  const bg =
    quantity === 0
      ? colors.danger
      : quantity <= 5
        ? colors.warning
        : colors.success;
  const label =
    quantity === 0 ? "Rupture" : quantity <= 5 ? `Faible · ${quantity}` : `${quantity}`;
  return (
    <View style={{ backgroundColor: bg + "22", borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
      <Text style={{ color: bg, fontSize: 12, fontWeight: "700" }}>{label}</Text>
    </View>
  );
}

export default function AccessoriesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const { accessorys: accessories, accessorysLoading, deleteAccessory } = useAccessory();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return accessories.filter((a) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        a.name.toLowerCase().includes(q) ||
        (a.description?.toLowerCase().includes(q) ?? false);
      const matchCat = !selectedCategory || a.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [accessories, searchQuery, selectedCategory]);

  const handleDelete = (id: number, name: string) => {
    Alert.alert("Supprimer", `Supprimer "${name}" ?`, [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteAccessory(id);
          } catch {
            Alert.alert("Erreur", "Échec de la suppression");
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Accessory }) => (
    <Pressable
      style={styles.card}
      onPress={() => router.push(`/(tabs)/stock/accessory/edit/${item.id}` as any)}
      onLongPress={() => handleDelete(item.id, item.name)}
    >
      {/* Image */}
      <View style={styles.imageWrap}>
        {item.imageUri ? (
          <Image source={{ uri: item.imageUri }} style={styles.image} contentFit="cover" />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Package size={22} color={colors.textMuted} />
          </View>
        )}
      </View>

      {/* Infos */}
      <View style={styles.cardBody}>
        <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.cardSub} numberOfLines={1}>
          {capitalizeWords(item.category)}
        </Text>
        <View style={styles.cardBottom}>
          <Text style={styles.cardPrice}>{formatAriary(item.basePrice)}</Text>
          <StockBadge quantity={item.quantity} colors={colors} />
        </View>
      </View>

      {/* Chevron */}
      <ChevronRight size={18} color={colors.textMuted} />
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {/* Barre de recherche */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Search size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un accessoire..."
            placeholderTextColor={colors.inputPlaceholder}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")}>
              <X size={18} color={colors.textMuted} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Résumé + filtres catégories */}
      <View style={styles.filtersWrap}>
        <Text style={styles.countLabel}>
          {filtered.length} accessoire{filtered.length !== 1 ? "s" : ""}
          {accessories.length !== filtered.length ? ` sur ${accessories.length}` : ""}
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          <Pressable
            style={[styles.chip, !selectedCategory && styles.chipActive]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text style={[styles.chipText, !selectedCategory && styles.chipTextActive]}>
              Tout
            </Text>
          </Pressable>
          {ACCESSORY_CATEGORIES.map((cat) => (
            <Pressable
              key={cat}
              style={[styles.chip, selectedCategory === cat && styles.chipActive]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                style={[styles.chipText, selectedCategory === cat && styles.chipTextActive]}
              >
                {capitalizeWords(cat)}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Liste */}
      {accessorysLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <AlertTriangle size={40} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>
            {accessories.length === 0 ? "Aucun accessoire" : "Aucun résultat"}
          </Text>
          <Text style={styles.emptySub}>
            {accessories.length === 0
              ? "Appuyez sur + pour ajouter un accessoire"
              : "Essayez un autre filtre"}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB */}
      <Pressable
        style={styles.fab}
        onPress={() => router.push("/(tabs)/stock/accessory/add")}
      >
        <Plus size={26} color={colors.textInverse} />
      </Pressable>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    searchWrap: {
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 8,
    },
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 10,
      gap: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchInput: {
      flex: 1,
      fontSize: 15,
      color: colors.inputText,
    },
    filtersWrap: {
      paddingHorizontal: 16,
      paddingBottom: 8,
      gap: 6,
    },
    countLabel: {
      fontSize: 12,
      color: colors.textMuted,
      fontWeight: "500",
    },
    chipRow: {
      flexDirection: "row",
      gap: 6,
    },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1,
      borderColor: colors.border,
    },
    chipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    chipText: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.textSecondary,
    },
    chipTextActive: {
      color: colors.textInverse,
    },
    list: {
      paddingHorizontal: 16,
      paddingBottom: 100,
      gap: 10,
    },
    card: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 12,
      gap: 12,
    },
    imageWrap: {
      borderRadius: 12,
      overflow: "hidden",
    },
    image: {
      width: 60,
      height: 60,
      borderRadius: 12,
    },
    imagePlaceholder: {
      backgroundColor: colors.surfaceElevated,
      justifyContent: "center",
      alignItems: "center",
    },
    cardBody: {
      flex: 1,
      gap: 4,
    },
    cardName: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.text,
    },
    cardSub: {
      fontSize: 12,
      color: colors.textMuted,
    },
    cardBottom: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 2,
    },
    cardPrice: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.primary,
    },
    center: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      gap: 12,
      padding: 32,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.textSecondary,
    },
    emptySub: {
      fontSize: 14,
      color: colors.textMuted,
      textAlign: "center",
    },
    fab: {
      position: "absolute",
      bottom: 24,
      right: 24,
      width: 58,
      height: 58,
      borderRadius: 29,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.4,
      shadowRadius: 10,
      elevation: 8,
    },
  });
