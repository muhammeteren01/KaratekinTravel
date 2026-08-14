import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ImageBackground,
  Animated,
  Dimensions,
  PanResponder,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import InfoRow from "@/shared/ui/InfoRow";
import AvatarsStack from "@/shared/ui/AvatarsStack";
import { AppHeader, Badge, RatingStars, Button } from "@/shared/ui";
import { ReviewCard } from "@/shared/ui";
import { SectionHeader } from "@/shared/ui";
import { resolveImage } from "@/core/data/schemas";
import { openInMaps, mapQueryFromTrip } from "@/utils/maps";

interface PastTripDetailScreenProps {
  onBack: () => void;
  tripData?: any;
  onShowAllReviews?: (tripData: any) => void;
}

interface TimelineItem {
  id: number;
  title: string;
  time: string;
  image: any;
  isCompleted?: boolean;
}

const { height: screenHeight } = Dimensions.get("window");

export default function PastTripDetailScreen({
  onBack,
  tripData,
  onShowAllReviews,
}: PastTripDetailScreenProps) {
  const [bottomSheetY] = useState(new Animated.Value(screenHeight - 150));
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTextExpanded, setIsTextExpanded] = useState(false);
  // Haritada aranacak metin tur kaydindan turetiliyor; yoksa buton pasif.
  const mapQuery = mapQueryFromTrip(tripData);

  // Normalize images from supportingData (asset keys/urls) into RN ImageSourcePropType
  const detail = useMemo(() => {
    const raw = (tripData as any) || {};
    const mappedGallery = Array.isArray(raw.gallery)
      ? raw.gallery.map((g: any) => resolveImage(g))
      : [];
    const mappedTimeline = Array.isArray(raw.timeline)
      ? raw.timeline.map((t: any) => ({ ...t, image: resolveImage(t.image) }))
      : [];
    const mappedReviews = Array.isArray(raw.reviews)
      ? raw.reviews.map((r: any) => {
          const avatar = r?.avatar || {};
          // If JSON provided avatar.require as an asset key string, resolve to RN source
          const resolvedRequire = avatar?.require
            ? resolveImage(avatar.require)
            : undefined;
          return {
            ...r,
            avatar: {
              uri: avatar?.uri,
              require: resolvedRequire,
            },
          };
        })
      : [];
    return {
      ...raw,
      image: resolveImage(raw.image),
      headerImage: resolveImage(raw.headerImage) || resolveImage(raw.image),
      gallery: mappedGallery,
      timeline: mappedTimeline,
      reviews: mappedReviews,
    };
  }, [tripData]);

  const timelineItems: TimelineItem[] = (detail?.timeline as any) || [];

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dy) > 5;
    },
    onPanResponderMove: (evt, gestureState) => {
      const currentPosition = isExpanded
        ? screenHeight - 600
        : screenHeight - 150;
      let newPosition = currentPosition + gestureState.dy;

      newPosition = Math.max(
        screenHeight - 600,
        Math.min(screenHeight - 150, newPosition),
      );

      bottomSheetY.setValue(newPosition);
    },
    onPanResponderRelease: (evt, gestureState) => {
      const velocity = gestureState.vy;

      if (gestureState.dy < -50 || velocity < -0.5) {
        animateToExpanded();
      } else if (gestureState.dy > 50 || velocity > 0.5) {
        animateToCollapsed();
      } else {
        const toValue = isExpanded ? screenHeight - 600 : screenHeight - 150;
        Animated.spring(bottomSheetY, {
          toValue,
          useNativeDriver: false,
          tension: 100,
          friction: 8,
        }).start();
      }
    },
  });

  const animateToExpanded = () => {
    Animated.spring(bottomSheetY, {
      toValue: screenHeight - 600,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start();
    setIsExpanded(true);
  };

  const animateToCollapsed = () => {
    Animated.spring(bottomSheetY, {
      toValue: screenHeight - 150,
      useNativeDriver: false,
      tension: 100,
      friction: 8,
    }).start();
    setIsExpanded(false);
  };

  const renderTimelineItem = (item: TimelineItem, index: number) => (
    <View key={item.id} style={styles.timelineItem}>
      <View style={styles.timelineLeft}>
        <View
          style={[
            styles.timelineDot,
            item.isCompleted && styles.completedTimelineDot,
          ]}
        />
        {index < timelineItems.length - 1 && (
          <View style={styles.timelineLine} />
        )}
      </View>
      <View style={styles.timelineContent}>
        <View style={styles.timelineCard}>
          <Image source={item.image} style={styles.timelineImage} />
          <View style={styles.timelineInfo}>
            <Text style={styles.timelineTitle}>{item.title}</Text>
            <Text style={styles.timelineTime}>{item.time}</Text>
            {item.isCompleted && (
              <Badge
                text="Tamamlandı"
                variant="success"
                leftIcon={
                  <Ionicons name="checkmark-circle" size={16} color="#FFF" />
                }
              />
            )}
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="transparent" translucent />

      <ImageBackground
        source={
          (detail?.headerImage as any) ||
          (detail?.image as any) ||
          (resolveImage("asset:bg1") as any)
        }
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <AppHeader
            title="Gezi Detayları"
            showBack={false}
            backgroundColor="transparent"
            titleColor="#FFFFFF"
            left={
              <TouchableOpacity style={styles.backButton} onPress={onBack}>
                <Ionicons name="chevron-back" size={24} color="white" />
              </TouchableOpacity>
            }
          />

          {/* Timeline Content */}
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.timelineContainer}>
              {timelineItems.map((item, index) =>
                renderTimelineItem(item, index),
              )}
            </View>

            {/* Amasra Otel Kartı - Timeline Sonunda */}
            <View style={styles.hotelCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>
                  {detail?.hotel?.title || "Otel"}
                </Text>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text style={styles.ratingText}>
                    {(detail?.hotel?.rating || detail?.rating || 0).toFixed(1)}
                  </Text>
                </View>
              </View>

              <View style={styles.cardDetail}>
                <InfoRow
                  icon="time-outline"
                  text={detail?.hotel?.durationText || ""}
                  iconSize={16}
                  color="rgba(255, 255, 255, 0.8)"
                  textStyle={styles.cardDetailText}
                />
              </View>

              <View style={styles.participantsRow}>
                <AvatarsStack
                  avatars={Array.isArray(tripData?.avatars) ? tripData.avatars : []}
                  maxVisible={3}
                  size={32}
                  overlap={-8}
                />
              </View>

              <Button
                title="Haritada Görüntüle"
                onPress={() => openInMaps(mapQuery)}
                disabled={!mapQuery}
                variant="primary"
                style={styles.mapButton}
              />
            </View>
          </ScrollView>
        </View>
      </ImageBackground>

      {/* Bottom Sheet - Görseldeki gibi */}
      <Animated.View
        style={[
          styles.bottomSheet,
          { transform: [{ translateY: bottomSheetY }] },
        ]}
        {...panResponder.panHandlers}
      >
        <View style={styles.bottomSheetHandle} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Trip Header */}
          <View style={styles.tripHeader}>
            <Text style={styles.tripTitle}>{detail?.title || ""}</Text>
            <Text style={styles.tripSubtitle}>{detail?.location || ""}</Text>
          </View>

          {/* Trip Info Row */}
          <View style={styles.tripInfoRow}>
            <View style={styles.leftInfo}>
              <View style={styles.locationInfo}>
                <InfoRow
                  icon="location-outline"
                  text={(detail as any)?.city || ""}
                  iconSize={16}
                  color="#666"
                  textStyle={styles.locationText}
                />
              </View>
              <View style={styles.ratingInfo}>
                <InfoRow
                  icon="star"
                  text={`${(detail?.rating || 0).toFixed(1)} (${detail?.reviewCount || 0})`}
                  iconSize={16}
                  color="#FFD700"
                  textStyle={styles.ratingText}
                />
              </View>
            </View>
            <Text style={styles.priceText}>{detail?.priceText || ""}</Text>
          </View>

          {/* Activity Icons */}
          <View style={styles.activityIcons}>
            {(detail?.gallery || [])
              .slice(0, 5)
              .map((img: any, idx: number) => (
                <Image
                  key={`g-${idx}`}
                  source={img}
                  style={styles.activityIcon}
                />
              ))}
          </View>

          {/* About Section */}
          <View style={styles.sectionContainer}>
            <SectionHeader
              title={<Text style={styles.sectionTitle}>Tur Hakkında</Text>}
            />
            <Text style={styles.aboutText}>
              {detail?.about || ""}
              {isTextExpanded &&
                ", sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum stet clita kasd gubergren."}{" "}
              <TouchableOpacity
                onPress={() => setIsTextExpanded(!isTextExpanded)}
              >
                <Text style={styles.readMoreText}>
                  {isTextExpanded ? "Daha Az" : "Devamını Oku"}
                </Text>
              </TouchableOpacity>
            </Text>
          </View>

          {/* Reviews Section */}
          <View style={styles.sectionContainer}>
            <SectionHeader
              title={<Text style={styles.sectionTitle}>Geri Bildirimler</Text>}
              rightNode={
                <TouchableOpacity onPress={() => onShowAllReviews?.(detail)}>
                  <Text style={styles.seeAllText}>Tümü</Text>
                </TouchableOpacity>
              }
              containerStyle={styles.sectionHeader}
            />

            {((detail?.reviews as any[]) || []).slice(-2).map((rev: any) => (
              <View key={`rev-${rev.id}`}>
                <ReviewCard
                  avatar={
                    rev?.avatar?.require ||
                    (rev?.avatar?.uri ? { uri: rev.avatar.uri } : undefined)
                  }
                  name={rev.name}
                  rating={rev.rating || 0}
                  text={rev.text}
                  style={{ marginBottom: 16 }}
                />
              </View>
            ))}
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
  },
  placeholder: {
    width: 40,
    height: 40,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  timelineContainer: {
    paddingVertical: 20,
  },
  timelineItem: {
    flexDirection: "row",
    marginBottom: 20,
  },
  timelineLeft: {
    alignItems: "center",
    marginRight: 16,
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderWidth: 3,
    borderColor: "white",
  },
  completedTimelineDot: {
    backgroundColor: "#FF6B35",
    borderColor: "#FF6B35",
  },
  timelineLine: {
    width: 2,
    height: 60,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginTop: 8,
  },
  timelineContent: {
    flex: 1,
  },
  timelineCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  timelineImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 16,
  },
  timelineInfo: {
    flex: 1,
    justifyContent: "center",
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  timelineTime: {
    fontSize: 14,
    color: "#999",
    marginBottom: 4,
  },
  bottomSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 650,
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 0,
    paddingTop: 12,
    paddingBottom: 40,
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 12,
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  tripHeader: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  tripTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  tripSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  tripInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  leftInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  locationText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  ratingInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginLeft: 4,
  },
  priceText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
  },
  activityIcons: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  activityIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
  },
  sectionContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  aboutText: {
    fontSize: 14,
    color: "#666",
  },
  readMoreText: {
    fontSize: 14,
    color: "#FF6B35",
    fontWeight: "600",
  },
  reviewCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  reviewAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  reviewInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  reviewText: {
    fontSize: 14,
    color: "#666",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  seeAllText: {
    fontSize: 14,
    color: "#FF6B35",
    fontWeight: "600",
  },
  hotelCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    marginBottom: 200,
    zIndex: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cardDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cardDetailText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  participantsRow: {
    marginBottom: 16,
  },
  avatarsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "white",
  },
  avatarOverlap: {
    marginLeft: -8,
  },
  moreAvatar: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  moreAvatarText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#333",
  },
  mapButton: {
    backgroundColor: "#FF6B35",
    borderRadius: 16,
    padding: 16,
  },
});
