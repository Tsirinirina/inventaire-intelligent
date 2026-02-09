import { CameraView, useCameraPermissions } from "expo-camera";
import ExpoMlkitOcr from "expo-mlkit-ocr";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function DashboardScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [recognizedText, setRecognizedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  // Debug pour voir si les permissions changent
  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  // 1. Pendant le chargement des permissions
  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // 2. Si la permission est refusée
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={{ textAlign: "center", marginBottom: 20 }}>
          Nous avons besoin de la caméra pour scanner les nombres.
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonTextBlack}>Accorder la permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const scanImage = async () => {
    if (cameraRef.current && !isProcessing) {
      try {
        setIsProcessing(true);

        // Capture
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.5,
          skipProcessing: true, // Accélère la capture
        });

        // OCR - Utilisation de detectFromUri !!!
        const result = await ExpoMlkitOcr.recognizeText(photo.uri);
        console.log("RESULT=", result);

        if (result.text) {
          const numbersOnly = result.text.replace(/[^0-9]/g, "");

          console.log("NUMBER = ", numbersOnly);

          if (numbersOnly) setRecognizedText(numbersOnly);
        }
      } catch (error) {
        console.error("Erreur OCR:", error);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} ref={cameraRef}>
        <View style={styles.overlay}>
          <View style={styles.resultBox}>
            <Text style={styles.resultText}>
              {isProcessing ? "Analyse..." : `Chiffres : ${recognizedText}`}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.button, isProcessing && { opacity: 0.5 }]}
            onPress={scanImage}
            disabled={isProcessing}
          >
            <Text style={styles.buttonTextBlack}>SCANNER</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  camera: { flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 40,
  },
  resultBox: {
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#fff",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
  },
  buttonTextBlack: { color: "#000", fontSize: 18, fontWeight: "bold" },
  resultText: { color: "white", fontSize: 20, fontWeight: "bold" },
});
