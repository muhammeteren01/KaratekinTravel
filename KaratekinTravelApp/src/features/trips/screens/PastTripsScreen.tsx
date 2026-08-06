import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ImageSourcePropType,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AppHeader } from "@/shared/ui";
import FilterModal from "@/features/trips/components/FilterModal";
import { SearchBar, FilterChips } from "@/shared/ui";
import { GridTripCard } from "@/shared/ui";
import { usePastTrips } from "@/features/trips/hooks";
import { LoadingView, ErrorView } from "@/shared/ui";
import type { PastTrip } from "@/core/data/schemas";
import { resolveImage } from "@/core/data/schemas";

interface PastTripsScreenProps {
  onBack: () => void;
  onTripPress?: (trip: any) => void;
}

interface FilterOptions {
  categories: string[];
  priceRange: { min: number; max: number };
  rating: number;
  sortBy: string;
}

export default function PastTripsScreen({
  onBack,
  onTripPress,
}: PastTripsScreenProps) {
  const insets = useSafeAreaInsets();
  const numColumns = 2;
  const [searchText, setSearchText] = useState("");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    categories: ["Tümü"],
    priceRange: { min: 0, max: 1000 },
    rating: 0,
    sortBy: "En Çok Beğenilen",
  });
  const {
    data: pastTripsRaw = [],
    isLoading,
    isError,
    refetch,
  } = usePastTrips();
  if (isLoading) return <LoadingView />;
  if (isError) return <ErrorView onRetry={refetch} />;
  type PastTripUI = Omit<PastTrip, "image"> & { image: ImageSourcePropType };
  const pastTrips: PastTripUI[] = pastTripsRaw.map((p) => ({
    ...p,
    image: resolveImage(p.image) as ImageSourcePropType,
  }));

  const filterOptions_list = ["En Çok Beğenilen", "Tarihe Göre Sırala"];

  const getFilteredTrips = (): PastTripUI[] => {
    let filtered = pastTrips.filter((trip: PastTripUI) => {
      const searchTerm = searchText.toLowerCase().trim();
      const matchesSearch =
        searchTerm === "" ||
        trip.title.toLowerCase().includes(searchTerm) ||
        trip.location.toLowerCase().includes(searchTerm);
      const matchesRating = trip.rating >= filterOptions.rating;
      return matchesSearch && matchesRating;
    });

    switch (filterOptions.sortBy) {
      case "En Çok Beğenilen":
        return filtered.sort((a, b) => b.rating - a.rating);
      case "Tarihe Göre Sırala":
        return filtered.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
      default:
        return filtered;
    }
  };

  const handleQuickFilterPress = (filter: string) => {
    setFilterOptions((prev) => ({ ...prev, sortBy: filter }));
  };

  const handleApplyFilters = (filters: any) => {
    console.log("Applied filters:", filters);
    setShowFilterModal(false);
  };

  const handleResetFilters = () => {
    setFilterOptions({
      categories: ["Tümü"],
      priceRange: { min: 0, max: 1000 },
      rating: 0,
      sortBy: "En Çok Beğenilen",
    });
    setSearchText("");
  };

  const renderGridItem = ({ item }: { item: PastTripUI }) => (
    <GridTripCard
      image={item.image}
      title={item.title}
      locationText={item.location}
      rating={item.rating}
      priceText={item.priceText}
      onPress={() => onTripPress?.(item)}
    />
  );

  const hasActiveFilters = () => {
    return (
      (!filterOptions.categories.includes("Tümü") &&
        filterOptions.categories.length > 0) ||
      filterOptions.priceRange.min !== 0 ||
      filterOptions.priceRange.max !== 1000 ||
      filterOptions.rating !== 0 ||
      filterOptions.sortBy !== "En Çok Beğenilen" ||
      searchText.trim() !== ""
    );
  };

  const filteredTrips = getFilteredTrips();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor="#F8F9FA" translucent={false} />

      <AppHeader title="Geçmiş Geziler" onBack={onBack} compact showDivider />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchText}
          onChangeText={setSearchText}
          onFilterPress={() => setShowFilterModal(true)}
          placeholder="Gezi Ara..."
        />
      </View>

      {/* Filter Options */}
      <View style={styles.filterScrollContainer}>
        <FilterChips
          items={filterOptions_list}
          selected={filterOptions.sortBy}
          onSelect={handleQuickFilterPress}
          variant="filled"
          scrollable
        />
      </View>

      {/* Results Count */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          {filteredTrips.length} gezi bulundu
        </Text>
        {filterOptions.sortBy !== "En Çok Beğenilen" && (
          <Text style={styles.sortedByText}>
            {filterOptions.sortBy === "Tarihe Göre Sırala"
              ? "Tarihe göre sıralandı"
              : ""}
          </Text>
        )}
      </View>

      {/* Trips Grid */}
      <FlatList
        key={`grid-${numColumns}`}
        data={filteredTrips}
        renderItem={renderGridItem}
        keyExtractor={(item) => String(item.id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.tripsContainer,
          { paddingBottom: Math.max(16, insets.bottom + 8) },
        ]}
        numColumns={numColumns}
        columnWrapperStyle={styles.row}
        ListFooterComponent={<View style={{ height: 8 }} />}
      />

      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApplyFilter={handleApplyFilters}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {},
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F2F4F7",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#1B1E28" },
  placeholder: { width: 40, height: 40 },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    alignItems: "center",
    marginTop: 6,
    marginBottom: 4,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    marginLeft: 12,
    padding: 0,
  },
  filterButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  filterScrollContainer: { paddingHorizontal: 20 },
  filterContainer: { alignItems: "center", paddingVertical: 20 },
  filterChip: {
    backgroundColor: "#848482ff",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  activeFilterChip: { backgroundColor: "#FF6B35", borderColor: "#FF6B35" },
  filterText: { fontSize: 14, color: "#ffffffff", fontWeight: "500" },
  activeFilterText: { color: "white", fontWeight: "600" },
  resultsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 6,
  },
  resultsText: { fontSize: 16, color: "#333", fontWeight: "600" },
  sortedByText: { fontSize: 14, color: "#999" },
  tripsContainer: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 16 },
  separator: { height: 8 },
  row: {},
  pastTrips_gridItem: {},
});
