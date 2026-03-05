import { useAccessory } from "@/core/contexts/AccessoryContext";
import { useInventory } from "@/core/contexts/InventoryContext";
import { useProduct } from "@/core/contexts/ProductContext";
import { useSale } from "@/core/contexts/SaleContext";
import { formatAriary } from "@/core/utils/currency.utils";
import { useTheme } from "@/theme/ThemeProvider";
import { ThemeColors } from "@/theme/colors";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  ArrowUpRight,
  Package,
  Plus,
  ShoppingCart,
  TabletSmartphone,
  TrendingUp,
  Wallet,
} from "lucide-react-native";
import { useMemo } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Path, Rect } from "react-native-svg";

// ─── Illustrations SVG ───────────────────────────────────────────────

function WalletIllustration() {
  return (
    <Svg width={90} height={90} viewBox="0 0 90 90">
      <Circle cx="72" cy="18" r="32" fill="rgba(255,255,255,0.07)" />
      <Circle cx="80" cy="60" r="22" fill="rgba(255,255,255,0.05)" />
      <Circle cx="20" cy="75" r="28" fill="rgba(255,255,255,0.06)" />
      {/* Wallet body */}
      <Rect
        x="18"
        y="32"
        width="50"
        height="34"
        rx="7"
        fill="rgba(255,255,255,0.22)"
      />
      <Rect
        x="18"
        y="32"
        width="50"
        height="12"
        rx="7"
        fill="rgba(255,255,255,0.30)"
      />
      {/* Coin slot */}
      <Rect
        x="52"
        y="43"
        width="16"
        height="12"
        rx="6"
        fill="rgba(255,255,255,0.35)"
      />
      <Circle cx="60" cy="49" r="3" fill="rgba(255,255,255,0.7)" />
    </Svg>
  );
}

function PhoneIllustration() {
  return (
    <Svg width={56} height={56} viewBox="0 0 56 56">
      <Circle cx="28" cy="28" r="26" fill="rgba(255,255,255,0.10)" />
      <Rect
        x="17"
        y="8"
        width="22"
        height="38"
        rx="5"
        fill="rgba(255,255,255,0.25)"
      />
      <Rect
        x="20"
        y="13"
        width="16"
        height="22"
        rx="2"
        fill="rgba(255,255,255,0.3)"
      />
      <Circle cx="28" cy="42" r="2.5" fill="rgba(255,255,255,0.6)" />
      <Rect
        x="24"
        y="10"
        width="8"
        height="1.5"
        rx="1"
        fill="rgba(255,255,255,0.5)"
      />
    </Svg>
  );
}

function AccessoryIllustration() {
  return (
    <Svg width={56} height={56} viewBox="0 0 56 56">
      <Circle cx="28" cy="28" r="26" fill="rgba(255,255,255,0.10)" />
      {/* Headphones */}
      <Path
        d="M14 30 Q14 16 28 16 Q42 16 42 30"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <Rect
        x="10"
        y="29"
        width="8"
        height="12"
        rx="4"
        fill="rgba(255,255,255,0.4)"
      />
      <Rect
        x="38"
        y="29"
        width="8"
        height="12"
        rx="4"
        fill="rgba(255,255,255,0.4)"
      />
    </Svg>
  );
}

