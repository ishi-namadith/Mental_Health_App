import { Audio } from "expo-av";
import { supabase } from "./supabase";

export interface VideoClip {
  id: string;
  title: string;
  duration: string;
  url: string;
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

// Function to fetch video clips from Supabase storage bucket folder
export const fetchVideoClips = async (folderPath: string): Promise<VideoClip[]> => {
  try {
    const { data, error } = await supabase.storage.from("mhvideoclips").list(folderPath);
    if (error) {
      throw new Error(`Error listing video clips: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return [];
    }

    const videoFiles = data.filter((file) => file.name.toLowerCase().endsWith(".mp4"));

    const videoClipsWithUrls = await Promise.all(
      videoFiles.map(async (file) => {
        // Generate a signed URL for the video file (include folder path)
        const filePath = `${folderPath}/${file.name}`;
        const { data: fileData } = await supabase.storage.from("mhvideoclips").createSignedUrl(filePath, 3600); // URL valid for 1 hour

        if (!fileData?.signedUrl) {
          throw new Error(`Failed to generate signed URL for ${file.name}`);
        }

        // Extract title from filename (remove extension)
        const title = file.name.replace(/\.[^/.]+$/, "");

        // Get video duration
        const duration = await getVideoDuration(fileData.signedUrl);

        return {
          id: file.id || file.name, // Use file name as id if no id available
          title: title,
          duration: duration,
          url: fileData.signedUrl,
        };
      })
    );

    return videoClipsWithUrls;
  } catch {
    return [];
  }
};
