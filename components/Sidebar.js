import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { theme } from '../theme';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/(dashboard)', icon: 'dashboard' },
  { label: 'Scholarships', path: '/(dashboard)/scholarships', icon: 'school' },
  { label: 'Application Tracker', path: '/(dashboard)/tracker', icon: 'track-changes' },
  { label: 'Documents', path: '/(dashboard)/documents', icon: 'folder' },
  { label: 'Mentors', path: '/(dashboard)/mentors', icon: 'people' },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>ScholarshipConnect</Text>
      </View>
      
      <View style={styles.navContainer}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path || pathname === item.path + '/';
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
                color={isActive ? theme.colors.textPrimary : theme.colors.textSecondary} 
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
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>S</Text>
          </View>
          <View>
            <Text style={styles.profileName}>Student User</Text>
            <Text style={styles.profileRole}>Free Plan</Text>
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
    color: theme.colors.textPrimary,
  },
  navContainer: {
    flex: 1,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.md,
  },
  navItemActive: {
    backgroundColor: theme.colors.background,
  },
  navLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
  },
  navLabelActive: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.semiBold,
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
    backgroundColor: theme.colors.primaryAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.textPrimary,
  },
  profileName: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textPrimary,
  },
  profileRole: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
  },
});
