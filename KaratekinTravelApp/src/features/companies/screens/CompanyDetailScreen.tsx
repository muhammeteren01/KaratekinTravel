// moved from src/screens/CompanyDetailScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader } from "@/shared/ui";
import { BottomTabBar } from "@/shared/ui";
import Badge from "@/shared/ui/Badge";
import { SectionHeader } from "@/shared/ui";
import { TripCard } from "@/shared/ui";
import RatingStars from "@/shared/ui/RatingStars";
import { ReviewCard } from "@/shared/ui";
import { resolveImage } from "@/core/data/schemas";
import { useCompanies } from "@/core/data/store";
import { useCompanyReviews } from "@/core/data/store";
import { useTrips, usePastTrips } from "@/features/trips/hooks";
import { LoadingView, ErrorView } from "@/shared/ui";
import { mapTripsSchemaToUi } from "@/core/data/adapters";
import type { Trip } from "@/types/trip";

interface CompanyDetailScreenProps {
  onBack: () => void;
  companyId: string;
  onTripPress?: (tripId: number, isPast: boolean) => void;
  onBookmarkTrip?: (trip: any) => void;
  isTripSaved?: (tripId: number) => boolean;
  onContactPress?: () => void;
  onBusInfoPress?: () => void;
  onTabPress?: (tab: string) => void;
}

