import ProductsListScreen from "@/components/screen/ProductListScreen";
import { TabScreen, TopTabs } from "@/components/tabs/TopTabs";
import ScreenContainer from "@/components/ui/ScreenContainer";
import { useTheme } from "@react-navigation/native";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function StockScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <ScreenContainer
      scrollable={false}
      safeTop
      refreshing={false}
      onRefresh={() => ""}
    >
      <TopTabs>
        <TabScreen label="Produit">
          <ProductsListScreen />
        </TabScreen>

        <TabScreen label="Accessoire">
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
