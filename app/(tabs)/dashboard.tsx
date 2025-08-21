import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { BackgroundLayout } from '@/components/BackgroundLayout';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';

// Mock data for sound clips
const SOUND_CLIPS = [
  {
    id: '1',
    title: 'Calm Meditation',
    duration: '5:30',
    category: 'Meditation',
    description: 'A gentle guided meditation to help you find inner peace and relaxation.',
  },
  {
    id: '2',
    title: 'Stress Relief',
    duration: '8:45',
    category: 'Breathing',
    description: 'Deep breathing exercises to help reduce anxiety and stress.',
  },
  {
    id: '3',
    title: 'Peaceful Sleep',
    duration: '12:20',
    category: 'Sleep',
    description: 'Soothing sounds and guidance to help you fall asleep more easily.',
  },
  {
    id: '4',
    title: 'Morning Energy',
    duration: '4:15',
    category: 'Motivation',
    description: 'Start your day with positive affirmations and energizing thoughts.',
  },
  {
    id: '5',
    title: 'Nature Sounds',
    duration: '10:00',
    category: 'Relaxation',
    description: 'Immerse yourself in the calming sounds of nature for deep relaxation.',
  },
];

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;

export default function Dashboard() {
  const [selectedCard, setSelectedCard] = useState(null);
  const cardScale = useSharedValue(1);
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  const handleCardPress = (id) => {
    setSelectedCard(id === selectedCard ? null : id);
    cardScale.value = withSpring(id === selectedCard ? 1 : 1.05);
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: cardScale.value }],
    };
  });

  return (
    <BackgroundLayout>
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>
          Sound Library
        </ThemedText>

        <ThemedText style={styles.subtitle}>
          Discover calming audio to help with your mental well-being
        </ThemedText>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {SOUND_CLIPS.map((clip) => (
            <TouchableOpacity 
              key={clip.id} 
              onPress={() => handleCardPress(clip.id)}
              activeOpacity={0.9}
            >
              <Animated.View 
                style={[
                  styles.card, 
                  { backgroundColor },
                  clip.id === selectedCard && animatedStyle
                ]}
              >
                <ThemedText type="defaultSemiBold" style={styles.cardTitle}>
                  {clip.title}
                </ThemedText>
                
                <ThemedView style={styles.cardMeta}>
                  <ThemedText style={styles.cardCategory}>{clip.category}</ThemedText>
                  <ThemedText style={styles.cardDuration}>{clip.duration}</ThemedText>
                </ThemedView>
                
                {clip.id === selectedCard && (
                  <ThemedText style={styles.cardDescription}>
                    {clip.description}
                  </ThemedText>
                )}
                
                {clip.id === selectedCard && (
                  <TouchableOpacity style={styles.playButton} onPress={() => alert(`Playing ${clip.title}`)}>
                    <ThemedText style={styles.playButtonText}>PLAY</ThemedText>
                  </TouchableOpacity>
                )}
              </Animated.View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ThemedView>
    </BackgroundLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'transparent', // Make container transparent to show background
  },
  title: {
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.7,
  },
  scrollContent: {
    alignItems: 'center',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  cardCategory: {
    opacity: 0.7,
    fontSize: 14,
  },
  cardDuration: {
    opacity: 0.7,
    fontSize: 14,
  },
  cardDescription: {
    marginBottom: 15,
    lineHeight: 22,
  },
  playButton: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'center',
  },
  playButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});