import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';

export default function ApplyScreen() {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);

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
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.canGoBack() ? router.back() : router.replace(`/scholarship/${id}`)}
          style={styles.backBtn}
        >
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.heading} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Apply for Program</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={[styles.infoBox, { backgroundColor: theme.colors.tealCard }]}>
            <MaterialIcons name="info" size={20} color={theme.colors.primary} />
            <Text style={styles.infoText}>
              Applying for Scholarship: <Text style={{fontWeight: 'bold', color: theme.colors.heading}}>#{id}</Text>
            </Text>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputWrap}>
              <MaterialIcons name="person-outline" size={20} color={theme.colors.placeholder} />
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                placeholderTextColor={theme.colors.placeholder}
                value={formData.fullName}
                onChangeText={(v) => setFormData({...formData, fullName: v})}
              />
            </View>

            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputWrap}>
              <MaterialIcons name="alternate-email" size={20} color={theme.colors.placeholder} />
              <TextInput
                style={styles.input}
                placeholder="john@example.com"
                placeholderTextColor={theme.colors.placeholder}
                keyboardType="email-address"
                value={formData.email}
                onChangeText={(v) => setFormData({...formData, email: v})}
              />
            </View>

            <Text style={styles.label}>Statement of Purpose</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Why do you deserve this scholarship?"
              placeholderTextColor={theme.colors.placeholder}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              value={formData.sop}
              onChangeText={(v) => setFormData({...formData, sop: v})}
            />

            {/* Document Upload */}
            <Text style={styles.label}>Supporting Documents</Text>
            <TouchableOpacity style={styles.uploadBtn}>
              <MaterialIcons name="file-upload" size={22} color={theme.colors.primary} />
              <Text style={styles.uploadBtnText}>Attach PDF/JPG</Text>
            </TouchableOpacity>
            <Text style={styles.uploadHint}>Max total size: 10MB</Text>
          </View>

          <TouchableOpacity
            style={[styles.submitBtn, loading && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitBtnText}>
              {loading ? 'Submitting...' : 'Submit Application'}
            </Text>
            {!loading && <MaterialIcons name="send" size={18} color={theme.colors.heading} />}
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
  },
  headerTitle: { color: theme.colors.heading, fontSize: 18, fontWeight: 'bold' },
  backBtn: { padding: 4 },
  scroll: { padding: 20 },
  infoBox: {
    flexDirection: 'row',
    padding: 16, borderRadius: 16, marginBottom: 24, gap: 12, alignItems: 'center',
  },
  infoText: { fontSize: 14, color: theme.colors.primaryDark, flex: 1 },
  formSection: {
    backgroundColor: theme.colors.surface, borderRadius: 24, padding: 24,
    ...theme.shadows.soft,
  },
  label: { fontSize: 13, fontWeight: 'bold', color: theme.colors.heading, marginBottom: 10, marginTop: 16, marginLeft: 4 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.secondaryBackground,
    borderRadius: 12, paddingHorizontal: 16,
    height: 52
  },
  input: { flex: 1, fontSize: 15, color: theme.colors.textPrimary, marginLeft: 10 },
  textArea: {
    backgroundColor: theme.colors.secondaryBackground,
    borderRadius: 12, padding: 16, minHeight: 140, marginLeft: 0, marginTop: 4
  },
  uploadBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: 12, padding: 16, marginTop: 6, gap: 10, backgroundColor: theme.colors.primaryLight
  },
  uploadBtnText: { color: theme.colors.primaryDark, fontWeight: 'bold', fontSize: 14 },
  uploadHint: { fontSize: 11, color: theme.colors.textSecondary, marginTop: 8, marginLeft: 4 },
  submitBtn: {
    backgroundColor: theme.colors.secondary, borderRadius: 16, height: 56,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, marginTop: 32, ...theme.shadows.soft,
  },
  submitBtnText: { color: theme.colors.heading, fontSize: 16, fontWeight: 'bold' }
});
