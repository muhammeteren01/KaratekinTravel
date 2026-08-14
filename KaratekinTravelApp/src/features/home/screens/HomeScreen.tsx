// moved from src/screens/HomeScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import {
  AllTripsScreen,
  TripDetailScreen,
  QRScreen,
  PastTripsScreen,
  PastTripDetailScreen,
  ReviewsScreen,
  CalendarScreen,
  ProgramDetailScreen,
  SavedTripsScreen,
  PastTripsRatingScreen,
  SearchScreen,
  BusInfoScreen,
} from "@/features/trips/screens";
import {
  ChatsScreen,
  ChatDetailScreen,
  NotificationsScreen,
} from "@/features/users/screens";
import ProfileScreen from "@/features/users/screens/ProfileScreen";
import ProfileEditScreen from "@/features/users/screens/ProfileEditScreen";
import SecurityScreen from "@/features/users/screens/SecurityScreen";
import AboutScreen from "@/features/users/screens/AboutScreen";
import {
  CompanyDetailScreen,
  CompanyContactScreen,
} from "@/features/companies/screens";
import { useCompanies } from "@/core/data/store";
import {
  useTrips,
  useSupportingData,
  usePastTrips,
} from "@/features/trips/hooks";
import { LoadingView, ErrorView } from "@/shared/ui";
import { mapTripsSchemaToUi } from "@/core/data/adapters";
import { Trip } from "@/types/trip";
import {
  useSavedTripsState,
  usePurchasedTripsState,
} from "@/context/UserState";
import { TripListCard } from "@/shared/ui";
import { FeaturedTripCard } from "@/features/trips/components";
import { theme } from "@/shared/theme";
import { SectionHeader } from "@/shared/ui";
import { BottomTabBar } from "@/shared/ui";
import { userAvatarSource } from "@/utils/avatar";
import { useAuth } from "@/context/AuthContext";
import {
  navigateToHomeStack,
  navigateToTab,
  isNavReady,
} from "@/navigation/RootNavigation";

interface ChatItem {
  id: string;
  groupName: string;
  lastMessage: string;
  time: string;
  isActive: boolean;
  avatar: string;
}

interface HomeScreenProps {
  onLogout?: () => void;
}

