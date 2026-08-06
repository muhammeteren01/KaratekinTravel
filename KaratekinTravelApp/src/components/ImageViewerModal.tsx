import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  Image,
  TouchableOpacity,
  Text,
  ImageSourcePropType,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FullscreenModal } from "@/shared/ui";

interface ImageViewerModalProps {
  visible: boolean;
  images: ImageSourcePropType[];
  initialIndex?: number;
  onClose: () => void;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  visible,
  images,
  initialIndex = 0,
  onClose,
}) => {
  const listRef = useRef<FlatList>(null);
  const [index, setIndex] = useState(initialIndex);

  const safeImages = useMemo(() => images || [], [images]);

  useEffect(() => {
    if (visible) {
      setIndex(Math.min(initialIndex, Math.max(0, safeImages.length - 1)));
      requestAnimationFrame(() => {
        listRef.current?.scrollToIndex({
          index: initialIndex,
          animated: false,
        });
      });
    }
  }, [visible, initialIndex, safeImages.length]);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      const newIndex = viewableItems[0].index ?? 0;
      setIndex(newIndex);
    }
  }).current;

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const renderItem = ({ item }: { item: ImageSourcePropType }) => (
    <View style={styles.slide}>
      <Image source={item} style={styles.image} resizeMode="contain" />
    </View>
  );

  return (
    <FullscreenModal
      visible={visible}
      onRequestClose={onClose}
      backdropColor="rgba(0,0,0,0.95)"
      animationType="fade"
    >
      <View style={styles.backdrop}>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={onClose}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Kapat"
        >
          <Ionicons name="close" size={26} color="#FFF" />
        </TouchableOpacity>

        <FlatList
          ref={listRef}
          data={safeImages}
          keyExtractor={(_, i) => `img-${i}`}
          renderItem={renderItem}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          initialScrollIndex={Math.min(
            initialIndex,
            Math.max(0, safeImages.length - 1),
          )}
          getItemLayout={(_, i) => ({
            length: screenWidth,
            offset: screenWidth * i,
            index: i,
          })}
        />

        <View style={styles.counter}>
          <Text style={styles.counterText}>
            {safeImages.length > 0 ? index + 1 : 0}/{safeImages.length}
          </Text>
        </View>
      </View>
    </FullscreenModal>
  );
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.95)" },
  closeBtn: {
    position: "absolute",
    top: 48,
    right: 16,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  slide: {
    width: screenWidth,
    height: screenHeight,
    alignItems: "center",
    justifyContent: "center",
  },
  image: { width: screenWidth, height: screenHeight },
  counter: {
    position: "absolute",
    bottom: 28,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  counterText: { color: "#FFF", fontWeight: "700" },
});

export default ImageViewerModal;
