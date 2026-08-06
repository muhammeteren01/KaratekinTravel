import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";

export interface FormRowProps {
  children: React.ReactNode;
  gap?: number;
  justify?: "space-between" | "flex-start" | "flex-end" | "center";
  style?: ViewStyle;
}

const FormRow: React.FC<FormRowProps> = ({
  children,
  gap = 16,
  justify = "space-between",
  style,
}) => {
  return (
    <View
      style={[
        styles.container,
        {
          gap,
          justifyContent: justify,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
});

export default FormRow;
