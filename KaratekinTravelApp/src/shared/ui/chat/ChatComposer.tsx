import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface ChatComposerProps {
  /** Current text value */
  value: string;
  /** Callback when text changes */
  onChangeText: (text: string) => void;
  /** Callback when send button is pressed */
  onSend: () => void;
  /** Placeholder text for input */
  placeholder?: string;
  /** Whether the composer is disabled */
  disabled?: boolean;
  /** Optional container style override */
  containerStyle?: ViewStyle;
}

/**
 * ChatComposer - Standardized chat input component
 *
 * Features:
 * - Multi-line text input with rounded corners
 * - Send button with brand blue color (#24BAEC)
 * - Consistent spacing and styling
 * - Auto-clears on send (handled by parent)
 *
 * Extracted from CompanyContactScreen with pixel-perfect parity
 */
export const ChatComposer: React.FC<ChatComposerProps> = ({
  value,
  onChangeText,
  onSend,
  placeholder = "Mesajınız...",
  disabled = false,
  containerStyle,
}) => {
  const handleSend = () => {
    if (value.trim() && !disabled) {
      onSend();
    }
  };

  return (
    <View style={[styles.inputContainer, containerStyle]}>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.textInput}
          placeholder={placeholder}
          placeholderTextColor="#7D848D"
          value={value}
          onChangeText={onChangeText}
          multiline
          editable={!disabled}
        />
      </View>

      <TouchableOpacity
        style={[
          styles.sendButton,
          (!value.trim() || disabled) && styles.sendButtonDisabled,
        ]}
        onPress={handleSend}
        disabled={!value.trim() || disabled}
      >
        <Ionicons name="send" size={16} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingBottom: 16,
    gap: 12,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: "#F7F7F9",
    borderRadius: 16,
    paddingHorizontal: 19,
    paddingVertical: 16,
  },
  textInput: {
    fontSize: 16,
    fontWeight: "400",
    color: "#1B1E28",
    textAlignVertical: "top",
    minHeight: 16,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#24BAEC",
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

export default ChatComposer;
