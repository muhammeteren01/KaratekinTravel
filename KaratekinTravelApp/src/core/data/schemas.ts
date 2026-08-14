import { z } from "zod";
import type { ImageSourcePropType } from "react-native";
import { getAssetByKey } from "../../../assets/assetsMap";

// A simple branded type for React Native image references in JSON: use string URL or local asset key
/** Boş string'i "değer yok" sayan preprocess yardımcısı. */
const emptyStringToUndefined = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

// API görsel yüklenmemiş kayıtlarda null değil string.Empty gönderiyor
// (TripService: Image/HeaderImage, BootstrapService: CalendarTrip.Image).
// min(1) beklemek, görseli olmayan her kaydın parse edilmesini engelliyordu.
// Boş değer geçerli sayılıyor; resolveImage boş girdide undefined döndürüyor,
// arayüz de yer tutucusunu gösteriyor.
export const ImageRefSchema = z.string();

// Common primitives
const ID = z
  .union([z.string(), z.number()])
  .transform((v: string | number) => String(v));
const Currency = z.string().min(1);

// Company
export const CompanySchema = z
  .object({
    id: ID,
    name: z.string().min(1),
    logo: ImageRefSchema.optional(),
    phone: z.string().optional(),
    // API bu alanları doldurmuyor ve boş string gönderiyor (CompanyService:
    // Phone/Email/Website = string.Empty). Boş string geçerli bir e-posta
    // veya URL olmadığı için firma yanıtının tamamı reddediliyordu; boş
    // değer "yok" olarak yorumlanıyor.
    email: z.preprocess(emptyStringToUndefined, z.string().email().optional()),
    website: z.preprocess(emptyStringToUndefined, z.string().url().optional()),
    rating: z.number().min(0).max(10).default(0),
    reviewCount: z.number().int().nonnegative().default(0),
    about: z.string().optional(),
    fullAbout: z.string().optional(),
    tripsLabel: z.string().optional(),
    participantsLabel: z.string().optional(),
    location: z.string().optional(),
  })
  .strict();
export type Company = z.infer<typeof CompanySchema>;

// Trip pricing
export const TripPricingSchema = z
  .object({
    currency: Currency,
    basePrice: z.number().nonnegative(),
    // API indirim yoksa alanı atlamıyor, null gönderiyor
    // (TripService.MapPricingDto). Zod'da .optional() yalnızca undefined'ı
    // kabul ediyor, null'ı reddediyor; bu yüzden indirimsiz her tur
    // reddediliyordu. .nullish() ikisini birden kabul ediyor.
    discount: z
      .object({ label: z.string(), amount: z.number().nonnegative() })
      .nullish(),
    extras: z
      .array(z.object({ label: z.string(), amount: z.number().nonnegative() }))
      .optional(),
  })
  .strict();
export type TripPricing = z.infer<typeof TripPricingSchema>;

// Trip
// API tarihleri iki bicimde gonderebiliyor: tam ISO damgasi (createdAt gibi)
// ve yalnizca gun (TripService, DateStart/DateEnd icin "yyyy-MM-dd" uretiyor).
// Yalnizca .datetime() beklemek gun bicimli degerleri reddediyordu.
const DateLike = z
  .string()
  .refine(
    (v) => !Number.isNaN(Date.parse(v)),
    "must be an ISO datetime or a yyyy-MM-dd date",
  );

