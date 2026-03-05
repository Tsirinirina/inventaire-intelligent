import { useTheme } from "@/theme/ThemeProvider";
import { ThemeColors } from "@/theme/colors";
import React, { useMemo, useRef } from "react";
import { Control, Controller, FieldErrors } from "react-hook-form";
import {
  NativeSyntheticEvent,
  StyleSheet,
  TextInput,
  TextInputKeyPressEventData,
  View,
} from "react-native";

// ── Types ────────────────────────────────────────────────────────────────────

interface OtpInputProps {
  control: Control<any>;
  name: string;
  errors: FieldErrors;
  length?: number; // nombre de cellules, 6 par défaut
}

// ── Component ────────────────────────────────────────────────────────────────

const OtpInput: React.FC<OtpInputProps> = ({
  control,
  name,
  errors,
  length = 6,
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const inputRefs = useRef<(TextInput | null)[]>([]);
  const hasError = !!errors[name];

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value = "" } }) => {
        const digits: string[] = Array.from(
          { length },
          (_, i) => value[i] ?? "",
        );

        const handleChange = (text: string, index: number) => {
          const digit = text.replace(/[^0-9]/g, "").slice(-1);
          const newValue = digits
            .map((d, i) => (i === index ? digit : d))
            .join("");
          onChange(newValue);

          if (digit && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
          }
        };

        const handleKeyPress = (
          e: NativeSyntheticEvent<TextInputKeyPressEventData>,
          index: number,
        ) => {
          if (e.nativeEvent.key === "Backspace") {
            if (!digits[index] && index > 0) {
              const newValue = digits
                .map((d, i) => (i === index - 1 ? "" : d))
                .join("");
              onChange(newValue);
              inputRefs.current[index - 1]?.focus();
            } else {
              const newValue = digits
                .map((d, i) => (i === index ? "" : d))
                .join("");
              onChange(newValue);
            }
          }
        };

        return (
          <View style={styles.otpContainer}>
            {digits.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                style={[
                  styles.input,
                  styles.otpCell,
                  hasError && styles.inputError,
                  digit ? styles.otpCellFilled : null,
                ]}
                value={digit}
                onChangeText={(text) => handleChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                textContentType="oneTimeCode"
                autoComplete={index === 0 ? "sms-otp" : "off"}
                placeholder="·"
                placeholderTextColor={colors.inputPlaceholder}
                selectionColor={colors.inputBorder}
              />
            ))}
          </View>
        );
      }}
    />
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    // ← Mêmes styles que vos autres inputs
    input: {
      height: 50,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 8,
      paddingHorizontal: 12,
      backgroundColor: colors.inputBackground,
      color: colors.inputText,
      fontSize: 16,
    },
    inputError: {
      borderColor: colors.inputBorder,
    },

    // ← Styles spécifiques OTP
    otpContainer: {
      flexDirection: "row",
      gap: 10,
      justifyContent: "center",
      marginBottom: 15,
      marginTop: 10,
    },
    otpCell: {
      width: 90,
      paddingHorizontal: 0,
      textAlign: "center",
      fontSize: 20,
      fontWeight: "600",
    },
    otpCellFilled: {
      borderColor: colors.inputBorder,
    },
  });

export default OtpInput;
