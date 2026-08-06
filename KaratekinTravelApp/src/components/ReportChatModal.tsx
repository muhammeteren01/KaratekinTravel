import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { OverlayModal, ModalHeader, Button } from "@/shared/ui";

interface ReportChatModalProps {
  visible: boolean;
  onClose: () => void;
  companyName: string;
}

const ReportChatModal: React.FC<ReportChatModalProps> = ({
  visible,
  onClose,
  companyName,
}) => {
  return (
    <OverlayModal visible={visible} onRequestClose={onClose}>
      <ModalHeader
        title="Sohbeti Bildir"
        subtitle={companyName}
        right={
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#B20101" />
          </TouchableOpacity>
        }
      />

      {/* Text Input Area */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Bildirme Sebebiniz..."
          placeholderTextColor="#7D848D"
          multiline={true}
          textAlignVertical="top"
        />
      </View>

      {/* Report Button */}
      <Button
        title="Bildir"
        onPress={() => {}}
        variant="danger"
        style={styles.reportButton}
      />
    </OverlayModal>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    marginTop: 24,
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "500",
    color: "#1B1E28",
    letterSpacing: 0.5,
    lineHeight: 32,
  },
  companyName: {
    fontSize: 15,
    fontWeight: "400",
    color: "#7D848D",
    letterSpacing: 0.3,
    lineHeight: 20,
    marginTop: 4,
  },
  closeButton: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  inputContainer: {
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: "#F7F7F9",
    borderRadius: 16,
    height: 172,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#1B1E28",
    letterSpacing: 0.3,
    paddingHorizontal: 16,
    paddingTop: 16,
    textAlignVertical: "top",
  },
  reportButton: {
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: "#B20101",
    borderRadius: 16,
    height: 60,
  },
});

export default ReportChatModal;
