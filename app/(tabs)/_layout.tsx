import { useAuth } from "@/core/contexts/AuthContext";
import { useTheme } from "@/theme/ThemeProvider";
import { Redirect, Tabs } from "expo-router";
import { Boxes, ClipboardList, History, Home, SlidersHorizontal, Zap } from "lucide-react-native";
import React from "react";
import { ActivityIndicator, Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Top-indicator tab icon ─────────────────────────────────────────────────
// Renders a glowing pill ABOVE the icon when focused.
function makeTabIcon(
  Icon: React.ComponentType<{ color: string; size: number }>,
  primaryColor: string,
) {
  return ({ color, focused }: { color: string; focused: boolean }) => (
    <View style={{ alignItems: "center", gap: 6 }}>
      {/* Indicator pill */}
      <View
        style={{
          width: 28,
          height: 3,
          borderRadius: 2,
          backgroundColor: focused ? primaryColor : "transparent",
          ...(focused
            ? {
                shadowColor: primaryColor,
                shadowOpacity: 0.8,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 2 },
                elevation: 4,
              }
            : {}),
        }}
      />
      {/* Icon */}
      <Icon color={color} size={22} />
    </View>
  );
}

// ─── Layout ──────────────────────────────────────────────────────────────────

export default function TabLayout() {
  const { colors } = useTheme();
  const { isAuthenticated, isAuthLoading } = useAuth();
  const insets = useSafeAreaInsets();

  if (isAuthLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 64 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 0,
          ...Platform.select({
            ios: {
              shadowColor: colors.shadow,
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
            },
            android: { elevation: 10 },
            web: {},
          }),
        },
        tabBarItemStyle: {
          paddingVertical: 0,
          justifyContent: "center",
          alignItems: "center",
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Bord",
          tabBarIcon: makeTabIcon(Home, colors.primary),
        }}
      />

      <Tabs.Screen
        name="stock"
        options={{
          title: "Stock",
          tabBarIcon: makeTabIcon(Boxes, colors.primary),
        }}
      />

      <Tabs.Screen
        name="sales"
        options={{
          title: "Ventes",
          tabBarIcon: makeTabIcon(Zap, colors.primary),
        }}
      />

      <Tabs.Screen
        name="procurement"
        options={{
          title: "Appro",
          tabBarIcon: makeTabIcon(ClipboardList, colors.primary),
        }}
      />

      <Tabs.Screen
        name="history"
        options={{
          title: "Historique",
          tabBarIcon: makeTabIcon(History, colors.primary),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Paramètres",
          tabBarIcon: makeTabIcon(SlidersHorizontal, colors.primary),
        }}
      />
    </Tabs>
  );
}
