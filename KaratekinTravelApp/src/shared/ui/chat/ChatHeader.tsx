import React from "react";
import { View, Image, StyleSheet, ImageSourcePropType } from "react-native";
import { AppHeader } from "@/shared/ui";

export interface ChatHeaderProps {
  /** Chat title */
  title: string;
  /** Back button handler */
  onBack: () => void;
  /** Avatar image source */
  avatar?: ImageSourcePropType;
  /** Whether to include safe area top padding */
  safeAreaTop?: boolean;
  /** Optional right component (overrides avatar if provided) */
  rightComponent?: React.ReactNode;
}

/**
 * ChatHeader - Standardized header for chat screens
 *
 * Features:
 * - App header with title and back button
 * - Optional company/user avatar on the right
 * - Safe area support
 * - Customizable right component
 */
export const ChatHeader: React.FC<ChatHeaderProps> = ({
  title,
  onBack,
  avatar,
  safeAreaTop = true,
  rightComponent,
}) => {
  const renderRight = () => {
    if (rightComponent) {
      return rightComponent;
    }
    if (avatar) {
      return <Image source={avatar} style={styles.avatar} />;
    }
    return null;
  };

  return (
    <AppHeader
      title={title}
      onBack={onBack}
      safeAreaTop={safeAreaTop}
      right={renderRight()}
    />
  );
};

const styles = StyleSheet.create({
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
});

export default ChatHeader;
