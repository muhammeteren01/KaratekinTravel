import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface BusAmenitiesProps {
  personCount?: number;
  seat2p1Count?: number;
  seat2p2Count?: number;
  showWifi?: boolean;
  showOutlet?: boolean; // Priz
  showAC?: boolean; // Klima
  style?: any;
}

const BusAmenities: React.FC<BusAmenitiesProps> = ({
  personCount = 11,
  seat2p1Count = 8,
  seat2p2Count = 3,
  showWifi = true,
  showOutlet = true,
  showAC = true,
  style,
}) => {
  return (
    <View style={[styles.container, style]}> 
      {/* Top row: person, 2+1, 2+2 */}
      <View style={styles.topRow}>
        {/* Passenger Count */}
        <View style={styles.infoItem}> 
          <Ionicons name="person-outline" size={16} color="#7D848D" />
          <Text style={styles.infoNumber}>{personCount}</Text>
        </View>

        {/* 2+1 chip with count */}
        <View style={styles.infoItem}> 
          <View style={styles.seatChip}>
            <Text style={styles.seatChipText}>2+1</Text>
          </View>
          <Text style={styles.infoNumber}>{seat2p1Count}</Text>
        </View>

        {/* 2+2 chip with count */}
        <View style={styles.infoItem}> 
          <View style={styles.seatChip}>
            <Text style={styles.seatChipText}>2+2</Text>
          </View>
          <Text style={styles.infoNumber}>{seat2p2Count}</Text>
        </View>
      </View>

      {/* Bottom row: Wi-Fi, Priz, Klima */}
      <View style={styles.bottomRow}>
        {showWifi && (
          <View style={styles.featureItem}> 
            <Ionicons name="wifi-outline" size={16} color="#7D848D" />
            <Text style={styles.featureText}>Wi-Fi</Text>
          </View>
        )}
        {showOutlet && (
          <View style={styles.featureItem}> 
            <Ionicons name="flash-outline" size={16} color="#7D848D" />
            <Text style={styles.featureText}>Priz</Text>
          </View>
        )}
        {showAC && (
          <View style={styles.featureItem}> 
            {/* AC icon approximation */}
            <Ionicons name="snow-outline" size={16} color="#7D848D" />
            <Text style={styles.featureText}>Klima</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#EEEEEE',
    borderRadius: 16,
    paddingHorizontal: 19,
    paddingTop: 17,
    paddingBottom: 17,
    height: 85, // matches Figma frame height
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16, // vertical gap per Figma
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  seatChip: {
    backgroundColor: '#B9B9B9',
    borderRadius: 7,
    width: 29,
    height: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  seatChipText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
    lineHeight: 16,
  },
  infoNumber: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7D848D',
    letterSpacing: 0.3,
    lineHeight: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 75.57, // to approximate Figma fixed widths and spacing
  },
  featureText: {
    fontSize: 13,
    fontWeight: '400',
    color: '#7D848D',
    letterSpacing: 0.3,
    lineHeight: 16,
  },
});

export default BusAmenities;
