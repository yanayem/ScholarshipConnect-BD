/**
 * API CONFIGURATION:
 * - Production Ready: Connected to Render Live Server.
 * - For local development, change the URL to your local IP.
 */
import { Platform } from 'react-native';

// Live Production API URL (Render)
const LIVE_URL = "https://scholarshipconnectbd.onrender.com/api";

// Development URL (Change this to your local IP if testing locally)
const LOCAL_URL = "http://10.0.2.2:8000/api";

// Export the URL that the app should use
// Set this to LIVE_URL for APK build
export const API_URL = LIVE_URL;

console.log('[API CONFIG] Active URL:', API_URL);
