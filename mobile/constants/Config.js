/**
 * API CONFIGURATION:
 * - Production Ready: Connected to Render Live Server.
 * - For local development, the app automatically chooses between localhost, Emulator IP, or Manual IP.
 */
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// 1. Live Production API URL (Render)
const LIVE_URL = "https://scholarshipconnectbd.onrender.com/api";

// 2. Manual PC IP (Your local PC IP for testing)
const PC_IP = "192.168.182.221";

const getLocalUrl = () => {
  if (Platform.OS === 'web') {
    return "http://localhost:8000/api";
  }

  if (Platform.OS === 'android' && !Constants.isDevice) {
    return "http://10.0.2.2:8000/api";
  }

  return `http://${PC_IP}:8000/api`;
};

/**
 * ENVIRONMENT DETECTION:
 * - In Vercel or Production builds, NODE_ENV is 'production'.
 * - In local development (npm run dev), it's 'development'.
 */
const isProd = process.env.NODE_ENV === 'production' || !__DEV__;

export const API_URL = isProd ? LIVE_URL : getLocalUrl();

console.log(`[API CONFIG] Mode: ${isProd ? 'Production (Render)' : 'Development (Local)'}`);
console.log(`[API CONFIG] Active URL: ${API_URL}`);
