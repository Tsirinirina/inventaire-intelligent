import * as ImageManipulator from "expo-image-manipulator";
import { CameraView, useCameraPermissions } from "expo-camera";
import { getTextFromFrame } from "expo-text-recognition";
import { useTheme } from "@/theme/ThemeProvider";
import { ScanLine, X } from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface NumberScannerProps {
  onScan: (value: string) => void;
  onClose: () => void;
}

/**
 * Extrait un IMEI (15 chiffres consécutifs) depuis les lignes OCR.
 * Cherche ligne par ligne, puis dans le texte global concatené.
 */
function extractImei(lines: string[]): string | null {
  for (const line of lines) {
    const digits = line.replace(/\D/g, "");
    const match = digits.match(/\d{15}/);
    if (match) return match[0];
  }
  // fallback : concatène tout et cherche
  const all = lines.join("").replace(/\D/g, "");
  const match = all.match(/\d{15}/);
  return match ? match[0] : null;
}

export default function NumberScanner({ onScan, onClose }: NumberScannerProps) {
  const { colors } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const [hint, setHint] = useState("Cadrez les 15 chiffres de l'IMEI");
  const cameraRef = useRef<CameraView>(null);

  const handleCapture = async () => {
    if (!cameraRef.current || isProcessing) return;

    setIsProcessing(true);
    setHint("Analyse en cours...");

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        skipProcessing: true,
      });

      // Amélioration : resize pour accélérer l'OCR
      const processed = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 1200 } }],
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG },
      );

      const lines = await getTextFromFrame(processed.uri, false);
      const imei = extractImei(lines);

      if (imei) {
        onScan(imei);
      } else {
        setHint("IMEI non détecté — repositionnez et réessayez");
        setIsProcessing(false);
      }
    } catch (err) {
      console.error("OCR error:", err);
      setHint("Erreur d'analyse — réessayez");
      setIsProcessing(false);
    }
  };

  if (!permission) {
    return (
      <Modal animationType="slide" statusBarTranslucent>
        <View style={[styles.center, { backgroundColor: colors.background }]}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </Modal>
    );
  }

  if (!permission.granted) {
    return (
      <Modal animationType="slide" statusBarTranslucent>
        <View style={[styles.center, { backgroundColor: colors.background }]}>
          <Text style={{ color: colors.text, fontSize: 16, marginBottom: 16, textAlign: "center" }}>
            L&apos;accès à la caméra est requis pour scanner l&apos;IMEI
          </Text>
          <TouchableOpacity
            style={[styles.permBtn, { backgroundColor: colors.primary }]}
            onPress={requestPermission}
          >
            <Text style={{ color: colors.textInverse, fontWeight: "600", fontSize: 15 }}>
              Autoriser la caméra
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={{ marginTop: 20 }}>
            <Text style={{ color: colors.textMuted, fontSize: 15 }}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal animationType="slide" statusBarTranslucent>
      <View style={styles.container}>
        <CameraView style={styles.camera} ref={cameraRef} facing="back">
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={22} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Scanner IMEI</Text>
          </View>

          {/* Zone de visée */}
          <View style={styles.viewfinderArea}>
            <View style={styles.viewfinder}>
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
            </View>
            <Text style={styles.viewfinderLabel}>
              Visez les 15 chiffres de l&apos;IMEI (*#06#)
            </Text>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.hintText}>{hint}</Text>
            <TouchableOpacity
              style={[styles.scanBtn, isProcessing && styles.scanBtnDisabled]}
              onPress={handleCapture}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color="#000" size="small" />
              ) : (
                <>
                  <ScanLine size={20} color="#000" />
                  <Text style={styles.scanBtnText}>SCANNER</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  camera: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: "rgba(0,0,0,0.45)",
    gap: 14,
  },
  closeBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  viewfinderArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  viewfinder: {
    width: 300,
    height: 90,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 22,
    height: 22,
    borderColor: "#fff",
    borderWidth: 3,
  },
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  viewfinderLabel: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    textAlign: "center",
    paddingHorizontal: 32,
  },
  footer: {
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingVertical: 28,
    paddingHorizontal: 32,
    alignItems: "center",
    gap: 18,
  },
  hintText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
    textAlign: "center",
  },
  scanBtn: {
    backgroundColor: "#fff",
    paddingHorizontal: 44,
    paddingVertical: 16,
    borderRadius: 40,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minWidth: 160,
    justifyContent: "center",
  },
  scanBtnDisabled: {
    opacity: 0.55,
  },
  scanBtnText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  permBtn: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
  },
});
