import AccessoriesScreen from "@/components/screen/AccessoryListScreen";
import ProductsListScreen from "@/components/screen/ProductListScreen";
import { TabScreen, TopTabs } from "@/components/tabs/TopTabs";
import ScreenContainer from "@/components/ui/ScreenContainer";
import { useAccessory } from "@/core/contexts/AccessoryContext";
import { useProduct } from "@/core/contexts/ProductContext";
import { useTheme } from "@react-navigation/native";
import { useMemo } from "react";
import { StyleSheet } from "react-native";

export default function StockScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { products } = useProduct();
  const { accessorys } = useAccessory();

  return (
    <ScreenContainer
      scrollable={false}
      safeTop
      refreshing={false}
      onRefresh={() => ""}
    >
      <TopTabs>
        <TabScreen label={`Produits (${products.length})`}>
          <ProductsListScreen />
        </TabScreen>

        <TabScreen label={`Accessoires (${accessorys.length})`}>
          <AccessoriesScreen />
        </TabScreen>
      </TopTabs>
    </ScreenContainer>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
    container: { flex: 1, justifyContent: "center", alignItems: "center" },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
    card: {
      padding: 20,
      backgroundColor: "#f0f0f0",
      borderRadius: 10,
      marginBottom: 20,
    },
  });
