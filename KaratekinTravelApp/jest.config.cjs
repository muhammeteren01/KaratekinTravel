/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  coverageProvider: "v8",
  roots: ["<rootDir>/src", "<rootDir>/__tests__"],
  testMatch: ["**/?(*.)+(spec|test).[tj]s?(x)"],
  moduleFileExtensions: ["ts", "tsx", "js", "json"],
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      { tsconfig: "<rootDir>/tsconfig.jest.json" },
    ],
  },
  transformIgnorePatterns: ["/node_modules/"],
  moduleNameMapper: {
    "^react-native$": "<rootDir>/__tests__/mocks/react-native.js",
    "\\.(png|jpg|jpeg|webp)$": "<rootDir>/__tests__/mocks/fileMock.js",
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@react-native-community/netinfo$": "<rootDir>/__tests__/mocks/netinfo.js",
    "^expo-status-bar$": "<rootDir>/__tests__/mocks/expo-status-bar.js",
    "^expo-navigation-bar$": "<rootDir>/__tests__/mocks/expo-navigation-bar.js",
    "^expo-splash-screen$": "<rootDir>/__tests__/mocks/expo-splash-screen.js",
    "^expo-font$": "<rootDir>/__tests__/mocks/expo-font.js",
    "^@expo/vector-icons(.*)$": "<rootDir>/__tests__/mocks/vector-icons.js",
    "^@react-native-async-storage/async-storage$": "<rootDir>/__tests__/mocks/async-storage.js",
  "^react-native-safe-area-context(.*)$": "<rootDir>/__tests__/mocks/react-native-safe-area-context.js",
    "^@/navigation/AppNavigator$": "<rootDir>/__tests__/mocks/app-navigator.js",
    "^@/features/onboarding/screens$":
      "<rootDir>/__tests__/mocks/onboarding.screens.js",
  },
  setupFilesAfterEnv: ["<rootDir>/__tests__/setupTests.ts"],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/",
    "/__tests__/mocks/",
    "/__tests__/setupTests.ts",
  ],
  collectCoverageFrom: [
    "src/**/*.ts",
    "src/**/*.tsx",
    "!src/**/index.ts",
    "!src/**/examples/**",
  ],
  coverageReporters: ["text", "text-summary", "lcov", "json"],
};
