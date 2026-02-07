import { useTheme } from "@/theme/ThemeProvider";
import React from "react";
import { Text as RNText, TextProps, TextStyle } from "react-native";

interface TitleProps extends TextProps {
  variant?: "h1" | "h2" | "h3";
  color?: string;
  align?: "left" | "center" | "right";
}

export default function Title({
  variant = "h1",
  color,
  align = "left",
  style,
  children,
  ...props
}: TitleProps) {
  const { colors } = useTheme();

  const variantStyles: Record<string, TextStyle> = {
    h1: { fontSize: 28, fontWeight: "800" as const, letterSpacing: -0.5 },
    h2: { fontSize: 22, fontWeight: "700" as const, letterSpacing: -0.3 },
    h3: { fontSize: 18, fontWeight: "600" as const, letterSpacing: -0.2 },
  };

  return (
    <RNText
      style={[
        variantStyles[variant],
        { color: color ?? colors.text, textAlign: align },
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
}
