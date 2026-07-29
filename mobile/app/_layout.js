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
import { useToast } from '../components/Toast';
import Constants from 'expo-constants';
import { firebaseAuth } from '../services/firebase';
import { MentorModeProvider } from '../context/MentorModeContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { showToast, ToastComponent } = useToast();
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
      SplashScreen.hideAsync();
    }

    // Safety timeout: Ensure splash screen hides even if everything fails
    const timer = setTimeout(() => {
      SplashScreen.hideAsync();
    }, 3000);

    return () => clearTimeout(timer);
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
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
      {ToastComponent}
    </MentorModeProvider>
  );
}
