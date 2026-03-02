import { ACCESSORY_CATEGORIES } from "@/core/constants/categories";
import { useAccessory } from "@/core/contexts/AccessoryContext";
import { NewAccessory } from "@/core/entity/accessory.entity";
import {
  AccessoryForm,
  accessoryFormDefaultValues,
  accessorySchema,
} from "@/core/forms/accessory.form";
import { ThemeColors } from "@/theme/colors";
import { useTheme } from "@/theme/ThemeProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Directory, File, Paths } from "expo-file-system";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Camera, Check, Image as ImageIcon, X } from "lucide-react-native";
import { useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import DropdownSelect from "react-native-input-select";
import { capitalizeWords } from "../../../../core/utils/capitalize.utils";

export default function AddAccessoryScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const { addAccessory, accessoryAdding, accessoryAddingError } =
    useAccessory();

  const [imageUri, setImageUri] = useState<string | undefined>(undefined);
  const [showCamera, setShowCamera] = useState(false);

  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AccessoryForm>({
    resolver: zodResolver(accessorySchema),
    defaultValues: accessoryFormDefaultValues,
  });

  const handleTakePhoto = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert(
          "Autorisation requise",
          "L'autorisation de prendre des photos est requise.",
        );
        return;
      }
    }
    setShowCamera(true);
  };

  const handleCapturePhoto = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync();
      if (photo?.uri) {
        const imagesDir = new Directory(Paths.document, "accessory-images");
        if (!imagesDir.exists) {
          imagesDir.create({ intermediates: true });
        }

        const filename = `accessory-${Date.now()}.jpg`;
        const destination = new File(imagesDir, filename);
        const sourceFile = new File(photo.uri);
        sourceFile.copy(destination);

        setImageUri(destination.uri);
      }
      setShowCamera(false);
    } catch (error) {
      console.error("Erreur lors de la prise de la photo:", error);
      Alert.alert("Error", "Impossible de prendre la photo");
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]) {
      try {
        const imagesDir = new Directory(Paths.document, "accessory-images");
        if (!imagesDir.exists) {
          imagesDir.create({ intermediates: true });
        }

        const filename = `accessory-${Date.now()}.jpg`;
        const destination = new File(imagesDir, filename);
        const sourceFile = new File(result.assets[0].uri);
        sourceFile.copy(destination);

        setImageUri(destination.uri);
      } catch (error) {
        console.error("Erreur lors de l'enregistrement de l'image:", error);
        Alert.alert("Erreur", "Impossible d'enregistrer l'image");
      }
    }
  };

  const onSubmit = async (data: AccessoryForm) => {
    try {
      const newAccessory: NewAccessory = {
        name: data.name.trim(),
        basePrice: Number(data.basePrice),
        category: data.category.trim() as any,
        description: data.description,
        quantity: Number(data.quantity),
        createdAt: new Date().toISOString(),
        imageUri,
        stockUpdatedAt: new Date().toISOString(),
      };

      await addAccessory(newAccessory);
      router.back();
    } catch (error) {
      console.error("Error adding product:", error);
      Alert.alert("Erreur", "Impossible d'ajouter l'accessoire");
    }
  };

  const handleImageOptions = () => {
    Alert.alert("Photo de l'accessoire", "Choisissez une source", [
      { text: "Caméra", onPress: handleTakePhoto },
      { text: "Galerie", onPress: handlePickImage },
      { text: "Annuler", style: "cancel" },
    ]);
  };

  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView ref={cameraRef} style={styles.camera} facing="back">
          <View style={styles.cameraControls}>
            <Pressable style={styles.cameraButton} onPress={() => setShowCamera(false)}>
              <X size={24} color="#fff" />
            </Pressable>
            <Pressable style={styles.captureButton} onPress={handleCapturePhoto}>
              <View style={styles.captureButtonInner} />
            </Pressable>
            <View style={styles.cameraButton} />
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <Pressable style={styles.imageArea} onPress={handleImageOptions}>
          {imageUri ? (
            <>
              <Image source={{ uri: imageUri }} style={styles.imagePreview} contentFit="cover" />
              <Pressable
                style={styles.removeImageButton}
                onPress={() => setImageUri(undefined)}
                hitSlop={8}
              >
                <X size={15} color="#fff" />
              </Pressable>
              <View style={styles.imageEditBadge}>
                <Camera size={13} color="#fff" />
                <Text style={styles.imageEditText}>Modifier</Text>
              </View>
            </>
          ) : (
            <View style={styles.imagePlaceholder}>
              <View style={styles.imagePlaceholderIcon}>
                <Camera size={30} color={colors.primary} />
              </View>
              <Text style={styles.imagePlaceholderTitle}>Ajouter une photo</Text>
              <Text style={styles.imagePlaceholderSub}>Caméra · Galerie</Text>
            </View>
          )}
        </Pressable>

        <View style={styles.form}>
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nom de l&apos;accessoire *</Text>
                <TextInput
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  style={styles.input}
                  placeholder="Ex: Chargeur Type C 33W"
                  placeholderTextColor={colors.inputPlaceholder}
                />
                {errors.name && (
                  <Text style={styles.error}>{errors.name.message}</Text>
                )}
              </View>
            )}
          />

          <View style={styles.inputGroup}>
            <Controller
              control={control}
              name="category"
              render={({ field, fieldState }) => (
                <DropdownSelect
                  label="Catégorie *"
                  labelStyle={styles.label}
                  dropdownStyle={styles.inputSelect}
                  placeholderStyle={styles.inputPlaceholder}
                  placeholder="Sélectionnez une catégorie"
                  selectedValue={field.value}
                  onValueChange={(value) => setValue("category", value as any)}
                  options={ACCESSORY_CATEGORIES.map((c) => ({
                    label: capitalizeWords(c),
                    value: c,
                  }))}
                />
              )}
            />
            {errors.category && (
              <Text style={styles.error}>{errors.category.message}</Text>
            )}
          </View>

          <View style={styles.row}>
            <Controller
              control={control}
              name="basePrice"
              render={({ field }) => (
                <View style={[styles.inputGroup, styles.flex1]}>
                  <Text style={styles.label}>Prix de base *</Text>
                  <TextInput
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    style={styles.input}
                    keyboardType="decimal-pad"
                    placeholder="0"
                    placeholderTextColor={colors.inputPlaceholder}
                  />
                  {errors.basePrice && (
                    <Text style={styles.error}>{errors.basePrice.message}</Text>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="quantity"
              render={({ field }) => (
                <View style={[styles.inputGroup, styles.flex1]}>
                  <Text style={styles.label}>Quantité *</Text>
                  <TextInput
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    style={styles.input}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor={colors.inputPlaceholder}
                  />
                  {errors.quantity && (
                    <Text style={styles.error}>{errors.quantity.message}</Text>
                  )}
                </View>
              )}
            />
          </View>

          <Controller
            control={control}
            name="description"
            render={({ field }) => (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  style={[styles.input, styles.textArea]}
                  placeholder="Description"
                  placeholderTextColor={colors.inputPlaceholder}
                  multiline
                  numberOfLines={5}
                />
              </View>
            )}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={[
            styles.button,
            styles.saveButton,
            accessoryAdding && styles.buttonDisabled,
          ]}
          onPress={handleSubmit(onSubmit)}
          disabled={accessoryAdding}
        >
          {accessoryAdding ? (
            <ActivityIndicator color={colors.textInverse} />
          ) : (
            <>
              <Check size={20} color={colors.textInverse} />
              <Text style={styles.saveButtonText}>
                Enregistrer l&lsquo;accessoire
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 100,
    },
    cameraContainer: {
      flex: 1,
      backgroundColor: "#000",
    },
    camera: {
      flex: 1,
    },
    cameraControls: {
      position: "absolute",
      bottom: 48,
      left: 0,
      right: 0,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 40,
    },
    cameraButton: {
      width: 56,
      height: 56,
      justifyContent: "center",
      alignItems: "center",
    },
    captureButton: {
      width: 76,
      height: 76,
      borderRadius: 38,
      backgroundColor: "rgba(255,255,255,0.25)",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 3,
      borderColor: "rgba(255,255,255,0.6)",
    },
    captureButtonInner: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: "#fff",
    },
    imageArea: {
      width: "100%",
      aspectRatio: 4 / 3,
      backgroundColor: colors.surfaceElevated,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      overflow: "hidden",
    },
    imagePreview: {
      width: "100%",
      height: "100%",
    },
    removeImageButton: {
      position: "absolute",
      top: 12,
      right: 12,
      backgroundColor: colors.danger,
      width: 30,
      height: 30,
      borderRadius: 15,
      justifyContent: "center",
      alignItems: "center",
    },
    imageEditBadge: {
      position: "absolute",
      bottom: 12,
      right: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      backgroundColor: "rgba(0,0,0,0.55)",
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 20,
    },
    imageEditText: {
      color: "#fff",
      fontSize: 12,
      fontWeight: "600",
    },
    imagePlaceholder: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
    },
    imagePlaceholderIcon: {
      width: 64,
      height: 64,
      borderRadius: 20,
      backgroundColor: colors.primary + "1A",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 4,
    },
    imagePlaceholderTitle: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.textSecondary,
    },
    imagePlaceholderSub: {
      fontSize: 13,
      color: colors.textMuted,
    },
    form: {
      padding: 20,
      gap: 20,
    },
    inputGroup: {
      gap: 8,
    },
    label: {
      fontSize: 15,
      fontWeight: "600" as const,
      color: colors.text,
    },
    input: {
      backgroundColor: colors.surface,
      borderRadius: 10,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: colors.inputText,
      borderWidth: 1,
      borderColor: colors.inputBorder,
    },
    inputText: {
      fontSize: 16,
      color: colors.inputText,
    },
    inputPlaceholder: {
      fontSize: 16,
      color: colors.inputPlaceholder,
    },
    textArea: {
      height: 100,
      paddingTop: 14,
    },
    row: {
      flexDirection: "row" as const,
      gap: 12,
    },
    flex1: {
      flex: 1,
    },
    brandPicker: {
      maxHeight: 200,
      backgroundColor: colors.surface,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.inputBorder,
    },
    inputSelect: {
      backgroundColor: colors.inputBackground,
      borderRadius: 10,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: colors.inputText,
      borderWidth: 1,
      borderColor: colors.inputBorder,
    },
    brandOption: {
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    brandOptionText: {
      fontSize: 16,
      color: colors.text,
    },
    footer: {
      position: "absolute" as const,
      bottom: 0,
      left: 0,
      right: 0,
      padding: 20,
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    button: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      justifyContent: "center" as const,
      paddingVertical: 16,
      borderRadius: 12,
      gap: 8,
    },
    saveButton: {
      backgroundColor: colors.primary,
    },
    saveButtonText: {
      fontSize: 17,
      fontWeight: "600" as const,
      color: colors.textInverse,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    error: {
      fontSize: 14,
      color: colors.danger,
    },
  });
