import * as SecureStore from 'expo-secure-store';
import { AUTH_TOKEN_KEY } from '../../config/dataConfig';

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

export async function getAccessToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setAccessToken(token: string | null): Promise<void> {
  if (token) await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
  else await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
}

type FetchOptions = RequestInit & { auth?: boolean };

export async function apiFetch<T = unknown>(
  url: string,
  options: FetchOptions = {},
): Promise<T> {
  const { auth = true, headers, ...rest } = options;
  const token = auth ? await getAccessToken() : null;

  const res = await fetch(url, {
    ...rest,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!res.ok) {
    const message =
      (body as any)?.message ||
      (typeof body === 'string' ? body : `HTTP ${res.status} for ${url}`);
    throw new ApiError(res.status, message, body);
  }

  return body as T;
}

export function ensureIsoDate(value: unknown): string {
  if (value == null) return new Date().toISOString();
  const d = new Date(value as any);
  if (Number.isNaN(d.getTime())) return new Date().toISOString();
  return d.toISOString();
}

export function mapAuthUser(raw: any) {
  const avatarRaw = raw.avatar ?? raw.Avatar;
  const phone = raw.phone ?? raw.Phone;
  const location = raw.location ?? raw.Location;
  const companyId = raw.companyId ?? raw.CompanyId;
  return {
    id: String(raw.id ?? raw.Id),
    name: String(raw.name ?? raw.Name ?? ''),
    email: String(raw.email ?? raw.Email ?? ''),
    phone: phone ? String(phone) : undefined,
    location: location ? String(location) : undefined,
    avatar: avatarRaw && String(avatarRaw).trim() !== '' ? String(avatarRaw) : undefined,
    role: raw.role ?? raw.Role ?? undefined,
    companyId: companyId != null && companyId !== '' ? String(companyId) : undefined,
  };
}
