// moved from src/screens/CompanyContactScreen.tsx
import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { resolveImage } from "@/core/data/schemas";
import ReportChatModal from "@/components/ReportChatModal";
import {
  ChatHeader,
  ReportButton,
  ChatContainer,
  MessagesList,
  ChatComposer,
  LoadingView,
  ErrorView,
} from "@/shared/ui";
import { useSupportingData } from "@/features/trips/hooks";
import type { Message } from "@/shared/ui/chat/MessagesList";

export interface CompanyMessage {
  id: string;
  sender?: "me" | "company";
  text: string;
  time: string;
  isSent?: boolean;
  isRead?: boolean;
}

interface CompanyContactScreenProps {
  onBack: () => void;
  companyName?: string;
}

export default function CompanyContactScreen({
  onBack,
  companyName = "Kamil Koç",
}: CompanyContactScreenProps) {
  const [message, setMessage] = useState("");
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);

  const { data: supporting, isLoading, isError, refetch } = useSupportingData();

  // Sikayet ucu sohbet grubu kimligi istiyor; ekran bunu prop olarak almiyor,
  // bu yuzden sohbet listesinden cozuluyor. Bulunamazsa "Bildir" hic
  // gosterilmiyor: calismayacagini bildigimiz bir dugmeyi koymuyoruz.
  const chatGroupId = supporting?.chats?.groups?.[0]?.id
    ? String(supporting.chats.groups[0].id)
    : undefined;

  if (isLoading) return <LoadingView />;
  if (isError) return <ErrorView onRetry={refetch} />;

  // Load messages from supporting data
  const rawMessages: CompanyMessage[] = (
    supporting?.chats?.companyContact || [
      {
        id: 1,
        text: `${companyName} ile iletişime geçtiğiniz için teşekkürler.`,
        time: "09:15",
        isSent: false,
      },
      {
        id: 2,
        text: "Merhaba, tur hakkında bilgi alabilir miyim?",
        time: "09:16",
        isSent: true,
        isRead: true,
      },
    ]
  ).map((m) => ({
    id: String(m.id),
    text: m.text,
    time: m.time,
    isSent: (m as any).isSent,
    isRead: (m as any).isRead,
  }));

  // Transform messages for MessagesList component
  const messages: Message[] = rawMessages.map((msg) => {
    const avatar = resolveImage("asset:ob1");
    let avatarUri: string | undefined;

    if (avatar && typeof avatar !== "number") {
      if (Array.isArray(avatar)) {
        avatarUri = avatar[0]?.uri;
      } else {
        avatarUri = avatar.uri;
      }
    }

    return {
      id: msg.id,
      text: msg.text,
      time: msg.time,
      isOwn: !!msg.isSent,
      avatar: avatarUri,
      isRead: msg.isRead,
    };
  });

  const handleSendMessage = () => {
    if (message.trim()) {
      // TODO: Implement message sending logic
      setMessage("");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor="#FFFFFF" translucent={false} />

      {/* Header with company avatar */}
      <ChatHeader
        title={`${companyName} - İletişim`}
        onBack={onBack}
        avatar={resolveImage("asset:ob1")}
        safeAreaTop
      />

      {/* Report Button */}
      {chatGroupId && (
        <ReportButton onPress={() => setIsReportModalVisible(true)} />
      )}

      {/* Chat Container with Messages and Composer */}
      <ChatContainer>
        <MessagesList
          messages={messages}
          variant="company"
          showDateSeparator
          dateSeparatorText="Bugün"
          useDateBadge
        />

        <ChatComposer
          value={message}
          onChangeText={setMessage}
          onSend={handleSendMessage}
          placeholder="Mesajınız..."
        />
      </ChatContainer>

      {/* Report Modal */}
      {chatGroupId && (
        <ReportChatModal
          visible={isReportModalVisible}
          onClose={() => setIsReportModalVisible(false)}
          companyName={companyName}
          chatGroupId={chatGroupId}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
});
