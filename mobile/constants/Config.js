/**
 * API CONFIGURATION:
 * - Production Ready: Connected to Render Live Server.
 * - For local development, the app automatically chooses between localhost, Emulator IP, or Manual IP.
 */
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// 1. Live Production API URL (Render)
const LIVE_URL = "https://scholarshipconnectbd.onrender.com/api";

// 2. Manual PC IP (Change this to your actual PC IP for physical device testing)
const PC_IP = "192.168.68.158";

const getLocalUrl = () => {
  // If running on Web, always use localhost for the backend on the same machine
  if (Platform.OS === 'web') {
    return "http://localhost:8000/api";
  }

  // For Android Emulator, 10.0.2.2 is the magic IP to reach the host PC
  // For physical devices, we use the manual PC_IP.
  const isExpoGo = Constants.executionEnvironment === 'storeClient';

  // Try to detect if we're in an emulator/simulator
  // Note: Constants.isDevice is sometimes unreliable in newer Expo versions,
  // but it's a good starting point.
  if (Platform.OS === 'android' && !Constants.isDevice) {
    return "http://10.0.2.2:8000/api";
  }

  return `http://${PC_IP}:8000/api`;
};

// Toggle: Use LIVE_URL for production (Vercel/APK), getLocalUrl() for development (Expo Go)
// __DEV__ is true when running locally, and false when built for Vercel/Production.
export const API_URL = __DEV__ ? getLocalUrl() : LIVE_URL;

console.log(`[API CONFIG] Env: ${__DEV__ ? 'Development' : 'Production'} | Platform: ${Platform.OS}`);
console.log('[API CONFIG] Active URL:', API_URL);
