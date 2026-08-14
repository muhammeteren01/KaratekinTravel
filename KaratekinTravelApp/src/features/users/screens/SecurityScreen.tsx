import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader, PasswordInput, Button } from "@/shared/ui";
import { userAvatarSource } from "@/utils/avatar";
import { useAuth } from "@/context/AuthContext";

interface SecurityScreenProps {
  onBack: () => void;
}

export default function SecurityScreen({ onBack }: SecurityScreenProps) {
  const { currentUser } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  // visibility now internal to PasswordInput

  const handleSaveChanges = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Uyarı", "Lütfen tüm alanları doldurun.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Uyarı", "Yeni şifreler eşleşmiyor.");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Uyarı", "Yeni şifre en az 6 karakter olmalıdır.");
      return;
    }
    Alert.alert("Başarılı", "Şifreniz başarıyla güncellendi.", [
      { text: "Tamam", onPress: onBack },
    ]);
  };
  const handleForgotPassword = () => {
    Alert.alert(
      "Bilgi",
      "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.",
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor="#ffffff" translucent={false} />
      <AppHeader title="Güvenlik" onBack={onBack} backgroundColor="#fff" />
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <Image
                source={userAvatarSource(currentUser?.avatar)}
                style={styles.avatar}
              />
            </View>
            <Text style={styles.userName}>Şakir Ayıtkı</Text>
          </View>
          <View style={styles.passwordSection}>
            <Text style={styles.fieldLabel}>Mevcut Şifre</Text>
            <PasswordInput
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="**********"
              variant="outline"
              size="sm"
              style={styles.inputContainer}
            />
            <Text style={styles.fieldLabel}>Yeni Şifre</Text>
            <PasswordInput
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="**********"
              variant="outline"
              size="sm"
              style={styles.inputContainer}
            />
            <Text style={styles.fieldLabel}>Yeni Şifre Tekrar</Text>
            <PasswordInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="**********"
              variant="outline"
              size="sm"
              style={styles.inputContainer}
            />
          </View>
          <TouchableOpacity
            onPress={handleForgotPassword}
            style={styles.forgotPasswordContainer}
          >
            <Text style={styles.forgotPasswordText}>Şifremi Unuttum</Text>
          </TouchableOpacity>
          <Button
            title="Değişiklikleri Kaydet"
            onPress={handleSaveChanges}
            variant="primary"
            style={styles.saveButton}
          />
          <View style={styles.bottomSpace} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: "center",
    paddingTop: 20,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FFE4E1",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  userName: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333",
  },
  passwordSection: {
    paddingHorizontal: 24,
    marginTop: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 12,
    marginTop: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  passwordInput: {
    flex: 1,
    height: 54,
    fontSize: 16,
    color: "#333",
  },
  eyeButton: {
    padding: 8,
  },
  forgotPasswordContainer: {
    alignItems: "flex-end",
    marginTop: 20,
    paddingHorizontal: 24,
  },
  forgotPasswordText: {
    fontSize: 16,
    color: "#FF6B35",
    fontWeight: "500",
  },
  saveButton: {
    backgroundColor: "#FF6B35",
    marginHorizontal: 24,
    borderRadius: 25,
    paddingVertical: 18,
    marginTop: 20,
    shadowColor: "#FF6B35",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  bottomSpace: {
    height: 100,
  },
});
