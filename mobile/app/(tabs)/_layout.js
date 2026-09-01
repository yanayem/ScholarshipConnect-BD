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
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 5,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
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

      {/* 1. Scholarships (Student Only) */}
      <Tabs.Screen
        name="scholarships"
        options={{
          title: 'Scholarships',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="school" size={24} color={color} />
          ),
          headerTitle: 'Scholarships',
          href: isMentorMode ? null : undefined,
        }}
      />



      {/* 3. Calendar (Student Only) */}
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="event" size={24} color={color} />
          ),
          headerTitle: 'Deadline Calendar',
          href: isMentorMode ? null : undefined,
        }}
      />

      {/* 4. Sessions (Mentor Only) */}
      <Tabs.Screen
        name="sessions"
        options={{
          title: 'Sessions',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="event-available" size={24} color={color} />
          ),
          headerShown: false,
          href: isMentorMode ? undefined : null,
        }}
      />

      {/* 5. Home / Dashboard (Center for BOTH modes) */}
      <Tabs.Screen
        name="index"
        options={{
          title: isMentorMode ? 'Dashboard' : 'Home',
          tabBarIcon: ({ color }) => (
            <View style={styles.homeIconContainer}>
               <MaterialIcons
                name={isMentorMode ? "dashboard" : "home"}
                size={28}
                color={color}
               />
            </View>
          ),
          headerShown: false,
        }}
      />

      {/* 6. Applications (Student Only) */}
      <Tabs.Screen
        name="applications"
        options={{
          title: 'Application',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="bookmark" size={24} color={color} />
          ),
          headerTitle: 'My Applications',
          href: isMentorMode ? null : undefined,
        }}
      />

      {/* 7. Community (Shared) */}
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="groups" size={24} color={color} />
          ),
          headerTitle: 'Community Feed',
        }}
      />

      {/* 8. Inbox (Mentor Only in Bottom Nav) */}
      <Tabs.Screen
        name="inbox"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="chat" size={24} color={color} />
          ),
          headerTitle: 'Inbox',
          href: isMentorMode ? undefined : null,
        }}
      />

      {/* 9. Profile (Mentor Only - Position 5 for Mentor) */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="person" size={24} color={color} />
          ),
          headerShown: false,
          href: isMentorMode ? undefined : null,
        }}
      />

      {/* Hidden Technical Tabs */}
      <Tabs.Screen
        name="eligibility"
        options={{
          href: null,
        }}
      />
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
