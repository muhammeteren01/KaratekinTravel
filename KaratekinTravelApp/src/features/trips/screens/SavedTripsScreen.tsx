import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader, SearchBar, SegmentedTabs } from "@/shared/ui";
import { EmptyState } from "@/shared/ui";
import InfoRow from "@/shared/ui/InfoRow";

interface SavedTripsScreenProps {
  onBack: () => void;
  savedTrips: SavedTrip[];
  onBookmarkTrip: (trip: any) => void;
  onTripPress: (trip: SavedTrip) => void;
}

interface SavedTrip {
  id: number;
  title: string;
  location: string;
  rating: number;
  price: string;
  image?: string;
}

export default function SavedTripsScreen({
  onBack,
  savedTrips,
  onBookmarkTrip,
  onTripPress,
}: SavedTripsScreenProps) {
  const [selectedTab, setSelectedTab] = useState("Geçmiş Geziler");
  const [searchText, setSearchText] = useState("");

  const filteredTrips = savedTrips.filter(
    (trip) =>
      trip.title.toLowerCase().includes(searchText.toLowerCase()) ||
      trip.location.toLowerCase().includes(searchText.toLowerCase()),
  );

  const renderTripCard = ({ item }: { item: SavedTrip }) => (
    <TouchableOpacity style={styles.tripCard} onPress={() => onTripPress(item)}>
      <Image
        source={{
          uri:
            item.image ||
            "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
        }}
        style={styles.tripImage}
      />
      <TouchableOpacity
        style={styles.cardBookmarkButton}
        onPress={(e) => {
          e.stopPropagation();
          onBookmarkTrip(item);
        }}
      >
        <Ionicons name="bookmark" size={16} color="#FF6B35" />
      </TouchableOpacity>
      <View style={styles.tripContent}>
        <Text style={styles.tripTitle}>{item.title}</Text>
        <View style={styles.tripInfo}>
          <View style={styles.locationContainer}>
            <InfoRow
              icon="location-outline"
              text={item.location}
              iconSize={14}
              color="#999"
              textStyle={styles.locationText}
            />
          </View>
          <View style={styles.ratingContainer}>
            <InfoRow
              icon="star"
              text={String(item.rating)}
              iconSize={14}
              color="#FFD700"
              textStyle={styles.ratingText}
            />
          </View>
        </View>
        <Text style={styles.priceText}>{item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor="#F8F9FA" translucent={false} />

      <AppHeader
        title="Kaydedilen Geziler"
        onBack={onBack}
        compact
        showDivider
      />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Gezi Ara..."
          size="compact"
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <SegmentedTabs
          items={["Geçmiş Geziler", "Tarihe Göre Sırala", "Fiyat", "Rating"]}
          value={selectedTab}
          onChange={setSelectedTab}
          variant="outline"
          size="md"
          scrollable
          contentContainerStyle={styles.tabsScrollView}
        />
      </View>

      {/* Content */}
      <FlatList
        data={filteredTrips}
        renderItem={renderTripCard}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.tripsContainer}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <EmptyState
            title="Henüz Kaydedilen Gezi Yok"
            subtitle="Beğendiğiniz gezileri kaydetmeye başlayın"
            icon={{ name: "bookmark-outline", size: 48, color: "#CCC" }}
            // SavedTrips aligns content slightly lower via paddingTop
            style={styles.emptyContainer}
            // Title/subtitle have different colors/weights than AllTrips; preserve
            titleStyle={styles.emptyTitle}
            subtitleStyle={styles.emptySubtitle}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  tabsContainer: {
    paddingBottom: 20,
  },
  tabsScrollView: {
    paddingHorizontal: 20,
    gap: 12,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "transparent",
  },
  activeTab: {
    backgroundColor: "#FF6B35",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  activeTabText: {
    color: "white",
  },
  tripsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  row: {
    justifyContent: "space-between",
  },
  tripCard: {
    width: "48%",
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: "relative",
  },
  tripImage: {
    width: "100%",
    height: 120,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  cardBookmarkButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1,
  },
  tripContent: {
    padding: 12,
  },
  tripTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  tripInfo: {
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  locationText: {
    fontSize: 12,
    color: "#999",
    marginLeft: 4,
    flex: 1,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 12,
    color: "#333",
    marginLeft: 4,
    fontWeight: "600",
  },
  priceText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FF6B35",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
});
