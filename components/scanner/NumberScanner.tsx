import MaskedView from "@react-native-masked-view/masked-view";
import { CameraView, useCameraPermissions } from "expo-camera";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Tesseract from "tesseract.js";

interface NumberScannerProps {
  onScan: (value: string) => void;
  onClose: () => void;
}

export default function NumberScanner({ onScan, onClose }: NumberScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  if (!permission)
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text>Permission caméra requise</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text>Autoriser</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onClose}>
          <Text style={{ marginTop: 20 }}>Annuler</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleCapture = async () => {
    if (cameraRef.current && !isProcessing) {
      try {
        setIsProcessing(true);
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.5,
          skipProcessing: true,
        });

        const result = await Tesseract.recognize(photo.uri);

        if (result.data.text) {
          const numbersOnly = result.data.text.replace(/[^0-9]/g, "");

          if (numbersOnly) {
            onScan(numbersOnly);
          }
        }
      } catch (error) {
        console.error("Erreur OCR:", error);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <Modal animationType="slide">
      <View style={styles.container}>
        <MaskedView
          maskElement={
            <Text style={{ color: "black", fontSize: 40 }}>Hello</Text>
          }
        >
          <CameraView style={styles.camera} ref={cameraRef}>
            <View style={styles.overlay}>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <Text style={styles.closeText}>X</Text>
              </TouchableOpacity>

              <View style={styles.resultBox}>
                <Text style={styles.resultText}>
                  {isProcessing ? "Analyse..." : "Ciblez les chiffres"}
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.scanBtn, isProcessing && { opacity: 0.5 }]}
                onPress={handleCapture}
                disabled={isProcessing}
              >
                <ActivityIndicator animating={isProcessing} color="#000" />
                {!isProcessing && (
                  <Text style={styles.buttonTextBlack}>SCANNER</Text>
                )}
              </TouchableOpacity>
            </View>
          </CameraView>
        </MaskedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  camera: { flex: 1 },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 60,
  },
  closeBtn: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 15,
    borderRadius: 30,
  },
  closeText: { color: "white", fontWeight: "bold" },
  resultBox: {
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  resultText: { color: "white", fontSize: 18 },
  scanBtn: {
    backgroundColor: "#fff",
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 40,
    flexDirection: "row",
  },
  buttonTextBlack: { color: "#000", fontSize: 18, fontWeight: "bold" },
  button: { backgroundColor: "#2196F3", padding: 15, borderRadius: 10 },
});