export const TripSchema = z
  .object({
    id: ID,
    companyId: ID,
    title: z.string().min(1),
    // API bu alanlar bos oldugunda null degil string.Empty donduruyor
    // (TripService.MapToResponseDto). min(1) beklemek, panelden sehir/bolge
    // girilmeden eklenen her turu reddediyordu.
    location: z.string().default(""),
    city: z.string().default(""),
    region: z.string().default(""),
    rating: z.number().min(0).max(5).default(0),
    reviewCount: z.number().int().nonnegative().default(0),
    price: z.string().min(1).nullish(), // legacy string label
    pricing: TripPricingSchema.nullish(),
    dateRange: z.string().nullish(),
    // Tarih girilmemişse API boş string gönderiyor; Date.parse("") NaN
    // döndüğü için doğrulama düşüyordu. Boş değer "tarih yok" sayılıyor.
    dateStart: z.preprocess(emptyStringToUndefined, DateLike.optional()),
    dateEnd: z.preprocess(emptyStringToUndefined, DateLike.optional()),
    // Kapasite panelde girilmemisse 0 geliyor; positive() bunu reddediyordu.
    capacity: z.number().int().nonnegative().default(0),
    joinedCount: z.number().int().nonnegative().default(0),
    avatars: z.array(ImageRefSchema).default([]),
    // Gorsel yuklenmemis turlar da listelenebilmeli; arayuz bos degeri
    // yer tutucuyla karsilamali.
    image: z.string().default(""),
    headerImage: z.string().nullish(),
    gallery: z.array(ImageRefSchema).nullish(),
    description: z.string().default(""),
    purchased: z.boolean().optional().default(false),
    // Sunucunun her turda gönderdiği alanlar. Şema .strict() olduğu için
    // burada tanımlı olmamaları tek başına tüm tur yanıtını reddettiriyordu.
    // isPublished özellikle anlamlı: turun kullanıcılara görünür olup
    // olmadığını söylüyor.
    createdAt: DateLike.optional(),
    updatedAt: DateLike.optional(),
    isPublished: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    isDeleted: z.boolean().optional(),
    details: z
      .object({
        included: z.array(z.string()).default([]),
        excluded: z.array(z.string()).default([]),
        specialNote: z.string().optional(),
      })
      .nullish(),
    policy: z
      .object({
        title: z.string().optional(),
        paragraphs: z.array(z.string()).default([]),
      })
      .nullish(),
    itinerary: z
      .array(
        z.object({
          day: z.number().int().positive(),
          title: z.string().optional(),
          dateLabel: z.string().optional(),
          activities: z
            .array(
              z.object({
                time: z.string().optional(),
                label: z.string(),
                description: z.string().optional(),
              }),
            )
            .default([]),
          note: z.string().optional(),
          hotelIndex: z.number().int().nonnegative().optional(),
        }),
      )
      .optional(),
    hotels: z
      .array(
        z.object({
          name: z.string(),
          stars: z.number().min(1).max(5).optional(),
          address: z.string().optional(),
          image: ImageRefSchema.optional(),
          gallery: z.array(ImageRefSchema).nullish(),
          checkIn: z.string().optional(),
          checkOut: z.string().optional(),
          amenities: z.array(z.string()).optional(),
          description: z.string().optional(),
          phone: z.string().optional(),
          website: z.string().optional(),
          mapLink: z.string().optional(),
        }),
      )
      .optional(),
  })
  .strict();
export type Trip = z.infer<typeof TripSchema>;

// User
export const UserSchema = z
  .object({
    id: ID,
    name: z.string().min(1),
    email: z.string().email(),
    phone: z
      .string()
      .nullish()
      .transform((v) => v || undefined),
    location: z
      .string()
      .nullish()
      .transform((v) => v || undefined),
    // API often returns "" for missing avatar — treat as undefined
    avatar: z.preprocess(
      (v) => (v == null || v === "" ? undefined : v),
      ImageRefSchema.optional(),
    ),
    role: z.string().optional(),
    companyId: z
      .union([z.string(), z.number(), z.null()])
      .optional()
      .transform((v) => (v == null || v === "" ? undefined : String(v))),
  });
export type User = z.infer<typeof UserSchema>;

// Reservation
export const ReservationSchema = z
  .object({
    id: ID,
    userId: ID,
    tripId: ID,
    companyId: ID,
    seatNumbers: z.array(z.number().int().positive()).default([]),
    totalAmount: z.number().nonnegative(),
    currency: Currency.default("TRY"),
    status: z.enum(["pending", "confirmed", "cancelled"]).default("pending"),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime().optional(),
  })
  .strict();
export type Reservation = z.infer<typeof ReservationSchema>;

// Review
export const ReviewSchema = z
  .object({
    id: ID,
    tripId: ID,
    userId: ID,
    rating: z.number().min(1).max(5),
    comment: z.string().optional(),
    createdAt: z.string().datetime(),
  })
  .strict();
export type Review = z.infer<typeof ReviewSchema>;

// UI supporting data types
export const CalendarTripSchema = z
  .object({
    id: ID,
    title: z.string(),
    location: z.string(),
    date: z.string(),
    time: z.string(),
    image: ImageRefSchema,
  })
  .strict();
export type CalendarTrip = z.infer<typeof CalendarTripSchema>;

