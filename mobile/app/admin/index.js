/**
 * ADMIN CONSOLE: Professional Material 3 Dashboard.
 * - Centralized system metrics and vitals.
 * - Modern Android-inspired UI with Action Chips and Dynamic Cards.
 * - Connected to: apiService, theme.js, router.
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, StatusBar, Dimensions,
  RefreshControl, Platform, Alert, Modal, Pressable
} from 'react-native';
import Animated, { SlideInRight, SlideOutRight } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../../theme';
import { MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { apiService } from '../../services/api';
import { useToast } from '../../components/Toast';

const { width, height } = Dimensions.get('window');

const MetricItem = ({ label, value, icon, color }) => (
    <View style={styles.metricItem}>
        <View style={[styles.metricIconBox, { backgroundColor: color + '15' }]}>
            <MaterialCommunityIcons name={icon} size={22} color={color} />
        </View>
        <View>
            <Text style={styles.metricValueText}>{value}</Text>
            <Text style={styles.metricLabelText}>{label}</Text>
        </View>
    </View>
);

const ActionChip = ({ label, icon, onPress, color = theme.colors.primary }) => (
    <TouchableOpacity
        style={[styles.chip, { borderColor: color + '30' }]}
        onPress={onPress}
        activeOpacity={0.7}
    >
        <MaterialCommunityIcons name={icon} size={20} color={color} />
        <Text style={[styles.chipText, { color: color }]}>{label}</Text>
    </TouchableOpacity>
);

export default function AdminConsole() {
  const router = useRouter();
  const { showToast, ToastComponent } = useToast();
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    rejected: 0,
    users: 0,
    apps: 0
  });

  const loadStats = async () => {
    setRefreshing(true);
    try {
        const res = await apiService.getScholarships();
        const usersRes = await apiService.getUsers();
        const appsRes = await apiService.getApplications();

        if (res.ok) {
            const data = res.data;
            setStats({
                total: data.length,
                active: data.filter(s => s.status === 'active').length,
                pending: data.filter(s => s.status === 'pending').length,
                rejected: data.filter(s => s.status === 'rejected').length,
                users: usersRes.ok ? usersRes.data.length : 0,
                apps: appsRes.ok ? appsRes.data.length : 0
            });
        }
    } catch (e) {
        console.error(e);
    } finally {
        setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Admin Logout",
      "Are you sure you want to sign out from the admin console?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.removeItem('admin_verified');
            router.replace('/(tabs)/profile');
          }
        }
      ]
    );
  };

  const handleReturnToApp = () => {
    router.replace('/(tabs)/profile');
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.surface} />

      {/* M3 Style Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleReturnToApp}
        >
          <MaterialIcons name="apps" size={24} color={theme.colors.primary} />
          <Text style={styles.backButtonText}>App</Text>
        </TouchableOpacity>

        <View style={styles.headerInfo}>
            <Text style={styles.consoleTitle}>Admin</Text>
            <View style={styles.statusIndicator}>
                <View style={styles.liveDot} />
                <Text style={styles.statusText}>Working Now</Text>
            </View>
        </View>

        <View style={styles.topActions}>
          <TouchableOpacity
              style={styles.menuBtn}
              onPress={() => setMenuVisible(true)}
          >
              <MaterialCommunityIcons name="menu" size={28} color={theme.colors.heading} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={loadStats} colors={[theme.colors.primary]} />
        }
      >
        {/* Core Vitals Card */}
        <View style={[styles.vitalsCard, theme.shadows.soft]}>
            <View style={styles.vitalsHeader}>
                <Text style={styles.vitalsTitle}>Stats Summary</Text>
                <TouchableOpacity onPress={loadStats}>
                    <MaterialIcons name="refresh" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
            </View>

            <View style={styles.vitalsGrid}>
                <MetricItem label="Total" value={stats.total} icon="database" color={theme.colors.primary} />
                <MetricItem label="Live Now" value={stats.active} icon="check-decagram" color={theme.colors.success} />
                <MetricItem label="Users" value={stats.users} icon="account-group" color={theme.colors.chartSecondary} />
                <MetricItem label="Waiting" value={stats.pending} icon="clock-fast" color={theme.colors.warning} />
                <MetricItem label="Total Apps" value={stats.apps} icon="file-document-edit" color={theme.colors.info} />
            </View>
        </View>

        {/* Quick Access Chips have been moved to the Sidebar */}

        {/* Recent Activity Section */}
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Changes</Text>
                <TouchableOpacity onPress={() => router.push('/admin/scholarships')}>
                    <Text style={styles.seeAllText}>View All</Text>
                </TouchableOpacity>
            </View>

            {/* Placeholder for real activity log */}
            <View style={styles.activityBox}>
                <View style={styles.activityItem}>
                    <View style={[styles.activityDot, { backgroundColor: theme.colors.success }]} />
                    <View style={styles.activityContent}>
                        <Text style={styles.activityMain}>Database Ready</Text>
                        <Text style={styles.activitySub}>Connected to the system</Text>
                    </View>
                    <Text style={styles.activityTime}>Now</Text>
                </View>

                <View style={styles.activityItem}>
                    <View style={[styles.activityDot, { backgroundColor: theme.colors.primary }]} />
                    <View style={styles.activityContent}>
                        <Text style={styles.activityMain}>Security Ready</Text>
                        <Text style={styles.activitySub}>Safe login is active</Text>
                    </View>
                    <Text style={styles.activityTime}>2m</Text>
                </View>

                <View style={styles.activityItem}>
                    <View style={[styles.activityDot, { backgroundColor: theme.colors.warning }]} />
                    <View style={styles.activityContent}>
                        <Text style={styles.activityMain}>To-Do List</Text>
                        <Text style={styles.activitySub}>{stats.pending} items waiting for check</Text>
                    </View>
                    <Text style={styles.activityTime}>5m</Text>
                </View>
            </View>
        </View>

        {/* Maintenance Mode Toggle */}
        <TouchableOpacity
            style={styles.maintenanceBanner}
            onPress={() => showToast('System is currently in Production Mode', 'info')}
        >
            <View style={styles.maintenanceIcon}>
                <Ionicons name="shield-checkmark" size={20} color="#FFF" />
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={styles.maintenanceTitle}>Production Mode Active</Text>
                <Text style={styles.maintenanceSub}>Encrypted tunnel established</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="rgba(255,255,255,0.4)" />
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>


      
      {/* Sidebar Modal */}
      <Modal visible={menuVisible} transparent animationType="none">
        <Pressable style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
          <Animated.View
            style={styles.sidebar}
            entering={SlideInRight.duration(300)}
            exiting={SlideOutRight.duration(300)}
          >
            <Pressable onPress={(e) => e.stopPropagation()} style={{ flex: 1 }}>
              <View style={styles.sidebarHeader}>
                <Text style={styles.sidebarTitle}>Admin Menu</Text>
                <TouchableOpacity onPress={() => setMenuVisible(false)}>
                  <MaterialIcons name="close" size={24} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sidebarScroll}>
                
                <Text style={styles.sidebarSectionTitle}>Core Modules</Text>
                <TouchableOpacity style={styles.sidebarItem} onPress={() => {setMenuVisible(false); router.push('/admin/scholarships');}}>
                  <MaterialCommunityIcons name="school" size={22} color={theme.colors.primary} />
                  <Text style={styles.sidebarItemText}>Manage Scholarships</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.sidebarItem} onPress={() => {setMenuVisible(false); router.push('/admin/applications');}}>
                  <MaterialCommunityIcons name="clipboard-list" size={22} color={theme.colors.chartSecondary} />
                  <Text style={styles.sidebarItemText}>Student Applications</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.sidebarItem} onPress={() => {setMenuVisible(false); router.push('/admin/users');}}>
                  <MaterialCommunityIcons name="account-group" size={22} color={theme.colors.info} />
                  <Text style={styles.sidebarItemText}>User Directory</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.sidebarItem} onPress={() => {setMenuVisible(false); router.push('/admin/mentors');}}>
                  <MaterialCommunityIcons name="account-tie" size={22} color={theme.colors.success} />
                  <Text style={styles.sidebarItemText}>Mentor Program</Text>
                </TouchableOpacity>

                <View style={styles.sidebarDivider} />
                <Text style={styles.sidebarSectionTitle}>System</Text>

                <TouchableOpacity style={styles.sidebarItem} onPress={() => {setMenuVisible(false); router.push('/admin/moderation');}}>
                  <MaterialCommunityIcons name="shield-alert" size={22} color={theme.colors.error} />
                  <Text style={styles.sidebarItemText}>Moderation</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.sidebarItem} onPress={() => {setMenuVisible(false); router.push('/admin/broadcast');}}>
                  <MaterialCommunityIcons name="bullhorn" size={22} color={theme.colors.warning} />
                  <Text style={styles.sidebarItemText}>Push Broadcast</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.sidebarItem} onPress={() => {setMenuVisible(false); router.push('/admin/analytics');}}>
                  <MaterialCommunityIcons name="chart-areaspline" size={22} color={theme.colors.chartSecondary} />
                  <Text style={styles.sidebarItemText}>Analytics</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.sidebarItem} onPress={() => {setMenuVisible(false); router.push('/admin/logs');}}>
                  <MaterialCommunityIcons name="history" size={22} color={theme.colors.textSecondary} />
                  <Text style={styles.sidebarItemText}>History Logs</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.sidebarItem} onPress={() => {setMenuVisible(false); router.push('/admin/settings');}}>
                  <MaterialCommunityIcons name="cog" size={22} color={theme.colors.primaryDark} />
                  <Text style={styles.sidebarItemText}>Admin Settings</Text>
                </TouchableOpacity>

                <View style={styles.sidebarDivider} />

                <TouchableOpacity style={[styles.sidebarItem, { marginTop: 10 }]} onPress={() => {setMenuVisible(false); handleLogout();}}>
                  <MaterialCommunityIcons name="logout" size={22} color={theme.colors.error} />
                  <Text style={[styles.sidebarItemText, { color: theme.colors.error }]}>Secure Logout</Text>
                </TouchableOpacity>

              </ScrollView>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>

      {ToastComponent}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  topBar: {
    backgroundColor: theme.colors.surface,
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.primary,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoutBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.errorLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  consoleTitle: {
    fontSize: 22,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.heading,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.success,
  },
  statusText: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.textSecondary,
  },
  scroll: {
    padding: 20,
  },
  vitalsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 28,
    padding: 24,
    marginBottom: 24,
  },
  vitalsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  vitalsTitle: {
    fontSize: 18,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.heading,
  },
  vitalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  metricItem: {
    width: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metricIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricValueText: {
    fontSize: 20,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.heading,
  },
  metricLabelText: {
    fontSize: 11,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    gap: 8,
  },
  chipText: {
    fontSize: 13,
    fontFamily: theme.typography.fontFamily.bold,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.heading,
  },
  seeAllText: {
    fontSize: 13,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.primary,
  },
  activityBox: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 20,
    gap: 20,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  activityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  activityContent: {
    flex: 1,
  },
  activityMain: {
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.heading,
  },
  activitySub: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  activityTime: {
    fontSize: 11,
    color: theme.colors.placeholder,
  },
  maintenanceBanner: {
    backgroundColor: theme.colors.heading,
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  maintenanceIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  maintenanceTitle: {
    color: '#FFF',
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 15,
  },
  maintenanceSub: {
    color: 'rgba(255,255,255,0.6)',
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    marginTop: 2,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 0,
  },
  menuBtn: {
    padding: 8,
  },
  // Sidebar styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'stretch',
  },
  sidebar: {
    width: width * 0.78,
    height: height,
    backgroundColor: theme.colors.surface,
    elevation: 0,
    shadowColor: 'transparent',
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
    backgroundColor: theme.colors.primaryLight,
  },
  sidebarTitle: {
    fontSize: 22,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.heading,
  },
  sidebarScroll: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  sidebarSectionTitle: {
    fontSize: 11,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.textSecondary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 4,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginHorizontal: 4,
    marginVertical: 2,
  },
  sidebarItemText: {
    fontSize: 15,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.textPrimary,
  },
  sidebarDivider: {
    height: 1,
    backgroundColor: theme.colors.divider,
    marginHorizontal: 16,
    marginVertical: 8,
  },
});

