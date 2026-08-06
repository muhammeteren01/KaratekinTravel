import { ImageSourcePropType } from 'react-native';

export type SeatStatus = 'available' | 'selected' | 'male' | 'female';

export interface SeatPreset {
  number: number;
  status: Extract<SeatStatus, 'male' | 'female'>;
}

export interface ReservationData {
  id: string;
  companyName: string;
  durationHours: number; // e.g., 6
  dateLabel: string; // e.g., "17/05/2025"
  busType: string; // e.g., "2+1" or "2+2"
  amenities?: Array<'wifi' | 'tv' | 'power' | 'snack' | 'wc' | 'usb'>;
  backgroundImage?: ImageSourcePropType;
  layout: {
    rows: number; // e.g., 7
    seatsLeft: number; // seats on left side per row (e.g., 2)
    seatsRight: number; // seats on right side per row (e.g., 2)
    totalSeats: number; // rows * (seatsLeft + seatsRight)
  };
  soldSeats: SeatPreset[]; // pre-occupied seats by gender
}
