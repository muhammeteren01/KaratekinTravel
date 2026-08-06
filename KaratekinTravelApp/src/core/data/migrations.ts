import { z } from 'zod';
import { BootstrapSchema, type BootstrapPayload } from './schemas';

// Keep schema version in one place so app/data cache can follow it
export const CURRENT_SCHEMA_VERSION = 4;

// Migration functions between schema versions
export type Migration = (input: any) => any;

// Example migrations map: from -> to
const migrations: Record<number, Migration> = {
  // 0 -> 1 migration example: ensure fields exist, coerce ids to string, etc.
  0: (input: any) => {
    if (!input) return { version: 1, companies: [], trips: [] };
    const version = 1;
    const base = { companies: [], trips: [], users: [], reservations: [], reviews: [] };
    const merged = { ...base, ...input, version };
    return merged;
  },
  // 1 -> 2: sample passthrough (kept for history)
  1: (input: any) => ({ ...input, version: 2 }),
  // 2 -> 3: normalize image references to strings (asset keys or URLs), coerce IDs to strings,
  // and convert Date objects to ISO strings for dateStart/dateEnd; drop unknown fields by re-parse later.
  2: (input: any) => {
    const normImage = (ref: any) => {
      if (ref == null) return ref;
      const t = typeof ref;
      if (t === 'string') return ref;
      if (t === 'number') return String(ref); // not expected but keep string form
      if (t === 'object' && ref.uri) return String(ref.uri);
      // Static require becomes a number in Metro; encode as asset key if known cannot be inferred here
      return String(ref);
    };
    const coerceId = (v: any) => String(v);
    const next = { ...input, version: 3 };
    next.companies = (next.companies || []).map((c: any) => ({
      id: coerceId(c.id),
      name: c.name,
      logo: normImage(c.logo),
      phone: c.phone,
      email: c.email,
      website: c.website,
      rating: c.rating,
      reviewCount: c.reviewCount,
      about: c.about,
      fullAbout: c.fullAbout,
      tripsLabel: c.tripsLabel,
      participantsLabel: c.participantsLabel,
      location: c.location,
    }));
    next.trips = (next.trips || []).map((t: any) => ({
      id: coerceId(t.id),
      companyId: coerceId(t.companyId ?? 'c1'),
      title: t.title,
      location: t.location,
      city: t.city,
      region: t.region,
      rating: t.rating,
      reviewCount: t.reviewCount,
      price: t.price,
      pricing: t.pricing,
      dateRange: t.dateRange,
      dateStart: t.dateStart ? new Date(t.dateStart).toISOString() : undefined,
      dateEnd: t.dateEnd ? new Date(t.dateEnd).toISOString() : undefined,
      capacity: t.capacity,
      joinedCount: t.joinedCount,
      avatars: (t.avatars || []).map((a: any) => String(a)),
      image: normImage(t.image),
      headerImage: normImage(t.headerImage),
      gallery: (t.gallery || []).map(normImage),
      description: t.description ?? '',
      purchased: !!t.purchased,
      details: t.details,
      policy: t.policy,
      itinerary: t.itinerary,
      hotels: t.hotels,
    }));
    if (next.supportingData) {
      const sd = next.supportingData;
      sd.calendarTrips = (sd.calendarTrips || []).map((ct: any) => ({ ...ct, id: coerceId(ct.id), image: normImage(ct.image) }));
      sd.routeStops = (sd.routeStops || []).map((rs: any) => ({ ...rs, id: coerceId(rs.id), image: normImage(rs.image) }));
      sd.pastTrips = (sd.pastTrips || []).map((p: any) => ({
        ...p,
        id: coerceId(p.id),
        companyId: p.companyId != null ? coerceId(p.companyId) : undefined,
        image: normImage(p.image),
        headerImage: normImage(p.headerImage),
        gallery: (p.gallery || []).map(normImage),
        timeline: (p.timeline || []).map((it: any) => ({ ...it, id: coerceId(it.id), image: normImage(it.image) })),
      }));
      sd.reservationPresets = (sd.reservationPresets || []).map((r: any) => ({ ...r, backgroundImage: normImage(r.backgroundImage) }));
      sd.companyReviews = (sd.companyReviews || []).map((r: any) => ({ ...r, id: coerceId(r.id) }));
      sd.userState = (sd.userState || []).map((u: any) => ({ userId: coerceId(u.userId), savedTripIds: (u.savedTripIds || []).map(coerceId), purchasedTripIds: (u.purchasedTripIds || []).map(coerceId) }));
    }
    next.reservations = (next.reservations || []).map((r: any) => ({ ...r, id: coerceId(r.id), userId: coerceId(r.userId), tripId: coerceId(r.tripId), companyId: coerceId(r.companyId) }));
    next.reviews = (next.reviews || []).map((r: any) => ({ ...r, id: coerceId(r.id), userId: coerceId(r.userId), tripId: coerceId(r.tripId) }));
    next.users = (next.users || []).map((u: any) => ({ ...u, id: coerceId(u.id), avatar: normImage(u.avatar) }));
    return next;
  },
  // 3 -> 4: normalize images within supportingData collections and coerce IDs to strings
  3: (input: any) => {
    const normImage = (ref: any) => {
      if (ref == null) return ref;
      const t = typeof ref;
      if (t === 'string') return ref;
      if (t === 'number') return String(ref);
      if (t === 'object' && (ref as any).uri) return String((ref as any).uri);
      return String(ref);
    };
    const coerceId = (v: any) => String(v);
    const next = { ...input, version: CURRENT_SCHEMA_VERSION };
    if (next.supportingData) {
      const sd = next.supportingData;
      // calendarTrips: coerce id, normalize image
      sd.calendarTrips = (sd.calendarTrips || []).map((ct: any) => ({
        ...ct,
        id: coerceId(ct.id),
        image: normImage(ct.image),
      }));
      // routeStops: coerce id, normalize image
      sd.routeStops = (sd.routeStops || []).map((rs: any) => ({
        ...rs,
        id: coerceId(rs.id),
        image: normImage(rs.image),
      }));
      // reservationPresets: ensure id string and backgroundImage normalized
      sd.reservationPresets = (sd.reservationPresets || []).map((r: any) => ({
        ...r,
        id: coerceId(r.id),
        backgroundImage: normImage(r.backgroundImage),
      }));
    }
    return next;
  },
};

export function migrateBootstrap(input: any): BootstrapPayload {
  let working = { ...input };
  let current = Number(working.version ?? 0);
  while (migrations[current]) {
    working = migrations[current](working);
    current += 1;
  }
  // Ensure final version matches CURRENT_SCHEMA_VERSION even if input was ahead or missing
  if (working.version !== CURRENT_SCHEMA_VERSION) {
    working.version = CURRENT_SCHEMA_VERSION;
  }
  const parsed = BootstrapSchema.parse(working);
  return parsed;
}
