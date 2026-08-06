import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";

export interface SegmentedTabsProps {
  items: string[];
  value: string;
  onChange: (value: string) => void;
  size?: "sm" | "md" | "lg";
  variant?: "filled" | "outline";
  scrollable?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  tabStyle?: ViewStyle;
  activeTabStyle?: ViewStyle;
  textStyle?: TextStyle;
  activeTextStyle?: TextStyle;
}

const sizeTokens = {
  sm: { paddingV: 8, paddingH: 12, fontSize: 13, gap: 8 },
  md: { paddingV: 10, paddingH: 16, fontSize: 14, gap: 12 },
  lg: { paddingV: 12, paddingH: 20, fontSize: 16, gap: 16 },
};

const variants = {
  filled: {
    container: { backgroundColor: "#F8F9FA", borderRadius: 12, padding: 4 },
    tab: { backgroundColor: "transparent", borderRadius: 8 },
    activeTab: {
      backgroundColor: "#FFFFFF",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    text: { color: "#666" },
    activeText: { color: "#333", fontWeight: "600" as const },
  },
  outline: {
    container: { backgroundColor: "transparent", gap: 8 },
    tab: {
      backgroundColor: "#FFFFFF",
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "#E0E0E0",
    },
    activeTab: { backgroundColor: "#FF6B35", borderColor: "#FF6B35" },
    text: { color: "#666" },
    activeText: { color: "#FFFFFF", fontWeight: "600" as const },
  },
};

const SegmentedTabs: React.FC<SegmentedTabsProps> = ({
  items,
  value,
  onChange,
  size = "md",
  variant = "outline",
  scrollable = true,
  style,
  contentContainerStyle,
  tabStyle,
  activeTabStyle,
  textStyle,
  activeTextStyle,
}) => {
  const t = sizeTokens[size];
  const v = variants[variant];

  const renderTabs = () => (
    <>
      {items.map((item, index) => {
        const isActive = value === item;
        return (
          <TouchableOpacity
            key={index}
            style={[
              styles.tab,
              v.tab,
              { paddingVertical: t.paddingV, paddingHorizontal: t.paddingH },
              tabStyle,
              isActive && v.activeTab,
              isActive && activeTabStyle,
            ]}
            onPress={() => onChange(item)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.text,
                v.text,
                { fontSize: t.fontSize },
                textStyle,
                isActive && v.activeText,
                isActive && activeTextStyle,
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        );
      })}
    </>
  );

  if (scrollable) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={style}
        contentContainerStyle={[
          styles.scrollContainer,
          v.container,
          { gap: t.gap },
          contentContainerStyle,
        ]}
      >
        {renderTabs()}
      </ScrollView>
    );
  }

  return (
    <View style={[styles.container, v.container, { gap: t.gap }, style]}>
      {renderTabs()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  scrollContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  tab: {
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontWeight: "500",
  },
});

export default SegmentedTabs;
