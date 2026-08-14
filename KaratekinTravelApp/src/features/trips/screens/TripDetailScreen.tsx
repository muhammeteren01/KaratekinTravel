import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ImageBackground,
  Linking,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import RouteScreen from "./RouteScreen";
import ReservationScreen from "@/features/reservations/screens/ReservationScreen";
import { Trip } from "@/types/trip";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import PriceInfoModal from "@/components/PriceInfoModal";
import { formatCurrency as simpleFormatCurrency } from "@/utils/formatCurrency";
import ImageViewerModal from "@/components/ImageViewerModal";
import { resolveImage } from "@/core/data/schemas";
import Badge from "@/shared/ui/Badge";
import { SegmentedTabs, RatingStars, Button } from "@/shared/ui";
import { userAvatarSource } from "@/utils/avatar";
import { useAuth } from "@/context/AuthContext";

interface TripDetailScreenProps {
  onBack: () => void;
  onHome?: () => void;
  tripData?: Trip;
  onBookmarkTrip?: (trip: any) => void;
  isTripSaved?: boolean;
  isPurchased?: boolean; // Kullanıcı bu turu satın aldı mı
  tripHasEnded?: boolean; // Tur tamamlandı mı (değerlendirme butonu için)
  onShowTicket?: () => void; // Bilet / rezervasyon bilgisi
  onOpenSupport?: () => void; // Destek / sohbet
  onShowQRCode?: () => void; // QR kodu göster
  onRateTrip?: () => void; // Tur sonrası değerlendirme
  onDownloadPDF?: () => void; // Tur detay PDF indir
}

