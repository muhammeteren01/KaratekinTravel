import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useRouteStops } from "@/core/data/store";
import { LoadingView, ErrorView, Button } from "@/shared/ui";
import Badge from "@/shared/ui/Badge";
import { resolveImage } from "@/core/data/schemas";
import { AppHeader } from "@/shared/ui";

interface RouteScreenProps {
  onBack: () => void;
}

export default function RouteScreen({ onBack }: RouteScreenProps) {
  const {
    data: routeStopsRaw = [],
    isLoading,
    isError,
    refetch,
  } = useRouteStops();
  if (isLoading) return <LoadingView />;
  if (isError) return <ErrorView onRetry={refetch} />;
  const routeStops = routeStopsRaw.map((s) => ({
    ...s,
    image: resolveImage(s.image) as any,
  }));

  // Compute bottom of the last stop to size the route container precisely
  const lastStopBottom = Math.max(...routeStops.map((s) => s.top + s.height));

  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor="transparent" translucent />

      <ImageBackground
        source={resolveImage("asset:bg1")}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <ScrollView
            style={styles.mainScrollView}
            showsVerticalScrollIndicator={false}
          >
            <AppHeader
              title="Rota"
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

            {/* Route Container */}
            <View
              style={[styles.routeContainer, { height: lastStopBottom + 24 }]}
            >
              {/* Route Stops */}
              {routeStops.map((stop) => {
                const cardStyle = {
                  width: stop.width,
                  height: stop.height,
                } as const;
                const timelineOnLeft = stop.timelineAlign === "left";
                const sideStyle =
                  stop.side === "left"
                    ? { left: stop.sideOffset }
                    : { right: stop.sideOffset };
                return (
                  <View
                    key={stop.id}
                    style={[styles.routeStop, { top: stop.top }, sideStyle]}
                  >
                    {/* Timeline */}
                    <View
                      style={[
                        styles.timelineContainer,
                        timelineOnLeft ? { left: -30 } : { right: -30 },
                        { height: stop.height },
                      ]}
                    >
                      <View style={styles.timelineLine} />
                      <View style={styles.timelineDotOuter}>
                        <View style={styles.timelineDotInner} />
                      </View>
                    </View>

                    {/* Glass Stop Card */}
                    <BlurView
                      intensity={200}
                      tint="dark"
                      style={[styles.stopCard, cardStyle]}
                    >
                      <View style={styles.stopCardInner}>
                        <Image source={stop.image} style={styles.stopImage} />
                        <View style={styles.stopInfo}>
                          <Text style={styles.stopTitle}>{stop.title}</Text>
                          <Text style={styles.stopTime}>{stop.time}</Text>
                        </View>
                      </View>
                    </BlurView>
                  </View>
                );
              })}
            </View>

            {/* Bottom Card */}
            <BlurView intensity={200} tint="dark" style={styles.bottomCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Amasra Otel</Text>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={14} color="#FFD336" />
                  <Text style={styles.ratingText}>4.7</Text>
                </View>
              </View>

              <View style={styles.cardTopRow}>
                <View style={styles.cardLocationInfo}>
                  <Ionicons name="location-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.infoText}>Amasra, Türkiye</Text>
                </View>

                <View style={styles.avatarsContainer}>
                  <Image
                    source={{
                      uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face&auto=format",
                    }}
                    style={styles.smallAvatar}
                  />
                  <Image
                    source={{
                      uri: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=50&h=50&fit=crop&crop=face&auto=format",
                    }}
                    style={[styles.smallAvatar, styles.avatarOverlap]}
                  />
                  <Image
                    source={{
                      uri: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=50&h=50&fit=crop&crop=face&auto=format",
                    }}
                    style={[styles.smallAvatar, styles.avatarOverlap]}
                  />
                  <Badge
                    text={"+50"}
                    containerStyle={styles.countBadge}
                    textStyle={styles.countBadgeText}
                  />
                </View>
              </View>

              <View style={styles.stayInfo}>
                <Ionicons name="time-outline" size={16} color="#FFFFFF" />
                <Text style={styles.stayText}>1 Gün Konaklama</Text>
              </View>

              <Button
                title="Haritada Görüntüle"
                onPress={() => {}}
                variant="primary"
                style={styles.mapButton}
              />
            </BlurView>
          </ScrollView>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  mainScrollView: {
    flex: 1,
    paddingTop: 16,
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
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
  routeContainer: {
    flex: 1,
    position: "relative",
    paddingHorizontal: 20,
  },
  routeStop: {
    position: "absolute",
    zIndex: 20,
  },
  stopCard: {
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#3E3E3E",
    opacity: 0.9,
  },
  stopCardInner: {
    flex: 1,
    flexDirection: "row",
    paddingHorizontal: 9,
    paddingVertical: 8,
    alignItems: "center",
  },
  stopImage: {
    width: 63,
    height: 62,
    borderRadius: 16,
    marginRight: 16,
  },
  stopInfo: {
    flex: 1,
  },
  stopTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  stopTime: {
    fontSize: 14,
    color: "#FFFFFF",
  },
  timelineContainer: {
    position: "absolute",
    top: 14,
    width: 24,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  timelineLine: {
    position: "absolute",
    top: 0,
    width: 2,
    height: 50,
    backgroundColor: "#3E3E3E",
    borderRadius: 1,
  },
  timelineDotOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#3E3E3E",
    alignItems: "center",
    justifyContent: "center",
  },
  timelineDotInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FF6B35",
  },
  bottomCard: {
    backgroundColor: "#3E3E3E",
    opacity: 0.9,
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 60,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 15,
    color: "#FFFFFF",
    marginLeft: 4,
    fontWeight: "400",
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardLocationInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  infoText: {
    fontSize: 13,
    color: "#FFFFFF",
    marginLeft: 6,
    letterSpacing: 0.3,
  },
  avatarsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  smallAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    marginLeft: -6,
  },
  avatarOverlap: {
    marginLeft: -6,
  },
  countBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#24BAEC",
    justifyContent: "center",
    alignItems: "center",
  },
  countBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "white",
  },
  stayInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  stayText: {
    fontSize: 14,
    color: "#FFFFFF",
    marginLeft: 6,
  },
  mapButton: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#24BAEC",
  },
});
