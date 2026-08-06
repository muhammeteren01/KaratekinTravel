import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import TripDetailScreen from "./TripDetailScreen";
import QRScreen from "./QRScreen";
import { AppHeader, EmptyState } from "@/shared/ui";
import { TripCards } from "@/shared/ui";
import type { CalendarTrip } from "@/core/data/schemas";
import { useCalendarTrips, useTrips } from "@/features/trips/hooks";
import { LoadingView, ErrorView } from "@/shared/ui";
import { usePurchasedTripsState } from "@/context/UserState";
import { resolveImage } from "@/core/data/schemas";
import { mapTripsSchemaToUi } from "@/core/data/adapters";
import type { Trip } from "@/types/trip";
import {
  useSafeAreaInsets,
  SafeAreaView,
} from "react-native-safe-area-context";

interface CalendarScreenProps {
  onBack: () => void;
  onShowProgramDetail?: (tripData: any) => void;
  // Match Home behavior for TripDetail: bookmark/save integration
  onBookmarkTrip?: (trip: any) => void;
  isTripSaved?: (tripId: number) => boolean;
  onOpenNotifications?: () => void;
  onShowQR?: () => void; // optional external navigation to QR
}

export default function CalendarScreen({
  onBack,
  onShowProgramDetail,
  onBookmarkTrip,
  isTripSaved,
  onOpenNotifications,
  onShowQR,
}: CalendarScreenProps) {
  const insets = useSafeAreaInsets();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  const [showTripDetail, setShowTripDetail] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const {
    data: tripsRaw = [],
    isLoading: tripsLoading,
    isError: tripsError,
    refetch: refetchTrips,
  } = useTrips();
  const allTripsData: Trip[] = mapTripsSchemaToUi(tripsRaw);
  const {
    data: calendarTripsRaw = [],
    isLoading: calendarLoading,
    isError: calendarError,
    refetch: refetchCalendar,
  } = useCalendarTrips();
  if (tripsLoading || calendarLoading) return <LoadingView />;
  if (tripsError || calendarError)
    return (
      <ErrorView
        onRetry={() => {
          tripsError && refetchTrips();
          calendarError && refetchCalendar();
        }}
      />
    );
  const [showQR, setShowQR] = useState(false);

  const weekDays = ["P", "S", "Ç", "P", "C", "C", "P"];
  const monthNames = [
    "Ocak",
    "Şubat",
    "Mart",
    "Nisan",
    "Mayıs",
    "Haziran",
    "Temmuz",
    "Ağustos",
    "Eylül",
    "Ekim",
    "Kasım",
    "Aralık",
  ];

  // Initialize current week start to Monday of current week
  useEffect(() => {
    const today = new Date();
    const mondayOfWeek = getMonday(today);
    setCurrentWeekStart(mondayOfWeek);
  }, []);

  const getMonday = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const getWeekDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  // Purchased trips of the current user (user-scoped from supportingData.userState)
  const { purchasedIds } = usePurchasedTripsState();
  const purchasedTrips: Trip[] = useMemo(
    () => allTripsData.filter((t) => purchasedIds.includes(String(t.id))),
    [allTripsData, purchasedIds],
  );

  const toISODate = (d?: Date): string => {
    if (!d) return new Date().toISOString().split("T")[0];
    return new Date(d).toISOString().split("T")[0];
  };

  const purchasedCalendarTrips: CalendarTrip[] = useMemo(
    () =>
      purchasedTrips.map((t) => ({
        id: String(t.id),
        title: t.title,
        location: t.location,
        date: toISODate(t.dateStart),
        time: "09:00",
        image: "asset:ob1",
      })),
    [purchasedTrips],
  );

  const handlePreviousWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(newWeekStart);
    // Reset selected date when changing weeks
    setSelectedDate(null);
  };

  const handleNextWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(newWeekStart);
    // Reset selected date when changing weeks
    setSelectedDate(null);
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const isSameDay = (date1: Date, date2: Date | null) => {
    if (!date2) return false;
    return formatDate(date1) === formatDate(date2);
  };

  const sameMonthDay = (d1?: Date, d2?: Date | null) => {
    if (!d1 || !d2) return false;
    const a = new Date(d1);
    const b = new Date(d2);
    return a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  };

  const getTripsForSelectedDate = () => {
    if (!selectedDate) {
      // Tarih seçili değilse sadece satın alınan tüm programları döndür
      return purchasedCalendarTrips;
    }
    // Yıl bağımsız: ay-gün eşleşmesine göre filtrele ve tarihi seçilen yıl/gün ile hizala
    const selected = new Date(selectedDate);
    const selectedDateStr = formatDate(selected);
    const matches = purchasedTrips.filter((t) =>
      sameMonthDay(t.dateStart, selected),
    );
    return matches.map<CalendarTrip>((t) => ({
      id: String(t.id),
      title: t.title,
      location: t.location,
      date: selectedDateStr,
      time: "09:00",
      image: "asset:ob1",
    }));
  };

  const hasTripsOnDate = (date: Date) => {
    // Yıl bağımsız ay-gün bazlı kontrol
    return purchasedTrips.some((t) => sameMonthDay(t.dateStart, date));
  };

  const formatTripDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    return `${day} ${month}`;
  };

  const getCurrentDisplayMonth = () => {
    // Haftanın ortasındaki tarihin ayını göster
    const midWeekDate = new Date(currentWeekStart);
    midWeekDate.setDate(currentWeekStart.getDate() + 3);
    return monthNames[midWeekDate.getMonth()];
  };

  const getCurrentDisplayDate = () => {
    if (selectedDate) {
      return `${selectedDate.getDate()} ${monthNames[selectedDate.getMonth()]}`;
    }
    // Seçili tarih yoksa bugünün ayını göster
    const midWeekDate = new Date(currentWeekStart);
    midWeekDate.setDate(currentWeekStart.getDate() + 3);
    return monthNames[midWeekDate.getMonth()];
  };

  const renderTripCard = (trip: CalendarTrip) => (
    <TripCards.CalendarTripCard
      key={trip.id}
      image={resolveImage(trip.image) as any}
      title={trip.title}
      location={trip.location}
      date={formatTripDate(trip.date)}
      time={trip.time}
      priceText={
        purchasedTrips.find((t) => String(t.id) === String(trip.id))?.price ||
        undefined
      }
      onPress={() => {
        // Önce satın alınan trip listesinden gerçek Trip'i bulmaya çalış
        const original =
          purchasedTrips.find((t) => String(t.id) === String(trip.id)) ||
          allTripsData.find((t) => String(t.id) === String(trip.id));
        const fullTripData = original ?? null;
        setSelectedTrip(fullTripData);
        setShowTripDetail(true);
      }}
    />
  );

  const weekDates = getWeekDates();
  const selectedTrips = getTripsForSelectedDate();

  // Show TripDetailScreen if a trip is selected
  if (showTripDetail && selectedTrip) {
    // Show the trip detail, and when QR is requested overlay it with a full-screen Modal
    return (
      <View style={{ flex: 1, marginTop: -insets.top }}>
        <TripDetailScreen
          onBack={() => {
            setShowTripDetail(false);
            setSelectedTrip(null);
          }}
          tripData={selectedTrip}
          onBookmarkTrip={onBookmarkTrip}
          isTripSaved={isTripSaved ? isTripSaved(selectedTrip.id) : false}
          isPurchased
          onShowQRCode={() => (onShowQR ? onShowQR() : setShowQR(true))}
        />

        <Modal
          visible={showQR}
          animationType="slide"
          presentationStyle="fullScreen"
          onRequestClose={() => setShowQR(false)}
        >
          <SafeAreaView style={{ flex: 1 }}>
            <QRScreen
              onBack={() => setShowQR(false)}
              onHome={() => {
                setShowQR(false);
                setShowTripDetail(false);
              }}
            />
          </SafeAreaView>
        </Modal>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader
        title="Takvim"
        onBack={onBack}
        safeAreaTop
        right={
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={onOpenNotifications}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={24} color="#1B1E28" />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Calendar Card */}
        <View style={styles.calendarCard}>
          {/* Month and Date Display */}
          <View style={styles.monthContainer}>
            <Text style={styles.monthText}>{getCurrentDisplayDate()}</Text>
            <View style={styles.navigationButtons}>
              <TouchableOpacity
                style={styles.navButton}
                onPress={handlePreviousWeek}
              >
                <Ionicons name="chevron-back" size={20} color="#1B1E28" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.navButton}
                onPress={handleNextWeek}
              >
                <Ionicons name="chevron-forward" size={20} color="#1B1E28" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Calendar Week View */}
          <View style={styles.weekDaysContainer}>
            {weekDates.map((date, index) => (
              <View key={index} style={styles.dayColumn}>
                <Text style={styles.dayText}>{weekDays[index]}</Text>
                <TouchableOpacity
                  style={[
                    styles.dateButton,
                    isSameDay(date, selectedDate) && styles.selectedDateButton,
                  ]}
                  onPress={() => setSelectedDate(new Date(date))}
                >
                  <Text
                    style={[
                      styles.calendarDateText,
                      isSameDay(date, selectedDate) && styles.selectedDateText,
                    ]}
                  >
                    {date.getDate()}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Programs Section */}
        <View style={styles.programsHeader}>
          <Text style={styles.programsTitle}>Programlarım</Text>
        </View>

        {/* Trips List */}
        <View style={styles.tripsContainer}>
          {selectedTrips.length > 0 ? (
            selectedTrips.map(renderTripCard)
          ) : selectedDate ? (
            <EmptyState
              icon={{ name: "calendar-outline", size: 48, color: "#E6E6EA" }}
              title="Bu tarihte program yok"
              subtitle={`${formatTripDate(formatDate(selectedDate))} tarihinde planlanmış bir program bulunmuyor.`}
            />
          ) : (
            <EmptyState
              icon={{ name: "calendar-outline", size: 48, color: "#E6E6EA" }}
              title="Hiç program yok"
              subtitle="Henüz planlanmış bir program bulunmuyor."
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F7F7F9",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  notificationDot: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FF7029",
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
  calendarCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    marginHorizontal: 20,
    marginBottom: 30,
    padding: 16,
    shadowColor: "#B4BCC9",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 5,
    marginTop: 20,
  },
  monthContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  monthText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1B1E28",
    lineHeight: 28,
  },
  navigationButtons: {
    flexDirection: "row",
    gap: 8,
  },
  navButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#F7F7F9",
    justifyContent: "center",
    alignItems: "center",
  },
  weekDaysContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  dayColumn: {
    alignItems: "center",
    flex: 1,
  },
  dayText: {
    fontSize: 15,
    color: "#7D848D",
    marginBottom: 12,
    fontWeight: "400",
    letterSpacing: 0.3,
  },
  dateButton: {
    width: 44,
    height: 76,
    borderRadius: 12,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  selectedDateButton: {
    backgroundColor: "#FF7029",
  },
  calendarDateText: {
    fontSize: 16,
    color: "#1B1E28",
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  selectedDateText: {
    color: "#FFFFFF",
  },
  programsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  programsTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1B1E28",
    lineHeight: 28,
  },
  seeAllText: {
    fontSize: 14,
    color: "#FF7029",
    fontWeight: "400",
    lineHeight: 16,
  },
  tripsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
});
