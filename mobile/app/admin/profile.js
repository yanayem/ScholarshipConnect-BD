import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Image, TouchableOpacity, ActivityIndicator,
  Alert, StatusBar, Platform
} from 'react-native';
import { theme } from '../../theme';
import { MaterialIcons, Ionicons, FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { apiService } from '../../services/api';
import * as ImagePicker from 'expo-image-picker';

export default function AdminProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const fetchProfile = async () => {
    try {
      const res = await apiService.getProfile();
      if (res.ok) {
        setUser(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch admin profile', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Gallery access is required.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      uploadImage(asset.uri, asset.mimeType, asset.fileName);
    }
  };

  const uploadImage = async (uri, mimeType, fileName) => {
    setUploading(true);
    try {
      const formData = new FormData();
      const finalFileName = fileName || uri.split('/').pop() || 'profile.jpg';
      const finalType = mimeType || `image/${finalFileName.split('.').pop() || 'jpeg'}`;

      if (Platform.OS === 'web') {
        const response = await fetch(uri);
        const blob = await response.blob();
        formData.append('profile_picture', blob, finalFileName);
      } else {
        formData.append('profile_picture', {
          uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
          name: finalFileName,
          type: finalType,
        });
      }

      const res = await apiService.updateProfile(formData);
      if (res && res.ok) {
        setUser(prev => ({ ...prev, profile_picture: res.data.profile_picture }));
        Alert.alert('Success', 'Profile photo updated');
      } else {
        Alert.alert('Error', 'Could not save image');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Connection failed');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : (user?.username?.substring(0, 2).toUpperCase() || 'AD');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.surface} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>System Administrator</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <TouchableOpacity style={styles.avatarContainer} onPress={handleImagePick} activeOpacity={0.8}>
            {uploading ? (
              <ActivityIndicator color={theme.colors.primary} />
            ) : user?.profile_picture ? (
              <Image source={{ uri: user.profile_picture }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.initialsAvatar]}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            )}
            <View style={styles.editBadge}>
              <MaterialIcons name="camera-alt" size={14} color="#fff" />
            </View>
          </TouchableOpacity>

          <Text style={styles.userName}>{user?.full_name || user?.username}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.adminBadge}>
                <MaterialIcons name="verified-user" size={12} color="#fff" />
                <Text style={styles.adminBadgeText}>SUPERUSER</Text>
            </View>
          </View>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Details</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
                <MaterialIcons name="person-outline" size={20} color={theme.colors.primary} />
                <View style={styles.infoText}>
                    <Text style={styles.infoLabel}>Username</Text>
                    <Text style={styles.infoValue}>{user?.username}</Text>
                </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
                <MaterialIcons name="phone" size={20} color={theme.colors.primary} />
                <View style={styles.infoText}>
                    <Text style={styles.infoLabel}>Phone Number</Text>
                    <Text style={styles.infoValue}>{user?.phone_number || 'Not set'}</Text>
                </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
                <MaterialIcons name="security" size={20} color={theme.colors.primary} />
                <View style={styles.infoText}>
                    <Text style={styles.infoLabel}>Access Level</Text>
                    <Text style={styles.infoValue}>Global Administrator</Text>
                </View>
            </View>
          </View>
        </View>

        <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push('/admin/settings')}
        >
            <Ionicons name="settings-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.actionBtnText}>Account Settings & Security</Text>
            <MaterialIcons name="chevron-right" size={24} color={theme.colors.placeholder} />
        </TouchableOpacity>

        <TouchableOpacity
            style={[styles.actionBtn, {marginTop: 12}]}
            onPress={async () => {
                await apiService.logout();
                router.replace('/(auth)/login');
            }}
        >
            <MaterialIcons name="logout" size={20} color={theme.colors.error} />
            <Text style={[styles.actionBtnText, {color: theme.colors.error}]}>Logout Session</Text>
        </TouchableOpacity>

        <View style={{height: 40}} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    backgroundColor: theme.colors.surface,
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.heading
  },
  scroll: { padding: 20 },
  profileCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    ...theme.shadows.premium,
    marginBottom: 24
  },
  avatarContainer: { position: 'relative', marginBottom: 16 },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: theme.colors.primaryLight
  },
  initialsAvatar: {
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarText: {
    fontSize: 32,
    color: '#fff',
    fontFamily: theme.typography.fontFamily.bold
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff'
  },
  userName: {
    fontSize: 22,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.heading
  },
  badgeRow: { marginTop: 8, marginBottom: 4 },
  adminBadge: {
    backgroundColor: theme.colors.heading,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 6
  },
  adminBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: theme.typography.fontFamily.bold,
    letterSpacing: 1
  },
  userEmail: {
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.textSecondary,
    marginTop: 8
  },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 13,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4
  },
  infoCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.divider
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4
  },
  infoText: { marginLeft: 16, flex: 1 },
  infoLabel: {
    fontSize: 11,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.textSecondary,
    marginBottom: 2
  },
  infoValue: {
    fontSize: 15,
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.heading
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.divider,
    marginHorizontal: 12
  },
  actionBtn: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.divider
  },
  actionBtnText: {
    flex: 1,
    marginLeft: 16,
    fontSize: 15,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.heading
  }
});
