import { ToastContainer, ToastProvider } from "@/components/ui/Toast";
import { AccessoryProvider } from "@/core/contexts/AccessoryContext";
import { AuthProvider } from "@/core/contexts/AuthContext";
import { InventoryProvider } from "@/core/contexts/InventoryContext";
import { ProductProvider } from "@/core/contexts/ProductContext";
import { SaleProvider } from "@/core/contexts/SaleContext";
import { SellerProvider } from "@/core/contexts/SellerContext";
import { initDatabase } from "@/core/database";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

SplashScreen.preventAutoHideAsync();
const queryClient = new QueryClient();

export default function RootLayout() {
  useEffect(() => {
    initDatabase();
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SellerProvider>
          <ProductProvider>
            <AccessoryProvider>
              <SaleProvider>
                <InventoryProvider>
                  <GestureHandlerRootView style={{ flex: 1 }}>
                    <ThemeProvider>
                      <ToastProvider>
                        <StatusBar style="light" />
                        <SafeAreaProvider>
                          <Stack screenOptions={{ headerShown: false }} />
                        </SafeAreaProvider>
                        <ToastContainer />
                      </ToastProvider>
                    </ThemeProvider>
                  </GestureHandlerRootView>
                </InventoryProvider>
              </SaleProvider>
            </AccessoryProvider>
          </ProductProvider>
        </SellerProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
