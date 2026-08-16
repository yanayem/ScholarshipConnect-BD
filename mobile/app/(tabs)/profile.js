import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, StatusBar, Alert, ActivityIndicator, RefreshControl, Platform, Modal, Pressable, Linking, Switch } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons, FontAwesome, Ionicons, FontAwesome5, Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import Animated, { FadeInRight, SlideInRight, SlideOutRight, FadeIn, Layout } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../../theme';
import { apiService } from '../../services/api';
import { useToast } from '../../components/Toast';
import { Loader } from '../../components/Loader';
import { useMentorMode } from '../../context/MentorModeContext';

import { useUser } from '../../context/UserContext';

export default function ProfileScreen() {
  const { user, setUser, fetchProfile } = useUser();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [loadingSupport, setLoadingSupport] = useState(false);
  const { isMentorMode, toggleMentorMode } = useMentorMode();
  const { showToast, ToastComponent } = useToast();
  const [stats, setStats] = useState({
    saved: 0,
    applied: 0,
    documents: 0
  });

  const fetchStats = async () => {
    try {
      const [savedRes, appsRes, docsRes] = await Promise.all([
        apiService.getSavedScholarships(),
        apiService.getApplications(),
        apiService.getDocuments()
      ]);

      setStats({
        saved: savedRes.ok ? savedRes.data.length : 0,
        applied: appsRes.ok ? appsRes.data.length : 0,
        documents: docsRes.ok ? docsRes.data.length : 0
      });
    } catch (error) {
      console.error('Failed to fetch stats', error);
    }
  };

  const loadData = async () => {
    await Promise.all([fetchProfile(true), fetchStats()]);
    setLoading(false);
  };


  const handleToggleMentorMode = async (value) => {
    if (value && !user?.is_mentor) {
      Alert.alert('Not a Mentor', 'You need to become a mentor first.');
      return;
    }
    await toggleMentorMode(value);
    showToast(value ? 'Switched to Mentor Mode' : 'Switched to Student Mode', 'info');
    // Auto redirect to Home (Index) which transforms based on mode
    router.replace('/(tabs)');
  };

  const handleBecomeMentor = async () => {
    try {
      setLoading(true);
      const res = await apiService.updateProfile({ is_mentor: true });
      if (res && res.ok) {
        setUser(res.data);
        await toggleMentorMode(true);
        showToast('You are now a Mentor!', 'success');
        router.replace('/(tabs)');
      } else {
        showToast('Failed to update status', 'error');
      }
    } catch (error) {
      showToast('Connection error', 'error');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchProfile(), fetchStats()]);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (user && isMentorMode && !user.is_mentor) {
      toggleMentorMode(false);
    }
  }, [user, isMentorMode]);

  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Gallery access is required.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
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

      let extension = 'jpg';
      if (mimeType) {
        extension = mimeType.split('/').pop();
      } else if (uri.includes('.')) {
        extension = uri.split('.').pop().toLowerCase();
      }

      if (extension.length > 4) extension = 'jpg';
      const finalType = `image/${extension === 'jpg' ? 'jpeg' : extension}`;
      const finalFileName = fileName || `profile_${Date.now()}.${extension}`;

      // Handle file preparation for Web vs Native
      if (Platform.OS === 'web') {
        const response = await fetch(uri);
        const blob = await response.blob();
        formData.append('profile_picture', blob, finalFileName);
      } else {
        formData.append('profile_picture', {
          uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
          name: finalFileName,
          type: finalType,
        });
      }

      console.log('[UPLOAD] Attempting:', { finalFileName, finalType, uri });

      const res = await apiService.updateProfile(formData);
      if (res && res.ok) {
        setUser(res.data);
        showToast('Profile photo updated', 'success');
      } else {
        console.log('[UPLOAD FAIL] Server Response:', res.data);
        const errorMsg = res.data?.profile_picture || res.data?.error || 'Upload failed';
        showToast(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg, 'error');
      }
    } catch (error) {
      console.error('[UPLOAD ERROR]', error);
      showToast('Connection failed during upload', 'error');
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
          try {
            const res = await apiService.updateProfile({ profile_picture: null });
            if (res && res.ok) {
              setUser(res.data);
              showToast('Photo removed', 'info');
            }
          } catch (e) {
            showToast('Failed to remove photo', 'error');
          }
        }
      }
    ]);
  };

  if (loading) {
    return <Loader message="Loading Profile..." />;
  }

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : (user?.username?.substring(0, 2).toUpperCase() || '??');

  const renderTags = (text) => {
    if (!text) return <Text style={styles.infoValue}>Not set</Text>;
    const tags = text.split(',').map(t => t.trim()).filter(Boolean);
    if (tags.length === 0) return <Text style={styles.infoValue}>Not set</Text>;
    return (
      <View style={styles.tagsContainer}>
        {tags.map((tag, idx) => (
          <View key={idx} style={styles.tagBadge}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={[styles.root, isMentorMode && { backgroundColor: '#F0F4FF' }]}>
      <StatusBar backgroundColor={isMentorMode ? '#F0F4FF' : theme.colors.surface} barStyle="dark-content" />
      <View style={[styles.topStickyHeader, isMentorMode && { backgroundColor: '#F0F4FF', borderBottomColor: 'rgba(0,0,0,0.05)' }]}>
        <Text style={styles.headerTitle}>{isMentorMode ? 'Mentor Profile' : 'My Profile'}</Text>
        <TouchableOpacity
          onPress={() => setMenuVisible(true)}
          style={styles.hamburgerBtn}
        >
          <Feather name="menu" size={26} color={theme.colors.heading} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
        }
      >
        <View style={[styles.profileHeader, isMentorMode && { backgroundColor: 'transparent', borderBottomWidth: 0 }]}>
          <View style={styles.avatarContainer}>
            <TouchableOpacity style={styles.avatar} onPress={handleImagePick} activeOpacity={0.8}>
              {uploading ? (
                <ActivityIndicator color="#fff" />
              ) : (user?.avatar_url || user?.profile_picture) ? (
                <Image
                  source={{ uri: user?.avatar_url || user?.profile_picture }}
                  style={styles.avatarImage}
                />
              ) : (
                <Text style={styles.avatarText}>{initials}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.editIconBadge}
              onPress={handleImagePick}
            >
              <MaterialIcons name="camera-alt" size={14} color="#fff" />
            </TouchableOpacity>

            {(user?.avatar_url || user?.profile_picture) ? (
              <TouchableOpacity style={styles.removeIconBadge} onPress={handleRemoveImage}>
                <MaterialIcons name="delete" size={14} color="#fff" />
              </TouchableOpacity>
            ) : null}
          </View>
          <View style={styles.nameRow}>
            <Text style={styles.userName}>{user?.full_name || user?.username || ''}</Text>
            {(user?.is_pro || user?.is_mentor) && (
              <MaterialIcons name="verified" size={22} color={user?.is_mentor ? theme.colors.primary : "#FFD700"} style={{ marginLeft: 8 }} />
            )}
          </View>

          {/* ScholarPoints Display */}
          <TouchableOpacity
            style={[styles.pointsBadge, isMentorMode && { backgroundColor: theme.colors.primary }]}
            onPress={() => Alert.alert('ScholarPoints', `You have ${user?.scholar_points || 0} points. Keep contributing to earn more!`)}
          >
            <MaterialIcons name="stars" size={16} color={isMentorMode ? "#fff" : "#FFD700"} />
            <Text style={[styles.pointsText, isMentorMode && { color: "#fff" }]}>{user?.scholar_points || 0} ScholarPoints</Text>
          </TouchableOpacity>

          <View style={styles.roleBadgeContainer}>
            <Text style={styles.userEmail}>{user?.email || ''}</Text>
            {user?.is_staff && (
                <View style={styles.staffBadge}>
                    <Text style={styles.staffBadgeText}>STAFF</Text>
                </View>
            )}
            {user?.is_mentor && !isMentorMode && (
                <View style={[styles.staffBadge, { backgroundColor: theme.colors.success }]}>
                    <Text style={styles.staffBadgeText}>MENTOR</Text>
                </View>
            )}
          </View>

          {user?.bio ? (
            <View style={styles.bioContainer}>
              <Text style={styles.bioText} numberOfLines={3}>{user.bio}</Text>
            </View>
          ) : null}

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity style={styles.editBtn} onPress={() => router.push('/edit-profile')}>
              <MaterialIcons name="edit" size={16} color={theme.colors.primary} />
              <Text style={styles.editBtnText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {isMentorMode ? (
           <Animated.View entering={FadeIn} layout={Layout}>
             <View style={styles.statsRow}>
                <TouchableOpacity style={[styles.statCard, { backgroundColor: theme.colors.primaryLight }]}>
                  <MaterialIcons name="star" size={22} color={theme.colors.primary} />
                  <Text style={styles.statValue}>{user?.rating || '0.0'}</Text>
                  <Text style={styles.statLabel}>Avg Rating</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.statCard, { backgroundColor: theme.colors.mintCard }]} onPress={() => router.push('/mentorship/dashboard')}>
                  <MaterialIcons name="event-available" size={22} color={theme.colors.success} />
                  <Text style={styles.statValue}>{stats.applied || 0}</Text>
                  <Text style={styles.statLabel}>Sessions</Text>
                </TouchableOpacity>

             </View>
           </Animated.View>
        ) : (
          <Animated.View entering={FadeIn} layout={Layout}>
            <View style={styles.statsRow}>
              <TouchableOpacity
                style={[styles.statCard, { backgroundColor: theme.colors.tealCard }]}
                onPress={() => router.push('/scholarships?filter=saved')}
              >
                <MaterialIcons name="bookmark-outline" size={22} color={theme.colors.textSecondary} />
                <Text style={styles.statValue}>{stats.saved || 0}</Text>
                <Text style={styles.statLabel}>Saved</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.statCard, { backgroundColor: theme.colors.lavenderCard }]}
                onPress={() => router.push('/applications')}
              >
                <MaterialIcons name="send" size={22} color={theme.colors.primary} />
                <Text style={styles.statValue}>{stats.applied || 0}</Text>
                <Text style={styles.statLabel}>Applied</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.statCard, { backgroundColor: theme.colors.mintCard }]}
                onPress={() => router.push('/documents')}
              >
                <MaterialIcons name="folder-open" size={22} color={theme.colors.success} />
                <Text style={styles.statValue}>{stats.documents || 0}</Text>
                <Text style={styles.statLabel}>Vault</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}

        {/* Social Media Links */}
        <View style={styles.socialRow}>
          <TouchableOpacity
            style={[styles.socialIcon, !user?.linkedin_url && styles.socialIconDisabled]}
            onPress={() => user?.linkedin_url && Linking.openURL(user.linkedin_url)}
            disabled={!user?.linkedin_url}
          >
            <FontAwesome name="linkedin" size={18} color={user?.linkedin_url ? "#0077b5" : "#ccc"} />
            <Text style={[styles.socialText, !user?.linkedin_url && { color: "#ccc" }]}>LinkedIn</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.socialIcon, !user?.github_url && styles.socialIconDisabled]}
            onPress={() => user?.github_url && Linking.openURL(user.github_url)}
            disabled={!user?.github_url}
          >
            <FontAwesome name="github" size={18} color={user?.github_url ? "#333" : "#ccc"} />
            <Text style={[styles.socialText, !user?.github_url && { color: "#ccc" }]}>GitHub</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.socialIcon, !user?.facebook_url && styles.socialIconDisabled]}
            onPress={() => user?.facebook_url && Linking.openURL(user.facebook_url)}
            disabled={!user?.facebook_url}
          >
            <FontAwesome name="facebook" size={18} color={user?.facebook_url ? "#1877f2" : "#ccc"} />
            <Text style={[styles.socialText, !user?.facebook_url && { color: "#ccc" }]}>Facebook</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.socialIcon, !user?.google_scholar_url && styles.socialIconDisabled]}
            onPress={() => user?.google_scholar_url && Linking.openURL(user.google_scholar_url)}
            disabled={!user?.google_scholar_url}
          >
            <FontAwesome5 name="google" size={16} color={user?.google_scholar_url ? "#4285F4" : "#ccc"} />
            <Text style={[styles.socialText, !user?.google_scholar_url && { color: "#ccc" }]}>Scholar</Text>
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
          <Text style={styles.cardTitle}>Education & Skills</Text>
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
          <View style={[styles.infoRow, styles.infoRowBorder]}>
            <MaterialIcons name="auto-fix-high" size={18} color={theme.colors.textSecondary} />
            <View style={styles.infoTextGroup}>
              <Text style={styles.infoLabel}>Skills</Text>
              {renderTags(user?.skills)}
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Preferences (Matchmaker)</Text>
          <View style={styles.infoRow}>
            <MaterialIcons name="public" size={18} color={theme.colors.textSecondary} />
            <View style={styles.infoTextGroup}>
              <Text style={styles.infoLabel}>Target Countries</Text>
              {renderTags(user?.target_countries)}
            </View>
          </View>
          <View style={[styles.infoRow, styles.infoRowBorder]}>
            <MaterialIcons name="school" size={18} color={theme.colors.textSecondary} />
            <View style={styles.infoTextGroup}>
              <Text style={styles.infoLabel}>Major / Course</Text>
              <Text style={styles.infoValue}>{user?.major_course || 'Not set'}</Text>
            </View>
          </View>
          <View style={[styles.infoRow, styles.infoRowBorder]}>
            <MaterialIcons name="psychology" size={18} color={theme.colors.textSecondary} />
            <View style={styles.infoTextGroup}>
              <Text style={styles.infoLabel}>Research Interests / Sub-fields</Text>
              {renderTags(user?.research_interests)}
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Academic Scores</Text>
          <View style={styles.row}>
            <View style={[styles.scoreBox, { backgroundColor: theme.colors.tealCard }]}>
               <Text style={styles.scoreLabel}>CGPA</Text>
               <Text style={styles.scoreValue}>{user?.cgpa || '--'}</Text>
            </View>
            <View style={[styles.scoreBox, { backgroundColor: theme.colors.lavenderCard }]}>
               <Text style={styles.scoreLabel}>IELTS</Text>
               <Text style={styles.scoreValue}>{user?.ielts_score || '--'}</Text>
            </View>
            <View style={[styles.scoreBox, { backgroundColor: theme.colors.mintCard }]}>
               <Text style={styles.scoreLabel}>GRE</Text>
               <Text style={styles.scoreValue}>{user?.gre_score || '--'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.cardHeader}>
             <MaterialIcons name="stars" size={20} color={theme.colors.primary} />
             <Text style={styles.cardTitle}>Key Achievements</Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="emoji-events" size={20} color={theme.colors.warning} />
            <View style={styles.infoTextGroup}>
              <Text style={[styles.infoValue, { fontWeight: '500' }]}>{user?.achievements || 'Add your awards and achievements to stand out!'}</Text>
            </View>
          </View>
        </View>

        {user?.is_staff && (
          <TouchableOpacity
            style={[styles.adminBtn, theme.shadows.soft]}
            onPress={() => router.push('/admin')}
          >
            <MaterialIcons name="admin-panel-settings" size={24} color="#fff" />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.adminBtnTitle}>Admin Portal</Text>
              <Text style={styles.adminBtnSub}>System Management & Controls</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color="#fff" />
          </TouchableOpacity>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Instagram-style Sidebar Menu */}
      <Modal
        animationType="none"
        transparent={true}
        visible={menuVisible}
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setMenuVisible(false)}
        >
          <Animated.View
            entering={FadeInRight.duration(300)}
            style={styles.menuContainer}
          >
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Profile Menu</Text>
              <TouchableOpacity onPress={() => setMenuVisible(false)}>
                <MaterialIcons name="close" size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {user?.is_mentor ? (
                <View style={styles.menuModeSection}>
                   <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <MaterialIcons name="swap-horiz" size={24} color={theme.colors.primary} />
                      <Text style={styles.menuText}>{isMentorMode ? 'Switch to Student' : 'Switch to Mentor'}</Text>
                   </View>
                   <Switch
                      value={isMentorMode}
                      onValueChange={(val) => {
                        setMenuVisible(false);
                        handleToggleMentorMode(val);
                      }}
                      trackColor={{ false: "#ccc", true: theme.colors.primary }}
                      thumbColor="#fff"
                   />
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuVisible(false);
                    handleBecomeMentor();
                  }}
                >
                  <MaterialIcons name="school" size={24} color={theme.colors.primary} />
                  <Text style={styles.menuText}>Become a Mentor</Text>
                </TouchableOpacity>
              )}

              <View style={styles.menuDivider} />

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  router.push('/leaderboard');
                }}
              >
                <MaterialIcons name="leaderboard" size={24} color={theme.colors.primary} />
                <Text style={styles.menuText}>Leaderboard</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  router.push('/profile/progress');
                }}
              >
                <MaterialIcons name="insights" size={24} color={theme.colors.primary} />
                <Text style={styles.menuText}>My Insights</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  router.push('/profile/submission-feedback');
                }}
              >
                <MaterialIcons name="assignment" size={24} color={theme.colors.primary} />
                <Text style={styles.menuText}>Submission Feedback</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  router.push('/profile/activity');
                }}
              >
                <MaterialIcons name="history" size={24} color={theme.colors.primary} />
                <Text style={styles.menuText}>History & Activity</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  router.push('/previous-scholarships');
                }}
              >
                <MaterialIcons name="history" size={24} color={theme.colors.primary} />
                <Text style={styles.menuText}>Archive</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={async () => {
                  setMenuVisible(false);
                  try {
                    setLoadingSupport(true);
                    const res = await apiService.getUsers('is_staff=true');
                    if (res.ok) {
                      setStaffList(res.data);
                      setShowStaffModal(true);
                    }
                  } catch (e) {
                    console.error(e);
                  } finally {
                    setLoadingSupport(false);
                  }
                }}
              >
                <MaterialIcons name="support-agent" size={24} color={theme.colors.primary} />
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={styles.menuText}>Support Chat</Text>
                  {loadingSupport && <ActivityIndicator size="small" color={theme.colors.primary} />}
                </View>
              </TouchableOpacity>

              <View style={styles.menuDivider} />

            {isMentorMode ? (
              <>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuVisible(false);
                    router.push('/(tabs)');
                  }}
                >
                  <FontAwesome5 name="chalkboard-teacher" size={20} color={theme.colors.primary} />
                  <Text style={styles.menuText}>Dashboard</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuVisible(false);
                    router.push('/(tabs)/sessions');
                  }}
                >
                  <MaterialIcons name="event-available" size={24} color={theme.colors.primary} />
                  <Text style={styles.menuText}>Session Requests</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setMenuVisible(false);
                  router.push('/mentorship');
                }}
              >
                <FontAwesome5 name="chalkboard-teacher" size={20} color={theme.colors.primary} />
                <Text style={styles.menuText}>Find Mentors</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                router.push('/notifications');
              }}
            >
              <MaterialIcons name="notifications-active" size={24} color={theme.colors.primary} />
              <Text style={styles.menuText}>Notifications</Text>
            </TouchableOpacity>



            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                router.push('/settings');
              }}
            >
              <MaterialIcons name="settings" size={24} color={theme.colors.textPrimary} />
              <Text style={styles.menuText}>Settings and Privacy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                router.push('/about');
              }}
            >
              <MaterialIcons name="info-outline" size={24} color={theme.colors.textPrimary} />
              <Text style={styles.menuText}>About Developers</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                Linking.openURL('https://scholarshipconnectbd.vercel.app/');
              }}
            >
              <MaterialIcons name="language" size={24} color={theme.colors.primary} />
              <Text style={styles.menuText}>Visit Web Portal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                Alert.alert('Help & Support', 'Email us at support@scholarshipconnect.bd');
              }}
            >
              <MaterialIcons name="help-outline" size={24} color={theme.colors.textPrimary} />
              <Text style={styles.menuText}>Help & Support</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={async () => {
                setMenuVisible(false);
                await apiService.logout();
                router.replace('/(auth)/login');
              }}
            >
              <MaterialIcons name="logout" size={24} color={theme.colors.error} />
              <Text style={[styles.menuText, { color: theme.colors.error }]}>Log out</Text>
            </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        </Pressable>
      </Modal>

      {/* Staff Selection Modal */}
      <Modal
        visible={showStaffModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowStaffModal(false)}
      >
        <View style={styles.supportModalOverlay}>
          <View style={styles.supportModalContent}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Support Team</Text>
              <TouchableOpacity onPress={() => setShowStaffModal(false)}>
                <MaterialIcons name="close" size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 14, color: theme.colors.textSecondary, marginBottom: 15, paddingHorizontal: 20 }}>
              Select an administrator to chat with:
            </Text>

            <ScrollView style={{ maxHeight: 400, paddingHorizontal: 20 }}>
              {staffList.map((staff) => (
                <TouchableOpacity
                  key={staff.id}
                  style={styles.staffItem}
                  onPress={() => {
                    setShowStaffModal(false);
                    router.push({
                      pathname: `/messages/${staff.id || staff.user_id}`,
                      params: { name: staff.full_name || staff.username, avatar: staff.avatar_url }
                    });
                  }}
                >
                  <View style={styles.staffAvatar}>
                    {staff.avatar_url ? (
                      <Image source={{ uri: staff.avatar_url }} style={styles.staffAvatarImage} />
                    ) : (
                      <Text style={styles.staffAvatarText}>
                        {(staff.full_name || staff.username || 'A')[0].toUpperCase()}
                      </Text>
                    )}
                  </View>
                  <View>
                    <Text style={styles.staffName}>{staff.full_name || staff.username}</Text>
                    <Text style={styles.staffRole}>{staff.is_superuser ? 'Super Admin' : 'Support Staff'}</Text>
                  </View>
                </TouchableOpacity>
              ))}
              {staffList.length === 0 && (
                <Text style={{ textAlign: 'center', padding: 20, color: theme.colors.textSecondary }}>
                  No support staff available.
                </Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {ToastComponent}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background },
  topStickyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 45,
    paddingBottom: 15,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.heading,
  },
  hamburgerBtn: {
    padding: 4,
  },
  scroll: { paddingHorizontal: 20, paddingBottom: 20 },
  profileHeader: {
    alignItems: 'center', backgroundColor: theme.colors.surface,
    paddingHorizontal: 32,
    paddingBottom: 32,
    paddingTop: 20,
    marginBottom: 20,
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  avatarContainer: { position: 'relative', marginBottom: 16 },
  avatar: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: theme.colors.primary,
    alignItems: 'center', justifyContent: 'center', ...theme.shadows.soft, overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%' },
  editIconBadge: {
    position: 'absolute', bottom: 0, right: 0, backgroundColor: theme.colors.primaryDark,
    width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff', elevation: 4, shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 2,
  },
  removeIconBadge: {
    position: 'absolute', top: 0, right: 0, backgroundColor: theme.colors.error,
    width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff', zIndex: 1, elevation: 4,
  },
  avatarText: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  userName: { fontSize: 20, fontWeight: 'bold', color: theme.colors.heading },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 8,
    gap: 6
  },
  pointsText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: 'bold'
  },
  roleBadgeContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4, marginBottom: 20 },
  userEmail: { fontSize: 14, color: theme.colors.textSecondary },
  staffBadge: { backgroundColor: theme.colors.primary, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  staffBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  bioContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  bioText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
  },
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
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  tagBadge: { backgroundColor: theme.colors.primaryLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  tagText: { color: theme.colors.primary, fontSize: 12, fontWeight: '600' },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  scoreBox: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  scoreValue: {
    fontSize: 18,
    color: theme.colors.heading,
    fontWeight: 'bold',
    marginTop: 4,
  },
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

  adminBtn: {
    backgroundColor: theme.colors.heading,
    borderRadius: theme.borderRadius.base,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  adminBtnTitle: {
    color: '#fff',
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 16,
  },
  adminBtnSub: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 2,
  },
  logoutBtn: {
    backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.base, paddingVertical: 18,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10,
  },
  logoutText: { color: theme.colors.error, fontWeight: 'bold', fontSize: 15 },

  // Mentor Mode Switch Styles
  modeToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.03)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  modeToggleLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.textSecondary,
  },
  becomeMentorHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  becomeMentorHeaderBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  menuModeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },

  // ── Sidebar modal ───────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    flexDirection: 'row',
  },
  menuContainer: {
    backgroundColor: '#fff',
    width: '80%',
    height: '100%',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    ...theme.shadows.premium,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.heading,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 15,
  },
  menuText: {
    fontSize: 16,
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.medium,
  },
  menuDivider: {
    height: 1,
    backgroundColor: theme.colors.divider,
    marginVertical: 10,
  },
  supportModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  supportModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingVertical: 24,
    paddingBottom: 40,
  },
  staffItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 15,
    backgroundColor: theme.colors.background,
    marginBottom: 10,
    gap: 15,
  },
  staffAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  staffAvatarImage: {
    width: '100%',
    height: '100%',
  },
  staffAvatarText: {
    fontWeight: 'bold',
    color: theme.colors.primary,
    fontSize: 18,
  },
  staffName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.heading,
  },
  staffRole: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600',
  },
});
