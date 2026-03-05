import * as ImageManipulator from "expo-image-manipulator";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Button,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Tesseract from "tesseract.js";

export default function OcrProcessor({ image }: any) {
  const [loading, setLoading] = useState(false);
  const [numbers, setNumbers] = useState("");

  const processImage = async () => {
    if (!image) return;

    setLoading(true);
    setNumbers("");

    try {
      // 🔹 Amélioration image (resize + grayscale)
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        image,
        [{ resize: { width: 800 } }],
        { compress: 1, format: ImageManipulator.SaveFormat.JPEG },
      );

      // 🔹 OCR optimisé chiffres uniquement
      const {
        data: { text },
      } = await Tesseract.recognize(manipulatedImage.uri, "eng", {});

      // 🔹 Filtrer uniquement chiffres
      const numbersOnly = text.replace(/[^0-9]/g, "");

      setNumbers(numbersOnly);
    } catch (error) {
      console.log(error);
    }

    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Button title="Scanner les chiffres" onPress={processImage} />

      {loading && <ActivityIndicator size="large" style={{ marginTop: 20 }} />}

      {!loading && numbers !== "" && (
        <Text style={styles.result}>Résultat : {numbers}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", marginTop: 20 },
  result: {
    marginTop: 20,
    fontSize: 20,
    fontWeight: "bold",
    color: "green",
  },
});
