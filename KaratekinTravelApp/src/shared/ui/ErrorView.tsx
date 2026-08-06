import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Button from "./Button";

type ErrorViewProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
};

export default function ErrorView({
  title = "Bir şeyler ters gitti",
  message = "Veriler yüklenirken hata oluştu.",
  onRetry,
}: ErrorViewProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <Button
          title="Tekrar Dene"
          onPress={onRetry}
          variant="primary"
          style={styles.button}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    padding: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1B1E28",
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#FF7029",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
});
