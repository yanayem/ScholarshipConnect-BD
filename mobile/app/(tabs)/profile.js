import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../../theme';
import { apiService } from '../../services/api';

export default function ProfileScreen() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await apiService.getProfile();
      if (res && res.ok) {
        setUser(res.data);
      } else {
        setUser({
          username: 'admin',
          email: 'admin@scholarshipconnect.bd',
          full_name: 'Administrator (Test)',
          phone_number: '017XXXXXXXX',
          university: 'ScholarshipConnect Institute',
          department: 'Development',
          cgpa: '4.00',
          academic_level: 'Masters',
          profile_picture: null,
        });
      }
    } catch (error) {
      setUser({
        username: 'admin',
        email: 'admin@scholarshipconnect.bd',
        full_name: 'Administrator (Offline)',
        phone_number: '017XXXXXXXX',
        university: 'Local Host University',
        department: 'Computer Science',
        cgpa: '3.90',
        academic_level: 'Bachelors',
        profile_picture: null,
      });
    } finally {
      setLoading(false);
    }
  };

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
      uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri) => {
    setUploading(true);
    try {
      const formData = new FormData();
      const fileName = uri.split('/').pop();
      const fileType = fileName.split('.').pop();

      formData.append('profile_picture', {
        uri: uri,
        name: fileName,
        type: `image/${fileType}`,
      });

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

  const handleRemoveImage = () => {
    Alert.alert('Remove Photo', 'Confirm removal?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          const res = await apiService.updateProfile({ profile_picture: "" });
          if (res && res.ok) {
            setUser(prev => ({ ...prev, profile_picture: null }));
          }
        }
      }
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.root, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const initials = user?.full_name ? user.full_name.substring(0, 2).toUpperCase() : 'AD';

  return (
    <View style={styles.root}>
      <StatusBar backgroundColor={theme.colors.background} barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <TouchableOpacity style={styles.avatar} onPress={handleImagePick} activeOpacity={0.8}>
              {uploading ? (
                <ActivityIndicator color="#fff" />
              ) : user?.profile_picture ? (
                <Image source={{ uri: user.profile_picture }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>{initials}</Text>
              )}
              <View style={styles.editIconBadge}>
                <MaterialIcons name="camera-alt" size={14} color="#fff" />
              </View>
            </TouchableOpacity>
            {user?.profile_picture ? (
              <TouchableOpacity style={styles.removeIconBadge} onPress={handleRemoveImage}>
                <MaterialIcons name="delete" size={14} color="#fff" />
              </TouchableOpacity>
            ) : null}
          </View>
          <Text style={styles.userName}>{user?.full_name || user?.username}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          <TouchableOpacity style={styles.editBtn} onPress={() => router.push('/edit-profile')}>
            <MaterialIcons name="edit" size={16} color={theme.colors.primary} />
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <TouchableOpacity style={[styles.statCard, { backgroundColor: theme.colors.tealCard }]}>
            <MaterialIcons name="bookmark-outline" size={22} color={theme.colors.textSecondary} />
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.statCard, { backgroundColor: theme.colors.lavenderCard }]}>
            <MaterialIcons name="send" size={22} color={theme.colors.primary} />
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Applied</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: theme.colors.mintCard }]}
            onPress={() => router.push('/documents')}
          >
            <MaterialIcons name="folder-open" size={22} color={theme.colors.success} />
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Vault</Text>
          </TouchableOpacity>
        </View>

        {/* Social Media Links */}
        <View style={styles.socialRow}>
          <TouchableOpacity
            style={[styles.socialIcon, !user?.linkedin_url && styles.socialIconDisabled]}
            disabled={!user?.linkedin_url}
          >
            <MaterialIcons name="link" size={20} color={user?.linkedin_url ? "#0077b5" : "#ccc"} />
            <Text style={[styles.socialText, !user?.linkedin_url && { color: "#ccc" }]}>LinkedIn</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.socialIcon, !user?.github_url && styles.socialIconDisabled]}
            disabled={!user?.github_url}
          >
            <MaterialIcons name="code" size={20} color={user?.github_url ? "#333" : "#ccc"} />
            <Text style={[styles.socialText, !user?.github_url && { color: "#ccc" }]}>GitHub</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.socialIcon, !user?.facebook_url && styles.socialIconDisabled]}
            disabled={!user?.facebook_url}
          >
            <MaterialIcons name="facebook" size={20} color={user?.facebook_url ? "#1877f2" : "#ccc"} />
            <Text style={[styles.socialText, !user?.facebook_url && { color: "#ccc" }]}>Facebook</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Personal Information</Text>
          <View style={styles.infoRow}>
            <MaterialIcons name="cake" size={18} color={theme.colors.textSecondary} />
            <View style={styles.infoTextGroup}>
              <Text style={styles.infoLabel}>Birthday</Text>
              <Text style={styles.infoValue}>{user?.date_of_birth || 'Not set'}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="phone" size={18} color={theme.colors.textSecondary} />
            <View style={styles.infoTextGroup}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{user?.phone_number || 'Not set'}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="email" size={18} color={theme.colors.textSecondary} />
            <View style={styles.infoTextGroup}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user?.email}</Text>
            </View>
          </View>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Education Details</Text>
          <View style={styles.infoRow}>
            <MaterialIcons name="account-balance" size={18} color={theme.colors.textSecondary} />
            <View style={styles.infoTextGroup}>
              <Text style={styles.infoLabel}>University</Text>
              <Text style={styles.infoValue}>{user?.university || 'Not set'}</Text>
            </View>
          </View>
          <View style={[styles.infoRow, styles.infoRowBorder]}>
            <MaterialIcons name="computer" size={18} color={theme.colors.textSecondary} />
            <View style={styles.infoTextGroup}>
              <Text style={styles.infoLabel}>Department</Text>
              <Text style={styles.infoValue}>{user?.department || 'Not set'}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={async () => {
            await apiService.logout();
            router.replace('/(auth)/login');
          }}
        >
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
    padding: 32, marginBottom: 20, ...theme.shadows.premium,
  },
  avatarContainer: { position: 'relative', marginBottom: 16 },
  avatar: {
    width: 80, height: 80, borderRadius: theme.borderRadius.base, backgroundColor: theme.colors.primary,
    alignItems: 'center', justifyContent: 'center', ...theme.shadows.soft, overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%' },
  editIconBadge: {
    position: 'absolute', bottom: 0, right: 0, backgroundColor: theme.colors.primaryDark,
    width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  removeIconBadge: {
    position: 'absolute', top: -5, right: -5, backgroundColor: theme.colors.error,
    width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff', zIndex: 1,
  },
  avatarText: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  userName: { fontSize: 20, fontWeight: 'bold', color: theme.colors.heading },
  userEmail: { fontSize: 14, color: theme.colors.textSecondary, marginTop: 4, marginBottom: 20 },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: theme.borderRadius.base,
    paddingHorizontal: 20, paddingVertical: 10, backgroundColor: theme.colors.primaryLight,
  },
  editBtnText: { color: theme.colors.primary, fontWeight: '700', fontSize: 14 },
  infoCard: {
    backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.base,
    padding: 24, marginBottom: 20, ...theme.shadows.soft,
  },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.heading, marginBottom: 20 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 12 },
  infoRowBorder: { borderTopWidth: 1, borderTopColor: theme.colors.divider },
  infoTextGroup: { marginLeft: 16, flex: 1 },
  infoLabel: { fontSize: 12, color: theme.colors.textSecondary, marginBottom: 4 },
  infoValue: { fontSize: 14, color: theme.colors.textPrimary, fontWeight: '600' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statCard: {
    flex: 1, borderRadius: theme.borderRadius.base, alignItems: 'center',
    paddingVertical: 18, marginHorizontal: 4, ...theme.shadows.soft,
  },
  statValue: { fontSize: 20, fontWeight: 'bold', marginTop: 8, color: theme.colors.heading },
  statLabel: { fontSize: 11, color: theme.colors.textSecondary, marginTop: 2 },
  socialRow: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 20 },
  socialIcon: {
    flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: theme.colors.surface,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, ...theme.shadows.soft,
  },
  socialIconDisabled: { opacity: 0.6 },
  socialText: { fontSize: 12, fontWeight: '600', color: theme.colors.textPrimary },
  logoutBtn: {
    backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.base, paddingVertical: 18,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10,
  },
  logoutText: { color: theme.colors.error, fontWeight: 'bold', fontSize: 15 },
});
