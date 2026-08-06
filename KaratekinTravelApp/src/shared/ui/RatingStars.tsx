import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface RatingStarsProps {
  value: number; // 0-5
  size?: number;
  color?: string;
  onChange?: (value: number) => void; // editable if provided
}

const MAX_STARS = 5 as const;

const RatingStars: React.FC<RatingStarsProps> = ({
  value,
  size = 16,
  color = "#FFD700",
  onChange,
}) => {
  const stars = [] as React.ReactNode[];
  for (let i = 1; i <= MAX_STARS; i += 1) {
    const filled = i <= value;
    const iconName = filled ? "star" : "star-outline";
    const starEl = (
      <Ionicons key={i} name={iconName as any} size={size} color={color} />
    );
    if (onChange) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => onChange(i)}
          style={styles.ratingStarsTouchable}
          hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
        >
          {starEl}
        </TouchableOpacity>,
      );
    } else {
      stars.push(starEl);
    }
  }
  return <View style={styles.ratingStarsContainer}>{stars}</View>;
};

const styles = StyleSheet.create({
  ratingStarsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingStarsTouchable: {
    marginRight: 2,
  },
});

export default RatingStars;
