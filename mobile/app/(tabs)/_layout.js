/**
 * TABS LAYOUT: Defines the Bottom Tab Navigation.
 * - Manages Home, Scholarships, Calendar, Eligibility Check, Applications, Community, and Profile tabs.
 * - Controls the header style and tab bar appearance.
 * - Connected to: index.js, scholarships.js, calendar.js, eligibility.js, applications.js, community.js, profile.js.
 */
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';

export default function TabLayout() {
  const PRIMARY = theme.colors.primary;
  const INACTIVE = theme.colors.textSecondary;
  const TAB_BG = theme.colors.surface;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: PRIMARY,
        tabBarInactiveTintColor: INACTIVE,
        tabBarStyle: {
          backgroundColor: TAB_BG,
          borderTopWidth: 1,
          borderTopColor: theme.colors.divider,
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
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
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size + 2} color={color} />
          ),
          headerTitle: '🎓 ScholarshipConnectBD',
        }}
      />
      <Tabs.Screen
        name="scholarships"
        options={{
          title: 'Scholarships',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="school" size={size + 2} color={color} />
          ),
          headerTitle: 'Scholarships',
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="event" size={size + 2} color={color} />
          ),
          headerTitle: 'Deadline Calendar',
        }}
      />
      <Tabs.Screen
        name="eligibility"
        options={{
          title: 'Check',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="check-circle" size={size + 2} color={color} />
          ),
          headerTitle: 'Eligibility Check',
        }}
      />
      <Tabs.Screen
        name="applications"
        options={{
          title: 'Applications',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="bookmark" size={size + 2} color={color} />
          ),
          headerTitle: 'My Applications',
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="forum" size={size + 2} color={color} />
          ),
          headerTitle: 'Community Discussion',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={size + 2} color={color} />
          ),
          headerTitle: 'My Profile',
        }}
      />
    </Tabs>
  );
}
