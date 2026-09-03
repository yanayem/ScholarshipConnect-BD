import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../theme';

/**
 * ROOT INDEX:
 * - Handles initial routing logic (Login -> Tabs).
 * - No Splash UI as per user request.
 */
export default function Index() {
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const hasSeenOnboarding = await AsyncStorage.getItem('has_seen_onboarding');
        const token = await AsyncStorage.getItem('token');

        // Also check if Firebase has a persisted user session
        let hasFirebaseUser = false;
        if (!token) {
          try {
            const { firebaseAuth } = require('../services/firebase');
            const fbUser = await firebaseAuth.waitForUser();
            if (fbUser) {
              // Firebase session is alive — get a fresh token
              const freshToken = await firebaseAuth.getIdToken();
              if (freshToken) {
                await AsyncStorage.setItem('token', freshToken);
                hasFirebaseUser = true;
              }
            }
          } catch (e) {}
        }

        // Small delay to ensure navigation is ready
        setTimeout(() => {
          if (!hasSeenOnboarding) {
            router.replace('/onboarding');
          } else if (token || hasFirebaseUser) {
            router.replace('/(tabs)');
          } else {
            router.replace('/(auth)/login');
          }
        }, 100);
      } catch (e) {
        router.replace('/(auth)/login');
      }
    };
    checkAuth();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center' }}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
}
