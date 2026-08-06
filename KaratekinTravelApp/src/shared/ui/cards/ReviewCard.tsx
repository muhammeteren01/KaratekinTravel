import React from "react";
import { View, Text, StyleSheet, Image, ViewStyle } from "react-native";
import RatingStars from "@/shared/ui/RatingStars";

export interface ReviewCardProps {
  avatar?: { uri?: string } | number; // allow require() number or uri
  name: string;
  rating: number;
  date?: string;
  text: string;
  style?: ViewStyle;
  verified?: boolean;
}

const ReviewCard: React.FC<ReviewCardProps> = ({
  avatar,
  name,
  rating,
  date,
  text,
  style,
}) => {
  const renderAvatar = () => {
    if (typeof avatar === "number")
      return <Image source={avatar} style={styles.avatar} />;
    if (avatar?.uri)
      return <Image source={{ uri: avatar.uri }} style={styles.avatar} />;
    return <View style={[styles.avatar, { backgroundColor: "#E9ECEF" }]} />;
  };
  return (
    <View style={[styles.card, style]}>
      <View style={styles.header}>
        {renderAvatar()}
        <View style={styles.info}>
          <Text style={styles.name}>{name}</Text>
          <View style={styles.metaRow}>
            <RatingStars value={rating} size={14} color="#ECA61B" />
            {!!date && <Text style={styles.date}>{date}</Text>}
          </View>
        </View>
      </View>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: "600", color: "#333" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  date: { fontSize: 12, color: "#999" },
  text: { fontSize: 14, color: "#666", lineHeight: 22 },
});

export default ReviewCard;
