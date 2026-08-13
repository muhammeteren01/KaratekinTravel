import type { components } from '../types/api';

/**
 * Uç gövdeleri üretilen şemadan geliyor. Elle yazılmış bir ayna değil:
 * .NET tarafında DTO değişince bu tipler de değişir ve panel derlenmez.
 */
type Schemas = components['schemas'];
type CreateTripPayload = Schemas['Trip_CreateTripDto'];
type UpdateTripPayload = Schemas['Trip_UpdateTripDto'];
type UpdateUserPayload = Schemas['User_UpdateUserDto'];
type ChangePasswordPayload = Schemas['User_ChangePasswordDto'];
type UpdateCompanyPayload = Schemas['Company_UpdateCompanyDto'];
type CreateBankChangeRequestPayload = Schemas['Company_CreateBankChangeRequestDto'];

type User = Schemas['ResponseDto_UserResponseDto'];
type Company = Schemas['ResponseDto_CompanyResponseDto'];
type Trip = Schemas['ResponseDto_TripResponseDto'];
type CompanyBankInfo = Schemas['Company_CompanyBankInfoDto'];
type BankChangeRequest = Schemas['Company_BankChangeRequestDto'];
type NotificationItem = Schemas['Notification_NotificationDto'];
type Payment = Schemas['Payment_PaymentDto'];

const DEFAULT_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5076';

const ADMIN_TOKEN_KEY = 'travelAdminDashboard.apiToken';

/**
 * Panelin çağırdığı uçların çoğu API tarafında [Authorize(Roles = "Admin,CompanyAdmin")]
 * ile korunuyor. Bu iki rol dışındaki bir hesap panele girerse her ekran 403 döner,
 * bu yüzden girişi bu listeye göre kapatıyoruz.
 */
export const DASHBOARD_ROLES = ['Admin', 'CompanyAdmin'];

export function canAccessDashboard(role: string) {
  return DASHBOARD_ROLES.some(
    (allowed) => allowed.toLowerCase() === String(role || '').toLowerCase(),
  );
}

export const API_ENDPOINTS = {
  bootstrap: `${DEFAULT_API_BASE_URL}/api/bootstrap`,
  authLogin: `${DEFAULT_API_BASE_URL}/api/auth/login`,
  authRegister: `${DEFAULT_API_BASE_URL}/api/auth/register`,
  authForgotPassword: `${DEFAULT_API_BASE_URL}/api/auth/forgot-password`,
  authResetPassword: `${DEFAULT_API_BASE_URL}/api/auth/reset-password`,
  authMe: `${DEFAULT_API_BASE_URL}/api/auth/me`,
  trips: `${DEFAULT_API_BASE_URL}/api/trips`,
  companies: `${DEFAULT_API_BASE_URL}/api/companies`,
  reservations: `${DEFAULT_API_BASE_URL}/api/reservations`,
  reviews: `${DEFAULT_API_BASE_URL}/api/reviews`,
  users: `${DEFAULT_API_BASE_URL}/api/users`,
  savedTrips: `${DEFAULT_API_BASE_URL}/api/saved-trips`,
  chats: `${DEFAULT_API_BASE_URL}/api/chats`,
  notifications: `${DEFAULT_API_BASE_URL}/api/notifications`,
  hotels: `${DEFAULT_API_BASE_URL}/api/hotels`,
  gallery: `${DEFAULT_API_BASE_URL}/api/gallery`,
  coupons: `${DEFAULT_API_BASE_URL}/api/coupons`,
  reports: `${DEFAULT_API_BASE_URL}/api/reports`,
  refunds: `${DEFAULT_API_BASE_URL}/api/refunds`,
  reviewReports: `${DEFAULT_API_BASE_URL}/api/review-reports`,
  vehicles: `${DEFAULT_API_BASE_URL}/api/vehicles`,
  vehicleOperations: `${DEFAULT_API_BASE_URL}/api/vehicle-operations`,
  bankChangeRequests: `${DEFAULT_API_BASE_URL}/api/bank-change-requests`,
  payments: `${DEFAULT_API_BASE_URL}/api/payments`,
  tripDepartures: `${DEFAULT_API_BASE_URL}/api/trip-departures`,
  seats: `${DEFAULT_API_BASE_URL}/api/seats`,
  companyReviews: `${DEFAULT_API_BASE_URL}/api/company-reviews`,
  calendarTrips: `${DEFAULT_API_BASE_URL}/api/calendar-trips`,
};

