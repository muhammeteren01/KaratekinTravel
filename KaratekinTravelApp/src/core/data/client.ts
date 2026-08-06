import AsyncStorage from '@react-native-async-storage/async-storage';
import { QueryClient, onlineManager } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';

// React Query client with RN offline awareness
export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 5 * 60 * 1000,
			gcTime: 30 * 60 * 1000,
			retry: 2,
			refetchOnReconnect: true,
			refetchOnWindowFocus: false,
		},
		mutations: {
			retry: 1,
		},
	},
});

// Hook up onlineManager to React Native NetInfo
onlineManager.setEventListener((setOnline: (online: boolean) => void) => {
	const unsubscribe = NetInfo.addEventListener((state: { isConnected: boolean | null }) => {
		setOnline(!!state.isConnected);
	});
	return unsubscribe;
});

// Simple storage helpers
export async function loadFromStorage<T>(key: string): Promise<T | null> {
	const raw = await AsyncStorage.getItem(key);
	if (!raw) return null;
	try {
		return JSON.parse(raw) as T;
	} catch {
		return null;
	}
}

export async function saveToStorage<T>(key: string, value: T): Promise<void> {
	await AsyncStorage.setItem(key, JSON.stringify(value));
}
