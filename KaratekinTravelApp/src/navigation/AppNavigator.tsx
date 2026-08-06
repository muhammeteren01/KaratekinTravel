import React from "react";
import {
  NavigationContainer,
  getFocusedRouteNameFromRoute,
} from "@react-navigation/native";
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

// Feature screens
import HomeFeedScreen from "@/features/home/screens/HomeFeedScreen";
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
import { theme } from "@/shared/theme";
import { BottomTabBar } from "@/shared/ui";
import type { BottomTab } from "@/shared/ui/navigation/BottomTabBar";
import {
  useSavedTripsState,
  usePurchasedTripsState,
} from "@/context/UserState";
import { useTrips } from "@/features/trips/hooks";
import { mapTripsSchemaToUi } from "@/core/data/adapters";
import { navigationRef } from "@/navigation/RootNavigation";

export type HomeStackParamList = {
  HomeFeed: undefined;
  AllTrips: undefined;
  TripDetail: { trip: any };
  ProgramDetail: { tripData: any };
  PastTripDetail: { tripData: any };
  Reviews: { tripData: any };
  SavedTrips: undefined;
  PastTrips: undefined;
  PastTripsRating: undefined;
  Notifications: undefined;
  CompanyDetail: { companyId: string };
  CompanyContact: { companyName: string };
  BusInfo: { companyName: string };
  QR: undefined;
  Search: undefined;
  Chats: undefined;
  ChatDetail: {
    chat: {
      id: string;
      groupName: string;
      isActive: boolean;
      memberCount?: number;
    };
  };
};

export type TabsParamList = {
  HomeStack: undefined;
  Calendar: undefined;
  Messages: undefined;
  Profile: undefined;
};

const HomeStack = createNativeStackNavigator<HomeStackParamList>();
type CalendarStackParamList = {
  CalendarHome: undefined;
  QR: undefined;
};
const CalendarStack = createNativeStackNavigator<CalendarStackParamList>();
const Tabs = createBottomTabNavigator<TabsParamList>();

type AppNavigatorProps = { onLogout: () => void };

function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeFeed" component={HomeFeedScreen} />
      <HomeStack.Screen name="AllTrips" component={AllTripsWrapper} />
      <HomeStack.Screen name="TripDetail" component={TripDetailWrapper} />
      <HomeStack.Screen name="ProgramDetail" component={ProgramDetailWrapper} />
      <HomeStack.Screen
        name="PastTripDetail"
        component={PastTripDetailWrapper}
      />
      <HomeStack.Screen name="Reviews" component={ReviewsWrapper} />
      <HomeStack.Screen name="SavedTrips" component={SavedTripsWrapper} />
      <HomeStack.Screen name="PastTrips" component={PastTripsWrapper} />
      <HomeStack.Screen
        name="PastTripsRating"
        component={PastTripsRatingWrapper}
      />
      <HomeStack.Screen name="Notifications" component={NotificationsWrapper} />
      <HomeStack.Screen name="CompanyDetail" component={CompanyDetailWrapper} />
      <HomeStack.Screen
        name="CompanyContact"
        component={CompanyContactWrapper}
      />
      <HomeStack.Screen name="BusInfo" component={BusInfoWrapper} />
      <HomeStack.Screen name="QR" component={QRWrapper} />
      <HomeStack.Screen name="Search" component={SearchWrapper} />
      <HomeStack.Screen name="Chats" component={ChatsWrapper} />
      <HomeStack.Screen name="ChatDetail" component={ChatDetailWrapper} />
    </HomeStack.Navigator>
  );
}

function CalendarStackScreen() {
  return (
    <CalendarStack.Navigator screenOptions={{ headerShown: false }}>
      <CalendarStack.Screen
        name="CalendarHome"
        component={CalendarCalendarHomeWrapper}
      />
      <CalendarStack.Screen name="QR" component={QRWrapper} />
    </CalendarStack.Navigator>
  );
}

