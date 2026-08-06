import type { ImageSourcePropType } from 'react-native';
import { z } from 'zod';
import { TripPricingSchema } from '@/core/data/schemas';
import { TripUIObjectSchema, TripItineraryItemUISchema, TripHotelInfoUISchema } from '@/core/data/uiSchemas';

export type TripPricing = z.infer<typeof TripPricingSchema>;
export type TripDetailsSections = NonNullable<z.infer<typeof TripUIObjectSchema>['details']>;
export type TripPolicy = NonNullable<z.infer<typeof TripUIObjectSchema>['policy']>;
export type TripItineraryItem = z.infer<typeof TripItineraryItemUISchema>;
export type TripHotelInfo = z.infer<typeof TripHotelInfoUISchema>;
export type Trip = z.infer<typeof TripUIObjectSchema>;
