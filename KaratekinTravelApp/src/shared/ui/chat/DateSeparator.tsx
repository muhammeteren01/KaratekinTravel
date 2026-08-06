import React from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";

export interface DateSeparatorProps {
  /** Date text to display */
  text: string;
  /** Optional container style override */
  containerStyle?: ViewStyle;
  /** Optional text style override */
  textStyle?: TextStyle;
}

/**
 * DateSeparator - Standardized date divider for chat messages
 *
 * Features:
 * - Centered date badge with gray background
 * - Consistent vertical spacing (24px)
 * - Rounded corners (16px)
 *
 * Extracted from ChatDetailScreen with pixel-perfect parity
 */
export const DateSeparator: React.FC<DateSeparatorProps> = ({
  text,
  containerStyle,
  textStyle,
}) => {
  return (
    <View style={[styles.dateSeparator, containerStyle]}>
      <Text style={[styles.dateText, textStyle]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  dateSeparator: {
    alignItems: "center",
    marginVertical: 24,
  },
  dateText: {
    fontSize: 14,
    color: "#999",
    backgroundColor: "#EDEDED",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    overflow: "hidden",
  },
});

export default DateSeparator;
