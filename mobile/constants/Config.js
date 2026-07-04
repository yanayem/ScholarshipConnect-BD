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
  // Try to get the IP address where the Metro bundler is running
  const debuggerHost = Constants.expoConfig?.hostUri ||
                       Constants.manifest?.hostUri ||
                       Constants.manifest2?.extra?.expoGo?.debuggerHost;

  let localhost = '10.0.2.2'; // Default for Android Emulator

  // Fix for Web Browser testing
  if (Platform.OS === 'web' || (typeof window !== 'undefined' && window.location)) {
    // If we are in a browser, use the browser's hostname
    const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    localhost = hostname;
  } else if (debuggerHost) {
    // debuggerHost looks like "192.168.0.10:8081"
    localhost = debuggerHost.split(':')[0];
  }

  // If you are using a real device, it will use your computer's IP (e.g. 192.168.1.10)
  // If you are using an emulator, it will use 10.0.2.2 or your IP.
  const url = `http://${localhost}:8000/api`;

  console.log('[API] Current Platform:', Platform.OS);
  console.log('[API] Target URL:', url);

  return url;
};

export const API_URL = getApiUrl();
