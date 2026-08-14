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
// Kardes modullerden dogrudan import ediliyor. Barrel'dan (@/shared/ui)
// almak dongu olusturuyordu: barrel bu dosyayi, bu dosya barrel'i
// yukluyor. Metro bunu "Require cycle" diye uyariyor ve ilk yuklemede
// tanimsiz deger riski doguruyor.
import PriceBadge from "../PriceBadge";

export interface CalendarTripCardProps {
  image: ImageSourcePropType;
  title: string;
  location: string;
  date: string;
  time: string;
  onPress?: () => void;
  priceText?: string;
}

const CalendarTripCard: React.FC<CalendarTripCardProps> = ({
  image,
  title,
  location,
  date,
  time,
  onPress,
  priceText,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel="Takvim gezi kartı"
    >
      <Image source={image} style={styles.image} />

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>

        <View style={styles.locationRow}>
          <View style={styles.locationIcon}>
            <View style={styles.locationDot} />
            <View style={styles.locationCircle} />
          </View>
          <Text style={styles.locationText} numberOfLines={1}>
            {location}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="calendar-outline" size={16} color="#7D848D" />
            <Text style={styles.infoText}>{date}</Text>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={16} color="#7D848D" />
            <Text style={styles.infoText}>{time}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.arrowButton}
        accessibilityRole="button"
        accessibilityLabel="Takvimde ileri"
      >
        <Ionicons name="chevron-forward" size={20} color="#7D848D" />
      </TouchableOpacity>
      {!!priceText && (
        <PriceBadge
          text={priceText}
          style={styles.priceBadge}
          textStyle={styles.priceText}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 10,
    marginBottom: 12,
    alignItems: "center",
    position: "relative",
    shadowColor: "#B4BCC9",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.32,
    shadowRadius: 16,
    elevation: 3,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 16,
    marginRight: 16,
  },
  priceBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "#FF7029",
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 7,
    zIndex: 2,
  },
  priceText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1B1E28",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  locationIcon: {
    width: 16,
    height: 16,
    marginRight: 6,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  locationDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#7D848D",
    position: "absolute",
    top: 5.33,
    zIndex: 1,
  },
  locationCircle: {
    width: 12,
    height: 13.33,
    borderRadius: 6,
    borderWidth: 1.1,
    borderColor: "#7D848D",
    position: "absolute",
    top: 1.33,
  },
  locationText: {
    fontSize: 13,
    color: "#7D848D",
    letterSpacing: 0.3,
    flex: 1,
  },
  infoRow: {
    flexDirection: "row",
    gap: 12,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  infoText: {
    fontSize: 13,
    color: "#7D848D",
    letterSpacing: 0.3,
  },
  arrowButton: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F7F7F9",
    borderRadius: 12,
    marginLeft: 8,
  },
});

export default CalendarTripCard;