export default function AppNavigator({ onLogout }: AppNavigatorProps) {
  return (
    <NavigationContainer ref={navigationRef}>
      <Tabs.Navigator
        screenOptions={{ headerShown: false }}
        tabBar={({ state, navigation }) => {
          const routeName = state.routes[state.index]?.name;
          const active: BottomTab =
            routeName === "Calendar"
              ? "calendar"
              : routeName === "Messages"
                ? "messages"
                : routeName === "Profile"
                  ? "profile"
                  : "home";

          const onPress = (tab: BottomTab) => {
            if (tab === "search") {
              navigation.navigate("HomeStack", { screen: "Search" });
              return;
            }
            const map: Record<Exclude<BottomTab, "search">, keyof TabsParamList> =
              {
                home: "HomeStack",
                calendar: "Calendar",
                messages: "Messages",
                profile: "Profile",
              };
            navigation.navigate(map[tab]);
          };

          return <BottomTabBar active={active} onPress={onPress} />;
        }}
      >
        <Tabs.Screen
          name="HomeStack"
          component={HomeStackScreen}
          options={{ title: "Anasayfa" }}
        />
        <Tabs.Screen
          name="Calendar"
          component={CalendarStackScreen}
          options={{ title: "Takvim" }}
        />
        <Tabs.Screen
          name="Messages"
          component={MessagesRootWrapper}
          options={{ title: "Mesajlar" }}
        />
        <Tabs.Screen name="Profile" options={{ title: "Profil" }}>
          {() => <ProfileRootWrapper onLogout={onLogout} />}
        </Tabs.Screen>
      </Tabs.Navigator>
    </NavigationContainer>
  );
}

// ---------- Inline wrappers to adapt existing screen props to navigation ----------

function AllTripsWrapper({
  navigation,
}: NativeStackScreenProps<HomeStackParamList, "AllTrips">) {
  return <AllTripsScreen onBack={() => navigation.goBack()} />;
}

function PastTripsWrapper({
  navigation,
}: NativeStackScreenProps<HomeStackParamList, "PastTrips">) {
  return (
    <PastTripsScreen
      onBack={() => navigation.goBack()}
      onTripPress={(trip) =>
        navigation.navigate("PastTripDetail", { tripData: trip })
      }
    />
  );
}

function SavedTripsWrapper({
  navigation,
}: NativeStackScreenProps<HomeStackParamList, "SavedTrips">) {
  const { savedIds, toggle: toggleSaved } = useSavedTripsState();
  const tripsQ = useTrips();
  const trips = mapTripsSchemaToUi(tripsQ.data || []);
  const savedTrips = trips
    .filter((t) => savedIds.includes(String(t.id)))
    .map((t) => ({
      id: t.id as number,
      title: t.title,
      location: t.location,
      rating: t.rating,
      price: t.price,
      image: (t.image as any)?.uri || undefined,
    }));

  return (
    <SavedTripsScreen
      onBack={() => navigation.goBack()}
      savedTrips={savedTrips}
      onBookmarkTrip={(trip) => toggleSaved(trip.id)}
      onTripPress={(trip) =>
        navigation.navigate("TripDetail", {
          trip: { id: trip.id, title: trip.title },
        })
      }
    />
  );
}

function TripDetailWrapper({
  navigation,
  route,
}: NativeStackScreenProps<HomeStackParamList, "TripDetail">) {
  const { trip } = route.params;
  const { toggle: toggleSaved, isSaved } = useSavedTripsState();
  const { isPurchased } = usePurchasedTripsState();
  return (
    <TripDetailScreen
      onBack={() => navigation.goBack()}
      onHome={() => navigation.popToTop()}
      tripData={trip}
      onBookmarkTrip={() => toggleSaved(trip.id)}
      isTripSaved={isSaved(trip.id)}
      isPurchased={isPurchased(trip.id)}
      onShowQRCode={() => navigation.navigate("QR")}
    />
  );
}

function ProgramDetailWrapper({
  navigation,
  route,
}: NativeStackScreenProps<HomeStackParamList, "ProgramDetail">) {
  return (
    <ProgramDetailScreen
      onBack={() => navigation.goBack()}
      tripData={route.params.tripData}
    />
  );
}

function PastTripDetailWrapper({
  navigation,
  route,
}: NativeStackScreenProps<HomeStackParamList, "PastTripDetail">) {
  return (
    <PastTripDetailScreen
      onBack={() => navigation.goBack()}
      tripData={route.params.tripData}
      onShowAllReviews={(tripData) =>
        navigation.navigate("Reviews", { tripData })
      }
    />
  );
}

function ReviewsWrapper({
  navigation,
  route,
}: NativeStackScreenProps<HomeStackParamList, "Reviews">) {
  return (
    <ReviewsScreen
      onBack={() => navigation.goBack()}
      tripData={route.params.tripData}
    />
  );
}

function NotificationsWrapper({
  navigation,
}: NativeStackScreenProps<HomeStackParamList, "Notifications">) {
  return <NotificationsScreen onBack={() => navigation.goBack()} />;
}

