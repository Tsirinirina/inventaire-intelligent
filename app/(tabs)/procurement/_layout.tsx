import { Stack } from "expo-router";

export default function ProcurementLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="index" options={{ title: "Approvisionnement" }} />
      <Stack.Screen name="add" options={{ title: "Ajouter au panier" }} />
      <Stack.Screen
        name="cart"
        options={{ title: "Panier d'appro", presentation: "modal" }}
      />
    </Stack>
  );
}
