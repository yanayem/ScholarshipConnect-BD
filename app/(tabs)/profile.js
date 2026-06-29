import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView,
  TouchableOpacity, StyleSheet, StatusBar, Alert, ActivityIndicator
} from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { apiService } from '../../services/api';

export default function ProfileScreen() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { ok, data } = await apiService.getProfile();
      if (ok) {
        setUser(data);
      } else {
        // If unauthorized, redirect to login
        router.replace('/(auth)/login');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await apiService.logout();
            router.replace('/(auth)/login');
          }
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.root, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!user) return null;

  return (
    <View style={styles.root}>
      <StatusBar backgroundColor={theme.colors.background} barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Avatar & Name */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.full_name ? user.full_name.substring(0, 2).toUpperCase() : user.username.substring(0, 2).toUpperCase()}</Text>
          </View>
          <Text style={styles.userName}>{user.full_name || user.username}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <TouchableOpacity style={styles.editBtn}>
            <MaterialIcons name="edit" size={16} color={theme.colors.primary} />
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Saved', value: '0', icon: 'bookmark-outline', color: theme.colors.textSecondary, bg: theme.colors.tealCard },
            { label: 'Applied', value: '0', icon: 'send', color: theme.colors.primary, bg: theme.colors.lavenderCard },
            { label: 'Vault', value: '0', icon: 'folder-open', color: theme.colors.success, bg: theme.colors.mintCard, action: () => router.push('/documents') },
          ].map((s, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.statCard, { backgroundColor: s.bg }]}
              onPress={s.action}
              activeOpacity={s.action ? 0.7 : 1}
            >
              <MaterialIcons name={s.icon} size={22} color={s.color} />
              <Text style={[styles.statValue, { color: theme.colors.heading }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* User Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Personal Information</Text>
          {[
            { icon: 'cake', label: 'Birthday', value: user.date_of_birth || 'Not set' },
            { icon: 'phone', label: 'Phone', value: user.phone_number || 'Not set' },
            { icon: 'email', label: 'Email', value: user.email },
          ].map((row, i) => (
            <View key={i} style={styles.infoRow}>
              <MaterialIcons name={row.icon} size={18} color={theme.colors.textSecondary} />
              <View style={{ marginLeft: 16, flex: 1 }}>
                <Text style={styles.infoLabel}>{row.label}</Text>
                <Text style={styles.infoValue}>{row.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Education Card */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Education Details</Text>
          {[
            { icon: 'account-balance', label: 'University', value: user.university || 'Not set' },
            { icon: 'computer', label: 'Department', value: user.department || 'Not set' },
            { icon: 'grade', label: 'CGPA', value: user.cgpa || 'Not set' },
            { icon: 'school', label: 'Current Level', value: user.academic_level || 'Not set' },
          ].map((row, i) => (
            <View key={i} style={[styles.infoRow, i > 0 && styles.infoRowBorder]}>
              <MaterialIcons name={row.icon} size={18} color={theme.colors.textSecondary} />
              <View style={{ marginLeft: 16, flex: 1 }}>
                <Text style={styles.infoLabel}>{row.label}</Text>
                <Text style={styles.infoValue}>{row.value}</Text>
              </View>
            </View>
          ))}
        </View>


        {/* Settings */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Account Settings</Text>
          {[
            { icon: 'notifications-none', label: 'Notifications', sub: 'Manage alerts & reminders', path: '/settings' },
            { icon: 'lock-outline', label: 'Privacy & Security', sub: 'Password, 2FA', path: '/settings' },
            { icon: 'language', label: 'Language', sub: 'English', path: '/settings' },
            { icon: 'help-outline', label: 'Help & Support', sub: 'FAQ, Contact us', path: '/settings' },
            { icon: 'info-outline', label: 'About App', sub: 'Version 1.2.0', path: '/settings' },
          ].map((s, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.settingRow, i > 0 && styles.infoRowBorder]}
              activeOpacity={0.7}
              onPress={() => router.push(s.path)}
            >
              <View style={styles.settingIconWrap}>
                <MaterialIcons name={s.icon} size={20} color={theme.colors.textSecondary} />
              </View>
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={styles.settingLabel}>{s.label}</Text>
                <Text style={styles.settingSub}>{s.sub}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={theme.colors.placeholder} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <MaterialIcons name="logout" size={20} color={theme.colors.error} />
          <Text style={styles.logoutText}>Logout Session</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { padding: 20 },
  profileHeader: {
    alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.base,
    padding: 32, marginBottom: 20,
    ...theme.shadows.premium,
  },
  avatar: {
    width: 80, height: 80, borderRadius: theme.borderRadius.base, backgroundColor: theme.colors.primary,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
    ...theme.shadows.soft,
  },
  avatarText: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  userName: { fontSize: 20, fontWeight: 'bold', color: theme.colors.heading },
  userEmail: { fontSize: 14, color: theme.colors.textSecondary, marginTop: 4, marginBottom: 20 },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderRadius: theme.borderRadius.base,
    paddingHorizontal: 20, paddingVertical: 10,
    backgroundColor: theme.colors.primaryLight,
  },
  editBtnText: { color: theme.colors.primary, fontWeight: '700', fontSize: 14 },
  infoCard: {
    backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.base, padding: 24, marginBottom: 20,
    ...theme.shadows.soft,
  },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.heading, marginBottom: 20 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 12 },
  infoRowBorder: { },
  infoLabel: { fontSize: 12, color: theme.colors.textSecondary, marginBottom: 4 },
  infoValue: { fontSize: 14, color: theme.colors.textPrimary, fontWeight: '600' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statCard: {
    flex: 1, borderRadius: theme.borderRadius.base, alignItems: 'center',
    paddingVertical: 18, marginHorizontal: 4,
    ...theme.shadows.soft,
  },
  statValue: { fontSize: 20, fontWeight: 'bold', marginTop: 8 },
  statLabel: { fontSize: 11, color: theme.colors.textSecondary, marginTop: 2 },
  settingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  settingIconWrap: {
    width: 40, height: 40, borderRadius: 12, backgroundColor: theme.colors.secondaryBackground,
    alignItems: 'center', justifyContent: 'center',
  },
  settingLabel: { fontSize: 14, fontWeight: '600', color: theme.colors.heading },
  settingSub: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
  logoutBtn: {
    backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.base, paddingVertical: 18,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 8,
  },
  logoutText: { color: theme.colors.error, fontWeight: 'bold', fontSize: 15 },
});
