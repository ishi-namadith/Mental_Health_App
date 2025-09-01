import { useAuth } from "@/context/AuthContext";
import { analyticsService, PlaySession } from "@/lib/analytics";
import { useCallback, useEffect } from "react";

export interface UseAnalyticsReturn {
  startSession: (videoId: string, videoTitle: string, videoDuration?: number) => Promise<string | null>;
  endSession: (completed?: boolean) => Promise<void>;
  logEvent: (eventType: "play" | "pause" | "seek" | "resume" | "stop", currentTime: number, seekFrom?: number, seekTo?: number) => Promise<void>;
  getCurrentSession: () => PlaySession | null;
  getUserWatchHistory: (limit?: number) => Promise<PlaySession[]>;
  cleanup: () => Promise<void>;
}

export function useAnalytics(): UseAnalyticsReturn {
  const { user } = useAuth();

  const startSession = useCallback(
    async (videoId: string, videoTitle: string, videoDuration?: number) => {
      if (!user) {
        console.warn("Cannot start analytics session: User not authenticated");
        return null;
      }

      return await analyticsService.startPlaySession(user.id, videoId, videoTitle, videoDuration);
    },
    [user]
  );

  const endSession = useCallback(async (completed = false) => {
    await analyticsService.endPlaySession(completed);
  }, []);

  const logEvent = useCallback(async (eventType: "play" | "pause" | "seek" | "resume" | "stop", currentTime: number, seekFrom?: number, seekTo?: number) => {
    await analyticsService.logPlayEvent(eventType, currentTime, seekFrom, seekTo);
  }, []);

  const getCurrentSession = useCallback(() => {
    return analyticsService.getCurrentSession();
  }, []);

  const getUserWatchHistory = useCallback(
    async (limit = 20) => {
      if (!user) {
        console.warn("Cannot get watch history: User not authenticated");
        return [];
      }

      return await analyticsService.getUserWatchHistory(user.id, limit);
    },
    [user]
  );

  const cleanup = useCallback(async () => {
    await analyticsService.cleanup();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      analyticsService.cleanup();
    };
  }, []);

  return {
    startSession,
    endSession,
    logEvent,
    getCurrentSession,
    getUserWatchHistory,
    cleanup,
  };
}
