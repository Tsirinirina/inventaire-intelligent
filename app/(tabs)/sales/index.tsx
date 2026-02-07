import { useInventory } from "@/core/contexts/InventoryContext";
import { formatAriary } from "@/core/utils/currency.utils";
import { Check, DollarSign, Minus, Plus, Search, X } from "lucide-react-native";
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
import type {
  Accessory,
  NewSale,
  Product,
} from "../../../core/types/inventory";

export default function SalesScreen() {
  const [searchQuery, setSearchQuery] = useState("");

  const { products, accessories, addSale, isAddingSale, sales } =
    useInventory();

  type ProductAndAccessory =
    | (Product & { type: "product"; uniqueId: string })
    | (Accessory & { type: "accessory"; uniqueId: string });

  const [cart, setCart] = useState<
    Map<string, { item: ProductAndAccessory; quantity: number }>
  >(new Map());

  const getKey = (item: ProductAndAccessory) => `${item.type}-${item.id}`;

  const combinedList = useMemo(() => {
    const query = searchQuery.toLowerCase();

    const matchProducts = products
      .filter((p) => p.quantity > 0)
      .filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.brand.toLowerCase().includes(query),
      )
      .map((p) => ({
        ...p,
        type: "product" as const,
        uniqueId: `product-${p.id}`, // 🔥 ID unique
      }));

    const matchAccessories = accessories
      .filter((a) => a.quantity > 0)
      .filter((a) => a.name.toLowerCase().includes(query))
      .map((a) => ({
        ...a,
        type: "accessory" as const,
        uniqueId: `accessory-${a.id}`, // 🔥 ID unique
      }));

    return [...matchProducts, ...matchAccessories];
  }, [products, accessories, searchQuery]);

  const cartItems = useMemo(() => Array.from(cart.values()), [cart]);

  const totalAmount = useMemo(() => {
    return Array.from(cart.values()).reduce(
      (sum, cartItem) => sum + cartItem.item.price * cartItem.quantity,
      0,
    );
  }, [cart]);

  const addToCart = (item: ProductAndAccessory) => {
    const key = item.uniqueId;

    const currentItem = cart.get(key);
    const currentQuantity = currentItem?.quantity || 0;

    // 🔥 Vérification du stock max
    if (currentQuantity >= item.quantity) {
      Alert.alert(
        "Limite de stock",
        `Seulement ${item.quantity} unités disponibles`,
      );
      return;
    }

    const newCart = new Map(cart);

    newCart.set(key, {
      item,
      quantity: currentQuantity + 1,
    });

    setCart(newCart);
  };

  const removeFromCart = (uniqueId: string) => {
    const newCart = new Map(cart);
    const current = newCart.get(uniqueId);

    if (!current) return;

    if (current.quantity > 1) {
      newCart.set(uniqueId, {
        ...current,
        quantity: current.quantity - 1,
      });
    } else {
      newCart.delete(uniqueId);
    }

    setCart(newCart);
  };

  const clearCart = () => {
    setCart(new Map());
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      Alert.alert(
        "Panier vide",
        "Veuillez ajouter les articles à votre panier avant de finaliser votre commande.",
      );
      return;
    }

    try {
      for (const item of cartItems) {
        const sale: NewSale = {
          productUniqueId: item.item.uniqueId,
          productName: item.item.name,
          category: item.item.category,
          type: item.item.type,
          quantity: item.quantity,
          unitPrice: item.item.price,
          totalPrice: item.item.price * item.quantity,
          saleDate: new Date().toISOString(),
        };

        await addSale(sale);
      }

      Alert.alert("Succès", "Vente enregistrée avec succès", [
        {
          text: "OK",
          onPress: () => {
            clearCart();
          },
        },
      ]);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Échec de l'enregistrement de la vente";

      Alert.alert("Erreur", errorMessage);
      console.error("Erreur de vente:", error);
    }
  };

  const renderProduct = ({ item }: { item: ProductAndAccessory }) => {
    const key = getKey(item);
    const cartItem = cart.get(key);
    const inCart = cartItem !== undefined;

    return (
      <Pressable
        style={[styles.productItem, inCart && styles.productItemActive]}
        onPress={() => addToCart(item)}
      >
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          {"brand" in item && (
            <Text style={styles.productBrand}>{item.brand}</Text>
          )}
          <Text style={styles.productStock}>Stock: {item.quantity}</Text>
        </View>

        <View style={styles.productRight}>
          <Text style={styles.productCategory}>{item.category}</Text>
          <Text style={styles.productPrice}>{formatAriary(item.price)}</Text>
          {inCart && <Text style={styles.inCartBadge}>Dans le panier</Text>}
        </View>
      </Pressable>
    );
  };

  const renderCartItem = ({
    item,
  }: {
    item: { product: ProductAndAccessory; quantity: number };
  }) => (
    <View style={styles.cartItem}>
      <View style={styles.cartItemInfo}>
        <Text style={styles.cartItemName} numberOfLines={1}>
          {item.product.name}
        </Text>
        <Text style={styles.cartItemPrice}>
          {formatAriary(item.product.price)} / 1
        </Text>
      </View>
      <View style={styles.cartItemControls}>
        <Pressable
          style={styles.quantityButton}
          onPress={() => removeFromCart(item.product.uniqueId)}
        >
          <Minus size={16} color="#007AFF" />
        </Pressable>
        <Text style={styles.cartItemQuantity}>{item.quantity}</Text>
        <Pressable
          style={styles.quantityButton}
          onPress={() => addToCart(item.product)}
        >
          <Plus size={16} color="#007AFF" />
        </Pressable>
        <Text style={styles.cartItemTotal}>
          {formatAriary(item.product.price * item.quantity)}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.leftPanel}>
        <View style={styles.searchContainer}>
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

        {combinedList.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {searchQuery ? "Aucun produit trouvé" : "Aucun produit en stock"}
            </Text>
          </View>
        ) : (
          <FlatList
            data={combinedList}
            renderItem={renderProduct}
            keyExtractor={(item) => item.uniqueId.toString()}
            contentContainerStyle={styles.productList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <View style={styles.rightPanel}>
        <View style={styles.cartHeader}>
          <Text style={styles.cartTitle}>Vente en cours</Text>
          {cartItems.length > 0 && (
            <Pressable onPress={clearCart}>
              <Text style={styles.clearCartButton}>Vider</Text>
            </Pressable>
          )}
        </View>

        {cartItems.length === 0 ? (
          <View style={styles.emptyCart}>
            <DollarSign size={48} color="#CCC" />
            <Text style={styles.emptyCartText}>Le panier est vide</Text>
            <Text style={styles.emptyCartSubtext}>
              Ajoutez des produits pour lancer une vente
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.cartList}
            showsVerticalScrollIndicator={false}
          >
            {cartItems.map((cartItem) => (
              <View key={cartItem.item.uniqueId}>
                {renderCartItem({
                  item: { product: cartItem.item, quantity: cartItem.quantity },
                })}
              </View>
            ))}
          </ScrollView>
        )}

        <View style={styles.cartFooter}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmount}>{formatAriary(totalAmount)}</Text>
          </View>
          <Pressable
            style={[
              styles.checkoutButton,
              (cartItems.length === 0 || isAddingSale) &&
                styles.checkoutButtonDisabled,
            ]}
            onPress={handleCheckout}
            disabled={cartItems.length === 0 || isAddingSale}
          >
            {isAddingSale ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Check size={20} color="#FFF" />
                <Text style={styles.checkoutButtonText}>Confirmer</Text>
              </>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row" as const,
    backgroundColor: "#F5F5F7",
    paddingTop: 30,
  },
  leftPanel: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  rightPanel: {
    flex: 1,
    backgroundColor: "#F5F5F7",
    borderLeftWidth: 1,
    borderLeftColor: "#E5E5EA",
  },
  searchContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "#F5F5F7",
    borderRadius: 12,
    paddingHorizontal: 12,
    margin: 16,
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
  productList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  productItem: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    padding: 16,
    backgroundColor: "#F5F5F7",
    borderRadius: 12,
    marginBottom: 8,
  },
  productItemActive: {
    backgroundColor: "#E3F2FF",
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#000",
    marginBottom: 2,
  },
  productBrand: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  productStock: {
    fontSize: 12,
    color: "#1f1f1f",
    fontWeight: "bold",
  },
  productRight: {
    alignItems: "flex-end" as const,
    gap: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#007AFF",
  },
  productCategory: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#2f265a",
  },
  inCartBadge: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#007AFF",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: "#999",
    textAlign: "center" as const,
  },
  cartHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  cartTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#000",
  },
  clearCartButton: {
    fontSize: 18,
    fontWeight: "800" as const,
    color: "#FF3B30",
  },
  emptyCart: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    gap: 12,
  },
  emptyCartText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#999",
  },
  emptyCartSubtext: {
    fontSize: 14,
    color: "#CCC",
  },
  cartList: {
    flex: 1,
    paddingHorizontal: 5,
    paddingVertical: 16,
  },
  cartItem: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    gap: 8,
  },
  cartItemInfo: {
    gap: 2,
  },
  cartItemName: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: "#000",
  },
  cartItemPrice: {
    fontSize: 13,
    color: "#666",
  },
  cartItemControls: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F5F5F7",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  cartItemQuantity: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#000",
    minWidth: 30,
    textAlign: "center" as const,
  },
  cartItemTotal: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: "#007AFF",
    marginLeft: "auto" as const,
  },
  cartFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA",
    backgroundColor: "#FFF",
  },
  totalRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: "#000",
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#000",
  },
  checkoutButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: "#34C759",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  checkoutButtonDisabled: {
    backgroundColor: "#CCC",
  },
  checkoutButtonText: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: "#FFF",
  },
});
