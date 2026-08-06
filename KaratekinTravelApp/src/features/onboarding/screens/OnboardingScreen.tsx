// moved from src/screens/OnboardingScreen.tsx
import React, { useRef, useState } from "react";
import { Button } from "@/shared/ui";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import PagerView, { type PagerViewRef } from "@/shims/react-native-pager-view";
import { OnboardingScreenProps } from "@/types";
import { resolveImage } from "@/core/data/schemas";
import { useSupportingData } from "@/features/trips/hooks";
import { LoadingView, ErrorView } from "@/shared/ui";

const { width, height } = Dimensions.get("window");

export default function OnboardingScreen({
  onComplete,
}: OnboardingScreenProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const pagerRef = useRef<PagerViewRef | null>(null);
  const { data: supporting, isLoading, isError, refetch } = useSupportingData();
  if (isLoading) return <LoadingView />;
  if (isError) return <ErrorView onRetry={refetch} />;
  const slides = supporting?.onboarding ?? [];

  const handleNext = () => {
    if (currentPage < slides.length - 1) {
      const nextPage = currentPage + 1;
      pagerRef.current?.setPage(nextPage);
      setCurrentPage(nextPage);
    } else {
      onComplete();
    }
  };

  const onPageSelected = (event: any) => {
    setCurrentPage(event.nativeEvent.position);
  };

  const renderPage = (item: any, index: number) => {
    const isLastPage = index === slides.length - 1;

    return (
      <View key={item.id} style={styles.pageContainer}>
        <StatusBar style="dark" backgroundColor="transparent" translucent />

        {/* Image Container */}
        <View style={styles.imageContainer}>
          <Image
            source={resolveImage(item.image)}
            style={styles.illustrationImage}
            resizeMode="cover"
          />
        </View>

        {/* Content Container */}
        <View style={styles.contentContainer}>
          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>{item.title}</Text>
            <View style={styles.underline} />
          </View>

          {/* Description */}
          <Text style={styles.description}>{item.description}</Text>

          {/* Page Indicators */}
          <View style={styles.paginationContainer}>
            {slides.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.paginationDot,
                  i === currentPage
                    ? styles.paginationDotActive
                    : styles.paginationDotInactive,
                ]}
              />
            ))}
          </View>

          {/* Next/Get Started Button */}
          <Button
            title={isLastPage ? "Get Started" : "Next"}
            onPress={handleNext}
            variant="primary"
            style={styles.nextButton}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <PagerView
        ref={pagerRef}
        style={styles.pagerView}
        initialPage={0}
        onPageSelected={onPageSelected}
      >
        {slides.map((item, index) => (
          <View key={item.id}>{renderPage(item, index)}</View>
        ))}
      </PagerView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  pagerView: {
    flex: 1,
  },
  pageContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  imageContainer: {
    flex: 0.6,
    width: width,
    overflow: "hidden",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  illustrationImage: {
    width: "100%",
    height: "100%",
  },
  contentContainer: {
    flex: 0.4,
    paddingHorizontal: 32,
    paddingVertical: 40,
    justifyContent: "space-between",
    alignItems: "center",
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  titleText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2C3E50",
    textAlign: "center",
    lineHeight: 36,
    marginBottom: 8,
  },
  underline: {
    width: 60,
    height: 3,
    backgroundColor: "#FF6B35",
    borderRadius: 2,
  },
  description: {
    fontSize: 16,
    color: "#7F8C8D",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  paginationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: "#24BAEC",
    width: 24,
  },
  paginationDotInactive: {
    backgroundColor: "#E0E7FF",
  },
  nextButton: {
    backgroundColor: "#24BAEC",
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 25,
    width: width - 64,
    alignItems: "center",
    shadowColor: "#24BAEC",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
