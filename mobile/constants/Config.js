/**
 * API CONFIGURATION:
 * - Detects the host IP automatically for both Emulator and Physical Devices.
 * - For Android Emulator: Uses 10.0.2.2.
 * - For Physical Devices: Uses the local network IP of your computer.
 * - Connected to: apiService.js, expo-constants.
 */
import Constants from 'expo-constants';
import { Platform, NativeModules } from 'react-native';
import * as Device from 'expo-device';

const getApiUrl = () => {
  let localhost = '192.168.0.163'; // Your PC's Local IP for Physical Devices

  // 1. For Android Emulator, 10.0.2.2 is the dedicated loopback to the host machine.
  if (Platform.OS === 'android' && !Device.isDevice) {
    localhost = '10.0.2.2';
    console.log('[API CONFIG] Android Emulator detected, using 10.0.2.2');
  }

  const url = `http://${localhost}:8000/api`;

  console.log('[API CONFIG] Detected Host:', localhost, Device.isDevice ? '(Device)' : '(Emulator)');
  console.log('[API CONFIG] Target URL:', url);

  return url;
};

export const API_URL = getApiUrl();
