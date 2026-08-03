import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { Tabs, useRouter, usePathname } from 'expo-router';
import { theme } from '../../theme';
import { MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AdminLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const [isVerified, setIsVerified] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const checkSecurity = async () => {
      try {
        const verified = await AsyncStorage.getItem('admin_verified');
        if (!isMounted) return;

        if (verified === 'true') {
          setIsVerified(true);
        } else if (pathname !== '/admin/login') {
          router.replace('/admin/login');
        }
      } catch (e) {
        console.error('Security check failed', e);
      } finally {
        if (isMounted) setChecking(false);
      }
    };

    checkSecurity();
    return () => { isMounted = false; };
  }, [pathname, isVerified]);

  if (checking) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveTintColor: theme.colors.textSecondary,
      tabBarStyle: {
        backgroundColor: theme.colors.surface,
        borderTopWidth: 1,
        borderTopColor: theme.colors.divider,
        height: Platform.OS === 'ios' ? 88 : 68,
        paddingBottom: Platform.OS === 'ios' ? 30 : 12,
        paddingTop: 8,
        display: (pathname === '/admin/login' || !isVerified) ? 'none' : 'flex',
      },
      tabBarLabelStyle: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 11,
      },
      headerShown: false,
    }}>
      {/* Visible Bottom Nav Tabs */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons name={focused ? "view-dashboard" : "view-dashboard-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="scholarships"
        options={{
          title: 'Scholarships',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons name={focused ? "school" : "school-outline"} size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="applications"
        options={{
          title: 'Applications',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons name={focused ? "clipboard-list" : "clipboard-list-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="inbox"
        options={{
          title: 'Inbox',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons name={focused ? "email-multiple" : "email-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons name={focused ? "account-circle" : "person-outline"} size={26} color={color} />
          ),
        }}
      />

      {/* Internal Screens — hidden from nav bar */}
      <Tabs.Screen name="login" options={{ href: null }} />
      <Tabs.Screen name="broadcast" options={{ href: null }} />
      <Tabs.Screen name="users" options={{ href: null }} />
      <Tabs.Screen name="moderation" options={{ href: null }} />
      <Tabs.Screen name="mentors" options={{ href: null }} />
      <Tabs.Screen name="analytics" options={{ href: null }} />
      <Tabs.Screen name="logs" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="edit-scholarship/[id]" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background
  },
});
