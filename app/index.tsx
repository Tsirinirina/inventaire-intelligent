import { useAuth } from "@/core/contexts/AuthContext";
import { Redirect } from "expo-router";

export default function Index() {
  const { isAuthenticated, isAuthLoading } = useAuth();

  // ✅ Tant que la session se restaure, on ne rend rien
  if (isAuthLoading) return null;

  // ✅ Redirection après restauration
  return isAuthenticated ? (
    <Redirect href="/(tabs)/dashboard" />
  ) : (
    <Redirect href="/(auth)/login" />
  );
}
