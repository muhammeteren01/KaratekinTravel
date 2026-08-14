import {
  BootstrapSchema,
  type BootstrapPayload,
  TripSchema,
  CompanySchema,
  ReservationSchema,
  ReviewSchema,
  UserSchema,
  type Reservation,
  type Review,
} from '../schemas';
import { migrateBootstrap } from '../migrations';
import { DATA_ENDPOINTS } from '../../config/dataConfig';
import { apiFetch, ensureIsoDate, mapAuthUser } from './http';
import { emptyToUndefined } from './normalize';

function normalizeReservation(raw: any): Reservation {
  const statusRaw = String(raw.status ?? 'pending').toLowerCase();
  const status =
    statusRaw === 'completed' || statusRaw === 'confirmed'
      ? 'confirmed'
      : statusRaw === 'cancelled' || statusRaw === 'canceled'
        ? 'cancelled'
        : 'pending';

  return ReservationSchema.parse({
    id: String(raw.id),
    userId: String(raw.userId),
    tripId: String(raw.tripId),
    companyId: String(raw.companyId || raw.tripId),
    seatNumbers: Array.isArray(raw.seatNumbers) ? raw.seatNumbers : [],
    totalAmount: Number(raw.totalAmount ?? 0),
    currency: raw.currency || 'TRY',
    status,
    createdAt: ensureIsoDate(raw.createdAt),
    updatedAt: raw.updatedAt ? ensureIsoDate(raw.updatedAt) : undefined,
  });
}

function normalizeReview(raw: any): Review {
  return ReviewSchema.parse({
    id: String(raw.id),
    tripId: String(raw.tripId),
    userId: String(raw.userId),
    rating: Number(raw.rating),
    comment: raw.comment ?? undefined,
    createdAt: ensureIsoDate(raw.createdAt),
  });
}

export async function fetchBootstrap(): Promise<BootstrapPayload> {
  const raw = emptyToUndefined(
    await apiFetch<any>(DATA_ENDPOINTS.bootstrap, { auth: false }),
  );
  // Normalize API quirks before Zod
  if (Array.isArray(raw?.users)) {
    raw.users = raw.users.map((u: any) => mapAuthUser(u));
  }
  if (!Array.isArray(raw?.companies)) raw.companies = [];
  if (!Array.isArray(raw?.trips)) raw.trips = [];
  const migrated = migrateBootstrap(raw);
  return BootstrapSchema.parse(migrated);
}

export async function fetchTrips(): Promise<BootstrapPayload['trips']> {
  const res = await apiFetch<any[]>(DATA_ENDPOINTS.trips, { auth: false });
  return (res ?? []).map((t) => TripSchema.parse(emptyToUndefined(t)));
}

export async function fetchCompanies(): Promise<BootstrapPayload['companies']> {
  const res = await apiFetch<any[]>(DATA_ENDPOINTS.companies, { auth: false });
  return (res ?? []).map((c) => CompanySchema.parse(emptyToUndefined(c)));
}

export async function fetchReservations(): Promise<Reservation[]> {
  const res = await apiFetch<any[]>(DATA_ENDPOINTS.reservationsMy);
  return (res ?? []).map(normalizeReservation);
}

export async function fetchReviews(): Promise<Review[]> {
  const res = await apiFetch<any[]>(DATA_ENDPOINTS.reviews, { auth: false });
  return (res ?? []).map(normalizeReview);
}

export async function fetchUsers(): Promise<BootstrapPayload['users']> {
  try {
    const res = await apiFetch<any[]>(DATA_ENDPOINTS.users);
    return res.map((u) => UserSchema.parse(mapAuthUser(u)));
  } catch {
    return [];
  }
}

// ── Auth ──────────────────────────────────────────────

export async function loginApi(email: string, password: string) {
  const res = await apiFetch<{ token: string; user: any }>(DATA_ENDPOINTS.authLogin, {
    method: 'POST',
    auth: false,
    body: JSON.stringify({ email, password }),
  });
  return { token: res.token, user: mapAuthUser(res.user) };
}

