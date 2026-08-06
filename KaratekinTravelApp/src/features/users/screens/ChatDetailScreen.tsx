import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AppHeader, MessageBubble, DateSeparator } from "@/shared/ui";
import AvatarsStack from "@/shared/ui/AvatarsStack";
import { useSupportingData } from "@/features/trips/hooks";
import { LoadingView, ErrorView } from "@/shared/ui";
import { useAuth } from "@/context/AuthContext";

export interface GroupMessage {
  id: string;
  text: string;
  time: string;
  isOwn: boolean;
  avatar?: string;
  isRead?: boolean;
  isDelivered?: boolean;
}

interface ChatDetailScreenProps {
  onBack: () => void;
  chatData: {
    id: string; // group id
    groupName: string;
    isActive: boolean;
    memberCount: number;
  };
}

export default function ChatDetailScreen({
  onBack,
  chatData,
}: ChatDetailScreenProps) {
  const { data: supporting, isLoading, isError, refetch } = useSupportingData();
  if (isLoading) return <LoadingView />;
  if (isError) return <ErrorView onRetry={refetch} />;
  const { currentUser } = useAuth();
  const memberAvatars: string[] =
    supporting?.chats?.groupMemberAvatars?.[chatData.id] || [];
  const messages: GroupMessage[] = (
    (supporting?.chats?.groupMessages?.[chatData.id] || []) as any[]
  ).map((m) => {
    // If JSON provides userId, use it to determine ownership; otherwise use isOwn flag
    const isOwn = m.userId
      ? String(m.userId) === String(currentUser?.id)
      : !!m.isOwn;
    return {
      id: String(m.id),
      text: m.text,
      time: m.time,
      isOwn,
      avatar: m.avatar,
      isDelivered: m.isDelivered,
      isRead: m.isRead,
    } as GroupMessage;
  });

  const renderMessage = (message: GroupMessage, index: number) => {
    return (
      <MessageBubble
        key={message.id}
        text={message.text}
        time={message.time}
        isOwn={message.isOwn}
        avatar={message.avatar}
        isDelivered={message.isDelivered}
        isRead={message.isRead}
        variant="group"
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor="transparent" translucent />

      <AppHeader
        title={chatData.groupName}
        onBack={onBack}
        right={
          <AvatarsStack
            avatars={memberAvatars}
            maxVisible={2}
            size={28}
            overlap={-6}
          />
        }
      />

      {/* Messages */}
      <ScrollView
        style={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Date Separator */}
        <DateSeparator text="Bugün" />

        {/* Messages List */}
        <View style={styles.messagesList}>
          {messages.map((message, index) => renderMessage(message, index))}
        </View>
      </ScrollView>

      {/* Bottom Warning */}
      <View style={styles.bottomWarning}>
        <Text style={styles.warningText}>
          Gruba sadece yöneticiler yazabilir!
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  messagesList: {
    paddingBottom: 20,
  },
  bottomWarning: {
    backgroundColor: "#F0F0F0",
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    borderTopWidth: 0.5,
    borderTopColor: "#E0E0E0",
  },
  warningText: {
    fontSize: 14,
    color: "#999",
    fontWeight: "500",
  },
});
