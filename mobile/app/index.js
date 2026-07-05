import { Redirect, useRootNavigationState } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../theme';

export default function Index() {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const val = await AsyncStorage.getItem('token');
        setToken(val);
      } catch (e) {
        console.error('Auth Check Error:', e);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (!rootNavigationState?.key || loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // Use Redirect component for more stable navigation during mount
  if (token) {
    return <Redirect href="/(tabs)" />;
  } else {
    return <Redirect href="/(auth)/login" />;
  }
}
