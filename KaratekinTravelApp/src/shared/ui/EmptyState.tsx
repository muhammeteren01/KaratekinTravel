import React from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export type IconConfig = {
  name: React.ComponentProps<typeof Ionicons>["name"];
  size?: number;
  color?: string;
};

export interface EmptyStateProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode | IconConfig;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  iconContainerStyle?: ViewStyle;
}

/**
 * EmptyState
 * Accessibility: summary role + testID; title announced via accessibilityLabel
 * Default spacings/colors sized to match current inline blocks in AllTrips and SavedTrips.
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  subtitle,
  icon,
  style,
  titleStyle,
  subtitleStyle,
  iconContainerStyle,
}) => {
  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) return icon;
    const cfg = icon as IconConfig;
    return (
      <Ionicons
        name={cfg.name}
        size={cfg.size ?? 48}
        color={cfg.color ?? "#ccc"}
      />
    );
  };

  return (
    <View
      accessibilityRole="summary"
      testID="empty-state"
      style={[styles.container, style]}
    >
      <View style={[styles.iconWrap, iconContainerStyle]}>{renderIcon()}</View>
      <Text style={[styles.title, titleStyle]} accessibilityLabel={title}>
        {title}
      </Text>
      {subtitle ? (
        <Text style={[styles.subtitle, subtitleStyle]}>{subtitle}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    // Padding values mimic current inline usages
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  iconWrap: {
    // No extra spacing; leave spacing to title marginTop for exact parity
  },
  title: {
    fontSize: 18,
    color: "#999",
    textAlign: "center",
    marginTop: 16,
    fontWeight: "500",
  },
  subtitle: {
    fontSize: 14,
    color: "#ccc",
    textAlign: "center",
    marginTop: 8,
  },
});

export default EmptyState;