function CompanyDetailWrapper({
  navigation,
  route,
}: NativeStackScreenProps<HomeStackParamList, "CompanyDetail">) {
  const { companyId } = route.params;
  const { toggle: toggleSaved, isSaved } = useSavedTripsState();
  return (
    <CompanyDetailScreen
      onBack={() => navigation.goBack()}
      companyId={companyId}
      onTripPress={(tripId, isPast) => {
        if (isPast) {
          navigation.navigate("PastTripDetail", {
            tripData: { id: tripId } as any,
          });
        } else {
          navigation.navigate("TripDetail", { trip: { id: tripId } as any });
        }
      }}
      onBookmarkTrip={(trip) => toggleSaved((trip as any)?.id ?? trip)}
      isTripSaved={(tripId) => isSaved(tripId)}
      onContactPress={
        (/* companyId */) =>
          navigation.navigate("CompanyContact", { companyName: "Kamil Koç" })
      }
      onBusInfoPress={
        (/* companyId */) =>
          navigation.navigate("BusInfo", { companyName: "Kamil Koç" })
      }
      onTabPress={(tab: string) => {
        // Route to tabs
        // Not used here since we are already in a nested stack, leave as no-op.
      }}
    />
  );
}

function CompanyContactWrapper({
  navigation,
  route,
}: NativeStackScreenProps<HomeStackParamList, "CompanyContact">) {
  return (
    <CompanyContactScreen
      onBack={() => navigation.goBack()}
      companyName={route.params.companyName}
    />
  );
}

function BusInfoWrapper({
  navigation,
  route,
}: NativeStackScreenProps<HomeStackParamList, "BusInfo">) {
  return (
    <BusInfoScreen
      onBack={() => navigation.goBack()}
      companyName={route.params.companyName}
    />
  );
}

function QRWrapper({
  navigation,
}: NativeStackScreenProps<HomeStackParamList, "QR">) {
  return (
    <QRScreen
      onBack={() => navigation.goBack()}
      onHome={() => navigation.popToTop()}
    />
  );
}

function SearchWrapper({
  navigation,
}: NativeStackScreenProps<HomeStackParamList, "Search">) {
  return (
    <SearchScreen
      onBack={() => navigation.goBack()}
      onTripPress={(tripId) =>
        navigation.navigate("TripDetail", { trip: { id: tripId } as any })
      }
      onCompanyPress={(companyId) =>
        navigation.navigate("CompanyDetail", { companyId })
      }
    />
  );
}

function ChatsWrapper({
  navigation,
}: NativeStackScreenProps<HomeStackParamList, "Chats">) {
  return (
    <ChatsScreen
      onBack={() => navigation.goBack()}
      onChatPress={(chat) =>
        navigation.navigate("ChatDetail", {
          chat: { ...chat, memberCount: 50 },
        })
      }
    />
  );
}

function ChatDetailWrapper({
  navigation,
  route,
}: NativeStackScreenProps<HomeStackParamList, "ChatDetail">) {
  const { chat } = route.params;
  const normalized = { ...chat, memberCount: chat.memberCount ?? 0 };
  return (
    <ChatDetailScreen
      onBack={() => navigation.goBack()}
      chatData={normalized}
    />
  );
}

function PastTripsRatingWrapper({
  navigation,
}: NativeStackScreenProps<HomeStackParamList, "PastTripsRating">) {
  return <PastTripsRatingScreen onBack={() => navigation.goBack()} />;
}

function CalendarRootWrapper() {
  const { toggle: toggleSaved, isSaved } = useSavedTripsState();
  return (
    <CalendarScreen
      onBack={() => {}}
      onShowProgramDetail={(tripData) => {}}
      onBookmarkTrip={(trip) => toggleSaved((trip as any)?.id)}
      isTripSaved={(tripId) => isSaved(tripId)}
      onOpenNotifications={() => {}}
    />
  );
}

function CalendarCalendarHomeWrapper({
  navigation,
}: NativeStackScreenProps<any>) {
  const { toggle: toggleSaved, isSaved } = useSavedTripsState();
  return (
    <CalendarScreen
      onBack={() => {}}
      onShowProgramDetail={(tripData) => {}}
      onBookmarkTrip={(trip) => toggleSaved((trip as any)?.id)}
      isTripSaved={(tripId) => isSaved(tripId)}
      onOpenNotifications={() => {}}
      onShowQR={() => navigation.navigate("QR")}
    />
  );
}

function MessagesRootWrapper() {
  return <ChatsScreen onBack={() => {}} onChatPress={() => {}} />;
}

function ProfileRootWrapper({ onLogout }: { onLogout: () => void }) {
  return (
    <ProfileScreen
      onBack={() => {}}
      onNavigateToProfileEdit={() => {}}
      onNavigateToSavedTrips={() => {}}
      onNavigateToPastTripsRating={() => {}}
      onNavigateToSecurity={() => {}}
      onNavigateToAbout={() => {}}
      onLogout={onLogout}
    />
  );
}
