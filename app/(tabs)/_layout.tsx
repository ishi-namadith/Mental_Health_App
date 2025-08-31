import { useAuth } from "@/context/AuthContext";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
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
        <Tabs.Screen
          name="video-player"
          options={{
          href: null,
        }}
        />
      </Tabs>
    );
  }
  return null;
}
