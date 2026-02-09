import StatCard from "@/components/cards/StatCard";
// eslint-disable-next-line import/no-unresolved
import AppText from "@/components/ui/AppText";
import ScreenContainer from "@/components/ui/ScreenContainer";
import Title from "@/components/ui/Title";
import {
  monthlyExpenses,
  recentTransactions,
  spendingCategories,
  Transaction,
} from "@/core/mock/dashboard";
import { useTheme } from "@/theme/ThemeProvider";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  Briefcase,
  Car,
  Eye,
  EyeOff,
  Music,
  Palette,
  ShoppingBag,
  ShoppingCart,
  TrendingUp,
  Tv,
  Wallet,
} from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, TouchableOpacity, View } from "react-native";

const iconMap: Record<
  string,
  React.ComponentType<{ size: number; color: string }>
> = {
  laptop: ShoppingBag,
  briefcase: Briefcase,
  tv: Tv,
  car: Car,
  palette: Palette,
  music: Music,
  "shopping-cart": ShoppingCart,
  "trending-up": TrendingUp,
};

export default function DashboardScreen() {
  const { colors } = useTheme();
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const balanceAnim = useRef(new Animated.Value(0)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(150, [
      Animated.spring(headerAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
      }),
      Animated.spring(balanceAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
      }),
    ]).start();
  }, [headerAnim, balanceAnim]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const renderTransactionItem = useCallback(
    ({ item }: { item: Transaction }) => {
      const IconComp = iconMap[item.icon] ?? ShoppingBag;
      const isIncome = item.type === "income";
      return (
        <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.txRow, { borderBottomColor: colors.border }]}
        >
          <View
            style={[
              styles.txIcon,
              {
                backgroundColor: isIncome
                  ? colors.success + "15"
                  : colors.accent + "15",
              },
            ]}
          >
            <IconComp
              size={20}
              color={isIncome ? colors.success : colors.accent}
            />
          </View>
          <View style={styles.txInfo}>
            <AppText weight="600">{item.title}</AppText>
            <AppText variant="small">{item.subtitle}</AppText>
          </View>
          <View style={styles.txAmount}>
            <AppText
              weight="600"
              color={isIncome ? colors.success : colors.text}
            >
              {item.amount}
            </AppText>
            <AppText variant="small" align="right">
              {item.date}
            </AppText>
          </View>
        </TouchableOpacity>
      );
    },
    [colors],
  );

  return (
    <ScreenContainer safeTop refreshing={refreshing} onRefresh={onRefresh}>
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerAnim,
            transform: [
              {
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View>
          <AppText variant="muted">Good morning</AppText>
          <Title variant="h2">Alex Johnson</Title>
        </View>
        <TouchableOpacity
          style={[styles.notifBtn, { backgroundColor: colors.surfaceElevated }]}
        >
          <Bell size={20} color={colors.text} />
          <View style={[styles.notifDot, { backgroundColor: colors.danger }]} />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View
        style={{
          opacity: balanceAnim,
          transform: [
            {
              translateY: balanceAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        }}
      >
        <LinearGradient
          colors={[colors.cardGradientStart, colors.cardGradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <View style={styles.balanceHeader}>
            <AppText color="rgba(255,255,255,0.8)" variant="muted">
              Total Balance
            </AppText>
            <TouchableOpacity
              onPress={() => setBalanceVisible(!balanceVisible)}
              hitSlop={12}
            >
              {balanceVisible ? (
                <Eye size={20} color="rgba(255,255,255,0.8)" />
              ) : (
                <EyeOff size={20} color="rgba(255,255,255,0.8)" />
              )}
            </TouchableOpacity>
          </View>
          <Title variant="h1" color="#fff" style={styles.balanceValue}>
            {balanceVisible ? "$46,790.40" : "••••••"}
          </Title>
          <View style={styles.balanceActions}>
            <TouchableOpacity style={styles.balanceAction}>
              <View style={styles.balanceActionIcon}>
                <ArrowUpRight size={18} color="#fff" />
              </View>
              <AppText
                color="rgba(255,255,255,0.9)"
                variant="small"
                weight="500"
              >
                Send
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.balanceAction}>
              <View style={styles.balanceActionIcon}>
                <ArrowDownLeft size={18} color="#fff" />
              </View>
              <AppText
                color="rgba(255,255,255,0.9)"
                variant="small"
                weight="500"
              >
                Receive
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.balanceAction}>
              <View style={styles.balanceActionIcon}>
                <Wallet size={18} color="#fff" />
              </View>
              <AppText
                color="rgba(255,255,255,0.9)"
                variant="small"
                weight="500"
              >
                Top Up
              </AppText>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>

      <View style={styles.statsRow}>
        <StatCard
          icon={<ArrowDownLeft size={20} color={colors.success} />}
          label="Income"
          value="$9,990"
          trend={{ value: "+12.5%", positive: true }}
          accentColor={colors.success}
          delay={200}
        />
        <StatCard
          icon={<ArrowUpRight size={20} color={colors.danger} />}
          label="Expenses"
          value="$3,140"
          trend={{ value: "-4.2%", positive: false }}
          accentColor={colors.danger}
          delay={350}
        />
      </View>

      <View style={styles.chartSection}>
        <View style={styles.sectionHeader}>
          <Title variant="h3">Monthly Spending</Title>
          <AppText variant="small" color={colors.primary}>
            See all
          </AppText>
        </View>
        <View
          style={[
            styles.chartContainer,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.barChart}>
            {monthlyExpenses.map((item, index) => {
              const maxVal = Math.max(...monthlyExpenses.map((e) => e.value));
              const heightPercent = (item.value / maxVal) * 100;
              return (
                <View key={item.label} style={styles.barItem}>
                  <View style={styles.barWrapper}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: `${heightPercent}%` as any,
                          backgroundColor:
                            index === monthlyExpenses.length - 1
                              ? colors.primary
                              : colors.primary + "40",
                          borderRadius: 6,
                        },
                      ]}
                    />
                  </View>
                  <AppText variant="small" align="center">
                    {item.label}
                  </AppText>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      <View style={styles.categoriesSection}>
        <View style={styles.sectionHeader}>
          <Title variant="h3">Spending by Category</Title>
        </View>
        {spendingCategories.map((cat) => (
          <View
            key={cat.name}
            style={[styles.categoryRow, { borderBottomColor: colors.border }]}
          >
            <View
              style={[styles.categoryDot, { backgroundColor: cat.color }]}
            />
            <View style={styles.categoryInfo}>
              <AppText weight="500">{cat.name}</AppText>
              <View
                style={[
                  styles.categoryBar,
                  { backgroundColor: colors.surface },
                ]}
              >
                <View
                  style={[
                    styles.categoryBarFill,
                    {
                      width: `${cat.percent}%` as any,
                      backgroundColor: cat.color,
                    },
                  ]}
                />
              </View>
            </View>
            <AppText weight="600">{cat.amount}</AppText>
          </View>
        ))}
      </View>

      <View style={styles.transactionsSection}>
        <View style={styles.sectionHeader}>
          <Title variant="h3">Recent Transactions</Title>
          <AppText variant="small" color={colors.primary}>
            View all
          </AppText>
        </View>
        {recentTransactions.slice(0, 5).map((item) => (
          <View key={item.id}>{renderTransactionItem({ item })}</View>
        ))}
      </View>

      <View style={{ height: 20 }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  notifDot: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  balanceCard: {
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
  },
  balanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  balanceValue: {
    marginTop: 8,
    fontSize: 36,
    letterSpacing: -1,
  },
  balanceActions: {
    flexDirection: "row",
    marginTop: 24,
    gap: 20,
  },
  balanceAction: {
    alignItems: "center",
    gap: 6,
  },
  balanceActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  chartSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  chartContainer: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
  },
  barChart: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 140,
    gap: 8,
  },
  barItem: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  barWrapper: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  bar: {
    width: "65%",
    minHeight: 8,
  },
  categoriesSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  categoryInfo: {
    flex: 1,
    gap: 6,
  },
  categoryBar: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  categoryBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  transactionsSection: {
    paddingHorizontal: 20,
  },
  txRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  txIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  txInfo: {
    flex: 1,
    gap: 2,
  },
  txAmount: {
    alignItems: "flex-end",
    gap: 2,
  },
});
