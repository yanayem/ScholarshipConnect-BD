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
        </MentorModeProvider>
      </UserProvider>
    </ToastProvider>
  );
}
