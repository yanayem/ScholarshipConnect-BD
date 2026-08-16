/**
 * SIDEBAR NAVIGATION: Main navigation menu for desktop/large screens.
 * - Links to Home, Scholarships, Eligibility, Applications, and Community.
 * - Displays user profile summary at the bottom.
 * - Connected to: expo-router, theme.js, App Layout.
 */
import React from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Modal, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../theme';
import { MaterialIcons } from '@expo/vector-icons';
import { useUser } from '../context/UserContext';
import { apiService } from '../services/api';

const NAV_ITEMS = [
  { label: 'Home', path: '/(tabs)', icon: 'home' },
  { label: 'Scholarships', path: '/(tabs)/scholarships', icon: 'school' },
  { label: 'Archive', path: '/previous-scholarships', icon: 'history' },
  { label: 'Check Eligibility', path: '/(tabs)/eligibility', icon: 'check-circle' },
  { label: 'Applications', path: '/(tabs)/applications', icon: 'bookmark' },
  { label: 'Community', path: '/(tabs)/community', icon: 'forum' },
  { label: 'Support', path: 'action:support', icon: 'support-agent' },
  { label: 'User Manual', path: '/manual', icon: 'help-outline' },
  { label: 'Profile', path: '/(tabs)/profile', icon: 'person' },
  { label: 'Admin Panel', path: '/admin', icon: 'admin-panel-settings' },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUser();
  const [loadingSupport, setLoadingSupport] = React.useState(false);
  const [staffList, setStaffList] = React.useState([]);
  const [showStaffModal, setShowStaffModal] = React.useState(false);

  const handleSupport = async () => {
    try {
      setLoadingSupport(true);
      const res = await apiService.getUsers('is_staff=true');
      if (res.ok) {
        setStaffList(res.data);
        setShowStaffModal(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSupport(false);
    }
  };

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : (user?.username?.substring(0, 2).toUpperCase() || 'U');


  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/images/logo-glow.png')}
          style={{ width: 30, height: 30, marginBottom: 10 }}
          resizeMode="contain"
        />
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
              onPress={() => {
                if (item.path === 'action:support') {
                  handleSupport();
                } else {
                  router.push(item.path);
                }
              }}
              disabled={item.path === 'action:support' && loadingSupport}
            >
              {item.path === 'action:support' && loadingSupport ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : (
                <MaterialIcons
                  name={item.icon}
                  size={20}
                  color={isActive ? theme.colors.primary : theme.colors.textSecondary}
                />
              )}
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

      {/* Staff Selection Modal */}
      <Modal
        visible={showStaffModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowStaffModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Support Team</Text>
              <TouchableOpacity onPress={() => setShowStaffModal(false)}>
                <MaterialIcons name="close" size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSub}>Select an administrator to chat with:</Text>

            <ScrollView style={styles.staffScroll}>
              {staffList.map((staff) => (
                <TouchableOpacity
                  key={staff.id}
                  style={styles.staffItem}
                  onPress={() => {
                    setShowStaffModal(false);
                    router.push({
                      pathname: `/messages/${staff.id || staff.user_id}`,
                      params: { name: staff.full_name || staff.username, avatar: staff.avatar_url }
                    });
                  }}
                >
                  <View style={[styles.avatarMini, { backgroundColor: theme.colors.primaryLight }]}>
                    {staff.avatar_url ? (
                      <Image source={{ uri: staff.avatar_url }} style={styles.avatarMiniImage} />
                    ) : (
                      <Text style={styles.avatarMiniText}>
                        {(staff.full_name || staff.username || 'A')[0].toUpperCase()}
                      </Text>
                    )}
                  </View>
                  <View>
                    <Text style={styles.staffName}>{staff.full_name || staff.username}</Text>
                    <Text style={styles.staffRole}>{staff.is_superuser ? 'Super Admin' : 'Support Staff'}</Text>
                  </View>
                </TouchableOpacity>
              ))}
              {staffList.length === 0 && (
                <Text style={styles.emptyText}>No support staff available right now.</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.heading,
  },
  modalSub: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 20,
  },
  staffScroll: {
    marginBottom: 20,
  },
  staffItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    backgroundColor: theme.colors.background,
    marginBottom: 10,
    gap: 15,
  },
  avatarMini: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarMiniImage: {
    width: '100%',
    height: '100%',
  },
  avatarMiniText: {
    fontWeight: 'bold',
    color: theme.colors.primary,
    fontSize: 18,
  },
  staffName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.heading,
  },
  staffRole: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
    marginTop: 20,
  }
});
