import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

type Language = "English" | "Sinhala";

type LanguageContextType = {
  selectedLanguage: Language | null;
  setLanguage: (language: Language) => Promise<void>;
  isLoading: boolean;
};

const LanguageContext = createContext<LanguageContextType>({
  selectedLanguage: null,
  setLanguage: async () => {},
  isLoading: true,
});

const LANGUAGE_STORAGE_KEY = "selected_language";

export function useLanguage() {
  return useContext(LanguageContext);
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredLanguage();
  }, []);

  const loadStoredLanguage = async () => {
    try {
      const storedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (storedLanguage && (storedLanguage === "English" || storedLanguage === "Sinhala")) {
        setSelectedLanguage(storedLanguage as Language);
      }
    } catch (error) {
      console.error("Error loading stored language:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const setLanguage = async (language: Language) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
      setSelectedLanguage(language);
    } catch (error) {
      console.error("Error saving language:", error);
      throw error;
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        selectedLanguage,
        setLanguage,
        isLoading,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

// Helper function to get folder path based on language
export const getVideoFolderPath = (language: Language | null): string => {
  switch (language) {
    case "English":
      return "english";
    case "Sinhala":
      return "sinhala";
    default:
      return "english"; // Default fallback
  }
};
