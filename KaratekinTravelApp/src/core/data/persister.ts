import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const QUERY_PERSIST_KEY = "turlagitsin:react-query";

export const queryPersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  throttleTime: 1500,
  key: QUERY_PERSIST_KEY,
});
