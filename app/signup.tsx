import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BackgroundLayout } from "@/components/BackgroundLayout";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { signUp } from "@/lib/supabase";

export default function SignupScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const inputBackgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");

  const handleSignup = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const { error } = await signUp(email, password);

      if (error) {
        Alert.alert("Signup Error", error.message);
        return;
      }

      Alert.alert("Success", "Your account has been created. Please check your email for verification instructions.", [{ text: "OK", onPress: () => router.replace("/login" as any) }]);
    } catch (error) {
      Alert.alert("Unexpected Error", "An unexpected error occurred. Please try again.");
      console.error("Signup error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BackgroundLayout>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidView} keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}>
          <ThemedView style={styles.centerContent}>
            <ThemedText type="title" style={styles.title}>
              Sign Up
            </ThemedText>

            <ThemedView style={styles.inputContainer}>
              <TextInput style={[styles.input, { backgroundColor: inputBackgroundColor, color: textColor }]} placeholder="Email" placeholderTextColor="#888" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

              <TextInput style={[styles.input, { backgroundColor: inputBackgroundColor, color: textColor }]} placeholder="Password" placeholderTextColor="#888" secureTextEntry value={password} onChangeText={setPassword} />

              <TextInput style={[styles.input, { backgroundColor: inputBackgroundColor, color: textColor }]} placeholder="Confirm Password" placeholderTextColor="#888" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />

              <TouchableOpacity style={[styles.signupButton, loading && { opacity: 0.7 }]} onPress={handleSignup} disabled={loading}>
                {loading ? <ActivityIndicator color="white" size="small" /> : <ThemedText style={styles.signupButtonText}>SIGN UP</ThemedText>}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.replace("/login" as any)} style={styles.loginContainer}>
                <ThemedText>Already have an account? </ThemedText>
                <ThemedText style={{ fontWeight: "bold" }}>Login</ThemedText>
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
  },
  keyboardAvoidView: {
    flex: 1,
    justifyContent: "center",
  },
  centerContent: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 20,
    backgroundColor: "transparent",
  },
  title: {
    marginBottom: 40,
    textAlign: "center",
  },
  inputContainer: {
    width: "100%",
    alignItems: "center",
    gap: 16,
    backgroundColor: "transparent",
  },
  input: {
    width: "100%",
    height: 50,
    paddingHorizontal: 10,
    borderRadius: 4,
    fontSize: 16,
    backgroundColor: "transparent",
  },
  signupButton: {
    width: "40%",
    height: 50,
    backgroundColor: "#333",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  signupButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  loginContainer: {
    flexDirection: "row",
    marginTop: 20,
    alignItems: "center",
  },
});
