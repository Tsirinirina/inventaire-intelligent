import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getDatabase } from "../database";
import { Seller, SELLER_QUERY_KEY } from "../entity/seller.entity";
import { useLoginSellerQuery } from "../queries/seller.query";
import { getSellerById, upsertLocalSellerSession } from "../services/seller.service";

export const ASYNC_STORAGE_SELLER_KEY = "sellerId";

function isStoredSeller(value: unknown): value is Seller {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<Seller>;
  return (
    typeof candidate.id === "number" &&
    typeof candidate.name === "string" &&
    (candidate.passcode === undefined ||
      typeof candidate.passcode === "string") &&
    (candidate.syncId === undefined ||
      candidate.syncId === null ||
      typeof candidate.syncId === "string")
  );
}

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
      if (!seller)
        throw new Error("L'utilisateur ou le mot de passe est incorrect.");

      const localSeller = upsertLocalSellerSession(db, seller.name, passcode);
      const sessionSeller: Seller = {
        ...localSeller,
        name: seller.name,
        passcode,
        syncId: seller.syncId,
      };

      await AsyncStorage.setItem(
        ASYNC_STORAGE_SELLER_KEY,
        JSON.stringify(sessionSeller),
      );

      queryClient.setQueryData(
        [SELLER_QUERY_KEY, "id", sessionSeller.id],
        sessionSeller,
      );

      setCurrentSeller(sessionSeller);
      return sessionSeller;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Restore session on app start
   */
  const restoreSession = async () => {
    try {
      const storedSession = await AsyncStorage.getItem(ASYNC_STORAGE_SELLER_KEY);
      if (!storedSession) return;

      let parsedSession: unknown = null;
      try {
        parsedSession = JSON.parse(storedSession);
        if (isStoredSeller(parsedSession)) {
          setCurrentSeller(parsedSession);
          queryClient.setQueryData(
            [SELLER_QUERY_KEY, "id", parsedSession.id],
            parsedSession,
          );
          return;
        }
      } catch {}

      const legacySellerId = Number(
        typeof parsedSession === "number" ? parsedSession : storedSession,
      );
      if (!Number.isNaN(legacySellerId)) {
        const seller = await getSellerById(db, legacySellerId);
        if (seller) {
          setCurrentSeller(seller);
          queryClient.setQueryData([SELLER_QUERY_KEY, "id", seller.id], seller);
          await AsyncStorage.setItem(
            ASYNC_STORAGE_SELLER_KEY,
            JSON.stringify(seller),
          );
        }
      }
    } finally {
      setIsRestoringSession(false);
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
