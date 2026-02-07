export const palette = {
  emerald: "#00D09E",
  emeraldDark: "#00A87D",
  navy: "#0A0E1A",
  navyLight: "#141B2D",
  cardDark: "#1A2138",
  blue: "#5B7BF5",
  blueLight: "#8DA4FF",
  purple: "#9B6DFF",
  red: "#FF5A65",
  orange: "#FFB347",
  yellow: "#FFD93D",
  white: "#FFFFFF",
  gray50: "#F8FAFC",
  gray100: "#F1F5F9",
  gray200: "#E2E8F0",
  gray300: "#CBD5E1",
  gray400: "#94A3B8",
  gray500: "#64748B",
  gray600: "#475569",
  gray700: "#334155",
  gray800: "#1E293B",
  gray900: "#0F172A",
};

export interface ThemeColors {
  primary: string;
  primaryDark: string;
  accent: string;
  accentLight: string;
  background: string;
  surface: string;
  surfaceElevated: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  border: string;
  success: string;
  danger: string;
  warning: string;
  info: string;
  tabBar: string;
  tabBarBorder: string;
  tabActive: string;
  tabInactive: string;
  inputBackground: string;
  inputBorder: string;
  inputText: string;
  inputPlaceholder: string;
  cardGradientStart: string;
  cardGradientEnd: string;
  shadow: string;
}

export const darkTheme: ThemeColors = {
  primary: palette.emerald,
  primaryDark: palette.emeraldDark,
  accent: palette.blue,
  accentLight: palette.blueLight,
  background: palette.navy,
  surface: palette.navyLight,
  surfaceElevated: palette.cardDark,
  text: palette.white,
  textSecondary: palette.gray300,
  textMuted: palette.gray500,
  textInverse: palette.navy,
  border: "rgba(255,255,255,0.08)",
  success: palette.emerald,
  danger: palette.red,
  warning: palette.orange,
  info: palette.blue,
  tabBar: palette.navyLight,
  tabBarBorder: "rgba(255,255,255,0.06)",
  tabActive: palette.emerald,
  tabInactive: palette.gray500,
  inputBackground: palette.cardDark,
  inputBorder: "rgba(255,255,255,0.1)",
  inputText: palette.white,
  inputPlaceholder: palette.gray500,
  cardGradientStart: "#00D09E",
  cardGradientEnd: "#5B7BF5",
  shadow: "rgba(0,0,0,0.4)",
};

export const lightTheme: ThemeColors = {
  primary: palette.emeraldDark,
  primaryDark: "#008F6B",
  accent: palette.blue,
  accentLight: palette.blueLight,
  background: palette.gray50,
  surface: palette.white,
  surfaceElevated: palette.white,
  text: palette.gray900,
  textSecondary: palette.gray600,
  textMuted: palette.gray400,
  textInverse: palette.white,
  border: palette.gray200,
  success: palette.emeraldDark,
  danger: palette.red,
  warning: palette.orange,
  info: palette.blue,
  tabBar: palette.white,
  tabBarBorder: palette.gray200,
  tabActive: palette.emeraldDark,
  tabInactive: palette.gray400,
  inputBackground: palette.gray100,
  inputBorder: palette.gray200,
  inputText: palette.gray900,
  inputPlaceholder: palette.gray400,
  cardGradientStart: "#00A87D",
  cardGradientEnd: "#5B7BF5",
  shadow: "rgba(0,0,0,0.08)",
};
