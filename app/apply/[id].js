import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function ApplyScreen() {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);

  // Form States
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    university: '',
    sop: '',
  });

  const handleSubmit = () => {
    if (!formData.fullName || !formData.email || !formData.sop) {
      Alert.alert('Missing Info', 'Please fill in all required fields.');
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Success!',
        'Your application has been submitted successfully.',
        [{ text: 'OK', onPress: () => router.replace('/(tabs)/applications') }]
      );
    }, 1500);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#1565C0" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scholarship Application</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.infoBox}>
            <MaterialIcons name="info" size={20} color="#1565C0" />
            <Text style={styles.infoText}>
              You are applying for Scholarship ID: <Text style={{fontWeight: 'bold'}}>#{id}</Text>.
              Please ensure all details are correct.
            </Text>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.label}>Full Name *</Text>
            <View style={styles.inputWrap}>
              <MaterialIcons name="person" size={20} color="#90A4AE" />
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                value={formData.fullName}
                onChangeText={(v) => setFormData({...formData, fullName: v})}
              />
            </View>

            <Text style={styles.label}>Email Address *</Text>
            <View style={styles.inputWrap}>
              <MaterialIcons name="email" size={20} color="#90A4AE" />
              <TextInput
                style={styles.input}
                placeholder="example@gmail.com"
                keyboardType="email-address"
                value={formData.email}
                onChangeText={(v) => setFormData({...formData, email: v})}
              />
            </View>

            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputWrap}>
              <MaterialIcons name="phone" size={20} color="#90A4AE" />
              <TextInput
                style={styles.input}
                placeholder="+880 1XXX XXXXXX"
                keyboardType="phone-pad"
                value={formData.phone}
                onChangeText={(v) => setFormData({...formData, phone: v})}
              />
            </View>

            <Text style={styles.label}>University / Institution</Text>
            <View style={styles.inputWrap}>
              <MaterialIcons name="school" size={20} color="#90A4AE" />
              <TextInput
                style={styles.input}
                placeholder="Current University"
                value={formData.university}
                onChangeText={(v) => setFormData({...formData, university: v})}
              />
            </View>

            <Text style={styles.label}>Statement of Purpose (SOP) *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Tell us why you deserve this scholarship..."
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              value={formData.sop}
              onChangeText={(v) => setFormData({...formData, sop: v})}
            />

            {/* Document Upload Mock */}
            <Text style={styles.label}>Upload Documents (PDF/JPG)</Text>
            <TouchableOpacity style={styles.uploadBtn}>
              <MaterialIcons name="cloud-upload" size={24} color="#1565C0" />
              <Text style={styles.uploadBtnText}>Select Files</Text>
            </TouchableOpacity>
            <Text style={styles.uploadHint}>Max size: 5MB (Academic transcripts, CV)</Text>
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, loading && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitBtnText}>
              {loading ? 'Submitting...' : 'Submit Application'}
            </Text>
            {!loading && <MaterialIcons name="send" size={20} color="#fff" />}
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
    height: 100, backgroundColor: '#1565C0',
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 40, paddingHorizontal: 16, gap: 12
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  backBtn: { padding: 4 },
  scroll: { padding: 16 },
  infoBox: {
    flexDirection: 'row', backgroundColor: '#E3F2FD',
    padding: 12, borderRadius: 10, marginBottom: 20, gap: 10, alignItems: 'center'
  },
  infoText: { fontSize: 13, color: '#1565C0', flex: 1 },
  formSection: { backgroundColor: '#fff', borderRadius: 16, padding: 20, elevation: 2 },
  label: { fontSize: 14, fontWeight: '700', color: '#546E7A', marginBottom: 8, marginTop: 12 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FAFAFA',
    borderWidth: 1, borderColor: '#ECEFF1', borderRadius: 10, paddingHorizontal: 12,
    height: 50
  },
  input: { flex: 1, fontSize: 15, color: '#263238', marginLeft: 10 },
  textArea: {
    backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: '#ECEFF1',
    borderRadius: 10, padding: 12, minHeight: 120, marginLeft: 0
  },
  uploadBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#1565C0', borderStyle: 'dashed',
    borderRadius: 10, padding: 16, marginTop: 4, gap: 8
  },
  uploadBtnText: { color: '#1565C0', fontWeight: 'bold' },
  uploadHint: { fontSize: 11, color: '#90A4AE', marginTop: 6 },
  submitBtn: {
    backgroundColor: '#1565C0', borderRadius: 12, height: 56,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, marginTop: 24, elevation: 4
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
