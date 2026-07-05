import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { theme } from '../../theme';
import { MaterialIcons } from '@expo/vector-icons';
import { apiService } from '../../services/api';
import { showToast } from '../../components/AdminToast';

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
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('Please fill in all password fields.', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }
    if (currentPassword === newPassword) {
      showToast('New password must be different from current password.', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.changePassword(currentPassword, newPassword);
      if (response.ok) {
        showToast('Password changed successfully! Use it next login.', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const errorMsg = response.data?.error || 'Failed to change password.';
        showToast(errorMsg, 'error');
      }
    } catch (error) {
      showToast('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Change Password Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Change Admin Password</Text>
        <View style={styles.card}>
          <View style={styles.passwordHeader}>
            <View style={styles.iconBox}>
              <MaterialIcons name="vpn-key" size={22} color={theme.colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingTitle}>Update Security Password</Text>
              <Text style={styles.settingDesc}>Change your Admin Portal login password</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.passwordForm}>
            <Text style={styles.inputLabel}>Current Password</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="lock-outline" size={18} color={theme.colors.placeholder} />
              <TextInput
                style={styles.input}
                placeholder="Enter current password"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry={!showCurrent}
                placeholderTextColor={theme.colors.placeholder}
              />
              <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)}>
                <MaterialIcons
                  name={showCurrent ? "visibility" : "visibility-off"}
                  size={18}
                  color={theme.colors.placeholder}
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>New Password</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="lock" size={18} color={theme.colors.placeholder} />
              <TextInput
                style={styles.input}
                placeholder="Min 6 characters"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNew}
                placeholderTextColor={theme.colors.placeholder}
              />
              <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                <MaterialIcons
                  name={showNew ? "visibility" : "visibility-off"}
                  size={18}
                  color={theme.colors.placeholder}
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Confirm New Password</Text>
            <View style={styles.inputContainer}>
              <MaterialIcons name="lock" size={18} color={theme.colors.placeholder} />
              <TextInput
                style={styles.input}
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirm}
                placeholderTextColor={theme.colors.placeholder}
              />
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                <MaterialIcons
                  name={showConfirm ? "visibility" : "visibility-off"}
                  size={18}
                  color={theme.colors.placeholder}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.changeButton, loading && { opacity: 0.7 }]}
              onPress={handleChangePassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <MaterialIcons name="check-circle" size={20} color="white" />
                  <Text style={styles.changeButtonText}>Update Password</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* General Settings Section */}
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
  passwordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  passwordForm: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  inputLabel: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.textSecondary,
    marginBottom: 6,
    marginLeft: 4,
    marginTop: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: theme.colors.divider,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textPrimary,
  },
  changeButton: {
    backgroundColor: theme.colors.primary,
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
  },
  changeButtonText: {
    color: '#fff',
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fontFamily.bold,
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
