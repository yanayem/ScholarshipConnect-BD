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
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { initializeApp, getApps } from 'firebase/app';

// Firebase configuration for Web fallback
const firebaseConfig = {
  apiKey: "AIzaSyB2nt8ujKLj6rDUN6GwyOK36BZaJ_dxBwM",
  authDomain: "scholarships-bd.firebaseapp.com",
  projectId: "scholarships-bd",
  storageBucket: "scholarships-bd.firebasestorage.app",
  messagingSenderId: "1092212923801",
  appId: "1:1092212923801:web:230adde622f8daecf0c708",
  measurementId: "G-FX0EV392R7"
};

// Initialize Firebase for all platforms (Native fallback to Web SDK)
if (getApps().length === 0) {
  initializeApp(firebaseConfig);
}

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
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
  );
}
