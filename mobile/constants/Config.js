/**
 * API CONFIGURATION:
 * - Detects the host IP automatically for both Emulator and Physical Devices.
 * - For Android Emulator: Uses 10.0.2.2.
 * - For Physical Devices: Uses the local network IP of your computer.
 * - Connected to: apiService.js, expo-constants.
 */
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getApiUrl = () => {
  let hostIP = '10.0.2.2'; // Default for Android Emulator

  // Try to get the IP address where the Metro bundler is running
  const debuggerHost = Constants.expoConfig?.hostUri ||
                       Constants.manifest?.hostUri ||
                       Constants.manifest2?.extra?.expoGo?.debuggerHost;

  // Fix for Web Browser testing
  if (Platform.OS === 'web' || (typeof window !== 'undefined' && window.location)) {
    hostIP = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  } else if (debuggerHost && !debuggerHost.includes('127.0.0.1') && !debuggerHost.includes('localhost')) {
    // If we have a debugger host (usually computer IP), use it for physical devices
    hostIP = debuggerHost.split(':')[0];
  }

  // If using Android emulator, 10.0.2.2 is usually the best bet
  // You can override this manually here if needed:
  // hostIP = '192.168.0.163';

  const url = `http://${hostIP}:8000/api`;

  console.log('[API] Current Platform:', Platform.OS);
  console.log('[API] Target URL:', url);

  return url;
};

export const API_URL = getApiUrl();
