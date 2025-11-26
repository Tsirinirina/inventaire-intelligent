import { Tabs } from "expo-router";
import { BarChart3, Package, ShoppingCart } from "lucide-react-native";
import React from "react";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "#999",
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#FFF",
          borderTopColor: "#E5E5EA",
          borderTopWidth: 1,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Bord",
          tabBarIcon: ({ color }) => <BarChart3 color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: "Produits",
          tabBarIcon: ({ color }) => <Package color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="sales"
        options={{
          title: "Ventes",
          tabBarIcon: ({ color }) => <ShoppingCart color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}
