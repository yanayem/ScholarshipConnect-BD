/**
 * SIDEBAR NAVIGATION: Main navigation menu for desktop/large screens.
 * - Links to Home, Scholarships, Eligibility, Applications, and Community.
 * - Displays user profile summary at the bottom.
 * - Connected to: expo-router, theme.js, App Layout.
 */
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../theme';
import { MaterialIcons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

const NAV_ITEMS = [
  { label: 'Home', path: '/(tabs)', icon: 'home' },
  { label: 'Scholarships', path: '/(tabs)/scholarships', icon: 'school' },
  { label: 'Check Eligibility', path: '/(tabs)/eligibility', icon: 'check-circle' },
  { label: 'Applications', path: '/(tabs)/applications', icon: 'bookmark' },
  { label: 'Community', path: '/(tabs)/community', icon: 'forum' },
  { label: 'Profile', path: '/(tabs)/profile', icon: 'person' },
  { label: 'Admin Panel', path: '/admin', icon: 'admin-panel-settings' },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Check cache first for immediate UI response
        const cachedStaff = await AsyncStorage.getItem('is_staff');
        if (cachedStaff === 'true') {
           setUser(prev => prev ? { ...prev, is_staff: true } : { is_staff: true });
        }

        const res = await apiService.getProfile();
        if (res.ok) {
            setUser(res.data);
            await AsyncStorage.setItem('is_staff', res.data.is_staff.toString());
        }
      } catch (e) {}
    };
    fetchUser();
  }, [pathname]);

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : (user?.username?.substring(0, 2).toUpperCase() || 'U');

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>ScholarshipConnect</Text>
      </View>
      
      <View style={styles.navContainer}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.path);
          // Hide admin panel for non-staff
          if (item.label === 'Admin Panel' && !user?.is_staff) return null;

          return (
            <Pressable
              key={item.path}
              style={[
                styles.navItem,
                isActive && styles.navItemActive
              ]}
              onPress={() => router.push(item.path)}
            >
              <MaterialIcons 
                name={item.icon} 
                size={20} 
                color={isActive ? theme.colors.primary : theme.colors.textSecondary}
              />
              <Text style={[
                styles.navLabel,
                isActive && styles.navLabelActive
              ]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.footerContainer}>
        <View style={styles.profileSection}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.primaryLight }]}>
            <Text style={[styles.avatarText, { color: theme.colors.primary }]}>{initials}</Text>
          </View>
          <View>
            <Text style={styles.profileName} numberOfLines={1}>
                {user?.full_name || user?.username || 'User'}
            </Text>
            <Text style={styles.profileRole}>
                {user?.is_staff ? 'Administrator' : 'Student Account'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 260,
    backgroundColor: theme.colors.surface,
    borderRightWidth: 1,
    borderRightColor: theme.colors.border,
    flexDirection: 'column',
    height: '100%',
  },
  logoContainer: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  logoText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.heading,
  },
  navContainer: {
    flex: 1,
    padding: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.base,
    gap: theme.spacing.md,
  },
  navItemActive: {
    backgroundColor: theme.colors.primaryLight,
  },
  navLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
  },
  navLabelActive: {
    color: theme.colors.primary,
    fontFamily: theme.typography.fontFamily.bold,
  },
  footerContainer: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: theme.typography.fontFamily.bold,
  },
  profileName: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.heading,
  },
  profileRole: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
  },
});
