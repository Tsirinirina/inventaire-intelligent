import NumberScanner from "@/components/scanner/NumberScanner";
import ProductsListScreen from "@/components/screen/ProductListScreen";
import { TabScreen, TopTabs } from "@/components/tabs/TopTabs";
import Button from "@/components/ui/Button";
import ScreenContainer from "@/components/ui/ScreenContainer";
import { useProduct } from "@/core/contexts/ProductContext";
import { useTheme } from "@react-navigation/native";
import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function StockScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { products } = useProduct();

  /**
   * Scanner ui
   */
  const [isScannerVisible, setIsScannerVisible] = useState(false);
  const [myNumber, setMyNumber] = useState("");

  const handleScanResult = (result: string) => {
    setMyNumber(result);
    setIsScannerVisible(false);
  };
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
          <View style={styles.container}>
            <Text style={styles.title}>Inventaire Intelligent</Text>

            <View style={styles.card}>
              <Text>Valeur scannée : {myNumber || "Aucune"}</Text>
            </View>

            <Button
              title="Ouvrir le Scanner"
              onPress={() => setIsScannerVisible(true)}
            />

            {isScannerVisible && (
              <NumberScanner
                onScan={handleScanResult}
                onClose={() => setIsScannerVisible(false)}
              />
            )}
          </View>
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
