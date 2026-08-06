import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AppHeader, Button } from "@/shared/ui";

interface EmailVerificationScreenProps {
  onVerify: () => void;
  onBack: () => void;
  email: string;
}

export default function EmailVerificationScreen({
  onVerify,
  onBack,
  email,
}: EmailVerificationScreenProps) {
  const [code, setCode] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(86); // 1:26 = 86 seconds
  const inputRefs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleCodeChange = (value: string, index: number) => {
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleBackspace = (index: number) => {
    if (index > 0 && !code[index]) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleVerify = () => {
    onVerify();
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor="transparent" translucent />

      <AppHeader title="Mail Doğrulama" onBack={onBack} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          bounces={false}
        >
          <View style={styles.content}>
            <View style={styles.headerContainer}>
              <Text style={styles.title}>Mail Doğrulama</Text>
              <Text style={styles.subtitle}>
                Doğrulama kodunu görmek için lütfen{"\n"}
                <Text style={styles.emailText}>
                  {email || "turlagitsin@gmail.com"}
                </Text>{" "}
                adresindeki{"\n"}
                e-postanızı kontrol edin.
              </Text>
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.codeLabel}>Doğrulama Kodu</Text>

              <View style={styles.codeContainer}>
                {code.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={inputRefs[index]}
                    style={styles.codeInput}
                    value={digit}
                    onChangeText={(value) => handleCodeChange(value, index)}
                    onKeyPress={({ nativeEvent }) => {
                      if (nativeEvent.key === "Backspace") {
                        handleBackspace(index);
                      }
                    }}
                    maxLength={1}
                    keyboardType="numeric"
                    textAlign="center"
                  />
                ))}
              </View>

              <Button
                title="Doğrula"
                onPress={handleVerify}
                variant="primary"
                style={styles.verifyButton}
              />

              <View style={styles.timerContainer}>
                <Text style={styles.timerText}>Kodu yeniden gönder</Text>
                <Text style={styles.timer}>{formatTime(timer)}</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    marginTop: 50,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  headerContainer: {
    marginBottom: 40,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    lineHeight: 24,
  },
  emailText: {
    color: "#333",
    fontWeight: "500",
  },
  formContainer: {
    marginBottom: 60,
  },
  codeLabel: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 32,
  },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 40,
    paddingHorizontal: 16,
  },
  codeInput: {
    width: 60,
    height: 60,
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  verifyButton: {
    backgroundColor: "#24BAEC",
    marginBottom: 24,
  },
  timerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  timerText: {
    fontSize: 14,
    color: "#999",
  },
  timer: {
    fontSize: 14,
    color: "#999",
  },
});
