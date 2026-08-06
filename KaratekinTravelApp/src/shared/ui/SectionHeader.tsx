import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  StyleProp,
} from "react-native";

export interface SectionHeaderProps {
  title: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  rightLabel?: string;
  onPressRight?: () => void;
  rightNode?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
  rightLabelStyle?: StyleProp<TextStyle>;
}

export default function SectionHeader({
  title,
  subtitle,
  rightLabel,
  onPressRight,
  rightNode,
  containerStyle,
  titleStyle,
  subtitleStyle,
  rightLabelStyle,
}: SectionHeaderProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.left}>
        {typeof title === "string" ? (
          <Text style={[styles.title, titleStyle]}>{title}</Text>
        ) : (
          title
        )}
        {subtitle ? (
          typeof subtitle === "string" ? (
            <Text style={[styles.subtitle, subtitleStyle]}>{subtitle}</Text>
          ) : (
            subtitle
          )
        ) : null}
      </View>
      <View style={styles.right}>
        {rightNode}
        {rightLabel ? (
          <TouchableOpacity
            onPress={onPressRight}
            accessibilityRole="button"
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Text style={[styles.rightLabel, rightLabelStyle]}>
              {rightLabel}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  left: {
    flexShrink: 1,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1B1E28",
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "#7D848D",
  },
  rightLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#24BAEC",
  },
});
