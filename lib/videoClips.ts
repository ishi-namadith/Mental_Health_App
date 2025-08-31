import { Audio } from "expo-av";
import * as VideoThumbnails from "expo-video-thumbnails";
import { supabase } from "./supabase";

export interface VideoClip {
  id: string;
  title: string;
  duration: string;
  url: string;
  thumbnail?: string;
}

const getVideoDuration = async (uri: string): Promise<string> => {
  try {
    const { sound } = await Audio.Sound.createAsync({ uri });
    const status = await sound.getStatusAsync();

    if (status.isLoaded && status.durationMillis) {
      const durationInSeconds = status.durationMillis / 1000;
      const minutes = Math.floor(durationInSeconds / 60);
      const seconds = Math.floor(durationInSeconds % 60);

      // Unload the sound to free memory
      await sound.unloadAsync();

      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    }

    await sound.unloadAsync();
    return "0:00";
  } catch (error) {
    console.error("Error getting video duration:", error);
    return "0:00";
  }
};

const generateVideoThumbnail = async (uri: string): Promise<string | undefined> => {
  try {
    const { uri: thumbnailUri } = await VideoThumbnails.getThumbnailAsync(uri, {
      time: 1000,
      quality: 0.7,
    });
    return thumbnailUri;
  } catch (error) {
    console.error("Error generating video thumbnail:", error);
    return undefined;
  }
};

// Function to fetch video clips from Supabase storage bucket
export const fetchVideoClips = async (): Promise<VideoClip[]> => {
  try {
    const { data, error } = await supabase.storage.from("mhvideoclips").list();
    if (error) {
      throw new Error(`Error listing video clips: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return [];
    }

    const videoFiles = data.filter((file) => file.name.toLowerCase().endsWith(".mp4"));

    const videoClipsWithUrls = await Promise.all(
      videoFiles.map(async (file) => {
        // Generate a signed URL for the video file
        const { data: fileData } = await supabase.storage.from("mhvideoclips").createSignedUrl(file.name, 3600); // URL valid for 1 hour

        if (!fileData?.signedUrl) {
          throw new Error(`Failed to generate signed URL for ${file.name}`);
        }

        // Extract title from filename (remove extension)
        const title = file.name.replace(/\.[^/.]+$/, "");

        // Get video duration
        const duration = await getVideoDuration(fileData.signedUrl);

        // Generate thumbnail
        const thumbnail = await generateVideoThumbnail(fileData.signedUrl);

        return {
          id: file.id || file.name, // Use file name as id if no id available
          title: title,
          duration: duration,
          url: fileData.signedUrl,
          thumbnail: thumbnail,
        };
      })
    );

    return videoClipsWithUrls;
  } catch {
    return [];
  }
};
