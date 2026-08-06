import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import RangeSlider from "@/shared/ui/RangeSlider";
import { SectionHeader, SegmentedTabs, Button } from "@/shared/ui";

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilter: (filters: any) => void;
}

export default function FilterModal({
  visible,
  onClose,
  onApplyFilter,
}: FilterModalProps) {
  // Konum state
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  // Tarih state
  const [startDate, setStartDate] = useState(new Date(2025, 9, 9)); // 09-10-2025
  const [endDate, setEndDate] = useState(new Date(2025, 10, 9)); // 09-11-2025
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [selectedTimeFilter, setSelectedTimeFilter] = useState("");

  // Fiyat state
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);

  // Gün state
  const [minDays, setMinDays] = useState(0);
  const [maxDays, setMaxDays] = useState(4);

  // Katılımcı state
  const [minParticipants, setMinParticipants] = useState(0);
  const [maxParticipants, setMaxParticipants] = useState(50);

  // Sezon state
  const [selectedSeasons, setSelectedSeasons] = useState<string[]>([]);

  // Tab state
  const [activeTab, setActiveTab] = useState<"gezi" | "firma">("gezi");

  // Firma filtreleme state'leri
  const [selectedFirmaCities, setSelectedFirmaCities] = useState<string[]>([]);
  const [showFirmaLocationDropdown, setShowFirmaLocationDropdown] =
    useState(false);
  const [minTourCount, setMinTourCount] = useState(0);
  const [maxTourCount, setMaxTourCount] = useState(45);
  const [isOnlyApprovedCompanies, setIsOnlyApprovedCompanies] = useState(false);
  const [minTotalParticipants, setMinTotalParticipants] = useState(100);
  const [maxTotalParticipants, setMaxTotalParticipants] = useState(350);
  const [selectedSatisfactionRatings, setSelectedSatisfactionRatings] =
    useState<string[]>([]);

  const availableCities = [
    "İstanbul",
    "Ankara",
    "Kahramanmaraş",
    "İzmir",
    "Antalya",
    "Bursa",
    "Adana",
    "Konya",
    "Trabzon",
    "Gaziantep",
  ];

  const timeFilters = ["Bugün", "Bu Hafta", "Bu Ay"];
  const seasons = ["İlkbahar", "Yaz", "Sonbahar", "Kış"];
  const satisfactionRatings = [
    "8.5+",
    "6.5 - 8.5",
    "4.5 - 6.5",
    "2.5 - 4.5",
    "2.5 -",
  ];

  // Modal açıldığında gezi filtreleme tab'ı seçili olsun
  useEffect(() => {
    if (visible) {
      setActiveTab("gezi");
    }
  }, [visible]);

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const addCity = (city: string) => {
    if (!selectedCities.includes(city)) {
      setSelectedCities([...selectedCities, city]);
    }
  };

  const removeCity = (cityToRemove: string) => {
    setSelectedCities(selectedCities.filter((city) => city !== cityToRemove));
  };

  const addFirmaCity = (city: string) => {
    if (!selectedFirmaCities.includes(city)) {
      setSelectedFirmaCities([...selectedFirmaCities, city]);
    }
  };

  const removeFirmaCity = (cityToRemove: string) => {
    setSelectedFirmaCities(
      selectedFirmaCities.filter((city) => city !== cityToRemove),
    );
  };

  const toggleSeason = (season: string) => {
    if (selectedSeasons.includes(season)) {
      setSelectedSeasons(selectedSeasons.filter((s) => s !== season));
    } else {
      setSelectedSeasons([...selectedSeasons, season]);
    }
  };

  const toggleSatisfactionRating = (rating: string) => {
    if (selectedSatisfactionRatings.includes(rating)) {
      setSelectedSatisfactionRatings(
        selectedSatisfactionRatings.filter((r) => r !== rating),
      );
    } else {
      setSelectedSatisfactionRatings([...selectedSatisfactionRatings, rating]);
    }
  };

  const handleTimeFilterSelect = (filter: string) => {
    setSelectedTimeFilter(filter);
    const today = new Date();

    switch (filter) {
      case "Bugün":
        setStartDate(today);
        setEndDate(today);
        break;
      case "Bu Hafta":
        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() + 7);
        setStartDate(today);
        setEndDate(endOfWeek);
        break;
      case "Bu Ay":
        const endOfMonth = new Date(
          today.getFullYear(),
          today.getMonth() + 1,
          0,
        );
        setStartDate(today);
        setEndDate(endOfMonth);
        break;
    }
  };

  const onStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const onEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const handleApplyFilter = () => {
    if (activeTab === "gezi") {
      const filters = {
        cities: selectedCities,
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        timeFilter: selectedTimeFilter,
        minPrice,
        maxPrice,
        minDays,
        maxDays,
        minParticipants,
        maxParticipants,
        seasons: selectedSeasons,
      };
      onApplyFilter(filters);
    } else {
      const filters = {
        cities: selectedFirmaCities,
        minTourCount,
        maxTourCount,
        isOnlyApprovedCompanies,
        minTotalParticipants,
        maxTotalParticipants,
        satisfactionRatings: selectedSatisfactionRatings,
      };
      onApplyFilter(filters);
    }
    onClose();
  };

  const handleResetFilter = () => {
    if (activeTab === "gezi") {
      setSelectedCities([]);
      setStartDate(new Date(2025, 9, 9));
      setEndDate(new Date(2025, 10, 9));
      setSelectedTimeFilter("");
      setMinPrice(0);
      setMaxPrice(1000);
      setMinDays(0);
      setMaxDays(4);
      setMinParticipants(0);
      setMaxParticipants(50);
      setSelectedSeasons([]);
    } else {
      setSelectedFirmaCities([]);
      setMinTourCount(0);
      setMaxTourCount(45);
      setIsOnlyApprovedCompanies(false);
      setMinTotalParticipants(100);
      setMaxTotalParticipants(350);
      setSelectedSatisfactionRatings([]);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar style="dark" backgroundColor="#EBEBEB" translucent={false} />
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header with Tabs */}
          <View style={styles.headerContainer}>
            <View style={styles.tabContainer}>
              <SegmentedTabs
                items={["Gezi Filtreleme", "Firma Filtreleme"]}
                value={
                  activeTab === "gezi" ? "Gezi Filtreleme" : "Firma Filtreleme"
                }
                onChange={(value) =>
                  setActiveTab(value === "Gezi Filtreleme" ? "gezi" : "firma")
                }
                variant="filled"
                size="md"
                scrollable={false}
                style={{ paddingHorizontal: 0 }}
              />
            </View>
          </View>

          {activeTab === "gezi" ? (
            <>
              {/* Konum Section */}
              <View style={styles.section}>
                <SectionHeader
                  title={<Text style={styles.sectionTitle}>Konum</Text>}
                  rightNode={
                    <TouchableOpacity onPress={() => setSelectedCities([])}>
                      <Text style={styles.resetText}>Sıfırla</Text>
                    </TouchableOpacity>
                  }
                  containerStyle={styles.sectionHeader}
                />

                <TouchableOpacity
                  style={styles.dropdown}
                  onPress={() => setShowLocationDropdown(true)}
                >
                  <Text style={styles.dropdownText}>Şehir Seçin</Text>
                  <View style={styles.dropdownIcon}>
                    <Ionicons name="chevron-down" size={16} color="#555E67" />
                  </View>
                </TouchableOpacity>

                <View style={styles.cityTagsContainer}>
                  {selectedCities.map((city, index) => (
                    <View key={index} style={styles.cityTag}>
                      <View style={styles.cityRemoveButton}>
                        <TouchableOpacity onPress={() => removeCity(city)}>
                          <Ionicons name="close" size={8} color="#FFFFFF" />
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.cityTagText}>{city}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Tarih Section */}
              <View style={styles.section}>
                <SectionHeader
                  title={<Text style={styles.sectionTitle}>Tarih</Text>}
                  rightNode={
                    <TouchableOpacity
                      onPress={() => {
                        setStartDate(new Date(2025, 9, 9));
                        setEndDate(new Date(2025, 10, 9));
                        setSelectedTimeFilter("");
                      }}
                    >
                      <Text style={styles.resetText}>Sıfırla</Text>
                    </TouchableOpacity>
                  }
                  containerStyle={styles.sectionHeader}
                />

                <View style={styles.dateContainer}>
                  <View style={styles.dateInputContainer}>
                    <Text style={styles.dateLabel}>Başlangıç</Text>
                    <TouchableOpacity
                      style={styles.dateInput}
                      onPress={() => setShowStartDatePicker(true)}
                    >
                      <Text style={styles.dateInputText}>
                        {formatDate(startDate)}
                      </Text>
                      <View style={styles.dateIcon}>
                        <Ionicons
                          name="calendar-outline"
                          size={12}
                          color="#555E67"
                        />
                      </View>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.dateInputContainer}>
                    <Text style={styles.dateLabel}>Bitiş</Text>
                    <TouchableOpacity
                      style={styles.dateInput}
                      onPress={() => setShowEndDatePicker(true)}
                    >
                      <Text style={styles.dateInputText}>
                        {formatDate(endDate)}
                      </Text>
                      <View style={styles.dateIcon}>
                        <Ionicons
                          name="calendar-outline"
                          size={12}
                          color="#555E67"
                        />
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.timeFiltersContainer}>
                  {timeFilters.map((filter, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.timeFilterButton,
                        selectedTimeFilter === filter &&
                          styles.timeFilterButtonActive,
                      ]}
                      onPress={() => handleTimeFilterSelect(filter)}
                    >
                      <Text
                        style={[
                          styles.timeFilterText,
                          selectedTimeFilter === filter &&
                            styles.timeFilterTextActive,
                        ]}
                      >
                        {filter}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Date Pickers */}
                {showStartDatePicker && (
                  <DateTimePicker
                    value={startDate}
                    mode="date"
                    display="default"
                    onChange={onStartDateChange}
                  />
                )}
                {showEndDatePicker && (
                  <DateTimePicker
                    value={endDate}
                    mode="date"
                    display="default"
                    onChange={onEndDateChange}
                  />
                )}
              </View>

              {/* Fiyat Section */}
              <View style={styles.section}>
                <SectionHeader
                  title={<Text style={styles.sectionTitle}>Fiyat</Text>}
                  rightNode={
                    <TouchableOpacity
                      onPress={() => {
                        setMinPrice(0);
                        setMaxPrice(1000);
                      }}
                    >
                      <Text style={styles.resetText}>Sıfırla</Text>
                    </TouchableOpacity>
                  }
                  containerStyle={styles.sectionHeader}
                />

                <View style={styles.sliderContainer}>
                  <RangeSlider
                    min={0}
                    max={1000}
                    minValue={minPrice}
                    maxValue={maxPrice}
                    onMinValueChange={setMinPrice}
                    onMaxValueChange={setMaxPrice}
                    step={10}
                  />
                </View>
              </View>

              {/* Gün Section */}
              <View style={styles.section}>
                <SectionHeader
                  title={<Text style={styles.sectionTitle}>Gün</Text>}
                  rightNode={
                    <TouchableOpacity
                      onPress={() => {
                        setMinDays(0);
                        setMaxDays(4);
                      }}
                    >
                      <Text style={styles.resetText}>Sıfırla</Text>
                    </TouchableOpacity>
                  }
                  containerStyle={styles.sectionHeader}
                />

                <View style={styles.sliderContainer}>
                  <RangeSlider
                    min={0}
                    max={10}
                    minValue={minDays}
                    maxValue={maxDays}
                    onMinValueChange={setMinDays}
                    onMaxValueChange={setMaxDays}
                    step={1}
                  />
                </View>
              </View>

              {/* Katılımcı sayısı Section */}
              <View style={styles.section}>
                <SectionHeader
                  title={<Text style={styles.sectionTitle}>Katılımcı</Text>}
                  rightNode={
                    <TouchableOpacity
                      onPress={() => {
                        setMinParticipants(0);
                        setMaxParticipants(50);
                      }}
                    >
                      <Text style={styles.resetText}>Sıfırla</Text>
                    </TouchableOpacity>
                  }
                  containerStyle={styles.sectionHeader}
                />

                <View style={styles.sliderContainer}>
                  <RangeSlider
                    min={0}
                    max={100}
                    minValue={minParticipants}
                    maxValue={maxParticipants}
                    onMinValueChange={setMinParticipants}
                    onMaxValueChange={setMaxParticipants}
                    step={1}
                  />
                </View>
              </View>

              {/* Sezon Section */}
              <View style={styles.section}>
                <SectionHeader
                  title={<Text style={styles.sectionTitle}>Sezon</Text>}
                  rightNode={
                    <TouchableOpacity onPress={() => setSelectedSeasons([])}>
                      <Text style={styles.resetText}>Sıfırla</Text>
                    </TouchableOpacity>
                  }
                  containerStyle={styles.sectionHeader}
                />

                <View style={styles.toggleRow}>
                  {seasons.map((season, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.toggleChip,
                        selectedSeasons.includes(season) &&
                          styles.toggleChipActive,
                      ]}
                      onPress={() => toggleSeason(season)}
                    >
                      <Text
                        style={[
                          styles.toggleChipText,
                          selectedSeasons.includes(season) &&
                            styles.toggleChipTextActive,
                        ]}
                      >
                        {season}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          ) : (
            <>
              {/* Firma Filtreleme */}
              <View style={styles.section}>
                <SectionHeader
                  title={<Text style={styles.sectionTitle}>Konum</Text>}
                  rightNode={
                    <TouchableOpacity
                      onPress={() => setSelectedFirmaCities([])}
                    >
                      <Text style={styles.resetText}>Sıfırla</Text>
                    </TouchableOpacity>
                  }
                  containerStyle={styles.sectionHeader}
                />

                <TouchableOpacity
                  style={styles.dropdown}
                  onPress={() => setShowFirmaLocationDropdown(true)}
                >
                  <Text style={styles.dropdownText}>Şehir Seçin</Text>
                  <View style={styles.dropdownIcon}>
                    <Ionicons name="chevron-down" size={16} color="#555E67" />
                  </View>
                </TouchableOpacity>

                <View style={styles.cityTagsContainer}>
                  {selectedFirmaCities.map((city, index) => (
                    <View key={index} style={styles.cityTag}>
                      <View style={styles.cityRemoveButton}>
                        <TouchableOpacity onPress={() => removeFirmaCity(city)}>
                          <Ionicons name="close" size={8} color="#FFFFFF" />
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.cityTagText}>{city}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Tur Sayısı */}
              <View style={styles.section}>
                <SectionHeader
                  title={<Text style={styles.sectionTitle}>Tur Sayısı</Text>}
                  rightNode={
                    <TouchableOpacity
                      onPress={() => {
                        setMinTourCount(0);
                        setMaxTourCount(45);
                      }}
                    >
                      <Text style={styles.resetText}>Sıfırla</Text>
                    </TouchableOpacity>
                  }
                  containerStyle={styles.sectionHeader}
                />

                <View style={styles.sliderContainer}>
                  <RangeSlider
                    min={0}
                    max={100}
                    minValue={minTourCount}
                    maxValue={maxTourCount}
                    onMinValueChange={setMinTourCount}
                    onMaxValueChange={setMaxTourCount}
                    step={1}
                  />
                </View>
              </View>

              {/* Onaylı firmalar */}
              <View style={styles.section}>
                <SectionHeader
                  title={
                    <Text style={styles.sectionTitle}>Onaylı Firmalar</Text>
                  }
                  containerStyle={styles.sectionHeader}
                />
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Sadece onaylı firmalar</Text>
                  <Switch
                    value={isOnlyApprovedCompanies}
                    onValueChange={setIsOnlyApprovedCompanies}
                  />
                </View>
              </View>

              {/* Toplam Katılımcı */}
              <View style={styles.section}>
                <SectionHeader
                  title={
                    <Text style={styles.sectionTitle}>Toplam Katılımcı</Text>
                  }
                  rightNode={
                    <TouchableOpacity
                      onPress={() => {
                        setMinTotalParticipants(100);
                        setMaxTotalParticipants(350);
                      }}
                    >
                      <Text style={styles.resetText}>Sıfırla</Text>
                    </TouchableOpacity>
                  }
                  containerStyle={styles.sectionHeader}
                />

                <View style={styles.sliderContainer}>
                  <RangeSlider
                    min={0}
                    max={1000}
                    minValue={minTotalParticipants}
                    maxValue={maxTotalParticipants}
                    onMinValueChange={setMinTotalParticipants}
                    onMaxValueChange={setMaxTotalParticipants}
                    step={10}
                  />
                </View>
              </View>

              {/* Memnuniyet Puanı */}
              <View style={styles.section}>
                <SectionHeader
                  title={
                    <Text style={styles.sectionTitle}>Memnuniyet Puanı</Text>
                  }
                  containerStyle={styles.sectionHeader}
                />
                <View style={styles.toggleRow}>
                  {satisfactionRatings.map((rating, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.toggleChip,
                        selectedSatisfactionRatings.includes(rating) &&
                          styles.toggleChipActive,
                      ]}
                      onPress={() => toggleSatisfactionRating(rating)}
                    >
                      <Text
                        style={[
                          styles.toggleChipText,
                          selectedSatisfactionRatings.includes(rating) &&
                            styles.toggleChipTextActive,
                        ]}
                      >
                        {rating}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}

          {/* Footer Actions */}
          <View style={styles.footer}>
            <Button
              title="Sıfırla"
              onPress={handleResetFilter}
              variant="outline"
              style={styles.resetButton}
            />
            <Button
              title="Uygula"
              onPress={handleApplyFilter}
              variant="primary"
              style={styles.applyButton}
            />
          </View>
        </ScrollView>

        {/* Location Dropdown Modal */}
        {showLocationDropdown && (
          <Modal transparent animationType="fade">
            <View style={styles.overlay}>
              <View style={styles.dropdownContent}>
                <Text style={styles.dropdownTitle}>Şehir Seçin</Text>
                <TextInput
                  placeholder="Şehir ara..."
                  style={styles.searchInput}
                />
                <ScrollView style={{ maxHeight: 300 }}>
                  {availableCities.map((city, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.cityItem}
                      onPress={() => addCity(city)}
                    >
                      <Text style={styles.cityItemText}>{city}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowLocationDropdown(false)}
                >
                  <Text style={styles.closeButtonText}>Kapat</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}

        {/* Firma Location Dropdown Modal */}
        {showFirmaLocationDropdown && (
          <Modal transparent animationType="fade">
            <View style={styles.overlay}>
              <View style={styles.dropdownContent}>
                <Text style={styles.dropdownTitle}>Şehir Seçin</Text>
                <TextInput
                  placeholder="Şehir ara..."
                  style={styles.searchInput}
                />
                <ScrollView style={{ maxHeight: 300 }}>
                  {availableCities.map((city, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.cityItem}
                      onPress={() => addFirmaCity(city)}
                    >
                      <Text style={styles.cityItemText}>{city}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowFirmaLocationDropdown(false)}
                >
                  <Text style={styles.closeButtonText}>Kapat</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EBEBEB",
  },
  content: {
    padding: 16,
  },
  headerContainer: {
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#E3E9ED",
    borderRadius: 16,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#1B1E28",
  },
  tabText: {
    color: "#555E67",
    fontSize: 14,
    fontWeight: "500",
  },
  activeTabText: {
    color: "#FFFFFF",
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1B1E28",
  },
  resetText: {
    color: "#24BAEC",
    fontSize: 12,
    fontWeight: "600",
  },
  dropdown: {
    backgroundColor: "#F0F3F6",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownText: {
    color: "#1B1E28",
    fontSize: 14,
  },
  dropdownIcon: {
    backgroundColor: "#FFFFFF",
    padding: 6,
    borderRadius: 8,
  },
  cityTagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8 as unknown as number,
    marginTop: 12,
  },
  cityTag: {
    backgroundColor: "#E9EEF2",
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  cityRemoveButton: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#7D848D",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  cityTagText: {
    color: "#1B1E28",
    fontSize: 12,
  },
  dateContainer: {
    flexDirection: "row",
    gap: 12 as unknown as number,
  },
  dateInputContainer: {
    flex: 1,
  },
  dateLabel: {
    color: "#7D848D",
    fontSize: 12,
    marginBottom: 6,
  },
  dateInput: {
    backgroundColor: "#F0F3F6",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateInputText: {
    color: "#1B1E28",
    fontSize: 14,
  },
  dateIcon: {
    backgroundColor: "#FFFFFF",
    padding: 6,
    borderRadius: 8,
  },
  timeFiltersContainer: {
    flexDirection: "row",
    gap: 8 as unknown as number,
    marginTop: 12,
  },
  timeFilterButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#F0F3F6",
    alignItems: "center",
  },
  timeFilterButtonActive: {
    backgroundColor: "#1B1E28",
  },
  timeFilterText: {
    color: "#555E67",
    fontSize: 12,
    fontWeight: "600",
  },
  timeFilterTextActive: {
    color: "#FFFFFF",
  },
  sliderContainer: {
    paddingHorizontal: 8,
    marginTop: 4,
  },
  toggleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8 as unknown as number,
  },
  toggleChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#F0F3F6",
    borderRadius: 12,
  },
  toggleChipActive: {
    backgroundColor: "#1B1E28",
  },
  toggleChipText: {
    color: "#555E67",
    fontSize: 12,
    fontWeight: "600",
  },
  toggleChipTextActive: {
    color: "#FFFFFF",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  switchLabel: {
    color: "#1B1E28",
    fontSize: 14,
  },
  footer: {
    flexDirection: "row",
    gap: 12 as unknown as number,
    marginVertical: 16,
  },
  resetButton: {
    flex: 1,
    backgroundColor: "#F0F3F6",
    borderRadius: 12,
    paddingVertical: 14,
  },
  applyButton: {
    flex: 1,
    backgroundColor: "#24BAEC",
    borderRadius: 12,
    paddingVertical: 14,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  dropdownContent: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
  },
  dropdownTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#1B1E28",
  },
  searchInput: {
    backgroundColor: "#F0F3F6",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  cityItem: {
    paddingVertical: 10,
  },
  cityItemText: {
    color: "#1B1E28",
    fontSize: 14,
  },
  closeButton: {
    backgroundColor: "#1B1E28",
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 12,
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
