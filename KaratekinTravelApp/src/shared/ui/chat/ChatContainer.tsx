import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";

export interface ChatContainerProps {
  /** Child components (typically MessagesList and ChatComposer) */
  children: React.ReactNode;
  /** Optional container style override */
  style?: ViewStyle;
}

/**
 * ChatContainer - Wrapper container for chat messages and input
 *
 * Features:
 * - Rounded container with light gray background
 * - Proper spacing and positioning
 * - Flex layout for messages + composer
 * - Consistent margins and border radius
 */
export const ChatContainer: React.FC<ChatContainerProps> = ({
  children,
  style,
}) => {
  return <View style={[styles.container, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F1F1",
    marginTop: 10,
    marginHorizontal: 18,
    borderRadius: 16,
    overflow: "hidden",
  },
});

export default ChatContainer;
