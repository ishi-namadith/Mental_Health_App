import { supabase } from "./supabase";

export interface PlaySession {
  id?: string;
  user_id: string;
  video_id: string;
  video_title: string;
  session_start: string;
  session_end?: string;
  total_watch_time: number;
  completed: boolean;
  video_duration?: number;
  created_at?: string;
  updated_at?: string;
}

export interface PlayEvent {
  id?: string;
  session_id?: string;
  event_type: "play" | "pause" | "seek" | "resume" | "stop";
  timestamp: string;
  video_position: number; // Changed from current_time to match database
  seek_from?: number;
  seek_to?: number;
}

export interface VideoAnalytics {
  video_id: string;
  video_title: string;
  total_plays: number;
  total_watch_time: number;
  average_watch_time: number;
  completion_rate: number;
  last_played: string;
  unique_users: number;
}

class AnalyticsService {
  private currentSession: PlaySession | null = null;
  private lastEventTime: number = 0;
  private sessionTimer: ReturnType<typeof setInterval> | null = null;

  // Start a new play session
  async startPlaySession(userId: string, videoId: string, videoTitle: string, videoDuration?: number): Promise<string | null> {
    if (this.currentSession && this.currentSession.video_id === videoId) {
      return this.currentSession.id || null;
    }

    try {
      // End previous session if exists
      if (this.currentSession) {
        await this.endPlaySession();
      }

      const sessionData: Omit<PlaySession, "id"> = {
        user_id: userId,
        video_id: videoId,
        video_title: videoTitle,
        session_start: new Date().toISOString(),
        total_watch_time: 0,
        completed: false,
        video_duration: videoDuration,
      };

      // Insert session into database
      const { data, error } = await supabase.from("play_sessions").insert(sessionData).select().single();

      if (error) {
        console.error("Error creating play session:", error);
        return null;
      }

      this.currentSession = data;
      this.lastEventTime = Date.now();

      // Log initial play event
      await this.logPlayEvent("play", 0);

      // Start session timer to track total time
      this.startSessionTimer();

      return data.id;
    } catch (error) {
      console.error("Error starting play session:", error);
      return null;
    }
  }

  // Log play events (play, pause, seek, etc.)
  async logPlayEvent(eventType: PlayEvent["event_type"], currentTime: number, seekFrom?: number, seekTo?: number): Promise<void> {
    if (!this.currentSession) {
      return;
    }

    try {
      const eventData: Omit<PlayEvent, "id"> = {
        session_id: this.currentSession.id,
        event_type: eventType,
        timestamp: new Date().toISOString(),
        video_position: currentTime, // Fixed: using video_position instead of current_time
        seek_from: seekFrom,
        seek_to: seekTo,
      };

      // Insert event into database
      const { error } = await supabase.from("play_events").insert(eventData);

      if (error) {
        console.error("Error logging play event:", error);
        return;
      }

      // Update last event time for watch time calculation
      if (eventType === "play" || eventType === "resume") {
        this.lastEventTime = Date.now();
        this.startSessionTimer();
      } else if (eventType === "pause" || eventType === "stop") {
        this.stopSessionTimer();
        await this.updateWatchTime();
      }
    } catch (error) {
      console.error("Error logging play event:", error);
    }
  }

  // Update total watch time for current session
  private async updateWatchTime(): Promise<void> {
    if (!this.currentSession) {
      return;
    }

    try {
      const now = Date.now();
      const additionalTime = Math.floor((now - this.lastEventTime) / 1000);

      if (additionalTime > 0) {
        this.currentSession.total_watch_time += additionalTime;

        // Update in database
        const { error } = await supabase
          .from("play_sessions")
          .update({
            total_watch_time: this.currentSession.total_watch_time,
            updated_at: new Date().toISOString(),
          })
          .eq("id", this.currentSession.id);

        if (error) {
          console.error("Error updating watch time:", error);
        }
      }
    } catch (error) {
      console.error("Error updating watch time:", error);
    }
  }

  // End current play session
  async endPlaySession(completed: boolean = false): Promise<void> {
    if (!this.currentSession) {
      return;
    }

    // Store session reference to avoid race conditions
    const sessionToEnd = this.currentSession;

    try {
      this.stopSessionTimer();
      await this.updateWatchTime();

      // Log stop event using stored session
      const currentSession = this.currentSession || sessionToEnd;
      await this.logPlayEvent("stop", currentSession.total_watch_time);

      // Check if video was completed (watched > 80% of duration)
      let isCompleted = completed;
      if (currentSession.video_duration && currentSession.total_watch_time) {
        const completionRate = currentSession.total_watch_time / currentSession.video_duration;
        isCompleted = completionRate >= 0.8 || completed;
      }

      // Update session with end time and completion status
      const { error } = await supabase
        .from("play_sessions")
        .update({
          session_end: new Date().toISOString(),
          completed: isCompleted,
          updated_at: new Date().toISOString(),
        })
        .eq("id", currentSession.id);

      if (error) {
        console.error("Error ending play session:", error);
      }

      this.currentSession = null;
    } catch (error) {
      console.error("Error ending play session:", error);
      this.currentSession = null; // Clear session even on error
    }
  }

  // Start session timer for automatic time tracking
  private startSessionTimer(): void {
    this.stopSessionTimer(); // Clear existing timer

    this.sessionTimer = setInterval(async () => {
      await this.updateWatchTime();
      this.lastEventTime = Date.now(); // Reset for next interval
    }, 10000); // Update every 10 seconds
  }

  // Stop session timer
  private stopSessionTimer(): void {
    if (this.sessionTimer) {
      clearInterval(this.sessionTimer);
      this.sessionTimer = null;
    }
  }

  // Get analytics for a specific video
  async getVideoAnalytics(videoId: string): Promise<VideoAnalytics | null> {
    try {
      const { data, error } = await supabase.rpc("get_video_analytics", { video_id_param: videoId });

      if (error) {
        console.error("Error fetching video analytics:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error fetching video analytics:", error);
      return null;
    }
  }

  // Get user's watch history
  async getUserWatchHistory(userId: string, limit: number = 20): Promise<PlaySession[]> {
    try {
      const { data, error } = await supabase.from("play_sessions").select("*").eq("user_id", userId).order("session_start", { ascending: false }).limit(limit);

      if (error) {
        console.error("Error fetching watch history:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching watch history:", error);
      return [];
    }
  }

  // Get current session info
  getCurrentSession(): PlaySession | null {
    return this.currentSession;
  }

  // Clean up - call this when app is closing or user logs out
  async cleanup(): Promise<void> {
    if (this.currentSession) {
      await this.endPlaySession();
    }
    this.stopSessionTimer();
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
