import { SearchPickerModal } from "@/components/ui/SearchPickerModal";
import { PRODUCT_BRANDS } from "@/core/constants/brands";
import { useProduct } from "@/core/contexts/ProductContext";
import { NewProduct } from "@/core/entity/product.entity";
import {
  ProductForm,
  productFormDefaultValues,
  productSchema,
} from "@/core/forms/product.form";
import { useTheme } from "@/theme/ThemeProvider";
import { ThemeColors } from "@/theme/colors";
import { zodResolver } from "@hookform/resolvers/zod";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Directory, File, Paths } from "expo-file-system";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Camera, Check, X } from "lucide-react-native";
import { useRef, useState } from "react";
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

export default function AddProductScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { addProduct, productAdding } = useProduct();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: productFormDefaultValues,
  });

  const brandValue = watch("brand");

  const [imageUri, setImageUri] = useState<string | undefined>(undefined);
  const [showCamera, setShowCamera] = useState(false);

  // ── Caméra ──────────────────────────────────────────────────────────
  const handleTakePhoto = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert("Autorisation requise", "Accès à la caméra refusé.");
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
        const imagesDir = new Directory(Paths.document, "product-images");
        if (!imagesDir.exists) imagesDir.create({ intermediates: true });
        const dest = new File(imagesDir, `product-${Date.now()}.jpg`);
        new File(photo.uri).copy(dest);
        setImageUri(dest.uri);
      }
      setShowCamera(false);
    } catch {
      Alert.alert("Erreur", "Impossible de prendre la photo");
    }
  };

  // ── Galerie ──────────────────────────────────────────────────────────
  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      try {
        const imagesDir = new Directory(Paths.document, "product-images");
        if (!imagesDir.exists) imagesDir.create({ intermediates: true });
        const dest = new File(imagesDir, `product-${Date.now()}.jpg`);
        new File(result.assets[0].uri).copy(dest);
        setImageUri(dest.uri);
      } catch {
        Alert.alert("Erreur", "Impossible d'enregistrer l'image");
      }
    }
  };

  const handleImageOptions = () => {
    Alert.alert("Photo du produit", "Choisissez une source", [
      { text: "Caméra", onPress: handleTakePhoto },
      { text: "Galerie", onPress: handlePickImage },
      { text: "Annuler", style: "cancel" },
    ]);
  };

  // ── Submit ───────────────────────────────────────────────────────────
  const onSubmit = async (data: ProductForm) => {
    try {
      const product: NewProduct = {
        ...data,
        name: data.name.trim(),
        brand: data.brand.trim(),
        category: "smartphone",
        basePrice: Number(data.basePrice),
        quantity: Number(data.quantity),
        description: data.description?.trim() as any,
        createdAt: new Date().toISOString(),
        stockUpdatedAt: new Date().toISOString(),
        imageUri,
      };
      await addProduct(product);
      router.back();
    } catch {
      Alert.alert("Erreur", "Impossible d'ajouter le produit");
    }
  };

  const styles = createStyles(colors);

  // ── Vue caméra plein écran ───────────────────────────────────────────
  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView ref={cameraRef} style={styles.camera} facing="back">
          {/* Contrôles */}
          <View style={styles.cameraControls}>
            <Pressable
              style={styles.cameraButton}
              onPress={() => setShowCamera(false)}
            >
              <X size={24} color="#fff" />
            </Pressable>
            <Pressable
              style={styles.captureButton}
              onPress={handleCapturePhoto}
            >
              <View style={styles.captureButtonInner} />
            </Pressable>
            <View style={styles.cameraButton} />
          </View>
        </CameraView>
      </View>
    );
  }

  // ── Formulaire ───────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={150}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Section image */}
        <Pressable style={styles.imageArea} onPress={handleImageOptions}>
          {imageUri ? (
            <>
              <Image
                source={{ uri: imageUri }}
                style={styles.imagePreview}
                contentFit="cover"
              />
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
              <Text style={styles.imagePlaceholderTitle}>
                Ajouter une photo
              </Text>
              <Text style={styles.imagePlaceholderSub}>Caméra · Galerie</Text>
            </View>
          )}
        </Pressable>

        {/* Formulaire */}
        <View style={styles.form}>
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nom du produit *</Text>
                <TextInput
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  style={styles.input}
                  placeholder="Ex: Samsung Galaxy A54"
                  placeholderTextColor={colors.inputPlaceholder}
                />
                {errors.name && (
                  <Text style={styles.error}>{errors.name.message}</Text>
                )}
              </View>
            )}
          />

          <SearchPickerModal
            label="Marque *"
            placeholder="Sélectionnez une marque"
            value={brandValue}
            options={[...PRODUCT_BRANDS]}
            onSelect={(val) => setValue("brand", val as any)}
            error={errors.brand?.message}
          />

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
                  placeholder="Description du produit"
                  placeholderTextColor={colors.inputPlaceholder}
                  multiline
                  numberOfLines={4}
                />
              </View>
            )}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={[styles.saveButton, productAdding && styles.buttonDisabled]}
          onPress={handleSubmit(onSubmit)}
          disabled={productAdding}
        >
          {productAdding ? (
            <ActivityIndicator color={colors.textInverse} />
          ) : (
            <>
              <Check size={20} color={colors.textInverse} />
              <Text style={styles.saveButtonText}>Enregistrer le produit</Text>
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
    scrollContent: {
      paddingBottom: 20,
    },

    // ── Section image ──
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

    // ── Caméra ──
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

    // ── Formulaire ──
    form: {
      padding: 20,
      gap: 20,
    },
    inputGroup: {
      gap: 8,
    },
    label: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.text,
    },
    input: {
      backgroundColor: colors.inputBackground,
      borderRadius: 10,
      paddingHorizontal: 16,
      paddingVertical: 16,
      fontSize: 16,
      color: colors.inputText,
      borderWidth: 1,
      borderColor: colors.inputBorder,
    },
    textArea: {
      height: 100,
      paddingTop: 14,
      textAlignVertical: "top",
    },
    row: {
      flexDirection: "row",
      gap: 12,
    },
    flex1: {
      flex: 1,
    },
    error: {
      fontSize: 13,
      color: colors.danger,
    },

    // ── Footer ──
    footer: {
      padding: 16,
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    saveButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
      paddingVertical: 16,
      borderRadius: 14,
      gap: 8,
    },
    saveButtonText: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.textInverse,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
  });
