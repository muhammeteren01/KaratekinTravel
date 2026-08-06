import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import PaymentScreen from "./PaymentScreen";
import { BlurView } from "expo-blur";
import { useReservationPresets } from "@/core/data/store";
import { LoadingView, ErrorView, InfoRow, Button } from "@/shared/ui";
import { SeatStatus } from "@/types/reservation";
import { resolveImage } from "@/core/data/schemas";
import { AppHeader } from "@/shared/ui";

interface ReservationScreenProps {
  onBack: () => void;
  onHome?: () => void;
  reservationId?: string;
}
interface SeatData {
  number: number;
  status: SeatStatus;
}

export default function ReservationScreen({
  onBack,
  onHome,
  reservationId,
}: ReservationScreenProps) {
  const {
    data: presets,
    isLoading,
    isError,
    refetch,
  } = useReservationPresets();
  if (isLoading) return <LoadingView />;
  if (isError) return <ErrorView onRetry={refetch} />;
  const data = useMemo(() => {
    const list = presets ?? [];
    return list.find((p) => p.id === (reservationId || list[0]?.id)) || list[0];
  }, [presets, reservationId]);
  const [showPayment, setShowPayment] = useState(false);
  const [seats, setSeats] = useState<SeatData[]>(() => {
    const initialSeats: SeatData[] = [];
    const total = data?.layout.totalSeats ?? 28;
    const sold = new Map<number, SeatStatus>();
    (data?.soldSeats ?? []).forEach((s) => sold.set(s.number, s.status));
    for (let i = 1; i <= total; i++) {
      const preset = sold.get(i);
      if (preset === "male" || preset === "female")
        initialSeats.push({ number: i, status: preset });
      else initialSeats.push({ number: i, status: "available" });
    }
    return initialSeats;
  });

  useEffect(() => {
    const nextSeats: SeatData[] = [];
    const total = data?.layout.totalSeats ?? 28;
    const sold = new Map<number, SeatStatus>();
    (data?.soldSeats ?? []).forEach((s) => sold.set(s.number, s.status));
    for (let i = 1; i <= total; i++) {
      const preset = sold.get(i);
      if (preset === "male" || preset === "female")
        nextSeats.push({ number: i, status: preset });
      else nextSeats.push({ number: i, status: "available" });
    }
    setSeats(nextSeats);
  }, [data?.id]);

  const [showGenderPopup, setShowGenderPopup] = useState(false);
  const [selectedSeatForGender, setSelectedSeatForGender] = useState<
    number | null
  >(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

  const handleSeatPress = (seatNumber: number, event: any) => {
    const seat = seats.find((s) => s.number === seatNumber);
    if (!seat) return;
    if (seat.status === "available") {
      event.target.measure(
        (
          fx: number,
          fy: number,
          width: number,
          height: number,
          px: number,
          py: number,
        ) => {
          setPopupPosition({ x: px + width / 2, y: py - 60 });
          setSelectedSeatForGender(seatNumber);
          setShowGenderPopup(true);
        },
      );
    } else if (seat.status === "selected") {
      setSeats(
        seats.map((s) =>
          s.number === seatNumber ? { ...s, status: "available" } : s,
        ),
      );
    }
  };

  const handleGenderSelect = (gender: "male" | "female") => {
    if (selectedSeatForGender) {
      setSeats(
        seats.map((s) =>
          s.number === selectedSeatForGender ? { ...s, status: "selected" } : s,
        ),
      );
    }
    setShowGenderPopup(false);
    setSelectedSeatForGender(null);
  };

  const closePopup = () => {
    setShowGenderPopup(false);
    setSelectedSeatForGender(null);
  };

  const renderSeat = (seatNumber: number) => {
    const seat = seats.find((s) => s.number === seatNumber);
    if (!seat) return null;
    let seatStyle: any[] = [styles.seat];
    let textStyle: any[] = [styles.seatNumber];
    switch (seat.status) {
      case "available":
        seatStyle = [styles.seat, styles.seatAvailable];
        textStyle = [styles.seatNumber, styles.seatNumberAvailable];
        break;
      case "selected":
        seatStyle = [styles.seat, styles.seatSelected];
        textStyle = [styles.seatNumber, styles.seatNumberSelected];
        break;
      case "male":
        seatStyle = [styles.seat, styles.seatMale];
        textStyle = [styles.seatNumber, styles.seatNumberSelected];
        break;
      case "female":
        seatStyle = [styles.seat, styles.seatFemale];
        textStyle = [styles.seatNumber, styles.seatNumberSelected];
        break;
    }
    return (
      <TouchableOpacity
        key={seatNumber}
        style={seatStyle}
        onPress={(event) => handleSeatPress(seatNumber, event)}
        disabled={seat.status === "male" || seat.status === "female"}
      >
        <Text style={textStyle}>{seatNumber}</Text>
      </TouchableOpacity>
    );
  };

  const selectedSeatNumbers = seats
    .filter((s) => s.status === "selected")
    .map((s) => s.number);
  const selectedSeatsCount = selectedSeatNumbers.length;
  if (showPayment) {
    return (
      <PaymentScreen
        onBack={() => setShowPayment(false)}
        onHome={onHome}
        seatCount={Math.max(1, selectedSeatsCount)}
        tripId={reservationId}
        seatNumbers={selectedSeatNumbers}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor="transparent" translucent />
      <ImageBackground
        source={resolveImage(data?.backgroundImage || "asset:ob2")}
        style={styles.backgroundImage}
        resizeMode="cover"
        blurRadius={8}
      >
        <View style={styles.overlay}>
          <View style={styles.overlayTint}>
            <AppHeader
              title="Rezervasyon Yap"
              showBack={false}
              titleColor="#FFFFFF"
              backgroundColor="transparent"
              left={
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                  <BlurView
                    intensity={30}
                    tint="light"
                    style={styles.backButtonBlur}
                  >
                    <View style={styles.backButtonInner}>
                      <Ionicons name="chevron-back" size={22} color="black" />
                    </View>
                  </BlurView>
                </TouchableOpacity>
              }
            />

            <View style={styles.contentCard}>
              <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                <View style={styles.cardHandle} />
                <Text style={styles.title}>Koltuk Seçimi Yapınız</Text>
                <Text style={styles.subtitle}>{data?.companyName ?? "—"}</Text>

                <View style={styles.tripInfo}>
                  <InfoRow
                    icon="time-outline"
                    text={`${data?.durationHours ?? 0} saat`}
                    iconSize={16}
                    color="#666"
                  />
                  <InfoRow
                    icon="wifi"
                    text={
                      (data?.amenities ?? []).includes("wifi") ? "Wi-Fi" : "—"
                    }
                    iconSize={16}
                    color="#666"
                  />
                  <InfoRow
                    icon="calendar-outline"
                    text={data?.dateLabel ?? "—"}
                    iconSize={16}
                    color="#666"
                  />
                  <InfoRow
                    icon="people-outline"
                    text={data?.busType ?? "—"}
                    iconSize={16}
                    color="#666"
                  />
                </View>

                <View style={styles.legend}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendColor, styles.available]} />
                    <Text style={styles.legendText}>Uygun</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendColor, styles.selected]} />
                    <Text style={styles.legendText}>Seçili</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendColor, styles.male]} />
                    <Text style={styles.legendText}>Dolu - Erkek</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendColor, styles.female]} />
                    <Text style={styles.legendText}>Dolu - Kadın</Text>
                  </View>
                </View>

                {!!(data?.amenities && data.amenities.length) && (
                  <View style={styles.amenitiesWrap}>
                    {data.amenities.map((a, idx) => {
                      let icon: any = "ellipse-outline";
                      let label = a.toUpperCase();
                      switch (a) {
                        case "wifi":
                          icon = "wifi-outline";
                          label = "Wi‑Fi";
                          break;
                        case "tv":
                          icon = "tv-outline";
                          label = "TV";
                          break;
                        case "power":
                          icon = "flash-outline";
                          label = "Priz";
                          break;
                        case "snack":
                          icon = "fast-food-outline";
                          label = "Atıştırmalık";
                          break;
                        case "wc":
                          icon = "male-female-outline";
                          label = "WC";
                          break;
                        case "usb":
                          icon = "usb-outline";
                          label = "USB";
                          break;
                      }
                      return (
                        <View key={`${a}-${idx}`} style={styles.amenityItem}>
                          <Ionicons name={icon} size={16} color="#7D848D" />
                          <Text style={styles.amenityText}>{label}</Text>
                        </View>
                      );
                    })}
                  </View>
                )}

                <View style={styles.busContainer}>
                  <View style={styles.busFront}>
                    <View style={styles.windshield} />
                  </View>
                  <View style={styles.busHeader}>
                    <View style={styles.driverIcon}>
                      <Image
                        source={resolveImage("asset:steering-wheel")}
                        style={styles.steeringWheelIcon}
                        resizeMode="contain"
                      />
                    </View>
                    <View style={styles.genderIcons} />
                  </View>
                  <View style={styles.seatsContainer}>
                    {Array.from(
                      { length: data?.layout.rows ?? 7 },
                      (_, idx) => idx + 1,
                    ).map((row) => {
                      const seatsLeft = data?.layout.seatsLeft ?? 2;
                      const seatsRight = data?.layout.seatsRight ?? 2;
                      const perRow = seatsLeft + seatsRight;
                      const base = (row - 1) * perRow + 1;
                      return (
                        <View key={row} style={styles.seatRow}>
                          <View style={styles.leftSeats}>
                            {Array.from({ length: seatsLeft }).map((_, i) => (
                              <React.Fragment key={`L-${row}-${i}`}>
                                {renderSeat(base + i)}
                              </React.Fragment>
                            ))}
                          </View>
                          <View style={styles.aisle} />
                          <View style={styles.rightSeats}>
                            {Array.from({ length: seatsRight }).map((_, i) => (
                              <React.Fragment key={`R-${row}-${i}`}>
                                {renderSeat(base + seatsLeft + i)}
                              </React.Fragment>
                            ))}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                  <View style={styles.busBack} />
                </View>

                <Button
                  title="Onayla ve Devam Et"
                  onPress={() => setShowPayment(true)}
                  disabled={selectedSeatsCount === 0}
                  variant="primary"
                  style={styles.confirmButton}
                />
              </ScrollView>
            </View>
          </View>
        </View>
      </ImageBackground>

      {showGenderPopup && (
        <TouchableOpacity
          style={styles.popupOverlay}
          activeOpacity={1}
          onPress={closePopup}
        >
          <View
            style={[
              styles.popupBubble,
              { left: popupPosition.x - 75, top: popupPosition.y },
            ]}
          >
            <View style={styles.popupArrow} />
            <View style={styles.popupContent}>
              <Text style={styles.popupTitle}>Cinsiyet Seçiniz</Text>
              <View style={styles.genderButtons}>
                <TouchableOpacity
                  style={[styles.genderButton, styles.maleButton]}
                  onPress={() => handleGenderSelect("male")}
                >
                  <Ionicons name="male" size={20} color="white" />
                  <Text style={styles.genderButtonText}>Erkek</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.genderButton, styles.femaleButton]}
                  onPress={() => handleGenderSelect("female")}
                >
                  <Ionicons name="female" size={20} color="white" />
                  <Text style={styles.genderButtonText}>Kadın</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
  },
  overlay: {
    flex: 1,
  },
  overlayTint: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
  },
  backButtonBlur: { flex: 1 },
  backButtonInner: {
    flex: 1,
    backgroundColor: "#F7F7F9",
    opacity: 0.95,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  placeholder: {
    width: 44,
    height: 44,
  },
  contentCard: {
    flex: 1,
    backgroundColor: "white",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: 5,
  },
  cardHandle: {
    width: 50,
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#999",
    marginBottom: 24,
  },
  tripInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    fontSize: 11,
    color: "#666",
  },
  amenitiesWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
    paddingHorizontal: 2,
  },
  amenityItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  amenityText: {
    fontSize: 12,
    color: "#7D848D",
    marginLeft: 6,
    fontWeight: "500",
  },
  available: {
    backgroundColor: "#E0E0E0",
  },
  selected: {
    backgroundColor: "#FF6B35",
  },
  male: {
    backgroundColor: "#00BCD4",
  },
  female: {
    backgroundColor: "#E91E63",
  },
  busContainer: {
    backgroundColor: "#F8F9FA",
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    borderWidth: 2,
    borderColor: "#E0E0E0",
  },
  busFront: {
    height: 30,
    backgroundColor: "#D0D0D0",
    borderRadius: 15,
    marginBottom: 10,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
  windshield: {
    flex: 1,
    height: "100%",
    backgroundColor: "#87CEEB",
    borderRadius: 10,
    margin: 5,
    opacity: 0.3,
  },
  busHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  driverIcon: {
    flex: 1,
  },
  genderIcons: {
    flexDirection: "row",
    gap: 30,
  },
  genderIcon: {
    alignItems: "center",
  },
  genderText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  seatsContainer: {
    gap: 10,
    paddingVertical: 10,
  },
  seatRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leftSeats: {
    flexDirection: "row",
    gap: 8,
  },
  rightSeats: {
    flexDirection: "row",
    gap: 8,
  },
  aisle: {
    width: 30,
    height: 2,
    backgroundColor: "#E0E0E0",
    borderRadius: 1,
  },
  seat: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  seatAvailable: {
    backgroundColor: "#E0E0E0",
  },
  seatSelected: {
    backgroundColor: "#FF6B35",
  },
  seatMale: {
    backgroundColor: "#00BCD4",
  },
  seatFemale: {
    backgroundColor: "#E91E63",
  },
  seatNumber: {
    fontSize: 12,
    fontWeight: "600",
  },
  seatNumberAvailable: {
    color: "#666",
  },
  seatNumberSelected: {
    color: "white",
  },
  confirmButton: {
    backgroundColor: "#FF6B35",
    borderRadius: 25,
    paddingVertical: 16,
  },
  popupOverlay: {
    position: "absolute",
    top: -70,
    left: 15,
    right: 0,
    bottom: 0,
  },
  popupBubble: {
    position: "absolute",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    width: 150,
  },
  popupArrow: {
    position: "absolute",
    bottom: -8,
    left: "50%",
    marginLeft: -8,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderStyle: "solid",
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "white",
  },
  popupContent: {
    alignItems: "center",
  },
  popupTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    textAlign: "center",
  },
  genderButtons: {
    flexDirection: "row",
    gap: 10,
  },
  genderButton: {
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    minWidth: 60,
  },
  maleButton: {
    backgroundColor: "#00BCD4",
  },
  femaleButton: {
    backgroundColor: "#E91E63",
  },
  genderButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 30,
  },
  busBack: {
    height: 20,
    backgroundColor: "#D0D0D0",
    borderRadius: 10,
    marginTop: 15,
  },
  steeringWheelIcon: {
    width: 24,
    height: 24,
  },
});
