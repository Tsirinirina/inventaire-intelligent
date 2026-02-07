import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import { ThemeColors, darkTheme, lightTheme } from "./colors";

type ThemeMode = "light" | "dark" | "system";

interface ThemeContext {
  colors: ThemeColors;
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
}

const THEME_KEY = "fintech_theme_mode";

export const [ThemeProvider, useTheme] = createContextHook<ThemeContext>(() => {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>("dark");

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((stored) => {
      if (stored === "light" || stored === "dark" || stored === "system") {
        setModeState(stored);
      }
    });
  }, []);

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    AsyncStorage.setItem(THEME_KEY, newMode);
  }, []);

  const isDark =
    mode === "dark" || (mode === "system" && systemScheme === "dark");

  const colors = isDark ? darkTheme : lightTheme;

  return { colors, mode, isDark, setMode };
});
