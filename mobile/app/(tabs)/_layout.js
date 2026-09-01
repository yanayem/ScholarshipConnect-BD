/**
 * TABS LAYOUT: Defines the Bottom Tab Navigation.
 * - Manages Home, Scholarships, Calendar, Eligibility Check, Applications, Community, and Profile tabs.
 * - Optimized order: Profile (Left) | Scholarships | Calendar | Home (Center) | Applications | Community (Right).
 */
import { Tabs, useRouter, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { View, StyleSheet, Platform, TouchableOpacity, ActivityIndicator } from 'react-native';
import { theme } from '../../theme';
import { useMentorMode } from '../../context/MentorModeContext';
import { useUser } from '../../context/UserContext';
import { useEffect } from 'react';

export default function TabLayout() {
  const PRIMARY = theme.colors.primary;
  const INACTIVE = theme.colors.textSecondary;
  const TAB_BG = theme.colors.surface;
  const { isMentorMode } = useMentorMode();
  const { user, loading } = useUser();

  useEffect(() => {
    // Auth Guard: Redirect to login if not authenticated
    if (!loading && !user) {
      router.replace('/(auth)/login');
    }
  }, [user, loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // If no user and not loading, the useEffect will handle redirection.
  // We return null to prevent rendering tabs momentarily.
  if (!user) return null;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: PRIMARY,
        tabBarInactiveTintColor: INACTIVE,
        tabBarStyle: {
          backgroundColor: TAB_BG,
          borderTopWidth: 1,
          borderTopColor: theme.colors.divider,
          height: 70,
          paddingBottom: 12,
          paddingTop: 10,
          borderTopLeftRadius: 25,
          borderTopRightRadius: 25,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: theme.typography.fontFamily.bold,
          marginTop: 2,
        },
        headerStyle: {
          backgroundColor: theme.colors.surface,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.divider,
        },
        headerTintColor: theme.colors.heading,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
      }}
    >
      {/* 1. Dashboard (Home) */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="grid-view" size={26} color={color} />
          ),
          headerShown: false,
        }}
      />

      {/* 2. Scholarships */}
      <Tabs.Screen
        name="scholarships"
        options={{
          title: 'Scholarships',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="school" size={26} color={color} />
          ),
          headerTitle: 'Explore Scholarships',
        }}
      />

      {/* 3. Applications */}
      <Tabs.Screen
        name="applications"
        options={{
          title: 'Applications',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="assignment" size={26} color={color} />
          ),
          headerTitle: 'My Applications',
        }}
      />

      {/* 4. Inbox */}
      <Tabs.Screen
        name="inbox"
        options={{
          title: 'Inbox',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="mail-outline" size={26} color={color} />
          ),
          headerTitle: 'Messages',
        }}
      />

      {/* 5. Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="person-outline" size={26} color={color} />
          ),
          headerShown: false,
        }}
      />

      {/* Hidden Technical Tabs (Keep functional but hide from Bottom Bar) */}
      <Tabs.Screen name="calendar" options={{ href: null }} />
      <Tabs.Screen name="community" options={{ href: null }} />
      <Tabs.Screen name="sessions" options={{ href: null }} />
      <Tabs.Screen name="eligibility" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerIconButton: {
    padding: 8,
    marginLeft: 5,
  },
  homeIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: 'rgba(42, 157, 143, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  }
});
