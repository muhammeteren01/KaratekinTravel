// moved from src/screens/ChatsScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ScrollView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader, SearchBar } from "@/shared/ui";
import { useSupportingData } from "@/features/trips/hooks";
import { LoadingView, ErrorView } from "@/shared/ui";
// TODO: migrate chats to data layer; using empty list placeholder for now
export interface ChatItem {
  id: string;
  groupName: string;
  lastMessage: string;
  time: string;
  isActive: boolean;
  avatar: string;
}

interface ChatsScreenProps {
  onBack: () => void;
  onChatPress: (chat: ChatItem) => void;
}

export default function ChatsScreen({ onBack, onChatPress }: ChatsScreenProps) {
  const [searchText, setSearchText] = useState("");
  const { data: supporting, isLoading, isError, refetch } = useSupportingData();
  if (isLoading) return <LoadingView />;
  if (isError) return <ErrorView onRetry={refetch} />;
  const chatGroups: ChatItem[] = supporting?.chats?.groups ?? [];

  const renderChatItem = ({ item }: { item: ChatItem }) => (
    <TouchableOpacity style={styles.chatItem} onPress={() => onChatPress(item)}>
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        {item.isActive && <View style={styles.activeIndicator} />}
        {!item.isActive && <View style={styles.inactiveIndicator} />}
      </View>

      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={styles.groupName}>{item.groupName}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        <Text
          style={[
            styles.lastMessage,
            item.isActive ? styles.activeMessage : styles.inactiveMessage,
          ]}
        >
          {item.lastMessage}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor="#F8F9FA" translucent={false} />
      <AppHeader
        title="Mesajlar"
        onBack={onBack}
        safeAreaTop
        right={
          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name="ellipsis-vertical" size={24} color="#333" />
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <SearchBar
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Gezi grubu arayın..."
          style={styles.searchContainer}
        />

        {/* Chat Groups List */}
        <View style={styles.chatList}>
          {chatGroups.map((item) => (
            <View key={item.id}>{renderChatItem({ item })}</View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#F8F9FA",
    marginTop: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EDEDED",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EDEDED",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 24,
    marginTop: 8,
  },
  searchContainer: {
    marginBottom: 24,
  },
  chatList: {
    paddingBottom: 100,
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E0E0E0",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F0F0F0",
  },
  activeIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4CAF50",
    borderWidth: 2,
    borderColor: "white",
  },
  inactiveIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#999",
    borderWidth: 2,
    borderColor: "white",
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  groupName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  time: {
    fontSize: 14,
    color: "#999",
  },
  lastMessage: {
    fontSize: 14,
    fontWeight: "400",
  },
  activeMessage: {
    color: "#24BAEC",
  },
  inactiveMessage: {
    color: "#FF6B6B",
  },
});
