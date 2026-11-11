import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { apiService } from '../../services/api';
import { useUser } from '../../context/UserContext';
import { useToast } from '../../components/Toast';
import * as ImagePicker from 'expo-image-picker';

const CATEGORIES = [
  'General',
  'Open Problems',
  'Scholarships',
  'SOP/CV',
  'Visa',
  'Test Prep',
  'Life Abroad'
];

export default function CreateDiscussionScreen() {
  const { id, pickImage } = useLocalSearchParams();
  const isEditing = !!id;
  const { user } = useUser();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [showTips, setShowTips] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General',
    image: null,
    poll_question: '',
    poll_options: []
  });

  const [showPollEditor, setShowPollEditor] = useState(false);
  const [newOption, setNewOption] = useState('');

  useEffect(() => {
    if (isEditing) {
      loadPostData();
    } else if (pickImage === 'true') {
      handlePickImage();
    }
  }, [id, pickImage]);

  const loadPostData = async () => {
    try {
      const res = await apiService.getDiscussionDetail(id);
      if (res.ok) {
        setFormData({
          title: res.data.title || '',
          content: res.data.content || '',
          category: res.data.category || 'General',
          image: null,
          poll_question: res.data.poll_question || '',
          poll_options: res.data.poll_options?.map(o => o.text) || []
        });
        if (res.data.poll_question) setShowPollEditor(true);
      } else {
        showToast('Failed to load discussion data', 'error');
      }
    } catch (e) {
      showToast('Error loading post', 'error');
    } finally {
      setInitialLoading(false);
    }
  };

  const handlePickImage = async () => {
    if (Platform.OS === 'web') {
      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false,
          quality: 0.8,
        });
        if (!result.canceled && result.assets && result.assets[0]) {
          setFormData(prev => ({ ...prev, image: result.assets[0] }));
        }
      } catch (e) {
        showToast('Image selection error', 'error');
      }
      return;
    }

    Alert.alert(
      'Attach Image',
      'Choose image source',
      [
        {
          text: 'Camera',
          onPress: async () => {
            const permission = await ImagePicker.requestCameraPermissionsAsync();
            if (!permission.granted) {
              showToast('Camera permission required', 'error');
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [16, 9],
              quality: 0.8,
            });
            if (!result.canceled && result.assets && result.assets[0]) {
              setFormData(prev => ({ ...prev, image: result.assets[0] }));
            }
          }
        },
        {
          text: 'Photo Library',
          onPress: async () => {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permission.granted) {
              showToast('Photo library permission required', 'error');
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [16, 9],
              quality: 0.8,
            });
            if (!result.canceled && result.assets && result.assets[0]) {
              setFormData(prev => ({ ...prev, image: result.assets[0] }));
            }
          }
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const addPollOption = () => {
    if (!newOption.trim()) return;
    if (formData.poll_options.length >= 5) {
      showToast('Maximum 5 poll options allowed', 'error');
      return;
    }
    setFormData({
      ...formData,
      poll_options: [...formData.poll_options, newOption.trim()]
    });
    setNewOption('');
  };

  const removePollOption = (index) => {
    const updated = [...formData.poll_options];
    updated.splice(index, 1);
    setFormData({ ...formData, poll_options: updated });
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      showToast('Please enter a discussion title', 'error');
      return;
    }
    if (!formData.content.trim()) {
      showToast('Please provide details for your discussion', 'error');
      return;
    }

    if (showPollEditor) {
      if (formData.poll_question.trim() && formData.poll_options.length < 2) {
        showToast('Please add at least 2 poll options', 'error');
        return;
      }
    }

    setLoading(true);
    try {
      let res;
      if (isEditing) {
        res = await apiService.updateDiscussion(id, formData);
      } else {
        res = await apiService.createDiscussion(formData);
      }

      if (res.ok) {
        showToast(
          isEditing ? 'Discussion updated successfully!' : 'Discussion posted to community!',
          'success'
        );
        router.replace('/(tabs)/community');
      } else {
        const errDetail = res.data?.detail || res.data?.error || (typeof res.data === 'object' ? (Array.isArray(Object.values(res.data)[0]) ? Object.values(res.data)[0][0] : Object.values(res.data)[0]) : res.data);
        showToast(String(errDetail || 'Failed to post discussion'), 'error');
      }
    } catch (error) {
      showToast('An unexpected error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (formData.title.trim() || formData.content.trim()) {
      Alert.alert(
        'Discard Discussion?',
        'Are you sure you want to discard your changes?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => router.back() }
        ]
      );
    } else {
      router.back();
    }
  };

  if (initialLoading) {
    return (
      <View style={[styles.root, styles.center]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const userAvatar = user?.avatar_url || user?.profile_picture;
  const userName = user?.full_name || user?.username || 'Scholar';
  const userInitials = (userName || 'S')[0].toUpperCase();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.surface} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.headerIconBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="close" size={26} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? 'Edit Discussion' : 'Start Discussion'}</Text>
        <TouchableOpacity
          style={[
            styles.postBtn,
            (!formData.title.trim() || !formData.content.trim()) && styles.postBtnDisabled
          ]}
          onPress={handleSubmit}
          disabled={loading || !formData.title.trim() || !formData.content.trim()}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.postBtnText}>{isEditing ? 'Update' : 'Post'}</Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* User Profile Bar */}
          <View style={styles.authorBar}>
            <View style={styles.authorAvatar}>
              {userAvatar ? (
                <Image source={{ uri: userAvatar }} style={styles.avatarImg} />
              ) : (
                <Text style={styles.avatarText}>{userInitials}</Text>
              )}
            </View>
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>{userName}</Text>
              <Text style={styles.authorSub}>Posting to Public Community</Text>
            </View>
          </View>

          {/* Tips Card */}
          {showTips && (
            <View style={styles.tipsCard}>
              <View style={styles.tipsHeader}>
                <View style={styles.tipsHeaderLeft}>
                  <MaterialIcons name="lightbulb" size={18} color={theme.colors.primary} />
                  <Text style={styles.tipsTitle}>Tips for a great post</Text>
                </View>
                <TouchableOpacity onPress={() => setShowTips(false)}>
                  <Ionicons name="close-circle-outline" size={18} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <Text style={styles.tipsText}>• State your question clearly in the title</Text>
              <Text style={styles.tipsText}>• Include relevant background (field, intake, target country)</Text>
              <Text style={styles.tipsText}>• Pick the right category so experts find your topic fast</Text>
            </View>
          )}

          {/* Title Input */}
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.titleInput}
              placeholder="What's your question or topic?"
              placeholderTextColor={theme.colors.placeholder}
              value={formData.title}
              onChangeText={(v) => setFormData({ ...formData, title: v })}
              multiline
              maxLength={200}
            />
          </View>

          <View style={styles.divider} />

          {/* Details / Content Input */}
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.contentInput}
              placeholder="Provide details, background information, or specific questions..."
              placeholderTextColor={theme.colors.placeholder}
              multiline
              value={formData.content}
              onChangeText={(v) => setFormData({ ...formData, content: v })}
              textAlignVertical="top"
            />
          </View>

          {/* Image Preview */}
          {formData.image && (
            <View style={styles.imagePreviewWrapper}>
              <Image source={{ uri: formData.image.uri }} style={styles.imagePreview} resizeMode="cover" />
              <TouchableOpacity
                style={styles.removeImageBtn}
                onPress={() => setFormData({ ...formData, image: null })}
              >
                <Ionicons name="close" size={18} color="#fff" />
              </TouchableOpacity>
              <View style={styles.imageBadge}>
                <MaterialIcons name="image" size={12} color="#fff" />
                <Text style={styles.imageBadgeText}>Image Attached</Text>
              </View>
            </View>
          )}

          {/* Poll Editor Section */}
          {showPollEditor && (
            <View style={styles.pollCard}>
              <View style={styles.pollCardHeader}>
                <View style={styles.pollCardTitleRow}>
                  <MaterialIcons name="poll" size={20} color={theme.colors.primary} />
                  <Text style={styles.pollCardTitle}>Create Community Poll</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setShowPollEditor(false);
                    setFormData({ ...formData, poll_question: '', poll_options: [] });
                  }}
                >
                  <Text style={styles.removePollText}>Remove Poll</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.pollQuestionInput}
                placeholder="Ask a poll question (e.g., Which intake are you targeting?)"
                placeholderTextColor={theme.colors.placeholder}
                value={formData.poll_question}
                onChangeText={(v) => setFormData({ ...formData, poll_question: v })}
              />

              <Text style={styles.pollOptionsLabel}>Poll Options (2 - 5 options)</Text>

              <View style={styles.pollOptionsList}>
                {formData.poll_options.map((opt, idx) => (
                  <View key={idx} style={styles.pollOptionRow}>
                    <View style={styles.optionIndexBadge}>
                      <Text style={styles.optionIndexText}>{idx + 1}</Text>
                    </View>
                    <Text style={styles.pollOptionText}>{opt}</Text>
                    <TouchableOpacity onPress={() => removePollOption(idx)}>
                      <Ionicons name="trash-outline" size={18} color={theme.colors.error} />
                    </TouchableOpacity>
                  </View>
                ))}

                {formData.poll_options.length < 5 && (
                  <View style={styles.addOptionRow}>
                    <TextInput
                      style={styles.addOptionInput}
                      placeholder="Add an option..."
                      placeholderTextColor={theme.colors.placeholder}
                      value={newOption}
                      onChangeText={setNewOption}
                      onSubmitEditing={addPollOption}
                      returnKeyType="done"
                    />
                    <TouchableOpacity
                      style={[styles.addOptionBtn, !newOption.trim() && { opacity: 0.5 }]}
                      onPress={addPollOption}
                      disabled={!newOption.trim()}
                    >
                      <Ionicons name="add" size={22} color="#fff" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Category & Attachments Section */}
          <View style={styles.metaSection}>
            <Text style={styles.sectionLabel}>Select Category</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryChipsScroll}
            >
              {CATEGORIES.map(cat => {
                const isSelected = formData.category === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setFormData({ ...formData, category: cat })}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                    activeOpacity={0.7}
                  >
                    {isSelected && (
                      <MaterialIcons name="check" size={14} color="#fff" style={{ marginRight: 4 }} />
                    )}
                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Quick Action Tools */}
            <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Add Attachments</Text>
            <View style={styles.attachmentOptionsRow}>
              <TouchableOpacity
                style={[styles.attachActionBtn, formData.image && styles.attachActionBtnActive]}
                onPress={handlePickImage}
              >
                <MaterialIcons
                  name="add-photo-alternate"
                  size={22}
                  color={formData.image ? theme.colors.primary : theme.colors.textSecondary}
                />
                <Text style={[styles.attachActionText, formData.image && styles.attachActionTextActive]}>
                  {formData.image ? 'Change Image' : 'Add Image'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.attachActionBtn, showPollEditor && styles.attachActionBtnActive]}
                onPress={() => setShowPollEditor(!showPollEditor)}
              >
                <MaterialIcons
                  name="poll"
                  size={22}
                  color={showPollEditor ? theme.colors.primary : theme.colors.textSecondary}
                />
                <Text style={[styles.attachActionText, showPollEditor && styles.attachActionTextActive]}>
                  {showPollEditor ? 'Poll Active' : 'Create Poll'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.surface
  },
  center: {
    justify: 'center',
    alignItems: 'center'
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 54 : Platform.OS === 'web' ? 16 : 44,
    height: Platform.OS === 'ios' ? 104 : Platform.OS === 'web' ? 66 : 94,
    flexDirection: 'row',
    alignItems: 'center',
    justify: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
    backgroundColor: theme.colors.surface
  },
  headerIconBtn: {
    padding: 4
  },
  headerTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 18,
    color: theme.colors.heading
  },
  postBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    ...theme.shadows.teal
  },
  postBtnDisabled: {
    backgroundColor: theme.colors.disabled,
    elevation: 0,
    shadowOpacity: 0
  },
  postBtnText: {
    color: '#fff',
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 14
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40
  },
  authorBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  authorAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden'
  },
  avatarImg: {
    width: '100%',
    height: '100%'
  },
  avatarText: {
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.primary,
    fontSize: 18
  },
  authorInfo: {
    justifyContent: 'center'
  },
  authorName: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 15,
    color: theme.colors.heading
  },
  authorSub: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
    color: theme.colors.textSecondary
  },
  tipsCard: {
    backgroundColor: theme.colors.primaryLight + '40',
    padding: 14,
    borderRadius: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.primary + '20'
  },
  tipsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  tipsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  tipsTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 13,
    color: theme.colors.primaryDark
  },
  tipsText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 18
  },
  inputGroup: {
    marginBottom: 8
  },
  titleInput: {
    fontSize: 20,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.heading,
    minHeight: 48,
    lineHeight: 26
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.divider,
    marginVertical: 12
  },
  contentInput: {
    fontSize: 15,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.textPrimary,
    minHeight: 140,
    lineHeight: 22
  },
  imagePreviewWrapper: {
    marginTop: 12,
    marginBottom: 20,
    position: 'relative',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.divider
  },
  imagePreview: {
    width: '100%',
    height: 200
  },
  removeImageBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center'
  },
  imageBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.65)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4
  },
  imageBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: theme.typography.fontFamily.medium
  },
  pollCard: {
    backgroundColor: theme.colors.secondaryBackground,
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.divider
  },
  pollCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  pollCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  pollCardTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 15,
    color: theme.colors.heading
  },
  removePollText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    color: theme.colors.error
  },
  pollQuestionInput: {
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.divider,
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.textPrimary,
    marginBottom: 14
  },
  pollOptionsLabel: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  pollOptionsList: {
    gap: 10
  },
  pollOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.divider
  },
  optionIndexBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10
  },
  optionIndexText: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.primary
  },
  pollOptionText: {
    flex: 1,
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.textPrimary
  },
  addOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  addOptionInput: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.divider,
    fontSize: 14,
    color: theme.colors.textPrimary
  },
  addOptionBtn: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center'
  },
  metaSection: {
    marginTop: 10,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider
  },
  sectionLabel: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  categoryChipsScroll: {
    gap: 8,
    paddingRight: 10
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.secondaryBackground,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  chipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary
  },
  chipText: {
    fontSize: 13,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.textSecondary
  },
  chipTextSelected: {
    color: '#fff',
    fontFamily: theme.typography.fontFamily.bold
  },
  attachmentOptionsRow: {
    flexDirection: 'row',
    gap: 12
  },
  attachActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: theme.colors.secondaryBackground,
    borderWidth: 1,
    borderColor: theme.colors.divider,
    gap: 8
  },
  attachActionBtnActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight + '30'
  },
  attachActionText: {
    fontSize: 13,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.textSecondary
  },
  attachActionTextActive: {
    color: theme.colors.primary,
    fontFamily: theme.typography.fontFamily.bold
  }
});
