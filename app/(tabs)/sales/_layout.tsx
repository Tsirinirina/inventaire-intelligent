import { Stack } from "expo-router";

export default function SalesLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      <Stack.Screen name="index" options={{ title: "Ventes" }} />
      <Stack.Screen
        name="cart"
        options={{
          title: "Panier",
          presentation: "modal",
        }}
      />
    </Stack>
  );
}
