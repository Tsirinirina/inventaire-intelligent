import { useTheme } from "@/theme/ThemeProvider";
import React, { useCallback, useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import AppText from "./AppText";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  testID?: string;
}

export default function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  style,
  testID,
  ...props
}: InputProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;

  const onFocus = useCallback(() => {
    setFocused(true);
    Animated.timing(borderAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [borderAnim]);

  const onBlur = useCallback(() => {
    setFocused(false);
    Animated.timing(borderAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [borderAnim]);

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [error ? colors.danger : colors.inputBorder, colors.primary],
  });

  return (
    <View style={styles.wrapper}>
      {label && (
        <AppText variant="small" weight="600" style={styles.label}>
          {label}
        </AppText>
      )}
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: colors.inputBackground,
            borderColor: borderColor,
          },
        ]}
      >
        {leftIcon && <View style={styles.icon}>{leftIcon}</View>}
        <TextInput
          testID={testID}
          style={[styles.input, { color: colors.inputText }, style]}
          placeholderTextColor={colors.inputPlaceholder}
          onFocus={onFocus}
          onBlur={onBlur}
          {...props}
        />
        {rightIcon && <View style={styles.icon}>{rightIcon}</View>}
      </Animated.View>
      {error && (
        <AppText variant="small" color={colors.danger} style={styles.error}>
          {error}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  label: {
    marginLeft: 4,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    minHeight: 50,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 12,
  },
  icon: {
    marginRight: 10,
  },
  error: {
    marginLeft: 4,
    marginTop: 2,
  },
});
