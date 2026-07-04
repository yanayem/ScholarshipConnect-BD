import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';

export default function ShareStoryScreen() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    scholarship: '',
    university: '',
    content: '',
    tags: ''
  });

  const handleSafeBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/blog');
    }
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.content || !formData.scholarship) {
      Alert.alert('Required Fields', 'Please fill in the title, scholarship name, and your story.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Story Submitted!',
        'Thank you for sharing your journey! Our team will review and publish it soon.',
        [{ text: 'Great!', onPress: handleSafeBack }]
      );
    }, 1500);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSafeBack} style={styles.backBtn}>
          <MaterialIcons name="close" size={24} color={theme.colors.heading} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Share Your Journey</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={[styles.introBox, { backgroundColor: theme.colors.tealCard }]}>
            <MaterialIcons name="auto-awesome" size={24} color={theme.colors.primary} />
            <Text style={styles.introText}>
              Your experience can inspire thousands of students in Bangladesh. Tell us how you did it!
            </Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.label}>Success Story Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. How I secured the Erasmus Mundus 2024"
              placeholderTextColor={theme.colors.placeholder}
              value={formData.title}
              onChangeText={(v) => setFormData({...formData, title: v})}
            />

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Scholarship Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Fulbright"
                  placeholderTextColor={theme.colors.placeholder}
                  value={formData.scholarship}
                  onChangeText={(v) => setFormData({...formData, scholarship: v})}
                />
              </View>
              <View style={{ width: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Target Country</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. USA"
                  placeholderTextColor={theme.colors.placeholder}
                  value={formData.tags}
                  onChangeText={(v) => setFormData({...formData, tags: v})}
                />
              </View>
            </View>

            <Text style={styles.label}>University (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Where are you studying now?"
              placeholderTextColor={theme.colors.placeholder}
              value={formData.university}
              onChangeText={(v) => setFormData({...formData, university: v})}
            />

            <Text style={styles.label}>Write Your Story *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Share your preparation, tips, and interview experience..."
              placeholderTextColor={theme.colors.placeholder}
              multiline
              numberOfLines={10}
              textAlignVertical="top"
              value={formData.content}
              onChangeText={(v) => setFormData({...formData, content: v})}
            />

            <Text style={styles.hint}>
              Tip: Include specific steps like how you wrote your SOP or prepared for IELTS/GRE.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, loading && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitBtnText}>
              {loading ? 'Submitting...' : 'Post Success Story'}
            </Text>
            {!loading && <MaterialIcons name="check-circle" size={18} color="#fff" />}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    height: 100, backgroundColor: theme.colors.background,
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 40, paddingHorizontal: 20, gap: 12,
    borderBottomWidth: 1, borderBottomColor: theme.colors.divider,
  },
  headerTitle: { color: theme.colors.heading, fontSize: 18, fontWeight: 'bold' },
  backBtn: { padding: 4 },
  scroll: { padding: 20 },
  introBox: {
    flexDirection: 'row',
    padding: 16, borderRadius: 16, marginBottom: 24, gap: 12, alignItems: 'center',
    borderWidth: 1, borderColor: theme.colors.divider,
  },
  introText: { fontSize: 14, color: theme.colors.primaryDark, flex: 1, fontWeight: '500', lineHeight: 20 },
  formCard: {
    backgroundColor: theme.colors.surface, borderRadius: 24, padding: 24,
    ...theme.shadows.soft,
  },
  label: { fontSize: 13, fontWeight: 'bold', color: theme.colors.heading, marginBottom: 10, marginTop: 16, marginLeft: 4 },
  row: { flexDirection: 'row' },
  input: {
    backgroundColor: theme.colors.secondaryBackground,
    borderRadius: 12, padding: 14, fontSize: 15, color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  textArea: { minHeight: 180 },
  hint: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 12, fontStyle: 'italic', marginLeft: 4 },
  submitBtn: {
    backgroundColor: theme.colors.primary, borderRadius: 16, height: 56,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, marginTop: 32, ...theme.shadows.soft,
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
