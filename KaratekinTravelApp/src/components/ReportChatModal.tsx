import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { OverlayModal, ModalHeader, Button } from "@/shared/ui";
import { createChatReportApi } from "@/core/data/api";

interface ReportChatModalProps {
  visible: boolean;
  onClose: () => void;
  companyName: string;
  /** Sikayet edilen sohbet. Cagiran taraf bunu cozemiyorsa pencereyi hic
   *  acmamali; sunucu grup kimligi olmadan sikayet kabul etmiyor. */
  chatGroupId: string;
}

const MIN_REASON_LENGTH = 3;

const ReportChatModal: React.FC<ReportChatModalProps> = ({
  visible,
  onClose,
  companyName,
  chatGroupId,
}) => {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = reason.trim().length >= MIN_REASON_LENGTH && !submitting;

  const handleSubmit = async () => {
    const trimmed = reason.trim();
    if (trimmed.length < MIN_REASON_LENGTH) return;

    setSubmitting(true);
    try {
      await createChatReportApi({ chatGroupId, reason: trimmed });
      setReason("");
      onClose();
      Alert.alert(
        "Bildiriminiz alindi",
        "Sikayetiniz incelenmek uzere iletildi.",
      );
    } catch (err) {
      Alert.alert(
        "Gonderilemedi",
        err instanceof Error ? err.message : "Sikayet gonderilemedi.",
      );
    } finally {
      setSubmitting(false);
    }
  };

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
          value={reason}
          onChangeText={setReason}
          editable={!submitting}
          maxLength={2000}
        />
      </View>

      {/* Report Button */}
      <Button
        title={submitting ? "Gonderiliyor..." : "Bildir"}
        onPress={handleSubmit}
        disabled={!canSubmit}
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
