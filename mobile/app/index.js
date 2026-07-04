/**
 * INITIAL ROUTER: This file decides which page the user sees first.
 * - Checks for 'token' in AsyncStorage (persistent login).
 * - If logged in: Redirects to /(tabs).
 * - If not logged in: Redirects to /(auth)/login.
 * - Connected to: AsyncStorage, expo-router, /(tabs), /(auth)/login.
 */
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../theme';

export default function Index() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      // In a real app, you might want to verify this token with the backend here
      if (token) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)/login');
      }
    } catch (e) {
      console.error('Failed to load token', e);
      router.replace('/(auth)/login');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return null;
}
