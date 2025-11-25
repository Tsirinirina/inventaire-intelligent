import { useInventory } from "@/contexts/InventoryContext";
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
import type { NewSale, Product } from "../../../types/inventory";

export default function SalesScreen() {
  const { products, addSale, isAddingSale } = useInventory();
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<
    Map<number, { product: Product; quantity: number }>
  >(new Map());

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => product.quantity > 0)
      .filter((product) => {
        const query = searchQuery.toLowerCase();
        return (
          product.name.toLowerCase().includes(query) ||
          product.brand.toLowerCase().includes(query)
        );
      });
  }, [products, searchQuery]);

  const cartItems = useMemo(() => Array.from(cart.values()), [cart]);

  const totalAmount = useMemo(() => {
    return cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
  }, [cartItems]);

  const addToCart = (product: Product) => {
    const currentItem = cart.get(product.id);
    const currentQuantity = currentItem?.quantity || 0;

    if (currentQuantity >= product.quantity) {
      Alert.alert("Stock Limit", `Only ${product.quantity} units available`);
      return;
    }

    const newCart = new Map(cart);
    newCart.set(product.id, {
      product,
      quantity: currentQuantity + 1,
    });
    setCart(newCart);
  };

  const removeFromCart = (productId: number) => {
    const newCart = new Map(cart);
    const item = newCart.get(productId);
    if (item && item.quantity > 1) {
      newCart.set(productId, { ...item, quantity: item.quantity - 1 });
    } else {
      newCart.delete(productId);
    }
    setCart(newCart);
  };

  const clearCart = () => {
    setCart(new Map());
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      Alert.alert(
        "Empty Cart",
        "Please add items to the cart before checking out"
      );
      return;
    }

    try {
      for (const item of cartItems) {
        const sale: NewSale = {
          productId: item.product.id,
          productName: item.product.name,
          brand: item.product.brand,
          quantity: item.quantity,
          unitPrice: item.product.price,
          totalPrice: item.product.price * item.quantity,
          saleDate: new Date().toISOString(),
        };
        await addSale(sale);
      }

      Alert.alert("Success", "Sale recorded successfully", [
        {
          text: "OK",
          onPress: () => {
            clearCart();
          },
        },
      ]);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to record sale";
      Alert.alert("Error", errorMessage);
      console.error("Sale error:", error);
    }
  };

  const renderProduct = ({ item }: { item: Product }) => {
    const cartItem = cart.get(item.id);
    const inCart = cartItem !== undefined;

    return (
      <Pressable
        style={[styles.productItem, inCart && styles.productItemActive]}
        onPress={() => addToCart(item)}
      >
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productBrand}>{item.brand}</Text>
          <Text style={styles.productStock}>Stock: {item.quantity}</Text>
        </View>
        <View style={styles.productRight}>
          <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
          {inCart && <Text style={styles.inCartBadge}>In Cart</Text>}
        </View>
      </Pressable>
    );
  };

  const renderCartItem = ({
    item,
  }: {
    item: { product: Product; quantity: number };
  }) => (
    <View style={styles.cartItem}>
      <View style={styles.cartItemInfo}>
        <Text style={styles.cartItemName} numberOfLines={1}>
          {item.product.name}
        </Text>
        <Text style={styles.cartItemPrice}>
          ${item.product.price.toFixed(2)} each
        </Text>
      </View>
      <View style={styles.cartItemControls}>
        <Pressable
          style={styles.quantityButton}
          onPress={() => removeFromCart(item.product.id)}
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
          ${(item.product.price * item.quantity).toFixed(2)}
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
            placeholder="Search products..."
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

        {filteredProducts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {searchQuery ? "No products found" : "No products in stock"}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredProducts}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.productList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <View style={styles.rightPanel}>
        <View style={styles.cartHeader}>
          <Text style={styles.cartTitle}>Current Sale</Text>
          {cartItems.length > 0 && (
            <Pressable onPress={clearCart}>
              <Text style={styles.clearCartButton}>Clear</Text>
            </Pressable>
          )}
        </View>

        {cartItems.length === 0 ? (
          <View style={styles.emptyCart}>
            <DollarSign size={48} color="#CCC" />
            <Text style={styles.emptyCartText}>Cart is empty</Text>
            <Text style={styles.emptyCartSubtext}>
              Add products to start a sale
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.cartList}
            showsVerticalScrollIndicator={false}
          >
            {cartItems.map((item) => (
              <View key={item.product.id}>{renderCartItem({ item })}</View>
            ))}
          </ScrollView>
        )}

        <View style={styles.cartFooter}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmount}>${totalAmount.toFixed(2)}</Text>
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
                <Text style={styles.checkoutButtonText}>Complete Sale</Text>
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
  },
  leftPanel: {
    flex: 2,
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
    color: "#999",
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
    fontSize: 16,
    fontWeight: "600" as const,
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
    padding: 16,
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
