import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import TripRatingDetailScreen from './TripRatingDetailScreen';
import { usePastTrips, useCreateReview } from '@/core/data/store';

interface PastTripsRatingScreenProps {
  onBack: () => void;
}

interface PastTripCard {
  id: string;
  title: string;
  location: string;
  rating: number;
  price: string;
  image: string;
  isRated: boolean;
  userRating?: number;
  reviewCount?: number;
}

export default function PastTripsRatingScreen({ onBack }: PastTripsRatingScreenProps) {
  const { data: pastFromApi } = usePastTrips();
  const createReview = useCreateReview();
  const [localRated, setLocalRated] = useState<Record<string, number>>({});

  const pastTrips: PastTripCard[] = useMemo(() => {
    if (pastFromApi?.length) {
      return pastFromApi.map((t) => ({
        id: String(t.id),
        title: t.title,
        location: t.location,
        rating: t.rating,
        price: (t as any).priceText || '',
        image: typeof t.image === 'string' ? t.image : '',
        isRated: localRated[String(t.id)] != null,
        userRating: localRated[String(t.id)],
        reviewCount: (t as any).reviewCount,
      }));
    }
    return [];
  }, [pastFromApi, localRated]);

  const [showRatingDetail, setShowRatingDetail] = useState(false);
  const [selectedTripForRating, setSelectedTripForRating] = useState<PastTripCard | null>(null);

  const handleRate = (tripId: string) => {
    const trip = pastTrips.find((t) => t.id === tripId);
    if (trip) {
      setSelectedTripForRating(trip);
      setShowRatingDetail(true);
    }
  };

  const handleBackFromRatingDetail = () => {
    setShowRatingDetail(false);
    setSelectedTripForRating(null);
  };

  const handleSubmitRating = async (tripId: string | number, rating: number, comment: string) => {
    const id = String(tripId);
    try {
      // Only call API when id looks like a Guid
      if (/^[0-9a-fA-F-]{36}$/.test(id)) {
        await createReview.mutateAsync({ tripId: id, rating, comment });
      }
      setLocalRated((prev) => ({ ...prev, [id]: rating }));
    } catch (e) {
      Alert.alert('Hata', e instanceof Error ? e.message : 'Değerlendirme kaydedilemedi');
    }
  };

  if (showRatingDetail && selectedTripForRating) {
    return (
      <TripRatingDetailScreen
        onBack={handleBackFromRatingDetail}
        tripData={{
          id: selectedTripForRating.id,
          title: selectedTripForRating.title,
          location: selectedTripForRating.location,
          rating: selectedTripForRating.rating,
          reviewCount: selectedTripForRating.reviewCount || 0,
          price: selectedTripForRating.price,
          image: selectedTripForRating.image,
        }}
        onSubmitRating={handleSubmitRating}
      />
    );
  }

  const renderTripCard = ({ item }: { item: PastTripCard }) => (
    <View style={styles.tripCard}>
      <Image source={{ uri: item.image }} style={styles.tripImage} />
      <View style={styles.tripContent}>
        <Text style={styles.tripTitle}>{item.title}</Text>
        <View style={styles.tripInfo}>
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={14} color="#999" />
            <Text style={styles.locationText}>{item.location}</Text>
          </View>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>
        <Text style={styles.priceText}>{item.price}</Text>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {!item.isRated ? (
            <TouchableOpacity 
              style={styles.rateButton}
              onPress={() => handleRate(item.id)}
            >
              <Ionicons name="sync-outline" size={16} color="white" />
              <Text style={styles.rateButtonText}>Değerlendir</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.ratedButton}>
              <Ionicons name="checkmark" size={16} color="white" />
              <Text style={styles.ratedButtonText}>
                Değerlendirildi {item.userRating}/5
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor="#F8F9FA" translucent={false} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Değerlendirme Yap</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Content */}
      <FlatList
        data={pastTrips}
        renderItem={renderTripCard}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.tripsContainer}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
      />
  </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#F8F9FA',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerRight: {
    width: 40,
  },
  tripsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
  },
  tripCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tripImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  tripContent: {
    padding: 12,
  },
  tripTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  tripInfo: {
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#333',
    marginLeft: 4,
    fontWeight: '600',
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF6B35',
    marginBottom: 12,
  },
  actionButtons: {
    marginTop: 8,
  },
  rateButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rateButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  ratedButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratedButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
}); 