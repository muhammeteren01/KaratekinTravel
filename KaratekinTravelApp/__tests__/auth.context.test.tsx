/**
 * @jest-environment jsdom
 */
import React, { useImperativeHandle, forwardRef } from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { AuthProvider, useAuth } from '@/context/AuthContext';

// Basic polyfills for SecureStore in node
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => {}),
  deleteItemAsync: jest.fn(async () => {}),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(async () => {}),
  getItem: jest.fn(async () => null),
  removeItem: jest.fn(async () => {}),
}));

type Exposed = {
  isAuthenticated: boolean;
  currentUser: any;
  // Gercek imza (user, token); once tek argumanli yaziliydi ve
  // auth.login'in atanmasi TS2322 veriyordu.
  login: (u: any, token: string) => Promise<void>;
  logout: () => Promise<void>;
};

const HookConsumer = forwardRef<Exposed>((_, ref) => {
  const auth = useAuth();
  useImperativeHandle(ref, () => ({
    isAuthenticated: auth.isAuthenticated,
    currentUser: auth.currentUser,
    login: auth.login,
    logout: auth.logout,
  }));
  return null;
});

describe('AuthContext', () => {
  it('logs in and logs out', async () => {
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
  expect(ref.current?.isAuthenticated ?? false).toBe(false);
    await act(async () => {
      await ref.current?.login(
        { id: 'u1', name: 'Ahmet', email: 'a@example.com' },
        'test-token',
      );
    });
  await act(async () => { await flush(); });
    expect(ref.current?.isAuthenticated).toBe(true);
    expect(ref.current?.currentUser?.name).toBe('Ahmet');

    await act(async () => {
      await ref.current?.logout();
    });
  await act(async () => { await flush(); });
    expect(ref.current?.isAuthenticated).toBe(false);
    expect(ref.current?.currentUser).toBe(null);
  });
});