export const NotificationItemSchema = z
  .object({
    id: ID,
    title: z.string(),
    message: z.string(),
    time: z.string(),
    avatarColor: z.string(),
    avatarEmoji: z.string(),
  })
  .strict();
export type NotificationItem = z.infer<typeof NotificationItemSchema>;

export const RouteStopItemSchema = z
  .object({
    id: ID,
    title: z.string(),
    time: z.string(),
    image: ImageRefSchema,
    width: z.number(),
    height: z.number(),
    timelineAlign: z.enum(["left", "right"]),
    top: z.number(),
    side: z.enum(["left", "right"]),
    sideOffset: z.number(),
  })
  .strict();
export type RouteStopItem = z.infer<typeof RouteStopItemSchema>;

export const ReservationPresetSchema = z
  .object({
    id: z.string(),
    companyName: z.string(),
    durationHours: z.number(),
    dateLabel: z.string(),
    busType: z.string(),
    amenities: z
      .array(z.enum(["wifi", "tv", "power", "snack", "wc", "usb"]))
      .optional(),
    backgroundImage: ImageRefSchema.optional(),
    layout: z.object({
      rows: z.number().int().positive(),
      seatsLeft: z.number().int().nonnegative(),
      seatsRight: z.number().int().nonnegative(),
      totalSeats: z.number().int().positive(),
    }),
    soldSeats: z
      .array(
        z.object({
          number: z.number().int().positive(),
          status: z.enum(["male", "female"]),
        }),
      )
      .default([]),
  })
  .strict();
export type ReservationPreset = z.infer<typeof ReservationPresetSchema>;

export const CompanyReviewItemSchema = z
  .object({
    id: ID,
    companyId: ID.optional(),
    name: z.string(),
    trip: z.string(),
    date: z.string(),
    rating: z.number().min(1).max(5),
    comment: z.string(),
    avatar: z.string(),
  })
  .strict();
export type CompanyReviewItem = z.infer<typeof CompanyReviewItemSchema>;

// Onboarding slides
export const OnboardingSlideSchema = z
  .object({
    id: ID,
    image: ImageRefSchema,
    title: z.string(),
    highlightText: z.string(),
    description: z.string(),
    backgroundColor: z.array(z.string()).default(["#FFFFFF", "#FFFFFF"]),
  })
  .strict();
export type OnboardingSlide = z.infer<typeof OnboardingSlideSchema>;

// Optional past trips (for UI-only pages)
export const PastTripSchema = z
  .object({
    id: ID,
    title: z.string(),
    location: z.string(),
    rating: z.number(),
    image: ImageRefSchema,
    date: z.string(),
    companyId: ID.optional(),
    companyName: z.string().optional(),
    city: z.string().optional(),
    reviewCount: z.number().optional(),
    priceText: z.string().optional(),
    headerImage: ImageRefSchema.optional(),
    gallery: z.array(ImageRefSchema).optional(),
    about: z.string().optional(),
    timeline: z
      .array(
        z.object({
          id: ID,
          title: z.string(),
          time: z.string(),
          image: ImageRefSchema,
          isCompleted: z.boolean().optional(),
        }),
      )
      .optional(),
    hotel: z
      .object({
        title: z.string(),
        durationText: z.string(),
        rating: z.number().optional(),
      })
      .optional(),
    reviews: z
      .array(
        z.object({
          id: ID,
          name: z.string(),
          avatar: z
            .object({ uri: z.string().optional(), require: z.any().optional() })
            .optional(),
          rating: z.number(),
          text: z.string(),
        }),
      )
      .optional(),
  })
  .strict();
export type PastTrip = z.infer<typeof PastTripSchema>;

