import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ImageSourcePropType,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import PriceBadge from "@/shared/ui/PriceBadge";

export type TripListCardVariant = "simple" | "allTrips"; // unify TripListItem + AllTripsListCard

export interface TripListCardProps {
  image: ImageSourcePropType;
  title: string;
  dateText?: string;
  city?: string;
  region?: string;
  locationText?: string; // for allTrips
  priceText?: string;
  capacityText?: string;
  joinedText?: string;
  avatars?: string[];
  rightChevron?: boolean;
  onPress?: () => void;
  variant?: TripListCardVariant;
  containerStyle?: ViewStyle; // allow per-screen width/margin overrides
}

const TripListCard: React.FC<TripListCardProps> = ({
  image,
  title,
  dateText,
  city,
  region,
  locationText,
  priceText,
  capacityText,
  joinedText,
  avatars,
  rightChevron = true,
  onPress,
  variant = "simple",
  containerStyle,
}) => {
  const isAll = variant === "allTrips";
  return (
    <TouchableOpacity
      style={[styles.item, isAll && styles.itemAll, containerStyle]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Image source={image} style={[styles.thumb, isAll && styles.thumbAll]} />

      <View style={styles.center}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {!!priceText && (
            <PriceBadge
              text={priceText}
              style={[styles.priceBadge, isAll && styles.priceBadgeAll]}
              textStyle={[styles.priceText, isAll && styles.priceTextAll]}
            />
          )}
        </View>

        {!!dateText && (
          <View style={styles.row}>
            <Ionicons name="calendar-outline" size={14} color="#7D848D" />
            <Text style={styles.subText}>{dateText}</Text>
          </View>
        )}

        {isAll ? (
          <>
            {!!capacityText && (
              <View style={styles.row}>
                <Ionicons name="people-outline" size={16} color="#7D848D" />
                <Text style={styles.subText}>{capacityText}</Text>
              </View>
            )}
            {!!joinedText && (
              <View style={[styles.row, { marginTop: 2 }]}>
                {/* AvatarsStack kept external to avoid circular import; pass a small count text instead */}
                <Text style={styles.subText}>{joinedText}</Text>
              </View>
            )}
          </>
        ) : (
          <View style={[styles.row, { gap: 8 }]}>
            {(city || locationText) && (
              <>
                <Ionicons name="navigate-outline" size={14} color="#7D848D" />
                <Text style={styles.subText}>{city || locationText}</Text>
                {!!region && <Text style={styles.subText}>{region}</Text>}
              </>
            )}
          </View>
        )}
      </View>

      <View style={styles.rightCol}>
        {rightChevron && (
          <Ionicons name="chevron-forward" size={20} color="#44474A" />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 8,
    marginHorizontal: 24,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  itemAll: {
    marginHorizontal: 20,
    padding: 12,
  },
  thumb: { width: 60, height: 60, borderRadius: 16, marginRight: 12 },
  thumbAll: { width: 95, height: 116, borderRadius: 16, marginRight: 12 },
  center: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1B1E28",
    marginBottom: 6,
    flex: 1,
    paddingRight: 8,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  subText: { color: "#7D848D", fontSize: 13 },
  priceBadge: {
    backgroundColor: "#FF7029",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 4,
    left: 28,
  },
  priceBadgeAll: {
    backgroundColor: "#FF6B35",
    height: 24,
    minWidth: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  priceText: { color: "#FFF", fontSize: 11, fontWeight: "700" },
  priceTextAll: { fontSize: 12 },
  rightCol: { paddingLeft: 8, justifyContent: "center", alignItems: "center" },
});

export default TripListCard;
