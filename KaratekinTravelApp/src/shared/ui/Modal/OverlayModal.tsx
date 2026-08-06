import React from "react";
import {
  Modal,
  View,
  StyleSheet,
  Pressable,
  StyleProp,
  ViewStyle,
} from "react-native";

export interface OverlayModalProps {
  visible: boolean;
  onRequestClose: () => void;
  children: React.ReactNode;
  backdropColor?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

export default function OverlayModal({
  visible,
  onRequestClose,
  children,
  backdropColor = "rgba(0,0,0,0.4)",
  containerStyle,
}: OverlayModalProps) {
  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onRequestClose}
    >
      <View style={[styles.backdrop, { backgroundColor: backdropColor }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onRequestClose} />
        <View style={[styles.sheet, containerStyle]}>
          <View style={styles.handle} />
          {children}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "flex-end" },
  sheet: {
    backgroundColor: "#EBEBEB",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    maxHeight: "85%",
  },
  handle: {
    alignSelf: "center",
    width: 36,
    height: 5,
    borderRadius: 16,
    backgroundColor: "#7D848D",
    opacity: 0.2,
    marginBottom: 12,
  },
});