export default function TripDetailScreen(props: TripDetailScreenProps) {
  const { currentUser } = useAuth();
  const {
    onBack,
    onHome,
    tripData,
    onBookmarkTrip,
    isTripSaved = false,
    isPurchased: propPurchased = false,
    tripHasEnded = false,
    onShowTicket,
    onOpenSupport,
    onShowQRCode,
    onRateTrip,
    onDownloadPDF,
  } = props || ({} as TripDetailScreenProps);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "about" | "details" | "policy" | "hotel"
  >("about");
  const [showRoute, setShowRoute] = useState(false);
  const [showReservation, setShowReservation] = useState(false);
  const [showPriceInfo, setShowPriceInfo] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [imageViewerIndex, setImageViewerIndex] = useState(0);

  const defaultTripData: Trip = {
    id: 0,
    title: "Amasra Turu",
    location: "Amasra, Türkiye",
    city: "Amasra",
    region: "Kastamonu",
    rating: 4.7,
    reviewCount: 2498,
    price: "$250/Kişi",
    peopleCountLabel: "+0",
    dateRange: "—",
    capacity: 0,
    joinedCount: 0,
    avatars: [],
    image: resolveImage("asset:ob1") as any,
    headerImage: resolveImage("asset:ob1") as any,
    gallery: [
      resolveImage("asset:ob1") as any,
      resolveImage("asset:ob2") as any,
      resolveImage("asset:ob3") as any,
      resolveImage("asset:ob1") as any,
      resolveImage("asset:ob2") as any,
    ],
    description:
      "Karadeniz'in incisi Amasra'da unutulmaz bir tatil deneyimi sizi bekliyor. Tarihi dokusu, muhteşem doğası ve eşsiz deniz manzarası ile Amasra, her yaştan ziyaretçi için ideal bir destinasyondır.",
  };

  const trip: Trip = { ...defaultTripData, ...(tripData || {}) } as Trip;
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");
  const insets = useSafeAreaInsets();
  // Responsive hero height: between 200 and 260, ~28% of screen height
  const headerHeight = Math.round(
    Math.min(260, Math.max(200, screenHeight * 0.28)),
  );
  // Daha geniş kart: ekran paddings (20 + küçük scroll iç boşluk) düşülerek, üst limit 340
  const itineraryCardWidth = Math.min(340, screenWidth - 48);
  const isPurchased = propPurchased || !!trip.purchased;

  const fullText = trip.description || defaultTripData.description;
  const shortText =
    fullText && fullText.length > 220
      ? fullText.slice(0, 220) + "..."
      : fullText;

  const formatCurrency = (amount?: number, currency: string = "USD") =>
    simpleFormatCurrency(amount, currency);

  const displayPrice = trip.pricing
    ? formatCurrency(trip.pricing.basePrice, trip.pricing.currency)
    : trip.price || "";

  // Unified gallery with local fallback, used by thumbs and the viewer
  const gallery = useMemo(() => {
    const fallback = [
      resolveImage("asset:ob1") as any,
      resolveImage("asset:ob2") as any,
      resolveImage("asset:ob3") as any,
      resolveImage("asset:ob1") as any,
      resolveImage("asset:ob2") as any,
    ];
    const gal =
      trip.gallery && trip.gallery.length > 0 ? trip.gallery : fallback;
    return gal;
  }, [trip.gallery]);

  const openImageViewer = (idx: number) => {
    setImageViewerIndex(
      Math.max(0, Math.min(idx, Math.max(0, gallery.length - 1))),
    );
    setShowImageViewer(true);
  };

  // Map each hotel index to the list of day numbers that use it (from itinerary)
  const hotelDayMap: Record<number, number[]> = React.useMemo(() => {
    const map: Record<number, number[]> = {};
    if (trip.itinerary && trip.itinerary.length) {
      trip.itinerary.forEach((d) => {
        if (typeof d.hotelIndex === "number") {
          if (!map[d.hotelIndex]) map[d.hotelIndex] = [];
          // push the actual day number (not zero-based index)
          if (typeof d.day === "number") map[d.hotelIndex].push(d.day);
        }
      });
      // ensure uniqueness & sort
      Object.keys(map).forEach((k) => {
        const unique = Array.from(new Set(map[Number(k)]));
        unique.sort((a, b) => a - b);
        map[Number(k)] = unique;
      });
    }
    return map;
  }, [trip.itinerary]);

  const toggleExpanded = () => setIsExpanded(!isExpanded);
  const handleRouteView = () => setShowRoute(true);
  const handleRouteBack = () => setShowRoute(false);
  const handleReservation = () => setShowReservation(true);
  const handleReservationBack = () => setShowReservation(false);

  if (showRoute) return <RouteScreen onBack={handleRouteBack} />;
  if (showReservation)
    return (
      <ReservationScreen
        onBack={handleReservationBack}
        onHome={onHome}
        reservationId={String(trip?.id || "default")}
      />
    );

  return (
    <View style={styles.container}>
      <StatusBar translucent />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <ImageBackground
          source={
            (trip.headerImage as any) ||
            (trip.image as any) ||
            (resolveImage("asset:ob1") as any)
          }
          style={[styles.headerImage, { height: headerHeight }]}
          resizeMode="cover"
        >
          <View
            style={[styles.headerTopRow, { top: Math.max(8, insets.top + 8) }]}
          >
            <TouchableOpacity
              onPress={onBack}
              style={styles.headerIconButton}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityRole="button"
              accessibilityLabel="Geri"
            >
              <BlurView
                intensity={30}
                tint="dark"
                style={styles.headerIconBlur}
              >
                <Ionicons name="chevron-back" size={22} color="#FFF" />
              </BlurView>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                onBookmarkTrip && tripData && onBookmarkTrip(tripData)
              }
              style={styles.headerIconButton}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityRole="button"
              accessibilityLabel={
                isTripSaved ? "Yer imi kaldır" : "Yer imi ekle"
              }
            >
              <BlurView
                intensity={30}
                tint="dark"
                style={styles.headerIconBlur}
              >
                <Ionicons
                  name={isTripSaved ? "bookmark" : "bookmark-outline"}
                  size={20}
                  color="#FFF"
                />
              </BlurView>
            </TouchableOpacity>
          </View>
          <LinearGradient
            colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.9)"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 0, y: 1 }}
            style={styles.headerGradient}
          />
        </ImageBackground>

        <View style={styles.contentCard}>
          <View style={styles.handleBar} />

          <View style={styles.titleSection}>
            <View style={styles.titleContainer}>
              <Text style={styles.tripTitle}>{trip.title}</Text>
              <Text style={styles.tripLocation}>{trip.location}</Text>
            </View>
            <Image
              source={userAvatarSource(currentUser?.avatar)}
              style={styles.avatar}
            />
          </View>

          <View style={styles.metaRow}>
            <Badge
              text={trip.city}
              variant="neutral"
              leftIcon={
                <Ionicons name="location-outline" size={14} color="#7D848D" />
              }
              containerStyle={styles.cityPill}
              textStyle={styles.cityPillText}
            />
            <View style={styles.ratingRow}>
              <Ionicons
                name="star"
                size={16}
                color="#FFD336"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.ratingValue}>
                {Number(trip.rating).toFixed(1)}
              </Text>
              <Text style={styles.ratingCount}>({trip.reviewCount})</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>{displayPrice}</Text>
              <TouchableOpacity
                onPress={() => setShowPriceInfo(true)}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Ionicons
                  name="information-circle"
                  size={18}
                  color="#7D848D"
                  style={{ opacity: 0.4, marginLeft: 6 }}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.thumbsRow}>
            {(() => {
              const firstFour = gallery.slice(0, 4);
              const extraCount = Math.max(0, gallery.length - 4);
              const fifth = gallery[4];
              return (
                <>
                  {firstFour.map((img, idx) => (
                    <TouchableOpacity
                      key={`g-${idx}`}
                      activeOpacity={0.8}
                      onPress={() => openImageViewer(idx)}
                    >
                      <Image source={img} style={styles.thumb} />
                    </TouchableOpacity>
                  ))}
                  {fifth ? (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => openImageViewer(4)}
                      style={[styles.thumb, styles.thumbOverlayContainer]}
                    >
                      <Image source={fifth} style={styles.thumb} />
                      {extraCount > 0 && (
                        <View style={styles.thumbOverlay}>
                          <Text
                            style={styles.thumbOverlayText}
                          >{`+${extraCount}`}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ) : null}
                </>
              );
            })()}
          </View>

          <SegmentedTabs
            items={["Tur Hakkında", "Ek Detaylar", "İptal & Değişim", "Otel"]}
            value={
              activeTab === "about"
                ? "Tur Hakkında"
                : activeTab === "details"
                  ? "Ek Detaylar"
                  : activeTab === "policy"
                    ? "İptal & Değişim"
                    : "Otel"
            }
            onChange={(label) => {
              const tabMap: Record<
                string,
                "about" | "details" | "policy" | "hotel"
              > = {
                "Tur Hakkında": "about",
                "Ek Detaylar": "details",
                "İptal & Değişim": "policy",
                Otel: "hotel",
              };
              setActiveTab(tabMap[label]);
            }}
            variant="filled"
            size="sm"
            scrollable={false}
            style={{ alignSelf: "center" }}
            tabStyle={{
              paddingVertical: 18,
              paddingHorizontal: 8,
              flex: 1,
              left: -6,
            }}
            activeTabStyle={{ backgroundColor: "#FF6B35" }}
            activeTextStyle={{ color: "#FFFFFF" }}
          />

          {activeTab === "about" && (
            <View style={styles.aboutSection}>
              <Text style={styles.aboutTitle}>Tur Hakkında</Text>
              <Text style={styles.aboutText}>
                {isExpanded ? fullText : shortText}
                {!isExpanded && (
                  <Text style={styles.readMoreText} onPress={toggleExpanded}>
                    {" "}
                    Read More
                  </Text>
                )}
              </Text>
              {isExpanded && (
                <TouchableOpacity
                  onPress={toggleExpanded}
                  style={styles.showLessContainer}
                >
                  <Text style={styles.readMoreText}>Show Less</Text>
                </TouchableOpacity>
              )}

              {/* Yeni: Çok günlük program */}
              {trip.itinerary && trip.itinerary.length > 1 && (
                <View style={styles.itineraryWrapper}>
                  <Text style={[styles.aboutTitle, { marginTop: 8 }]}>
                    Gün Gün Program
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.itineraryHorizontalList}
                  >
                    {trip.itinerary.map((dayItem, idx) => {
                      const dayHotel =
                        dayItem.hotel ||
                        (typeof dayItem.hotelIndex === "number" && trip.hotels
                          ? trip.hotels[dayItem.hotelIndex]
                          : undefined);
                      return (
                        <View
                          key={dayItem.day || idx}
                          style={[
                            styles.itineraryDayBlockHorizontal,
                            { width: itineraryCardWidth },
                          ]}
                        >
                          <Text style={styles.itineraryDayHeading}>
                            {`Gün ${dayItem.day}`}
                            {dayItem.title ? ` - ${dayItem.title}` : ""}
                          </Text>
                          {dayItem.dateLabel ? (
                            <Text style={styles.itineraryDaySub}>
                              {dayItem.dateLabel}
                            </Text>
                          ) : null}
                          <View style={styles.itineraryActivities}>
                            {dayItem.activities.map((act, aIdx) => (
                              <View
                                key={aIdx}
                                style={styles.itineraryActivityRow}
                              >
                                <View style={styles.itineraryActivityIcon}>
                                  <Ionicons
                                    name="time-outline"
                                    size={14}
                                    color="#FF7029"
                                  />
                                </View>
                                <View style={{ flex: 1 }}>
                                  <Text style={styles.itineraryActivityLabel}>
                                    {act.time ? `${act.time} - ` : ""}
                                    {act.label}
                                  </Text>
                                  {act.description ? (
                                    <Text style={styles.itineraryActivityDesc}>
                                      {act.description}
                                    </Text>
                                  ) : null}
                                </View>
                              </View>
                            ))}
                          </View>
                          {dayHotel && (
                            <View style={styles.dayHotelCard}>
                              <View style={styles.dayHotelHeaderRow}>
                                <Text style={styles.dayHotelTitle}>
                                  Konaklama
                                </Text>
                                {typeof dayHotel.stars === "number" && (
                                  <RatingStars
                                    value={dayHotel.stars || 0}
                                    size={14}
                                    color="#FFD336"
                                  />
                                )}
                              </View>
                              <Text style={styles.dayHotelName}>
                                {dayHotel.name}
                              </Text>
                              {dayHotel.address ? (
                                <View style={styles.dayHotelAddressRow}>
                                  <Ionicons
                                    name="location-outline"
                                    size={14}
                                    color="#FF7029"
                                    style={{ marginRight: 4 }}
                                  />
                                  <Text style={styles.dayHotelAddressText}>
                                    {dayHotel.address}
                                  </Text>
                                </View>
                              ) : null}
                              <View style={styles.dayHotelMetaRow}>
                                {dayHotel.checkIn ? (
                                  <Badge
                                    text={dayHotel.checkIn}
                                    variant="neutral"
                                    leftIcon={
                                      <Ionicons
                                        name="log-in-outline"
                                        size={12}
                                        color="#FF7029"
                                      />
                                    }
                                    containerStyle={styles.dayHotelMetaPill}
                                    textStyle={styles.dayHotelMetaPillText}
                                  />
                                ) : null}
                                {dayHotel.checkOut ? (
                                  <Badge
                                    text={dayHotel.checkOut}
                                    variant="neutral"
                                    leftIcon={
                                      <Ionicons
                                        name="log-out-outline"
                                        size={12}
                                        color="#FF7029"
                                      />
                                    }
                                    containerStyle={styles.dayHotelMetaPill}
                                    textStyle={styles.dayHotelMetaPillText}
                                  />
                                ) : null}
                              </View>
                            </View>
                          )}
                          {dayItem.note ? (
                            <Text style={styles.itineraryNote}>
                              {dayItem.note}
                            </Text>
                          ) : null}
                        </View>
                      );
                    })}
                  </ScrollView>
                </View>
              )}
            </View>
          )}
          {activeTab === "details" && (
            <View style={styles.aboutSection}>
              <Text style={styles.aboutTitle}>Tura Dahil Olanlar</Text>
              <Text style={styles.aboutText}>
                {(trip.details?.included || []).join("\n\n")}
              </Text>
              <Text style={[styles.aboutTitle, { marginTop: 16 }]}>
                Tura Dahil Olmayanlar
              </Text>
              <Text style={styles.aboutText}>
                {(trip.details?.excluded || []).join("\n\n")}
              </Text>
              {trip.details?.specialNote ? (
                <>
                  <Text style={[styles.aboutTitle, { marginTop: 16 }]}>
                    Özel Açıklama
                  </Text>
                  <Text style={styles.aboutText}>
                    {trip.details?.specialNote}
                  </Text>
                </>
              ) : null}
            </View>
          )}
          {activeTab === "policy" && (
            <View style={styles.aboutSection}>
              <Text style={styles.aboutTitle}>
                {trip.policy?.title || "İptal ve Değişim Politikası"}
              </Text>
              <Text style={styles.aboutText}>
                {(trip.policy?.paragraphs || []).join("\n\n")}
              </Text>
            </View>
          )}
          {activeTab === "hotel" && trip.hotels && trip.hotels.length > 0 && (
            <View style={styles.aboutSection}>
              <Text style={styles.aboutTitle}>Otel Bilgisi</Text>
              <View>
                {trip.hotels.map((h, hi) => {
                  const dayNumbers = hotelDayMap[hi] || [];
                  return (
                    <View key={hi} style={styles.multiHotelBlock}>
                      <View style={styles.multiHotelHeaderRow}>
                        <Text style={styles.multiHotelName}>{h.name}</Text>
                        {typeof h.stars === "number" && (
                          <RatingStars
                            value={h.stars || 0}
                            size={14}
                            color="#FFD336"
                          />
                        )}
                      </View>
                      {dayNumbers.length > 0 && (
                        <View style={styles.multiHotelDaysRow}>
                          {dayNumbers.map((dn) => (
                            <Badge
                              key={dn}
                              text={`Gün ${dn}`}
                              variant="orange"
                              containerStyle={styles.multiHotelDayBadge}
                              textStyle={styles.multiHotelDayBadgeText}
                            />
                          ))}
                        </View>
                      )}
                      {h.address ? (
                        <View style={styles.multiHotelAddressRow}>
                          <Ionicons
                            name="location-outline"
                            size={14}
                            color="#FF7029"
                            style={{ marginRight: 4 }}
                          />
                          <Text style={styles.multiHotelAddressText}>
                            {h.address}
                          </Text>
                        </View>
                      ) : null}
                      <View style={styles.multiHotelMetaRow}>
                        {h.checkIn ? (
                          <Badge
                            text={h.checkIn}
                            variant="neutral"
                            leftIcon={
                              <Ionicons
                                name="log-in-outline"
                                size={12}
                                color="#FF7029"
                              />
                            }
                            containerStyle={styles.multiHotelMetaPill}
                            textStyle={styles.multiHotelMetaPillText}
                          />
                        ) : null}
                        {h.checkOut ? (
                          <Badge
                            text={h.checkOut}
                            variant="neutral"
                            leftIcon={
                              <Ionicons
                                name="log-out-outline"
                                size={12}
                                color="#FF7029"
                              />
                            }
                            containerStyle={styles.multiHotelMetaPill}
                            textStyle={styles.multiHotelMetaPillText}
                          />
                        ) : null}
                      </View>
                      {h.amenities && h.amenities.length > 0 && (
                        <View style={styles.multiHotelAmenitiesWrap}>
                          {h.amenities.map((a, ai) => (
                            <Badge
                              key={ai}
                              text={a}
                              variant="neutral"
                              leftIcon={
                                <Ionicons
                                  name="checkmark-circle"
                                  size={14}
                                  color="#FF7029"
                                />
                              }
                              containerStyle={styles.multiHotelAmenityItem}
                              textStyle={styles.multiHotelAmenityText}
                            />
                          ))}
                        </View>
                      )}
                      {h.description ? (
                        <Text style={styles.multiHotelDesc}>
                          {h.description}
                        </Text>
                      ) : null}
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Aksiyon Butonları */}
          {!isPurchased && (
            <View style={styles.actionButtons}>
              <Button
                title="Rotayı İncele"
                onPress={handleRouteView}
                style={styles.routeButton}
              />
              <Button
                title="Rezervasyon Yap"
                onPress={handleReservation}
                variant="primary"
                style={styles.reservationButtonSmall}
              />
            </View>
          )}
          {isPurchased && (
            <View style={styles.purchasedActionsWrapper}>
              <View style={styles.purchasedTopRow}>
                <Button
                  title="Rota"
                  onPress={handleRouteView}
                  style={styles.routeButton}
                />
                <Button
                  title="Rezervasyon Yap"
                  onPress={handleReservation}
                  variant="primary"
                  style={styles.reservationButtonSmall}
                />
              </View>
              <View style={styles.purchasedSecondaryRow}>
                <TouchableOpacity
                  style={styles.purchasedSecondaryBtn}
                  onPress={onShowTicket}
                >
                  <Ionicons
                    name="receipt-outline"
                    size={18}
                    color="#1B1E28"
                    style={{ marginBottom: 4 }}
                  />
                  <Text style={styles.purchasedSecondaryBtnText}>Biletim</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.purchasedSecondaryBtn}
                  onPress={onShowQRCode}
                >
                  <Ionicons
                    name="qr-code-outline"
                    size={18}
                    color="#1B1E28"
                    style={{ marginBottom: 4 }}
                  />
                  <Text style={styles.purchasedSecondaryBtnText}>QR Kod</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.purchasedSecondaryBtn}
                  onPress={onDownloadPDF}
                >
                  <Ionicons
                    name="document-text-outline"
                    size={18}
                    color="#1B1E28"
                    style={{ marginBottom: 4 }}
                  />
                  <Text style={styles.purchasedSecondaryBtnText}>
                    Tur Detayları
                  </Text>
                </TouchableOpacity>
                {tripHasEnded && (
                  <TouchableOpacity
                    style={styles.purchasedSecondaryBtn}
                    onPress={onRateTrip}
                  >
                    <Ionicons
                      name="star-outline"
                      size={18}
                      color="#1B1E28"
                      style={{ marginBottom: 4 }}
                    />
                    <Text style={styles.purchasedSecondaryBtnText}>
                      Değerlendir
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
      <PriceInfoModal
        visible={showPriceInfo}
        onClose={() => setShowPriceInfo(false)}
        tripTitle={trip.title}
        pricing={trip.pricing}
      />
      <ImageViewerModal
        visible={showImageViewer}
        images={gallery as any}
        initialIndex={imageViewerIndex}
        onClose={() => setShowImageViewer(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollView: {
    flex: 1,
  },
  headerImage: {
    height: 300,
    width: "100%",
  },
  headerTopRow: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  headerIconBlur: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  headerGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 160,
  },
  contentCard: {
    backgroundColor: "white",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -24,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 56,
    minHeight: 600,
  },
  handleBar: {
    alignSelf: "center",
    width: 36,
    height: 5,
    borderRadius: 16,
    backgroundColor: "#7D848D",
    opacity: 0.2,
    marginBottom: 10,
  },
  titleSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
  },
  tripTitle: {
    fontSize: 24,
    fontWeight: "500",
    color: "#1B1E28",
    marginBottom: 4,
  },
  tripLocation: {
    fontSize: 15,
    color: "#7D848D",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginLeft: 16,
    overflow: "hidden",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  cityPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cityPillText: {
    fontSize: 15,
    color: "#7D848D",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingValue: {
    fontSize: 15,
    color: "#1B1E28",
    marginRight: 6,
  },
  ratingCount: {
    fontSize: 15,
    color: "#7D848D",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  priceLabel: {
    fontSize: 15,
    color: "#7D848D",
  },
  thumbsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
  },
  thumb: {
    width: 42,
    height: 42,
    borderRadius: 12,
    marginRight: 26,
  },
  thumbOverlayContainer: {
    position: "relative",
    overflow: "hidden",
  },
  thumbOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  thumbOverlayText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "400",
  },
  aboutSection: {
    marginBottom: 24,
  },
  aboutTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1B1E28",
    marginBottom: 8,
  },
  aboutText: {
    fontSize: 13,
    color: "#7D848D",
    lineHeight: 22,
  },
  readMoreText: {
    color: "#FF7029",
    fontWeight: "600",
    fontSize: 15,
  },
  showLessContainer: {
    marginTop: 10,
    alignSelf: "flex-start",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  routeButton: {
    width: 135,
    height: 56,
    backgroundColor: "#24BAEC",
    borderRadius: 16,
  },

  reservationButtonSmall: {
    backgroundColor: "#FF7029",
    borderRadius: 16,
    height: 56,
    paddingHorizontal: 18,
    marginHorizontal: 8,
  },
  purchasedActionsWrapper: { marginTop: 8 },
  purchasedTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  purchasedSecondaryRow: {
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "space-between",
  },
  purchasedSecondaryBtn: {
    flex: 1,
    backgroundColor: "#fbf9f4ff",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    height: 90,
    marginRight: 12,
    paddingHorizontal: 8,
  },
  purchasedSecondaryBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1B1E28",
  },
  purchasedSecondaryBtnLast: { marginRight: 0 },
  itineraryWrapper: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
    paddingTop: 8,
  },
  itineraryDayBlock: {
    backgroundColor: "#fbf9f4ff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(36,186,236,0.12)",
  },
  itineraryHorizontalList: {
    paddingVertical: 4,
    paddingLeft: 2,
    paddingRight: 4,
  },
  itineraryDayBlockHorizontal: {
    backgroundColor: "#fbf9f4ff",
    borderRadius: 16,
    padding: 14,
    marginRight: 14,
    borderWidth: 1,
    borderColor: "rgba(36,186,236,0.12)",
    flexShrink: 0,
  },
  itineraryDayHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  itineraryDayBadge: {
    backgroundColor: "#FF7029",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 12,
  },
  itineraryDayBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  itineraryDayTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1B1E28",
  },
  itineraryDayDate: {
    fontSize: 12,
    color: "#7D848D",
    marginTop: 2,
  },
  itineraryActivities: {
    marginTop: 4,
  },
  itineraryActivityRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  itineraryActivityIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fbf9f4ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  itineraryActivityLabel: {
    fontSize: 13,
    color: "#1B1E28",
    fontWeight: "500",
    flexWrap: "wrap",
  },
  itineraryActivityDesc: {
    fontSize: 12,
    color: "#7D848D",
    lineHeight: 18,
    marginTop: 2,
  },
  itineraryNote: {
    fontSize: 12,
    color: "#FF7029",
    marginTop: 4,
    fontStyle: "italic",
  },
  hotelImageWrapper: {
    position: "relative",
    width: "100%",
    height: 200,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 16,
  },

  hotelBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.55)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
  },

  hotelActionBtnText: { fontSize: 12, color: "#1B1E28", fontWeight: "500" },
  dayHotelCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(36,186,236,0.15)",
    padding: 10,
    borderRadius: 14,
    marginTop: 10,
  },
  dayHotelHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dayHotelTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FF7029",
    letterSpacing: 0.5,
  },
  dayHotelName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1B1E28",
    marginTop: 4,
  },
  dayHotelAddressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  dayHotelAddressText: { fontSize: 11, color: "#7D848D", flex: 1 },
  dayHotelMetaRow: { flexDirection: "row", marginTop: 6 },
  dayHotelMetaPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fbf9f4ff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginRight: 8,
  },
  dayHotelMetaPillText: {
    fontSize: 10,
    color: "#FF7029",
    fontWeight: "600",
    marginLeft: 4,
  },
  multiHotelBlock: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    padding: 14,
    borderRadius: 16,
    marginBottom: 16,
  },
  multiHotelHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  multiHotelName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1B1E28",
    flex: 1,
    marginRight: 8,
  },
  multiHotelAddressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  multiHotelAddressText: { fontSize: 12, color: "#7D848D", flex: 1 },
  multiHotelMetaRow: { flexDirection: "row", marginTop: 8 },
  multiHotelMetaPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 10,
  },
  multiHotelMetaPillText: {
    fontSize: 11,
    color: "#FF7029",
    fontWeight: "600",
    marginLeft: 4,
  },
  multiHotelAmenitiesWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  multiHotelAmenityItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fbf9f4f",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  multiHotelAmenityText: { fontSize: 11, color: "#1B1E28", fontWeight: "500" },
  multiHotelDesc: {
    fontSize: 12,
    color: "#7D848D",
    marginTop: 8,
    lineHeight: 18,
  },
  multiHotelDaysRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 6,
    marginBottom: 2,
  },
  multiHotelDayBadge: {
    backgroundColor: "#FF7029",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 6,
  },
  multiHotelDayBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  itineraryDayHeading: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1B1E28",
    marginBottom: 4,
    flexWrap: "wrap",
    width: "100%",
  },
  itineraryDaySub: { fontSize: 12, color: "#7D848D", marginBottom: 10 },
});
