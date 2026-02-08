import { useTheme } from "@/theme/ThemeProvider";
import React, { ReactNode } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ScreenContainerProps {
  children: ReactNode;
  scrollable?: boolean;
  padded?: boolean;
  safeTop?: boolean;
  safeBottom?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export default function ScreenContainer({
  children,
  scrollable = true,
  padded = true,
  safeTop = false,
  safeBottom = false,
  refreshing = false,
  onRefresh,
}: ScreenContainerProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const containerStyle = [
    styles.container,
    {
      backgroundColor: colors.background,
      paddingTop: safeTop ? insets.top : 0,
      paddingBottom: safeBottom ? insets.bottom : 0,
    },
  ];

  const contentStyle = [styles.content, padded && styles.padded];

  if (scrollable) {
    return (
      <View style={containerStyle}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={contentStyle}
          showsVerticalScrollIndicator={false}
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
              />
            ) : undefined
          }
        >
          {children}
        </ScrollView>
      </View>
    );
  }

  return <View style={[containerStyle, contentStyle]}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: { flex: 1, flexGrow: 1 },
  padded: {
    paddingHorizontal: 20,
  },
});
