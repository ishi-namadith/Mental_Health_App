import { useAuth } from "@/context/AuthContext";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Stack, Tabs } from "expo-router";
import { Platform } from "react-native";

export default function TabsLayout() {
  const { user } = useAuth();
  if (user) {
    return (
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#0a7ea4",
          tabBarInactiveTintColor: "#999",
          tabBarStyle: {
            backgroundColor: "#fff",
            borderTopWidth: 1,
            borderTopColor: "#e0e0e0",
            paddingBottom: Platform.OS === "ios" ? 20 : 5,
            height: Platform.OS === "ios" ? 85 : 65,
          },
        }}
      >
        <Tabs.Screen
          name="dashboard"
          options={{
            title: "Dashboard",
            tabBarIcon: ({ color }) => <FontAwesome size={24} name="home" color={color} />,
          }}
        />
        <Tabs.Screen
          name="account"
          options={{
            title: "Account",
            tabBarIcon: ({ color }) => <FontAwesome size={24} name="user" color={color} />,
          }}
        />
        {/* Hide these screens from tabs but keep them accessible */}
        <Tabs.Screen
          name="index"
          options={{
            tabBarButton: () => null,
          }}
        />
        <Tabs.Screen
          name="signup"
          options={{
            tabBarButton: () => null,
          }}
        />
        <Tabs.Screen
          name="termsandconditions"
          options={{
            tabBarButton: () => null,
          }}
        />
        <Tabs.Screen
          name="language"
          options={{
            tabBarButton: () => null,
          }}
        />
        <Tabs.Screen
          name="video-player"
          options={{
            tabBarButton: () => null,
          }}
        />
      </Tabs>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: Platform.OS === "android" ? "none" : "default",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="termsandconditions" />
      <Stack.Screen name="language" />
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="account" />
      <Stack.Screen name="video-player" />
    </Stack>
  );
}
