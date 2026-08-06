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
import InfoRow from "@/shared/ui/InfoRow";
import AvatarsStack from "@/shared/ui/AvatarsStack";
import PriceBadge from "@/shared/ui/PriceBadge";

export type TripCardVariant = "basic" | "detailed" | "past" | "calendar";

export interface TripCardProps {
  image: ImageSourcePropType;
  title: string;
  priceText?: string;
  ratingText?: string;
  locationText?: string;
  dateText?: string;
  timeText?: string;
  participantsText?: string;
  avatars?: string[];
  bookmarked?: boolean;
  showBookmark?: boolean;
  variant?: TripCardVariant;
  onPress?: () => void;
  onToggleBookmark?: () => void;
}

const TripCard: React.FC<TripCardProps> = ({
  image,
  title,
  priceText,
  ratingText,
  locationText,
  dateText,
  timeText,
  participantsText,
  avatars,
  bookmarked = false,
  showBookmark = false,
  variant = "basic",
  onPress,
  onToggleBookmark,
}) => {
  return (
    <TouchableOpacity
      style={styles.tripCardContainer}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {showBookmark && (
        <TouchableOpacity
          style={styles.tripCardBookmarkButton}
          onPress={onToggleBookmark}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={bookmarked ? "bookmark" : "bookmark-outline"}
            size={20}
            color={bookmarked ? "#FF6B35" : "#7D848D"}
          />
        </TouchableOpacity>
      )}
      <Image source={image} style={styles.tripCardImage} />
      <View style={styles.tripCardContent}>
        <View style={styles.tripCardHeaderRow}>
          <Text style={styles.tripCardTitle}>{title}</Text>
          {priceText && (
            <PriceBadge text={priceText} style={styles.tripCardPriceTag} />
          )}
          {ratingText && !priceText && (
            <View style={styles.tripCardRatingTag}>
              <Ionicons name="star" size={12} color="#FFF" />
              <Text style={styles.tripCardRatingText}>{ratingText}</Text>
            </View>
          )}
        </View>

        {variant !== "calendar" && locationText && (
          <View style={styles.tripCardLocationRow}>
            <InfoRow
              icon="location-outline"
              text={locationText}
              color="#999"
              iconSize={14}
            />
          </View>
        )}

        <View style={styles.tripCardMetaRows}>
          {dateText && <InfoRow icon="calendar-outline" text={dateText} />}
          {timeText && <InfoRow icon="time-outline" text={timeText} />}
        </View>

        {(participantsText || (avatars && avatars.length > 0)) && (
          <View style={styles.tripCardParticipantsRow}>
            {avatars && avatars.length > 0 && (
              <AvatarsStack avatars={avatars} />
            )}
            {participantsText && (
              <Text style={styles.tripCardParticipantsText}>
                {participantsText}
              </Text>
            )}
          </View>
        )}
      </View>
      {variant === "calendar" && (
        <TouchableOpacity style={styles.tripCardChevronButton}>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tripCardContainer: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E6E6EA",
    marginBottom: 16,
    overflow: "hidden",
  },
  tripCardBookmarkButton: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  tripCardImage: {
    width: "100%",
    height: 140,
  },
  tripCardContent: {
    padding: 16,
  },
  tripCardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  tripCardTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginRight: 12,
  },
  tripCardPriceTag: {
    backgroundColor: "#FFF",
    borderColor: "#FF6B35",
    borderWidth: 2,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tripCardRatingTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#24BAEC",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tripCardRatingText: {
    fontSize: 12,
    color: "#FFF",
    fontWeight: "600",
  },
  tripCardLocationRow: {
    marginBottom: 8,
  },
  tripCardMetaRows: {
    gap: 8,
  },
  tripCardParticipantsRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  tripCardParticipantsText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  tripCardChevronButton: {
    position: "absolute",
    right: 12,
    top: "50%",
    marginTop: -10,
  },
});

export default TripCard;
