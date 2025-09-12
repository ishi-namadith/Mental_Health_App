import { useRouter } from "expo-router";
import React from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BackgroundLayout } from "@/components/BackgroundLayout";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useLanguage } from "@/context/LanguageContext";
import { useThemeColor } from "@/hooks/useThemeColor";

export default function LanguageSelectionScreen() {
  const router = useRouter();
  const { setLanguage } = useLanguage();
  const inputBackgroundColor = useThemeColor({}, "background");

  const handleLanguageSelect = async (language: "English" | "Sinhala") => {
    try {
      await setLanguage(language);
      router.push("/terms" as any);
    } catch (error) {
      console.error("Error setting language:", error);
      // You could add error handling/toast here if needed
    }
  };

  return (
    <BackgroundLayout>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }} keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}>
          <ThemedView style={styles.centerContent}>
            <ThemedText type="title" style={styles.title}>
              Language Selection
            </ThemedText>

            <ThemedView style={styles.languageContainer}>
              <TouchableOpacity style={[styles.languageButton, { backgroundColor: inputBackgroundColor }]} onPress={() => handleLanguageSelect("Sinhala")}>
                <ThemedText style={styles.languageText}>Sinhala</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.languageButton, { backgroundColor: inputBackgroundColor }]} onPress={() => handleLanguageSelect("English")}>
                <ThemedText style={styles.languageText}>English</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </BackgroundLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  centerContent: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "transparent",
  },
  title: {
    marginBottom: 40,
    textAlign: "center",
  },
  languageContainer: {
    width: "100%",
    alignItems: "center",
    gap: 16,
    maxWidth: 300,
    backgroundColor: "transparent",
  },
  languageButton: {
    width: 200,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
  },
  languageText: {
    fontSize: 16,
    fontWeight: "500",
  },
  smallText: {
    fontSize: 14,
  },
});
