import { PRODUCT_BRANDS } from "@/constants/brands";
import { PRODUCT_CATEGORIES } from "@/constants/categories";
import { useInventory } from "@/contexts/InventoryContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Directory, File, Paths } from "expo-file-system";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Camera, Check, Image as ImageIcon, X } from "lucide-react-native";
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
import { DropdownSelect } from "react-native-input-select"; // 🚀
import { z } from "zod";
import type { NewProduct } from "../../../types/inventory";

const schema = z.object({
  name: z.string().min(1, "Le nom du produit est requis"),
  brand: z.string().min(1, "La marque est requise"),
  category: z.string().min(1, "La catégorie est requise"),
  price: z
    .string()
    .min(1, "Prix requis")
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Prix invalide"),
  quantity: z
    .string()
    .min(1, "Quantité requise")
    .refine((v) => !isNaN(Number(v)) && Number(v) >= 0, "Quantité invalide"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function AddProductScreen() {
  const router = useRouter();
  const { addProduct, isAddingProduct } = useInventory();
  const [showBrandPicker, setShowBrandPicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      brand: "",
      category: "",
      price: "",
      quantity: "",
      description: "",
    },
  });

  const [imageUri, setImageUri] = useState<string | undefined>(undefined);
  const [showCamera, setShowCamera] = useState(false);

  const brand = watch("brand");
  const category = watch("category");

  const handleTakePhoto = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert(
          "Autorisation requise",
          "L'autorisation de prendre des photos est requise."
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
        const imagesDir = new Directory(Paths.document, "product-images");
        if (!imagesDir.exists) {
          imagesDir.create({ intermediates: true });
        }

        const filename = `product-${Date.now()}.jpg`;
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
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      try {
        const imagesDir = new Directory(Paths.document, "product-images");
        if (!imagesDir.exists) {
          imagesDir.create({ intermediates: true });
        }

        const filename = `product-${Date.now()}.jpg`;
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

  const onSubmit = async (data: FormValues) => {
    try {
      const product: NewProduct = {
        ...data,
        name: data.name.trim(),
        brand: data.brand.trim(),
        category: data.category as any,
        price: Number(data.price),
        quantity: Number(data.quantity),
        description: data.description?.trim() as any,
        dateAdded: new Date().toISOString(),
        imageUri,
      };

      await addProduct(product);
      router.back();
    } catch (error) {
      console.error("Error adding product:", error);
      Alert.alert("Erreur", "Impossible d'ajouter le produit");
    }
  };

  if (showCamera) {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.cameraContainer}>
          <CameraView ref={cameraRef} style={styles.camera} facing="back">
            <View style={styles.cameraControls}>
              <Pressable
                style={styles.cameraButton}
                onPress={() => setShowCamera(false)}
              >
                <X size={24} color="#FFF" />
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
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* IMAGE SECTION */}
        <View style={styles.imageSection}>
          {imageUri ? (
            <View>
              <Image source={{ uri: imageUri }} style={styles.productImage} />
              <Pressable
                style={styles.removeImageButton}
                onPress={() => setImageUri(undefined)}
              >
                <X size={16} color="#FFF" />
              </Pressable>
            </View>
          ) : (
            <View style={styles.imagePlaceholder}>
              <ImageIcon size={40} color="#999" />
              <Text style={styles.imagePlaceholderText}>Aucune image</Text>
            </View>
          )}

          <View style={styles.imageButtons}>
            <Pressable style={styles.imageButton} onPress={handleTakePhoto}>
              <Camera size={20} color="#007AFF" />
              <Text style={styles.imageButtonText}>Caméra</Text>
            </Pressable>

            <Pressable style={styles.imageButton} onPress={handlePickImage}>
              <ImageIcon size={20} color="#007AFF" />
              <Text style={styles.imageButtonText}>Galerie</Text>
            </Pressable>
          </View>
        </View>

        {/* FORM */}
        <View style={styles.form}>
          {/* NAME */}
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
                  placeholder="Ex: Samsung A54"
                  placeholderTextColor="#999"
                />
                {errors.name && (
                  <Text style={styles.error}>{errors.name.message}</Text>
                )}
              </View>
            )}
          />

          {/* BRAND SELECT */}
          <View style={styles.inputGroup}>
            <Controller
              control={control}
              name="brand"
              render={({ field, fieldState }) => (
                <DropdownSelect
                  label="Marque *"
                  labelStyle={styles.label}
                  dropdownStyle={styles.inputSelect}
                  placeholderStyle={styles.inputPlaceholder}
                  placeholder="Sélectionnez une marque"
                  selectedValue={field.value}
                  onValueChange={(value) => setValue("brand", value as any)}
                  options={PRODUCT_BRANDS.map((b) => ({
                    label: b,
                    value: b,
                  }))}
                />
              )}
            />

            {errors.brand && (
              <Text style={styles.error}>{errors.brand.message}</Text>
            )}
          </View>

          {/* CATEGORY SELECT NEW  */}
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
                  options={PRODUCT_CATEGORIES.map((c) => ({
                    label: c,
                    value: c,
                  }))}
                />
              )}
            />

            {errors.category && (
              <Text style={styles.error}>{errors.category.message}</Text>
            )}
          </View>

          {/* PRICE + QUANTITY */}
          <View style={styles.row}>
            <Controller
              control={control}
              name="price"
              render={({ field }) => (
                <View style={[styles.inputGroup, styles.flex1]}>
                  <Text style={styles.label}>Prix *</Text>
                  <TextInput
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    style={styles.input}
                    keyboardType="decimal-pad"
                    placeholder="0"
                    placeholderTextColor="#999"
                  />
                  {errors.price && (
                    <Text style={styles.error}>{errors.price.message}</Text>
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
                    placeholderTextColor="#999"
                  />
                  {errors.quantity && (
                    <Text style={styles.error}>{errors.quantity.message}</Text>
                  )}
                </View>
              )}
            />
          </View>

          {/* DESCRIPTION */}
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
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={5}
                />
              </View>
            )}
          />
        </View>
      </ScrollView>

      {/* SAVE BUTTON */}
      <View style={styles.footer}>
        <Pressable
          style={[
            styles.button,
            styles.saveButton,
            isAddingProduct && styles.buttonDisabled,
          ]}
          onPress={handleSubmit(onSubmit)}
          disabled={isAddingProduct}
        >
          {isAddingProduct ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Check size={20} color="#FFF" />
              <Text style={styles.saveButtonText}>Enregistrer le produit</Text>
            </>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F7",
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
    position: "absolute" as const,
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingHorizontal: 40,
  },
  cameraButton: {
    width: 60,
    height: 60,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFF",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    borderWidth: 4,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  captureButtonInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "#FFF",
  },
  imageSection: {
    backgroundColor: "#FFF",
    padding: 20,
    alignItems: "center" as const,
  },
  productImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  removeImageButton: {
    position: "absolute" as const,
    top: 8,
    right: 8,
    backgroundColor: "#FF3B30",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  imagePlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: "#F5F5F7",
    borderRadius: 12,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    gap: 8,
  },
  imagePlaceholderText: {
    fontSize: 14,
    color: "#999",
  },
  imageButtons: {
    flexDirection: "row" as const,
    gap: 12,
    marginTop: 16,
  },
  imageButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#F5F5F7",
    borderRadius: 8,
  },
  imageButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#007AFF",
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
    color: "#000",
  },
  input: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 20,
    fontSize: 16,
    color: "#000",
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  inputSelect: {
    backgroundColor: "#FFF",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#000",
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  inputText: {
    fontSize: 16,
    color: "#000",
  },
  inputPlaceholder: {
    fontSize: 16,
    color: "#999",
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
    backgroundColor: "#FFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  brandOption: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F7",
  },
  brandOptionText: {
    fontSize: 16,
    color: "#000",
  },
  footer: {
    position: "absolute" as const,
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E5EA",
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
    backgroundColor: "#007AFF",
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: "#FFF",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  error: {
    fontSize: 14,
    color: "#FF3B30",
  },
  picker: {},
  pickerOption: {},
  pickerOptionText: {},
});
// const handleSave = async () => {
//   if (!name.trim()) {
//     Alert.alert("Erreur de validation", "Veuillez saisir le nom du produit");
//     return;
//   }
//   if (!brand.trim()) {
//     Alert.alert("Validation Error", "Veuillez sélectionner une marque");
//     return;
//   }
//   if (!category.trim()) {
//     Alert.alert(
//       "Erreur de validation",
//       "Veuillez sélectionner une catégorie"
//     );
//     return;
//   }
//   if (!price.trim() || isNaN(Number(price)) || Number(price) <= 0) {
//     Alert.alert("Validation Error", "Veuillez saisir un prix valide");
//     return;
//   }
//   if (!quantity.trim() || isNaN(Number(quantity)) || Number(quantity) < 0) {
//     Alert.alert("Validation Error", "Veuillez saisir une quantité valide");
//     return;
//   }

//   try {
//     const product: NewProduct = {
//       name: name.trim(),
//       brand: brand.trim(),
//       price: Number(price),
//       category: category.trim() as any,
//       description: description.trim(),
//       quantity: Number(quantity),
//       dateAdded: new Date().toISOString(),
//       imageUri,
//     };

//     await addProduct(product);
//     router.back();
//   } catch (error) {
//     console.error("Error adding product:", error);
//     Alert.alert("Erreur", "Impossible d'ajouter le produit");
//   }
// };
