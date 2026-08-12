import { ApiError } from './apiError';
import { handleDemoRequest } from './demoServer';

const DEFAULT_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5076';

/**
 * Demo modu: .env dosyasında VITE_DEMO_MODE=true olduğunda tüm API çağrıları
 * ağa çıkmadan tarayıcı içindeki sahte sunucuya gider. Backend/veritabanı
 * kurmadan paneli gezmek ve tur ekleme/yönetme akışlarını denemek için.
 */
export const DEMO_MODE = String(import.meta.env.VITE_DEMO_MODE || '').toLowerCase() === 'true';

// ApiError artık ayrı modülde (demoServer da kullanıyor); eski import yolu
// bozulmasın diye buradan tekrar dışa veriliyor.
export { ApiError };

const ADMIN_TOKEN_KEY = 'travelAdminDashboard.apiToken';

/**
 * Panelin çağırdığı uçların çoğu API tarafında [Authorize(Roles = "Admin,CompanyAdmin")]
 * ile korunuyor. Bu iki rol dışındaki bir hesap panele girerse her ekran 403 döner,
 * bu yüzden girişi bu listeye göre kapatıyoruz.
 */
export const DASHBOARD_ROLES = ['Admin', 'CompanyAdmin'];

export function canAccessDashboard(role) {
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

export function setAdminToken(token) {
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

async function request(url, options = {}) {
  const { auth = true, headers, timeoutMs = 12000, signal, ...rest } = options;

  if (DEMO_MODE) {
    // Sahte sunucu senkron; gerçek istek gibi davranması için promise'e sarılıyor.
    return Promise.resolve().then(() => handleDemoRequest(url, rest.method || 'GET', rest.body));
  }

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
      return undefined;
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
        body?.message || (typeof body === 'string' ? body : `HTTP ${response.status}`);
      throw new ApiError(response.status, message, body);
    }

    return body;
  } catch (err) {
    if (err?.name === 'AbortError') {
      throw new ApiError(0, 'İstek zaman aşımına uğradı. API çalışıyor mu?', null);
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

function authOptions(overrides = {}) {
  return { ...overrides, auth: true };
}

function publicOptions(overrides = {}) {
  return { ...overrides, auth: false };
}

// Bootstrap
export function fetchBootstrapApi() {
  return request(API_ENDPOINTS.bootstrap, publicOptions());
}

// Auth
export function loginApi(email, password) {
  return request(API_ENDPOINTS.authLogin, publicOptions({
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }));
}

export function registerApi(payload) {
  return request(API_ENDPOINTS.authRegister, publicOptions({
    method: 'POST',
    body: JSON.stringify(payload),
  }));
}

export function forgotPasswordApi(email) {
  return request(API_ENDPOINTS.authForgotPassword, publicOptions({
    method: 'POST',
    body: JSON.stringify({ email }),
  }));
}

export function resetPasswordApi(payload) {
  return request(API_ENDPOINTS.authResetPassword, publicOptions({
    method: 'POST',
    body: JSON.stringify(payload),
  }));
}

export function fetchMeApi() {
  return request(API_ENDPOINTS.authMe, authOptions());
}

// Trips
export function fetchTripsApi() {
  return request(API_ENDPOINTS.trips, publicOptions());
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

export function fetchTripByIdApi(id) {
  return request(`${API_ENDPOINTS.trips}/${id}`, publicOptions());
}

export function createTripApi(payload) {
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
    }),
  }));
}

export function updateTripApi(id, payload) {
  return request(`${API_ENDPOINTS.trips}/${id}`, authOptions({
    method: 'PUT',
    body: JSON.stringify(payload),
  }));
}

export function deleteTripApi(id) {
  return request(`${API_ENDPOINTS.trips}/${id}`, authOptions({ method: 'DELETE' }));
}

// Companies
export function fetchCompaniesApi() {
  return request(API_ENDPOINTS.companies, publicOptions());
}

export function fetchCompanyByIdApi(id) {
  return request(`${API_ENDPOINTS.companies}/${id}`, publicOptions());
}

export function createCompanyApi(payload) {
  return request(API_ENDPOINTS.companies, authOptions({
    method: 'POST',
    body: JSON.stringify(payload),
  }));
}

export function updateCompanyApi(id, payload) {
  return request(`${API_ENDPOINTS.companies}/${id}`, authOptions({
    method: 'PUT',
    body: JSON.stringify(payload),
  }));
}

