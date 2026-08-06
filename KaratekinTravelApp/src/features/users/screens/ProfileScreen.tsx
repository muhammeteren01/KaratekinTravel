import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader, Button } from "@/shared/ui";
import { useAuth } from "@/context/AuthContext";
import { useReservations, useReviews } from "@/core/data/store";
import { LoadingView, ErrorView } from "@/shared/ui";
import { resolveImage } from "@/core/data/schemas";

interface ProfileScreenProps {
  onBack: () => void;
  onNavigateToProfileEdit?: () => void;
  onNavigateToSavedTrips?: () => void;
  onNavigateToPastTripsRating?: () => void;
  onNavigateToSecurity?: () => void;
  onNavigateToAbout?: () => void;
  onLogout?: () => void;
}

export default function ProfileScreen({
  onBack,
  onNavigateToProfileEdit,
  onNavigateToSavedTrips,
  onNavigateToPastTripsRating,
  onNavigateToSecurity,
  onNavigateToAbout,
  onLogout,
}: ProfileScreenProps) {
  const { currentUser, logout } = useAuth();
  const {
    data: reservations = [],
    isLoading: reservationsLoading,
    isError: reservationsError,
    refetch: refetchReservations,
  } = useReservations();
  const {
    data: reviews = [],
    isLoading: reviewsLoading,
    isError: reviewsError,
    refetch: refetchReviews,
  } = useReviews();
  if (reservationsLoading || reviewsLoading) return <LoadingView />;
  if (reservationsError || reviewsError)
    return (
      <ErrorView
        onRetry={() => {
          reservationsError && refetchReservations();
          reviewsError && refetchReviews();
        }}
      />
    );
  const myReservations = reservations.filter(
    (r) => String(r.userId) === String(currentUser?.id),
  );
  const myReviews = reviews.filter(
    (r) => String(r.userId) === String(currentUser?.id),
  );
  const points = myReviews.reduce((sum, r) => sum + (r.rating || 0), 0);
  const handleLogout = () => {
    Alert.alert(
      "Çıkış Yap",
      "Hesabınızdan çıkmak istediğinizden emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Çıkış Yap",
          style: "destructive",
          onPress: () => {
            onLogout?.();
            logout();
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor="#F8F9FA" translucent={false} />
      <AppHeader title="Profil" onBack={onBack} safeAreaTop />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {currentUser?.avatar ? (
              <Image
                source={resolveImage(currentUser.avatar) as any}
                style={styles.profileAvatar}
              />
            ) : (
              <View
                style={[
                  styles.profileAvatar,
                  {
                    backgroundColor: "#E6F7FD",
                    justifyContent: "center",
                    alignItems: "center",
                  },
                ]}
              >
                <Text
                  style={{ fontSize: 28, fontWeight: "700", color: "#24BAEC" }}
                >
                  {(currentUser?.name?.[0] || "?").toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.userName}>
            {currentUser?.name || "Kullanıcı"}
          </Text>
          <Text style={styles.userEmail}>{currentUser?.email || ""}</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Toplam Gezi</Text>
              <Text style={styles.statValue}>{myReservations.length}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Değerlendirme</Text>
              <Text style={styles.statValue}>{myReviews.length}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Puanım</Text>
              <Text style={styles.statValue}>{points}</Text>
            </View>
          </View>
        </View>
        <View style={styles.menuSection}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={onNavigateToProfileEdit}
          >
            <View style={styles.menuIconContainer}>
              <Ionicons name="person-outline" size={20} color="#666" />
            </View>
            <Text style={styles.menuText}>Profil</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={onNavigateToSavedTrips}
          >
            <View style={styles.menuIconContainer}>
              <Ionicons name="bookmark-outline" size={20} color="#666" />
            </View>
            <Text style={styles.menuText}>Kaydedilen Geziler</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={onNavigateToPastTripsRating}
          >
            <View style={styles.menuIconContainer}>
              <Ionicons name="airplane-outline" size={20} color="#666" />
            </View>
            <Text style={styles.menuText}>Önceki Geziler</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={onNavigateToSecurity}
          >
            <View style={styles.menuIconContainer}>
              <Ionicons name="shield-outline" size={20} color="#666" />
            </View>
            <Text style={styles.menuText}>Güvenlik</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={onNavigateToAbout}>
            <View style={styles.menuIconContainer}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color="#666"
              />
            </View>
            <Text style={styles.menuText}>Sürüm ve Hakkımızda</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>
        <View style={styles.logoutSection}>
          <Button
            title="Çıkış Yap"
            onPress={handleLogout}
            variant="danger"
            style={styles.logoutButton}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: "#F8F9FA",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 32,
    backgroundColor: "#F8F9FA",
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FFE4E1",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  userName: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  userEmail: {
    fontSize: 16,
    color: "#999",
    marginBottom: 32,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingHorizontal: 40,
  },
  statItem: {
    alignItems: "center",
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    fontWeight: "500",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF6B35",
  },
  menuSection: {
    backgroundColor: "white",
    marginHorizontal: 0,
    borderRadius: 0,
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderBottomWidth: 0.5,
    borderBottomColor: "#F0F0F0",
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
    fontWeight: "500",
  },
  logoutSection: {
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  logoutButton: {
    backgroundColor: "#FF3B30",
    shadowColor: "#FF3B30",
    paddingVertical: 16,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
});
