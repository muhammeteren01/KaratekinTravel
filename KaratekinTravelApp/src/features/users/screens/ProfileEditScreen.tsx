import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader, Button } from "@/shared/ui";
import { useAuth } from "@/context/AuthContext";
import { useUsers } from "@/core/data/store";
import { LoadingView, ErrorView, LabeledInput } from "@/shared/ui";

interface ProfileEditScreenProps {
  onBack: () => void;
}

export default function ProfileEditScreen({ onBack }: ProfileEditScreenProps) {
  const { currentUser, updateProfile } = useAuth();
  const { data: allUsers = [], isLoading, isError, refetch } = useUsers();
  if (isLoading) return <LoadingView />;
  if (isError) return <ErrorView onRetry={refetch} />;
  const bootstrapUser = allUsers.find(
    (u) => String(u.id) === String(currentUser?.id),
  );
  const [formData, setFormData] = useState({
    firstName:
      (currentUser?.name || bootstrapUser?.name || "").split(" ")[0] || "",
    lastName:
      (currentUser?.name || bootstrapUser?.name || "")
        .split(" ")
        .slice(1)
        .join(" ") || "",
    location:
      (currentUser as any)?.location ?? (bootstrapUser as any)?.location ?? "",
    phoneNumber: currentUser?.phone ?? bootstrapUser?.phone ?? "",
    email: currentUser?.email ?? bootstrapUser?.email ?? "",
  });

  const handleSave = async () => {
    const fullName = [formData.firstName, formData.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();
    await updateProfile({
      name: fullName || currentUser?.name,
      email: formData.email || currentUser?.email,
      phone: formData.phoneNumber || currentUser?.phone,
      ...(formData.location ? ({ location: formData.location } as any) : {}),
    });
    Alert.alert("Profil Güncellendi", "Bilgileriniz başarıyla güncellendi.", [
      { text: "Tamam", onPress: onBack },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor="transparent" translucent />
      <AppHeader title="Profil Güncelle" onBack={onBack} />
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileSection}>
          <TouchableOpacity style={styles.avatarContainer} onPress={() => {}}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format",
              }}
              style={styles.profileAvatar}
            />
            <View style={styles.changePhotoButton}>
              <Ionicons name="camera" size={16} color="white" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.changePhotoTextButton}
            onPress={() => {}}
          >
            <Text style={styles.changePhotoText}>
              Profil Fotoğrafını Değiştir
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.formSection}>
          <LabeledInput
            label="İsim"
            value={formData.firstName}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, firstName: text }))
            }
            placeholder="İsminizi girin"
            variant="outline"
            size="md"
          />
          <LabeledInput
            label="Soyisim"
            value={formData.lastName}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, lastName: text }))
            }
            placeholder="Soyisminizi girin"
            variant="outline"
            size="md"
          />
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Konum</Text>
            <TouchableOpacity style={styles.formInput}>
              <Text style={styles.formInputText}>{formData.location}</Text>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          </View>
          <LabeledInput
            label="Telefon Numarası"
            value={formData.phoneNumber}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, phoneNumber: text }))
            }
            placeholder="Telefon numaranızı girin"
            keyboardType="phone-pad"
            variant="outline"
            size="md"
            prefix={<Text style={styles.countryCode}>+90</Text>}
          />
          <LabeledInput
            label="Mail Adresi"
            value={formData.email}
            onChangeText={(text) =>
              setFormData((prev) => ({ ...prev, email: text }))
            }
            placeholder="E-mail adresinizi girin"
            keyboardType="email-address"
            autoCapitalize="none"
            variant="outline"
            size="md"
          />
        </View>
        <View style={styles.saveSection}>
          <Button
            title="Değişiklikleri Kaydet"
            onPress={handleSave}
            variant="primary"
            style={styles.saveButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  scrollView: { flex: 1 },
  profileSection: {
    alignItems: "center",
    paddingVertical: 32,
    backgroundColor: "#F8F9FA",
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FFE4E1",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    position: "relative",
  },
  profileAvatar: { width: 80, height: 80, borderRadius: 40 },
  changePhotoButton: {
    position: "absolute",
    bottom: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FF6B35",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  changePhotoTextButton: { marginBottom: 16 },
  changePhotoText: { fontSize: 14, color: "#FF6B35", fontWeight: "500" },
  formSection: {
    backgroundColor: "white",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  formGroup: { marginBottom: 24 },
  formLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#F8F9FA",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  formInputText: { fontSize: 16, color: "#333", flex: 1 },
  countryCode: {
    fontSize: 16,
    color: "#333",
    marginRight: 8,
    fontWeight: "500",
  },
  saveSection: { paddingHorizontal: 24, paddingVertical: 32 },
  saveButton: {
    backgroundColor: "#FF6B35",
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    paddingVertical: 16,
  },
});
