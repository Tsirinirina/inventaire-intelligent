import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { SyncProgress, SyncResult } from "@/core/types/sync.types";
import { apiClient } from "@/core/services/api/api.client";

export type SyncRunStatus = "idle" | "syncing" | "success" | "error";

interface SyncState {
  // ── Config (persistée) ──────────────────────────────────────────────
  serverUrl: string;
  authToken: string | null;

  // ── Statut de la dernière sync ──────────────────────────────────────
  runStatus: SyncRunStatus;
  lastSyncAt: string | null;
  lastResult: SyncResult | null;
  lastError: string | null;

  // ── Progression en temps réel ───────────────────────────────────────
  progress: SyncProgress | null;

  // ── Actions ─────────────────────────────────────────────────────────
  setServerUrl: (url: string) => void;
  setAuthToken: (token: string | null) => void;
  setProgress: (p: SyncProgress | null) => void;
  setSyncRunning: () => void;
  setSyncDone: (result: SyncResult) => void;
  setSyncError: (error: string) => void;
  reset: () => void;
}

export const useSyncStore = create<SyncState>()(
  persist(
    (set) => ({
      // ── État initial ──
      serverUrl: "",
      authToken: null,
      runStatus: "idle",
      lastSyncAt: null,
      lastResult: null,
      lastError: null,
      progress: null,

      // ── Config ──
      setServerUrl: (url) => {
        const clean = url.trim().replace(/\/$/, "");
        set({ serverUrl: clean });
        apiClient.configure(clean);
      },
      setAuthToken: (token) => {
        set({ authToken: token });
        apiClient.setToken(token);
      },

      // ── Cycle de vie de la sync ──
      setProgress: (progress) => set({ progress }),
      setSyncRunning: () =>
        set({ runStatus: "syncing", lastError: null, progress: null }),
      setSyncDone: (result) =>
        set({
          runStatus: result.failed > 0 ? "error" : "success",
          lastSyncAt: new Date().toISOString(),
          lastResult: result,
          lastError:
            result.failed > 0
              ? `${result.failed} élément(s) non synchronisé(s)`
              : null,
          progress: null,
        }),
      setSyncError: (error) =>
        set({ runStatus: "error", lastError: error, progress: null }),
      reset: () =>
        set({
          runStatus: "idle",
          lastError: null,
          progress: null,
        }),
    }),
    {
      name: "inventaire-sync-store",
      storage: createJSONStorage(() => AsyncStorage),
      // Persister uniquement la config et le timestamp, pas le statut transitoire
      partialize: (state) => ({
        serverUrl: state.serverUrl,
        authToken: state.authToken,
        lastSyncAt: state.lastSyncAt,
        lastResult: state.lastResult,
      }),
      // CRITIQUE : re-configurer apiClient après rehydratation depuis AsyncStorage.
      // Sans ce callback, apiClient.baseUrl reste "" après un redémarrage de l'app
      // même si serverUrl est sauvegardé dans le store persisté.
      onRehydrateStorage: () => (state) => {
        if (state?.serverUrl) {
          apiClient.configure(state.serverUrl);
        }
        if (state?.authToken) {
          apiClient.setToken(state.authToken);
        }
      },
    },
  ),
);
