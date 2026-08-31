/**
 * API CONFIGURATION:
 * - Production Ready: Connected to Render Live Server.
 */
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// 1. Live Production API URL (Render)
const LIVE_URL = process.env.EXPO_PUBLIC_LIVE_URL || "https://scholarshipconnectbd.onrender.com/api";

// 2. Manual PC IP (Your local PC IP)
const PC_IP = process.env.EXPO_PUBLIC_PC_IP || "localhost";

const getLocalUrl = () => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && !window.location.hostname.includes('192.168.')) {
        return LIVE_URL;
    }
    return "http://localhost:8000/api";
  }

  // Android Emulator specific IP
  if (Platform.OS === 'android' && (Constants.executionEnvironment === 'storeClient' || !Constants.isDevice)) {
    // If you are using physical device via Expo Go, it might still need PC_IP
    // So we check if it's actually an emulator
    return `http://${PC_IP}:8000/api`;
  }

  return `http://${PC_IP}:8000/api`;
};

const isProd = process.env.NODE_ENV === 'production' ||
               !__DEV__ ||
               (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app'));

export const API_URL = isProd ? LIVE_URL : getLocalUrl();

if (__DEV__ || (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app'))) {
    console.log(`[API CONFIG] Env: ${isProd ? 'Production' : 'Development'}`);
    console.log(`[API CONFIG] Target URL: ${API_URL}`);
}
