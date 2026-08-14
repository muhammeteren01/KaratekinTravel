import { Platform } from 'react-native';
import { CURRENT_SCHEMA_VERSION } from '../data/migrations';

export const DATA_VERSION = CURRENT_SCHEMA_VERSION;

/** Android emulator → host machine; iOS simulator → localhost; override via .env */
const DEFAULT_API_BASE =
  Platform.OS === 'android' ? 'http://10.0.2.2:5076' : 'http://localhost:5076';

export const API_BASE_URL =
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_BASE_URL) ||
  DEFAULT_API_BASE;

export const USE_REMOTE_API =
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_USE_REMOTE_API) !== 'false';

export const DATA_ENDPOINTS = {
  bootstrap: `${API_BASE_URL}/api/bootstrap`,
  trips: `${API_BASE_URL}/api/trips`,
  companies: `${API_BASE_URL}/api/companies`,
  reservations: `${API_BASE_URL}/api/reservations`,
  reservationsMy: `${API_BASE_URL}/api/reservations/my`,
  reservationsPayment: `${API_BASE_URL}/api/reservations/payment`,
  reviews: `${API_BASE_URL}/api/reviews`,
  users: `${API_BASE_URL}/api/users`,
  authLogin: `${API_BASE_URL}/api/auth/login`,
  authRegister: `${API_BASE_URL}/api/auth/register`,
  authForgotPassword: `${API_BASE_URL}/api/auth/forgot-password`,
  authMe: `${API_BASE_URL}/api/auth/me`,
  savedTrips: `${API_BASE_URL}/api/saved-trips`,
  notifications: `${API_BASE_URL}/api/notifications`,
  chats: `${API_BASE_URL}/api/chats`,
  chatReports: `${API_BASE_URL}/api/chat-reports`,
  seatsAvailability: `${API_BASE_URL}/api/seats/availability`,
  couponsValidate: `${API_BASE_URL}/api/coupons/validate`,
};

export const AUTH_TOKEN_KEY = 'auth_token';
export const AUTH_USER_KEY = 'auth_currentUser';
// SecureStore keys: only alphanumeric, ".", "-", "_" (no ":")

export const CACHE_KEYS = {
  bootstrap: ['bootstrap', DATA_VERSION] as const,
  trips: ['trips', DATA_VERSION] as const,
  companies: ['companies', DATA_VERSION] as const,
  reservations: ['reservations', DATA_VERSION] as const,
  reviews: ['reviews', DATA_VERSION] as const,
  users: ['users', DATA_VERSION] as const,
  savedTrips: ['saved-trips', DATA_VERSION] as const,
  notifications: ['notifications', DATA_VERSION] as const,
};
