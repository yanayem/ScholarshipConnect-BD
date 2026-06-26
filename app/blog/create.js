import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function ShareStoryScreen() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    scholarship: '',
    university: '',
    content: '',
    tags: ''
  });

  const handleSubmit = () => {
    if (!formData.title || !formData.content || !formData.scholarship) {
      Alert.alert('Required Fields', 'Please fill in the title, scholarship name, and your story.');
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Story Submitted!',
        'Thank you for sharing your journey! Our team will review and publish it soon.',
        [{ text: 'Great!', onPress: () => router.back() }]
      );
    }, 1500);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#2E7D32" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Share Your Journey</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.introBox}>
            <MaterialIcons name="auto-awesome" size={24} color="#2E7D32" />
            <Text style={styles.introText}>
              Your experience can inspire thousands of students in Bangladesh. Tell us how you did it!
            </Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.label}>Success Story Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. How I secured the Erasmus Mundus 2024"
              value={formData.title}
              onChangeText={(v) => setFormData({...formData, title: v})}
            />

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Scholarship Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Fulbright"
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
                  value={formData.tags}
                  onChangeText={(v) => setFormData({...formData, tags: v})}
                />
              </View>
            </View>

            <Text style={styles.label}>University (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Where are you studying now?"
              value={formData.university}
              onChangeText={(v) => setFormData({...formData, university: v})}
            />

            <Text style={styles.label}>Write Your Story *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Share your preparation, tips, and interview experience..."
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
            {!loading && <MaterialIcons name="check-circle" size={20} color="#fff" />}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F4F6FA' },
  header: {
    height: 100, backgroundColor: '#2E7D32',
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 40, paddingHorizontal: 16, gap: 12
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  backBtn: { padding: 4 },
  scroll: { padding: 16 },
  introBox: {
    flexDirection: 'row', backgroundColor: '#E8F5E9',
    padding: 16, borderRadius: 12, marginBottom: 20, gap: 12, alignItems: 'center'
  },
  introText: { fontSize: 14, color: '#2E7D32', flex: 1, fontWeight: '500', lineHeight: 20 },
  formCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, elevation: 2 },
  label: { fontSize: 14, fontWeight: '700', color: '#7A746E', marginBottom: 8, marginTop: 12 },
  row: { flexDirection: 'row' },
  input: {
    backgroundColor: '#FCFAF7', borderWidth: 1, borderColor: '#FCFAF7',
    borderRadius: 10, padding: 12, fontSize: 15, color: '#2D2A26'
  },
  textArea: { minHeight: 180 },
  hint: { fontSize: 12, color: '#7A746E', marginTop: 12, fontStyle: 'italic' },
  submitBtn: {
    backgroundColor: '#2E7D32', borderRadius: 12, height: 56,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, marginTop: 24, elevation: 4
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
