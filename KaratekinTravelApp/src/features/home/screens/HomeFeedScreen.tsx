import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useTrips, useSupportingData } from "@/features/trips/hooks";
import { LoadingView, ErrorView } from "@/shared/ui";
import { mapTripsSchemaToUi } from "@/core/data/adapters";
import { Trip } from "@/types/trip";
import { TripListCard } from "@/shared/ui";
import { FeaturedTripCard } from "@/features/trips/components";
import { theme } from "@/shared/theme";
import { SectionHeader } from "@/shared/ui";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { HomeStackParamList } from "@/navigation/AppNavigator";
import { useAuth } from "@/context/AuthContext";
import { resolveImage } from "@/core/data/schemas";

type Props = NativeStackScreenProps<HomeStackParamList, "HomeFeed">;

export default function HomeFeedScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { currentUser } = useAuth();
  const tripsQ = useTrips();
  const supportingQ = useSupportingData();
  if (tripsQ.isLoading || supportingQ.isLoading) return <LoadingView />;
  if (tripsQ.isError || supportingQ.isError) {
    return (
      <ErrorView
        onRetry={() => {
          if (tripsQ.isError) tripsQ.refetch();
          if (supportingQ.isError) supportingQ.refetch();
        }}
      />
    );
  }
  const tripsRaw = tripsQ.data || [];
  const allTripsData: Trip[] = mapTripsSchemaToUi(tripsRaw);
  const supporting = supportingQ.data;

  const featuredTrips: Trip[] = (() => {
    const ids = supporting?.featuredTripIds || [];
    if (ids.length)
      return allTripsData.filter((t) => ids.includes(String(t.id)));
    return allTripsData.slice(0, 5);
  })();

  const avatarSource = currentUser?.avatar
    ? (resolveImage(currentUser.avatar) as any)
    : {
        uri: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face&auto=format",
      };
  const displayName = currentUser?.name?.split(" ")[0] || "Misafir";

  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor="transparent" translucent />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 4 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Image
              source={avatarSource}
              style={styles.avatar}
              resizeMode="cover"
            />
            <Text style={styles.userName}>{displayName}</Text>
          </View>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Bildirimler"
            style={styles.notificationButton}
            onPress={() => navigation.navigate("Notifications")}
          >
            <Ionicons name="notifications-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>
            Explore the{"\n"}
            <Text style={styles.beautifulText}>Beautiful </Text>
            <Text style={styles.worldText}>world!</Text>
          </Text>
        </View>

        {/* Öne Çıkan Geziler */}
        <SectionHeader
          title={<Text style={styles.sectionTitle}>Öne Çıkan Geziler</Text>}
          rightNode={
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Tüm gezileri gör"
              onPress={() => navigation.navigate("AllTrips")}
            >
              <Text allowFontScaling style={styles.seeAllText}>
                Tümü
              </Text>
            </TouchableOpacity>
          }
          containerStyle={styles.sectionHeader}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalScroll}
          contentContainerStyle={styles.cardsContainer}
        >
          {featuredTrips.map((trip) => (
            <FeaturedTripCard
              key={trip.id}
              image={trip.image}
              title={trip.title}
              location={trip.location}
              priceText={trip.price}
              rating={trip.rating}
              peopleCount={trip.peopleCountLabel || "+0"}
              avatars={trip.avatars}
              bookmarked={false}
              onToggleBookmark={() => {}}
              onPress={() => navigation.navigate("TripDetail", { trip })}
            />
          ))}
        </ScrollView>

        {/* Güncel Geziler */}
        <SectionHeader
          title={<Text style={styles.sectionTitle}>Güncel Geziler</Text>}
          rightNode={
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Tüm gezileri gör"
              onPress={() => navigation.navigate("AllTrips")}
            >
              <Text allowFontScaling style={styles.seeAllText}>
                Tümü
              </Text>
            </TouchableOpacity>
          }
          containerStyle={[styles.sectionHeader, { marginTop: -12 }]}
        />
        <View style={{ marginBottom: 24 }}>
          {allTripsData.slice(0, 3).map((trip) => (
            <TripListCard
              key={`list-${trip.id}`}
              image={trip.image}
              title={trip.title}
              dateText={trip.dateRange}
              city={trip.city}
              region={trip.region}
              priceText={trip.price}
              variant="simple"
              onPress={() => navigation.navigate("TripDetail", { trip })}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.palette.bgAlt,
  },
  scrollView: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 4,
    paddingBottom: 0,
  },
  userInfo: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    overflow: "hidden",
    backgroundColor: "#F0F0F0",
  },
  userName: { fontSize: 18, fontWeight: "600", color: "#333" },
  notificationButton: { padding: theme.spacing.sm },
  titleContainer: {
    paddingHorizontal: theme.spacing.xxl,
    paddingTop: theme.spacing.xxl,
    paddingBottom: 32,
  },
  titleText: {
    fontSize: theme.typography.display,
    fontWeight: "bold",
    color: theme.palette.textSecondary,
    lineHeight: 44,
  },
  beautifulText: {
    fontSize: theme.typography.display,
    fontWeight: "bold",
    color: theme.palette.textSecondary,
  },
  worldText: {
    fontSize: theme.typography.display,
    fontWeight: "bold",
    color: theme.palette.primaryDark,
    textDecorationLine: "underline",
    textDecorationColor: theme.palette.primaryDark,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.xxl,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: theme.typography.xxl,
    fontWeight: "600",
    color: theme.palette.textSecondary,
  },
  seeAllText: {
    fontSize: theme.typography.lg,
    color: theme.palette.primaryDark,
    fontWeight: "500",
  },
  horizontalScroll: { marginBottom: 40 },
  cardsContainer: {
    paddingLeft: theme.spacing.xxl,
    paddingRight: theme.spacing.xxl,
    paddingBottom: 20,
  },
});