export function getAdminToken() {
  try {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAdminToken(token: string | null) {
  try {
    const normalized = token?.trim();
    if (normalized) {
      localStorage.setItem(ADMIN_TOKEN_KEY, normalized);
    } else {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
    }
  } catch {
    // Ignore storage failures in constrained environments.
  }
}

export function clearAdminToken() {
  setAdminToken(null);
  try {
    localStorage.removeItem('travelAdminDashboard.authMode');
    localStorage.removeItem('travelAdminDashboard.companyName');
  } catch {
    // Ignore storage failures in constrained environments.
  }
}

export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

/** request() seçenekleri: fetch'in kendi seçenekleri + panelin eklediği alanlar. */
export interface RequestOptions extends Omit<RequestInit, 'signal'> {
  /** false ise Authorization başlığı eklenmez. */
  auth?: boolean;
  /** Varsayılan 12 saniye. */
  timeoutMs?: number;
  signal?: AbortSignal | null;
}

async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { auth = true, headers, timeoutMs = 12000, signal, ...rest } = options;

  const token = auth ? getAdminToken() : null;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  try {
    const response = await fetch(url, {
      ...rest,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    });

    if (response.status === 204) {
      // İçerik yok; çağıran taraf void ya da undefined bekliyor.
      return undefined as T;
    }

    const text = await response.text();
    let body = null;

    if (text) {
      try {
        body = JSON.parse(text);
      } catch {
        body = text;
      }
    }

    if (!response.ok) {
      const message =
        (body as { message?: string } | null)?.message || (typeof body === 'string' ? body : `HTTP ${response.status}`);
      throw new ApiError(response.status, message, body);
    }

    return body as T;
  } catch (err) {
    // Ördek tipi kontrol bilinçli: fetch iptalinde atılan DOMException her
    // çalışma ortamında Error'dan türemiyor. `err instanceof Error` yazmak
    // tipi memnun ederdi ama zaman aşımı mesajını bazı ortamlarda kaçırırdı.
    if ((err as { name?: string } | null)?.name === 'AbortError') {
      throw new ApiError(0, 'İstek zaman aşımına uğradı. API çalışıyor mu?', null);
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

function authOptions(overrides: RequestOptions = {}): RequestOptions {
  return { ...overrides, auth: true };
}

function publicOptions(overrides: RequestOptions = {}): RequestOptions {
  return { ...overrides, auth: false };
}

// Bootstrap
export function fetchBootstrapApi() {
  return request(API_ENDPOINTS.bootstrap, publicOptions());
}

// Auth
export function loginApi(email: string, password: string) {
  return request(API_ENDPOINTS.authLogin, publicOptions({
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }));
}

export function registerApi(payload: unknown) {
  return request(API_ENDPOINTS.authRegister, publicOptions({
    method: 'POST',
    body: JSON.stringify(payload),
  }));
}

export function forgotPasswordApi(email: string) {
  return request(API_ENDPOINTS.authForgotPassword, publicOptions({
    method: 'POST',
    body: JSON.stringify({ email }),
  }));
}

export function resetPasswordApi(payload: unknown) {
  return request(API_ENDPOINTS.authResetPassword, publicOptions({
    method: 'POST',
    body: JSON.stringify(payload),
  }));
}

export function fetchMeApi() {
  return request<User>(API_ENDPOINTS.authMe, authOptions());
}

// Trips
/**
 * Herkese açık katalog: yalnızca yayındaki turlar.
 * Panel listeleri için fetchManagedTripsApi kullanın.
 */
export function fetchTripsApi() {
  return request(API_ENDPOINTS.trips, publicOptions());
}

/**
 * Panel listesi: oturum açan hesabın şirketine ait turlar, taslaklar dahil.
 * Şirket kapsamını API token'daki companyId claim'inden çözüyor.
 */
export function fetchManagedTripsApi() {
  return request<Trip[]>(`${API_ENDPOINTS.trips}/manage`, authOptions());
}

export function searchTripsApi(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value));
    }
  });
  const url = query.toString() ? `${API_ENDPOINTS.trips}/search?${query.toString()}` : `${API_ENDPOINTS.trips}/search`;
  return request(url, publicOptions());
}

