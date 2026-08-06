import * as SecureStore from 'expo-secure-store';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useSupportingData, useToggleSavedTrip, useSavedTripIds } from '@/core/data/store';
import { useAuth } from './AuthContext';
import { USE_REMOTE_API } from '@/core/config/dataConfig';

const KEY_SAVED = 'userState_savedTrips';
const KEY_PURCHASED = 'userState_purchasedTrips';

export function useSavedTripsState() {
  const { currentUser, isAuthenticated } = useAuth();
  const { data: supporting } = useSupportingData();
  const remoteQuery = useSavedTripIds(!!isAuthenticated);
  const toggleMutation = useToggleSavedTrip();

  const seedIds = useMemo(() => {
    const entry = supporting?.userState?.find(
      (u: any) => String(u.userId) === String(currentUser?.id),
    );
    return (entry?.savedTripIds || []).map(String);
  }, [supporting?.userState, currentUser?.id]);

  const storageKey = useMemo(
    () => `${KEY_SAVED}_${String(currentUser?.id || 'anon')}`,
    [currentUser?.id],
  );
  const [localIds, setLocalIds] = useState<string[]>(seedIds);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await SecureStore.getItemAsync(storageKey);
        if (raw) setLocalIds(JSON.parse(raw));
      } finally {
        setHydrated(true);
      }
    })();
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated || USE_REMOTE_API) return;
    SecureStore.setItemAsync(storageKey, JSON.stringify(localIds)).catch(() => {});
  }, [storageKey, localIds, hydrated]);

  const savedIds = useMemo(() => {
    if (USE_REMOTE_API && isAuthenticated && remoteQuery.data) {
      return remoteQuery.data.map(String);
    }
    return localIds;
  }, [USE_REMOTE_API, isAuthenticated, remoteQuery.data, localIds]);

  const toggle = useCallback(
    (tripId: string | number) => {
      const id = String(tripId);
      const currentlySaved = savedIds.includes(id);

      setLocalIds((prev: string[]) =>
        currentlySaved ? prev.filter((x: string) => x !== id) : [...prev, id],
      );

      if (USE_REMOTE_API && isAuthenticated) {
        toggleMutation.mutate({ tripId: id, currentlySaved });
      }
    },
    [savedIds, isAuthenticated, toggleMutation],
  );

  const isSaved = useCallback(
    (tripId: string | number) => savedIds.includes(String(tripId)),
    [savedIds],
  );

  return { savedIds, isSaved, toggle, hydrated };
}

export function usePurchasedTripsState() {
  const { currentUser } = useAuth();
  const { data: supporting } = useSupportingData();
  const seedIds = useMemo(() => {
    const entry = supporting?.userState?.find(
      (u: any) => String(u.userId) === String(currentUser?.id),
    );
    return (entry?.purchasedTripIds || []).map(String);
  }, [supporting?.userState, currentUser?.id]);

  const storageKey = useMemo(
    () => `${KEY_PURCHASED}_${String(currentUser?.id || 'anon')}`,
    [currentUser?.id],
  );
  const [purchasedIds, setPurchasedIds] = useState<string[]>(seedIds);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await SecureStore.getItemAsync(storageKey);
        if (raw) setPurchasedIds(JSON.parse(raw));
      } finally {
        setHydrated(true);
      }
    })();
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated) return;
    SecureStore.setItemAsync(storageKey, JSON.stringify(purchasedIds)).catch(() => {});
  }, [storageKey, purchasedIds, hydrated]);

  const toggle = useCallback((tripId: string | number) => {
    const id = String(tripId);
    setPurchasedIds((prev: string[]) =>
      prev.includes(id) ? prev.filter((x: string) => x !== id) : [...prev, id],
    );
  }, []);

  const isPurchased = useCallback(
    (tripId: string | number) => purchasedIds.includes(String(tripId)),
    [purchasedIds],
  );

  const add = useCallback(
    (tripId: string | number) =>
      setPurchasedIds((prev: string[]) =>
        prev.includes(String(tripId)) ? prev : [...prev, String(tripId)],
      ),
    [],
  );
  const remove = useCallback(
    (tripId: string | number) =>
      setPurchasedIds((prev: string[]) => prev.filter((x: string) => x !== String(tripId))),
    [],
  );

  return { purchasedIds, isPurchased, toggle, add, remove, hydrated };
}
