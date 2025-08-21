import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity } from 'react-native';

import { BackgroundLayout } from '@/components/BackgroundLayout';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const inputBackgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  const handleLogin = () => {
    // Here you would add actual authentication logic
    // For now, we'll just navigate to the terms screen
    if (username && password) {
      router.push('/termsandconditions');
    } else {
      alert('Please enter both username and password');
    }
  };

  return (
    <BackgroundLayout>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.centerContent}>
          <ThemedText type="title" style={styles.title}>
            Login
          </ThemedText>

          <ThemedView style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: inputBackgroundColor, color: textColor },
              ]}
              placeholder="Username"
              placeholderTextColor="#888"
              value={username}
              onChangeText={setUsername}
            />

            <TextInput
              style={[
                styles.input,
                { backgroundColor: inputBackgroundColor, color: textColor },
              ]}
              placeholder="Password"
              placeholderTextColor="#888"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <ThemedText style={styles.loginButtonText}>LOGIN</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
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
  inputContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
    backgroundColor: 'transparent',
  },
  input: {
    width: '100%',
    height: 50,
    paddingHorizontal: 10,
    borderRadius: 4,
    fontSize: 16,
    backgroundColor: 'transparent',
  },
  loginButton: {
    width: '40%',
    height: 50,
    backgroundColor: '#333',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signupContainer: {
    flexDirection: 'row',
    marginTop: 20,
    alignItems: 'center',
  },
});