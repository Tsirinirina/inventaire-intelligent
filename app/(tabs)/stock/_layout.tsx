import { Stack } from "expo-router";

export default function StockLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      {/* <Stack.Screen
        name="add"
        options={{
          presentation: "modal",
          headerShown: true,
          title: "Ajouter un produit",
        }}
      /> */}
      {/* <Stack.Screen
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
          title: "Scanner le imei",
        }}
      /> */}
    </Stack>
  );
}
