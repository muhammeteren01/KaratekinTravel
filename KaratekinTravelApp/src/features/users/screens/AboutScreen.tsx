import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader } from "@/shared/ui";

interface AboutScreenProps {
  onBack: () => void;
}

interface AboutScreenProps {
  onBack: () => void;
}

export default function AboutScreen({ onBack }: AboutScreenProps) {
  const handleAboutPress = () => {
    Alert.alert(
      "Hakkımızda",
      "TurlaGitsin uygulaması hakkında bilgiler burada yer alacak.",
    );
  };

  const handlePrivacyPress = () => {
    Alert.alert(
      "Gizlilik Sözleşmesi",
      "Gizlilik sözleşmesi içeriği burada görüntülenecek.",
    );
  };

  const handleKVKKPress = () => {
    Alert.alert(
      "KVKK",
      "Kişisel Verilerin Korunması Kanunu bilgileri burada yer alacak.",
    );
  };

  const handleContactPress = () => {
    Alert.alert(
      "Bize Ulaşın",
      "İletişim bilgileri ve destek seçenekleri burada yer alacak.",
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor="#ffffff" translucent={false} />

      <AppHeader title="Sürüm ve Hakkımızda" onBack={onBack} />

      {/* Menu Items */}
      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.menuItem} onPress={handleAboutPress}>
          <View style={styles.menuIconContainer}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color="#666"
            />
          </View>
          <Text style={styles.menuText}>Hakkımızda</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handlePrivacyPress}>
          <View style={styles.menuIconContainer}>
            <Ionicons name="document-text-outline" size={20} color="#666" />
          </View>
          <Text style={styles.menuText}>Gizlilik Sözleşmesi</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleKVKKPress}>
          <View style={styles.menuIconContainer}>
            <Ionicons name="document-text-outline" size={20} color="#666" />
          </View>
          <Text style={styles.menuText}>KVKK</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleContactPress}>
          <View style={styles.menuIconContainer}>
            <Ionicons name="chatbubble-outline" size={20} color="#666" />
          </View>
          <Text style={styles.menuText}>Bize Ulaşın</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        <View style={styles.menuItem}>
          <View style={styles.menuIconContainer}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#666" />
          </View>
          <Text style={styles.menuText}>Sürüm</Text>
          <Text style={styles.versionText}>3.16.8</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: "#F8F9FA",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  headerRight: {
    width: 40,
  },
  menuSection: {
    backgroundColor: "white",
    marginTop: 40,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
    minHeight: 60,
  },
  menuIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
    fontWeight: "400",
  },
  versionText: {
    fontSize: 16,
    color: "#8E8E93",
    fontWeight: "400",
  },
});
