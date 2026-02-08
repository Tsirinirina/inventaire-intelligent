import { Stack } from "expo-router";
import { Platform } from "react-native";

export default function ProductsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="add"
        options={{
          presentation: "modal",
          headerShown: true,
          title: "Ajouter un produit",
          animation: "ios_from_right",
          headerLargeTitle: true,
          headerTransparent: Platform.OS === "ios",
        }}
      />
      <Stack.Screen
        name="edit"
        options={{
          presentation: "modal",
          headerShown: true,
          title: "Modifier le produit",
        }}
      />
      <Stack.Screen
        name="scanner"
        options={{
          presentation: "modal",
          headerShown: true,
          title: "Scanner le IMEI",
        }}
      />
    </Stack>
  );
}
