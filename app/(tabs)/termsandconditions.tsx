import { useRouter } from "expo-router";
import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BackgroundLayout } from "@/components/BackgroundLayout";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

export default function TermsScreen() {
  const router = useRouter();
  const [accepted, setAccepted] = useState(false);

  const handleAgree = () => {
    router.push("/language");
  };

  const toggleAccept = () => {
    setAccepted(!accepted);
  };

  return (
    <BackgroundLayout>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }} keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}>
          <ThemedText type="title" style={styles.title}>
            Terms & Conditions
          </ThemedText>

          <ScrollView style={styles.termsContainer}>
            <ThemedText>Welcome to our Mental Health App. Before you proceed, please read and agree to the following terms and conditions:</ThemedText>

            <ThemedText style={styles.paragraph}>1. Privacy Policy: We take your privacy seriously. This app collects certain information to provide you with a personalized experience. All data is encrypted and stored securely.</ThemedText>

            <ThemedText style={styles.paragraph}>2. User Data: Your personal information and usage data will only be used to improve your experience and will not be shared with third parties without your explicit consent.</ThemedText>

            <ThemedText style={styles.paragraph}>3. Medical Disclaimer: This app is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have.</ThemedText>

            <ThemedText style={styles.paragraph}>4. Content Usage: All content provided in this app is for informational purposes only. Users are not permitted to reproduce, distribute, or commercially exploit the content.</ThemedText>

            <ThemedText style={styles.paragraph}>5. User Responsibilities: Users are responsible for maintaining the confidentiality of their account details and for all activities that occur under their account.</ThemedText>
          </ScrollView>

          <ThemedView style={styles.acceptContainer}>
            <TouchableOpacity style={styles.checkbox} onPress={toggleAccept}>
              <ThemedView style={[styles.checkboxInner, accepted ? styles.checkboxChecked : {}]} />
            </TouchableOpacity>
            <ThemedText>I have read and agree to the terms and conditions</ThemedText>
          </ThemedView>

          <TouchableOpacity style={[styles.agreeButton, !accepted && styles.agreeButtonDisabled]} onPress={handleAgree} disabled={!accepted}>
            <ThemedText style={styles.agreeButtonText}>CONTINUE</ThemedText>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </BackgroundLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: "transparent",
  },
  title: {
    marginBottom: 30,
    textAlign: "center",
  },
  termsContainer: {
    flex: 1,
    marginBottom: 20,
  },
  paragraph: {
    marginTop: 15,
  },
  acceptContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "transparent",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#333",
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxInner: {
    width: 16,
    height: 16,
  },
  checkboxChecked: {
    backgroundColor: "#0a7ea4",
  },
  agreeButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#333",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  agreeButtonDisabled: {
    backgroundColor: "#999",
  },
  agreeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
