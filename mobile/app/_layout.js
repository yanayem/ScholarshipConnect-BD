/**
 * ROOT LAYOUT: This is the main entry point for the App Navigation.
 * - Manages global fonts (Inter).
 * - Handles Splash Screen logic.
 * - Defines the global Stack Navigator for all screens.
 * - Connected to: index.js, (auth), (tabs), scholarships/[id], apply/[id], reminders, documents, settings.
 */
import { Stack } from 'expo-router';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import { View, Text, Platform } from 'react-native';
import Constants from 'expo-constants';
import { firebaseAuth } from '../services/firebase';
import { MentorModeProvider } from '../context/MentorModeContext';
import { ToastProvider } from '../context/ToastContext';
import { UserProvider } from '../context/UserContext';
import { theme } from '../theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    // Hide splash screen immediately if there's an error
    if (fontError) {
      console.error('Font loading error:', fontError);
      SplashScreen.hideAsync();
    }

    if (fontsLoaded) {
      // Enforce 1.5s branded splash visibility as per AGENTS.md
      const timer = setTimeout(async () => {
        await SplashScreen.hideAsync();
      }, 1500);
      return () => clearTimeout(timer);
    }

    // Safety timeout: Ensure splash screen hides even if everything fails
    const safetyTimer = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 5000);

    return () => clearTimeout(safetyTimer);
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ToastProvider>
      <UserProvider>
        <MentorModeProvider>
          <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <View style={Platform.OS === 'web' ? {
              flex: 1,
              maxWidth: 600,
              width: '100%',
              alignSelf: 'center',
              backgroundColor: theme.colors.surface,
              // Shadow for web container to look like an app
              boxShadow: '0 0 20px rgba(0,0,0,0.1)'
            } : { flex: 1 }}>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="scholarships/[id]" />
                <Stack.Screen name="apply/[id]" />
                <Stack.Screen name="reminders" />
                <Stack.Screen name="documents" />
                <Stack.Screen name="settings" />
                <Stack.Screen name="edit-profile" options={{ presentation: 'modal' }} />
              </Stack>
            </View>
          </View>
        </MentorModeProvider>
      </UserProvider>
    </ToastProvider>
  );
}
