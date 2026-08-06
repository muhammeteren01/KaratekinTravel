import React from "react";
import { View, ScrollView, StyleSheet, ViewStyle } from "react-native";
import { MessageBubble, DateSeparator, Badge } from "@/shared/ui";

export interface Message {
  id: string;
  text: string;
  time: string;
  isOwn: boolean;
  avatar?: string;
  isRead?: boolean;
  isDelivered?: boolean;
}

export interface MessagesListProps {
  /** Array of messages to display */
  messages: Message[];
  /** Message bubble variant */
  variant?: "group" | "company";
  /** Whether to show date separator */
  showDateSeparator?: boolean;
  /** Date separator text */
  dateSeparatorText?: string;
  /** Whether to use Badge instead of DateSeparator */
  useDateBadge?: boolean;
  /** Optional ScrollView style override */
  scrollViewStyle?: ViewStyle;
  /** Optional messages list container style */
  listStyle?: ViewStyle;
}

/**
 * MessagesList - Scrollable list of chat messages
 *
 * Features:
 * - Automatic message rendering with proper spacing
 * - Optional date separator or badge
 * - Support for group and company variants
 * - Proper scroll behavior
 * - Consistent padding and gaps
 */
export const MessagesList: React.FC<MessagesListProps> = ({
  messages,
  variant = "company",
  showDateSeparator = true,
  dateSeparatorText = "Bugün",
  useDateBadge = false,
  scrollViewStyle,
  listStyle,
}) => {
  return (
    <ScrollView
      style={[styles.scrollView, scrollViewStyle]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Date Indicator */}
      {showDateSeparator && (
        <View style={styles.dateContainer}>
          {useDateBadge ? (
            <Badge text={dateSeparatorText} variant="neutral" />
          ) : (
            <DateSeparator text={dateSeparatorText} />
          )}
        </View>
      )}

      {/* Messages List */}
      <View style={[styles.messagesList, listStyle]}>
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            text={message.text}
            time={message.time}
            isOwn={message.isOwn}
            avatar={message.avatar}
            isRead={message.isRead}
            isDelivered={message.isDelivered}
            variant={variant}
          />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 43,
    paddingBottom: 16,
    paddingHorizontal: 11,
  },
  dateContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  messagesList: {
    gap: 29,
  },
});

export default MessagesList;
