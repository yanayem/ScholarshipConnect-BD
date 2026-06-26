import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

const PRIMARY = '#C97352';
const INACTIVE = '#7A746E';
const TAB_BG = '#FFFFFF';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: PRIMARY,
        tabBarInactiveTintColor: INACTIVE,
        tabBarStyle: {
          backgroundColor: TAB_BG,
          borderTopWidth: 1,
          borderTopColor: '#ECE7E1',
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
          elevation: 10,
          shadowColor: '#2D2A26',
          shadowOpacity: 0.08,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: PRIMARY,
          elevation: 4,
          shadowOpacity: 0.2,
        },
        headerTintColor: '#FFFFFF',
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
        name="check"
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
