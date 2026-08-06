import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppHeader, Button } from "@/shared/ui";
import type { NotificationItem } from "@/core/data/schemas";

interface NotificationDetailScreenProps {
  onBack: () => void;
  item: NotificationItem;
  isArchived?: boolean;
  onArchiveToggle?: (item: NotificationItem) => void;
  onDelete?: (item: NotificationItem) => void;
}

const NotificationDetailScreen: React.FC<NotificationDetailScreenProps> = ({
  onBack,
  item,
  isArchived = false,
  onArchiveToggle,
  onDelete,
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Bildirim" onBack={onBack} />
      <View style={styles.content}>
        <View style={[styles.avatar, { backgroundColor: item.avatarColor }]}>
          <Text style={styles.avatarEmoji}>{item.avatarEmoji}</Text>
        </View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.time}>{item.time}</Text>
        <Text style={styles.message}>{item.message}</Text>
        <View style={styles.actions}>
          <Button
            title={isArchived ? "Arşivden Çıkar" : "Arşive Al"}
            onPress={() => onArchiveToggle?.(item)}
            variant="primary"
            style={styles.primaryBtn}
          />
          <Button
            title="Sil"
            onPress={() => onDelete?.(item)}
            variant="danger"
            style={styles.dangerBtn}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  content: { padding: 20, gap: 12 },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 8,
  },
  avatarEmoji: { fontSize: 28 },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1B1E28",
    textAlign: "center",
  },
  time: {
    fontSize: 12,
    color: "#7D848D",
    textAlign: "center",
    marginBottom: 8,
  },
  message: { fontSize: 16, color: "#333", lineHeight: 22, textAlign: "center" },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
    alignSelf: "center",
  },
  primaryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#FF6B35",
  },
  primaryBtnText: { color: "#FFF", fontWeight: "700" },
  dangerBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#FF6B35",
    borderWidth: 1,
    borderColor: "#FF6B35",
  },
  dangerBtnText: { color: "#FF6B35", fontWeight: "700" },
});

export default NotificationDetailScreen;
