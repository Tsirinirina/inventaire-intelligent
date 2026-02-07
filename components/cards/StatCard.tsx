import Title from "@/components/ui/Title";
import { useTheme } from "@/theme/ThemeProvider";
import { TrendingDown, TrendingUp } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import AppText from "../ui/AppText";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend?: { value: string; positive: boolean };
  accentColor?: string;
  delay?: number;
}

export default function StatCard({
  icon,
  label,
  value,
  trend,
  accentColor,
  delay = 0,
}: StatCardProps) {
  const { colors } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, delay]);

  return (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor: colors.surfaceElevated,
          borderColor: colors.border,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: (accentColor ?? colors.primary) + "18" },
        ]}
      >
        {icon}
      </View>
      <AppText variant="small" style={styles.label}>
        {label}
      </AppText>
      <Title variant="h3" style={styles.value}>
        {value}
      </Title>
      {trend && (
        <View style={styles.trendRow}>
          {trend.positive ? (
            <TrendingUp size={14} color={colors.success} />
          ) : (
            <TrendingDown size={14} color={colors.danger} />
          )}
          <AppText
            variant="small"
            color={trend.positive ? colors.success : colors.danger}
            weight="600"
          >
            {trend.value}
          </AppText>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  label: {
    marginTop: 2,
  },
  value: {
    marginTop: 0,
  },
  trendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
});
