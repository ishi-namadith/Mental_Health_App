import React, { ReactNode } from 'react';
import { ImageBackground, StyleSheet } from 'react-native';

type BackgroundLayoutProps = {
  children: ReactNode;
};

export function BackgroundLayout({ children }: BackgroundLayoutProps) {
  return (
    <ImageBackground 
      source={require('@/assets/images/App bg.png')} 
      style={styles.backgroundImage}
      resizeMode="cover"
      blurRadius={5}
    >
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',

  },
});