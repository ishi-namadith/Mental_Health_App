import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { BackgroundLayout } from '@/components/BackgroundLayout';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function LanguageSelectionScreen() {
  const router = useRouter();
  const inputBackgroundColor = useThemeColor({}, 'background');

  const handleLanguageSelect = (language: string) => {
    // Store selected language preference in AsyncStorage or context
    console.log(`Selected language: ${language}`);
    // Navigate to dashboard
    router.push('/dashboard');
  };

  return (
    <BackgroundLayout>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.centerContent}>
          <ThemedText type="title" style={styles.title}>
            Initial Language Selection
          </ThemedText>

          <ThemedView style={styles.languageContainer}>
            <TouchableOpacity 
              style={[styles.languageButton, { backgroundColor: inputBackgroundColor }]} 
              onPress={() => handleLanguageSelect('Sinhala')}
            >
              <ThemedText style={styles.languageText}>Sinhala</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.languageButton, { backgroundColor: inputBackgroundColor }]}
              onPress={() => handleLanguageSelect('English')}
            >
              <ThemedText style={styles.languageText}>English</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>

        <TouchableOpacity 
          style={styles.technicalLink}
          onPress={() => alert("Technical help to be implemented")}
        >
          <ThemedText type="link" style={styles.smallText}>
            technical help
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </BackgroundLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center', // Center vertically
  },
  centerContent: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  title: {
    marginBottom: 40,
    textAlign: 'center',
  },
  languageContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
    maxWidth: 300,
    backgroundColor: 'transparent'
  },
  languageButton: {
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  languageText: {
    fontSize: 16,
    fontWeight: '500',
  },
  technicalLink: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  smallText: {
    fontSize: 14,
  },
});