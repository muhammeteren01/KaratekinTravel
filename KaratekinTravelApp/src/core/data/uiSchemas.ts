import { z } from 'zod';
import type { ImageSourcePropType } from 'react-native';
import { TripSchema, TripPricingSchema } from './schemas';
import { resolveImage } from './schemas';

// Helper: month names for Turkish date labels
const monthNames = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];

function formatDateRangeISO(startISO?: string, endISO?: string): string | undefined {
  if (!startISO && !endISO) return undefined;
  const s = startISO ? new Date(startISO) : undefined;
  const e = endISO ? new Date(endISO) : undefined;
  if (s && e) {
    return `${s.getDate()} ${monthNames[s.getMonth()]} - ${e.getDate()} ${monthNames[e.getMonth()]}`;
  }
  const d = (s || e)!;
  return `${d.getDate()} ${monthNames[d.getMonth()]}`;
}

// Ensure we always return a stable numeric id for UI even when schema id is a non-numeric string (e.g., "t1")
function toNumericId(id: string | number): number {
  if (typeof id === 'number') return id;
  const str = String(id);
  if (/^\d+$/.test(str)) return parseInt(str, 10);
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(hash) + 100000;
}

// A Zod type for React Native ImageSourcePropType
const ImageSourceSchema: z.ZodType<ImageSourcePropType> = z.any();

// Hotel and itinerary UI schemas derived for typing clarity (image mapping applied in transform below)
export const TripHotelInfoUISchema = z.object({
  name: z.string(),
  stars: z.number().min(1).max(5).optional(),
  address: z.string().optional(),
  image: ImageSourceSchema.optional(),
  gallery: z.array(ImageSourceSchema).optional(),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  amenities: z.array(z.string()).optional(),
  description: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  mapLink: z.string().optional(),
}).strict();

export const TripItineraryItemUISchema = z.object({
  day: z.number().int().positive(),
  title: z.string().optional(),
  dateLabel: z.string().optional(),
  activities: z.array(z.object({ time: z.string().optional(), label: z.string(), description: z.string().optional() })).default([]),
  note: z.string().optional(),
  hotelIndex: z.number().int().nonnegative().optional(),
  // UI allows an optional direct hotel object too (not present in base schema mapping by default)
  // Keeping it optional for compatibility
  hotel: TripHotelInfoUISchema.optional(),
}).strict();

// Full Trip UI object schema
export const TripUIObjectSchema = z.object({
  id: z.number(),
  title: z.string(),
  location: z.string(),
  city: z.string(),
  region: z.string(),
  rating: z.number(),
  reviewCount: z.number(),
  price: z.string(),
  peopleCountLabel: z.string().optional(),
  dateRange: z.string(),
  dateStart: z.date().optional(),
  dateEnd: z.date().optional(),
  capacity: z.number(),
  joinedCount: z.number(),
  avatars: z.array(z.string()),
  image: ImageSourceSchema,
  headerImage: ImageSourceSchema.optional(),
  gallery: z.array(ImageSourceSchema).optional(),
  description: z.string(),
  pricing: TripPricingSchema.optional(),
  details: z.object({
    included: z.array(z.string()).default([]),
    excluded: z.array(z.string()).default([]),
    specialNote: z.string().optional(),
  }).optional(),
  policy: z.object({
    title: z.string().optional(),
    paragraphs: z.array(z.string()).default([]),
  }).optional(),
  itinerary: z.array(TripItineraryItemUISchema).optional(),
  hotels: z.array(TripHotelInfoUISchema).optional(),
  purchased: z.boolean().optional(),
  companyId: z.string().optional(),
  companyName: z.string().optional(),
}).strict();

// TripUISchema: validates base schema then transforms into UI shape and validates output against TripUIObjectSchema
export const TripUISchema = TripSchema
  .transform((t) => {
    const computedDateRange = t.dateRange ?? formatDateRangeISO(t.dateStart, t.dateEnd) ?? '';
    const computedPeople = typeof t.joinedCount === 'number' && t.joinedCount > 0 ? `+${t.joinedCount}` : undefined;
    return {
      id: toNumericId(t.id as unknown as string | number),
      title: t.title,
      location: t.location,
      city: t.city,
      region: t.region,
      rating: t.rating,
      reviewCount: t.reviewCount,
      price: t.price ?? (t.pricing ? `${t.pricing.currency} ${t.pricing.basePrice}` : ''),
      peopleCountLabel: computedPeople,
      dateRange: computedDateRange,
      dateStart: t.dateStart ? new Date(t.dateStart) : undefined,
      dateEnd: t.dateEnd ? new Date(t.dateEnd) : undefined,
      capacity: t.capacity,
      joinedCount: t.joinedCount,
      avatars: t.avatars ?? [],
      image: resolveImage(t.image)!,
      headerImage: resolveImage(t.headerImage),
      gallery: (t.gallery ?? []).filter((x): x is string => Boolean(x)).map((g) => resolveImage(g)).filter((x): x is ImageSourcePropType => Boolean(x)),
      description: t.description ?? '',
      pricing: t.pricing,
      details: t.details,
      policy: t.policy,
      itinerary: t.itinerary,
      hotels: (t.hotels ?? []).map((h) => ({
        ...h,
        image: resolveImage(h.image),
        gallery: (h.gallery ?? []).map((g) => resolveImage(g)).filter((x): x is ImageSourcePropType => Boolean(x)),
      })),
      purchased: t.purchased ?? false,
      companyId: t.companyId,
      // companyName is not part of the base schema; keep optional undefined for compatibility
      companyName: undefined,
    };
  })
  .pipe(TripUIObjectSchema);

export type TripUI = z.infer<typeof TripUISchema>;
