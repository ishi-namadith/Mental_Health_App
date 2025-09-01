import { useAuth } from "@/context/AuthContext";
import { Redirect } from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";

export default function IndexScreen() {
  const { user, isLoading, error } = useAuth();;

  // Show loading spinner
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
        <ActivityIndicator size="large" color="#0a7ea4" />
        <Text style={{ marginTop: 10, color: "#666" }}>Loading...</Text>
      </View>
    );
  }

  // Show error if there's an auth error
  if (error) {
    console.error("Auth error:", error);
    return <Redirect href="/language" />;
  }

  // Redirect based on auth state
  if (user) {
    return <Redirect href="/(tabs)/dashboard" />;
  } else {
    return <Redirect href="/language" />;
  }
}
