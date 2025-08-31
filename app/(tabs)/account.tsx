import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BackgroundLayout } from "@/components/BackgroundLayout";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useAuth } from "@/context/AuthContext";
import { signOut } from "@/lib/supabase";

export default function AccountScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    setLoading(true);
    try {
      const { error } = await signOut();

      if (error) {
        Alert.alert("Error", error.message);
        return;
      }

      router.replace("/language" as any);
    } catch (error) {
      Alert.alert("Error", "Failed to sign out. Please try again.");
      console.error("Sign out error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    router.replace("/language" as any);
    return null;
  }

  return (
    <BackgroundLayout>
      <SafeAreaView style={styles.container}>
        <ThemedText type="title" style={styles.title}>
          Account
        </ThemedText>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ThemedView style={styles.card}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Profile Information
            </ThemedText>
            <ThemedText style={styles.infoItem}>Email: {user.email}</ThemedText>
          </ThemedView>

          <ThemedView style={styles.card}>
            <TouchableOpacity style={[styles.signOutButton, loading && { opacity: 0.7 }]} onPress={handleSignOut} disabled={loading}>
              {loading ? <ActivityIndicator color="white" size="small" /> : <ThemedText style={styles.signOutButtonText}>SIGN OUT</ThemedText>}
            </TouchableOpacity>
          </ThemedView>
        </ScrollView>
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
    marginBottom: 20,
    textAlign: "center",
  },
  scrollContent: {
    paddingBottom: 30,
  },
  card: {
    width: "100%",
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 15,
  },
  infoItem: {
    marginBottom: 10,
    fontSize: 16,
  },
  signOutButton: {
    width: "100%",
    height: 50,
    backgroundColor: "#ff3b30",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  signOutButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
