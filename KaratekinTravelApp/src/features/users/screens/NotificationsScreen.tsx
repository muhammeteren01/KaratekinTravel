import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { AppHeader, SegmentedTabs } from "@/shared/ui";
import { useNotifications } from "@/core/data/store";
import { LoadingView, ErrorView } from "@/shared/ui";
import type { NotificationItem } from "@/core/data/schemas";
import NotificationDetailScreen from "./NotificationDetailScreen";
import { SafeAreaView } from "react-native-safe-area-context";

interface NotificationsScreenProps {
  onBack: () => void;
}

export default function NotificationsScreen({
  onBack,
}: NotificationsScreenProps) {
  const { recent, archived, isLoading, isError, refetch } = useNotifications();
  if (isLoading) return <LoadingView />;
  if (isError) return <ErrorView onRetry={refetch} />;
  const [activeTab, setActiveTab] = useState<"recent" | "archive">("recent");
  const [recentList, setRecent] = useState<NotificationItem[]>(recent ?? []);
  const [archive, setArchive] = useState<NotificationItem[]>(archived ?? []);
  const currentList = useMemo(
    () => (activeTab === "recent" ? recentList : archive),
    [activeTab, recentList, archive],
  );
  const [selectedItem, setSelectedItem] = useState<NotificationItem | null>(
    null,
  );

  const handleDeleteAll = () => {
    if (currentList.length === 0) return;
    if (activeTab === "recent") setRecent([]);
    else setArchive([]);
  };
  const toggleArchive = (item: NotificationItem) => {
    if (activeTab === "recent") {
      setRecent((prev) => prev.filter((n) => n.id !== item.id));
      setArchive((prev) => [{ ...item }, ...prev]);
    } else {
      setArchive((prev) => prev.filter((n) => n.id !== item.id));
      setRecent((prev) => [{ ...item }, ...prev]);
    }
  };
  const handleOpenDetail = (item: NotificationItem) => setSelectedItem(item);
  const handleCloseDetail = () => setSelectedItem(null);
  const handleDeleteItem = (item: NotificationItem) => {
    if (activeTab === "recent") {
      setRecent((prev) => prev.filter((n) => n.id !== item.id));
    } else {
      setArchive((prev) => prev.filter((n) => n.id !== item.id));
    }
    handleCloseDetail();
  };
  const renderNotification = (item: NotificationItem) => (
    <TouchableOpacity
      key={item.id}
      style={styles.notificationItem}
      onPress={() => handleOpenDetail(item)}
      onLongPress={() => toggleArchive(item)}
      activeOpacity={0.8}
    >
      <View style={[styles.avatar, { backgroundColor: item.avatarColor }]}>
        <Text style={styles.avatarEmoji}>{item.avatarEmoji}</Text>
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationMessage}>{item.message}</Text>
      </View>
      <Text style={styles.notificationTime}>{item.time}</Text>
    </TouchableOpacity>
  );

  return selectedItem ? (
    <NotificationDetailScreen
      onBack={handleCloseDetail}
      item={selectedItem}
      isArchived={activeTab === "archive"}
      onArchiveToggle={(it) => {
        toggleArchive(it);
        handleCloseDetail();
      }}
      onDelete={handleDeleteItem}
    />
  ) : (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor="#ffffff" translucent={false} />
      <AppHeader
        title="Bildirimler"
        onBack={onBack}
        right={
          <TouchableOpacity
            onPress={handleDeleteAll}
            disabled={currentList.length === 0}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.deleteAllButton,
                currentList.length === 0 && { opacity: 0.4 },
              ]}
              numberOfLines={1}
            >
              Tümünü Sil
            </Text>
          </TouchableOpacity>
        }
        rightContainerStyle={{ width: 100, alignItems: "flex-end" }}
      />
      <View style={styles.tabsContainer}>
        <SegmentedTabs
          items={["En Son", "Arşiv"]}
          value={activeTab === "recent" ? "En Son" : "Arşiv"}
          onChange={(value) =>
            setActiveTab(value === "En Son" ? "recent" : "archive")
          }
          variant="filled"
          size="md"
          scrollable={false}
          style={{ paddingHorizontal: 0 }}
        />
      </View>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.todayContainer}>
          <Text style={styles.todayText}>Bugün</Text>
        </View>
        <View style={styles.notificationsList}>
          {currentList.map(renderNotification)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 16,
    backgroundColor: "#FFF",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  deleteAllButton: {
    fontSize: 16,
    color: "#FF6B35",
    fontWeight: "500",
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#FF6B35",
  },
  tabText: {
    fontSize: 16,
    color: "#999",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#FF6B35",
  },
  scrollView: {
    flex: 1,
  },
  todayContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  todayText: {
    fontSize: 16,
    color: "#999",
    fontWeight: "500",
  },
  notificationsList: {
    backgroundColor: "white",
    marginHorizontal: 0,
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: "#F0F0F0",
    backgroundColor: "white",
    minHeight: 80,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarEmoji: {
    fontSize: 24,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: "#999",
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
    color: "#999",
    marginLeft: 12,
  },
});