export function fetchTripByIdApi(id: string) {
  return request<Trip>(`${API_ENDPOINTS.trips}/${id}`, publicOptions());
}

export function createTripApi(payload: CreateTripPayload) {
  return request(API_ENDPOINTS.trips, authOptions({
    method: 'POST',
    body: JSON.stringify({
      companyId: payload.companyId,
      title: payload.title,
      location: payload.location ?? null,
      city: payload.city ?? null,
      region: payload.region ?? null,
      dateStart: payload.dateStart ?? null,
      dateEnd: payload.dateEnd ?? null,
      capacity: payload.capacity,
      image: payload.image ?? null,
      headerImage: payload.headerImage ?? null,
      description: payload.description ?? null,
      isFeatured: payload.isFeatured ?? false,
      isPublished: payload.isPublished ?? false,
      pricing: payload.pricing ?? null,
      // Tur içeriği: güzergâh, dahil/hariç olanlar, oteller, iptal politikası.
      details: payload.details ?? null,
      policy: payload.policy ?? null,
      itinerary: payload.itinerary ?? null,
      hotels: payload.hotels ?? null,
    }),
  }));
}

export function updateTripApi(id: string, payload: UpdateTripPayload) {
  return request<Trip>(`${API_ENDPOINTS.trips}/${id}`, authOptions({
    method: 'PUT',
    body: JSON.stringify(payload),
  }));
}

export function deleteTripApi(id: string) {
  return request(`${API_ENDPOINTS.trips}/${id}`, authOptions({ method: 'DELETE' }));
}

// Companies
export function fetchCompaniesApi() {
  return request(API_ENDPOINTS.companies, publicOptions());
}

export function fetchCompanyByIdApi(id: string) {
  return request<Company>(`${API_ENDPOINTS.companies}/${id}`, publicOptions());
}

export function createCompanyApi(payload: unknown) {
  return request(API_ENDPOINTS.companies, authOptions({
    method: 'POST',
    body: JSON.stringify(payload),
  }));
}

export function updateCompanyApi(id: string, payload: UpdateCompanyPayload) {
  return request<Company>(`${API_ENDPOINTS.companies}/${id}`, authOptions({
    method: 'PUT',
    body: JSON.stringify(payload),
  }));
}

export function deleteCompanyApi(id: string) {
  return request(`${API_ENDPOINTS.companies}/${id}`, authOptions({ method: 'DELETE' }));
}

// Reservations
export function fetchReservationsApi() {
  return request(API_ENDPOINTS.reservations, authOptions());
}

export function fetchMyReservationsApi() {
  return request(`${API_ENDPOINTS.reservations}/my`, authOptions());
}

export function fetchReservationsByTripApi(tripId: string) {
  return request(`${API_ENDPOINTS.reservations}/by-trip/${tripId}`, authOptions());
}

export function fetchReservationByIdApi(id: string) {
  return request(`${API_ENDPOINTS.reservations}/${id}`, authOptions());
}

