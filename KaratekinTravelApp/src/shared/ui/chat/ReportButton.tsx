import React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface ReportButtonProps {
  /** Button press handler */
  onPress: () => void;
  /** Button text */
  text?: string;
  /** Optional container style override */
  style?: ViewStyle;
}

/**
 * ReportButton - Standardized report button for chat screens
 *
 * Features:
 * - Red alert styling (#B20101)
 * - Flag icon with text
 * - Consistent padding and spacing
 * - Accessible and semantic
 */
export const ReportButton: React.FC<ReportButtonProps> = ({
  onPress,
  text = "Sohbeti Bildir",
  style,
}) => {
  return (
    <TouchableOpacity
      style={[styles.reportButton, style]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={text}
    >
      <Ionicons name="flag-outline" size={10} color="#FFFFFF" />
      <Text style={styles.reportText}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  reportButton: {
    alignSelf: "flex-end",
    backgroundColor: "#B20101",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginRight: 20,
    marginBottom: 8,
    marginTop: 16,
  },
  reportText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
});

export default ReportButton;
