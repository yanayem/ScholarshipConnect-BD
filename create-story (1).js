import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Image
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { theme } from '../../theme';
import { apiService } from '../../services/api';

const CATEGORIES = ['Scholarships', 'SOP/CV', 'Visa', 'Test Prep', 'Life Abroad'];

export default function CreateStoryScreen() {
  const { id } = useLocalSearchParams();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [formData, setFormData] = useState({
    title: '',
    university: '',
    content: '',
    tags: '',
    post_type: 'blog'
  });

  useEffect(() => {
    if (isEditing) {
      loadPostData();
    }
  }, [id]);

  const loadPostData = async () => {
    try {
      const res = await apiService.getBlogPostDetail(id);
      if (res.ok) {
        setFormData({
          title: res.data.title,
          university: res.data.university || '',
          content: res.data.content,
          tags: res.data.tags || '',
          post_type: 'blog'
        });
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to load story data');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSafeBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/blog');
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.content || !formData.university) {
      Alert.alert('Required Fields', 'Title, University, and Story content are required.');
      return;
    }

    setLoading(true);
    try {
      let res;
      if (isEditing) {
        res = await apiService.updateBlogPost(id, formData);
      } else {
        res = await apiService.createBlogPost(formData);
      }

      if (res.ok) {
        Alert.alert(
          'Success!',
          isEditing ? 'Your story has been updated.' : 'Your success story is now published!',
          [{ text: 'Wonderful', onPress: handleSafeBack }]
        );
      } else {
        Alert.alert('Error', res.data.error || 'Failed to publish story.');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tag) => {
    let currentTags = formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t) : [];
    if (currentTags.includes(tag)) {
      currentTags = currentTags.filter(t => t !== tag);
    } else {
      currentTags.push(tag);
    }
    setFormData({ ...formData, tags: currentTags.join(', ') });
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      <View style={styles.heroHeader}>
        <TouchableOpacity onPress={handleSafeBack} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.heroContent}>
           <Text style={styles.heroTitle}>{isEditing ? 'Edit Your' : 'Share Your'} Success Story</Text>
           <Text style={styles.heroSub}>Inspire others with your journey to success</Text>
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          <View style={styles.formContainer}>
            <Text style={styles.label}>Story Title</Text>
            <TextInput
              style={styles.titleInput}
              placeholder="e.g. Journey to Fulbright Scholarship 2024"
              placeholderTextColor={theme.colors.placeholder}
              value={formData.title}
              onChangeText={(v) => setFormData({...formData, title: v})}
            />

            <Text style={styles.label}>Attending University</Text>
            <View style={styles.inputWrapper}>
              <FontAwesome5 name="university" size={16} color={theme.colors.primary} />
              <TextInput
                style={styles.inlineInput}
                placeholder="Where did you get in?"
                placeholderTextColor={theme.colors.placeholder}
                value={formData.university}
                onChangeText={(v) => setFormData({...formData, university: v})}
              />
            </View>

            <Text style={styles.label}>Choose Relevant Tags</Text>
            <View style={styles.tagGrid}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => toggleTag(cat)}
                  style={[styles.tagChip, formData.tags.includes(cat) && styles.tagChipActive]}
                >
                  <Text style={[styles.tagText, formData.tags.includes(cat) && styles.tagTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Your Story</Text>
            <View style={styles.editorContainer}>
               <TextInput
                 style={styles.storyInput}
                 placeholder="Start writing your journey... (tips: Mention your preparation, challenges, and advice for future applicants)"
                 placeholderTextColor={theme.colors.placeholder}
                 multiline
                 textAlignVertical="top"
                 value={formData.content}
                 onChangeText={(v) => setFormData({...formData, content: v})}
               />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.publishBtn, loading && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="white" /> : (
              <>
                <Text style={styles.publishBtnText}>{isEditing ? 'Save Changes' : 'Publish Story'}</Text>
                <MaterialIcons name="send" size={18} color="white" />
              </>
            )}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background },
  heroHeader: {
    backgroundColor: theme.colors.primary,
    height: 180,
    paddingTop: 50,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  heroContent: { marginTop: 10 },
  heroTitle: { fontFamily: theme.typography.fontFamily.bold, fontSize: 22, color: 'white' },
  heroSub: { fontFamily: theme.typography.fontFamily.regular, fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  scroll: { flexGrow: 1, padding: 20 },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 30,
    padding: 24,
    marginTop: -40,
    ...theme.shadows.premium,
  },
  label: { fontSize: 13, fontFamily: theme.typography.fontFamily.bold, color: theme.colors.heading, marginBottom: 10, marginTop: 16 },
  titleInput: {
    backgroundColor: theme.colors.secondaryBackground,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.textPrimary,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.secondaryBackground,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
  },
  inlineInput: { flex: 1, marginLeft: 10, fontSize: 15, fontFamily: theme.typography.fontFamily.regular },
  tagGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.border },
  tagChipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  tagText: { fontSize: 12, color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.medium },
  tagTextActive: { color: 'white' },
  editorContainer: {
    backgroundColor: theme.colors.secondaryBackground,
    borderRadius: 12,
    padding: 14,
    minHeight: 250,
    marginTop: 4,
  },
  storyInput: { fontSize: 15, fontFamily: theme.typography.fontFamily.regular, color: theme.colors.textPrimary, lineHeight: 24 },
  publishBtn: {
    backgroundColor: theme.colors.primary,
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 30,
    ...theme.shadows.teal,
  },
  publishBtnText: { color: 'white', fontSize: 16, fontFamily: theme.typography.fontFamily.bold }
});
