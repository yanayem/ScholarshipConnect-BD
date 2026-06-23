import { useState } from 'react';
import {
  View, Text, ScrollView,
  TouchableOpacity, StyleSheet, StatusBar, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

const USER = {
  name: 'Md. Rahim Uddin',
  email: 'rahim@example.com',
  phone: '+880 17XX XXXXXX',
  university: 'Bangladesh University of Engineering & Technology',
  department: 'Computer Science & Engineering',
  cgpa: '3.72 / 4.00',
  currentLevel: 'Bachelors',
  graduationYear: '2025',
  avatar: 'RU',
};

const SETTINGS = [
  { icon: 'notifications', label: 'Notifications', sub: 'Manage alerts & reminders' },
  { icon: 'lock', label: 'Privacy & Security', sub: 'Password, 2FA' },
  { icon: 'language', label: 'Language', sub: 'English' },
  { icon: 'help-outline', label: 'Help & Support', sub: 'FAQ, Contact us' },
  { icon: 'info-outline', label: 'About App', sub: 'Version 1.0.0' },
];

export default function ProfileScreen() {
  const [user] = useState(USER);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => router.replace('/(auth)/login')
        },
      ]
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar backgroundColor="#1565C0" barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Avatar & Name */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.avatar}</Text>
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          <TouchableOpacity style={styles.editBtn}>
            <MaterialIcons name="edit" size={16} color="#1565C0" />
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* User Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>📋 Personal Information</Text>
          {[
            { icon: 'phone', label: 'Phone', value: user.phone },
            { icon: 'email', label: 'Email', value: user.email },
          ].map((row, i) => (
            <View key={i} style={styles.infoRow}>
              <MaterialIcons name={row.icon} size={18} color="#1565C0" />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={styles.infoLabel}>{row.label}</Text>
                <Text style={styles.infoValue}>{row.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Education Card */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>🎓 Education Details</Text>
          {[
            { icon: 'account-balance', label: 'University', value: user.university },
            { icon: 'computer', label: 'Department', value: user.department },
            { icon: 'grade', label: 'CGPA', value: user.cgpa },
            { icon: 'school', label: 'Current Level', value: user.currentLevel },
            { icon: 'calendar-today', label: 'Graduation Year', value: user.graduationYear },
          ].map((row, i) => (
            <View key={i} style={[styles.infoRow, i > 0 && styles.infoRowBorder]}>
              <MaterialIcons name={row.icon} size={18} color="#1565C0" />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={styles.infoLabel}>{row.label}</Text>
                <Text style={styles.infoValue}>{row.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Quick Stats & Actions */}
        <View style={styles.statsRow}>
          {[
            { label: 'Saved', value: '4', icon: 'bookmark', color: '#607D8B' },
            { label: 'Applied', value: '3', icon: 'send', color: '#1565C0' },
            { label: 'Documents', value: '3', icon: 'description', color: '#2E7D32', action: () => router.push('/documents') },
          ].map((s, i) => (
            <TouchableOpacity
              key={i}
              style={styles.statCard}
              onPress={s.action}
              activeOpacity={s.action ? 0.7 : 1}
            >
              <MaterialIcons name={s.icon} size={24} color={s.color} />
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Settings */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>⚙️ Settings</Text>
          {SETTINGS.map((s, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.settingRow, i > 0 && styles.infoRowBorder]}
              activeOpacity={0.7}
            >
              <View style={styles.settingIconWrap}>
                <MaterialIcons name={s.icon} size={20} color="#1565C0" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.settingLabel}>{s.label}</Text>
                <Text style={styles.settingSub}>{s.sub}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={22} color="#B0BEC5" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <MaterialIcons name="logout" size={20} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F4F6FA' },
  scroll: { padding: 16 },
  profileHeader: {
    alignItems: 'center', backgroundColor: '#fff', borderRadius: 16,
    padding: 24, marginBottom: 16,
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#1565C0',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  avatarText: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  userName: { fontSize: 20, fontWeight: 'bold', color: '#1A237E' },
  userEmail: { fontSize: 14, color: '#607D8B', marginTop: 4, marginBottom: 14 },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1.5, borderColor: '#1565C0', borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 8,
  },
  editBtnText: { color: '#1565C0', fontWeight: '700', fontSize: 14 },
  infoCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 16,
    elevation: 3, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 6,
  },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#1A237E', marginBottom: 14 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 10 },
  infoRowBorder: { borderTopWidth: 1, borderTopColor: '#ECEFF1' },
  infoLabel: { fontSize: 12, color: '#90A4AE', marginBottom: 2 },
  infoValue: { fontSize: 14, color: '#263238', fontWeight: '600' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  statCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12, alignItems: 'center',
    paddingVertical: 14, marginHorizontal: 4,
    elevation: 3, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6,
  },
  statValue: { fontSize: 20, fontWeight: 'bold', marginTop: 6 },
  statLabel: { fontSize: 11, color: '#607D8B', marginTop: 2 },
  settingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  settingIconWrap: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: '#E3F2FD',
    alignItems: 'center', justifyContent: 'center',
  },
  settingLabel: { fontSize: 14, fontWeight: '600', color: '#263238' },
  settingSub: { fontSize: 12, color: '#90A4AE', marginTop: 2 },
  logoutBtn: {
    backgroundColor: '#C62828', borderRadius: 14, paddingVertical: 16,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 8,
    elevation: 3, shadowColor: '#C62828', shadowOpacity: 0.3, shadowRadius: 6,
  },
  logoutText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