export function deleteCompanyApi(id) {
  return request(`${API_ENDPOINTS.companies}/${id}`, authOptions({ method: 'DELETE' }));
}

// Reservations
export function fetchReservationsApi() {
  return request(API_ENDPOINTS.reservations, authOptions());
}

export function fetchMyReservationsApi() {
  return request(`${API_ENDPOINTS.reservations}/my`, authOptions());
}

export function fetchReservationsByTripApi(tripId) {
  return request(`${API_ENDPOINTS.reservations}/by-trip/${tripId}`, authOptions());
}

export function fetchReservationByIdApi(id) {
  return request(`${API_ENDPOINTS.reservations}/${id}`, authOptions());
}

export function createReservationApi(payload) {
  return request(API_ENDPOINTS.reservations, authOptions({
    method: 'POST',
    body: JSON.stringify(payload),
  }));
}

export function updateReservationStatusApi(id, payload) {
  return request(`${API_ENDPOINTS.reservations}/${id}/status`, authOptions({
    method: 'PUT',
    body: JSON.stringify(payload),
  }));
}

export function processPaymentApi(payload) {
  return request(`${API_ENDPOINTS.reservations}/payment`, authOptions({
    method: 'POST',
    body: JSON.stringify(payload),
  }));
}

export function cancelReservationApi(id, reason = 'User cancelled') {
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

export function fetchReviewByIdApi(id) {
  return request(`${API_ENDPOINTS.reviews}/${id}`, publicOptions());
}

export function createReviewApi(payload) {
  return request(API_ENDPOINTS.reviews, authOptions({
    method: 'POST',
    body: JSON.stringify(payload),
  }));
}

export function deleteReviewApi(id) {
  return request(`${API_ENDPOINTS.reviews}/${id}`, authOptions({ method: 'DELETE' }));
}

// Users
export function fetchUsersApi() {
  return request(API_ENDPOINTS.users, authOptions());
}

export function fetchUserByIdApi(id) {
  return request(`${API_ENDPOINTS.users}/${id}`, authOptions());
}

export function updateUserProfileApi(userId, payload) {
  return request(`${API_ENDPOINTS.users}/${userId}`, authOptions({
    method: 'PUT',
    body: JSON.stringify(payload),
  }));
}

export function changePasswordApi(userId, payload) {
  return request(`${API_ENDPOINTS.users}/${userId}/change-password`, authOptions({
    method: 'PUT',
    body: JSON.stringify(payload),
  }));
}

// Saved trips
export function fetchSavedTripIdsApi() {
  return request(`${API_ENDPOINTS.savedTrips}/my`, authOptions());
}

export function saveTripApi(tripId) {
  return request(`${API_ENDPOINTS.savedTrips}/${tripId}`, authOptions({ method: 'POST' }));
}

export function unsaveTripApi(tripId) {
  return request(`${API_ENDPOINTS.savedTrips}/${tripId}`, authOptions({ method: 'DELETE' }));
}

// Chats
export function fetchMyChatsApi() {
  return request(`${API_ENDPOINTS.chats}/my`, authOptions());
}

export function fetchUserChatsApi(userId) {
  return request(`${API_ENDPOINTS.chats}/user/${userId}`, authOptions());
}

export function fetchChatApi(groupId) {
  return request(`${API_ENDPOINTS.chats}/${groupId}`, authOptions());
}

export function fetchChatMessagesApi(groupId, limit = 50) {
  return request(`${API_ENDPOINTS.chats}/${groupId}/messages?limit=${encodeURIComponent(limit)}`, authOptions());
}

export function createChatApi(payload) {
  return request(API_ENDPOINTS.chats, authOptions({
    method: 'POST',
    body: JSON.stringify(payload),
  }));
}

export function sendChatMessageApi(groupId, payload) {
  return request(`${API_ENDPOINTS.chats}/${groupId}/messages`, authOptions({
    method: 'POST',
    body: JSON.stringify(payload),
  }));
}

export function addChatMemberApi(groupId, payload) {
  return request(`${API_ENDPOINTS.chats}/${groupId}/members`, authOptions({
    method: 'POST',
    body: JSON.stringify(payload),
  }));
}

export function removeChatMemberApi(groupId, userId) {
  return request(`${API_ENDPOINTS.chats}/${groupId}/members/${userId}`, authOptions({
    method: 'DELETE',
  }));
}

// Notifications
export function fetchMyNotificationsApi() {
  return request(`${API_ENDPOINTS.notifications}/my`, authOptions());
}

export function markNotificationReadApi(id) {
  return request(`${API_ENDPOINTS.notifications}/${id}/read`, authOptions({ method: 'PUT' }));
}

export function archiveNotificationApi(id) {
  return request(`${API_ENDPOINTS.notifications}/${id}/archive`, authOptions({ method: 'PUT' }));
}

export function deleteNotificationApi(id) {
  return request(`${API_ENDPOINTS.notifications}/${id}`, authOptions({ method: 'DELETE' }));
}

export function createNotificationApi(payload) {
  return request(API_ENDPOINTS.notifications, authOptions({
    method: 'POST',
    body: JSON.stringify(payload),
  }));
}

// Hotels
export function fetchHotelsApi() {
  return request(API_ENDPOINTS.hotels, authOptions());
}

export function fetchHotelByIdApi(id) {
  return request(`${API_ENDPOINTS.hotels}/${id}`, authOptions());
}

export function createHotelApi(payload) {
  return request(API_ENDPOINTS.hotels, authOptions({
    method: 'POST',
    body: JSON.stringify(payload),
  }));
}

export function updateHotelApi(id, payload) {
  return request(`${API_ENDPOINTS.hotels}/${id}`, authOptions({
    method: 'PUT',
    body: JSON.stringify(payload),
  }));
}

export function deleteHotelApi(id) {
  return request(`${API_ENDPOINTS.hotels}/${id}`, authOptions({ method: 'DELETE' }));
}

// Gallery
export function fetchGalleryByTripApi(tripId) {
  return request(`${API_ENDPOINTS.gallery}?tripId=${encodeURIComponent(tripId)}`, publicOptions());
}

export function uploadGalleryImageApi(payload) {
  return request(API_ENDPOINTS.gallery, authOptions({
    method: 'POST',
    body: JSON.stringify(payload),
  }));
}

export function deleteGalleryImageApi(id) {
  return request(`${API_ENDPOINTS.gallery}/${id}`, authOptions({ method: 'DELETE' }));
}

// Coupons
export function fetchCouponsApi() {
  return request(API_ENDPOINTS.coupons, authOptions());
}

export function fetchCouponByIdApi(id) {
  return request(`${API_ENDPOINTS.coupons}/${id}`, authOptions());
}

export function createCouponApi(payload) {
  return request(API_ENDPOINTS.coupons, authOptions({
    method: 'POST',
    body: JSON.stringify(payload),
  }));
}

export function updateCouponApi(id, payload) {
  return request(`${API_ENDPOINTS.coupons}/${id}`, authOptions({
    method: 'PUT',
    body: JSON.stringify(payload),
  }));
}

export function deleteCouponApi(id) {
  return request(`${API_ENDPOINTS.coupons}/${id}`, authOptions({ method: 'DELETE' }));
}

export function validateCouponApi(payload) {
  return request(`${API_ENDPOINTS.coupons}/validate`, publicOptions({
    method: 'POST',
    body: JSON.stringify(payload),
  }));
}

// Reports
export function fetchTripReportApi(start, end) {
  const query = new URLSearchParams({ start, end });
  return request(`${API_ENDPOINTS.reports}/trips?${query.toString()}`, authOptions());
}

export function fetchCompanyReportApi(start = null, end = null) {
  const query = new URLSearchParams();
  if (start) query.set('start', start);
  if (end) query.set('end', end);
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return request(`${API_ENDPOINTS.reports}/companies${suffix}`, authOptions());
}

export function fetchFinanceReportApi(start, end, companyId = null) {
  const query = new URLSearchParams({ start, end });
  if (companyId) query.set('companyId', companyId);
  return request(`${API_ENDPOINTS.reports}/finance?${query.toString()}`, authOptions());
}

export function fetchUserActivityReportApi() {
  return request(`${API_ENDPOINTS.reports}/user-activity`, authOptions());
}

// Refunds
export function createRefundRequestApi(payload) {
  return request(API_ENDPOINTS.refunds, authOptions({
    method: 'POST',
    body: JSON.stringify(payload),
  }));
}

export function fetchRefundsApi() {
  return request(API_ENDPOINTS.refunds, authOptions());
}

export function updateRefundStatusApi(id, payload) {
  return request(`${API_ENDPOINTS.refunds}/${id}/status`, authOptions({
    method: 'PUT',
    body: JSON.stringify(payload),
  }));
}

// Review reports
export function fetchReviewReportsApi(status = null) {
  const suffix = status ? `?status=${encodeURIComponent(status)}` : '';
  return request(`${API_ENDPOINTS.reviewReports}${suffix}`, authOptions());
}

export function createReviewReportApi(payload) {
  return request(API_ENDPOINTS.reviewReports, authOptions({
    method: 'POST',
    body: JSON.stringify(payload),
  }));
}

export function updateReviewReportStatusApi(id, payload) {
  return request(`${API_ENDPOINTS.reviewReports}/${id}/status`, authOptions({
    method: 'PUT',
    body: JSON.stringify(payload),
  }));
}

// Vehicles
export function fetchVehiclesApi(companyId = null) {
  const suffix = companyId ? `?companyId=${encodeURIComponent(companyId)}` : '';
  return request(`${API_ENDPOINTS.vehicles}${suffix}`, authOptions());
}

export function fetchVehicleByIdApi(id) {
  return request(`${API_ENDPOINTS.vehicles}/${id}`, authOptions());
}

export function createVehicleApi(payload) {
  return request(API_ENDPOINTS.vehicles, authOptions({
    method: 'POST',
    body: JSON.stringify(payload),
  }));
}

export function updateVehicleApi(id, payload) {
  return request(`${API_ENDPOINTS.vehicles}/${id}`, authOptions({
    method: 'PUT',
    body: JSON.stringify(payload),
  }));
}

export function deleteVehicleApi(id) {
  return request(`${API_ENDPOINTS.vehicles}/${id}`, authOptions({ method: 'DELETE' }));
}

export function fetchVehicleLayoutsApi(companyId) {
  return request(`${API_ENDPOINTS.vehicles}/layouts?companyId=${encodeURIComponent(companyId)}`, authOptions());
}

export function createVehicleLayoutApi(payload) {
  return request(`${API_ENDPOINTS.vehicles}/layouts`, authOptions({
    method: 'POST',
    body: JSON.stringify(payload),
  }));
}

// Trip departures
export function fetchTripDeparturesApi(tripId) {
  return request(`${API_ENDPOINTS.tripDepartures}?tripId=${encodeURIComponent(tripId)}`, publicOptions());
}

export function fetchTripDepartureByIdApi(id) {
  return request(`${API_ENDPOINTS.tripDepartures}/${id}`, publicOptions());
}

export function createTripDepartureApi(payload) {
  return request(API_ENDPOINTS.tripDepartures, authOptions({
    method: 'POST',
    body: JSON.stringify(payload),
  }));
}

export function updateTripDepartureApi(id, payload) {
  return request(`${API_ENDPOINTS.tripDepartures}/${id}`, authOptions({
    method: 'PUT',
    body: JSON.stringify(payload),
  }));
}

export function deleteTripDepartureApi(id) {
  return request(`${API_ENDPOINTS.tripDepartures}/${id}`, authOptions({ method: 'DELETE' }));
}

// Seats
export function fetchSeatAvailabilityApi({ departureId = null, tripId = null } = {}) {
  const query = new URLSearchParams();
  if (departureId) query.set('departureId', departureId);
  if (tripId) query.set('tripId', tripId);
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return request(`${API_ENDPOINTS.seats}/availability${suffix}`, publicOptions());
}

// Company reviews
export function fetchCompanyReviewsApi(companyId) {
  return request(`${API_ENDPOINTS.companyReviews}?companyId=${encodeURIComponent(companyId)}`, publicOptions());
}

export function createCompanyReviewApi(payload) {
  return request(API_ENDPOINTS.companyReviews, authOptions({
    method: 'POST',
    body: JSON.stringify(payload),
  }));
}

// Calendar trips
export function fetchCalendarTripsApi(userId = null) {
  const suffix = userId ? `?userId=${encodeURIComponent(userId)}` : '';
  return request(`${API_ENDPOINTS.calendarTrips}${suffix}`, authOptions());
}

export function createCalendarTripApi(payload) {
  return request(API_ENDPOINTS.calendarTrips, authOptions({
    method: 'POST',
    body: JSON.stringify(payload),
  }));
}