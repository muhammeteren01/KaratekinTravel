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

export interface FilterChipsProps {
  items: string[];
  selected: string[] | string;
  onSelect: (value: string) => void;
  multiple?: boolean;
  scrollable?: boolean;
  variant?: "filled" | "outline";
  style?: ViewStyle;
  chipStyle?: ViewStyle;
  activeChipStyle?: ViewStyle;
  textStyle?: TextStyle;
  activeTextStyle?: TextStyle;
}

const variants = {
  filled: {
    chip: { backgroundColor: "#F5F5F5", borderRadius: 20, borderWidth: 0 },
    activeChip: { backgroundColor: "#FF6B35" },
    text: { color: "#666", fontSize: 14, fontWeight: "500" as const },
    activeText: { color: "#FFFFFF", fontWeight: "600" as const },
  },
  outline: {
    chip: {
      backgroundColor: "transparent",
      borderRadius: 20,
      borderWidth: 1,
      borderColor: "#E0E0E0",
    },
    activeChip: { backgroundColor: "#FF6B35", borderColor: "#FF6B35" },
    text: { color: "#666", fontSize: 14, fontWeight: "500" as const },
    activeText: { color: "#FFFFFF", fontWeight: "600" as const },
  },
};

const FilterChips: React.FC<FilterChipsProps> = ({
  items,
  selected,
  onSelect,
  multiple = false,
  scrollable = true,
  variant = "filled",
  style,
  chipStyle,
  activeChipStyle,
  textStyle,
  activeTextStyle,
}) => {
  const v = variants[variant];

  const isSelected = (item: string): boolean => {
    if (Array.isArray(selected)) {
      return selected.includes(item);
    }
    return selected === item;
  };

  const renderChips = () => (
    <>
      {items.map((item, index) => {
        const active = isSelected(item);
        return (
          <TouchableOpacity
            key={index}
            style={[
              styles.chip,
              v.chip,
              chipStyle,
              active && v.activeChip,
              active && activeChipStyle,
            ]}
            onPress={() => onSelect(item)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.text,
                v.text,
                textStyle,
                active && v.activeText,
                active && activeTextStyle,
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
        style={[styles.scrollView, style]}
        contentContainerStyle={styles.scrollContainer}
      >
        {renderChips()}
      </ScrollView>
    );
  }

  return <View style={[styles.container, style]}>{renderChips()}</View>;
};

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 0,
  },
  scrollContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
  },
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingHorizontal: 20,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    // Base text style - variants override
  },
});

export default FilterChips;
