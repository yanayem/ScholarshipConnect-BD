/**
 * API CONFIGURATION:
 * - Production Ready: Connected to Render Live Server.
 */
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// 1. Live Production API URL (Render)
const LIVE_URL = "https://scholarshipconnectbd.onrender.com/api";

// 2. Manual PC IP (Your local PC IP for testing)
const PC_IP = "192.168.182.221";

const getLocalUrl = () => {
  if (Platform.OS === 'web') {
    // If we are in a browser, but not on localhost, we should probably use LIVE_URL
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && !window.location.hostname.includes('192.168.')) {
        return LIVE_URL;
    }
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
 * - In local development, it checks the hostname.
 */
const isProd = process.env.NODE_ENV === 'production' ||
               !__DEV__ ||
               (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app'));

export const API_URL = isProd ? LIVE_URL : getLocalUrl();

// Log basic info for debugging without leaking secrets
if (__DEV__ || (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app'))) {
    console.log(`[API CONFIG] Env: ${isProd ? 'Production' : 'Development'}`);
    console.log(`[API CONFIG] Target URL: ${API_URL}`);
}