export function createReservationApi(payload: unknown) {
  return request(API_ENDPOINTS.reservations, authOptions({
    method: 'POST',
    body: JSON.stringify(payload),
  }));
}

export function updateReservationStatusApi(id: string, payload: unknown) {
  return request(`${API_ENDPOINTS.reservations}/${id}/status`, authOptions({
    method: 'PUT',
    body: JSON.stringify(payload),
  }));
}

export function processPaymentApi(payload: unknown) {
  return request(`${API_ENDPOINTS.reservations}/payment`, authOptions({
    method: 'POST',
    body: JSON.stringify(payload),
  }));
}

export function cancelReservationApi(id: string, reason = 'User cancelled') {
  const query = new URLSearchParams({ reason });
  return request(`${API_ENDPOINTS.reservations}/${id}?${query.toString()}`, authOptions({
    method: 'DELETE',
  }));
}

// Reviews
export function fetchReviewsApi(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value));
    }
  });
  const url = query.toString() ? `${API_ENDPOINTS.reviews}?${query.toString()}` : API_ENDPOINTS.reviews;
  return request(url, publicOptions());
}

export function fetchReviewByIdApi(id: string) {
  return request(`${API_ENDPOINTS.reviews}/${id}`, publicOptions());
}

export function createReviewApi(payload: unknown) {
  return request(API_ENDPOINTS.reviews, authOptions({
    method: 'POST',
    body: JSON.stringify(payload),
  }));
}

export function deleteReviewApi(id: string) {
  return request(`${API_ENDPOINTS.reviews}/${id}`, authOptions({ method: 'DELETE' }));
}

// Users
export function fetchUsersApi() {
  return request(API_ENDPOINTS.users, authOptions());
}

export function fetchUserByIdApi(id: string) {
  return request(`${API_ENDPOINTS.users}/${id}`, authOptions());
}

export function updateUserProfileApi(userId: string, payload: UpdateUserPayload) {
  return request<User>(`${API_ENDPOINTS.users}/${userId}`, authOptions({
    method: 'PUT',
    body: JSON.stringify(payload),
  }));
}

export function changePasswordApi(userId: string, payload: ChangePasswordPayload) {
  return request(`${API_ENDPOINTS.users}/${userId}/change-password`, authOptions({
    method: 'PUT',
    body: JSON.stringify(payload),
  }));
}

// Saved trips
export function fetchSavedTripIdsApi() {
  return request(`${API_ENDPOINTS.savedTrips}/my`, authOptions());
}

export function saveTripApi(tripId: string) {
  return request(`${API_ENDPOINTS.savedTrips}/${tripId}`, authOptions({ method: 'POST' }));
}

export function unsaveTripApi(tripId: string) {
  return request(`${API_ENDPOINTS.savedTrips}/${tripId}`, authOptions({ method: 'DELETE' }));
}

// Chats
export function fetchMyChatsApi() {
  return request(`${API_ENDPOINTS.chats}/my`, authOptions());
}

export function fetchUserChatsApi(userId: string) {
  return request(`${API_ENDPOINTS.chats}/user/${userId}`, authOptions());
}

export function fetchChatApi(groupId: string) {
  return request(`${API_ENDPOINTS.chats}/${groupId}`, authOptions());
}

export function fetchChatMessagesApi(groupId: string, limit = 50) {
  return request(`${API_ENDPOINTS.chats}/${groupId}/messages?limit=${encodeURIComponent(limit)}`, authOptions());
}

export function createChatApi(payload: unknown) {
  return request(API_ENDPOINTS.chats, authOptions({
    method: 'POST',
    body: JSON.stringify(payload),
  }));
}

export function sendChatMessageApi(groupId: string, payload: unknown) {
  return request(`${API_ENDPOINTS.chats}/${groupId}/messages`, authOptions({
    method: 'POST',
    body: JSON.stringify(payload),
  }));
}