export default function HomeScreen({ onLogout }: HomeScreenProps) {
  const { currentUser } = useAuth();
  const companiesQ = useCompanies();
  const tripsQ = useTrips();
  const supportingQ = useSupportingData();
  const pastTripsQ = usePastTrips();
  // Compute loading/error flags but defer return until after all hooks are declared
  const isLoading =
    companiesQ.isLoading ||
    tripsQ.isLoading ||
    supportingQ.isLoading ||
    pastTripsQ.isLoading;
  const isError =
    companiesQ.isError ||
    tripsQ.isError ||
    supportingQ.isError ||
    pastTripsQ.isError;
  const companies = companiesQ.data || [];
  const tripsRaw = tripsQ.data || [];
  const allTripsData: Trip[] = mapTripsSchemaToUi(tripsRaw);
  const supporting = supportingQ.data;
  const pastTrips = pastTripsQ.data || [];
  const [showAllTrips, setShowAllTrips] = useState(false);
  const [showPastTrips, setShowPastTrips] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("home");
  const [showProgramDetail, setShowProgramDetail] = useState(false);
  const [showPastTripDetail, setShowPastTripDetail] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [selectedProgramTrip, setSelectedProgramTrip] = useState<any>(null);
  const [selectedChat, setSelectedChat] = useState<ChatItem | null>(null);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showSavedTrips, setShowSavedTrips] = useState(false);
  const { savedIds, isSaved, toggle: toggleSaved } = useSavedTripsState();
  const [navigationContext, setNavigationContext] = useState<string>("home");
  const [showPastTripsRating, setShowPastTripsRating] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(
    null,
  );
  const [showCompanyContact, setShowCompanyContact] = useState(false);
  const [showBusInfo, setShowBusInfo] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const { purchasedIds, isPurchased } = usePurchasedTripsState();

  // Phase-1 toggle to switch between legacy conditionals and navigation-driven rendering
  const [useNewNav, setUseNewNav] = useState(false);

  // ------------- Silent navigation hooks (shadow integration) -------------
  useEffect(() => {
    if (!isNavReady()) return;
    if (!useNewNav) return; // keep visuals identical until toggled
    if (showAllTrips) navigateToHomeStack("AllTrips");
  }, [showAllTrips, useNewNav]);

  useEffect(() => {
    if (!isNavReady()) return;
    if (!useNewNav) return;
    if (showPastTrips) navigateToHomeStack("PastTrips");
  }, [showPastTrips, useNewNav]);

  useEffect(() => {
    if (!isNavReady()) return;
    if (!useNewNav) return;
    if (selectedTrip) navigateToHomeStack("TripDetail", { trip: selectedTrip });
  }, [selectedTrip, useNewNav]);

  useEffect(() => {
    if (!isNavReady()) return;
    if (!useNewNav) return;
    if (showProgramDetail && selectedProgramTrip)
      navigateToHomeStack("ProgramDetail", { tripData: selectedProgramTrip });
  }, [showProgramDetail, selectedProgramTrip, useNewNav]);

  useEffect(() => {
    if (!isNavReady()) return;
    if (!useNewNav) return;
    if (showPastTripDetail && selectedProgramTrip)
      navigateToHomeStack("PastTripDetail", { tripData: selectedProgramTrip });
  }, [showPastTripDetail, selectedProgramTrip, useNewNav]);

  useEffect(() => {
    if (!isNavReady()) return;
    if (!useNewNav) return;
    if (showReviews && selectedProgramTrip)
      navigateToHomeStack("Reviews", { tripData: selectedProgramTrip });
  }, [showReviews, selectedProgramTrip, useNewNav]);

  useEffect(() => {
    if (!isNavReady()) return;
    if (!useNewNav) return;
    if (showSavedTrips) navigateToHomeStack("SavedTrips");
  }, [showSavedTrips, useNewNav]);

  useEffect(() => {
    if (!isNavReady()) return;
    if (!useNewNav) return;
    if (showPastTripsRating) navigateToHomeStack("PastTripsRating");
  }, [showPastTripsRating, useNewNav]);

  useEffect(() => {
    if (!isNavReady()) return;
    if (!useNewNav) return;
    if (showNotifications) navigateToHomeStack("Notifications");
  }, [showNotifications, useNewNav]);

  useEffect(() => {
    if (!isNavReady()) return;
    if (!useNewNav) return;
    if (showCompanyContact)
      navigateToHomeStack("CompanyContact", {
        companyName:
          (selectedCompanyId &&
            (companies.find((c) => String(c.id) === String(selectedCompanyId))
              ?.name ||
              "Kamil Koç")) ||
          "Kamil Koç",
      });
  }, [showCompanyContact, selectedCompanyId, companies, useNewNav]);

  useEffect(() => {
    if (!isNavReady()) return;
    if (!useNewNav) return;
    if (showBusInfo)
      navigateToHomeStack("BusInfo", {
        companyName:
          (selectedCompanyId &&
            (companies.find((c) => String(c.id) === String(selectedCompanyId))
              ?.name ||
              "Kamil Koç")) ||
          "Kamil Koç",
      });
  }, [showBusInfo, selectedCompanyId, companies, useNewNav]);

  useEffect(() => {
    if (!isNavReady()) return;
    if (!useNewNav) return;
    if (selectedCompanyId)
      navigateToHomeStack("CompanyDetail", { companyId: selectedCompanyId });
  }, [selectedCompanyId, useNewNav]);

  useEffect(() => {
    if (!isNavReady()) return;
    if (!useNewNav) return;
    if (showQR) navigateToHomeStack("QR");
  }, [showQR, useNewNav]);

  // Map legacy tab changes to new tabs when enabled
  useEffect(() => {
    if (!isNavReady()) return;
    if (!useNewNav) return;
    if (activeTab === "home") navigateToTab("HomeStack");
    if (activeTab === "calendar") navigateToTab("Calendar");
    if (activeTab === "messages") navigateToTab("Messages");
    if (activeTab === "profile") navigateToTab("Profile");
    if (activeTab === "search") navigateToHomeStack("Search");
  }, [activeTab, useNewNav]);

  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
    setNavigationContext("home");
    // Reset other states when changing tabs
    setShowAllTrips(false);
    setShowPastTrips(false);
    setSelectedTrip(null);
    setShowProgramDetail(false);
    setShowPastTripDetail(false);
    setShowReviews(false);
    setSelectedProgramTrip(null);
    setShowProfileEdit(false);
    setShowSavedTrips(false);
    setShowPastTripsRating(false);
    setShowSecurity(false);
    setShowAbout(false);
    setShowNotifications(false);
    setSelectedCompanyId(null);
    setShowCompanyContact(false);
    setShowBusInfo(false);
  };

  const handleShowAllTrips = () => {
    setShowAllTrips(true);
  };

  const handleShowSearch = () => {
    setActiveTab("search");
  };

  const handleBackFromSearch = () => {
    setActiveTab("home");
  };

  const handleBackFromAllTrips = () => {
    setShowAllTrips(false);
  };

  const handleShowPastTrips = () => {
    setShowPastTrips(true);
  };

  const handleBackFromPastTrips = () => {
    setShowPastTrips(false);
  };

  const handleTripPress = (trip: any) => {
    setSelectedTrip(trip);
    setNavigationContext("home");
  };

  const handlePastTripPress = (trip: any) => {
    setSelectedProgramTrip(trip);
    setShowPastTrips(false);
    setShowPastTripDetail(true);
  };

  // Open PastTripDetail from Home section
  const handlePastTripPressFromHome = (trip: any) => {
    setSelectedProgramTrip(trip);
    setNavigationContext("home");
    setShowPastTripDetail(true);
  };

  // Open PastTripDetail from PastTripsScreen list
  const handlePastTripPressFromList = (trip: any) => {
    setSelectedProgramTrip(trip);
    setNavigationContext("pastTrips");
    setShowPastTrips(false);
    setShowPastTripDetail(true);
  };

  const handleShowAllReviews = (tripData: any) => {
    setSelectedProgramTrip(tripData);
    setShowPastTripDetail(false);
    setShowReviews(true);
  };

  const handleBackFromReviews = () => {
    setShowReviews(false);
    setShowPastTripDetail(true);
  };

  const handleBackFromTripDetail = () => {
    setSelectedTrip(null);
    if (navigationContext === "savedTrips") {
      setShowSavedTrips(true);
    } else if (navigationContext === "companyDetail") {
      setSelectedCompanyId(selectedCompanyId);
    }
  };

  const handleHomeFromTripDetail = () => {
    setSelectedTrip(null);
  };

  const handleBackToHome = () => {
    setActiveTab("home");
    setShowAllTrips(false);
    setShowPastTrips(false);
    setSelectedTrip(null);
    setShowProgramDetail(false);
    setShowPastTripDetail(false);
    setShowReviews(false);
    setSelectedProgramTrip(null);
    setShowProfileEdit(false);
    setShowSavedTrips(false);
    setShowPastTripsRating(false);
    setShowSecurity(false);
    setShowAbout(false);
    setShowNotifications(false);
    setSelectedCompanyId(null);
    setShowCompanyContact(false);
    setShowBusInfo(false);
  };

  const handleShowProgramDetail = (tripData: any) => {
    setSelectedProgramTrip(tripData);
    setShowProgramDetail(true);
  };

  const handleBackFromProgramDetail = () => {
    setShowProgramDetail(false);
    setSelectedProgramTrip(null);
  };

  const handleBackFromPastTripDetail = () => {
    setShowPastTripDetail(false);
    setSelectedProgramTrip(null);
    if (navigationContext === "companyDetail") {
      // Return to company detail screen
      setSelectedCompanyId(selectedCompanyId);
    } else if (navigationContext === "pastTrips") {
      // Return to PastTrips list only if opened from there
      setShowPastTrips(true);
    } else {
      // Opened from Home or elsewhere: stay on Home
      // no-op
    }
  };

  const handleBackFromChatDetail = () => {
    setSelectedChat(null);
  };

  const handleChatPress = (chat: ChatItem) => {
    setSelectedChat(chat);
  };

  const handleNavigateToProfileEdit = () => {
    setShowProfileEdit(true);
  };

  const handleBackFromProfileEdit = () => {
    setShowProfileEdit(false);
  };

  const handleNavigateToSavedTrips = () => {
    setShowSavedTrips(true);
  };

  const handleBackFromSavedTrips = () => {
    setShowSavedTrips(false);
  };

  const handleTripPressFromSaved = (trip: any) => {
    setSelectedTrip(trip);
    setNavigationContext("savedTrips");
    setShowSavedTrips(false);
  };

  const handleBookmarkTrip = (trip: any) => {
    toggleSaved(trip.id);
  };

  const isTripSaved = (tripId: number) => isSaved(tripId);

  const handleNavigateToPastTripsRating = () => {
    setShowPastTripsRating(true);
  };

  const handleBackFromPastTripsRating = () => {
    setShowPastTripsRating(false);
  };

  const handleNavigateToSecurity = () => {
    setShowSecurity(true);
  };

  const handleBackFromSecurity = () => {
    setShowSecurity(false);
  };

  const handleNavigateToAbout = () => {
    setShowAbout(true);
  };

  const handleBackFromAbout = () => {
    setShowAbout(false);
  };

  const handleNavigateToNotifications = () => {
    setShowNotifications(true);
  };

  const handleBackFromNotifications = () => {
    setShowNotifications(false);
  };

  const handleBackFromCompanyDetail = () => {
    setSelectedCompanyId(null);
    setShowCompanyContact(false);
  };

  const handleShowCompanyContact = () => {
    setShowCompanyContact(true);
  };

  const handleBackFromCompanyContact = () => {
    setShowCompanyContact(false);
  };

  const handleShowBusInfo = () => {
    setShowBusInfo(true);
  };

  const handleBackFromBusInfo = () => {
    setShowBusInfo(false);
  };

  const handleTripPressFromCompany = (
    tripId: number | string,
    isPast: boolean,
  ) => {
    if (isPast) {
      // Geçmiş gezi için PastTripDetailScreen'e yönlendir
      const past =
        pastTrips.find((p) => String(p.id) === String(tripId)) ||
        ({ id: tripId, title: "", location: "", date: "" } as any);
      setNavigationContext("companyDetail");
      setSelectedProgramTrip(past);
      setShowPastTripDetail(true);
    } else {
      // Güncel gezi için TripDetailScreen'e yönlendir
      const trip =
        allTripsData.find((t) => String(t.id) === String(tripId)) ||
        ({ id: tripId, title: "", location: "" } as any);
      setNavigationContext("companyDetail");
      setSelectedTrip(trip);
    }
  };

  const handleLogout = () => {
    // Reset all states and go back to login/welcome screen
    setActiveTab("home");
    setShowAllTrips(false);
    setShowPastTrips(false);
    setSelectedTrip(null);
    setShowProgramDetail(false);
    setShowPastTripDetail(false);
    setShowReviews(false);
    setSelectedProgramTrip(null);
    setShowProfileEdit(false);
    setShowSavedTrips(false);
    setShowPastTripsRating(false);
    setShowSecurity(false);
    setShowAbout(false);
    setShowNotifications(false);
    setNavigationContext("home");

    // Call the logout handler from App.tsx
    if (onLogout) {
      onLogout();
    } else {
      Alert.alert("Başarılı", "Hesabınızdan başarıyla çıkış yapıldı.");
    }
  };

  // Guarded early-returns placed AFTER all hooks to keep hook order consistent
  if (isLoading) {
    return <LoadingView />;
  }
  if (isError) {
    return (
      <ErrorView
        onRetry={() => {
          if (companiesQ.isError) companiesQ.refetch();
          if (tripsQ.isError) tripsQ.refetch();
          if (supportingQ.isError) supportingQ.refetch();
          if (pastTripsQ.isError) pastTripsQ.refetch();
        }}
      />
    );
  }

  // Handle sub-screens that should hide navbar
  if (!useNewNav && showAllTrips) {
    return <AllTripsScreen onBack={handleBackFromAllTrips} />;
  }

  if (!useNewNav && showPastTrips) {
    return (
      <PastTripsScreen
        onBack={handleBackFromPastTrips}
        onTripPress={handlePastTripPressFromList}
      />
    );
  }

  // QR screen (for purchased trips)
  if (!useNewNav && showQR) {
    return (
      <QRScreen
        onBack={() => setShowQR(false)}
        onHome={handleHomeFromTripDetail}
      />
    );
  }

  if (!useNewNav && selectedTrip) {
    return (
      <TripDetailScreen
        onBack={handleBackFromTripDetail}
        onHome={handleHomeFromTripDetail}
        tripData={selectedTrip}
        onBookmarkTrip={handleBookmarkTrip}
        isTripSaved={isTripSaved(selectedTrip.id)}
        isPurchased={isPurchased(selectedTrip.id)}
        onShowQRCode={() => setShowQR(true)}
      />
    );
  }

  // ProgramDetailScreen - navbar'sız
  if (!useNewNav && showProgramDetail) {
    return (
      <ProgramDetailScreen
        onBack={handleBackFromProgramDetail}
        tripData={selectedProgramTrip}
      />
    );
  }

  if (!useNewNav && showPastTripDetail) {
    return (
      <PastTripDetailScreen
        onBack={handleBackFromPastTripDetail}
        tripData={selectedProgramTrip}
        onShowAllReviews={handleShowAllReviews}
      />
    );
  }

  if (!useNewNav && showReviews) {
    return (
      <ReviewsScreen
        onBack={handleBackFromReviews}
        tripData={selectedProgramTrip}
      />
    );
  }

  // ChatDetailScreen - navbar'sız
  if (!useNewNav && selectedChat) {
    return (
      <ChatDetailScreen
        onBack={handleBackFromChatDetail}
        chatData={{
          id: selectedChat.id,
          groupName: selectedChat.groupName,
          isActive: selectedChat.isActive,
          memberCount: 50,
        }}
      />
    );
  }

  // ProfileEditScreen - navbar'sız
  if (!useNewNav && showProfileEdit) {
    return <ProfileEditScreen onBack={handleBackFromProfileEdit} />;
  }

  // SavedTripsScreen - navbar'sız
  if (!useNewNav && showSavedTrips) {
    return (
      <SavedTripsScreen
        onBack={handleBackFromSavedTrips}
        savedTrips={allTripsData
          .filter((t) => savedIds.includes(String(t.id)))
          .map((t) => ({
            id: t.id,
            title: t.title,
            location: t.location,
            rating: t.rating,
            price: t.price,
            image: (t.image as any)?.uri || undefined,
          }))}
        onBookmarkTrip={handleBookmarkTrip}
        onTripPress={handleTripPressFromSaved}
      />
    );
  }

  // PastTripsRatingScreen - navbar'sız
  if (!useNewNav && showPastTripsRating) {
    return <PastTripsRatingScreen onBack={handleBackFromPastTripsRating} />;
  }

  // SecurityScreen - navbar'sız
  if (!useNewNav && showSecurity) {
    return <SecurityScreen onBack={handleBackFromSecurity} />;
  }

  // AboutScreen - navbar'sız
  if (!useNewNav && showAbout) {
    return <AboutScreen onBack={handleBackFromAbout} />;
  }

  // NotificationsScreen - navbar'sız
  if (!useNewNav && showNotifications) {
    return <NotificationsScreen onBack={handleBackFromNotifications} />;
  }

  // CompanyContactScreen - navbar'sız
  if (!useNewNav && showCompanyContact) {
    return (
      <CompanyContactScreen
        onBack={handleBackFromCompanyContact}
        companyName={
          (selectedCompanyId &&
            (companies.find((c) => String(c.id) === String(selectedCompanyId))
              ?.name ||
              "Kamil Koç")) ||
          "Kamil Koç"
        }
      />
    );
  }

  // BusInfoScreen - navbar'sız
  if (!useNewNav && showBusInfo) {
    return (
      <BusInfoScreen
        onBack={handleBackFromBusInfo}
        companyName={
          (selectedCompanyId &&
            (companies.find((c) => String(c.id) === String(selectedCompanyId))
              ?.name ||
              "Kamil Koç")) ||
          "Kamil Koç"
        }
      />
    );
  }

  // CompanyDetailScreen - navbar'sız
  if (!useNewNav && selectedCompanyId) {
    return (
      <CompanyDetailScreen
        onBack={handleBackFromCompanyDetail}
        companyId={selectedCompanyId}
        onTripPress={handleTripPressFromCompany}
        onBookmarkTrip={handleBookmarkTrip}
        isTripSaved={isTripSaved}
        onContactPress={handleShowCompanyContact}
        onBusInfoPress={handleShowBusInfo}
        onTabPress={(tab: string) => {
          // When user taps bottom navbar in company page, route to main tabs
          setSelectedCompanyId(null);
          setShowCompanyContact(false);
          setShowBusInfo(false);
          setActiveTab(tab);
        }}
      />
    );
  }

  const renderMainContent = () => {
    if (activeTab === "calendar") {
      return (
        <View style={styles.tabContent}>
          <CalendarScreen
            onBack={handleBackToHome}
            onShowProgramDetail={handleShowProgramDetail}
            onBookmarkTrip={handleBookmarkTrip}
            isTripSaved={isTripSaved}
            onOpenNotifications={handleNavigateToNotifications}
          />
        </View>
      );
    }

    if (activeTab === "search") {
      return (
        <View style={styles.tabContent}>
          <SearchScreen
            onBack={handleBackToHome}
            onTripPress={(tripId) => {
              const trip =
                allTripsData.find((t) => Number(t.id) === tripId) ||
                ({ id: tripId, title: "" } as any);
              handleTripPress(trip);
            }}
            onCompanyPress={(companyId) => {
              setSelectedCompanyId(companyId);
            }}
          />
        </View>
      );
    }

    if (activeTab === "messages") {
      return (
        <View style={styles.tabContent}>
          <ChatsScreen
            onBack={handleBackToHome}
            onChatPress={handleChatPress}
          />
        </View>
      );
    }

    if (activeTab === "profile") {
      return (
        <View style={styles.tabContent}>
          <ProfileScreen
            onBack={handleBackToHome}
            onNavigateToProfileEdit={handleNavigateToProfileEdit}
            onNavigateToSavedTrips={handleNavigateToSavedTrips}
            onNavigateToPastTripsRating={handleNavigateToPastTripsRating}
            onNavigateToSecurity={handleNavigateToSecurity}
            onNavigateToAbout={handleNavigateToAbout}
            onLogout={handleLogout}
          />
        </View>
      );
    }

    // Default home content
    return renderHomeContent();
  };

  const renderHomeContent = () => {
    const currentTrips: Trip[] = allTripsData;
    const featuredTrips: Trip[] = (() => {
      const ids = supporting?.featuredTripIds || [];
      if (ids.length) {
        return currentTrips.filter((t) => ids.includes(String(t.id)));
      }
      return currentTrips.slice(0, 5);
    })();

    return (
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Image
              source={userAvatarSource(currentUser?.avatar)}
              style={styles.avatar}
              resizeMode="cover"
            />
            <Text style={styles.userName}>Şakir</Text>
          </View>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Bildirimler"
            style={styles.notificationButton}
            onPress={handleNavigateToNotifications}
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

        {/* Öne Çıkan Geziler (yatay kartlar) */}
        <SectionHeader
          title={<Text style={styles.sectionTitle}>Öne Çıkan Geziler</Text>}
          rightNode={
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Tüm gezileri gör"
              onPress={handleShowAllTrips}
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
              bookmarked={isTripSaved(trip.id)}
              onToggleBookmark={() => handleBookmarkTrip(trip)}
              onPress={() => handleTripPress(trip)}
            />
          ))}
        </ScrollView>

        {/* Güncel Geziler (dikey liste) */}
        <SectionHeader
          title={<Text style={styles.sectionTitle}>Güncel Geziler</Text>}
          rightNode={
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Tüm gezileri gör"
              onPress={handleShowAllTrips}
            >
              <Text allowFontScaling style={styles.seeAllText}>
                Tümü
              </Text>
            </TouchableOpacity>
          }
          containerStyle={[styles.sectionHeader, { marginTop: -12 }]}
        />
        <View style={{ marginBottom: 24 }}>
          {currentTrips.slice(0, 3).map((trip) => (
            <TripListCard
              key={`list-${trip.id}`}
              image={trip.image}
              title={trip.title}
              dateText={trip.dateRange}
              city={trip.city}
              region={trip.region}
              priceText={trip.price}
              variant="simple"
              onPress={() => handleTripPress(trip)}
            />
          ))}
        </View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView
      style={styles.container}
      testID="home-screen-root"
      accessibilityLabel="Anasayfa"
      accessibilityRole="summary"
      edges={["top"]}
    >
      <StatusBar style="dark" backgroundColor="transparent" translucent />

      {renderMainContent()}

      <BottomTabBar
        active={activeTab as any}
        onPress={(tab) =>
          tab === "search" ? handleShowSearch() : handleTabPress(tab)
        }
        style={{ backgroundColor: "#FFFFFF" }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.palette.bgAlt,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 0,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    overflow: "hidden",
    backgroundColor: "#F0F0F0",
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  notificationButton: {
    padding: theme.spacing.sm,
  },
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
  horizontalScroll: {
    marginBottom: 40,
  },
  cardsContainer: {
    paddingLeft: theme.spacing.xxl,
    paddingRight: theme.spacing.xxl,
    paddingBottom: 15,
  },

  tabContent: {
    flex: 1,
  },
});
