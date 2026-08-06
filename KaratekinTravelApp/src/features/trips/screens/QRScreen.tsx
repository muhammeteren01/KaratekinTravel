import React from "react";
import { resolveImage } from "@/core/data/schemas";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader, Button } from "@/shared/ui";

interface QRScreenProps {
  onBack: () => void;
  onHome?: () => void;
}

export default function QRScreen({ onBack, onHome }: QRScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor="transparent" translucent />

      <ImageBackground
        source={resolveImage("asset:ob1")}
        style={styles.backgroundImage}
        resizeMode="cover"
        blurRadius={3}
      >
        <View style={styles.overlay}>
          <AppHeader
            title="QR Bilgileri"
            showBack={false}
            backgroundColor="transparent"
            titleColor="white"
            iconColor="white"
            safeAreaTop
            left={
              <TouchableOpacity
                style={styles.backButton}
                onPress={onHome || onBack}
              >
                <Ionicons name="home-outline" size={24} color="white" />
              </TouchableOpacity>
            }
          />

          {/* Content Card */}
          <View style={styles.contentCard}>
            <View style={styles.cardHandle} />

            {/* Success Message */}
            <View style={styles.successSection}>
              <View style={styles.successRow}>
                <View style={styles.checkIconContainer}>
                  <Ionicons name="checkmark" size={24} color="white" />
                </View>
                <View style={styles.successTextContainer}>
                  <Text style={styles.successTitle}>Ödemeniz İçin</Text>
                  <Text style={styles.successSubtitle}>Teşekkür Ederiz!</Text>
                </View>
              </View>
            </View>

            {/* QR Code */}
            <View style={styles.qrContainer}>
              <View style={styles.qrFrame}>
                <View style={[styles.qrCorner, styles.topLeft]} />
                <View style={[styles.qrCorner, styles.topRight]} />
                <View style={[styles.qrCorner, styles.bottomLeft]} />
                <View style={[styles.qrCorner, styles.bottomRight]} />

                <View style={styles.qrCodeContainer}>
                  <View style={styles.qrCode}>
                    {/* QR Pattern */}
                    <View style={styles.qrRow}>
                      <View style={[styles.qrBlock, styles.filled]} />
                      <View style={[styles.qrBlock, styles.filled]} />
                      <View style={[styles.qrBlock, styles.filled]} />
                      <View style={styles.qrBlock} />
                      <View style={[styles.qrBlock, styles.filled]} />
                      <View style={styles.qrBlock} />
                      <View style={[styles.qrBlock, styles.filled]} />
                      <View style={[styles.qrBlock, styles.filled]} />
                      <View style={[styles.qrBlock, styles.filled]} />
                    </View>
                    {/* ...rest unchanged ... */}
                  </View>
                </View>
              </View>
            </View>

            {/* Description */}
            <Text style={styles.description}>
              Otobüse binmeden önce QR kodunuzu hazırlamanız gerekmektedir.
            </Text>

            {/* Download Button */}
            <Button
              title="QR Kodu İndir"
              onPress={() => {}}
              variant="primary"
              style={styles.downloadButton}
            />
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(135, 206, 235, 0.6)",
  },
  backButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  contentCard: {
    flex: 1,
    backgroundColor: "white",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 15,
    alignItems: "center",
  },
  cardHandle: {
    width: 50,
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    marginBottom: 20,
  },
  successSection: {
    alignItems: "center",
    marginBottom: 25,
  },
  successRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  checkIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
  },
  successTextContainer: {
    alignItems: "flex-start",
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  successSubtitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FF6B35",
  },
  qrContainer: {
    marginBottom: 25,
    marginTop: 20,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  qrFrame: {
    width: 280,
    height: 280,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  qrCorner: {
    position: "absolute",
    width: 25,
    height: 25,
    borderColor: "#FF6B35",
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  qrCodeContainer: {
    width: 220,
    height: 220,
    backgroundColor: "white",
    padding: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  qrCode: {
    width: 220,
    height: 220,
  },
  qrRow: {
    flexDirection: "row",
    flex: 1,
  },
  qrBlock: {
    flex: 1,
    margin: 1,
    backgroundColor: "white",
  },
  filled: {
    backgroundColor: "#FF6B35",
  },
  description: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 15,
    lineHeight: 20,
    marginTop: 20,
  },
  downloadButton: {
    backgroundColor: "#FF6B35",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 50,
    marginBottom: 15,
    marginTop: 20,
  },
});
