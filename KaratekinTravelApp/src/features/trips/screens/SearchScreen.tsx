import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import FilterModal from "@/features/trips/components/FilterModal";
import { AppHeader } from "@/shared/ui";
import { SearchBar, SegmentedTabs } from "@/shared/ui";
import { TripListCard } from "@/shared/ui";
import Badge from "@/shared/ui/Badge";
import { useTrips } from "@/features/trips/hooks";
import { useCompanies } from "@/core/data/store";
import { LoadingView, ErrorView } from "@/shared/ui";
import { Trip } from "@/types/trip";
import { mapTripsSchemaToUi } from "@/core/data/adapters";
import { resolveImage } from "@/core/data/schemas";

interface SearchScreenProps {
  onBack: () => void;
  onTripPress: (tripId: number) => void;
  onCompanyPress: (companyId: string) => void;
}

export default function SearchScreen({
  onBack,
  onTripPress,
  onCompanyPress,
}: SearchScreenProps) {
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("En Çok Beğenilen");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const {
    data: tripsRaw = [],
    isLoading: tripsLoading,
    isError: tripsError,
    refetch: refetchTrips,
  } = useTrips();
  const allTrips: Trip[] = useMemo(
    () => mapTripsSchemaToUi(tripsRaw),
    [tripsRaw],
  );
  const {
    data: companiesRaw = [],
    isLoading: companiesLoading,
    isError: companiesError,
    refetch: refetchCompanies,
  } = useCompanies();
  if (tripsLoading || companiesLoading) return <LoadingView />;
  if (tripsError || companiesError)
    return (
      <ErrorView
        onRetry={() => {
          tripsError && refetchTrips();
          companiesError && refetchCompanies();
        }}
      />
    );
  const allCompanies = useMemo(() => {
    // Build quick lookup for fallback stats per company
    const stats = new Map<string, { trips: number; participants: number }>();
    for (const t of allTrips) {
      const cid = String(t.companyId ?? "");
      if (!cid) continue;
      const prev = stats.get(cid) || { trips: 0, participants: 0 };
      prev.trips += 1;
      prev.participants += t.joinedCount || 0;
      stats.set(cid, prev);
    }
    return companiesRaw.map((c) => {
      const cid = String(c.id);
      const s = stats.get(cid) || { trips: 0, participants: 0 };
      const tripsLabel =
        c.tripsLabel || (s.trips > 0 ? `${s.trips}+ Gezi` : "0 Gezi");
      const participantsLabel =
        c.participantsLabel ||
        (s.participants > 0 ? `${s.participants}+ Katılımcı` : "0 Katılımcı");
      return {
        id: cid,
        name: c.name,
        rating: c.rating ?? 0,
        participantsLabel,
        tripsLabel,
        logo: resolveImage(c.logo),
      };
    });
  }, [companiesRaw, allTrips]);

  const tabs = ["Yalnız Firmalar", "En Çok Beğenilen", "Tarih"];

  const filteredTrips = useMemo(() => {
    let list = allTrips.filter((t) =>
      t.title.toLowerCase().includes(searchText.toLowerCase()),
    );

    if (activeTab === "En Çok Beğenilen") {
      list = [...list].sort((a, b) => b.rating - a.rating);
    } else if (activeTab === "Tarih") {
      list = [...list].sort(
        (a, b) =>
          (a.dateStart?.getTime?.() || 0) - (b.dateStart?.getTime?.() || 0),
      );
    }
    return list;
  }, [allTrips, searchText, activeTab]);

  const filteredCompanies = useMemo(() => {
    const term = searchText.trim().toLowerCase();
    const list = term
      ? allCompanies.filter((c) => c.name.toLowerCase().includes(term))
      : allCompanies;
    // İsteğe bağlı: beğeni/puan sıralaması
    return [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }, [allCompanies, searchText]);

  const handleFilterPress = () => {
    setShowFilterModal(true);
  };

  const handleCloseFilter = () => {
    setShowFilterModal(false);
  };

  const handleApplyFilter = (filters: any) => {
    console.log("Filters applied:", filters);
    // Filter logic will be implemented here
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor="#F8F9FA" translucent={false} />
      <AppHeader title="Arama" onBack={onBack} compact showDivider safeAreaTop />

      {/* Search Bar + Tabs */}
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchText}
          onChangeText={setSearchText}
          onFilterPress={handleFilterPress}
          placeholder="Gezi veya Firma Ara..."
          size="compact"
        />
        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <SegmentedTabs
            items={tabs}
            value={activeTab}
            onChange={setActiveTab}
            variant="filled"
            size="md"
            scrollable
            contentContainerStyle={styles.tabsScrollContent}
            tabStyle={styles.tab}
            activeTabStyle={styles.activeTab}
            textStyle={styles.tabText}
            activeTextStyle={styles.activeTabText}
          />
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingTop: 4,
          paddingBottom: Math.max(24, insets.bottom + 16),
        }}
      >
        {/* Firma sekmesi seçiliyse firmaları listele; değilse gezileri göster */}
        {activeTab !== "Yalnız Firmalar" &&
          filteredTrips.map((trip) => (
            <TripListCard
              key={trip.id}
              image={trip.image}
              title={trip.title}
              variant="allTrips"
              containerStyle={{ marginHorizontal: -8 }}
              priceText={
                trip.pricing
                  ? (() => {
                      try {
                        return new Intl.NumberFormat("tr-TR", {
                          style: "currency",
                          currency: trip.pricing!.currency,
                        }).format(trip.pricing!.basePrice);
                      } catch {
                        return trip.price || "";
                      }
                    })()
                  : trip.price || ""
              }
              dateText={trip.dateRange || ""}
              capacityText={`Kapasite ${trip.capacity} Kişi`}
              joinedText={`${trip.joinedCount} Kişi Katıldı`}
              avatars={trip.avatars || []}
              onPress={() => onTripPress(trip.id)}
            />
          ))}

        {activeTab === "Yalnız Firmalar" && (
          <View>
            {filteredCompanies.map((company) => (
              <TouchableOpacity
                key={`company-${company.id || company.name}`}
                style={styles.companyCard}
                onPress={() =>
                  onCompanyPress(String(company.id || company.name))
                }
                activeOpacity={0.7}
              >
                <View style={styles.companyContent}>
                  <View style={styles.companyLeft}>
                    {company.logo ? (
                      <Image
                        source={company.logo as any}
                        style={styles.companyLogo}
                      />
                    ) : (
                      <View
                        style={[
                          styles.companyLogo,
                          { backgroundColor: "#EEE" },
                        ]}
                      />
                    )}
                    <View style={styles.companyInfo}>
                      <View style={styles.companyHeader}>
                        <Text style={styles.companyName}>{company.name}</Text>
                        <Badge text="Firma" variant="orange" />
                      </View>
                      <View style={styles.companyStats}>
                        <View style={styles.statRow}>
                          <Ionicons
                            name="airplane-outline"
                            size={16}
                            color="#999"
                          />
                          <Text style={styles.statText}>
                            {company.tripsLabel || "0 Gezi"}
                          </Text>
                        </View>
                        <View style={styles.statRow}>
                          <Ionicons
                            name="people-outline"
                            size={16}
                            color="#999"
                          />
                          <Text style={styles.statText}>
                            {company.participantsLabel || "0 Katılımcı"}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  <View style={styles.companyRight}>
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={12} color="#FFF" />
                      <Text style={styles.ratingText}>
                        {(company.rating || 0).toFixed(1)}
                      </Text>
                    </View>
                    <Badge text="Onaylı" variant="orange" />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <FilterModal
        visible={showFilterModal}
        onClose={handleCloseFilter}
        onApplyFilter={handleApplyFilter}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  searchContainer: {
    flexDirection: "column",
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 4,
    gap: 8,
  },
  tabsContainer: {
    paddingTop: 0,
    paddingBottom: 4,
    marginBottom: 8,
  },
  tabsScrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  tab: {
    paddingHorizontal: 16,
    height: 44,
    borderRadius: 16,
    backgroundColor: "#EFEFEF",
    alignItems: "center",
    justifyContent: "center",
  },
  activeTab: {
    backgroundColor: "#FF6B35",
    shadowColor: "#FF6B35",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#444",
  },
  activeTabText: {
    color: "#FFF",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  companyCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#FF6B35",
    overflow: "hidden",
  },
  companyContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  companyLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  companyLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  companyInfo: {
    flex: 1,
  },
  companyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  companyName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  companyBadge: {
    backgroundColor: "#FF6B35",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  companyBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFF",
  },
  companyStats: {
    gap: 4,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statText: {
    fontSize: 14,
    color: "#666",
  },
  companyRight: {
    alignItems: "center",
    gap: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF6B35",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFF",
  },
});
