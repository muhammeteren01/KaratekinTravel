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
import PriceBadge from "@/shared/ui/PriceBadge";

export interface GridTripCardProps {
  image: ImageSourcePropType;
  title: string;
  locationText: string;
  priceText?: string;
  rating?: number;
  onPress?: () => void;
}

const GridTripCard: React.FC<GridTripCardProps> = ({
  image,
  title,
  locationText,
  priceText,
  rating,
  onPress,
}) => {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.card}>
      <View style={styles.imageWrap}>
        <Image source={image} style={styles.image} />
        {!!priceText && (
          <PriceBadge
            text={priceText}
            bgColor="#FFFFFF"
            textColor="#FF7029"
            style={styles.priceBadge}
          />
        )}
        {typeof rating === "number" && (
          <View style={styles.ratingPill}>
            <Text style={styles.ratingText}>{`${rating.toFixed(1)}/5`}</Text>
            <Ionicons name="star" size={12} color="#FFD336" />
          </View>
        )}
      </View>

      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.locationRow}>
        <Ionicons name="location-outline" size={14} color="#7D848D" />
        <Text style={styles.locationText} numberOfLines={1}>
          {locationText}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    marginBottom: 16,
    marginHorizontal: "1%",
  },
  imageWrap: {
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 10,
  },
  image: { width: "100%", height: 150 },
  ratingPill: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EAF6FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  ratingText: { fontSize: 12, color: "#1B1E28", fontWeight: "600" },
  priceBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  title: { fontSize: 14, fontWeight: "600", color: "#1B1E28", marginBottom: 6 },
  locationRow: { flexDirection: "row", alignItems: "center" },
  locationText: { fontSize: 12, color: "#7D848D", marginLeft: 6 },
});

export default GridTripCard;
