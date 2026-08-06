import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  StyleProp,
} from "react-native";

export interface ModalHeaderProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
}

export default function ModalHeader({
  title,
  subtitle,
  right,
  containerStyle,
  titleStyle,
  subtitleStyle,
}: ModalHeaderProps) {
  return (
    <View style={[styles.header, containerStyle]}>
      <View style={styles.titleWrap}>
        <Text style={[styles.title, titleStyle]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, subtitleStyle]}>{subtitle}</Text>
        ) : null}
      </View>
      <View style={styles.right}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 4,
    marginTop: 12,
  },
  titleWrap: { flex: 1 },
  title: {
    fontSize: 24,
    fontWeight: "500",
    color: "#1B1E28",
    letterSpacing: 0.5,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 15,
    color: "#7D848D",
    letterSpacing: 0.3,
    lineHeight: 20,
    marginTop: 4,
  },
  right: { marginLeft: 12, alignItems: "center", justifyContent: "center" },
});