export function addChatMemberApi(groupId: string, payload: unknown) {
  return request(`${API_ENDPOINTS.chats}/${groupId}/members`, authOptions({
    method: 'POST',
    body: JSON.stringify(payload),
  }));
}

export function removeChatMemberApi(groupId: string, userId: string) {
  return request(`${API_ENDPOINTS.chats}/${groupId}/members/${userId}`, authOptions({
    method: 'DELETE',
  }));
}

// Notifications
export function fetchMyNotificationsApi() {
  return request<NotificationItem[]>(`${API_ENDPOINTS.notifications}/my`, authOptions());
}

export function markNotificationReadApi(id: string) {
  return request(`${API_ENDPOINTS.notifications}/${id}/read`, authOptions({ method: 'PUT' }));
}

export function archiveNotificationApi(id: string) {
  return request(`${API_ENDPOINTS.notifications}/${id}/archive`, authOptions({ method: 'PUT' }));
}

export function deleteNotificationApi(id: string) {
  return request(`${API_ENDPOINTS.notifications}/${id}`, authOptions({ method: 'DELETE' }));
}

export function createNotificationApi(payload: unknown) {
  return request(API_ENDPOINTS.notifications, authOptions({
    method: 'POST',
    body: JSON.stringify(payload),
  }));
}

// Hotels
export function fetchHotelsApi() {
  return request(API_ENDPOINTS.hotels, authOptions());
}

export function fetchHotelByIdApi(id: string) {
  return request(`${API_ENDPOINTS.hotels}/${id}`, authOptions());
}

export function createHotelApi(payload: unknown) {
  return request(API_ENDPOINTS.hotels, authOptions({
    method: 'POST',
    body: JSON.stringify(payload),
  }));
}

export function updateHotelApi(id: string, payload: unknown) {
  return request(`${API_ENDPOINTS.hotels}/${id}`, authOptions({
    method: 'PUT',
    body: JSON.stringify(payload),
  }));
}

export function deleteHotelApi(id: string) {
  return request(`${API_ENDPOINTS.hotels}/${id}`, authOptions({ method: 'DELETE' }));
}

// Gallery
export function fetchGalleryByTripApi(tripId: string) {
  return request(`${API_ENDPOINTS.gallery}?tripId=${encodeURIComponent(tripId)}`, publicOptions());
}

export function uploadGalleryImageApi(payload: unknown) {
  return request(API_ENDPOINTS.gallery, authOptions({
    method: 'POST',
    body: JSON.stringify(payload),
  }));
}

export function deleteGalleryImageApi(id: string) {
  return request(`${API_ENDPOINTS.gallery}/${id}`, authOptions({ method: 'DELETE' }));
}

// Coupons
export function fetchCouponsApi() {
  return request(API_ENDPOINTS.coupons, authOptions());
}

export function fetchCouponByIdApi(id: string) {
  return request(`${API_ENDPOINTS.coupons}/${id}`, authOptions());
}

export function createCouponApi(payload: unknown) {
  return request(API_ENDPOINTS.coupons, authOptions({
    method: 'POST',
    body: JSON.stringify(payload),
  }));
}

export function updateCouponApi(id: string, payload: unknown) {
  return request(`${API_ENDPOINTS.coupons}/${id}`, authOptions({
    method: 'PUT',
    body: JSON.stringify(payload),
  }));
}

export function deleteCouponApi(id: string) {
  return request(`${API_ENDPOINTS.coupons}/${id}`, authOptions({ method: 'DELETE' }));
}

export function validateCouponApi(payload: unknown) {
  return request(`${API_ENDPOINTS.coupons}/validate`, publicOptions({
    method: 'POST',
    body: JSON.stringify(payload),
  }));
}

// Reports
export function fetchTripReportApi(start: string, end: string) {
  const query = new URLSearchParams({ start, end });
  return request(`${API_ENDPOINTS.reports}/trips?${query.toString()}`, authOptions());
}

