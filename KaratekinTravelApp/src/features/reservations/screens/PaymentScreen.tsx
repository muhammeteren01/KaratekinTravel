import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { resolveImage } from "@/core/data/schemas";
import QRScreen from "@/features/trips/screens/QRScreen";
import PolicyModal from "@/components/PolicyModal";
import { BlurView } from "expo-blur";
import { AppHeader, Button } from "@/shared/ui";
import { SectionHeader } from "@/shared/ui";
import Badge from "@/shared/ui/Badge";
import { LabeledInput, FormRow } from "@/shared/ui";
import { useCreateReservation, useProcessPayment } from "@/core/data/store";
import { usePurchasedTripsState } from "@/context/UserState";

interface PaymentScreenProps {
  onBack: () => void;
  onHome?: () => void;
  seatCount?: number;
  tripId?: string;
  seatNumbers?: number[];
}

export default function PaymentScreen({
  onBack,
  onHome,
  seatCount = 1,
  tripId,
  seatNumbers = [],
}: PaymentScreenProps) {
  const [showQR, setShowQR] = useState(false);
  const [agreePolicy, setAgreePolicy] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const ticketsToRender = Math.max(1, seatCount);
  const badgeColors = ["#00BCD4", "#E91E63", "#FF6B35", "#24BAEC"];
  const createReservation = useCreateReservation();
  const processPayment = useProcessPayment();
  const { add: addPurchased } = usePurchasedTripsState();

  // Form state for ticket details (array to support multiple tickets)
  const [ticketDetails, setTicketDetails] = useState(
    Array.from({ length: ticketsToRender }, () => ({
      name: "",
      phone: "",
      idNumber: "",
    })),
  );

  // Form state for payment details
  const [paymentDetails, setPaymentDetails] = useState({
    cardholderName: "",
    cardNumber: "",
    expiryDate: "",
    cvc: "",
  });

  const handleCompletePayment = async () => {
    if (!agreePolicy || isSubmitting) return;
    if (!tripId) {
      Alert.alert("Hata", "Tur bilgisi bulunamadı");
      return;
    }
    try {
      setIsSubmitting(true);
      const seats =
        seatNumbers.length > 0
          ? seatNumbers
          : Array.from({ length: ticketsToRender }, (_, i) => i + 1);
      const reservation = await createReservation.mutateAsync({
        tripId,
        seatNumbers: seats,
        notes: ticketDetails
          .map((t) => `${t.name}|${t.phone}|${t.idNumber}`)
          .join("; "),
      });
      await processPayment.mutateAsync({
        reservationId: reservation.id,
        paymentMethod: "card",
      });
      addPurchased(tripId);
      setShowQR(true);
    } catch (e) {
      Alert.alert(
        "Ödeme hatası",
        e instanceof Error ? e.message : "Rezervasyon oluşturulamadı",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showQR) {
    return <QRScreen onBack={() => setShowQR(false)} onHome={onHome} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor="transparent" translucent />
      <ImageBackground
        source={resolveImage("asset:ob2")}
        style={styles.backgroundImage}
        resizeMode="cover"
        blurRadius={8}
      >
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <View style={styles.overlay}>
            <View style={styles.overlayTint}>
              <AppHeader
                title="Ödemeyi Tamamla"
                showBack={false}
                titleColor="#FFFFFF"
                backgroundColor="transparent"
                left={
                  <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <BlurView
                      intensity={30}
                      tint="light"
                      style={styles.backButtonBlur}
                    >
                      <View style={styles.backButtonInner}>
                        <Ionicons name="chevron-back" size={22} color="black" />
                      </View>
                    </BlurView>
                  </TouchableOpacity>
                }
              />
              <View style={styles.contentCard}>
                <ScrollView
                  style={styles.scrollView}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.scrollContent}
                  keyboardShouldPersistTaps="handled"
                >
                  <View style={styles.cardHandle} />
                  <Text style={styles.title}>Bilet Detayları</Text>
                  {Array.from({ length: ticketsToRender }).map((_, idx) => {
                    const ticketIndex = idx + 1;
                    const badgeColor = badgeColors[idx % badgeColors.length];
                    return (
                      <View
                        style={styles.ticketSection}
                        key={`ticket-${ticketIndex}`}
                      >
                        <Badge
                          text={`Bilet: ${ticketIndex}`}
                          containerStyle={[
                            styles.ticketBadge,
                            { backgroundColor: badgeColor },
                          ]}
                          textStyle={styles.ticketBadgeText}
                        />
                        <LabeledInput
                          label="İsim Soyisim"
                          value={ticketDetails[idx]?.name || ""}
                          onChangeText={(text) => {
                            const newDetails = [...ticketDetails];
                            newDetails[idx] = {
                              ...newDetails[idx],
                              name: text,
                            };
                            setTicketDetails(newDetails);
                          }}
                          placeholder="İsim Soyisim Giriniz"
                          variant="filled"
                          size="md"
                        />
                        <LabeledInput
                          label="Telefon Numarası"
                          value={ticketDetails[idx]?.phone || ""}
                          onChangeText={(text) => {
                            const newDetails = [...ticketDetails];
                            newDetails[idx] = {
                              ...newDetails[idx],
                              phone: text,
                            };
                            setTicketDetails(newDetails);
                          }}
                          placeholder="+90"
                          keyboardType="phone-pad"
                          variant="filled"
                          size="md"
                        />
                        <LabeledInput
                          label="TC Kimlik No"
                          value={ticketDetails[idx]?.idNumber || ""}
                          onChangeText={(text) => {
                            const newDetails = [...ticketDetails];
                            newDetails[idx] = {
                              ...newDetails[idx],
                              idNumber: text,
                            };
                            setTicketDetails(newDetails);
                          }}
                          placeholder="TC Kimlik No Giriniz"
                          keyboardType="numeric"
                          variant="filled"
                          size="md"
                        />
                      </View>
                    );
                  })}

                  <SectionHeader
                    title={
                      <Text style={styles.sectionTitle}>Ödeme Bilgileri</Text>
                    }
                  />
                  <View style={styles.creditCardContainer}>
                    <View style={styles.creditCard}>
                      <View style={styles.cardHeader}>
                        <Text style={styles.cardName}>KART SAHİBİ ADI</Text>
                        <View style={styles.masterCardLogo}>
                          <View style={styles.circle1} />
                          <View style={styles.circle2} />
                        </View>
                      </View>
                      <Text style={styles.cardNumber}>**** **** **** ****</Text>
                      <View style={styles.cardFooter}>
                        <View>
                          <Text style={styles.cardLabel}>SKT</Text>
                          <Text style={styles.cardValue}>**/**</Text>
                        </View>
                        <View>
                          <Text style={styles.cardLabel}>CVC</Text>
                          <Text style={styles.cardValue}>***</Text>
                        </View>
                        <Text style={styles.masterCardText}>Master Card</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.paymentForm}>
                    <LabeledInput
                      label="İsim Soyisim"
                      value={paymentDetails.cardholderName}
                      onChangeText={(text) =>
                        setPaymentDetails((prev) => ({
                          ...prev,
                          cardholderName: text,
                        }))
                      }
                      placeholder="Kart üzerindeki isim"
                      variant="filled"
                      size="md"
                    />
                    <LabeledInput
                      label="Kart Numarası"
                      value={paymentDetails.cardNumber}
                      onChangeText={(text) =>
                        setPaymentDetails((prev) => ({
                          ...prev,
                          cardNumber: text,
                        }))
                      }
                      placeholder="0000 0000 0000 0000"
                      keyboardType="numeric"
                      variant="filled"
                      size="md"
                    />
                    <FormRow gap={16}>
                      <View style={styles.halfWidth}>
                        <LabeledInput
                          label="SKT"
                          value={paymentDetails.expiryDate}
                          onChangeText={(text) =>
                            setPaymentDetails((prev) => ({
                              ...prev,
                              expiryDate: text,
                            }))
                          }
                          placeholder="AA/YY"
                          keyboardType="numeric"
                          variant="filled"
                          size="md"
                          style={{ marginBottom: 0 }}
                        />
                      </View>
                      <View style={styles.halfWidth}>
                        <LabeledInput
                          label="CVC"
                          value={paymentDetails.cvc}
                          onChangeText={(text) =>
                            setPaymentDetails((prev) => ({
                              ...prev,
                              cvc: text,
                            }))
                          }
                          placeholder="000"
                          keyboardType="numeric"
                          variant="filled"
                          size="md"
                          style={{ marginBottom: 0 }}
                        />
                      </View>
                    </FormRow>
                  </View>

                  <View style={styles.agreementRow}>
                    <TouchableOpacity
                      onPress={() => setAgreePolicy(!agreePolicy)}
                      activeOpacity={0.8}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          agreePolicy && styles.checkboxChecked,
                        ]}
                      >
                        {agreePolicy && (
                          <Ionicons
                            name="checkmark"
                            size={12}
                            color="#FFFFFF"
                          />
                        )}
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.agreementTextWrap}
                      onPress={() => setShowPolicy(true)}
                    >
                      <Text style={styles.agreementText}>
                        Satın Alma Politikasını ve İptal/İade Sözleşmesini
                        okudum, onaylıyorum.
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <Button
                    title={isSubmitting ? "İşleniyor..." : "Ödemeyi Tamamla"}
                    onPress={handleCompletePayment}
                    disabled={!agreePolicy || isSubmitting}
                    variant="primary"
                    style={styles.paymentButton}
                  />
                </ScrollView>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </ImageBackground>
      <PolicyModal visible={showPolicy} onClose={() => setShowPolicy(false)} />
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
  keyboardContainer: {
    flex: 1,
  },
  overlay: {
    flex: 1,
  },
  overlayTint: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
  },
  backButtonBlur: { flex: 1 },
  backButtonInner: {
    flex: 1,
    backgroundColor: "#F7F7F9",
    opacity: 0.95,
    alignItems: "center",
    justifyContent: "center",
  },
  contentCard: {
    flex: 1,
    backgroundColor: "white",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: 5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 100,
  },
  cardHandle: {
    width: 50,
    height: 4,
    backgroundColor: "#E0E0E0",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 24,
  },
  ticketSection: {
    marginBottom: 30,
  },
  ticketBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  ticketBadge2: {
    backgroundColor: "#00BCD4",
  },
  ticketBadge3: {
    backgroundColor: "#E91E63",
  },
  ticketBadgeText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  halfWidth: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 24,
    marginTop: 10,
  },
  creditCardContainer: {
    marginBottom: 30,
  },
  creditCard: {
    backgroundColor: "#2C5530",
    borderRadius: 16,
    padding: 24,
    height: 200,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  cardName: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  masterCardLogo: {
    flexDirection: "row",
    alignItems: "center",
  },
  circle1: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FF5F00",
  },
  circle2: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#EB001B",
    marginLeft: -8,
  },
  cardNumber: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 2,
    marginBottom: 30,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  cardLabel: {
    color: "#CCCCCC",
    fontSize: 10,
    marginBottom: 4,
  },
  cardValue: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  masterCardText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  paymentForm: {},
  paymentButton: {
    backgroundColor: "#FF6B35",
    borderRadius: 25,
    paddingVertical: 18,
  },
  agreementRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 24,
  },
  checkbox: {
    width: 36,
    height: 36,
    borderRadius: 50,
    backgroundColor: "#E0E0E0",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: "#FF6B35",
    borderColor: "#FF6B35",
  },
  agreementTextWrap: {
    flex: 1,
  },
  agreementText: {
    fontSize: 16,
    color: "#212225",
    lineHeight: 20,
  },
});
