import { AuthProvider, useAuth } from "@/context/AuthContext";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Auth protection component to redirect users based on authentication status
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // Get current route
    const currentRoute = segments.join("/");

    if (!user) {
      // If user is not authenticated and trying to access protected routes (except login)
      if (currentRoute !== "(tabs)/index" && currentRoute.startsWith("(tabs)/")) {
        router.push("/");
      }
    } else {
      // If user is authenticated and trying to access login screen
      if (currentRoute === "(tabs)/index") {
        router.push("/(tabs)/dashboard");
      }
    }
  }, [user, segments, isLoading, router]);

  return <>{children}</>;
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    return null;
  }

  // Always use light theme
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider value={DefaultTheme}>
          <AuthGuard>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
          </AuthGuard>
          <StatusBar style="light" />
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
