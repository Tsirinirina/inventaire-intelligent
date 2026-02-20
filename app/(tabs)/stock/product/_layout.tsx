import { Stack } from "expo-router";

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
          // headerTransparent: Platform.OS === "ios",
          // headerTransparent: true,
          headerBlurEffect: "systemUltraThinMaterialLight",
          // headerStyle: {
          //   backgroundColor:
          //     Platform.OS === "android"
          //       ? "rgba(255, 255, 255, 0.8)"
          //       : "transparent",
          // },
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
