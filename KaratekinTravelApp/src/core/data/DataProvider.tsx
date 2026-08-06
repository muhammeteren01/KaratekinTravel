import React from 'react';
import { QueryClientProvider, focusManager } from '@tanstack/react-query';
import { queryClient } from './client';
import { AppState, AppStateStatus } from 'react-native';

function useAppStateFocus() {
  React.useEffect(() => {
    const onChange = (status: AppStateStatus) => {
      focusManager.setFocused(status === 'active');
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, []);
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  useAppStateFocus();
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
