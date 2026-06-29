import { View, StyleSheet, useWindowDimensions, Text, Pressable } from 'react-native';
import { Stack, useRouter, usePathname } from 'expo-router';
import { theme } from '../../theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const NAV_ITEMS = [
    { label: 'Admin Home', path: '/admin', icon: 'admin-panel-settings' },
    { label: 'Manage Scholarships', path: '/admin/scholarships', icon: 'edit-note' },
    { label: 'User Reports', path: '/admin/users', icon: 'people-alt' },
    { label: 'Settings', path: '/admin/settings', icon: 'settings' },
    { label: 'Back to App', path: '/(tabs)', icon: 'arrow-back' },
  ];

  return (
    <View style={styles.sidebar}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>Admin Portal</Text>
      </View>

      <View style={styles.navContainer}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path;
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
                size={22}
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
    </View>
  );
}

export default function AdminLayout() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.wrapper}>
        {isDesktop && <AdminSidebar />}
        <View style={styles.mainContent}>
          <Stack screenOptions={{
            headerShown: !isDesktop,
            headerStyle: { backgroundColor: theme.colors.surface },
            headerTitleStyle: {
              fontFamily: theme.typography.fontFamily.bold,
              color: theme.colors.primary
            },
            headerTintColor: theme.colors.primary,
            contentStyle: { backgroundColor: theme.colors.background }
          }}>
            <Stack.Screen name="index" options={{ title: 'Admin Dashboard' }} />
            <Stack.Screen name="scholarships" options={{ title: 'Manage Scholarships' }} />
            <Stack.Screen name="users" options={{ title: 'User Management' }} />
            <Stack.Screen name="settings" options={{ title: 'Admin Settings' }} />
          </Stack>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  wrapper: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 280,
    backgroundColor: theme.colors.surface,
    borderRightWidth: 1,
    borderRightColor: theme.colors.border,
    height: '100%',
  },
  logoContainer: {
    padding: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  logoText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.xl,
    color: theme.colors.primary,
  },
  navContainer: {
    padding: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.md,
  },
  navItemActive: {
    backgroundColor: theme.colors.primaryLight,
  },
  navLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.base,
    color: theme.colors.textSecondary,
  },
  navLabelActive: {
    color: theme.colors.primary,
    fontFamily: theme.typography.fontFamily.semiBold,
  },
  mainContent: {
    flex: 1,
  },
});
