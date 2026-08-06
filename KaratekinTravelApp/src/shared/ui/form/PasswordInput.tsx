import React, { useMemo, useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface PasswordInputProps {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  disabled?: boolean;
  variant?: "filled" | "outline";
  size?: "sm" | "md" | "lg";
  testID?: string;
  style?: ViewStyle;
}

const sizeTokens = {
  sm: {
    paddingV: 14,
    paddingH: 12,
    fontSize: 16,
    iconPad: 8,
    borderRadius: 8,
    height: 54,
  },
  md: {
    paddingV: 0,
    paddingH: 16,
    fontSize: 16,
    iconPad: 16,
    borderRadius: 8,
    height: 56,
  },
  lg: {
    paddingV: 0,
    paddingH: 18,
    fontSize: 18,
    iconPad: 18,
    borderRadius: 12,
    height: 60,
  },
};

const variants = {
  filled: { backgroundColor: "white", borderColor: "#E0E0E0" },
  outline: { backgroundColor: "transparent", borderColor: "#E0E0E0" },
};

const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChangeText,
  placeholder = "**********",
  autoFocus,
  disabled,
  variant = "filled",
  size = "md",
  testID = "password-input",
  style,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const t = sizeTokens[size];
  const v = variants[variant];

  const containerStyle = useMemo<ViewStyle[]>(
    () =>
      [
        styles.container,
        {
          backgroundColor: v.backgroundColor,
          borderColor: v.borderColor,
          borderRadius: t.borderRadius,
        },
        // parity with inline: borderWidth always 1
        { borderWidth: 1 },
        t.height ? { height: t.height } : null,
        style,
      ].filter(Boolean) as ViewStyle[],
    [style, t.borderRadius, t.height, v.backgroundColor, v.borderColor],
  );

  const inputStyle = useMemo<TextStyle[]>(
    () => [
      styles.input,
      {
        paddingHorizontal: t.paddingH,
        paddingVertical: t.paddingV,
        fontSize: t.fontSize,
      },
    ],
    [t.fontSize, t.paddingH, t.paddingV],
  );

  const toggleA11y = isVisible ? "Şifreyi gizle" : "Şifreyi göster";

  return (
    <View style={containerStyle} testID={testID}>
      <TextInput
        style={inputStyle}
        value={value}
        onChangeText={onChangeText}
        autoFocus={autoFocus}
        editable={!disabled}
        secureTextEntry={!isVisible}
        placeholder={placeholder}
        placeholderTextColor="#999"
      />
      <TouchableOpacity
        onPress={() => setIsVisible((s) => !s)}
        accessibilityRole="button"
        accessibilityLabel={toggleA11y}
        style={{ paddingHorizontal: t.iconPad }}
        disabled={disabled}
      >
        <Ionicons name={isVisible ? "eye-off" : "eye"} size={20} color="#999" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
  },
});

export default PasswordInput;
