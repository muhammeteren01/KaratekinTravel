import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
} from "react-native";

export interface LabeledInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: TextInputProps["keyboardType"];
  autoCapitalize?: TextInputProps["autoCapitalize"];
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  errorText?: string;
  secureTextEntry?: boolean;
  variant?: "filled" | "outline";
  size?: "sm" | "md" | "lg";
  style?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  editable?: boolean;
}

const sizeTokens = {
  sm: {
    paddingV: 0,
    paddingH: 12,
    fontSize: 16,
    labelSize: 14,
    spacing: 6,
    borderRadius: 8,
    height: 54,
  },
  md: {
    paddingV: 0,
    paddingH: 16,
    fontSize: 16,
    labelSize: 16,
    spacing: 8,
    borderRadius: 8,
    height: 56,
  },
  lg: {
    paddingV: 0,
    paddingH: 18,
    fontSize: 18,
    labelSize: 18,
    spacing: 10,
    borderRadius: 8,
    height: 60,
  },
};

const variants = {
  filled: { backgroundColor: "white", borderColor: "#E0E0E0" },
  outline: { backgroundColor: "transparent", borderColor: "#E0E0E0" },
};

const LabeledInput: React.FC<LabeledInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize,
  prefix,
  suffix,
  errorText,
  secureTextEntry,
  variant = "filled",
  size = "md",
  style,
  inputStyle,
  labelStyle,
  editable = true,
}) => {
  const t = sizeTokens[size];
  const v = variants[variant];

  return (
    <View style={[styles.container, style]}>
      {!!label && (
        <Text
          style={[
            styles.label,
            { fontSize: t.labelSize, marginBottom: t.spacing },
            labelStyle,
          ]}
        >
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: v.backgroundColor,
            borderColor: v.borderColor,
            borderRadius: t.borderRadius,
            height: t.height,
            paddingVertical: t.paddingV,
            paddingHorizontal: prefix ? 0 : t.paddingH,
            paddingRight: suffix ? 0 : t.paddingH,
          },
          errorText && styles.inputError,
        ]}
      >
        {prefix && (
          <View style={[styles.prefix, { paddingLeft: t.paddingH }]}>
            {prefix}
          </View>
        )}
        <TextInput
          style={[
            styles.input,
            {
              fontSize: t.fontSize,
              paddingHorizontal: prefix || suffix ? 8 : 0,
            },
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#999"
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          secureTextEntry={secureTextEntry}
          editable={editable}
        />
        {suffix && (
          <View style={[styles.suffix, { paddingRight: t.paddingH }]}>
            {suffix}
          </View>
        )}
      </View>
      {errorText && <Text style={styles.errorText}>{errorText}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontWeight: "600",
    color: "#333",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
  },
  inputError: {
    borderColor: "#FF3B30",
  },
  prefix: {
    flexDirection: "row",
    alignItems: "center",
  },
  suffix: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    color: "#333",
  },
  errorText: {
    fontSize: 12,
    color: "#FF3B30",
    marginTop: 4,
  },
});

export default LabeledInput;
