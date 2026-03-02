import { useAuth } from "@/core/contexts/AuthContext";
import { countPendingItems, runSync } from "@/core/services/sync.service";
import { useSyncStore } from "@/core/store/sync.store";
import { SyncProgress } from "@/core/types/sync.types";
import { useTheme } from "@/theme/ThemeProvider";
import { ThemeColors } from "@/theme/colors";
import { LinearGradient } from "expo-linear-gradient";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Cloud,
  CloudOff,
  Loader,
  Moon,
  RefreshCw,
  Settings,
  Smartphone,
  Sun,
  User,
} from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string | null): string {
  if (!iso) return "Jamais";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function phaseLabel(phase: SyncProgress["phase"]): string {
  switch (phase) {
    case "images":
      return "Upload des images…";
    case "products":
      return "Synchronisation des produits…";
    case "accessories":
      return "Synchronisation des accessoires…";
    case "sales":
      return "Synchronisation des ventes…";
  }
}

// ─── Composants atomiques ────────────────────────────────────────────────────

function SectionHeader({
  title,
  colors,
}: {
  title: string;
  colors: ThemeColors;
}) {
  return (
    <Text
      style={{
        fontSize: 12,
        fontWeight: "700",
        color: colors.textMuted,
        textTransform: "uppercase",
        letterSpacing: 0.8,
        marginBottom: 8,
        marginTop: 24,
        paddingHorizontal: 4,
      }}
    >
      {title}
    </Text>
  );
}

function Card({
  children,
  colors,
  style,
}: {
  children: React.ReactNode;
  colors: ThemeColors;
  style?: object;
}) {
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: "hidden",
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

function Row({
  icon,
  label,
  value,
  onPress,
  colors,
  isLast = false,
  danger = false,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onPress?: () => void;
  colors: ThemeColors;
  isLast?: boolean;
  danger?: boolean;
}) {
  const inner = (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 12,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: colors.border,
      }}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          backgroundColor: danger
            ? colors.danger + "18"
            : colors.primary + "16",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {icon}
      </View>
      <Text
        style={{
          flex: 1,
          fontSize: 15,
          fontWeight: "500",
          color: danger ? colors.danger : colors.text,
        }}
      >
        {label}
      </Text>
      {value ? (
        <Text style={{ fontSize: 13, color: colors.textMuted }}>{value}</Text>
      ) : null}
      {onPress ? (
        <ChevronRight size={16} color={colors.textMuted} />
      ) : null}
    </View>
  );

  return onPress ? (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
      {inner}
    </Pressable>
  ) : (
    inner
  );
}

