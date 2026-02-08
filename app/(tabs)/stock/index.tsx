import ProductsListScreen from "@/components/screen/ProductListScreen";
import { TabScreen, TopTabs } from "@/components/tabs/TopTabs";
import ScreenContainer from "@/components/ui/ScreenContainer";
import { useProduct } from "@/core/contexts/ProductContext";
import { useTheme } from "@react-navigation/native";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function StockScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { products } = useProduct();

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

        <TabScreen label="Accessoires">
          <View style={styles.view}>
            <Text>Liste d accessoire</Text>
          </View>
        </TabScreen>
      </TopTabs>
    </ScreenContainer>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
    view: {
      padding: 20,
    },
  });