export const SupportingDataSchema = z
  .object({
    featuredTripIds: z.array(ID).optional().default([]),
    calendarTrips: z.array(CalendarTripSchema).optional().default([]),
    notifications: z
      .object({
        recent: z.array(NotificationItemSchema).default([]),
        archived: z.array(NotificationItemSchema).default([]),
      })
      .optional(),
    routeStops: z.array(RouteStopItemSchema).optional().default([]),
    reservationPresets: z.array(ReservationPresetSchema).optional().default([]),
    companyReviews: z.array(CompanyReviewItemSchema).optional().default([]),
    pastTrips: z.array(PastTripSchema).optional().default([]),
    onboardingSlides: z.array(OnboardingSlideSchema).optional().default([]),
    // New, simplified onboarding content: data-driven slides for OnboardingScreen
    onboarding: z
      .array(
        z
          .object({
            id: ID,
            title: z.string(),
            description: z.string(),
            image: ImageRefSchema,
          })
          .strict(),
      )
      .optional()
      .default([]),
    // Per-user UI state stored in bootstrap as defaults; runtime changes persisted to SecureStore
    userState: z
      .array(
        z.object({
          userId: ID,
          savedTripIds: z.array(ID).default([]),
          purchasedTripIds: z.array(ID).default([]),
        }),
      )
      .optional()
      .default([]),
    // Optional chats slice for messaging UIs
    chats: z
      .object({
        groups: z
          .array(
            z.object({
              id: ID,
              groupName: z.string(),
              lastMessage: z.string(),
              time: z.string(),
              isActive: z.boolean(),
              avatar: z.string(), // uri
            }),
          )
          .default([]),
        groupMemberAvatars: z.record(z.array(z.string())).default({}),
        groupMessages: z
          .record(
            z.array(
              z.object({
                id: ID,
                text: z.string(),
                time: z.string(),
                isOwn: z.boolean(),
                avatar: z.string().optional(),
                isDelivered: z.boolean().optional(),
                isRead: z.boolean().optional(),
              }),
            ),
          )
          .default({}),
        companyContact: z
          .array(
            z.object({
              id: ID,
              text: z.string(),
              time: z.string(),
              isSent: z.boolean(),
              isRead: z.boolean().optional(),
            }),
          )
          .default([]),
      })
      .optional(),
  })
  .strict();
export type SupportingData = z.infer<typeof SupportingDataSchema>;

// Bootstrap payload schema (for initial load/offline cache)
export const BootstrapSchema = z
  .object({
    version: z.number().int().nonnegative(),
    companies: z.array(CompanySchema),
    trips: z.array(TripSchema),
    users: z.array(UserSchema).optional().default([]),
    reservations: z.array(ReservationSchema).optional().default([]),
    reviews: z.array(ReviewSchema).optional().default([]),
    supportingData: SupportingDataSchema.optional(),
    // Auxiliary lookup tables if needed later (categories, locations, etc.)
  })
  .strict();
export type BootstrapPayload = z.infer<typeof BootstrapSchema>;

// Utility: map JSON image string to RN ImageSourcePropType
export function resolveImage(ref?: any): ImageSourcePropType | undefined {
  if (ref == null) return undefined;
  // Görseli olmayan kayıtlarda API boş string gönderiyor; { uri: "" }
  // üretmek yerine tanımsız dönüp arayüzün yer tutucuya düşmesini sağla.
  if (typeof ref === "string" && ref.trim() === "") return undefined;
  // If it's already a valid RN source (number from require, or an object), just return it
  const t = typeof ref;
  if (t === "number") return ref as ImageSourcePropType;
  if (t === "object") return ref as ImageSourcePropType;
  const s = String(ref);
  if (/^https?:\/\//i.test(s)) return { uri: s } as ImageSourcePropType;
  // Normalize common forms like "assets/ob1.png", "./assets/onboarding1.png", "/assets/ob2.jpg"
  const cleaned = s
    .trim()
    .replace(/\\/g, "/") // windows paths
    .replace(/^\.\//, "") // leading ./
    .replace(/^\//, ""); // leading /
  const normalized = cleaned.startsWith("assets/")
    ? cleaned.replace(/^assets\//, "").replace(/\.(png|jpg|jpeg|webp)$/i, "")
    : cleaned.replace(/\.(png|jpg|jpeg|webp)$/i, "");
  // Local asset registry via asset:KEY convention
  const m = /^asset:(.+)$/.exec(normalized);
  if (m) {
    const found = getAssetByKey(m[1]);
    if (found) return found as ImageSourcePropType;
    console.warn(`resolveImage: asset key "${m[1]}" not found in assets map`);
  }
  const direct = getAssetByKey(normalized);
  if (direct) return direct as ImageSourcePropType;
  // If string looks like a local assets path but not found, avoid invalid URI crash by falling back to a known asset
  if (/^(\.\/)?\/?assets\//i.test(cleaned)) {
    return (
      (getAssetByKey("logo") as ImageSourcePropType) ||
      ({ uri: s } as ImageSourcePropType)
    );
  }
  return { uri: s } as ImageSourcePropType;
}
