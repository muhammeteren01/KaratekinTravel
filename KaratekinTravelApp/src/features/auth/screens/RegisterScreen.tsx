import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader, PasswordInput, LabeledInput, Button } from "@/shared/ui";
import { registerApi } from "@/core/data/api";
import { ApiError } from "@/core/data/api/http";
import { useAuth } from "@/context/AuthContext";

interface RegisterScreenProps {
  onRegister: () => void;
  onNavigateToLogin: () => void;
  onBack: () => void;
}

export default function RegisterScreen({
  onRegister,
  onNavigateToLogin,
  onBack,
}: RegisterScreenProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleRegister = async () => {
    if (isLoading) return;

    if (!fullName.trim()) {
      Alert.alert("Hata", "Lütfen ad-soyad giriniz");
      return;
    }
    if (!email.trim()) {
      Alert.alert("Hata", "Lütfen e-posta giriniz");
      return;
    }
    if (!password || password.length < 6) {
      Alert.alert("Hata", "Şifre en az 6 karakter olmalı");
      return;
    }

    try {
      setIsLoading(true);
      const { token, user } = await registerApi({
        name: fullName.trim(),
        email: email.trim(),
        password,
      });
      await login(user, token);
      Alert.alert("Başarılı!", "Kaydınız tamamlandı.", [
        { text: "Tamam", onPress: () => onRegister() },
      ]);
    } catch (error) {
      let msg = "Kayıt sırasında bir hata oluştu";
      if (error instanceof ApiError) {
        msg = error.message;
      } else if (error instanceof Error) {
        // Network / wrong host usually lands here (not ApiError)
        msg = `API'ye ulaşılamadı: ${error.message}\n\nKontrol: backend açık mı? Adres doğru mu?`;
      }
      console.error("[register]", error);
      Alert.alert("Hata", msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor="transparent" translucent />
      <AppHeader title="Kayıt Ol" onBack={onBack} />
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
                Hemen <Text style={styles.highlightText}>Kayıt Ol!</Text>
              </Text>
              <Text style={styles.subtitle}>
                Lütfen alanları doldur ve kaydını tamamla...
              </Text>
            </View>
            <View style={styles.formContainer}>
              <LabeledInput
                label=""
                value={fullName}
                onChangeText={setFullName}
                placeholder="Ad-Soyad"
                autoCapitalize="words"
                style={styles.inputContainer}
              />

              <LabeledInput
                label=""
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="Mail"
                style={styles.inputContainer}
              />

              <View style={styles.inputContainer}>
                <PasswordInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="**********"
                  variant="filled"
                  size="md"
                  style={styles.passwordContainer}
                />
                <Text style={styles.passwordHint}>
                  Şifre en az 6 karakter olmalı!
                </Text>
              </View>
              <Button
                title={isLoading ? "Kaydediliyor..." : "Kaydı Tamamla"}
                onPress={handleRegister}
                disabled={isLoading}
                loading={isLoading}
                variant="primary"
                style={styles.registerButton}
              />
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>
                  Mevcut bir hesabın var mı?{" "}
                </Text>
                <TouchableOpacity onPress={onNavigateToLogin}>
                  <Text style={styles.loginLink}>Giriş Yap</Text>
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
  header: {
    paddingHorizontal: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    marginTop: 50,
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
    paddingTop: 30,
    paddingBottom: 40,
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
    marginBottom: 40,
  },
  inputContainer: {
    marginBottom: 20,
  },
  passwordContainer: {
    width: "100%",
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
  passwordHint: {
    color: "#999",
    fontSize: 12,
    marginTop: 8,
  },
  registerButton: {
    backgroundColor: "#24BAEC",
    marginBottom: 24,
    marginTop: 20,
    paddingVertical: 16,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: {
    color: "#999",
    fontSize: 14,
  },
  loginLink: {
    color: "#FF6B35",
    fontSize: 14,
    fontWeight: "600",
  },
});
