// moved from src/screens/AllTripsScreen.tsx
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import TripDetailScreen from "@/features/trips/screens/TripDetailScreen";
import FilterModal from "@/features/trips/components/FilterModal";
import { AppHeader } from "@/shared/ui";
import { SearchBar, FilterChips } from "@/shared/ui";
import { TripListCard } from "@/shared/ui";
import { useTrips } from "@/features/trips/hooks";
import { LoadingView, ErrorView } from "@/shared/ui";
import { EmptyState } from "@/shared/ui";
import { mapTripsSchemaToUi } from "@/core/data/adapters";
import { Trip } from "@/types/trip";

interface AllTripsScreenProps {
  onBack: () => void;
}

export default function AllTripsScreen({ onBack }: AllTripsScreenProps) {
  const [searchText, setSearchText] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("En Çok Beğenilen");
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Filter states - these will now be managed by FilterModal

  const { data: tripsRaw = [], isLoading, isError, refetch } = useTrips();
  if (isLoading) return <LoadingView />;
  if (isError) return <ErrorView onRetry={refetch} />;
  const allTripsData: Trip[] = useMemo(
    () => mapTripsSchemaToUi(tripsRaw),
    [tripsRaw],
  );

  const formatCurrency = (amount?: number, currency: string = "USD") => {
    try {
      return new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency,
      }).format(amount || 0);
    } catch {
      return `${amount ?? 0} ${currency}`;
    }
  };

  const filterOptions = [
    "Fiyata Göre Sırala",
    "En Çok Beğenilen",
    "Tarihe Göre Sırala",
  ];

  const getFilteredTrips = () => {
    let filtered = allTripsData.filter((trip) =>
      trip.title.toLowerCase().includes(searchText.toLowerCase()),
    );

    switch (selectedFilter) {
      case "En Çok Beğenilen":
        return filtered.sort((a, b) => b.rating - a.rating);
      case "Tarihe Göre Sırala":
        return filtered.sort(
          (a, b) =>
            (a.dateStart?.getTime?.() || 0) - (b.dateStart?.getTime?.() || 0),
        );
      case "Fiyata Göre Sırala":
        return filtered.sort((a, b) => {
          const aVal =
            typeof a.pricing?.basePrice === "number"
              ? a.pricing!.basePrice
              : parseInt((a.price || "").replace(/[^0-9]/g, "")) || 0;
          const bVal =
            typeof b.pricing?.basePrice === "number"
              ? b.pricing!.basePrice
              : parseInt((b.price || "").replace(/[^0-9]/g, "")) || 0;
          return aVal - bVal;
        });
      default:
        return filtered;
    }
  };

  const handleFilterSelect = (filter: string) => {
    setSelectedFilter(filter);
  };

  const handleTripPress = (trip: any) => {
    setSelectedTrip(trip);
  };

  const handleBackFromTripDetail = () => {
    setSelectedTrip(null);
  };

  const handleFilterPress = () => {
    setShowFilterModal(true);
  };

  const handleCloseFilter = () => {
    setShowFilterModal(false);
  };

  const handleApplyFilters = (filters: any) => {
    console.log("Applied filters:", filters);
    setShowFilterModal(false);
  };

  const filteredTrips = getFilteredTrips();

  if (selectedTrip) {
    return (
      <TripDetailScreen
        onBack={handleBackFromTripDetail}
        tripData={selectedTrip}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor="#FFFFFF" translucent={false} />

      <AppHeader
        title="Tüm Geziler"
        showBack={false}
        left={
          <TouchableOpacity
            onPress={onBack}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: "#F7F7F9",
              alignItems: "center",
              justifyContent: "center",
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="chevron-back" size={24} color="#1B1E28" />
          </TouchableOpacity>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <SearchBar
            value={searchText}
            onChangeText={setSearchText}
            onFilterPress={handleFilterPress}
            placeholder="Gezi Ara..."
          />
        </View>

        {/* Filter Options (Figma-like chips) */}
        <FilterChips
          items={filterOptions}
          selected={selectedFilter}
          onSelect={handleFilterSelect}
          variant="filled"
          scrollable
          style={styles.filterScrollContainer}
        />

        {/* Results Count removed to match Figma */}

        {/* Trips List */}
        <View style={styles.tripsContainer}>
          {filteredTrips.map((trip) => (
            <TripListCard
              key={trip.id}
              image={trip.image}
              title={trip.title}
              containerStyle={{ marginHorizontal: -8 }}
              priceText={
                trip.pricing
                  ? formatCurrency(
                      trip.pricing.basePrice,
                      trip.pricing.currency,
                    )
                  : trip.price || ""
              }
              dateText={trip.dateRange || ""}
              capacityText={`Kapasite ${trip.capacity} Kişi`}
              joinedText={`${trip.joinedCount} Kişi Katıldı`}
              avatars={trip.avatars}
              variant="allTrips"
              onPress={() => handleTripPress(trip)}
            />
          ))}
        </View>

        {/* No Results */}
        {filteredTrips.length === 0 && (
          <EmptyState
            title={"Aradığınız kriterlere uygun gezi bulunamadı"}
            subtitle={"Farklı anahtar kelimeler deneyin"}
            icon={{ name: "search", size: 48, color: "#ccc" }}
            style={styles.noResultsContainer}
            titleStyle={styles.noResultsText}
            subtitleStyle={styles.noResultsSubText}
          />
        )}
      </ScrollView>

      <FilterModal
        visible={showFilterModal}
        onClose={handleCloseFilter}
        onApplyFilter={handleApplyFilters}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },

  filterScrollContainer: {
    marginBottom: 20,
  },
  tripsContainer: {
    paddingHorizontal: 20,
  },
  noResultsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  noResultsText: {
    fontSize: 18,
    color: "#999",
    textAlign: "center",
    marginTop: 16,
    fontWeight: "500",
  },
  noResultsSubText: {
    fontSize: 14,
    color: "#ccc",
    textAlign: "center",
    marginTop: 8,
  },
});