function BarChartIllustration() {
  return (
    <Svg width={64} height={44} viewBox="0 0 64 44">
      <Rect
        x="4"
        y="28"
        width="11"
        height="14"
        rx="3"
        fill="rgba(255,255,255,0.4)"
      />
      <Rect
        x="19"
        y="18"
        width="11"
        height="24"
        rx="3"
        fill="rgba(255,255,255,0.55)"
      />
      <Rect
        x="34"
        y="8"
        width="11"
        height="34"
        rx="3"
        fill="rgba(255,255,255,0.75)"
      />
      <Rect
        x="49"
        y="14"
        width="11"
        height="28"
        rx="3"
        fill="rgba(255,255,255,0.6)"
      />
      {/* Trend line */}
      <Path
        d="M10 30 L25 22 L40 12 L55 18"
        stroke="rgba(255,255,255,0.9)"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ─── Composant principal ────────────────────────────────────────────

export default function DashboardScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const { stats } = useInventory();
  const { productsLoading } = useProduct();
  const { accessorysLoading } = useAccessory();
  const { salesLoading } = useSale();

  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (productsLoading || salesLoading || accessorysLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Tableau de bord</Text>
            <Text style={styles.date}>{today}</Text>
          </View>
          <View style={styles.headerBadge}>
            <Wallet size={18} color={colors.primary} />
          </View>
        </View>

        {/* ── Hero card : valeur totale ── */}
        <LinearGradient
          colors={["#00D09E", "#0066CC"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroContent}>
            <View style={styles.heroLeft}>
              <Text style={styles.heroLabel}>Valeur d&apos;inventaire</Text>
              <Text
                style={styles.heroAmount}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {formatAriary(stats.totalGain)}
              </Text>
              <View style={styles.heroRow}>
                <View style={styles.heroStat}>
                  <TrendingUp size={12} color="rgba(255,255,255,0.7)" />
                  <Text style={styles.heroStatLabel}>
                    {stats.totalRevenue > 0
                      ? formatAriary(stats.totalRevenue)
                      : "—"}
                  </Text>
                  <Text style={styles.heroStatSub}>revenus</Text>
                </View>
                <View style={styles.heroStatDivider} />
                <View style={styles.heroStat}>
                  <ShoppingCart size={12} color="rgba(255,255,255,0.7)" />
                  <Text style={styles.heroStatLabel}>{stats.totalSales}</Text>
                  <Text style={styles.heroStatSub}>ventes</Text>
                </View>
              </View>
            </View>
            <View style={styles.heroIllustration}>
              <WalletIllustration />
            </View>
          </View>

          {/* Badge "Aujourd'hui" */}
          <View style={styles.todayRow}>
            <View style={styles.todayBadge}>
              <Text style={styles.todayText}>
                Aujourd&apos;hui · {stats.todaySales} vente
                {stats.todaySales !== 1 ? "s" : ""} ·{" "}
                {formatAriary(stats.todayRevenue)}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* ── Produits + Accessoires ── */}
        <View style={styles.statRow}>
          <LinearGradient
            colors={["#667EEA", "#764BA2"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statCard}
          >
            <View style={styles.statCardTop}>
              <View style={styles.statCardInfo}>
                <Text style={styles.statCardLabel}>Produits</Text>
                <Text style={styles.statCardValue}>{stats.totalProducts}</Text>
                <Text style={styles.statCardSub}>
                  {stats.totalProductStock} en stock
                </Text>
              </View>
              <PhoneIllustration />
            </View>
            <View style={styles.statCardFooter}>
              <TabletSmartphone size={13} color="rgba(255,255,255,0.6)" />
              <Text style={styles.statCardFooterText}>
                {formatAriary(stats.totalProductPrice)}
              </Text>
            </View>
          </LinearGradient>

          <LinearGradient
            colors={["#F7971E", "#FF5A65"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statCard}
          >
            <View style={styles.statCardTop}>
              <View style={styles.statCardInfo}>
                <Text style={styles.statCardLabel}>Accessoires</Text>
                <Text style={styles.statCardValue}>{stats.totalAccessory}</Text>
                <Text style={styles.statCardSub}>
                  {stats.totalAccessoryStock} en stock
                </Text>
              </View>
              <AccessoryIllustration />
            </View>
            <View style={styles.statCardFooter}>
              <Package size={13} color="rgba(255,255,255,0.6)" />
              <Text style={styles.statCardFooterText}>
                {formatAriary(stats.totalAccessoryPrice)}
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* ── Résumé des ventes (gradient) ── */}
        <LinearGradient
          colors={["#1A1A2E", "#16213E", "#0F3460"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.salesCard}
        >
          <View style={styles.salesCardContent}>
            <View style={styles.salesLeft}>
              <Text style={styles.salesLabel}>Performance des ventes</Text>
              <Text style={styles.salesRevenue}>
                {formatAriary(stats.totalRevenue)}
              </Text>
              <View style={styles.salesStats}>
                <View style={styles.salesStat}>
                  <Text style={styles.salesStatValue}>{stats.totalSales}</Text>
                  <Text style={styles.salesStatLabel}>Ventes</Text>
                </View>
                <View style={styles.salesStatDivider} />
                <View style={styles.salesStat}>
                  <Text style={styles.salesStatValue}>
                    {stats.totalSales > 0
                      ? formatAriary(
                          Math.round(stats.totalRevenue / stats.totalSales),
                        )
                      : "—"}
                  </Text>
                  <Text style={styles.salesStatLabel}>Moyenne</Text>
                </View>
                <View style={styles.salesStatDivider} />
                <View style={styles.salesStat}>
                  <Text style={styles.salesStatValue}>
                    {stats.topBrand ? stats.topBrand.name : "—"}
                  </Text>
                  <Text style={styles.salesStatLabel}>Top marque</Text>
                </View>
              </View>
            </View>
            <View style={styles.salesIllustration}>
              <BarChartIllustration />
            </View>
          </View>
        </LinearGradient>

        {/* ── Alertes stock faible ── */}
        {(stats.lowStockProducts.length > 0 ||
          stats.lowStockAccessories.length > 0) && (
          <View style={styles.alertCard}>
            <View style={styles.alertHeader}>
              <View style={styles.alertDot} />
              <Text style={styles.alertTitle}>Stocks faibles</Text>
            </View>
            <Text style={styles.alertSub}>
              {stats.lowStockProducts.length} produit
              {stats.lowStockProducts.length !== 1 ? "s" : ""}
              {" · "}
              {stats.lowStockAccessories.length} accessoire
              {stats.lowStockAccessories.length !== 1 ? "s" : ""}
            </Text>
          </View>
        )}

        {/* ── Actions rapides ── */}
        <Text style={styles.sectionTitle}>Actions rapides</Text>
        <View style={styles.quickActions}>
          <Pressable
            style={styles.quickBtn}
            onPress={() => router.push("/(tabs)/stock/product/add")}
          >
            <LinearGradient
              colors={["#667EEA", "#764BA2"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.quickBtnGradient}
            >
              <Plus size={20} color="#fff" />
            </LinearGradient>
            <Text style={styles.quickBtnText}>Ajouter produit</Text>
          </Pressable>

          <Pressable
            style={styles.quickBtn}
            onPress={() => router.push("/(tabs)/sales")}
          >
            <LinearGradient
              colors={["#00D09E", "#0066CC"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.quickBtnGradient}
            >
              <ShoppingCart size={20} color="#fff" />
            </LinearGradient>
            <Text style={styles.quickBtnText}>Nouvelle vente</Text>
          </Pressable>

          <Pressable
            style={styles.quickBtn}
            onPress={() => router.push("/(tabs)/history")}
          >
            <LinearGradient
              colors={["#F7971E", "#FF5A65"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.quickBtnGradient}
            >
              <ArrowUpRight size={20} color="#fff" />
            </LinearGradient>
            <Text style={styles.quickBtnText}>Historique</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
    },
    scroll: {
      padding: 20,
      paddingBottom: 40,
    },

    // ── Header
    header: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginBottom: 20,
    },
    greeting: {
      fontSize: 28,
      fontWeight: "800",
      color: colors.text,
      letterSpacing: -0.5,
    },
    date: {
      fontSize: 13,
      color: colors.textMuted,
      marginTop: 2,
      textTransform: "capitalize",
    },
    headerBadge: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: colors.primary + "1A",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.primary + "33",
    },

    // ── Hero card
    heroCard: {
      borderRadius: 24,
      padding: 24,
      marginBottom: 16,
      overflow: "hidden",
    },
    heroContent: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
    },
    heroLeft: {
      flex: 1,
      paddingRight: 8,
    },
    heroLabel: {
      fontSize: 13,
      color: "rgba(255,255,255,0.7)",
      fontWeight: "500",
      marginBottom: 6,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    heroAmount: {
      fontSize: 30,
      fontWeight: "800",
      color: "#fff",
      marginBottom: 14,
      letterSpacing: -0.5,
    },
    heroRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    heroStat: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    heroStatLabel: {
      color: "#fff",
      fontSize: 13,
      fontWeight: "700",
    },
    heroStatSub: {
      color: "rgba(255,255,255,0.6)",
      fontSize: 11,
    },
    heroStatDivider: {
      width: 1,
      height: 14,
      backgroundColor: "rgba(255,255,255,0.25)",
    },
    heroIllustration: {
      opacity: 0.9,
    },
    todayRow: {
      marginTop: 16,
    },
    todayBadge: {
      alignSelf: "flex-start",
      backgroundColor: "rgba(255,255,255,0.18)",
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 5,
    },
    todayText: {
      color: "#fff",
      fontSize: 12,
      fontWeight: "600",
    },

    // ── Stat cards row
    statRow: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 16,
    },
    statCard: {
      flex: 1,
      borderRadius: 20,
      padding: 16,
      overflow: "hidden",
    },
    statCardTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 12,
    },
    statCardInfo: {
      flex: 1,
    },
    statCardLabel: {
      fontSize: 12,
      color: "rgba(255,255,255,0.7)",
      fontWeight: "500",
      textTransform: "uppercase",
      letterSpacing: 0.4,
      marginBottom: 4,
    },
    statCardValue: {
      fontSize: 32,
      fontWeight: "800",
      color: "#fff",
    },
    statCardSub: {
      fontSize: 12,
      color: "rgba(255,255,255,0.65)",
      marginTop: 2,
    },
    statCardFooter: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      borderTopWidth: 1,
      borderTopColor: "rgba(255,255,255,0.15)",
      paddingTop: 10,
      marginTop: 4,
    },
    statCardFooterText: {
      fontSize: 12,
      color: "rgba(255,255,255,0.75)",
      fontWeight: "600",
      flex: 1,
    },

    // ── Sales card
    salesCard: {
      borderRadius: 20,
      marginBottom: 16,
      overflow: "hidden",
    },
    salesCardContent: {
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
      padding: 20,
    },
    salesLeft: {
      flex: 1,
      paddingRight: 12,
    },
    salesLabel: {
      fontSize: 12,
      color: "rgba(255,255,255,0.5)",
      textTransform: "uppercase",
      letterSpacing: 0.5,
      marginBottom: 6,
    },
    salesRevenue: {
      fontSize: 22,
      fontWeight: "800",
      color: "#fff",
      marginBottom: 14,
    },
    salesStats: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    salesStat: {
      alignItems: "flex-start",
    },
    salesStatValue: {
      fontSize: 14,
      fontWeight: "700",
      color: "#fff",
    },
    salesStatLabel: {
      fontSize: 11,
      color: "rgba(255,255,255,0.5)",
    },
    salesStatDivider: {
      width: 1,
      height: 24,
      backgroundColor: "rgba(255,255,255,0.15)",
    },
    salesIllustration: {
      paddingBottom: 4,
    },

    // ── Alert card
    alertCard: {
      backgroundColor: colors.warning + "18",
      borderRadius: 14,
      padding: 14,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.warning + "33",
    },
    alertHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 4,
    },
    alertDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.warning,
    },
    alertTitle: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.warning,
    },
    alertSub: {
      fontSize: 13,
      color: colors.textSecondary,
      marginLeft: 16,
    },

    // ── Quick actions
    sectionTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 12,
    },
    quickActions: {
      flexDirection: "row",
      gap: 10,
    },
    quickBtn: {
      flex: 1,
      alignItems: "center",
      gap: 8,
    },
    quickBtnGradient: {
      width: 52,
      height: 52,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
    },
    quickBtnText: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.textSecondary,
      textAlign: "center",
    },
  });
