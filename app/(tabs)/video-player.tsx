import { Ionicons } from "@expo/vector-icons";
import { useEvent } from "expo";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BackgroundLayout } from "@/components/BackgroundLayout";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useAuth } from "@/context/AuthContext";
import { useThemeColor } from "@/hooks/useThemeColor";
import { analyticsService } from "@/lib/analytics";
import { fetchVideoClips, VideoClip } from "@/lib/videoClips";

export default function VideoPlayer() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { videoId } = params;
  const { user } = useAuth();
  const controlsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const videoViewRef = useRef<VideoView>(null);
  const isPlayingRef = useRef<boolean>(false);
  const currentTimeRef = useRef<number>(0);

  const [videoClips, setVideoClips] = useState<VideoClip[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const textColor = useThemeColor({}, "text");
  const currentVideo = videoClips[currentVideoIndex];

  // Load video clips first
  useEffect(() => {
    const loadVideoClips = async () => {
      try {
        setLoading(true);
        const clips = await fetchVideoClips();
        setVideoClips(clips);

        // Find the index of the current video
        const index = clips.findIndex((clip) => clip.id === videoId);
        setCurrentVideoIndex(index >= 0 ? index : 0);

        setError(null);
      } catch {
        setError("Failed to load video clips. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadVideoClips();
  }, [videoId]);

  // Initialize video player only after we have the current video
  const player = useVideoPlayer(currentVideo?.url || null, (player) => {
    if (player && currentVideo?.url) {
      player.timeUpdateEventInterval = 0.1;
      player.loop = false;
      player.play();
    }
  });

  // Use expo event hooks for better event handling - only if player exists
  const { isPlaying } = useEvent(player, "playingChange", { isPlaying: player?.playing || false });

  const timeUpdateEvent = useEvent(player, "timeUpdate", {
    currentTime: player?.currentTime || 0,
    bufferedPosition: 0,
    currentLiveTimestamp: null,
    currentOffsetFromLive: null,
  });
  const currentTime = timeUpdateEvent?.currentTime || 0;

  // Update refs to track current values for cleanup functions
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  // Auto-hide controls after 3 seconds
  const resetControlsTimer = useCallback(() => {
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
    controlsTimeout.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  }, []);

  useEffect(() => {
    if (showControls) {
      resetControlsTimer();
    }
    return () => {
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
    };
  }, [showControls, resetControlsTimer]);

  // Update player source when current video changes
  useEffect(() => {
    if (currentVideo?.url && player && user && !loading) {
      // Add safety check to ensure player is not released
      try {
        // Start analytics session
        const startAnalytics = async () => {
          try {
            await analyticsService.startPlaySession(user.id, currentVideo.id, currentVideo.title, player.duration || 0);
          } catch (error) {
            console.error("Failed to start analytics session:", error);
          }
        };

        startAnalytics();

        // Use replaceAsync for better performance on iOS
        if (player.replaceAsync && typeof player.replaceAsync === "function") {
          player
            .replaceAsync(currentVideo.url)
            .then(() => {
              if (player && typeof player.play === "function") {
                player.play();
              }
            })
            .catch((error) => {
              // Fallback to replace if replaceAsync fails
              if (player && typeof player.replace === "function") {
                player.replace(currentVideo.url);
                if (typeof player.play === "function") {
                  player.play();
                }
              }
            });
        } else if (player.replace && typeof player.replace === "function") {
          player.replace(currentVideo.url);
          if (typeof player.play === "function") {
            player.play();
          }
        }
      } catch (error) {
        console.error("Error updating video source:", error);
      }
    }
  }, [currentVideoIndex, currentVideo, player, user, loading]);

  const handlePlayPause = useCallback(async () => {
    if (!player) {
      return;
    }

    try {
      if (isPlaying) {
        if (typeof player.pause === "function") {
          player.pause();
        }
        await analyticsService.logPlayEvent("pause", currentTime);
      } else {
        if (typeof player.play === "function") {
          player.play();
        }
        await analyticsService.logPlayEvent(currentTime === 0 ? "play" : "resume", currentTime);
      }
    } catch (error) {
      console.error("Error in handlePlayPause:", error);
    }
  }, [isPlaying, player, currentTime]);

  const handlePrevious = useCallback(() => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
    }
  }, [currentVideoIndex]);

  const handleNext = useCallback(() => {
    if (currentVideoIndex < videoClips.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    }
  }, [currentVideoIndex, videoClips.length]);

  const formatTime = useCallback((timeInSeconds: number): string => {
    if (isNaN(timeInSeconds) || timeInSeconds < 0) return "0:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  const handleVideoPress = useCallback(() => {
    setShowControls(!showControls);
  }, [showControls]);

  const handleBack = useCallback(async () => {
    await analyticsService.endPlaySession();
    router.back();
  }, [router]);

  const getProgressPercentage = useCallback(() => {
    try {
      if (!player || !player.duration || player.duration <= 0) return 0;
      return (currentTime / player.duration) * 100;
    } catch (error) {
      console.error("Error getting progress percentage:", error);
      return 0;
    }
  }, [currentTime, player]);

  // Handle screen focus/blur to pause/resume video
  useFocusEffect(
    useCallback(() => {
      // Screen is focused, no need to do anything as video continues playing
      return () => {
        try {
          // Screen is unfocused, pause the video
          // Use the ref values to avoid accessing potentially released player object
          if (player && typeof player.pause === "function" && isPlayingRef.current) {
            player.pause();
            // Use currentTimeRef to avoid accessing player.currentTime
            analyticsService.logPlayEvent("pause", currentTimeRef.current);
          }
          // End analytics session when leaving screen
          analyticsService.endPlaySession();
          // Clear any timeouts when leaving the screen
          if (controlsTimeout.current) {
            clearTimeout(controlsTimeout.current);
          }
        } catch (error) {
          console.error("Error in useFocusEffect cleanup:", error);
          // Even if there's an error, try to end the analytics session
          try {
            analyticsService.endPlaySession();
          } catch (analyticsError) {
            console.error("Error ending analytics session:", analyticsError);
          }
        }
      };
    }, [player]) // Only depend on player to avoid frequent re-runs
  );

  // Handle video end event
  useEffect(() => {
    if (player && typeof player.addListener === "function") {
      try {
        const playToEndListener = player.addListener("playToEnd", async () => {
          await analyticsService.endPlaySession(true); // Mark as completed

          if (currentVideoIndex < videoClips.length - 1) {
            handleNext();
          }
        });

        return () => {
          try {
            playToEndListener?.remove();
          } catch (error) {
            console.error("Error removing video end listener:", error);
          }
        };
      } catch (error) {
        console.error("Error setting up video end listener:", error);
      }
    }
  }, [currentVideoIndex, videoClips.length, handleNext, player]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      analyticsService.cleanup();
    };
  }, []);

  if (loading) {
    return (
      <BackgroundLayout>
        <SafeAreaView style={styles.container}>
          <ActivityIndicator size="large" color="#0a7ea4" style={styles.loader} />
        </SafeAreaView>
      </BackgroundLayout>
    );
  }

  if (error || !currentVideo) {
    return (
      <BackgroundLayout>
        <SafeAreaView style={styles.container}>
          <ThemedText style={styles.errorText}>{error || "Video not found"}</ThemedText>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
          </TouchableOpacity>
        </SafeAreaView>
      </BackgroundLayout>
    );
  }

  return (
    <BackgroundLayout>
      <SafeAreaView style={styles.container}>
        {/* Header with back button and title */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBackButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
          <View style={styles.headerSpacer} />
        </View>

        {/* Main Content Container */}
        <View style={styles.mainContent}>
          {/* Video Player */}
          <View style={styles.videoContainer}>
            <View style={styles.videoWrapper}>
              {/* Only render VideoView if we have a valid player and current video */}
              {player && currentVideo?.url ? (
                <VideoView ref={videoViewRef} style={styles.video} player={player} allowsFullscreen={false} allowsPictureInPicture={false} contentFit="contain" nativeControls={false} />
              ) : (
                <View style={[styles.video, { backgroundColor: "black", justifyContent: "center", alignItems: "center" }]}>
                  <ActivityIndicator size="large" color="#0a7ea4" />
                  <ThemedText style={{ color: "white", marginTop: 10 }}>Loading video...</ThemedText>
                </View>
              )}

              {/* Touch Overlay for Controls */}
              <Pressable style={styles.touchOverlay} onPress={handleVideoPress}>
                {/* Centered Container for Controls */}
                <View style={styles.centeredContainer}>
                  {/* Controls Overlay */}
                  {showControls && (
                    <View style={styles.controlsOverlay} pointerEvents="box-none">
                      {/* Top Controls */}
                      <View style={styles.topControls}>
                        <View style={styles.topRightControls}>
                          <TouchableOpacity
                            style={styles.volumeButton}
                            onPress={() => {
                              try {
                                if (player && typeof player.muted !== "undefined") {
                                  player.muted = !player.muted;
                                }
                              } catch (error) {
                                console.error("Error toggling mute:", error);
                              }
                            }}
                          >
                            <Ionicons name={player?.muted ? "volume-mute" : "volume-high"} size={24} color="white" />
                          </TouchableOpacity>
                        </View>
                      </View>

                      {/* Bottom Controls */}
                      <View style={styles.bottomControls}>
                        {/* Progress Bar */}
                        <View style={styles.progressContainer}>
                          <ThemedText style={styles.timeText}>{formatTime(currentTime)}</ThemedText>

                          <View style={styles.progressBarContainer}>
                            <View style={styles.progressBarBackground}>
                              <View style={[styles.progressBarFill, { width: `${getProgressPercentage()}%` }]} />
                            </View>
                          </View>

                          <ThemedText style={styles.timeText}>{formatTime(player?.duration || 0)}</ThemedText>
                        </View>

                        {/* Navigation Controls */}
                        <View style={styles.navigationControls}>
                          <TouchableOpacity
                            style={[styles.navButton, currentVideoIndex === 0 && styles.disabledButton]}
                            onPress={() => {
                              handlePrevious();
                            }}
                            disabled={currentVideoIndex === 0}
                          >
                            <Ionicons name="play-skip-back" size={24} color={currentVideoIndex === 0 ? "rgba(255,255,255,0.3)" : "white"} />
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.seekButton}
                            onPress={() => {
                              player.seekBy(-10);
                            }}
                          >
                            <Ionicons name="play-back" size={20} color="white" />
                            <ThemedText style={styles.seekText}>10</ThemedText>
                          </TouchableOpacity>

                          {/* Play/Pause Button in Bottom Controls */}
                          <TouchableOpacity style={styles.bottomPlayPauseButton} onPress={handlePlayPause}>
                            <Ionicons name={isPlaying ? "pause" : "play"} size={24} color="white" />
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.seekButton}
                            onPress={() => {
                              player.seekBy(10);
                            }}
                          >
                            <Ionicons name="play-forward" size={20} color="white" />
                            <ThemedText style={styles.seekText}>10</ThemedText>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[styles.navButton, currentVideoIndex === videoClips.length - 1 && styles.disabledButton]}
                            onPress={() => {
                              handleNext();
                            }}
                            disabled={currentVideoIndex === videoClips.length - 1}
                          >
                            <Ionicons name="play-skip-forward" size={24} color={currentVideoIndex === videoClips.length - 1 ? "rgba(255,255,255,0.3)" : "white"} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  )}
                </View>
              </Pressable>
            </View>
          </View>

          {/* Video Info */}
          <ThemedView style={styles.infoContainer}>
            <ThemedText type="subtitle" style={styles.videoTitle}>
              {currentVideo.title}
            </ThemedText>
            <View style={styles.videoMeta}>
              <ThemedText style={styles.metaText}>Duration: {currentVideo.duration}</ThemedText>
              <ThemedText style={styles.metaText}>
                Video {currentVideoIndex + 1} of {videoClips.length}
              </ThemedText>
            </View>
          </ThemedView>
        </View>
      </SafeAreaView>
    </BackgroundLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  headerBackButton: {
    padding: 5,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    marginHorizontal: 20,
  },
  headerSpacer: {
    width: 34,
  },
  mainContent: {
    flex: 1,
    justifyContent: "center",
    paddingTop: 60,
  },
  videoContainer: {
    aspectRatio: 16 / 10,
    backgroundColor: "black",
    marginHorizontal: 15,
    borderRadius: 12,
    overflow: "hidden",
    alignSelf: "center",
    width: "95%",
    maxWidth: 600,
    minHeight: 320,
  },
  videoWrapper: {
    flex: 1,
    position: "relative",
  },
  video: {
    flex: 1,
  },
  touchOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  centeredContainer: {
    width: "100%",
    maxWidth: "80%",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  controlsOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "space-between",
    zIndex: 1000,
  },
  topControls: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  topRightControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  centerControls: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -50 }, { translateY: -50 }],
    justifyContent: "center",
    alignItems: "center",
  },
  playPauseButton: {
    backgroundColor: "rgba(0,0,0,0.8)",
    borderRadius: 50,
    padding: 20,
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomPlayPauseButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 25,
    padding: 8,
    width: 45,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 8,
  },
  bottomControls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  timeText: {
    color: "white",
    fontSize: 10,
    minWidth: 35,
    textAlign: "center",
    fontWeight: "600",
  },
  progressBarContainer: {
    flex: 1,
    height: 30,
    marginHorizontal: 10,
    justifyContent: "center",
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 2,
  },
  progressBarFill: {
    height: 4,
    backgroundColor: "#0a7ea4",
    borderRadius: 2,
  },
  progressThumb: {
    position: "absolute",
    top: -4,
    width: 12,
    height: 12,
    backgroundColor: "#0a7ea4",
    borderRadius: 6,
    marginLeft: -6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
  },
  navigationControls: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 10,
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 8,
    marginHorizontal: 10,
    paddingVertical: 8,
  },
  navButton: {
    padding: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    minWidth: 45,
    alignItems: "center",
  },
  seekButton: {
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 15,
  },
  seekText: {
    position: "absolute",
    bottom: 2,
    fontSize: 8,
    color: "white",
    fontWeight: "bold",
  },
  disabledButton: {
    opacity: 0.3,
  },
  volumeButton: {
    padding: 8,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 15,
  },
  infoContainer: {
    padding: 20,
    margin: 20,
    borderRadius: 12,
    marginTop: 20,
  },
  videoTitle: {
    marginBottom: 10,
    fontSize: 18,
    fontWeight: "600",
  },
  videoMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metaText: {
    fontSize: 12,
    opacity: 0.7,
    fontWeight: "500",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
  },
  loadingText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
  errorText: {
    textAlign: "center",
    color: "red",
    margin: 20,
    fontSize: 16,
  },
  backButton: {
    backgroundColor: "#0a7ea4",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignSelf: "center",
    marginTop: 20,
  },
  backButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
