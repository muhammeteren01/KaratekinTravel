import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as NavigationBar from "expo-navigation-bar";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  SplashScreen as SplashScreenComponent,
  OnboardingScreen,
} from "@/features/onboarding/screens";
import {
  LoginScreen,
  RegisterScreen,
  ForgotPasswordScreen,
  EmailVerificationScreen,
} from "@/features/auth/screens";
import HomeScreen from "@/features/home/screens/HomeScreen";
import AppNavigator from "@/navigation/AppNavigator";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { DataProvider } from "@/core/data/DataProvider";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { theme, AppThemeProvider } from "@/shared/theme";
import applyDisableFontScaling from "@/shared/utils/disableFontScaling";

// Apply once at module load (no visual change, only scaling behavior)
applyDisableFontScaling();
SplashScreen.preventAutoHideAsync().catch(() => {});

type AppState =
  | "loading"
  | "splash"
  | "onboarding"
  | "login"
  | "register"
  | "forgotPassword"
  | "emailVerification"
  | "home";

const ONBOARDING_COMPLETED_KEY = "@turlagitsin_app:onboarding_completed";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AppState>("loading");
  const [userEmail, setUserEmail] = useState("");
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
  });

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  useEffect(() => {
    if (Platform.OS === "android") {
      // Android alt sistem gezinme çubuğunu gizle ve tam ekran davranışını ayarla
      NavigationBar.setVisibilityAsync("hidden");
      NavigationBar.setBehaviorAsync("overlay-swipe");
    }
  }, [currentScreen]);

  const checkOnboardingStatus = async () => {
    try {
      const onboardingCompleted = await AsyncStorage.getItem(
        ONBOARDING_COMPLETED_KEY,
      );
      const isCompleted = onboardingCompleted === "true";

      // Splash screen'i her zaman göster
      setCurrentScreen("splash");
    } catch (error) {
      console.error("Error checking onboarding status:", error);
      setCurrentScreen("splash");
    }
  };

  const handleSplashFinish = useCallback(async () => {
    try {
      const onboardingCompleted = await AsyncStorage.getItem(
        ONBOARDING_COMPLETED_KEY,
      );
      const isCompleted = onboardingCompleted === "true";

      if (!isCompleted) {
        setCurrentScreen("onboarding");
      } else {
        // After onboarding, auth gate decides login/home
        setCurrentScreen("login");
      }
    } catch (error) {
      console.error("Error checking onboarding status:", error);
      setCurrentScreen("onboarding");
    }
  }, []);

  const handleOnboardingComplete = useCallback(async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, "true");
      setCurrentScreen("login");
    } catch (error) {
      console.error("Error saving onboarding status:", error);
      setCurrentScreen("login");
    }
  }, []);

  const handleLogout = useCallback(() => {
    setCurrentScreen("login");
  }, []);

  const handleRegisterSuccess = useCallback(() => {
    // After successful registration, go back to login
    setCurrentScreen("login");
  }, []);

  const handleForgotPasswordSuccess = useCallback(() => {
    // After password reset, go back to login
    setCurrentScreen("login");
  }, []);

  const handleLoginSuccess = useCallback(() => {
    // After successful login, go to home
    setCurrentScreen("home");
  }, []);

  const renderScreen = () => {
    // Auth gating: if hydrating, keep splash; else route based on auth
    // Note: We can only use the auth hook inside a provider, so move provider to outer wrapper below.
    switch (currentScreen) {
      case "login":
        return (
          <LoginOrHome
            onLogin={handleLoginSuccess}
            onNavigateToRegister={() => setCurrentScreen("register")}
            onNavigateToForgotPassword={() =>
              setCurrentScreen("forgotPassword")
            }
          />
        );
      case "register":
        return (
          <RegisterScreen
            onRegister={handleRegisterSuccess}
            onNavigateToLogin={() => setCurrentScreen("login")}
            onBack={() => setCurrentScreen("login")}
          />
        );
      case "forgotPassword":
        return (
          <ForgotPasswordScreen
            onResetPassword={handleForgotPasswordSuccess}
            onBack={() => setCurrentScreen("login")}
          />
        );
      case "emailVerification":
        return (
          <EmailVerificationScreen
            onVerify={() => setCurrentScreen("home")}
            onBack={() => setCurrentScreen("login")}
            email={userEmail}
          />
        );
      case "home":
        return <HomeOrLogin onLogout={handleLogout} />;
      case "loading":
        return <View style={styles.loadingContainer} />;
      case "splash":
        return <SplashScreenComponent onAnimationFinish={handleSplashFinish} />;
      case "onboarding":
        return <OnboardingScreen onComplete={handleOnboardingComplete} />;
      default:
        return <HomeScreen onLogout={handleLogout} />;
    }
  };

  if (!fontsLoaded) {
    return <View style={styles.loadingContainer} />;
  }

  return (
    <AppThemeProvider>
      <DataProvider>
        <AuthProvider>
          <SafeAreaProvider>
            <StatusBar style="auto" translucent={false} />
            <AuthGate>{renderScreen()}</AuthGate>
          </SafeAreaProvider>
        </AuthProvider>
      </DataProvider>
    </AppThemeProvider>
  );
}

// AuthGate decides whether to show Login or the app content based on auth state
function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isHydrating } = useAuth();
  const [ready, setReady] = React.useState(false);

  // Keep existing splash/onboarding logic but also respect auth hydrating
  React.useEffect(() => {
    setReady(!isHydrating);
  }, [isHydrating]);

  if (!ready) {
    return <SplashScreenComponent onAnimationFinish={() => {}} />;
  }

  return (
    <View
      style={styles.container}
      testID="auth-gate-root"
      accessibilityLabel="Uygulama Kök"
      accessibilityRole="summary"
    >
      {children}
    </View>
  );
}

function LoginOrHome({
  onLogin,
  onNavigateToRegister,
  onNavigateToForgotPassword,
}: {
  onLogin: () => void;
  onNavigateToRegister: () => void;
  onNavigateToForgotPassword: () => void;
}) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <AppNavigator onLogout={() => {}} />;
  return (
    <LoginScreen
      onLogin={onLogin}
      onNavigateToRegister={onNavigateToRegister}
      onNavigateToForgotPassword={onNavigateToForgotPassword}
    />
  );
}

function HomeOrLogin({ onLogout }: { onLogout: () => void }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return (
      <LoginScreen
        onLogin={() => {}}
        onNavigateToRegister={() => {}}
        onNavigateToForgotPassword={() => {}}
      />
    );
  }
  // Use AppNavigator as the home shell to unify tabs/stack
  return <AppNavigator onLogout={onLogout} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  loadingContainer: { flex: 1, backgroundColor: "#24BAEC" },
  mainContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 20,
  },
});