export default function CompanyDetailScreen({
  onBack,
  companyId,
  onTripPress,
  onBookmarkTrip,
  isTripSaved,
  onContactPress,
  onBusInfoPress,
  onTabPress,
}: CompanyDetailScreenProps) {
  const {
    data: companies = [],
    isLoading: companiesLoading,
    isError: companiesError,
    refetch: refetchCompanies,
  } = useCompanies();
  const {
    data: tripsRaw = [],
    isLoading: tripsLoading,
    isError: tripsError,
    refetch: refetchTrips,
  } = useTrips();
  const allTrips: Trip[] = mapTripsSchemaToUi(tripsRaw);
  const {
    data: pastTripsData = [],
    isLoading: pastLoading,
    isError: pastError,
    refetch: refetchPast,
  } = usePastTrips();
  const {
    data: companyReviews = [],
    isLoading: reviewsLoading,
    isError: reviewsError,
    refetch: refetchReviews,
  } = useCompanyReviews();
  if (companiesLoading || tripsLoading || pastLoading || reviewsLoading)
    return <LoadingView />;
  if (companiesError || tripsError || pastError || reviewsError)
    return (
      <ErrorView
        onRetry={() => {
          companiesError && refetchCompanies();
          tripsError && refetchTrips();
          pastError && refetchPast();
          reviewsError && refetchReviews();
        }}
      />
    );
  const company = companies.find((c) => String(c.id) === String(companyId));
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<
    string | null
  >(null);
  const companyTripsCount = allTrips.filter(
    (t) => String(t.companyId) === String(companyId),
  ).length;
  const companyData = {
    name: company?.name || "Firma",
    trips: company?.tripsLabel || `${companyTripsCount}+`,
    participants: company?.participantsLabel || "350+",
    rating: (company?.rating ?? 4.5).toFixed(1),
    description: company?.about || "—",
    fullDescription: company?.fullAbout || company?.about || "—",
    logo: company?.logo,
  } as const;
  const currentTrips = allTrips
    .filter((t) => String(t.companyId) === String(companyId))
    .map((t) => ({
      id: t.id,
      title: t.title,
      location: t.location,
      date: t.dateRange,
      time: "08:30",
      participants: `${t.joinedCount}/${t.capacity}`,
      image: t.image,
    }));
  const past = pastTripsData
    .filter((p) => String(p.companyId ?? companyId) === String(companyId))
    .map((p: any) => ({
      id: p.id,
      title: p.title,
      location: p.location,
      date: p.date,
      time: undefined,
      image: resolveImage(p.image),
      // Show price if available; fallback to rating badge when no price
      priceText: p.priceText,
      ratingText: p.priceText
        ? undefined
        : typeof p.rating === "number"
          ? p.rating.toFixed(1)
          : undefined,
    }));
  // Filter company reviews for this company; fallback to empty if none
  const reviews = companyReviews.filter(
    (r) => String(r.companyId ?? "") === String(companyId),
  );

  const renderTripCard = (trip: any, isPast: boolean = false) => (
    <TripCard
      key={trip.id}
      image={trip.image}
      title={trip.title}
      locationText={trip.location}
      dateText={trip.date}
      timeText={trip.time}
      priceText={trip.priceText}
      ratingText={trip.ratingText}
      participantsText={!isPast ? trip.participants : undefined}
      showBookmark
      bookmarked={isTripSaved?.(trip.id) ?? false}
      onToggleBookmark={() => onBookmarkTrip?.(trip)}
      onPress={() => onTripPress?.(trip.id, isPast)}
    />
  );

  const renderReviewCard = (review: any) => (
    <View key={review.id}>
      <ReviewCard
        avatar={resolveImage(review.avatar) as any}
        name={review.name}
        rating={review.rating}
        date={review.date}
        text={review.comment}
        style={{ marginBottom: 16 }}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor="#FFFFFF" translucent={false} />
      <AppHeader
        title={companyData.name}
        onBack={onBack}
        safeAreaTop
        right={
          <Image
            source={
              resolveImage(company?.logo) || (resolveImage("asset:ob1") as any)
            }
            style={styles.companyAvatar}
          />
        }
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Company Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statsMainRow}>
            <View style={styles.statItem}>
              <Ionicons name="airplane-outline" size={16} color="#7D848D" />
              <Text style={styles.statText}>{companyData.trips}</Text>
            </View>

            <View style={styles.statItem}>
              <Ionicons name="people-outline" size={16} color="#7D848D" />
              <Text style={styles.statText}>{companyData.participants}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={onContactPress}
              activeOpacity={0.8}
            >
              <Ionicons name="call-outline" size={14} color="#FFFFFF" />
              <Text style={styles.contactButtonText}>İletişime Geç</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.busInfoButton}
              onPress={onBusInfoPress}
              activeOpacity={0.8}
            >
              <Ionicons name="bus-outline" size={14} color="#FFFFFF" />
              <Text style={styles.busInfoButtonText}>Otobüs Bilgileri</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.aboutSection}>
          <SectionHeader
            title={<Text style={styles.sectionTitle}>Firma Hakkında</Text>}
          />
          <Text style={styles.aboutText}>
            {showFullDescription
              ? companyData.fullDescription
              : companyData.description}
            {!showFullDescription && (
              <TouchableOpacity onPress={() => setShowFullDescription(true)}>
                <Text style={styles.readMoreText}> Read More</Text>
              </TouchableOpacity>
            )}
          </Text>
        </View>

        {/* Current Trips Section */}
        <View style={styles.tripsSection}>
          <SectionHeader
            title={<Text style={styles.sectionTitle}>Güncel Geziler</Text>}
          />
          <View style={styles.tripsList}>
            {currentTrips.map((trip) => renderTripCard(trip))}
          </View>
        </View>

        {/* Past Trips Section */}
        <View style={styles.tripsSection}>
          <SectionHeader
            title={<Text style={styles.sectionTitle}>Geçmiş Geziler</Text>}
          />
          <View style={styles.tripsList}>
            {past.map((trip: any) => renderTripCard(trip, true))}
          </View>

          {/* Progress Indicator */}
          <View style={styles.progressIndicator}>
            <View style={[styles.progressDot, styles.activeDot]} />
            <View style={styles.progressDot} />
            <View style={styles.progressDot} />
          </View>
        </View>

        {/* Reviews Section */}
        <View style={styles.reviewsSection}>
          <SectionHeader
            title={<Text style={styles.sectionTitle}>Değerlendirmeler</Text>}
            rightNode={
              <Badge
                text={companyData.rating}
                variant="orange"
                leftIcon={<Ionicons name="star" size={14} color="#FFFFFF" />}
                containerStyle={styles.ratingBadge}
                textStyle={styles.ratingBadgeText}
              />
            }
            containerStyle={styles.reviewsHeader}
          />

          {/* Rating Filter */}
          <View style={styles.ratingFilter}>
            <TouchableOpacity
              style={[
                styles.ratingOption,
                selectedRatingFilter === "8.5+" && styles.activeRatingOption,
              ]}
              onPress={() =>
                setSelectedRatingFilter(
                  selectedRatingFilter === "8.5+" ? null : "8.5+",
                )
              }
            >
              <Text
                style={[
                  styles.ratingOptionText,
                  selectedRatingFilter === "8.5+" &&
                    styles.activeRatingOptionText,
                ]}
              >
                8.5+
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.ratingOption,
                selectedRatingFilter === "6.5-8.5" && styles.activeRatingOption,
              ]}
              onPress={() =>
                setSelectedRatingFilter(
                  selectedRatingFilter === "6.5-8.5" ? null : "6.5-8.5",
                )
              }
            >
              <Text
                style={[
                  styles.ratingOptionText,
                  selectedRatingFilter === "6.5-8.5" &&
                    styles.activeRatingOptionText,
                ]}
              >
                6.5 - 8.5
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.ratingOption,
                selectedRatingFilter === "4.5-6.5" && styles.activeRatingOption,
              ]}
              onPress={() =>
                setSelectedRatingFilter(
                  selectedRatingFilter === "4.5-6.5" ? null : "4.5-6.5",
                )
              }
            >
              <Text
                style={[
                  styles.ratingOptionText,
                  selectedRatingFilter === "4.5-6.5" &&
                    styles.activeRatingOptionText,
                ]}
              >
                4.5 - 6.5
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.ratingOption,
                selectedRatingFilter === "2.5-4.5" && styles.activeRatingOption,
              ]}
              onPress={() =>
                setSelectedRatingFilter(
                  selectedRatingFilter === "2.5-4.5" ? null : "2.5-4.5",
                )
              }
            >
              <Text
                style={[
                  styles.ratingOptionText,
                  selectedRatingFilter === "2.5-4.5" &&
                    styles.activeRatingOptionText,
                ]}
              >
                2.5 - 4.5
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.ratingOption,
                selectedRatingFilter === "2.5-" && styles.activeRatingOption,
              ]}
              onPress={() =>
                setSelectedRatingFilter(
                  selectedRatingFilter === "2.5-" ? null : "2.5-",
                )
              }
            >
              <Text
                style={[
                  styles.ratingOptionText,
                  selectedRatingFilter === "2.5-" &&
                    styles.activeRatingOptionText,
                ]}
              >
                2.5 -
              </Text>
            </TouchableOpacity>
          </View>

          {/* Reviews List */}
          <View style={styles.reviewsList}>
            {reviews.map((review) => renderReviewCard(review))}
          </View>
        </View>
      </ScrollView>

      <BottomTabBar
        active={"home" as any}
        onPress={(tab) => onTabPress?.(tab)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  companyAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  content: {
    flex: 1,
    marginTop: 25,
  },
  statsContainer: {
    marginBottom: 16,
    paddingHorizontal: 30,
  },
  statsMainRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    gap: 20,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#7D848D",
    letterSpacing: 0.3,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF6B35",
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 5,
    gap: 8,
    width: 150,
    height: 34,
  },
  contactButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  busInfoButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF6B35",
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 5,
    gap: 8,
  },
  busInfoButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  aboutSection: {
    marginBottom: 32,
    paddingHorizontal: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1B1E28",
    marginBottom: 8,
  },
  aboutText: {
    fontSize: 13,
    fontWeight: "400",
    color: "#7D848D",
    lineHeight: 22,
  },
  readMoreText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FF6B35",
    lineHeight: 22,
  },
  tripsSection: {
    marginBottom: 32,
    paddingHorizontal: 14,
  },
  progressIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
    alignSelf: "center",
  },
  progressDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#CAEAFF",
  },
  activeDot: {
    width: 35,
    backgroundColor: "#FF6B35",
  },
  tripsList: {
    gap: 16,
  },
  tripCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    shadowColor: "#B4BCC9",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
    height: 123,
    flexDirection: "row",
    overflow: "hidden",
  },
  bookmarkButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  tripCardImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
    margin: 10,
  },
  tripCardContent: {
    flex: 1,
    padding: 14,
    paddingLeft: 0,
    justifyContent: "space-between",
  },
  tripCardTop: {
    gap: 8,
  },
  tripCardTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1B1E28",
    letterSpacing: 0.5,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    fontSize: 13,
    fontWeight: "400",
    color: "#7D848D",
    letterSpacing: 0.3,
  },
  participantsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  participantsText: {
    fontSize: 13,
    fontWeight: "400",
    color: "#7D848D",
    letterSpacing: 0.3,
  },
  tripCardBottom: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dateTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dateTimeText: {
    fontSize: 13,
    fontWeight: "400",
    color: "#7D848D",
    letterSpacing: 0.3,
  },
  reviewsSection: {
    marginBottom: 40,
    paddingHorizontal: 14,
  },
  reviewsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF6B35",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 8,
  },
  ratingBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  ratingFilter: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 24,
  },
  ratingOption: {
    backgroundColor: "#FAFAFA",
    borderWidth: 1,
    borderColor: "#ECEDF0",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 60,
    alignItems: "center",
  },
  activeRatingOption: {
    backgroundColor: "#F0F0F0",
    borderColor: "#D0D0D0",
  },
  ratingOptionText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#7D848D",
  },
  activeRatingOptionText: {
    color: "#1B1E28",
    fontWeight: "600",
  },
  reviewsList: {
    gap: 16,
  },
  reviewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#B4BCC9",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },
  reviewHeader: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 16,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.16,
    shadowRadius: 15,
    elevation: 10,
  },
  reviewUserInfo: {
    flex: 1,
    gap: 4,
  },
  reviewUserName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    letterSpacing: -0.16,
  },
  reviewTripInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 18,
  },
  reviewTripName: {
    fontSize: 13,
    fontWeight: "400",
    color: "#7D848D",
    letterSpacing: 0.3,
  },
  reviewDate: {
    fontSize: 13,
    fontWeight: "400",
    color: "#7D848D",
    letterSpacing: 0.3,
  },
  starsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  reviewComment: {
    fontSize: 12,
    fontWeight: "400",
    color: "#000000",
    lineHeight: 18,
  },
});
