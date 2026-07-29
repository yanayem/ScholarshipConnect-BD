import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, StatusBar, Platform, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { theme } from '../theme';
import { apiService } from '../services/api';
import { API_URL } from '../constants/Config';
import { Loader } from '../components/Loader';

export default function SettingsScreen() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const res = await apiService.getProfile();
    if (res.ok) setUser(res.data);
    setLoading(false);
  };

  const toggleMentorStatus = async (value) => {
    setUpdating(true);
    const res = await apiService.updateProfile({ is_mentor: value });
    if (res.ok) {
      setUser(res.data);
      Alert.alert('Success', value ? 'You are now a Mentor!' : 'Mentor status disabled.');
    } else {
      Alert.alert('Error', 'Failed to update status.');
    }
    setUpdating(false);
  };

  const togglePrivacyStatus = async (value) => {
    setUpdating(true);
    // Assuming backend supports hide_cgpa field
    const res = await apiService.updateProfile({ hide_cgpa: value });
    if (res.ok) {
      setUser(res.data);
      Alert.alert('Privacy Updated', value ? 'Your CGPA is now hidden from others.' : 'Your CGPA is now public.');
    } else {
      Alert.alert('Error', 'Failed to update privacy settings.');
    }
    setUpdating(false);
  };

  const [darkMode, setDarkMode] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);

  const handleUpgrade = () => {
    if (user?.is_pro) {
      Alert.alert(
        'ScholarConnect Pro',
        'You are already a Pro member! Would you like to reset your status for testing?',
        [
          { text: 'Keep Pro', style: 'cancel' },
          {
            text: 'Reset Status (Dev)',
            style: 'destructive',
            onPress: async () => {
              setUpdating(true);
              const res = await apiService.updateProfile({ is_pro: false });
              if (res.ok) {
                setUser({ ...user, is_pro: false });
                Alert.alert('Status Reset', 'Your account is now a Free account again.');
              }
              setUpdating(false);
            }
          }
        ]
      );
    } else {
      router.push('/upgrade-pro');
    }
  };

  const SettingItem = ({ icon, label, onPress, rightElement, color = theme.colors.textPrimary, subLabel, iconType = 'material' }) => (
    <TouchableOpacity style={styles.item} onPress={onPress}>
      <View style={styles.itemLeft}>
        <View style={[styles.iconBox, { backgroundColor: theme.colors.background }]}>
          {iconType === 'material' ? (
            <MaterialIcons name={icon} size={22} color={theme.colors.primary} />
          ) : iconType === 'ionicons' ? (
            <Ionicons name={icon} size={22} color={theme.colors.primary} />
          ) : (
            <FontAwesome5 name={icon} size={18} color={theme.colors.primary} />
          )}
        </View>
        <View>
          <Text style={[styles.itemLabel, { color }]}>{label}</Text>
          {subLabel && <Text style={styles.itemSub}>{subLabel}</Text>}
        </View>
      </View>
      {rightElement || <MaterialIcons name="chevron-right" size={24} color={theme.colors.divider} />}
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  if (loading) {
    return <Loader message="Accessing settings..." />;
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.heading} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings and activity</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color={theme.colors.textSecondary} />
            <Text style={styles.searchPlaceholder}>Search settings</Text>
        </View>

        <TouchableOpacity
            style={styles.premiumBanner}
            onPress={handleUpgrade}
        >
            <View style={styles.premiumContent}>
                <View style={styles.premiumIconBox}>
                    <MaterialIcons name="workspace-premium" size={24} color="#FFD700" />
                </View>
                <View>
                    <Text style={styles.premiumTitle}>Upgrade to ScholarConnect Pro</Text>
                    <Text style={styles.premiumSub}>Use {user?.scholar_points || 0}/200 points to unlock</Text>
                </View>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>

        <SectionHeader title="Academic & Application" />
        <SettingItem
          icon="school"
          label="Scholarship Matchmaker"
          subLabel="Find scholarships based on your profile"
          onPress={() => Alert.alert('Matchmaker', 'Redirecting to matches...')}
        />
        <SettingItem
          icon="auto-fix-high"
          label="AI SOP & CV Assistant"
          subLabel="Manage AI writing preferences"
          onPress={() => Alert.alert('AI Settings', 'Configure your preferred writing tone and style.')}
        />
        <SettingItem
          icon="folder-special"
          label="Document Vault"
          subLabel="Manage transcripts, SOPs, and CVs"
          onPress={() => router.push('/documents')}
        />
        <SettingItem
          icon="assignment"
          label="Application Tracker"
          onPress={() => router.push('/applications')}
        />

        <SectionHeader title="Account & Security" />
        <SettingItem
          icon="person-outline"
          label="Personal Details"
          subLabel="Email, phone number, academic scores"
          onPress={() => router.push('/edit-profile')}
        />
        <SettingItem
          icon="verified-user"
          label="Request Verification"
          subLabel="Get a verified badge on your profile"
          onPress={() => Alert.alert('Verification', 'Verification request submitted! Our team will review your profile.')}
        />
        <SettingItem
          icon="block"
          label="Blocked Accounts"
          onPress={() => Alert.alert('Blocked', 'You haven\'t blocked anyone yet.')}
        />
        <SettingItem
          icon="lock-outline"
          label="Password and security"
          onPress={() => router.push('/change-password')}
        />

        <SectionHeader title="Privacy & Data" />
        <View style={styles.item}>
          <View style={styles.itemLeft}>
            <View style={[styles.iconBox, { backgroundColor: theme.colors.background }]}>
              <MaterialIcons name="visibility-off" size={22} color={theme.colors.primary} />
            </View>
            <View>
                <Text style={styles.itemLabel}>Hide CGPA & Scores</Text>
                <Text style={styles.itemSub}>Only visible to you and staff</Text>
            </View>
          </View>
          <Switch
            value={user?.hide_cgpa}
            onValueChange={togglePrivacyStatus}
            trackColor={{ false: theme.colors.divider, true: theme.colors.primary }}
            disabled={updating}
          />
        </View>
        <View style={styles.item}>
          <View style={styles.itemLeft}>
            <View style={[styles.iconBox, { backgroundColor: theme.colors.background }]}>
              <MaterialIcons name="cloud-download" size={22} color={theme.colors.primary} />
            </View>
            <View>
                <Text style={styles.itemLabel}>Offline Mode</Text>
                <Text style={styles.itemSub}>Access saved scholarships without internet</Text>
            </View>
          </View>
          <Switch
            value={offlineMode}
            onValueChange={setOfflineMode}
            trackColor={{ false: theme.colors.divider, true: theme.colors.primary }}
          />
        </View>

        <SectionHeader title="Appearance & Accessibility" />
        <View style={styles.item}>
          <View style={styles.itemLeft}>
            <View style={[styles.iconBox, { backgroundColor: theme.colors.background }]}>
              <MaterialIcons name="dark-mode" size={22} color={theme.colors.primary} />
            </View>
            <View>
                <Text style={styles.itemLabel}>Dark Mode</Text>
                <Text style={styles.itemSub}>Reduce eye strain (Experimental)</Text>
            </View>
          </View>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: theme.colors.divider, true: theme.colors.primary }}
          />
        </View>
        <View style={styles.item}>
          <View style={styles.itemLeft}>
            <View style={[styles.iconBox, { backgroundColor: theme.colors.background }]}>
              <MaterialIcons name="contrast" size={22} color={theme.colors.primary} />
            </View>
            <View>
                <Text style={styles.itemLabel}>High Contrast</Text>
                <Text style={styles.itemSub}>Better visibility for text</Text>
            </View>
          </View>
          <Switch
            value={highContrast}
            onValueChange={setHighContrast}
            trackColor={{ false: theme.colors.divider, true: theme.colors.primary }}
          />
        </View>
        <SettingItem
            icon="format-size"
            label="Font Size"
            onPress={() => Alert.alert('Font Size', 'Adjust font size for better readability.')}
        />

        <SectionHeader title="Community & Mentorship" />
        <View style={styles.item}>
          <View style={styles.itemLeft}>
            <View style={[styles.iconBox, { backgroundColor: theme.colors.background }]}>
              <FontAwesome5 name="user-graduate" size={18} color={theme.colors.primary} />
            </View>
            <View>
                <Text style={styles.itemLabel}>Become a Mentor</Text>
                <Text style={styles.itemSub}>Help others with their journey</Text>
            </View>
          </View>
          <Switch
            value={user?.is_mentor}
            onValueChange={toggleMentorStatus}
            trackColor={{ false: theme.colors.divider, true: theme.colors.primary }}
            disabled={updating}
          />
        </View>
        {user?.is_mentor && (
            <>
                <SettingItem
                  icon="rate-review"
                  label="Mentorship Bio & Expertise"
                  onPress={() => router.push('/edit-profile')}
                />
                <SettingItem
                  icon="event-available"
                  label="Set Availability"
                  subLabel="Manage your mentoring schedule"
                  onPress={() => Alert.alert('Availability', 'Configure when students can book sessions with you.')}
                />
            </>
        )}
        <SettingItem
            icon="forum"
            label="My Discussions"
            onPress={() => router.push('/community')}
        />

        <SectionHeader title="Preferences" />
        <SettingItem
          icon="notifications-none"
          label="Notifications"
          subLabel="Scholarship alerts, Mentions, System updates"
          onPress={() => Alert.alert('Notifications', 'Detailed notification settings coming soon.')}
        />
        <SettingItem
            icon="language"
            label="App Language"
            subLabel="English (US)"
            onPress={() => Alert.alert('Language', 'Choose your preferred language.')}
        />
        <SettingItem
            icon="place"
            label="Study Destination Preference"
            subLabel="Set your target countries for better matching"
            onPress={() => Alert.alert('Destinations', 'Choose from UK, USA, Canada, Australia, etc.')}
        />

        <SectionHeader title="Support & Legal" />
        <SettingItem
          icon="update"
          label="App Updates"
          subLabel="What's new in version 1.2.0"
          onPress={() => router.push({ pathname: '/legal', params: { type: 'updates' } })}
        />
        <SettingItem
          icon="bug-report"
          label="Report a Bug"
          onPress={() => Alert.alert('Report Bug', 'Thank you! Please describe the issue.', [{ text: 'Cancel' }, { text: 'Submit' }])}
        />
        <SettingItem
          icon="share"
          label="Invite Friends"
          subLabel="Help others find their dream scholarship"
          onPress={() => Alert.alert('Share', 'App link copied to clipboard!')}
        />
        <SettingItem
          icon="help-outline"
          label="Help Center"
          onPress={() => Alert.alert('Help', 'Contact us at support@scholarshipconnect.bd')}
        />
        <SettingItem
          icon="info-outline"
          label="Privacy Policy"
          onPress={() => router.push({ pathname: '/legal', params: { type: 'privacy' } })}
        />
        <SettingItem
          icon="description"
          label="Terms of Service"
          onPress={() => router.push({ pathname: '/legal', params: { type: 'terms' } })}
        />

        <SectionHeader title="Login" />
        <SettingItem
            icon="person-add-alt"
            label="Add account"
            color={theme.colors.primary}
            onPress={() => Alert.alert('Multi-account', 'Switching between accounts coming soon.')}
            rightElement={<View />}
        />
        <SettingItem
          icon="logout"
          label="Log out"
          color={theme.colors.error}
          onPress={() => {
            Alert.alert('Log Out', 'Are you sure?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Log Out', style: 'destructive', onPress: async () => {
                    await apiService.logout();
                    router.replace('/(auth)/login');
                }}
            ]);
          }}
          rightElement={<View />}
        />

        <View style={styles.footer}>
           <Text style={styles.versionText}>ScholarshipConnect BD</Text>
           <Text style={styles.versionText}>Version 1.2.0 (Stable)</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 50,
    paddingHorizontal: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: theme.colors.divider,
    flexDirection: 'row', alignItems: 'center'
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.heading, marginLeft: 16 },
  backBtn: { padding: 4 },
  scroll: { paddingBottom: 20 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    margin: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 10
  },
  premiumBanner: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: theme.colors.heading,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...theme.shadows.soft
  },
  premiumContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  premiumIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,215,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  premiumTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  },
  premiumSub: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 2
  },
  searchPlaceholder: {
    color: theme.colors.textSecondary,
    fontSize: 16
  },
  sectionHeader: {
    paddingHorizontal: 20, paddingVertical: 16,
    backgroundColor: '#fff', marginTop: 5
  },
  sectionTitle: {
    fontSize: 14, fontWeight: 'bold', color: theme.colors.textPrimary,
  },
  item: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 0,
  },
  itemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconBox: {
    width: 40, height: 40, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', marginRight: 16
  },
  itemLabel: { fontSize: 16, fontWeight: '500' },
  itemSub: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
  footer: { alignItems: 'center', marginTop: 40, gap: 4 },
  versionText: { fontSize: 12, color: theme.colors.placeholder }
});
