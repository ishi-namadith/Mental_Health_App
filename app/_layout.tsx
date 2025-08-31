import { AuthProvider, useAuth } from "@/context/AuthContext";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // Get current route
    const currentRoute = segments.join("/");

    if (!user) {
      // If user is not authenticated and trying to access protected routes
      if (currentRoute.startsWith("(tabs)/") || currentRoute === "") {
        router.replace("/language");
      }
    } else {
      // If user is authenticated and trying to access onboarding screens
      if (currentRoute === "language" || currentRoute === "terms" || currentRoute === "login" || currentRoute === "signup" || currentRoute === "") {
        router.replace("/(tabs)/dashboard");
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
              <Stack.Screen name="language" />
              <Stack.Screen name="terms" />
              <Stack.Screen name="login" />
              <Stack.Screen name="signup" />
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
