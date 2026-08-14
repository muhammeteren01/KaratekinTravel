/**
 * @jest-environment jsdom
 */
import React, { forwardRef, useImperativeHandle } from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { useSavedTripsState } from '@/context/UserState';
import { AuthProvider } from '@/context/AuthContext';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => {}),
  deleteItemAsync: jest.fn(async () => {}),
}));

// UserState bu uc kancayi @/core/data/store'dan aliyor. Once
// @/features/trips/hooks mock'lanmisti; o modul kullanilmadigi icin mock hic
// devreye girmiyor, gercek useQuery calisiyor ve "No QueryClient set" ile
// dusuyordu. Dogru modul mock'lanarak testin QueryClientProvider'a ihtiyaci
// kalmadi.
jest.mock('@/core/data/store', () => ({
  useSupportingData: jest.fn(() => ({
    data: {
      userState: [
        { userId: 'u1', savedTripIds: ['1', '2'], purchasedTripIds: [] },
      ],
    },
    isLoading: false,
    isError: false,
    refetch: jest.fn(),
  })),
  // Kullanici giris yapmadigi icin uzak liste bos; savedIds yerel duruma dusuyor.
  useSavedTripIds: jest.fn(() => ({ data: undefined, isLoading: false, isError: false })),
  useToggleSavedTrip: jest.fn(() => ({ mutate: jest.fn(), isPending: false })),
}));

type Exposed = { isSaved: (id: string|number)=>boolean; toggle: (id: string|number)=>void };
const HookConsumer = forwardRef<Exposed>((_, ref) => {
  const state = useSavedTripsState();
  useImperativeHandle(ref, () => ({ isSaved: state.isSaved, toggle: state.toggle }));
  return null;
});

describe('useSavedTripsState', () => {
  it('hydrates from supporting data and toggles', async () => {
    const ref = React.createRef<Exposed>();
    TestRenderer.create(
      React.createElement(
        AuthProvider,
        null,
        React.createElement(HookConsumer, { ref })
      )
    );
  const flush = () => new Promise((r) => setTimeout(r, 0));
  await act(async () => { await flush(); });
  await act(async () => { ref.current?.toggle('3'); });
  await act(async () => { await flush(); });
    expect(ref.current?.isSaved('3')).toBe(true);
  await act(async () => { ref.current?.toggle('3'); });
  await act(async () => { await flush(); });
    expect(ref.current?.isSaved('3')).toBe(false);
  });
});
