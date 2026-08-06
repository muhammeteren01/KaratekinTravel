import React, { useMemo, useRef } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface SearchBarProps
  extends Pick<
    TextInputProps,
    "placeholder" | "autoFocus" | "keyboardType" | "returnKeyType"
  > {
  value: string;
  onChangeText: (text: string) => void;
  onFilterPress?: () => void;
  onSubmitEditing?: () => void;
  onClear?: () => void;
  debounceMs?: number;
  size?: "default" | "compact";
  variant?: "filled" | "outline";
  showCancel?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onFilterPress,
  onSubmitEditing,
  onClear,
  placeholder = "Ara...",
  autoFocus,
  keyboardType,
  returnKeyType,
  debounceMs = 0,
  size = "default",
  variant = "filled",
  showCancel = false,
  leftIcon,
  rightIcon,
  style,
}) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleChangeText = useMemo(() => {
    if (!debounceMs) return onChangeText;
    return (text: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => onChangeText(text), debounceMs);
    };
  }, [onChangeText, debounceMs]);

  const handleClear = () => {
    onChangeText("");
    onClear?.();
  };

  const compact = size === "compact";
  const variantStyle = variant === "outline" ? styles.outlineVariant : {};

  return (
    <View style={[styles.searchBarContainer, style]}>
      <View
        style={[
          styles.searchBarInputWrapper,
          compact && styles.searchBarInputWrapperCompact,
          variantStyle,
        ]}
      >
        {leftIcon || (
          <Ionicons
            name="search"
            size={20}
            color="#7D848D"
            style={styles.searchBarIcon}
          />
        )}
        <TextInput
          style={styles.searchBarInput}
          placeholder={placeholder}
          placeholderTextColor="#7D848D"
          value={value}
          onChangeText={handleChangeText}
          onSubmitEditing={onSubmitEditing}
          autoFocus={autoFocus}
          keyboardType={keyboardType}
          returnKeyType={returnKeyType}
        />
        {value.length > 0 && onClear && (
          <TouchableOpacity
            onPress={handleClear}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close-circle" size={18} color="#999" />
          </TouchableOpacity>
        )}
        {rightIcon}
      </View>
      {onFilterPress && (
        <TouchableOpacity
          accessibilityRole="button"
          onPress={onFilterPress}
          style={[
            styles.searchBarFilterButton,
            compact && styles.searchBarFilterButtonCompact,
          ]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="funnel-outline" size={20} color="#7D848D" />
        </TouchableOpacity>
      )}
      {showCancel && (
        <TouchableOpacity
          onPress={handleClear}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close" size={24} color="#666" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 16,
  },
  searchBarInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  searchBarInputWrapperCompact: {
    height: 40,
  },
  outlineVariant: {
    backgroundColor: "#F8F9FA",
    borderColor: "#E0E0E0",
  },
  searchBarIcon: {
    marginRight: 8,
  },
  searchBarInput: {
    flex: 1,
    color: "#333",
    fontSize: 16,
  },
  searchBarFilterButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  searchBarFilterButtonCompact: {
    width: 40,
    height: 40,
  },
});

export default SearchBar;
