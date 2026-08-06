/**
 * @jest-environment jsdom
 */
import React from "react";
import TestRenderer from "react-test-renderer";
import App from "../App";

// Mocks for native-only modules used at startup
jest.mock("expo-navigation-bar", () => ({
  setVisibilityAsync: jest.fn(),
  setBehaviorAsync: jest.fn(),
}));
jest.mock("expo-status-bar", () => ({ StatusBar: () => null }));
jest.mock("@/features/onboarding/screens", () => {
  const React = require("react");
  return {
    SplashScreen: ({ onAnimationFinish }: any) => {
      React.useEffect(() => {
        onAnimationFinish && onAnimationFinish();
      }, [onAnimationFinish]);
      return React.createElement("div", null, "Splash");
    },
    OnboardingScreen: ({ onComplete }: any) =>
      React.createElement(
        "button",
        { onClick: () => onComplete && onComplete() },
        "Onboarding",
      ),
  };
});
jest.mock("@/navigation/AppNavigator", () => () => null);
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaProvider: ({ children }: any) => children,
}));
jest.mock("@/features/auth/screens", () => ({
  LoginScreen: ({ onLogin }: any) => null,
  RegisterScreen: () => null,
  ForgotPasswordScreen: () => null,
  EmailVerificationScreen: () => null,
}));
jest.mock("@/features/home/screens/HomeScreen", () => () => null);
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(async () => null),
  setItem: jest.fn(async () => {}),
  removeItem: jest.fn(async () => {}),
}));
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(async () => null),
  setItemAsync: jest.fn(async () => {}),
  deleteItemAsync: jest.fn(async () => {}),
}));

describe("App root", () => {
  it("renders without crashing", () => {
    expect(() => TestRenderer.create(<App />)).not.toThrow();
  });
});
