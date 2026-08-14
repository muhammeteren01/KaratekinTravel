import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  TextInput,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import RatingStars from "@/shared/ui/RatingStars";
import { resolveImage } from "@/core/data/schemas";
import { AppHeader, Button } from "@/shared/ui";
import { userAvatarSource } from "@/utils/avatar";
import { useAuth } from "@/context/AuthContext";

interface TripRatingDetailScreenProps {
  onBack: () => void;
  tripData: {
    id: string | number;
    title: string;
    location: string;
    rating: number;
    reviewCount: number;
    price: string;
    image: string;
  };
  onSubmitRating: (tripId: string | number, rating: number, comment: string) => void;
}

export default function TripRatingDetailScreen({
  onBack,
  tripData,
  onSubmitRating,
}: TripRatingDetailScreenProps) {
  const { currentUser } = useAuth();
  const [selectedRating, setSelectedRating] = useState(0);
  const [comment, setComment] = useState("");
  const handleStarPress = (rating: number) => setSelectedRating(rating);
  const handleSubmit = () => {
    if (selectedRating === 0) {
      Alert.alert("Uyarı", "Lütfen bir puan seçin.");
      return;
    }
    onSubmitRating(tripData.id, selectedRating, comment);
    Alert.alert("Başarılı", "Değerlendirmeniz kaydedildi. Teşekkürler!", [
      { text: "Tamam", onPress: onBack },
    ]);
  };
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="transparent" translucent />
      <ImageBackground
        source={resolveImage("asset:bg1") as any}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <AppHeader
          title="Değerlendirme Yap"
          showBack={false}
          backgroundColor="transparent"
          titleColor="#FFFFFF"
          left={
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>
          }
        />
        <View style={styles.contentCard}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.titleSection}>
              <View style={styles.titleContainer}>
                <Text style={styles.tripTitle}>{tripData.title}</Text>
                <Text style={styles.tripLocation}>{tripData.location}</Text>
              </View>
              <Image
                source={userAvatarSource(currentUser?.avatar)}
                style={styles.avatar}
              />
            </View>
            <View style={styles.tripInfo}>
              <View style={styles.infoItem}>
                <Ionicons name="location-outline" size={18} color="#999" />
                <Text style={styles.infoText}>Amasra</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="star" size={18} color="#FFD700" />
                <Text style={styles.ratingText}>
                  {tripData.rating} ({tripData.reviewCount})
                </Text>
              </View>
              <Text style={styles.priceText}>{tripData.price}</Text>
            </View>
            <View style={styles.commentSection}>
              <TextInput
                style={styles.commentInput}
                placeholder="Değerlendirmeniz..."
                placeholderTextColor="#999"
                value={comment}
                onChangeText={setComment}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
            <View style={styles.ratingSection}>
              <View style={styles.starsContainer}>
                <RatingStars
                  value={selectedRating}
                  size={24}
                  color="#FFD700"
                  onChange={handleStarPress}
                />
              </View>
            </View>
            <Button
              title="Değerlendir"
              onPress={handleSubmit}
              variant="primary"
              style={styles.submitButton}
            />
          </ScrollView>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    height: "100%",
    width: "100%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "white",
  },
  headerRight: {
    width: 40,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 20,
  },

  contentCard: {
    flex: 1,
    backgroundColor: "white",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    marginTop: 140,
    paddingTop: 30,
    paddingBottom: 40,
  },
  titleSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  titleContainer: {
    flex: 1,
  },
  tripTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  tripLocation: {
    fontSize: 16,
    color: "#999",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginLeft: 16,
    backgroundColor: "#E8F5E8",
  },
  tripInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  infoText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 6,
    fontWeight: "500",
  },
  ratingText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 6,
    fontWeight: "500",
  },
  priceText: {
    fontSize: 18,
    color: "#FF6B35",
    fontWeight: "600",
    marginLeft: "auto",
  },
  commentSection: {
    marginBottom: 30,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#F8F9FA",
    minHeight: 170,
  },
  ratingSection: {
    marginBottom: 40,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    flex: 1,
  },
  starsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  starButton: {
    padding: 4,
  },
  submitButton: {
    backgroundColor: "#FF6B35",
    borderRadius: 25,
    paddingVertical: 18,
    shadowColor: "#FF6B35",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