export async function registerApi(payload: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}) {
  const res = await apiFetch<{ token: string; user: any }>(DATA_ENDPOINTS.authRegister, {
    method: 'POST',
    auth: false,
    body: JSON.stringify(payload),
  });
  return { token: res.token, user: mapAuthUser(res.user) };
}

export async function forgotPasswordApi(email: string) {
  return apiFetch<{ message: string }>(DATA_ENDPOINTS.authForgotPassword, {
    method: 'POST',
    auth: false,
    body: JSON.stringify({ email }),
  });
}

export async function fetchMe() {
  const raw = await apiFetch<any>(DATA_ENDPOINTS.authMe);
  return mapAuthUser(raw);
}

// ── Mutations ─────────────────────────────────────────

export async function createReservationApi(payload: {
  tripId: string;
  departureId?: string;
  seatNumbers: number[];
  notes?: string;
  couponCode?: string;
}) {
  const raw = await apiFetch<any>(DATA_ENDPOINTS.reservations, {
    method: 'POST',
    body: JSON.stringify({
      tripId: payload.tripId,
      departureId: payload.departureId || null,
      seatNumbers: payload.seatNumbers,
      notes: payload.notes,
      couponCode: payload.couponCode,
    }),
  });
  return normalizeReservation(raw);
}

export async function processPaymentApi(payload: {
  reservationId: string;
  paymentMethod?: string;
  transactionId?: string;
}) {
  const raw = await apiFetch<any>(DATA_ENDPOINTS.reservationsPayment, {
    method: 'POST',
    body: JSON.stringify({
      reservationId: payload.reservationId,
      paymentMethod: payload.paymentMethod || 'card',
      transactionId: payload.transactionId || `txn_${Date.now()}`,
    }),
  });
  return normalizeReservation(raw);
}

export async function createReviewApi(payload: {
  tripId: string;
  rating: number;
  comment?: string;
  isAnonymous?: boolean;
}) {
  const raw = await apiFetch<any>(DATA_ENDPOINTS.reviews, {
    method: 'POST',
    body: JSON.stringify({
      tripId: payload.tripId,
      rating: payload.rating,
      comment: payload.comment,
      isAnonymous: payload.isAnonymous ?? false,
      userId: '00000000-0000-0000-0000-000000000000', // server overwrites from JWT
    }),
  });
  return normalizeReview(raw);
}

export async function getSavedTripIdsApi(): Promise<string[]> {
  const res = await apiFetch<string[] | { tripIds?: string[] }>(
    `${DATA_ENDPOINTS.savedTrips}/my`,
  );
  if (Array.isArray(res)) return res.map(String);
  return (res?.tripIds ?? []).map(String);
}

export async function saveTripApi(tripId: string) {
  await apiFetch(`${DATA_ENDPOINTS.savedTrips}/${tripId}`, { method: 'POST' });
}

export async function unsaveTripApi(tripId: string) {
  await apiFetch(`${DATA_ENDPOINTS.savedTrips}/${tripId}`, { method: 'DELETE' });
}

export async function updateUserProfileApi(userId: string, payload: Partial<{
  name: string;
  email: string;
  phone: string;
  location: string;
  avatar: string;
}>) {
  const raw = await apiFetch<any>(`${DATA_ENDPOINTS.users}/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return mapAuthUser(raw);
}

export async function sendChatMessageApi(
  groupId: string,
  payload: { text: string; attachmentUrl?: string; attachmentType?: string },
) {
  return apiFetch(`${DATA_ENDPOINTS.chats}/${groupId}/messages`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function markNotificationReadApi(id: string) {
  await apiFetch(`${DATA_ENDPOINTS.notifications}/${id}/read`, { method: 'PUT' });
}

export async function archiveNotificationApi(id: string) {
  await apiFetch(`${DATA_ENDPOINTS.notifications}/${id}/archive`, { method: 'PUT' });
}

export async function deleteNotificationApi(id: string) {
  await apiFetch(`${DATA_ENDPOINTS.notifications}/${id}`, { method: 'DELETE' });
}
