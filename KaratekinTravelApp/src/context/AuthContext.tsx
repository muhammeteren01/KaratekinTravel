import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { queryClient } from '@/core/data/client';
import { QUERY_PERSIST_KEY } from '@/core/data/persister';
import type { User } from '@/core/data/schemas';
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from '@/core/config/dataConfig';
import { setAccessToken } from '@/core/data/api/http';
import { updateUserProfileApi } from '@/core/data/api';

export interface AuthContextValue {
  currentUser: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (changes: Partial<User>) => Promise<void>;
  isHydrating: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [rawUser, rawToken] = await Promise.all([
          SecureStore.getItemAsync(AUTH_USER_KEY),
          SecureStore.getItemAsync(AUTH_TOKEN_KEY),
        ]);
        if (rawUser) setCurrentUser(JSON.parse(rawUser) as User);
        if (rawToken) setToken(rawToken);
      } catch {
        // treat as logged out
      } finally {
        setIsHydrating(false);
      }
    })();
  }, []);

  const login = useCallback(async (user: User, accessToken: string) => {
    setCurrentUser(user);
    setToken(accessToken);
    await Promise.all([
      SecureStore.setItemAsync(AUTH_USER_KEY, JSON.stringify(user)),
      setAccessToken(accessToken),
    ]);
  }, []);

  const logout = useCallback(async () => {
    const uid = String(currentUser?.id || 'anon');
    setCurrentUser(null);
    setToken(null);
    await Promise.all([
      SecureStore.deleteItemAsync(AUTH_USER_KEY),
      setAccessToken(null),
    ]);
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(`userState_savedTrips_${uid}`),
        SecureStore.deleteItemAsync(`userState_purchasedTrips_${uid}`),
      ]);
    } catch {}
    try {
      await queryClient.clear();
    } catch {}
    try {
      await AsyncStorage.removeItem(QUERY_PERSIST_KEY);
    } catch {}
  }, [currentUser?.id]);

  const updateProfile = useCallback(async (changes: Partial<User>) => {
    const merged = currentUser ? { ...currentUser, ...changes } : (changes as User);
    setCurrentUser(merged);
    await SecureStore.setItemAsync(AUTH_USER_KEY, JSON.stringify(merged));

    if (merged?.id) {
      try {
        const updated = await updateUserProfileApi(String(merged.id), {
          name: merged.name,
          email: merged.email,
          phone: merged.phone,
          location: merged.location,
          avatar: typeof merged.avatar === 'string' ? merged.avatar : undefined,
        });
        setCurrentUser(updated);
        await SecureStore.setItemAsync(AUTH_USER_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('[auth] profile sync failed', e);
      }
    }
  }, [currentUser]);

  const value = useMemo<AuthContextValue>(
    () => ({
      currentUser,
      token,
      isAuthenticated: !!currentUser && !!token,
      login,
      logout,
      updateProfile,
      isHydrating,
    }),
    [currentUser, token, login, logout, updateProfile, isHydrating],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
