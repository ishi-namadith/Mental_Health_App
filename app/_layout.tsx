import { AuthProvider, useAuth } from "@/context/AuthContext";
import { LanguageProvider, useLanguage } from "@/context/LanguageContext";
import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const { selectedLanguage, isLoading: languageLoading } = useLanguage();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading || languageLoading) return;

    // Get current route
    const currentRoute = segments.join("/");

    if (!user) {
      // If user is not authenticated and trying to access protected routes
      if (currentRoute.startsWith("(tabs)/")) {
        // Check if language is selected, if not go to language selection
        if (!selectedLanguage) {
          router.replace("/language");
        } else {
          router.replace("/login");
        }
      }
    } else {
      // If user is authenticated and trying to access onboarding screens
      // Allow language screen for authenticated users (for changing language settings)
      if (currentRoute === "terms" || currentRoute === "login" || currentRoute === "signup") {
        router.replace("/(tabs)/dashboard");
      }
    }
  }, [user, selectedLanguage, segments, isLoading, languageLoading, router]);

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
      <LanguageProvider>
        <AuthProvider>
          <ThemeProvider value={DefaultTheme}>
            <AuthGuard>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
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
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
