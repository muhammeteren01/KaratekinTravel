import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Badge from "@/shared/ui/Badge";
import { TripPricing } from "../types/trip";
import { formatCurrency as simpleFormatCurrency } from "../utils/formatCurrency";
import { OverlayModal, ModalHeader } from "@/shared/ui";

interface PriceInfoModalProps {
  visible: boolean;
  onClose: () => void;
  tripTitle?: string;
  pricing?: TripPricing;
}

function format(amount: number, currency: string = "USD") {
  return simpleFormatCurrency(amount, currency);
}

export default function PriceInfoModal({
  visible,
  onClose,
  tripTitle = "Amasra Turu",
  pricing,
}: PriceInfoModalProps) {
  const currency = pricing?.currency || "USD";
  const extrasTotal = useMemo(
    () => (pricing?.extras || []).reduce((s, e) => s + (e.amount || 0), 0),
    [pricing],
  );
  const discountAmount = pricing?.discount?.amount || 0;
  const total = Math.max(
    0,
    (pricing?.basePrice || 0) - discountAmount + extrasTotal,
  );
  return (
    <OverlayModal visible={visible} onRequestClose={onClose}>
      <ModalHeader
        title="Ücretlendirme"
        subtitle={tripTitle}
        right={
          <View style={styles.headerIconWrap}>
            <Ionicons name="information-circle" size={20} color="#7D848D" />
          </View>
        }
      />

      {/* Pricing Card */}
      <View style={styles.card}>
        {/* Row: Tur ücreti */}
        <View style={[styles.row, styles.rowSplit]}>
          <View style={styles.cellLeft}>
            <Text style={styles.cellTitle}>Tur ücreti</Text>
            {pricing?.discount?.label ? (
              <Badge
                text={pricing.discount.label}
                variant="neutral"
                containerStyle={styles.badge}
                textStyle={styles.badgeText}
              />
            ) : null}
          </View>
          <View style={styles.cellRight}>
            <Text style={styles.priceMain}>
              {format(pricing?.basePrice || 0, currency)}
            </Text>
            {discountAmount > 0 ? (
              <Text style={styles.priceDiscount}>
                -{format(discountAmount, currency)}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Row: Ek ücretler */}
        <View style={[styles.row, styles.rowSplit]}>
          <View style={styles.cellLeft}>
            <Text style={styles.cellTitle}>Ek ücretler</Text>
            <View style={styles.listCol}>
              {(pricing?.extras || []).map((ex, idx) => (
                <Text key={`ex-${idx}`} style={styles.listItem}>
                  {ex.label}
                </Text>
              ))}
            </View>
            <Text style={[styles.cellTitle, { marginTop: 8 }]}>
              Toplam Ek Ücret
            </Text>
          </View>
          <View style={styles.cellRight}>
            <View style={styles.listColRight}>
              {(pricing?.extras || []).map((ex, idx) => (
                <Text key={`exv-${idx}`} style={styles.listItemRight}>
                  {format(ex.amount || 0, currency)}
                </Text>
              ))}
            </View>
            <Text style={[styles.priceMain, { marginTop: 8 }]}>
              {format(extrasTotal, currency)}
            </Text>
          </View>
        </View>

        {/* Row: Toplam Tutar */}
        <View style={[styles.row, styles.totalRow]}>
          <Text style={styles.totalTitle}>Toplam Tutar</Text>
          <Text style={styles.totalValue}>{format(total, currency)}</Text>
        </View>
      </View>

      {/* Close button */}
      <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
        <Text style={styles.closeBtnText}>Kapat</Text>
      </TouchableOpacity>
    </OverlayModal>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 6,
    marginBottom: 16,
  },
  headerIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#F7F7F9",
    borderRadius: 16,
    padding: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
  },
  rowSplit: {
    borderBottomWidth: 1,
    borderBottomColor: "#E7EBF4",
  },
  cellLeft: {
    flex: 3,
    paddingHorizontal: 8,
  },
  cellRight: {
    flex: 2,
    alignItems: "flex-end",
    paddingHorizontal: 8,
  },
  cellTitle: {
    fontSize: 20,
    fontWeight: "500",
    color: "#333333",
  },
  badge: {
    alignSelf: "flex-start",
    marginTop: 8,
    backgroundColor: "#FBD1BC",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#333333",
  },
  priceMain: {
    fontSize: 20,
    fontWeight: "500",
    color: "#333333",
  },
  priceDiscount: {
    fontSize: 20,
    color: "#333333",
    opacity: 0.8,
    marginTop: 8,
  },
  listCol: {
    marginTop: 8,
    gap: 4,
  },
  listItem: {
    fontSize: 12,
    fontWeight: "300",
    color: "#333333",
    lineHeight: 20,
  },
  listColRight: {
    marginTop: 8,
    gap: 4,
    alignItems: "flex-end",
  },
  listItemRight: {
    fontSize: 12,
    fontWeight: "300",
    color: "#333333",
    lineHeight: 20,
  },
  totalRow: {
    paddingVertical: 16,
  },
  totalTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    color: "#333333",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333333",
  },
  closeBtn: {
    marginTop: 16,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#24BAEC",
    borderRadius: 12,
  },
  closeBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    paddingVertical: 10,
    paddingHorizontal: 100,
  },
});
