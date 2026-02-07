import { useTheme } from "@/theme/ThemeProvider";
import React, { useCallback, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import AppText from "./AppText";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  testID?: string;
}

export default function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  icon,
  style,
  testID,
}: ButtonProps) {
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = useCallback(() => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  }, [scale]);

  const onPressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  }, [scale]);

  const bgMap: Record<string, string> = {
    primary: colors.primary,
    secondary: colors.surfaceElevated,
    outline: "transparent",
    ghost: "transparent",
  };

  const textColorMap: Record<string, string> = {
    primary: colors.textInverse,
    secondary: colors.text,
    outline: colors.primary,
    ghost: colors.primary,
  };

  const sizeMap: Record<string, ViewStyle> = {
    sm: { paddingVertical: 8, paddingHorizontal: 16 },
    md: { paddingVertical: 14, paddingHorizontal: 24 },
    lg: { paddingVertical: 18, paddingHorizontal: 32 },
  };

  const borderStyle: ViewStyle =
    variant === "outline"
      ? { borderWidth: 1.5, borderColor: colors.primary }
      : {};

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        testID={testID}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={[
          styles.button,
          sizeMap[size],
          { backgroundColor: bgMap[variant], opacity: disabled ? 0.5 : 1 },
          borderStyle,
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={textColorMap[variant]} size="small" />
        ) : (
          <>
            {icon}
            <AppText
              weight="600"
              color={textColorMap[variant]}
              style={[
                styles.text,
                size === "sm" && { fontSize: 13 },
                size === "lg" && { fontSize: 17 },
              ]}
            >
              {title}
            </AppText>
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    gap: 8,
  },
  text: {
    fontSize: 15,
  },
});
