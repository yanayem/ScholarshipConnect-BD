import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, TouchableOpacity, Alert, Modal, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { theme } from '../../theme';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { apiService } from '../../services/api';

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
  const router = useRouter();
  const [showPassModal, setShowPassModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passForm, setPassForm] = useState({ old: '', new: '', confirm: '' });

  const handleLogout = () => {
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

  const handlePasswordChange = async () => {
    if (!passForm.old || !passForm.new || !passForm.confirm) {
        return Alert.alert('Error', 'All fields are required');
    }
    if (passForm.new !== passForm.confirm) {
        return Alert.alert('Error', 'New passwords do not match');
    }
    if (passForm.new.length < 6) {
        return Alert.alert('Error', 'New password must be at least 6 characters');
    }

    setLoading(true);
    try {
        const res = await apiService.changePassword(passForm.old, passForm.new);
        if (res.ok) {
            Alert.alert('Success', 'Password updated successfully');
            setShowPassModal(false);
            setPassForm({ old: '', new: '', confirm: '' });
        } else {
            Alert.alert('Error', res.data?.old_password?.[0] || 'Failed to update password');
        }
    } catch (e) {
        Alert.alert('Error', 'Network request failed');
    } finally {
        setLoading(false);
    }
  };

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
        <Text style={styles.sectionTitle}>Security & Access</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setShowPassModal(true)}
          >
            <View style={[styles.iconBox, { backgroundColor: theme.colors.primaryLight }]}>
              <MaterialIcons name="lock-reset" size={22} color={theme.colors.primary} />
            </View>
            <View style={styles.settingText}>
              <Text style={styles.settingTitle}>Change Admin Password</Text>
              <Text style={styles.settingDesc}>Update your security credentials</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={theme.colors.placeholder} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.logoutCard}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <View style={styles.settingItem}>
              <View style={[styles.iconBox, { backgroundColor: theme.colors.errorLight }]}>
                <MaterialIcons name="logout" size={22} color={theme.colors.error} />
              </View>
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: theme.colors.error }]}>Sign Out</Text>
                <Text style={styles.settingDesc}>Exit admin console and return to student app</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={theme.colors.error} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.versionText}>ScholarshipConnect Admin v1.0.4</Text>
      </View>

      {/* Password Change Modal */}
      <Modal visible={showPassModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContent}>
            <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Update Security</Text>
                <TouchableOpacity onPress={() => setShowPassModal(false)}>
                    <MaterialIcons name="close" size={24} color={theme.colors.placeholder} />
                </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
                <Text style={styles.inputLabel}>Current Password</Text>
                <TextInput
                    style={styles.modalInput}
                    secureTextEntry
                    value={passForm.old}
                    onChangeText={v => setPassForm({...passForm, old: v})}
                    placeholder="Enter current password"
                />

                <Text style={styles.inputLabel}>New Password</Text>
                <TextInput
                    style={styles.modalInput}
                    secureTextEntry
                    value={passForm.new}
                    onChangeText={v => setPassForm({...passForm, new: v})}
                    placeholder="Min 6 characters"
                />

                <Text style={styles.inputLabel}>Confirm New Password</Text>
                <TextInput
                    style={styles.modalInput}
                    secureTextEntry
                    value={passForm.confirm}
                    onChangeText={v => setPassForm({...passForm, confirm: v})}
                    placeholder="Repeat new password"
                />

                <TouchableOpacity
                    style={[styles.savePassBtn, loading && {opacity: 0.7}]}
                    onPress={handlePasswordChange}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.savePassBtnText}>Update Credentials</Text>
                    )}
                </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
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
  },
  logoutCard: {
    backgroundColor: 'transparent',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.heading
  },
  modalBody: { gap: 16 },
  inputLabel: {
    fontSize: 13,
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.textSecondary,
    marginBottom: -8
  },
  modalInput: {
    backgroundColor: theme.colors.background,
    height: 52,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: theme.colors.heading,
    borderWidth: 1,
    borderColor: theme.colors.divider
  },
  savePassBtn: {
    backgroundColor: theme.colors.heading,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8
  },
  savePassBtnText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.bold
  }
});
