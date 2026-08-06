import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ImageSourcePropType,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AvatarsStack from "../../../shared/ui/AvatarsStack";
import { theme } from "@/shared/ui/theme";

export interface AllTripsListCardProps {
  image: ImageSourcePropType;
  title: string;
  dateText: string;
  capacityText: string; // e.g., Kapasite 50 Kişi
  joinedText: string; // e.g., 24 Kişi Katıldı
  priceText: string; // e.g., $720
  avatars: string[];
  onPress?: () => void;
}

const AllTripsListCard: React.FC<AllTripsListCardProps> = ({
  image,
  title,
  dateText,
  capacityText,
  joinedText,
  priceText,
  avatars,
  onPress,
}) => {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`${title} gezi detayları`}
      activeOpacity={0.9}
      onPress={onPress}
      style={styles.card}
    >
      <Image source={image} style={styles.thumbnail} />

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text allowFontScaling numberOfLines={1} style={styles.title}>
            {title}
          </Text>
          <View style={styles.priceBadge}>
            <Text allowFontScaling style={styles.priceText}>
              {priceText}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.iconText}>
            <Ionicons name="calendar-outline" size={16} color="#7D848D" />
            <Text allowFontScaling style={styles.subText}>
              {dateText}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.iconText}>
            <Ionicons name="people-outline" size={16} color="#7D848D" />
            <Text allowFontScaling style={styles.subText}>
              {capacityText}
            </Text>
          </View>
        </View>

        <View style={styles.footerRow}>
          <AvatarsStack
            avatars={avatars}
            maxVisible={3}
            size={24}
            overlap={-8}
          />
          <Text allowFontScaling style={styles.subText}>
            {joinedText}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: theme.palette.bg,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.soft,
  },
  thumbnail: {
    width: 95,
    height: 116,
    borderRadius: theme.radii.lg,
    marginRight: theme.spacing.md,
    resizeMode: "cover",
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.sm,
  },
  title: {
    flex: 1,
    color: theme.palette.text,
    fontSize: theme.typography.lg,
    fontWeight: "600",
    letterSpacing: 0.5,
    paddingRight: theme.spacing.sm,
  },
  priceBadge: {
    backgroundColor: theme.palette.primary,
    borderRadius: theme.radii.sm,
    paddingHorizontal: theme.spacing.sm,
    height: 24,
    minWidth: 44,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: theme.spacing.sm,
  },
  priceText: {
    color: theme.palette.white,
    fontSize: theme.typography.xs,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  iconText: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6 as unknown as number, // RN doesn't support gap yet; kept for web compatibility
  },
  subText: {
    color: theme.palette.textMuted,
    fontSize: 13,
    lineHeight: 18,
    marginLeft: 8,
    letterSpacing: 0.3,
  },
  footerRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 8 as unknown as number,
  },
});

export default AllTripsListCard;
