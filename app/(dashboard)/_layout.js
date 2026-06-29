import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { Tabs } from 'expo-router';
import Sidebar from '../../components/Sidebar';
import { theme } from '../../theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

export default function DashboardLayout() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  return (
    <SafeAreaView style={styles.container} edges={isDesktop ? ['top', 'bottom', 'left', 'right'] : ['top']}>
      {isDesktop && <Sidebar />}
      <View style={styles.mainContent}>
        <Tabs screenOptions={{ 
          headerShown: false, 
          tabBarStyle: isDesktop ? { display: 'none' } : { 
            backgroundColor: theme.colors.surface, 
            borderTopColor: theme.colors.border,
            elevation: 8,
            height: 60,
            paddingBottom: 8,
          },
          tabBarActiveTintColor: theme.colors.textPrimary,
          tabBarInactiveTintColor: theme.colors.textSecondary,
          sceneStyle: { backgroundColor: theme.colors.background }
        }}>
          <Tabs.Screen 
            name="index" 
            options={{ 
              title: 'Home',
              tabBarIcon: ({ color }) => <MaterialIcons name="dashboard" size={24} color={color} />
            }} 
          />
          <Tabs.Screen 
            name="scholarships" 
            options={{ 
              title: 'Discover',
              tabBarIcon: ({ color }) => <MaterialIcons name="school" size={24} color={color} />
            }}
          />
          <Tabs.Screen
            name="tracker"
            options={{
              title: 'Tracker',
              tabBarIcon: ({ color }) => <MaterialIcons name="track-changes" size={24} color={color} />
            }}
          />
          <Tabs.Screen
            name="mentors"
            options={{
              title: 'Mentors',
              tabBarIcon: ({ color }) => <MaterialIcons name="people" size={24} color={color} />
            }}
          />
        </Tabs>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
  },
  mainContent: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
