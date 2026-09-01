import React, { createContext, useState, useContext, useEffect } from 'react';
import { apiService } from '../services/api';
import { firebaseAuth } from '../services/firebase';
import { notificationService } from '../services/notifications';
import { useGlobalToast } from './ToastContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useGlobalToast();

  const fetchProfile = async (force = false) => {
    if (!force && user) return user;

    // Check if we have a token before trying to fetch
    const hasToken = await AsyncStorage.getItem('token');
    if (!hasToken && !force) {
        setLoading(false);
        return null;
    }

    try {
      let res = await apiService.getProfile();

      // If 401, the token might have been refreshed automatically in apiService.handleResponse.
      // We try one more time before giving up.
      if (res.status === 401) {
        console.log('[UserContext] 401 encountered, retrying fetchProfile...');
        res = await apiService.getProfile();
      }

      if (res.ok) {
        setUser(res.data);
        await AsyncStorage.setItem('is_staff', res.data.is_staff.toString());
        await AsyncStorage.setItem('cached_user_profile', JSON.stringify(res.data));

        // Register for push notifications after successful login
        notificationService.registerForPushNotifications();

        return res.data;
      } else if (res.status === 401) {
        setUser(null);
      }
    } catch (error) {
      console.error('[UserContext] Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
    return null;
  };

  useEffect(() => {
    const initializeAuth = async () => {
      // 1. Try to load from cache immediately for instant UI
      try {
        const cached = await AsyncStorage.getItem('cached_user_profile');
        if (cached) {
          setUser(JSON.parse(cached));
          setLoading(false);
        }
      } catch (e) {}

      // 2. Check token and restore session
      const hasToken = await AsyncStorage.getItem('token');
      if (hasToken) {
        await firebaseAuth.waitForUser();
      }
      const profile = await fetchProfile();

      // Setup listeners if profile was fetched
      if (profile) {
        notificationService.setupNotificationListeners((remoteMessage) => {
          // Show a beautiful global toast for foreground notifications
          if (remoteMessage.notification) {
            showToast(
              remoteMessage.notification.body || "New notification received",
              'success'
            );
          }
        });
      }
    };

    initializeAuth();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, fetchProfile, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
