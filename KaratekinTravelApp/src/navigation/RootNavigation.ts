import { createNavigationContainerRef, NavigatorScreenParams } from '@react-navigation/native';
import type { HomeStackParamList, TabsParamList } from './AppNavigator';

// Define the root navigator param list (top-level tabs)
export type RootParamList = {
  HomeStack: NavigatorScreenParams<HomeStackParamList>;
} & TabsParamList;

// Global navigation ref to allow navigation outside of components
export const navigationRef = createNavigationContainerRef<RootParamList>();

export function isNavReady() {
  return navigationRef.isReady();
}

export function navigateToTab<T extends keyof RootParamList>(tab: T) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(tab as never);
  }
}

export function navigateToHomeStack<T extends keyof HomeStackParamList>(screen: T, params?: HomeStackParamList[T]) {
  if (!navigationRef.isReady()) return;
  const nested: NavigatorScreenParams<HomeStackParamList> = {
    screen: screen as any,
    params: params as any,
  };
  navigationRef.navigate('HomeStack', nested as never);
}
