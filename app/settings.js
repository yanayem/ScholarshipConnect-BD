import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, StatusBar } from 'react-native';
import { theme } from '../theme';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const SettingToggle = ({ icon, title, value, onValueChange }) => (
  <View style={styles.settingRow}>
    <View style={styles.iconBox}>
      <MaterialIcons name={icon} size={22} color={theme.colors.primary} />
    </View>
    <Text style={styles.settingLabel}>{title}</Text>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: theme.colors.divider, true: theme.colors.primary }}
      thumbColor="white"
    />
  </View>
);

const SettingLink = ({ icon, title, value, onPress }) => (
  <TouchableOpacity style={styles.settingRow} onPress={onPress}>
    <View style={styles.iconBox}>
      <MaterialIcons name={icon} size={22} color={theme.colors.primary} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.settingLabel}>{title}</Text>
      {value && <Text style={styles.settingValue}>{value}</Text>}
    </View>
    <MaterialIcons name="chevron-right" size={24} color={theme.colors.placeholder} />
  </TouchableOpacity>
);

export default function UserSettings() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [deadlineReminders, setDeadlineReminders] = useState(true);
  const [mentorAlerts, setMentorAlerts] = useState(false);
  const [dataSharing, setDataSharing] = useState(true);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.card}>
            <SettingToggle
              icon="notifications"
              title="Push Notifications"
              value={notifications}
              onValueChange={setNotifications}
            />
            <View style={styles.divider} />
            <SettingToggle
              icon="timer"
              title="Deadline Reminders"
              value={deadlineReminders}
              onValueChange={setDeadlineReminders}
            />
            <View style={styles.divider} />
            <SettingToggle
              icon="people"
              title="Mentor Response Alerts"
              value={mentorAlerts}
              onValueChange={setMentorAlerts}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Preferences</Text>
          <View style={styles.card}>
            <SettingLink
              icon="language"
              title="Display Language"
              value="English (US)"
            />
            <View style={styles.divider} />
            <SettingLink
              icon="public"
              title="Preferred Countries"
              value="Japan, Germany, UK"
            />
            <View style={styles.divider} />
            <SettingLink
              icon="school"
              title="Degree Level"
              value="Masters"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy & Data</Text>
          <View style={styles.card}>
            <SettingToggle
              icon="share"
              title="Share profile with Mentors"
              value={dataSharing}
              onValueChange={setDataSharing}
            />
            <View style={styles.divider} />
            <SettingLink
              icon="security"
              title="Security Settings"
              onPress={() => {}}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.card}>
            <SettingLink icon="help" title="Help Center" />
            <View style={styles.divider} />
            <SettingLink icon="feedback" title="Send Feedback" />
            <View style={styles.divider} />
            <SettingLink icon="info" title="Terms & Conditions" />
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.versionText}>ScholarshipConnect v1.2.4 (Build 45)</Text>
          <TouchableOpacity style={styles.deleteBtn}>
            <Text style={styles.deleteBtnText}>Deactivate Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backBtn: {
    marginRight: theme.spacing.md,
  },
  headerTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.xl,
    color: theme.colors.textPrimary,
  },
  scroll: {
    paddingBottom: theme.spacing.xxl,
  },
  section: {
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: theme.spacing.sm,
    marginLeft: 4,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  settingLabel: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.sizes.base,
    color: theme.colors.textPrimary,
  },
  settingValue: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
    color: theme.colors.primary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.divider,
    marginHorizontal: theme.spacing.lg,
  },
  footer: {
    marginTop: theme.spacing.xxl,
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  versionText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
    color: theme.colors.placeholder,
    marginBottom: theme.spacing.lg,
  },
  deleteBtn: {
    paddingVertical: 10,
  },
  deleteBtnText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 14,
    color: theme.colors.error,
  },
});