export function fetchCompanyReportApi(start: string | null = null, end: string | null = null) {
  const query = new URLSearchParams();
  if (start) query.set('start', start);
  if (end) query.set('end', end);
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return request(`${API_ENDPOINTS.reports}/companies${suffix}`, authOptions());
}

export function fetchFinanceReportApi(start: string, end: string, companyId: string | null = null) {
  const query = new URLSearchParams({ start, end });
  if (companyId) query.set('companyId', companyId);
  return request(`${API_ENDPOINTS.reports}/finance?${query.toString()}`, authOptions());
}

export function fetchUserActivityReportApi() {
  return request(`${API_ENDPOINTS.reports}/user-activity`, authOptions());
}

// Refunds
export function createRefundRequestApi(payload: unknown) {
  return request(API_ENDPOINTS.refunds, authOptions({
    method: 'POST',
    body: JSON.stringify(payload),
  }));
}

export function fetchRefundsApi() {
  return request(API_ENDPOINTS.refunds, authOptions());
}

export function updateRefundStatusApi(id: string, payload: unknown) {
  return request(`${API_ENDPOINTS.refunds}/${id}/status`, authOptions({
    method: 'PUT',
    body: JSON.stringify(payload),
  }));
}

// Review reports
export function fetchReviewReportsApi(status: string | null = null) {
  const suffix = status ? `?status=${encodeURIComponent(status)}` : '';
  return request(`${API_ENDPOINTS.reviewReports}${suffix}`, authOptions());
}

export function createReviewReportApi(payload: unknown) {
  return request(API_ENDPOINTS.reviewReports, authOptions({
    method: 'POST',
    body: JSON.stringify(payload),
  }));
}

export function updateReviewReportStatusApi(id: string, payload: unknown) {
  return request(`${API_ENDPOINTS.reviewReports}/${id}/status`, authOptions({
    method: 'PUT',
    body: JSON.stringify(payload),
  }));
}

// Vehicles
export function fetchVehiclesApi(companyId: string | null = null) {
  const suffix = companyId ? `?companyId=${encodeURIComponent(companyId)}` : '';
  return request(`${API_ENDPOINTS.vehicles}${suffix}`, authOptions());
}

export function fetchVehicleByIdApi(id: string) {
  return request(`${API_ENDPOINTS.vehicles}/${id}`, authOptions());
}

export function createVehicleApi(payload: unknown) {
  return request(API_ENDPOINTS.vehicles, authOptions({
    method: 'POST',
    body: JSON.stringify(payload),
  }));
}

export function updateVehicleApi(id: string, payload: unknown) {
  return request(`${API_ENDPOINTS.vehicles}/${id}`, authOptions({
    method: 'PUT',
    body: JSON.stringify(payload),
  }));
}

export function deleteVehicleApi(id: string) {
  return request(`${API_ENDPOINTS.vehicles}/${id}`, authOptions({ method: 'DELETE' }));
}

export function fetchVehicleLayoutsApi(companyId: string) {
  return request(`${API_ENDPOINTS.vehicles}/layouts?companyId=${encodeURIComponent(companyId)}`, authOptions());
}

export function createVehicleLayoutApi(payload: unknown) {
  return request(`${API_ENDPOINTS.vehicles}/layouts`, authOptions({
    method: 'POST',
    body: JSON.stringify(payload),
  }));
}

// Banka / tahsilat bilgisi değişiklik talepleri
export function fetchCompanyBankInfoApi(companyId: string | null = null) {
  const suffix = companyId ? `?companyId=${encodeURIComponent(companyId)}` : '';
  return request<CompanyBankInfo>(`${API_ENDPOINTS.bankChangeRequests}/current${suffix}`, authOptions());
}

export function fetchBankChangeRequestsApi(status: string | null = null) {
  const suffix = status ? `?status=${encodeURIComponent(status)}` : '';
  return request(`${API_ENDPOINTS.bankChangeRequests}${suffix}`, authOptions());
}

