import { TabScreen, TopTabs } from "@/components/tabs/TopTabs";
import ScreenContainer from "@/components/ui/ScreenContainer";
import { useTheme } from "@/theme/ThemeProvider";
import { StyleSheet, Text, View } from "react-native";

export default function ProductsScreen() {
  return (
    <ScreenContainer safeTop refreshing={false} onRefresh={() => ""}>
      <TopTabs>
        <TabScreen label="Updates">
          <View style={{ padding: 20 }}>
            <Text>Latest News Feed</Text>
          </View>
        </TabScreen>

        <TabScreen label="Trending">
          <View style={{ padding: 20 }}>
            <Text>What&apos;s hot right now</Text>
          </View>
        </TabScreen>
      </TopTabs>
    </ScreenContainer>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({});
