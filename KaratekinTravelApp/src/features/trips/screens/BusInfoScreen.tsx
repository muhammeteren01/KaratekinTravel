import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { AppHeader } from '@/shared/ui';
import BusGalleryModal from '@/components/BusGalleryModal';
import BusAmenities from '@/components/BusAmenities';
import { useReservationPresets } from '@/core/data/store';
import { useCompanies } from '@/core/data/store';
import { LoadingView, ErrorView } from '@/shared/ui';
import { resolveImage } from '@/core/data/schemas';

interface BusInfoScreenProps {
  onBack: () => void;
  companyName?: string;
}

export default function BusInfoScreen({ onBack, companyName = 'Kamil Koç' }: BusInfoScreenProps) {
  const [isGalleryModalVisible, setIsGalleryModalVisible] = useState(false);
  const { data: presets, isLoading: presetsLoading, isError: presetsError, refetch: refetchPresets } = useReservationPresets();
  const { data: companies = [], isLoading: companiesLoading, isError: companiesError, refetch: refetchCompanies } = useCompanies();
  if (presetsLoading || companiesLoading) return <LoadingView />;
  if (presetsError || companiesError) return <ErrorView onRetry={() => { presetsError && refetchPresets(); companiesError && refetchCompanies(); }} />;

  const handleBusCardPress = () => {
    setIsGalleryModalVisible(true);
  };

  // Find matching company logo (optional)
  const companyLogo = useMemo(() => {
    if (!companyName) return undefined;
    const match = companies.find(c => (c.name || '').toLowerCase().includes(companyName.toLowerCase()));
    return resolveImage(match?.logo);
  }, [companies, companyName]);

  // Filter presets by company name (substring match, tolerant to suffixes like "Turizm")
  const companyPresets = useMemo(() => {
    const list = presets ?? [];
    if (!companyName) return list;
    const name = companyName.toLowerCase();
    const filtered = list.filter(p => (p.companyName || '').toLowerCase().includes(name));
    return filtered.length ? filtered : list; // fallback: show all if none match
  }, [presets, companyName]);

  // Map presets into UI rows
  const busItems = useMemo(() => {
    return companyPresets.map((p, idx) => {
      const layout = p.layout || { seatsLeft: 2, seatsRight: 2, totalSeats: 36 } as any;
      const seatConfig = `${layout.seatsLeft}+${layout.seatsRight}`;
      return {
        id: String(p.id ?? idx),
        image: resolveImage(p.backgroundImage) || resolveImage('asset:ob1'),
        model: p.companyName || 'Otobüs',
        seatConfig,
        capacity: layout.totalSeats || 0,
        amenities: p.amenities || [],
      };
    });
  }, [companyPresets]);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor="#FFFFFF" translucent={false} />
      
      <AppHeader
        title="Otobüs Bilgileri"
        onBack={onBack}
        safeAreaTop
        right={<Image source={(companyLogo as any) || (resolveImage('asset:ob1') as any)} style={styles.companyAvatar} />}
      />

      {/* Bus Amenities Section (matches Figma) */}
      <View style={styles.busAmenitiesWrapper}>
        <BusAmenities />
      </View>

      {/* Buses Section */}
      <View style={styles.busesSection}>
        <Text style={styles.busesTitle}>Otobüsler</Text>
        
        <ScrollView style={styles.busList} showsVerticalScrollIndicator={false}>
          {busItems.map((bus) => (
            <TouchableOpacity key={bus.id} style={styles.busItem} onPress={handleBusCardPress}>
              <View style={styles.busCard}>
                <View style={styles.busImageContainer}>
                  <Image source={bus.image as any} style={styles.busImage} />
                </View>

                <View style={styles.busInfo}>
                  <View style={styles.busMainInfo}>
                    <Text style={styles.busModel}>{bus.model}</Text>
                  </View>

                  <View style={styles.busFeatures}>
                    <View style={styles.seatConfigSmall}>
                      <Text style={styles.seatConfigTextSmall}>{bus.seatConfig}</Text>
                    </View>
                    {/* Show a couple of amenity icons if available */}
                    {bus.amenities?.includes('wifi') && (
                      <Ionicons name="wifi-outline" size={16} color="#7D848D" />
                    )}
                    {bus.amenities?.includes('power') && (
                      <Ionicons name="flash-outline" size={16} color="#7D848D" />
                    )}
                  </View>

                  <View style={styles.busCapacity}>
                    <Ionicons name="people-outline" size={16} color="#7D848D" />
                    <Text style={styles.capacityText}>{bus.capacity} Kişilik</Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity style={styles.arrowButton}>
                <Ionicons name="chevron-forward" size={20} color="#7D848D" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Bus Gallery Modal */}
      <BusGalleryModal
        visible={isGalleryModalVisible}
        onClose={() => setIsGalleryModalVisible(false)}
        companyName={companyName}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginTop: 10,
  },
  busAmenitiesWrapper: {
    marginHorizontal: 15,
    marginTop: 37,
  },
  busesSection: {
    flex: 1,
    paddingHorizontal: 15,
    marginTop: 39,
  },
  busesTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1B1E28',
    lineHeight: 28,
    marginBottom: 16,
  },
  busList: {
    flex: 1,
  },
  busItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 8,
    padding: 0,
    height: 76,
    shadowColor: '#B4BCC9',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  busCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    gap: 16,
  },
  busImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    overflow: 'hidden',
    marginLeft: 0,
  },
  busImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  busInfo: {
    flex: 1,
    justifyContent: 'space-between',
    height: 63,
    gap: 4,
  },
  busMainInfo: {
    height: 20,
  },
  busModel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1B1E28',
    letterSpacing: 0.5,
    lineHeight: 20,
  },
  busFeatures: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  seatConfigSmall: {
    backgroundColor: '#B9B9B9',
    borderRadius: 7,
    width: 29,
    height: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  seatConfigTextSmall: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  busCapacity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: 82,
  },
  capacityText: {
    fontSize: 13,
    fontWeight: '400',
    color: '#7D848D',
    letterSpacing: 0.3,
    lineHeight: 16,
  },
  arrowButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  companyAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
});
