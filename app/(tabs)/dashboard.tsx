import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { BackgroundLayout } from "@/components/BackgroundLayout";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { getVideoFolderPath, useLanguage } from "@/context/LanguageContext";
import { useThemeColor } from "@/hooks/useThemeColor";
import { fetchVideoClips, VideoClip } from "@/lib/videoClips";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.85;

export default function Dashboard() {
  const router = useRouter();
  const { selectedLanguage } = useLanguage();
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [videoClips, setVideoClips] = useState<VideoClip[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const cardScale = useSharedValue(1);
  const backgroundColor = useThemeColor({}, "background");

  useEffect(() => {
    const loadVideoClips = async () => {
      try {
        setLoading(true);

        if (!selectedLanguage) {
          setVideoClips([]);
          setError(null);
          setLoading(false);
          return;
        }

        const folderPath = getVideoFolderPath(selectedLanguage);
        const clips = await fetchVideoClips(folderPath);
        setVideoClips(clips);
        setError(null);
      } catch (err) {
        console.error("Error loading video clips:", err);
        setError("Failed to load video clips. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadVideoClips();
  }, [selectedLanguage]);

  const handleCardPress = (id: string) => {
    // Select/deselect the card
    setSelectedCard(id === selectedCard ? null : id);
    cardScale.value = withSpring(id === selectedCard ? 1 : 1.05);
  };

  const handlePlayPress = (clip: VideoClip) => {
    // Navigate to video player page
    router.push({
      pathname: "/(tabs)/video-player" as any,
      params: { videoId: clip.id },
    });
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: cardScale.value }],
    };
  });

  return (
    <BackgroundLayout>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }} keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}>
          <ThemedText type="title" style={styles.title}>
            Library
          </ThemedText>

          <ThemedText style={styles.subtitle}>Discover your state of mindfulness with guided meditation for your mental well-being</ThemedText>

          {loading ? (
            <ActivityIndicator size="large" color="#0a7ea4" style={styles.loader} />
          ) : error ? (
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          ) : (
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              {videoClips.length === 0 ? (
                <ThemedText style={styles.noClipsText}>No video clips available</ThemedText>
              ) : (
                videoClips.map((clip) => (
                  <TouchableOpacity key={clip.id} onPress={() => handleCardPress(clip.id)} activeOpacity={0.9}>
                    <Animated.View style={[styles.card, { backgroundColor }, clip.id === selectedCard && animatedStyle]}>
                      <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
                        {clip.title}
                      </ThemedText>

                      <ThemedView style={styles.cardMeta}>
                        <ThemedText style={styles.cardDuration}>{clip.duration}</ThemedText>
                      </ThemedView>

                      {clip.id === selectedCard && (
                        <TouchableOpacity style={styles.playButton} onPress={() => handlePlayPress(clip)}>
                          <ThemedText style={styles.playButtonText}>PLAY</ThemedText>
                        </TouchableOpacity>
                      )}
                    </Animated.View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </BackgroundLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: "transparent", // Make container transparent to show background
  },
  accountButton: {
    position: "absolute",
    top: 10,
    right: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.1)",
    zIndex: 10,
  },
  accountButtonText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  title: {
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 30,
    opacity: 0.7,
  },
  scrollContent: {
    alignItems: "center",
    paddingBottom: 30,
  },
  card: {
    width: CARD_WIDTH,
    minHeight: 120,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  cardMeta: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 15,
  },
  cardDuration: {
    opacity: 0.7,
    fontSize: 14,
  },
  playButton: {
    backgroundColor: "#0a7ea4",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: "center",
  },
  playButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  loader: {
    marginTop: 50,
  },
  errorText: {
    textAlign: "center",
    color: "red",
    marginTop: 50,
  },
  noClipsText: {
    textAlign: "center",
    marginTop: 50,
    opacity: 0.7,
  },
});
