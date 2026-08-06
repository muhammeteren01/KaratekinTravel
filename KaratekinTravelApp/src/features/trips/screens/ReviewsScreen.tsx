import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import RatingStars from "@/shared/ui/RatingStars";
import { AppHeader } from "@/shared/ui";
import { ReviewCard } from "@/shared/ui";

interface ReviewsScreenProps {
  onBack: () => void;
  tripData?: any;
}
interface ReviewItem {
  id: number;
  name: string;
  avatar?: { uri?: string; require?: any };
  rating: number;
  text: string;
  date?: string;
  isVerified?: boolean;
}

export default function ReviewsScreen({
  onBack,
  tripData,
}: ReviewsScreenProps) {
  const [filterRating, setFilterRating] = useState(0);
  const detail = useMemo(() => (tripData as any) || {}, [tripData]);
  const reviews: ReviewItem[] = (detail?.reviews as any[]) || [];
  const filteredReviews =
    filterRating === 0
      ? reviews
      : reviews.filter((r) => r.rating === filterRating);
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
      : 0;
  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } as Record<
    number,
    number
  >;
  reviews.forEach((r) => {
    const k = r.rating || 0;
    if (ratingCounts[k] !== undefined) ratingCounts[k]++;
  });

  const renderStars = (rating: number) => (
    <View style={styles.starsContainer}>
      <RatingStars value={rating} size={14} color="#FFD700" />
    </View>
  );

  const renderRatingBar = (stars: number, count: number) => {
    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
    return (
      <TouchableOpacity
        style={styles.ratingRow}
        onPress={() => setFilterRating(filterRating === stars ? 0 : stars)}
      >
        <Text style={styles.ratingRowText}>{stars}</Text>
        <Ionicons name="star" size={16} color="#FFD700" />
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${percentage}%` }]} />
        </View>
        <Text style={styles.ratingCount}>({count})</Text>
      </TouchableOpacity>
    );
  };

  const renderReviewCard = ({ item }: { item: ReviewItem }) => (
    <ReviewCard
      avatar={
        item?.avatar?.require ||
        (item?.avatar?.uri ? { uri: item.avatar.uri } : undefined)
      }
      name={item.name}
      rating={item.rating}
      date={item.date}
      text={item.text}
      style={{ marginBottom: 16 }}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor="transparent" translucent />
      <AppHeader
        title="Geri Bildirimler"
        onBack={onBack}
        backgroundColor="white"
      />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.overallCard}>
          <View style={styles.overallLeft}>
            <Text style={styles.averageRating}>{averageRating.toFixed(1)}</Text>
            {renderStars(Math.round(averageRating))}
            <Text style={styles.totalReviews}>
              {reviews.length} değerlendirme
            </Text>
          </View>
          <View style={styles.ratingsBreakdown}>
            {[5, 4, 3, 2, 1].map((stars) => (
              <View key={stars}>
                {renderRatingBar(stars, ratingCounts[stars])}
              </View>
            ))}
          </View>
        </View>
        {filterRating > 0 && (
          <View style={styles.filterInfo}>
            <Text style={styles.filterText}>
              {filterRating} yıldızlı değerlendirmeler ({filteredReviews.length}{" "}
              sonuç)
            </Text>
            <TouchableOpacity onPress={() => setFilterRating(0)}>
              <Text style={styles.clearFilter}>Temizle</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.reviewsList}>
          <FlatList
            data={filteredReviews}
            renderItem={renderReviewCard}
            keyExtractor={(i) => String(i.id)}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollView: {
    flex: 1,
  },
  overallCard: {
    backgroundColor: "white",
    margin: 20,
    padding: 24,
    borderRadius: 16,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  overallLeft: {
    alignItems: "center",
    marginRight: 32,
  },
  averageRating: {
    fontSize: 48,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  totalReviews: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
  },
  ratingsBreakdown: {
    flex: 1,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  ratingRowText: {
    fontSize: 14,
    color: "#333",
    marginRight: 4,
  },
  progressBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: "#F0F0F0",
    borderRadius: 4,
    marginHorizontal: 8,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#FFD700",
    borderRadius: 4,
  },
  ratingCount: {
    fontSize: 12,
    color: "#666",
    minWidth: 30,
  },
  filterInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#E3F2FD",
    marginHorizontal: 20,
    borderRadius: 8,
    marginBottom: 16,
  },
  filterText: {
    fontSize: 14,
    color: "#FF6B35",
    fontWeight: "500",
  },
  clearFilter: {
    fontSize: 14,
    color: "#FF6B35",
    fontWeight: "600",
  },
  reviewsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  starsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
});
