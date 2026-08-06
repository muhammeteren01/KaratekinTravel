import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { OverlayModal, ModalHeader } from "@/shared/ui";

interface PolicyModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function PolicyModal({ visible, onClose }: PolicyModalProps) {
  return (
    <OverlayModal visible={visible} onRequestClose={onClose}>
      <ModalHeader title="İptal ve Değişim Politikası" />
      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.paragraph}>
          Rezervasyon iptallerinizi, turun başlangıç tarihinden en az 7 gün önce
          bildirmeniz halinde ücretin tamamı iade edilir.
        </Text>
        <Text style={styles.paragraph}>
          Tur başlangıcına 3-6 gün kala yapılan iptallerde ücretin %50’si iade
          edilir.
        </Text>
        <Text style={styles.paragraph}>
          Son 72 saat içinde yapılan iptallerde herhangi bir iade yapılmaz.
        </Text>
        <Text style={styles.paragraph}>
          Tarih değişikliği talepleri, turun başlamasına en az 5 gün kala
          yapılmalıdır ve uygunluk durumuna göre değerlendirilir.
        </Text>
        <Text style={styles.paragraph}>
          Hava koşulları, yeterli katılım olmaması veya mücbir sebepler
          nedeniyle turun iptali durumunda, ücretin tamamı iade edilir veya
          isterseniz başka bir tur ile değişim yapılabilir.
        </Text>
      </ScrollView>
    </OverlayModal>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 8 },
  body: {
    marginTop: 8,
  },
  paragraph: {
    fontSize: 13,
    lineHeight: 22,
    color: "#000000",
    marginBottom: 10,
    textAlign: "justify",
  },
});
