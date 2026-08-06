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

export type BadgeVariant =
  | "info"
  | "success"
  | "warning"
  | "danger"
  | "neutral"
  | "orange";

export interface BadgeProps {
  text: string;
  variant?: BadgeVariant;
  onPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  leftIcon?: React.ReactNode;
}

const VARIANTS: Record<
  BadgeVariant,
  { backgroundColor: string; color: string }
> = {
  info: { backgroundColor: "#24BAEC", color: "#FFF" },
  success: { backgroundColor: "#19B000", color: "#FFF" },
  warning: { backgroundColor: "#FFB020", color: "#1B1E28" },
  danger: { backgroundColor: "#FF6B6B", color: "#FFF" },
  neutral: { backgroundColor: "#E6E6EA", color: "#333" },
  orange: { backgroundColor: "#FF6B35", color: "#FFF" },
};

const Badge: React.FC<BadgeProps> = ({
  text,
  variant = "info",
  onPress,
  containerStyle,
  textStyle,
  leftIcon,
}) => {
  const { backgroundColor, color } = VARIANTS[variant];
  const content = (
    <View style={[styles.badgeContainer, { backgroundColor }, containerStyle]}>
      {leftIcon ? <View style={styles.iconWrap}>{leftIcon}</View> : null}
      <Text style={[styles.badgeText, { color }, textStyle]}>{text}</Text>
    </View>
  );
  if (onPress) {
    return (
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={text || "Rozet"}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {content}
      </TouchableOpacity>
    );
  }
  return content;
};

const styles = StyleSheet.create({
  badgeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  iconWrap: {
    marginRight: 6,
  },
});

export default Badge;
