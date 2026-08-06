import React from "react";
import { View, Text, StyleSheet, Image, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface MessageBubbleProps {
  /** Message text content */
  text: string;
  /** Time stamp displayed with message */
  time: string;
  /** Whether this is the current user's message */
  isOwn: boolean;
  /** Optional avatar URL (for other user's messages) */
  avatar?: string;
  /** Whether message has been delivered */
  isDelivered?: boolean;
  /** Whether message has been read */
  isRead?: boolean;
  /** Visual variant: 'group' (ChatDetail) or 'company' (CompanyContact) */
  variant?: "group" | "company";
  /** Optional container style override */
  containerStyle?: ViewStyle;
}

/**
 * MessageBubble - Standardized chat message component
 *
 * Supports two variants:
 * - 'group': Used in ChatDetailScreen with colored own messages (#24BAEC)
 * - 'company': Used in CompanyContactScreen with neutral bubbles (#F7F7F9)
 *
 * Features:
 * - Avatar display for non-own messages
 * - Read/delivered/sent status indicators
 * - Responsive max-width (80% or 268px)
 * - Consistent spacing and border radius
 */
export const MessageBubble: React.FC<MessageBubbleProps> = ({
  text,
  time,
  isOwn,
  avatar,
  isDelivered = false,
  isRead = false,
  variant = "group",
  containerStyle,
}) => {
  const isGroup = variant === "group";

  if (isOwn) {
    return (
      <View style={[styles.ownMessageContainer, containerStyle]}>
        <View
          style={[
            styles.ownMessage,
            isGroup ? styles.ownMessageGroup : styles.ownMessageCompany,
          ]}
        >
          <Text
            style={[
              styles.ownMessageText,
              isGroup
                ? styles.ownMessageTextGroup
                : styles.ownMessageTextCompany,
            ]}
          >
            {text}
          </Text>
          {variant === "company" && (
            <View style={styles.messageFooterInline}>
              <Text style={styles.messageTime}>{time}</Text>
              <View style={styles.messageStatus}>
                <Ionicons
                  name="checkmark"
                  size={12}
                  color={isRead ? "#19B000" : "#7D848D"}
                />
                <Ionicons
                  name="checkmark"
                  size={12}
                  color={isRead ? "#19B000" : "#7D848D"}
                  style={{ marginLeft: -6 }}
                />
              </View>
            </View>
          )}
        </View>
        {variant === "group" && (
          <View style={styles.ownMessageInfo}>
            <Text style={styles.messageTime}>{time}</Text>
            <View style={styles.messageStatus}>
              {isRead ? (
                <Ionicons name="checkmark-done" size={16} color="#4CAF50" />
              ) : isDelivered ? (
                <Ionicons name="checkmark-done" size={16} color="#999" />
              ) : (
                <Ionicons name="checkmark" size={16} color="#999" />
              )}
            </View>
          </View>
        )}
        {variant === "company" && avatar && (
          <Image source={{ uri: avatar }} style={styles.messageAvatarCompany} />
        )}
      </View>
    );
  }

  // Other user's message
  return (
    <View style={[styles.otherMessageContainer, containerStyle]}>
      {variant === "group" ? (
        avatar ? (
          <Image source={{ uri: avatar }} style={styles.messageAvatarGroup} />
        ) : (
          <View
            style={[styles.messageAvatarGroup, { backgroundColor: "#E0E0E0" }]}
          />
        )
      ) : (
        avatar && (
          <Image source={{ uri: avatar }} style={styles.messageAvatarCompany} />
        )
      )}
      <View style={styles.otherMessageContent}>
        <View
          style={[
            styles.otherMessage,
            variant === "group"
              ? styles.otherMessageGroup
              : styles.otherMessageCompany,
          ]}
        >
          <Text
            style={[
              styles.otherMessageText,
              variant === "company" && styles.otherMessageTextCompany,
            ]}
          >
            {text}
          </Text>
          {variant === "company" && (
            <View style={styles.messageFooterInline}>
              <Text style={styles.messageTime}>{time}</Text>
              <View style={styles.messageStatus}>
                <Ionicons
                  name="checkmark"
                  size={12}
                  color={isRead ? "#19B000" : "#7D848D"}
                />
                <Ionicons
                  name="checkmark"
                  size={12}
                  color={isRead ? "#19B000" : "#7D848D"}
                  style={{ marginLeft: -6 }}
                />
              </View>
            </View>
          )}
        </View>
        {variant === "group" && (
          <View style={styles.otherMessageInfo}>
            <Text style={styles.messageTime}>{time}</Text>
            <View style={styles.messageStatus}>
              {isRead ? (
                <Ionicons name="checkmark-done" size={16} color="#4CAF50" />
              ) : isDelivered ? (
                <Ionicons name="checkmark-done" size={16} color="#999" />
              ) : (
                <Ionicons name="checkmark" size={16} color="#999" />
              )}
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Own message styles (sent by current user)
  ownMessageContainer: {
    alignItems: "flex-end",
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 4,
  },
  ownMessage: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    maxWidth: "80%",
  },
  ownMessageGroup: {
    backgroundColor: "#24BAEC",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomRightRadius: 6,
  },
  ownMessageCompany: {
    backgroundColor: "#F7F7F9",
    borderRadius: 16,
    paddingHorizontal: 13,
    paddingVertical: 10,
    maxWidth: 268,
  },
  ownMessageText: {
    fontSize: 16,
    fontWeight: "400",
  },
  ownMessageTextGroup: {
    color: "white",
  },
  ownMessageTextCompany: {
    fontSize: 14,
    color: "#1B1E28",
    lineHeight: 20,
  },
  ownMessageInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginRight: 8,
  },

  // Other user's message styles
  otherMessageContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 16,
    gap: 4,
  },
  messageAvatarGroup: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: "#F0F0F0",
  },
  messageAvatarCompany: {
    width: 47,
    height: 48,
    borderRadius: 24,
  },
  otherMessageContent: {
    flex: 1,
  },
  otherMessage: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    maxWidth: "80%",
  },
  otherMessageGroup: {
    backgroundColor: "white",
    borderRadius: 20,
    borderBottomLeftRadius: 6,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  otherMessageCompany: {
    backgroundColor: "#F7F7F9",
    borderRadius: 16,
    paddingHorizontal: 13,
    paddingVertical: 10,
    maxWidth: 268,
  },
  otherMessageText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "400",
  },
  otherMessageTextCompany: {
    fontSize: 14,
    color: "#1B1E28",
    lineHeight: 20,
  },
  otherMessageInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginLeft: 8,
  },

  // Shared styles
  messageFooterInline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 2,
    gap: 8,
  },
  messageTime: {
    fontSize: 12,
    color: "#999",
    marginRight: 4,
    fontWeight: "400",
  },
  messageStatus: {
    marginLeft: 4,
    flexDirection: "row",
    alignItems: "center",
  },
});

export default MessageBubble;
