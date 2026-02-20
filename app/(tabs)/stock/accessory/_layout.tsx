import { Stack } from "expo-router";

export default function AccessoryLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen
        name="add"
        options={{
          presentation: "modal",
          headerShown: true,
          title: "Ajouter une accessoire",
        }}
      />
      <Stack.Screen
        name="edit"
        options={{
          presentation: "modal",
          headerShown: true,
          title: "Modifier l'accessoire",
        }}
      />
    </Stack>
  );
}
