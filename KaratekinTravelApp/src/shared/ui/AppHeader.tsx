import React, { ReactNode } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from "react-native";
import { theme } from "@/shared/theme";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface AppHeaderProps {
  title: string;
  onBack?: () => void;
  showBack?: boolean;
  left?: ReactNode;
  right?: ReactNode;
  backgroundColor?: string;
  titleColor?: string;
  iconColor?: string;
  /** Optional style override for right container (e.g., to fit long text). */
  rightContainerStyle?: StyleProp<ViewStyle>;
  /** Whether to add top padding equal to safe area inset. */
  safeAreaTop?: boolean;
  /** Compact height and spacing (good for content-dense screens) */
  compact?: boolean;
  /** Show a subtle bottom divider under the header */
  showDivider?: boolean;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  onBack,
  showBack = !!onBack,
  left,
  right,
  backgroundColor = "transparent",
  titleColor = theme.palette.text,
  iconColor = theme.palette.textSecondary,
  rightContainerStyle,
  safeAreaTop = false,
  compact = false,
  showDivider = false,
}) => {
  const insets = useSafeAreaInsets();
  const paddingTop = safeAreaTop ? insets.top : 0;
  return (
    <View
      style={[
        styles.appHeaderContainer,
        compact && styles.appHeaderCompact,
        showDivider && styles.appHeaderDivider,
        { backgroundColor, paddingTop },
      ]}
    >
      <View style={styles.appHeaderSide}>
        {showBack ? (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Geri"
            onPress={onBack}
            style={styles.appHeaderBackButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-back" size={24} color={iconColor} />
          </TouchableOpacity>
        ) : (
          left || <View style={styles.appHeaderPlaceholder} />
        )}
      </View>

      <View style={styles.appHeaderCenter}>
        <Text
          allowFontScaling
          numberOfLines={1}
          style={[styles.appHeaderTitle, { color: titleColor }]}
        >
          {title}
        </Text>
      </View>

      <View style={[styles.appHeaderSide, rightContainerStyle]}>
        {right || <View style={styles.appHeaderPlaceholder} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  appHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 4,
    minHeight: 56,
  },
  appHeaderCompact: {
    minHeight: 44,
    paddingVertical: 0,
  },
  appHeaderDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.palette.divider,
  },
  appHeaderSide: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  appHeaderBackButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  appHeaderPlaceholder: {
    width: 44,
    height: 44,
  },
  appHeaderCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 8,
  },
  appHeaderTitle: {
    fontSize: theme.typography.xl,
    fontWeight: "600",
    color: theme.palette.text,
    letterSpacing: 0.2,
  },
});

export default AppHeader;
