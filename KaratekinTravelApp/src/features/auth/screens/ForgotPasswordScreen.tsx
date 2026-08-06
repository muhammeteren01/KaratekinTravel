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
import { AppHeader, LabeledInput, Button } from "@/shared/ui";
import { forgotPasswordApi } from "@/core/data/api";
import { ApiError } from "@/core/data/api/http";

interface ForgotPasswordScreenProps {
  onResetPassword: () => void;
  onBack: () => void;
}

export default function ForgotPasswordScreen({
  onResetPassword,
  onBack,
}: ForgotPasswordScreenProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    if (isLoading) return;

    if (!email.trim()) {
      Alert.alert("Hata", "Lütfen e-posta adresinizi giriniz");
      return;
    }

    try {
      setIsLoading(true);
      await forgotPasswordApi(email.trim());
      Alert.alert(
        "Başarılı!",
        "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.",
        [{ text: "Tamam", onPress: () => onResetPassword() }],
      );
    } catch (error) {
      const msg =
        error instanceof ApiError
          ? error.message
          : "Şifre sıfırlama sırasında bir hata oluştu";
      Alert.alert("Hata", msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor="transparent" translucent />

      <AppHeader title="Şifremi Unuttum" onBack={onBack} />

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
              <Text style={styles.title}>Şifremi Unuttum</Text>
              <Text style={styles.subtitle}>
                Şifreni sıfırlamak için hesabına{"\n"}kayıtlı mail adresini
                alana gir.
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

              <Button
                title="Şifremi Sıfırla"
                onPress={handleResetPassword}
                loading={isLoading}
                disabled={isLoading}
                variant="primary"
                style={styles.resetButton}
              />
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
    paddingTop: 10,
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
    paddingTop: 80,
    paddingBottom: 40,
  },
  headerContainer: {
    marginBottom: 60,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    lineHeight: 24,
  },
  formContainer: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 40,
  },
  resetButton: {
    backgroundColor: "#24BAEC",
    paddingVertical: 16,
  },
});
