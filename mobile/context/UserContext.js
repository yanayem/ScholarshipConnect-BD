import React, { createContext, useState, useContext, useEffect } from 'react';
import { apiService } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (force = false) => {
    if (!force && user) return user;

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
    fetchProfile();
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
