import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Image
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { apiService } from '../../services/api';
import * as ImagePicker from 'expo-image-picker';

const CATEGORIES = ['Scholarships', 'SOP/CV', 'Visa', 'Test Prep', 'Life Abroad'];

export default function CreateDiscussionScreen() {
  const { id } = useLocalSearchParams();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General',
    image: null,
    poll_question: '',
    poll_options: [] // String array
  });

  const [showPollEditor, setShowPollEditor] = useState(false);
  const [newOption, setNewOption] = useState('');

  useEffect(() => {
    if (isEditing) {
      loadPostData();
    }
  }, [id]);

  const loadPostData = async () => {
    try {
      const res = await apiService.getDiscussionDetail(id);
      if (res.ok) {
        setFormData({
          title: res.data.title,
          content: res.data.content,
          category: res.data.category || 'General',
          image: null, // Don't reload image as file for now
          poll_question: res.data.poll_question || '',
          poll_options: res.data.poll_options?.map(o => o.text) || []
        });
        if (res.data.poll_question) setShowPollEditor(true);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to load discussion data');
    } finally {
      setInitialLoading(false);
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setFormData({ ...formData, image: result.assets[0] });
    }
  };

  const addPollOption = () => {
    if (!newOption.trim()) return;
    if (formData.poll_options.length >= 5) {
      Alert.alert('Limit Reached', 'You can only add up to 5 options.');
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
    if (!formData.title || !formData.content) {
      Alert.alert('Required Fields', 'Please add a title and some details.');
      return;
    }

    setLoading(true);
    try {
      let res;
      if (isEditing) {
        // For update, we might need a separate multipart update or handle it in updateDiscussion
        res = await apiService.updateDiscussion(id, formData);
      } else {
        res = await apiService.createDiscussion(formData);
      }

      if (res.ok) {
        Alert.alert(
          isEditing ? 'Updated!' : 'Posted!',
          isEditing ? 'Your discussion has been updated.' : 'Your question is now live in the community.',
          [{ text: 'View', onPress: () => router.replace('/(tabs)/community') }]
        );
      } else {
        Alert.alert('Error', res.data.error || 'Failed to post discussion.');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View style={[styles.root, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={28} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? 'Edit' : 'Start'} Discussion</Text>
        <TouchableOpacity
          style={[styles.postBtn, (!formData.title || !formData.content) && styles.postBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading || !formData.title || !formData.content}
        >
          {loading ? <ActivityIndicator size="small" color="white" /> : <Text style={styles.postBtnText}>Post</Text>}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          <View style={styles.inputSection}>
            <TextInput
              style={styles.titleInput}
              placeholder="Ask a question or share a topic..."
              placeholderTextColor={theme.colors.placeholder}
              value={formData.title}
              onChangeText={(v) => setFormData({...formData, title: v})}
              multiline
            />

            <View style={styles.divider} />

            <TextInput
              style={styles.contentInput}
              placeholder="Give more details about your problem..."
              placeholderTextColor={theme.colors.placeholder}
              multiline
              value={formData.content}
              onChangeText={(v) => setFormData({...formData, content: v})}
            />

            {formData.image && (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: formData.image.uri }} style={styles.imagePreview} />
                <TouchableOpacity
                  style={styles.removeImageBtn}
                  onPress={() => setFormData({...formData, image: null})}
                >
                  <Ionicons name="close-circle" size={24} color="white" />
                </TouchableOpacity>
              </View>
            )}

            {showPollEditor && (
              <View style={styles.pollContainer}>
                <View style={styles.pollHeader}>
                  <MaterialIcons name="poll" size={20} color={theme.colors.primary} />
                  <Text style={styles.pollHeaderText}>Create a Poll</Text>
                  <TouchableOpacity onPress={() => setShowPollEditor(false)}>
                    <Text style={{color: theme.colors.error, fontSize: 12}}>Remove</Text>
                  </TouchableOpacity>
                </View>

                <TextInput
                  style={styles.pollQuestionInput}
                  placeholder="Poll Question (e.g. Which intake are you applying for?)"
                  value={formData.poll_question}
                  onChangeText={(v) => setFormData({...formData, poll_question: v})}
                />

                <View style={styles.optionsList}>
                  {formData.poll_options.map((opt, idx) => (
                    <View key={idx} style={styles.optionRow}>
                      <Text style={styles.optionText}>{opt}</Text>
                      <TouchableOpacity onPress={() => removePollOption(idx)}>
                        <Ionicons name="remove-circle-outline" size={20} color={theme.colors.error} />
                      </TouchableOpacity>
                    </View>
                  ))}

                  {formData.poll_options.length < 5 && (
                    <View style={styles.addOptionRow}>
                      <TextInput
                        style={styles.addOptionInput}
                        placeholder="Add option..."
                        value={newOption}
                        onChangeText={setNewOption}
                      />
                      <TouchableOpacity onPress={addPollOption}>
                        <Ionicons name="add-circle" size={28} color={theme.colors.primary} />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            )}
          </View>

          <View style={styles.metaSection}>
            <Text style={styles.metaLabel}>Add a Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagRow}>
              {['General', ...CATEGORIES].map(cat => {
                const isSelected = formData.category === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setFormData({...formData, category: cat})}
                    style={[styles.tagChip, isSelected && styles.tagChipActive]}
                  >
                    <Text style={[styles.tagText, isSelected && styles.tagTextActive]}>{cat}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.attachmentRow}>
              <TouchableOpacity style={styles.attachmentBtn} onPress={handlePickImage}>
                <MaterialIcons name="image" size={24} color={theme.colors.primary} />
                <Text style={styles.attachmentBtnText}>Image</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.attachmentBtn} onPress={() => setShowPollEditor(true)}>
                <MaterialIcons name="poll" size={24} color={theme.colors.primary} />
                <Text style={styles.attachmentBtnText}>Poll</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.surface },
  header: {
    paddingTop: 50, height: 100, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: theme.colors.divider
  },
  headerTitle: { fontFamily: theme.typography.fontFamily.bold, fontSize: 17, color: theme.colors.textPrimary },
  postBtn: { backgroundColor: theme.colors.primary, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
  postBtnDisabled: { backgroundColor: theme.colors.disabled },
  postBtnText: { color: 'white', fontFamily: theme.typography.fontFamily.bold, fontSize: 14 },
  scroll: { flexGrow: 1 },
  inputSection: { padding: 20 },
  titleInput: { fontSize: 20, fontFamily: theme.typography.fontFamily.bold, color: theme.colors.textPrimary, minHeight: 60 },
  divider: { height: 1, backgroundColor: theme.colors.divider, marginVertical: 15 },
  contentInput: { fontSize: 16, fontFamily: theme.typography.fontFamily.regular, color: theme.colors.textPrimary, minHeight: 120, textAlignVertical: 'top' },

  imagePreviewContainer: { marginTop: 15, position: 'relative' },
  imagePreview: { width: '100%', height: 200, borderRadius: 12 },
  removeImageBtn: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12 },

  pollContainer: { marginTop: 20, backgroundColor: theme.colors.secondaryBackground, padding: 15, borderRadius: 15, borderWidth: 1, borderColor: theme.colors.divider },
  pollHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  pollHeaderText: { flex: 1, fontFamily: theme.typography.fontFamily.bold, color: theme.colors.textPrimary },
  pollQuestionInput: { backgroundColor: 'white', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.divider, marginBottom: 12 },
  optionsList: { gap: 8 },
  optionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'white', padding: 10, borderRadius: 8, borderLeftWidth: 3, borderLeftColor: theme.colors.primary },
  optionText: { flex: 1, fontSize: 14 },
  addOptionRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  addOptionInput: { flex: 1, backgroundColor: 'white', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.divider },

  metaSection: { borderTopWidth: 1, borderTopColor: theme.colors.divider, padding: 20 },
  metaLabel: { fontFamily: theme.typography.fontFamily.bold, fontSize: 14, color: theme.colors.textSecondary, marginBottom: 12 },
  tagRow: { gap: 8, paddingRight: 20 },
  tagChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: theme.colors.secondaryBackground, borderWidth: 1, borderColor: theme.colors.border },
  tagChipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  tagText: { fontSize: 13, color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.medium },
  tagTextActive: { color: 'white' },
  attachmentRow: { flexDirection: 'row', gap: 20, marginTop: 24 },
  attachmentBtn: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  attachmentBtnText: { fontSize: 14, color: theme.colors.textPrimary, fontFamily: theme.typography.fontFamily.medium }
});