export function createBankChangeRequestApi(payload: CreateBankChangeRequestPayload) {
  return request<BankChangeRequest>(API_ENDPOINTS.bankChangeRequests, authOptions({
    method: 'POST',
    body: JSON.stringify(payload),
  }));
}

// Vehicle operations (araç işlem geçmişi)
export function fetchVehicleOperationsApi({
  companyId = null,
  vehicleId = null,
  operationType = null,
}: {
  companyId?: string | null;
  vehicleId?: string | null;
  operationType?: string | null;
} = {}) {
  const query = new URLSearchParams();
  if (companyId) query.set('companyId', companyId);
  if (vehicleId) query.set('vehicleId', vehicleId);
  if (operationType && operationType !== 'Tümü') query.set('operationType', operationType);
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return request(`${API_ENDPOINTS.vehicleOperations}${suffix}`, authOptions());
}

export function createVehicleOperationApi(payload: unknown) {
  return request(API_ENDPOINTS.vehicleOperations, authOptions({
    method: 'POST',
    body: JSON.stringify(payload),
  }));
}

export function deleteVehicleOperationApi(id: string) {
  return request(`${API_ENDPOINTS.vehicleOperations}/${id}`, authOptions({ method: 'DELETE' }));
}

// Payments
export function fetchPaymentsApi(companyId: string, status: string | null = null) {
  const query = new URLSearchParams({ companyId });
  if (status) query.set('status', status);
  return request<Payment[]>(`${API_ENDPOINTS.payments}?${query.toString()}`, authOptions());
}

// Trip departures
export function fetchTripDeparturesApi(tripId: string) {
  return request(`${API_ENDPOINTS.tripDepartures}?tripId=${encodeURIComponent(tripId)}`, publicOptions());
}

export function fetchTripDepartureByIdApi(id: string) {
  return request(`${API_ENDPOINTS.tripDepartures}/${id}`, publicOptions());
}

export function createTripDepartureApi(payload: unknown) {
  return request(API_ENDPOINTS.tripDepartures, authOptions({
    method: 'POST',
    body: JSON.stringify(payload),
  }));
}

export function updateTripDepartureApi(id: string, payload: unknown) {
  return request(`${API_ENDPOINTS.tripDepartures}/${id}`, authOptions({
    method: 'PUT',
    body: JSON.stringify(payload),
  }));
}

export function deleteTripDepartureApi(id: string) {
  return request(`${API_ENDPOINTS.tripDepartures}/${id}`, authOptions({ method: 'DELETE' }));
}

// Seats
export function fetchSeatAvailabilityApi({
  departureId = null,
  tripId = null,
}: { departureId?: string | null; tripId?: string | null } = {}) {
  const query = new URLSearchParams();
  if (departureId) query.set('departureId', departureId);
  if (tripId) query.set('tripId', tripId);
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return request(`${API_ENDPOINTS.seats}/availability${suffix}`, publicOptions());
}

// Company reviews
export function fetchCompanyReviewsApi(companyId: string) {
  return request(`${API_ENDPOINTS.companyReviews}?companyId=${encodeURIComponent(companyId)}`, publicOptions());
}

export function createCompanyReviewApi(payload: unknown) {
  return request(API_ENDPOINTS.companyReviews, authOptions({
    method: 'POST',
    body: JSON.stringify(payload),
  }));
}

// Calendar trips
export function fetchCalendarTripsApi(userId: string | null = null) {
  const suffix = userId ? `?userId=${encodeURIComponent(userId)}` : '';
  return request(`${API_ENDPOINTS.calendarTrips}${suffix}`, authOptions());
}

export function createCalendarTripApi(payload: unknown) {
  return request(API_ENDPOINTS.calendarTrips, authOptions({
    method: 'POST',
    body: JSON.stringify(payload),
  }));
}