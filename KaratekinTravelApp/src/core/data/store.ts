import { useQuery, useMutation, useQueryClient, focusManager, UseQueryResult } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { queryClient } from './client';
import { queryPersister } from './persister';
import { CACHE_KEYS, USE_REMOTE_API } from '../config/dataConfig';
import type { BootstrapPayload, Trip, Company, Reservation, Review, User, SupportingData, CalendarTrip, NotificationItem, RouteStopItem, ReservationPreset, CompanyReviewItem, PastTrip, OnboardingSlide } from './schemas';
import {
  fetchBootstrap,
  fetchTrips,
  fetchCompanies,
  fetchReservations,
  fetchReviews,
  fetchUsers,
  createReservationApi,
  processPaymentApi,
  createReviewApi,
  saveTripApi,
  unsaveTripApi,
  getSavedTripIdsApi,
} from './api';
import {
  fetchBootstrapLocal,
  fetchTripsLocal,
  fetchCompaniesLocal,
  fetchReservationsLocal,
  fetchReviewsLocal,
  fetchUsersLocal,
} from './api/local';
import { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';

persistQueryClient({
  queryClient,
  persister: queryPersister,
  dehydrateOptions: {
    shouldDehydrateQuery: (query) => query.state.status === 'success',
  },
});

function useAppStateFocus() {
  useEffect(() => {
    const onChange = (status: AppStateStatus) => {
      focusManager.setFocused(status === 'active');
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, []);
}

export function useBootstrap(): UseQueryResult<BootstrapPayload> {
  useAppStateFocus();
  return useQuery<BootstrapPayload>({
    queryKey: CACHE_KEYS.bootstrap,
    queryFn: USE_REMOTE_API ? fetchBootstrap : fetchBootstrapLocal,
  });
}

export function useTrips(): UseQueryResult<Trip[]> {
  return useQuery<Trip[]>({
    queryKey: CACHE_KEYS.trips,
    queryFn: USE_REMOTE_API ? fetchTrips : fetchTripsLocal,
  });
}

export function useCompanies(): UseQueryResult<Company[]> {
  return useQuery<Company[]>({
    queryKey: CACHE_KEYS.companies,
    queryFn: USE_REMOTE_API ? fetchCompanies : fetchCompaniesLocal,
  });
}

export function useReservations(): UseQueryResult<Reservation[]> {
  return useQuery<Reservation[]>({
    queryKey: CACHE_KEYS.reservations,
    queryFn: USE_REMOTE_API ? fetchReservations : fetchReservationsLocal,
    retry: 1,
  });
}

export function useReviews(): UseQueryResult<Review[]> {
  return useQuery<Review[]>({
    queryKey: CACHE_KEYS.reviews,
    queryFn: USE_REMOTE_API ? fetchReviews : fetchReviewsLocal,
  });
}

export function useUsers(): UseQueryResult<User[]> {
  return useQuery<User[]>({
    queryKey: CACHE_KEYS.users,
    queryFn: USE_REMOTE_API ? fetchUsers : fetchUsersLocal,
  });
}

export function useCreateReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createReservationApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CACHE_KEYS.reservations });
    },
  });
}

export function useProcessPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: processPaymentApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CACHE_KEYS.reservations });
    },
  });
}

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createReviewApi,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CACHE_KEYS.reviews });
      qc.invalidateQueries({ queryKey: CACHE_KEYS.bootstrap });
    },
  });
}

export function useToggleSavedTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ tripId, currentlySaved }: { tripId: string; currentlySaved: boolean }) => {
      if (currentlySaved) await unsaveTripApi(tripId);
      else await saveTripApi(tripId);
      return { tripId, saved: !currentlySaved };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CACHE_KEYS.savedTrips });
    },
  });
}

export function useSavedTripIds(enabled = true) {
  return useQuery({
    queryKey: CACHE_KEYS.savedTrips,
    queryFn: getSavedTripIdsApi,
    enabled: USE_REMOTE_API && enabled,
    retry: false,
  });
}

export function useSupportingData(): { data?: SupportingData; isLoading: boolean; isError: boolean; refetch: () => any } {
  const q = useBootstrap();
  return { data: q.data?.supportingData, isLoading: q.isLoading, isError: q.isError, refetch: q.refetch };
}

export function useCalendarTrips(): { data?: CalendarTrip[]; isLoading: boolean; isError: boolean; refetch: () => any } {
  const q = useSupportingData();
  return { data: q.data?.calendarTrips, isLoading: q.isLoading, isError: q.isError, refetch: q.refetch };
}

export function useNotifications(): { recent?: NotificationItem[]; archived?: NotificationItem[]; isLoading: boolean; isError: boolean; refetch: () => any } {
  const q = useSupportingData();
  return { recent: q.data?.notifications?.recent, archived: q.data?.notifications?.archived, isLoading: q.isLoading, isError: q.isError, refetch: q.refetch };
}

export function useRouteStops(): { data?: RouteStopItem[]; isLoading: boolean; isError: boolean; refetch: () => any } {
  const q = useSupportingData();
  return { data: q.data?.routeStops, isLoading: q.isLoading, isError: q.isError, refetch: q.refetch };
}

export function useReservationPresets(): { data: ReservationPreset[] | undefined; isLoading: boolean; isError: boolean; refetch: () => any } {
  const q = useSupportingData();
  return { data: q.data?.reservationPresets, isLoading: q.isLoading, isError: q.isError, refetch: q.refetch };
}

export function useCompanyReviews(): { data?: CompanyReviewItem[]; isLoading: boolean; isError: boolean; refetch: () => any } {
  const q = useSupportingData();
  return { data: q.data?.companyReviews, isLoading: q.isLoading, isError: q.isError, refetch: q.refetch };
}

export function usePastTrips(): { data?: PastTrip[]; isLoading: boolean; isError: boolean; refetch: () => any } {
  const q = useSupportingData();
  return { data: q.data?.pastTrips, isLoading: q.isLoading, isError: q.isError, refetch: q.refetch };
}

export function useOnboardingSlides(): { data?: OnboardingSlide[]; isLoading: boolean; isError: boolean; refetch: () => any } {
  const q = useSupportingData();
  return { data: q.data?.onboardingSlides, isLoading: q.isLoading, isError: q.isError, refetch: q.refetch };
}
