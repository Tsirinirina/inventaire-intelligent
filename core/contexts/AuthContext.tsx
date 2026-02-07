import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getDatabase } from "../database";
import { Seller, SELLER_QUERY_KEY } from "../entity/seller.entity";
import { useLoginSellerQuery } from "../queries/seller.query";
import { getSellerById } from "../services/seller.service";

export const ASYNC_STORAGE_SELLER_KEY = "sellerId";

export const [AuthProvider, useAuth] = createContextHook(() => {
  const queryClient = useQueryClient();
  const db = getDatabase();
  const [currentSeller, setCurrentSeller] = useState<Seller | null>(null);
  const [isRestoringSession, setIsRestoringSession] = useState(true);

  const loginSellerQuery = useLoginSellerQuery();

  /**
   * Login
   */
  const login = async (name: string, passcode: string) => {
    try {
      const seller = await loginSellerQuery.mutateAsync({
        name,
        passcode,
      });
      if (!seller) throw new Error("Login échoué");

      console.log("login = ", seller);

      await AsyncStorage.setItem(ASYNC_STORAGE_SELLER_KEY, String(seller?.id));

      setCurrentSeller(seller);
      return seller;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Restore session on app start
   */
  const restoreSession = async () => {
    try {
      const sellerId = await AsyncStorage.getItem(ASYNC_STORAGE_SELLER_KEY);
      if (!sellerId) return;

      let seller: Seller | null | undefined = queryClient.getQueryData<Seller>([
        SELLER_QUERY_KEY,
        Number(sellerId),
      ]);
      if (!seller) {
        seller = await getSellerById(db, Number(sellerId));
        if (seller)
          queryClient.setQueryData(
            [SELLER_QUERY_KEY, Number(sellerId)],
            seller,
          );
      }

      if (seller) setCurrentSeller(seller);
    } finally {
      setIsRestoringSession(false); // ✅ c'est ici le point clé
    }
  };

  /**
   * Logout
   */
  const logout = async () => {
    await AsyncStorage.removeItem(ASYNC_STORAGE_SELLER_KEY);
    setCurrentSeller(null);
    queryClient.clear();
  };

  useEffect(() => {
    restoreSession();
  }, []);

  return {
    /* session */
    currentSeller,
    isAuthenticated: !!currentSeller,

    /* login */
    login,
    loginLoading: loginSellerQuery.isPending,
    loginError: loginSellerQuery.error,

    /* app boot */
    isAuthLoading: isRestoringSession,

    logout,
  };
});
