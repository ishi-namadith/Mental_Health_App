import { BackgroundLayout } from "@/components/BackgroundLayout";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface SplashScreenProps {
  onFinish?: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Start the animation sequence
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-hide after 3 seconds
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (onFinish) onFinish();
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, onFinish]);

  return (
    <BackgroundLayout>
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.centerContent}>
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <ThemedText type="title" style={styles.sloganLine1}>
              Empower Your Mind
            </ThemedText>
            <ThemedText type="subtitle" style={styles.sloganLine2}>
              Sooth Your Soul
            </ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.sloganLine3}>
              Cradle Your Baby in Peace
            </ThemedText>

            <ThemedView style={styles.loadingContainer}>
              <ThemedView style={styles.loadingDots}>
                <Animated.View style={[styles.dot, { opacity: fadeAnim }]} />
                <Animated.View style={[styles.dot, { opacity: fadeAnim }]} />
                <Animated.View style={[styles.dot, { opacity: fadeAnim }]} />
              </ThemedView>
            </ThemedView>
          </Animated.View>
        </ThemedView>
      </SafeAreaView>
    </BackgroundLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  centerContent: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "transparent",
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  sloganLine1: {
    textAlign: "center",
    marginBottom: 16,
    letterSpacing: 1,
  },
  sloganLine2: {
    textAlign: "center",
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  sloganLine3: {
    textAlign: "center",
    marginBottom: 40,
    letterSpacing: 0.5,
  },
  loadingContainer: {
    marginTop: 30,
    backgroundColor: "transparent",
  },
  loadingDots: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#333",
    marginHorizontal: 4,
  },
});
