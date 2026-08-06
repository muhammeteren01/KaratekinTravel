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
import { PriceBadge } from "@/shared/ui";
import { BlurView } from "expo-blur";
import { theme } from "@/shared/theme";

export interface FeaturedTripCardProps {
  image: ImageSourcePropType;
  title: string;
  location: string;
  rating?: number | string;
  peopleCount?: string;
  avatars?: string[];
  bookmarked?: boolean;
  onToggleBookmark?: () => void;
  onPress?: () => void;
  priceText?: string;
}

const FeaturedTripCard: React.FC<FeaturedTripCardProps> = ({
  image,
  title,
  location,
  rating,
  peopleCount,
  avatars,
  bookmarked = false,
  onToggleBookmark,
  onPress,
  priceText,
}) => {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`${title} detaylarına git`}
      style={styles.card}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <View style={styles.imageWrap}>
        <Image source={image} style={styles.image} />
        {!!priceText && (
          <PriceBadge
            text={priceText}
            style={styles.priceBadge}
            textStyle={styles.priceText}
          />
        )}
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={
            bookmarked ? "Yer işaretini kaldır" : "Yer işareti ekle"
          }
          style={styles.bookmark}
          onPress={onToggleBookmark}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <BlurView intensity={30} tint="light" style={styles.bookmarkBlur}>
            <Ionicons
              name={bookmarked ? "bookmark" : "bookmark-outline"}
              size={18}
              color="#FFF"
            />
          </BlurView>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text allowFontScaling style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {typeof rating !== "undefined" && (
            <View style={styles.ratingChip}>
              <Ionicons name="star" size={12} color="#FFF" />
              <Text allowFontScaling style={styles.ratingText}>
                {String(rating)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color="#7D848D" />
          <Text allowFontScaling style={styles.locationText} numberOfLines={1}>
            {location}
          </Text>
        </View>

        {(peopleCount || (avatars && avatars.length > 0)) && (
          <View style={styles.peopleRow}>
            {avatars && avatars.length > 0 && (
              <AvatarsStack avatars={avatars} maxVisible={3} />
            )}
            {!!peopleCount && (
              <Text allowFontScaling style={styles.peopleText}>
                {peopleCount}
              </Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 280,
    backgroundColor: theme.palette.bg,
    borderRadius: theme.radii.xxl,
    marginRight: theme.spacing.lg,
    ...theme.shadows.card,
    overflow: "hidden",
  },
  imageWrap: {
    position: "relative",
  },
  image: {
    width: "100%",
    height: 200,
  },
  bookmark: {
    position: "absolute",
    top: theme.spacing.lg,
    right: theme.spacing.lg,
    borderRadius: 18,
    overflow: "hidden",
  },
  bookmarkBlur: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  priceBadge: {
    position: "absolute",
    top: theme.spacing.lg,
    left: theme.spacing.lg,
    backgroundColor: theme.palette.primary,
    borderRadius: theme.radii.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  priceText: {
    color: theme.palette.white,
    fontSize: theme.typography.xs,
    fontWeight: "700",
  },
  content: {
    padding: theme.spacing.lg,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: theme.typography.xl,
    fontWeight: "600",
    color: theme.palette.text,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  ratingChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.palette.brandBlue,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.radii.md,
    gap: 4,
  },
  ratingText: {
    color: theme.palette.white,
    fontSize: theme.typography.xs,
    fontWeight: "600",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  locationText: {
    marginLeft: 6,
    color: theme.palette.textMuted,
    fontSize: theme.typography.md,
    flex: 1,
  },
  peopleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  peopleText: {
    color: theme.palette.textMuted,
    fontSize: theme.typography.md,
    fontWeight: "500",
  },
});

export default FeaturedTripCard;
