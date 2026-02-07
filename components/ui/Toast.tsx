import { useTheme } from "@/theme/ThemeProvider";
import createContextHook from "@nkzw/create-context-hook";
import { AlertCircle, CheckCircle, Info, X } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppText from "./AppText";

type ToastType = "success" | "error" | "info";

interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  showToast: (type: ToastType, message: string) => void;
}

export const [ToastProvider, useToast] = createContextHook<ToastContextValue>(
  () => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const showToast = useCallback((type: ToastType, message: string) => {
      const id = Date.now().toString();
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    }, []);

    return {
      showToast,
      _toasts: toasts,
      _setToasts: setToasts,
    } as ToastContextValue & {
      _toasts: ToastMessage[];
      _setToasts: React.Dispatch<React.SetStateAction<ToastMessage[]>>;
    };
  },
);

export function ToastContainer() {
  const ctx = useToast() as ReturnType<typeof useToast> & {
    _toasts?: ToastMessage[];
    _setToasts?: React.Dispatch<React.SetStateAction<ToastMessage[]>>;
  };
  const toasts: ToastMessage[] = (ctx as any)._toasts ?? [];
  const setToasts: React.Dispatch<React.SetStateAction<ToastMessage[]>> =
    (ctx as any)._setToasts ?? (() => {});
  const insets = useSafeAreaInsets();

  if (toasts.length === 0) return null;

  return (
    <View
      style={[styles.toastWrapper, { top: insets.top + 10 }]}
      pointerEvents="box-none"
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={() =>
            setToasts((prev) => prev.filter((t) => t.id !== toast.id))
          }
        />
      ))}
    </View>
  );
}

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastMessage;
  onDismiss: () => void;
}) {
  const { colors } = useTheme();
  const translateY = useRef(new Animated.Value(-60)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -60,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }, 2500);

    return () => clearTimeout(timer);
  }, [translateY, opacity]);

  const iconMap: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle size={20} color={colors.success} />,
    error: <AlertCircle size={20} color={colors.danger} />,
    info: <Info size={20} color={colors.info} />,
  };

  const bgMap: Record<ToastType, string> = {
    success: colors.success + "15",
    error: colors.danger + "15",
    info: colors.info + "15",
  };

  const borderMap: Record<ToastType, string> = {
    success: colors.success + "30",
    error: colors.danger + "30",
    info: colors.info + "30",
  };

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor: colors.surfaceElevated,
          borderColor: borderMap[toast.type],
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <View
        style={[styles.toastIconBg, { backgroundColor: bgMap[toast.type] }]}
      >
        {iconMap[toast.type]}
      </View>
      <AppText weight="500" style={styles.toastText} numberOfLines={2}>
        {toast.message}
      </AppText>
      <TouchableOpacity onPress={onDismiss} hitSlop={8}>
        <X size={16} color={colors.textMuted} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toastWrapper: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 9999,
    gap: 8,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  toastIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  toastText: {
    flex: 1,
    fontSize: 14,
  },
});