// ─── Écran principal ─────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const { colors, mode, setMode } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { currentSeller } = useAuth();

  const {
    serverUrl,
    authToken,
    runStatus,
    lastSyncAt,
    lastResult,
    lastError,
    progress,
    setServerUrl,
    setSyncRunning,
    setSyncDone,
    setSyncError,
    reset,
  } = useSyncStore();

  const [urlInput, setUrlInput] = useState(serverUrl);
  const [pendingCount, setPendingCount] = useState(0);

  // Compter les items en attente au montage + après chaque sync
  const refreshPending = useCallback(() => {
    try {
      setPendingCount(countPendingItems());
    } catch {
      // DB pas encore initialisée
    }
  }, []);

  useEffect(() => {
    refreshPending();
  }, [refreshPending, runStatus]);

  // ── Sync ───────────────────────────────────────────────────────────────────
  const handleSync = async () => {
    if (!serverUrl) {
      Alert.alert("URL manquante", "Configurez l'URL du serveur d'abord.");
      return;
    }
    if (!currentSeller) {
      Alert.alert("Non connecté", "Veuillez vous connecter d'abord.");
      return;
    }
    if (runStatus === "syncing") return;

    setSyncRunning();
    try {
      const result = await runSync({
        sellerName: currentSeller.name,
        sellerPasscode: currentSeller.passcode,
        onProgress: (p) => useSyncStore.getState().setProgress(p),
      });
      setSyncDone(result);
      refreshPending();

      if (result.failed > 0) {
        Alert.alert(
          "Sync partielle",
          `${result.synced} synchronisé(s), ${result.failed} échec(s).\n\n${result.errors.slice(0, 3).join("\n")}`,
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      setSyncError(msg);
      Alert.alert("Erreur de synchronisation", msg);
    }
  };

  // ── Initiales du vendeur ───────────────────────────────────────────────────
  const initials = currentSeller?.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "V";

  const isSyncing = runStatus === "syncing";

  // ── Rendu ──────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Paramètres</Text>
          <View style={styles.headerIcon}>
            <Settings size={18} color={colors.primary} />
          </View>
        </View>

        {/* ════════════════════════════════════════
            PROFIL
        ════════════════════════════════════════ */}
        <SectionHeader title="Profil" colors={colors} />
        <LinearGradient
          colors={["#00D09E", "#0066CC"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileCard}
        >
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>
              {currentSeller?.name ?? "Vendeur par défaut"}
            </Text>
            <Text style={styles.profileRole}>Vendeur actif</Text>
          </View>
          <View style={styles.profileBadge}>
            <Smartphone size={14} color="rgba(255,255,255,0.9)" />
            <Text style={styles.profileBadgeText}>Local</Text>
          </View>
        </LinearGradient>

        {/* ════════════════════════════════════════
            APPARENCE
        ════════════════════════════════════════ */}
        <SectionHeader title="Apparence" colors={colors} />
        <Card colors={colors}>
          <View style={styles.themeRow}>
            <View style={styles.themeRowLabel}>
              {mode === "dark" ? (
                <Moon size={18} color={colors.primary} />
              ) : (
                <Sun size={18} color={colors.primary} />
              )}
              <Text style={styles.themeLabel}>Thème</Text>
            </View>
            <View style={styles.themeToggle}>
              {(["light", "dark", "system"] as const).map((m) => (
                <Pressable
                  key={m}
                  style={[styles.themeBtn, mode === m && styles.themeBtnActive]}
                  onPress={() => setMode(m)}
                >
                  <Text
                    style={[
                      styles.themeBtnText,
                      mode === m && styles.themeBtnTextActive,
                    ]}
                  >
                    {m === "light" ? "Clair" : m === "dark" ? "Sombre" : "Auto"}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </Card>

        {/* ════════════════════════════════════════
            SYNCHRONISATION
        ════════════════════════════════════════ */}
        <SectionHeader title="Synchronisation" colors={colors} />
        <Card colors={colors}>
          {/* URL serveur */}
          <View style={styles.urlRow}>
            <Text style={styles.urlLabel}>URL du serveur NestJS</Text>
            <View style={styles.urlInputRow}>
              <TextInput
                style={styles.urlInput}
                value={urlInput}
                onChangeText={setUrlInput}
                onBlur={() => setServerUrl(urlInput)}
                placeholder="http://192.168.1.10:3000"
                placeholderTextColor={colors.inputPlaceholder}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />
              {serverUrl ? (
                <Cloud size={16} color={colors.primary} />
              ) : (
                <CloudOff size={16} color={colors.textMuted} />
              )}
            </View>
          </View>

          <View style={styles.divider} />

          {/* Stats sync */}
          <View style={styles.syncStats}>
            <View style={styles.syncStat}>
              <Text style={styles.syncStatValue}>{pendingCount}</Text>
              <Text style={styles.syncStatLabel}>En attente</Text>
            </View>
            <View style={styles.syncStatDivider} />
            <View style={styles.syncStat}>
              <Text style={styles.syncStatValue}>
                {lastResult?.synced ?? 0}
              </Text>
              <Text style={styles.syncStatLabel}>Synchronisés</Text>
            </View>
            <View style={styles.syncStatDivider} />
            <View style={styles.syncStat}>
              <Text
                style={[
                  styles.syncStatValue,
                  (lastResult?.failed ?? 0) > 0 && { color: colors.danger },
                ]}
              >
                {lastResult?.failed ?? 0}
              </Text>
              <Text style={styles.syncStatLabel}>Échecs</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Dernière sync + statut */}
          <View style={styles.syncInfoRow}>
            {runStatus === "success" ? (
              <CheckCircle2 size={14} color={colors.success} />
            ) : runStatus === "error" ? (
              <AlertTriangle size={14} color={colors.danger} />
            ) : (
              <RefreshCw size={14} color={colors.textMuted} />
            )}
            <Text style={styles.syncInfoText}>
              {runStatus === "error" && lastError
                ? lastError
                : `Dernière sync : ${formatDate(lastSyncAt)}`}
            </Text>
          </View>

          {/* Progression en temps réel */}
          {isSyncing && progress && (
            <View style={styles.progressRow}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.progressText}>
                {phaseLabel(progress.phase)} ({progress.current}/
                {progress.total})
              </Text>
            </View>
          )}

          <View style={styles.divider} />

          {/* Bouton sync */}
          <Pressable
            style={[styles.syncBtn, isSyncing && styles.syncBtnDisabled]}
            onPress={handleSync}
            disabled={isSyncing}
          >
            {isSyncing ? (
              <ActivityIndicator size="small" color={colors.textInverse} />
            ) : (
              <RefreshCw size={18} color={colors.textInverse} />
            )}
            <Text style={styles.syncBtnText}>
              {isSyncing ? "Synchronisation…" : "Synchroniser maintenant"}
            </Text>
          </Pressable>
        </Card>

        {/* ════════════════════════════════════════
            À PROPOS
        ════════════════════════════════════════ */}
        <SectionHeader title="À propos" colors={colors} />
        <Card colors={colors}>
          <Row
            icon={<Smartphone size={16} color={colors.primary} />}
            label="Inventaire Intelligent"
            value="v1.0.0"
            colors={colors}
          />
          <Row
            icon={<Cloud size={16} color={colors.primary} />}
            label="Sync NestJS + MongoDB"
            value="Prêt"
            colors={colors}
            isLast
          />
        </Card>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scroll: {
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 20,
    },

    // ── Header ──
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 4,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: "800",
      color: colors.text,
      letterSpacing: -0.5,
    },
    headerIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: colors.primary + "1A",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.primary + "33",
    },

    // ── Profil ──
    profileCard: {
      borderRadius: 20,
      padding: 20,
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
    },
    avatarCircle: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: "rgba(255,255,255,0.25)",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
      borderColor: "rgba(255,255,255,0.4)",
    },
    avatarText: {
      fontSize: 18,
      fontWeight: "800",
      color: "#fff",
    },
    profileName: {
      fontSize: 17,
      fontWeight: "700",
      color: "#fff",
    },
    profileRole: {
      fontSize: 12,
      color: "rgba(255,255,255,0.7)",
      marginTop: 2,
    },
    profileBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      backgroundColor: "rgba(255,255,255,0.18)",
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 20,
    },
    profileBadgeText: {
      fontSize: 12,
      fontWeight: "600",
      color: "#fff",
    },

    // ── Thème ──
    themeRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 14,
      gap: 12,
    },
    themeRowLabel: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    themeLabel: {
      fontSize: 15,
      fontWeight: "500",
      color: colors.text,
    },
    themeToggle: {
      flexDirection: "row",
      backgroundColor: colors.surfaceElevated,
      borderRadius: 10,
      padding: 3,
      gap: 2,
      borderWidth: 1,
      borderColor: colors.border,
    },
    themeBtn: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 7,
    },
    themeBtnActive: {
      backgroundColor: colors.primary,
    },
    themeBtnText: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.textSecondary,
    },
    themeBtnTextActive: {
      color: colors.textInverse,
    },

    // ── Sync ──
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginHorizontal: 16,
    },
    urlRow: {
      padding: 16,
      gap: 8,
    },
    urlLabel: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.textSecondary,
    },
    urlInputRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surfaceElevated,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      gap: 8,
      borderWidth: 1,
      borderColor: colors.inputBorder,
    },
    urlInput: {
      flex: 1,
      fontSize: 14,
      color: colors.inputText,
      fontFamily: "monospace",
    },
    syncStats: {
      flexDirection: "row",
      paddingVertical: 16,
      paddingHorizontal: 20,
    },
    syncStat: {
      flex: 1,
      alignItems: "center",
      gap: 4,
    },
    syncStatValue: {
      fontSize: 22,
      fontWeight: "800",
      color: colors.text,
    },
    syncStatLabel: {
      fontSize: 11,
      color: colors.textMuted,
    },
    syncStatDivider: {
      width: 1,
      height: 32,
      backgroundColor: colors.border,
      alignSelf: "center",
    },
    syncInfoRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      padding: 14,
    },
    syncInfoText: {
      fontSize: 13,
      color: colors.textSecondary,
      flex: 1,
    },
    progressRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingHorizontal: 14,
      paddingBottom: 10,
    },
    progressText: {
      fontSize: 13,
      color: colors.primary,
      fontWeight: "500",
    },
    syncBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      margin: 16,
      marginTop: 12,
      backgroundColor: colors.primary,
      paddingVertical: 14,
      borderRadius: 14,
    },
    syncBtnDisabled: {
      opacity: 0.6,
    },
    syncBtnText: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.textInverse,
    },
  });
