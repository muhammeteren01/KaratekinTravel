import React from "react";
import {
  Modal,
  View,
  StyleSheet,
  Pressable,
  StyleProp,
  ViewStyle,
} from "react-native";

export interface FullscreenModalProps {
  visible: boolean;
  onRequestClose: () => void;
  children: React.ReactNode;
  backdropColor?: string;
  dismissOnBackdropPress?: boolean;
  animationType?: "none" | "slide" | "fade";
  containerStyle?: StyleProp<ViewStyle>;
}

export default function FullscreenModal({
  visible,
  onRequestClose,
  children,
  backdropColor = "rgba(0,0,0,0.95)",
  dismissOnBackdropPress = true,
  animationType = "fade",
  containerStyle,
}: FullscreenModalProps) {
  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={onRequestClose}
      animationType={animationType}
    >
      <View style={[styles.backdrop, { backgroundColor: backdropColor }]}>
        {dismissOnBackdropPress ? (
          <Pressable style={StyleSheet.absoluteFill} onPress={onRequestClose} />
        ) : null}
        <View style={[styles.container, containerStyle]}>{children}</View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1 },
  container: { flex: 1 },
});
