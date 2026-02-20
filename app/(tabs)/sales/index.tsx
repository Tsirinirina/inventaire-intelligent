import { useProduct } from "@/core/contexts/ProductContext";
import { useSale } from "@/core/contexts/SaleContext";
import { SellableItem } from "@/core/entity/sale.entity";
import { useTheme } from "@/theme/ThemeProvider";
import { useNavigation } from "@react-navigation/native";
import React, { useMemo } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  items: SellableItem[];
}

export default function SaleScreen({ items }: Props) {
  const { sales, salesLoading } = useSale();
  const { products, productsLoading } = useProduct();

  const navigation = useNavigation<any>();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const renderItem = ({ item }: { item: SellableItem }) => (
    <View style={styles.card}>
      <Image
        source={{ uri: item.imageUri || "https://via.placeholder.com/80" }}
        style={styles.image}
      />

      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>

        {item.brand && <Text style={styles.brand}>{item.brand}</Text>}

        <Text style={styles.price}>{item.basePrice.toLocaleString()} Ar</Text>

        <Text style={styles.stock}>Stock: {item.quantity}</Text>
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("AddToCart", { item })}
      >
        <Text style={styles.addText}>Ajouter</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nouvelle Vente</Text>

      <FlatList
        data={items}
        keyExtractor={(item) => item.type + item.id}
        renderItem={renderItem}
      />
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 16,
    },
    title: {
      color: colors.text,
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 16,
    },
    card: {
      backgroundColor: colors.cardGradientEnd,
      borderRadius: 20,
      padding: 16,
      marginBottom: 12,
      flexDirection: "row",
      alignItems: "center",
    },
    image: {
      width: 64,
      height: 64,
      borderRadius: 12,
      marginRight: 16,
    },
    info: {
      flex: 1,
    },
    name: {
      color: colors.text,
      fontSize: 16,
      fontWeight: "600",
    },
    brand: {
      color: colors.textMuted,
      fontSize: 13,
      marginTop: 2,
    },
    price: {
      color: colors.primary,
      fontWeight: "bold",
      marginTop: 6,
    },
    stock: {
      color: colors.textMuted,
      fontSize: 12,
      marginTop: 2,
    },
    addButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 12,
    },
    addText: {
      color: "#fff",
      fontWeight: "600",
    },
  });
