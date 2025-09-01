import { useAuth } from "@/context/AuthContext";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Redirect, Tabs } from "expo-router";
import { Platform, StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TabsLayout() {
  const { user, isLoading } = useAuth();

  // Don't render anything while loading
  if (isLoading) {
    return null;
  }

  // Redirect to language if no user
  if (!user) {
    return <Redirect href="/language" />;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar translucent={true} backgroundColor="transparent" barStyle="dark-content" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#0a7ea4",
          tabBarInactiveTintColor: "#999",
          tabBarStyle: {
            borderTopWidth: 0,
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            elevation: 0,
            shadowOpacity: 0,
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
    </SafeAreaView>
  );
}
