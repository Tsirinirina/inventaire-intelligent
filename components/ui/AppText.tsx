import { useTheme } from "@/theme/ThemeProvider";
import React from "react";
import { Text as RNText, TextProps, TextStyle } from "react-native";

interface AppTextProps extends TextProps {
  variant?: "normal" | "muted" | "small";
  color?: string;
  align?: "left" | "center" | "right";
  weight?: "normal" | "500" | "600" | "bold";
}

export default function AppText({
  variant = "normal",
  color,
  align = "left",
  weight,
  style,
  children,
  ...props
}: AppTextProps) {
  const { colors } = useTheme();

  const colorMap: Record<string, string> = {
    normal: colors.text,
    muted: colors.textMuted,
    small: colors.textSecondary,
  };

  const sizeMap: Record<string, TextStyle> = {
    normal: { fontSize: 15, lineHeight: 22 },
    muted: { fontSize: 14, lineHeight: 20 },
    small: { fontSize: 12, lineHeight: 18 },
  };

  return (
    <RNText
      style={[
        sizeMap[variant],
        {
          color: color ?? colorMap[variant],
          textAlign: align,
          fontWeight: weight ?? ("400" as const),
        },
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
}
