import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import {
  PasswordInput,
  LabeledInput,
  Button,
} from "@/shared/ui";
import { useAuth } from "@/context/AuthContext";
import { loginApi } from "@/core/data/api";
import { ApiError } from "@/core/data/api/http";

const { width } = Dimensions.get("window");

interface LoginScreenProps {
  onLogin: () => void;
  onNavigateToRegister: () => void;
  onNavigateToForgotPassword: () => void;
}

export default function LoginScreen({
  onLogin,
  onNavigateToRegister,
  onNavigateToForgotPassword,
}: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Hata", "E-posta ve şifre gerekli");
      return;
    }
    try {
      setIsLoading(true);
      const { token, user } = await loginApi(email.trim(), password);
      await login(user, token);
      onLogin();
    } catch (e) {
      let msg = "Giriş başarısız";
      if (e instanceof ApiError) msg = e.message;
      else if (e instanceof Error) msg = `API'ye ulaşılamadı: ${e.message}`;
      console.error("[login]", e);
      Alert.alert("Hata", msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor="transparent" translucent />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          bounces={false}
        >
          <View style={styles.content}>
            <View style={styles.headerContainer}>
              <Text style={styles.title}>
                Şimdi <Text style={styles.highlightText}>Giriş Yap!</Text>
              </Text>
              <Text style={styles.subtitle}>
                Devam edebilmek için lütfen giriş yap...
              </Text>
            </View>

            <View style={styles.formContainer}>
              <LabeledInput
                label=""
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="Mail Adresinizi Giriniz..."
                style={styles.inputContainer}
              />

              <PasswordInput
                value={password}
                onChangeText={setPassword}
                placeholder="**********"
                variant="filled"
                size="md"
                style={styles.passwordContainer}
              />

              <TouchableOpacity onPress={onNavigateToForgotPassword}>
                <Text style={styles.forgotPassword}>Şifremi Unuttum</Text>
              </TouchableOpacity>

              <Button
                title={isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
                onPress={handleLogin}
                variant="primary"
                style={styles.loginButton}
                disabled={isLoading}
              />
              {isLoading ? (
                <ActivityIndicator color="#24BAEC" style={{ marginBottom: 16 }} />
              ) : null}

              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>
                  Henüz bir hesabın yok mu?{" "}
                </Text>
                <TouchableOpacity onPress={onNavigateToRegister}>
                  <Text style={styles.signupLink}>Kayıt Ol</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.socialContainer}>
              <Text style={styles.socialText}>Uygulamızı Öner!</Text>
              <View style={styles.socialButtons}>
                <TouchableOpacity
                  style={[styles.socialButton, styles.facebook]}
                >
                  <Ionicons name="logo-facebook" size={20} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.socialButton, styles.instagram]}
                >
                  <Ionicons name="logo-instagram" size={20} color="white" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.socialButton, styles.twitter]}>
                  <Ionicons name="logo-twitter" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
    marginTop: 30,
  },
  headerContainer: {
    marginBottom: 80,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 16,
  },
  highlightText: {
    color: "#FF6B35",
  },
  subtitle: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
  },
  formContainer: {
    marginBottom: 60,
  },
  inputContainer: {
    marginBottom: 20,
  },
  passwordContainer: {
    marginBottom: 20,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
  },
  eyeButton: {
    paddingHorizontal: 16,
  },
  forgotPassword: {
    color: "#FF6B35",
    fontSize: 14,
    textAlign: "right",
    marginTop: 8,
    marginBottom: 40,
  },
  loginButton: {
    backgroundColor: "#24BAEC",
    paddingVertical: 16,
    marginBottom: 24,
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signupText: {
    color: "#999",
    fontSize: 14,
  },
  signupLink: {
    color: "#FF6B35",
    fontSize: 14,
    fontWeight: "600",
  },
  socialContainer: {
    alignItems: "center",
  },
  socialText: {
    color: "#FF6B35",
    fontSize: 14,
    marginBottom: 16,
  },
  socialButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
  },
  socialButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  facebook: {
    backgroundColor: "#1877F2",
  },
  instagram: {
    backgroundColor: "#E4405F",
  },
  twitter: {
    backgroundColor: "#1DA1F2",
  },
});
