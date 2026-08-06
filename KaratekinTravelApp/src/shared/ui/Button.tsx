import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
  ActivityIndicator,
} from "react-native";

type Variant = "primary" | "outline" | "danger" | "link";

export interface ButtonProps {
  title: string;
  onPress?: (e: GestureResponderEvent) => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  disabled,
  loading,
  style,
  textStyle,
}) => {
  const isLink = variant === "link";
  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.base,
        variantStyles[variant],
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "outline" ? "#FF6B35" : "#FFFFFF"}
        />
      ) : (
        <Text style={[styles.text, textVariantStyles[variant], textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FF6B35",
    flexDirection: "row",
  },
  text: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  disabled: {
    opacity: 0.6,
  },
});

const variantStyles: Record<Variant, ViewStyle> = {
  primary: {
    backgroundColor: "#FF6B35",
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#FF6B35",
  },
  danger: {
    backgroundColor: "#E53935",
  },
  link: {
    backgroundColor: "transparent",
  },
};

const textVariantStyles: Record<Variant, TextStyle> = {
  primary: {
    color: "#FFFFFF",
  },
  outline: {
    color: "#FF6B35",
  },
  danger: {
    color: "#FFFFFF",
  },
  link: {
    color: "#FF6B35",
    fontWeight: "600",
  },
};

export default Button;
