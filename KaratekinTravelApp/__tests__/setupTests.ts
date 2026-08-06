// Setup for Jest tests
export {};

// Global mock for ESM/native modules that break in Jest Node env
jest.mock("@expo/vector-icons", () => ({ Ionicons: () => null }));
