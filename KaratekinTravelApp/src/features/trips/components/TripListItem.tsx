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

export interface TripListItemProps {
  image: ImageSourcePropType;
  title: string;
  dateText: string;
  city: string;
  region: string;
  onPress?: () => void;
  priceText?: string;
}

const TripListItem: React.FC<TripListItemProps> = ({
  image,
  title,
  dateText,
  city,
  region,
  onPress,
  priceText,
}) => {
  return (
    <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.8}>
      <Image source={image} style={styles.thumb} />

      <View style={styles.center}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>

        <View style={styles.row}>
          <Ionicons name="calendar-outline" size={14} color="#7D848D" />
          <Text style={styles.subText}>{dateText}</Text>
        </View>

        <View style={[styles.row, { gap: 8 }]}>
          <Ionicons name="navigate-outline" size={14} color="#7D848D" />
          <Text style={styles.subText}>{city}</Text>
          <Text style={styles.subText}>{region}</Text>
        </View>
      </View>
      <View style={styles.rightCol}>
        {!!priceText && (
          <View style={styles.priceBadge}>
            <Text style={styles.priceText}>{priceText}</Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={20} color="#44474A" />
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
  rightCol: { alignItems: "flex-end", gap: 8 },
  thumb: {
    width: 60,
    height: 60,
    borderRadius: 16,
    marginRight: 12,
  },
  center: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1B1E28",
    marginBottom: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  subText: {
    color: "#7D848D",
    fontSize: 13,
  },
  priceBadge: {
    backgroundColor: "#FF7029",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 4,
  },
  priceText: { color: "#FFF", fontSize: 11, fontWeight: "700" },
});

export default TripListItem;
