import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { apiService } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * NOTIFICATION SERVICE: Handles FCM registration and incoming messages.
 * Works with @react-native-firebase/messaging for native and basic Expo permissions.
 */

export const notificationService = {
  async registerForPushNotifications() {
    const isExpoGo = Constants.executionEnvironment === 'storeClient';
    
    // Only works on native devices (Android/iOS) and requires custom dev build
    if (Platform.OS === 'web' || isExpoGo) {
      console.log('Push notifications require a custom Dev Build. Skipping in Expo Go/Web.');
      return null;
    }

    if (!Device.isDevice) {
      console.log('Must use physical device for Push Notifications');
      return null;
    }

    try {
      let messagingModule = require('@react-native-firebase/messaging');
      let getMessaging = messagingModule.default || messagingModule;

      // Ensure it's callable
      if (typeof getMessaging !== 'function') {
         console.warn('Messaging module is not a function. Skipping Push Notifications.');
         return null;
      }

      const messaging = getMessaging();

      if (!messaging || typeof messaging.requestPermission !== 'function') {
         console.warn('Native messaging module not found or incomplete. Skipping.');
         return null;
      }

      // 1. Request Permission
      const authStatus = await messaging.requestPermission();
      const enabled =
        authStatus === getMessaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === getMessaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        console.log('Notification permission denied');
        return null;
      }

      // 2. Get FCM Token
      // For Android, this usually works directly. For iOS, ensure APNs is configured.
      const token = await messaging.getToken();

      if (token) {
        console.log('FCM Token generated:', token);

        // 3. Send to backend if logged in
        const cachedToken = await AsyncStorage.getItem('last_fcm_token');
        if (cachedToken !== token) {
          const res = await apiService.updateFCMToken(token);
          if (res.ok) {
            await AsyncStorage.setItem('last_fcm_token', token);
            console.log('FCM Token synced with backend');
          }
        }
        return token;
      }
    } catch (e) {
      console.warn('Failed to register for push notifications:', e.message);
    }
    return null;
  },

  /**
   * Listen for incoming notifications when the app is in foreground or background
   */
  setupNotificationListeners(onNotificationReceived) {
    const isExpoGo = Constants.executionEnvironment === 'storeClient';
    if (Platform.OS === 'web' || isExpoGo) return () => {};

    try {
      let messagingModule = require('@react-native-firebase/messaging');
      let getMessaging = messagingModule.default || messagingModule;
      if (typeof getMessaging !== 'function') return () => {};
      
      const messaging = getMessaging();
      if (!messaging || typeof messaging.onMessage !== 'function') return () => {};

      // Foreground handler
      const unsubscribeForeground = messaging.onMessage(async remoteMessage => {
        console.log('A new FCM message arrived in foreground!', remoteMessage);
        if (onNotificationReceived) {
            onNotificationReceived(remoteMessage);
        }
      });

      // Background/Quit state opener handler
      const unsubscribeOpener = messaging.onNotificationOpenedApp(remoteMessage => {
        console.log('Notification caused app to open from background state:', remoteMessage.notification);
      });

      // Check if app was opened from a quit state
      messaging.getInitialNotification().then(remoteMessage => {
          if (remoteMessage) {
            console.log('Notification caused app to open from quit state:', remoteMessage.notification);
          }
      });

      return () => {
        unsubscribeForeground();
        unsubscribeOpener();
      };
    } catch (e) {
      console.warn('Notification listeners could not be setup:', e.message);
      return () => {};
    }
  }
};
