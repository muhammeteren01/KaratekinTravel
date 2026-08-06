import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { resolveImage } from "@/core/data/schemas";
import { OverlayModal, ModalHeader } from "@/shared/ui";

interface BusGalleryModalProps {
  visible: boolean;
  onClose: () => void;
  companyName: string;
  busImages?: any[];
}

const BusGalleryModal: React.FC<BusGalleryModalProps> = ({
  visible,
  onClose,
  companyName,
  busImages = [],
}) => {
  // Default bus images if none provided (JSON-driven via asset keys)
  const defaultImages = [
    resolveImage("asset:ob1"),
    resolveImage("asset:ob2"),
    resolveImage("asset:ob3"),
    resolveImage("asset:ob1"),
    resolveImage("asset:ob2"),
    resolveImage("asset:ob3"),
    resolveImage("asset:ob1"),
    resolveImage("asset:ob2"),
    resolveImage("asset:ob3"),
  ] as any[];

  const imagesToShow = busImages.length > 0 ? busImages : defaultImages;
  const [selectedImageIndex, setSelectedImageIndex] = React.useState(0);

  return (
    <OverlayModal visible={visible} onRequestClose={onClose}>
      <ModalHeader
        title="Otobüs Görselleri"
        subtitle={companyName}
        right={
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#24BAEC" />
          </TouchableOpacity>
        }
      />

      {/* Main Bus Image */}
      <View style={styles.mainImageContainer}>
        <Image
          source={imagesToShow[selectedImageIndex]}
          style={styles.mainBusImage}
          resizeMode="cover"
        />
      </View>

      {/* Image Gallery */}
      <View style={styles.galleryContainer}>
        <View style={styles.galleryGrid}>
          {/* First Row - 5 images */}
          <View style={styles.galleryRow}>
            {imagesToShow.slice(0, 5).map((image, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.galleryItem,
                  selectedImageIndex === index && styles.selectedGalleryItem,
                ]}
                onPress={() => setSelectedImageIndex(index)}
              >
                <Image
                  source={image}
                  style={[
                    styles.galleryImage,
                    index === 4 && styles.lastImageOverlay,
                  ]}
                  resizeMode="cover"
                />
                {index === 4 && (
                  <View style={styles.imageOverlay}>
                    <Text style={styles.moreText}>+4</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Second Row - 4 images */}
          <View style={styles.galleryRow}>
            {imagesToShow.slice(5, 9).map((image, index) => (
              <TouchableOpacity
                key={index + 5}
                style={[
                  styles.galleryItem,
                  selectedImageIndex === index + 5 &&
                    styles.selectedGalleryItem,
                ]}
                onPress={() => setSelectedImageIndex(index + 5)}
              >
                <Image
                  source={image}
                  style={styles.galleryImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
            {/* Empty space for alignment */}
            <View style={styles.galleryItem} />
          </View>
        </View>
      </View>
    </OverlayModal>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    marginTop: 24,
    gap: 138,
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "500",
    color: "#1B1E28",
    letterSpacing: 0.5,
    lineHeight: 32,
    width: 209,
  },
  companyName: {
    fontSize: 15,
    fontWeight: "400",
    color: "#7D848D",
    letterSpacing: 0.3,
    lineHeight: 20,
    marginTop: 4,
    width: 72,
  },
  closeButton: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  mainImageContainer: {
    marginHorizontal: 20,
    marginTop: 18,
    borderRadius: 12,
    overflow: "hidden",
    height: 234,
  },
  mainBusImage: {
    width: "100%",
    height: "100%",
  },
  galleryContainer: {
    paddingHorizontal: 30,
    marginTop: 22,
    height: 98,
  },
  galleryGrid: {
    flex: 1,
  },
  galleryRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 14,
    gap: 26,
  },
  galleryItem: {
    width: 42,
    height: 42,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  galleryImage: {
    width: "100%",
    height: "100%",
  },
  lastImageOverlay: {
    opacity: 0.8,
  },
  moreText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  selectedGalleryItem: {
    borderWidth: 2,
    borderColor: "#24BAEC",
  },
});

export default BusGalleryModal;
