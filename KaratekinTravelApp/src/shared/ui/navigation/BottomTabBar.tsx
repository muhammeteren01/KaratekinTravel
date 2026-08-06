import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/shared/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type BottomTab = "home" | "calendar" | "search" | "messages" | "profile";

export interface BottomTabBarProps {
  active: BottomTab;
  onPress: (tab: BottomTab) => void;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  centerButton?: {
    icon?: keyof typeof Ionicons.glyphMap;
    onPress?: () => void;
    backgroundColor?: string;
  };
}

/**
 * BottomTabBar
 * Matches existing bottom bars in HomeScreen and CompanyDetailScreen.
 */
const BottomTabBar: React.FC<BottomTabBarProps> = ({
  active,
  onPress,
  style,
  labelStyle,
  centerButton,
}) => {
  const insets = useSafeAreaInsets();
  const centerCfg = centerButton || { icon: "search" as const };
  return (
    <View
      style={[
        styles.tabBar,
        {
          paddingBottom: Math.max(20, insets.bottom || 0),
          backgroundColor: "#FFFFFF",
        },
        style,
      ]}
    >
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => onPress("home")}
        accessibilityRole="tab"
        accessibilityLabel="Anasayfa"
      >
        <Ionicons
          name="home"
          size={24}
          color={active === "home" ? theme.palette.primary : "#999"}
        />
        <Text
          allowFontScaling
          style={[
            styles.tabText,
            active === "home" && styles.activeTabText,
            labelStyle,
          ]}
        >
          Anasayfa
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => onPress("calendar")}
        accessibilityRole="tab"
        accessibilityLabel="Takvim"
      >
        <Ionicons
          name="calendar-outline"
          size={24}
          color={active === "calendar" ? theme.palette.primary : "#999"}
        />
        <Text
          allowFontScaling
          style={[
            styles.tabText,
            active === "calendar" && styles.activeTabText,
            labelStyle,
          ]}
        >
          Takvim
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.centerButton}
        onPress={centerCfg.onPress || (() => onPress("search"))}
        accessibilityRole="button"
        accessibilityLabel="Ara"
      >
        <Ionicons
          name={(centerCfg.icon as any) || "search"}
          size={28}
          color="white"
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => onPress("messages")}
        accessibilityRole="tab"
        accessibilityLabel="Mesajlar"
      >
        <Ionicons
          name="chatbubble-outline"
          size={24}
          color={active === "messages" ? theme.palette.primary : "#999"}
        />
        <Text
          allowFontScaling
          style={[
            styles.tabText,
            active === "messages" && styles.activeTabText,
            labelStyle,
          ]}
        >
          Mesajlar
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => onPress("profile")}
        accessibilityRole="tab"
        accessibilityLabel="Profil"
      >
        <Ionicons
          name="person-outline"
          size={24}
          color={active === "profile" ? theme.palette.primary : "#999"}
        />
        <Text
          allowFontScaling
          style={[
            styles.tabText,
            active === "profile" && styles.activeTabText,
            labelStyle,
          ]}
        >
          Profil
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xxl,
    borderTopWidth: 1,
    borderTopColor: theme.palette.border,
    alignItems: "center",
    justifyContent: "space-around",
    paddingBottom: 20,
  },
  tabItem: {
    alignItems: "center",
    flex: 1,
  },
  tabText: {
    fontSize: 12,
    color: "#999",
    marginTop: 6,
    fontWeight: "500",
  },
  activeTabText: {
    color: theme.palette.primary,
  },
  centerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.palette.primary,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 20,
    shadowColor: theme.palette.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default BottomTabBar;
