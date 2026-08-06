import React from "react";
import { View, Text, StyleSheet, TextStyle, StyleProp } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface InfoRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  color?: string;
  iconSize?: number;
  textStyle?: StyleProp<TextStyle>;
}

const InfoRow: React.FC<InfoRowProps> = ({
  icon,
  text,
  color = "#999",
  iconSize = 16,
  textStyle,
}) => {
  return (
    <View style={styles.infoRowContainer}>
      <Ionicons name={icon} size={iconSize} color={color} />
      <Text style={[styles.infoRowText, { color: "#666" }, textStyle]}>
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  infoRowContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoRowText: {
    fontSize: 14,
  },
});

export default InfoRow;
