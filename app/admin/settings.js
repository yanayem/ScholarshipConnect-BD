import React from 'react';
import { View, Text, StyleSheet, Switch, ScrollView } from 'react-native';
import { theme } from '../../theme';
import { MaterialIcons } from '@expo/vector-icons';

const SettingItem = ({ icon, title, description, value, onValueChange, type = 'switch' }) => (
  <View style={styles.settingItem}>
    <View style={styles.iconBox}>
      <MaterialIcons name={icon} size={22} color={theme.colors.primary} />
    </View>
    <View style={styles.settingText}>
      <Text style={styles.settingTitle}>{title}</Text>
      <Text style={styles.settingDesc}>{description}</Text>
    </View>
    {type === 'switch' && (
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: theme.colors.divider, true: theme.colors.primary }}
        thumbColor="white"
      />
    )}
  </View>
);

export default function AdminSettings() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>General Settings</Text>
        <View style={styles.card}>
          <SettingItem
            icon="notifications-active"
            title="System Maintenance Mode"
            description="Disable user access during updates"
            value={false}
          />
          <View style={styles.divider} />
          <SettingItem
            icon="security"
            title="Two-Factor Authentication"
            description="Require 2FA for all admin accounts"
            value={true}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Scholarship Management</Text>
        <View style={styles.card}>
          <SettingItem
            icon="auto-awesome"
            title="Auto-Approve Verified Sources"
            description="Automatically publish scholarships from trusted partners"
            value={true}
          />
          <View style={styles.divider} />
          <SettingItem
            icon="email"
            title="Deadline Notifications"
            description="Notify users 48 hours before scholarship expiry"
            value={true}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.versionText}>ScholarshipConnect Admin v1.0.4</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  section: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.md,
    letterSpacing: 1,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.sizes.base,
    color: theme.colors.textPrimary,
  },
  settingDesc: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.divider,
    marginHorizontal: theme.spacing.lg,
  },
  footer: {
    padding: theme.spacing.xxl,
    alignItems: 'center',
  },
  versionText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.placeholder,
  }
});
