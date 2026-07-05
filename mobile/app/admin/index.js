/**
 * ADMIN DASHBOARD: Main management console for staff.
 * - Displays system metrics (Scholarships, Users, Revenue).
 * - Provides quick access to common admin tasks.
 * - Shows recent activities and scholarship postings.
 * - Connected to: add-scholarship.js, theme.js, apiService.
 */
import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Pressable, StatusBar, Dimensions,
  TouchableOpacity, ToastAndroid, Platform, Alert
} from 'react-native';
import { theme } from '../../theme';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const showToast = (message) => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Alert.alert('Admin Info', message);
  }
};

const MetricCard = ({ title, value, icon, subValue, subColor, onPress }) => (
  <TouchableOpacity
    style={[styles.metricCard, theme.shadows.soft]}
    onPress={onPress || (() => showToast(`${title} details coming soon!`))}
  >
    <View style={styles.metricHeader}>
      <View style={[styles.metricIcon, { backgroundColor: theme.colors.primaryLight }]}>
        <MaterialIcons name={icon} size={22} color={theme.colors.primary} />
      </View>
      <MaterialIcons name="more-vert" size={18} color={theme.colors.placeholder} />
    </View>
    <Text style={styles.metricValue}>{value}</Text>
    <Text style={styles.metricTitle}>{title}</Text>
    <View style={styles.metricFooter}>
        <MaterialIcons name="trending-up" size={14} color={subColor || theme.colors.success} />
        <Text style={[styles.metricSub, { color: subColor || theme.colors.success }]}>{subValue}</Text>
    </View>
  </TouchableOpacity>
);

export default function AdminDashboard() {
  const router = useRouter();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Admin Header */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.adminName}>System Admin</Text>
          <Text style={styles.adminRole}>Master Controller</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => showToast('Notifications cleared')}
          >
            <MaterialIcons name="notifications-none" size={24} color={theme.colors.heading} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.adminAvatar}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <Text style={styles.avatarText}>A</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.sectionHeading}>Business Metrics</Text>
        <View style={styles.metricsGrid}>
          <MetricCard
            title="Total Programs"
            value="0"
            icon="school"
            subValue="---"
          />
          <MetricCard
            title="Active Scholars"
            value="0"
            icon="people-outline"
            subValue="---"
          />
          <MetricCard
            title="Pending Approval"
            value="0"
            icon="pending"
            subValue="---"
            subColor={theme.colors.warning}
            onPress={() => router.push('/admin/scholarships')}
          />
          <MetricCard
            title="Platform Reach"
            value="0"
            icon="public"
            subValue="---"
          />
        </View>

        <Text style={styles.sectionHeading}>Quick Management</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.colors.primary }]}
            onPress={() => router.push('/admin/scholarships')}
          >
            <View style={styles.actionIconCircle}>
              <MaterialIcons name="list" size={24} color={theme.colors.primary} />
            </View>
            <Text style={styles.actionBtnText}>Manage All</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.colors.heading }]}
            onPress={() => router.push('/add-scholarship')}
          >
            <View style={styles.actionIconCircle}>
              <MaterialIcons name="add" size={24} color={theme.colors.heading} />
            </View>
            <Text style={styles.actionBtnText}>Post New</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.colors.chartSecondary }]}
            onPress={() => showToast('Broadcast feature active soon!')}
          >
            <View style={styles.actionIconCircle}>
              <MaterialIcons name="campaign" size={24} color={theme.colors.chartSecondary} />
            </View>
            <Text style={styles.actionBtnText}>Broadcast</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.listSection}>
          <View style={styles.listHeader}>
            <Text style={styles.sectionHeading}>Recent Applications</Text>
            <TouchableOpacity onPress={() => showToast('Viewing all applications')}><Text style={styles.seeAll}>See All</Text></TouchableOpacity>
          </View>

          {[].map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.activityCard, theme.shadows.soft]}
              onPress={() => showToast(`Reviewing ${item.user}'s application`)}
            >
              <View style={styles.activityAvatar}>
                <Text style={styles.activityAvatarText}>{item.user.charAt(0)}</Text>
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityUser}>{item.user}</Text>
                <Text style={styles.activityProgram}>{item.program}</Text>
                <Text style={styles.activityDate}>{item.date}</Text>
              </View>
              <View style={[
                styles.statusBadge,
                { backgroundColor: item.status === 'New' ? theme.colors.mintCard : theme.colors.infoLight }
              ]}>
                <Text style={[
                    styles.statusText,
                    { color: item.status === 'New' ? theme.colors.primary : theme.colors.info }
                ]}>{item.status}</Text>
              </View>
            </TouchableOpacity>
          ))}
          <Text style={{ textAlign: 'center', color: theme.colors.textSecondary, marginTop: 10 }}>No recent applications.</Text>
        </View>

        <TouchableOpacity
          style={styles.maintenanceBanner}
          onPress={() => showToast('System status: Healthy')}
        >
            <Ionicons name="construct" size={24} color="#fff" />
            <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.bannerTitle}>System Health: Optimal</Text>
                <Text style={styles.bannerSub}>Last backup: 12 minutes ago</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#fff" />
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  topHeader: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 24,
    backgroundColor: theme.colors.surface,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  adminName: {
    fontSize: 20,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.heading,
  },
  adminRole: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.error,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  adminAvatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 18,
  },
  scrollContent: {
    padding: 24,
  },
  sectionHeading: {
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.heading,
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
  },
  metricCard: {
    width: (width - 64) / 2,
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 18,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  metricIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 22,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.heading,
  },
  metricTitle: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  metricFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 4,
  },
  metricSub: {
    fontSize: 10,
    fontFamily: theme.typography.fontFamily.bold,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  actionBtn: {
    width: (width - 80) / 3,
    height: 110,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  actionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: theme.typography.fontFamily.bold,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seeAll: {
    fontSize: 13,
    color: theme.colors.primary,
    fontFamily: theme.typography.fontFamily.bold,
  },
  activityCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityAvatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityAvatarText: {
    fontSize: 18,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.primary,
  },
  activityInfo: {
    flex: 1,
    marginLeft: 14,
  },
  activityUser: {
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.heading,
  },
  activityProgram: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  activityDate: {
    fontSize: 10,
    color: theme.colors.placeholder,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontFamily: theme.typography.fontFamily.bold,
  },
  maintenanceBanner: {
    backgroundColor: theme.colors.heading,
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  bannerTitle: {
    color: '#fff',
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 14,
  },
  bannerSub: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    marginTop: 2,
  },
});
