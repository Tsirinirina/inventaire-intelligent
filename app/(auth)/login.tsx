import { useAuth } from "@/core/contexts/AuthContext";
import {
  LoginForm,
  loginFormDefaultValues,
  loginSchema,
} from "@/core/forms/login.form";
import { useTheme } from "@/theme/ThemeProvider";
import { ThemeColors } from "@/theme/colors";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMemo } from "react";

export default function LoginScreen() {
  const { login, loginError, loginLoading } = useAuth();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginForm>({
    mode: "onChange",
    resolver: zodResolver(loginSchema),
    defaultValues: loginFormDefaultValues,
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.name.trim(), data.passcode);
      router.replace("/(tabs)/dashboard");
    } catch (error) {
      console.log("Erreur login :", error);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Connexion</Text>
            <Text style={styles.subtitle}>Accédez à votre espace vendeur</Text>
          </View>

          <View style={styles.card}>
            {/* NAME */}
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, errors.name && styles.inputError]}
                  placeholder="Nom du vendeur"
                  placeholderTextColor={colors.inputPlaceholder}
                  autoCapitalize="none"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            {errors.name && (
              <Text style={styles.errorText}>{errors.name.message}</Text>
            )}

            {/* PASSCODE */}
            <Controller
              control={control}
              name="passcode"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, errors.passcode && styles.inputError]}
                  placeholder="Code secret"
                  placeholderTextColor={colors.inputPlaceholder}
                  secureTextEntry
                  keyboardType="number-pad"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            {errors.passcode && (
              <Text style={styles.errorText}>{errors.passcode.message}</Text>
            )}

            {/* LOGIN ERROR */}
            {loginError && (
              <Text style={styles.serverError}>Nom ou code incorrect</Text>
            )}

            <TouchableOpacity
              style={[
                styles.button,
                (!isValid || loginLoading) && styles.buttonDisabled,
              ]}
              onPress={handleSubmit(onSubmit)}
              disabled={!isValid || loginLoading}
            >
              <Text style={styles.buttonText}>
                {loginLoading ? "Connexion..." : "Se connecter"}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.footer}>
            © {new Date().getFullYear()} · Inventory App
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flexGrow: 1,
      justifyContent: "center",
      padding: 24,
    },
    header: {
      marginBottom: 32,
    },
    title: {
      fontSize: 28,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 24,
      shadowColor: colors.shadow,
      shadowOpacity: 0.06,
      shadowRadius: 10,
      elevation: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },
    input: {
      height: 52,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      paddingHorizontal: 16,
      fontSize: 16,
      marginBottom: 16,
      color: colors.inputText,
      backgroundColor: colors.inputBackground,
    },
    button: {
      height: 52,
      borderRadius: 12,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 8,
    },
    buttonText: {
      color: colors.textInverse,
      fontSize: 16,
      fontWeight: "600",
    },
    inputError: {
      borderColor: colors.danger,
    },
    errorText: {
      color: colors.danger,
      fontSize: 13,
      marginBottom: 8,
      marginTop: -8,
    },
    serverError: {
      color: colors.danger,
      fontSize: 14,
      textAlign: "center",
      marginVertical: 8,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    footer: {
      textAlign: "center",
      marginTop: 32,
      fontSize: 12,
      color: colors.textMuted,
    },
  });
