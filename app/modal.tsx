import AppText from "@/components/ui/AppText";
import Title from "@/components/ui/Title";
import { router } from "expo-router";
import {
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

export default function ModalScreen() {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={true}
      onRequestClose={() => router.back()}
    >
      <Pressable style={styles.overlay} onPress={() => router.back()}>
        <View style={styles.modalContent}>
          <Title variant="h3" color="#0A0E1A">
            FinVault
          </Title>
          <AppText
            variant="muted"
            align="center"
            color="#475569"
            style={styles.desc}
          >
            Your premium fintech dashboard for managing finances with ease.
          </AppText>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
          >
            <AppText color="#fff" weight="600" align="center">
              Close
            </AppText>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 28,
    margin: 20,
    alignItems: "center",
    minWidth: 300,
  },
  desc: {
    marginTop: 10,
    marginBottom: 24,
    lineHeight: 20,
  },
  closeButton: {
    backgroundColor: "#00D09E",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    minWidth: 120,
  },
});
