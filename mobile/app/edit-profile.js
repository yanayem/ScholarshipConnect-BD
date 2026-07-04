import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';
import { apiService } from '../services/api';
import CustomInput from '../components/CustomInput';

export default function EditProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    date_of_birth: '',
    cgpa: '',
    academic_level: '',
    department: '',
    university: '',
    bio: '',
    linkedin_url: '',
    github_url: '',
    facebook_url: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await apiService.getProfile();
      if (res && res.ok) {
        const data = res.data;
        setForm({
          full_name: data.full_name || '',
          email: data.email || '',
          phone_number: data.phone_number || '',
          date_of_birth: data.date_of_birth || '',
          cgpa: data.cgpa ? data.cgpa.toString() : '',
          academic_level: data.academic_level || '',
          department: data.department || '',
          university: data.university || '',
          bio: data.bio || '',
          linkedin_url: data.linkedin_url || '',
          github_url: data.github_url || '',
          facebook_url: data.facebook_url || '',
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await apiService.updateProfile(form);
      if (res && res.ok) {
        Alert.alert('Success', 'Profile updated successfully');
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/(tabs)/profile');
        }
      } else {
        Alert.alert('Error', res.data?.error || 'Failed to update profile');
      }
    } catch (error) {
      Alert.alert('Error', 'Connection failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/profile')} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.heading} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionTitle}>Personal Details</Text>
        <CustomInput
          label="Full Name"
          icon="person"
          value={form.full_name}
          onChangeText={(val) => setForm({ ...form, full_name: val })}
          placeholder="Enter your full name"
        />
        <CustomInput
          label="Email Address"
          icon="email"
          value={form.email}
          onChangeText={(val) => setForm({ ...form, email: val })}
          placeholder="yourname@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <CustomInput
          label="Phone Number"
          icon="phone"
          value={form.phone_number}
          onChangeText={(val) => setForm({ ...form, phone_number: val })}
          placeholder="e.g. 01712345678"
          keyboardType="phone-pad"
        />
        <CustomInput
          label="Date of Birth"
          icon="cake"
          value={form.date_of_birth}
          onChangeText={(val) => setForm({ ...form, date_of_birth: val })}
          placeholder="YYYY-MM-DD"
        />
        <CustomInput
          label="Bio"
          icon="description"
          value={form.bio}
          onChangeText={(val) => setForm({ ...form, bio: val })}
          placeholder="Tell us about yourself"
          multiline
          numberOfLines={3}
          style={[styles.textArea]}
        />

        <Text style={styles.sectionTitle}>Academic Information</Text>
        <CustomInput
          label="University"
          icon="account-balance"
          value={form.university}
          onChangeText={(val) => setForm({ ...form, university: val })}
          placeholder="Your University Name"
        />
        <CustomInput
          label="Department"
          icon="computer"
          value={form.department}
          onChangeText={(val) => setForm({ ...form, department: val })}
          placeholder="e.g. CSE, EEE, BBA"
        />
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <CustomInput
              label="CGPA"
              icon="grade"
              value={form.cgpa}
              onChangeText={(val) => setForm({ ...form, cgpa: val })}
              placeholder="0.00"
              keyboardType="decimal-pad"
            />
          </View>
          <View style={{ flex: 1.5 }}>
            <CustomInput
              label="Level"
              icon="school"
              value={form.academic_level}
              onChangeText={(val) => setForm({ ...form, academic_level: val })}
              placeholder="e.g. Bachelors"
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Social Media Links</Text>
        <CustomInput
          label="LinkedIn URL"
          icon="link"
          value={form.linkedin_url}
          onChangeText={(val) => setForm({ ...form, linkedin_url: val })}
          placeholder="https://linkedin.com/in/username"
          autoCapitalize="none"
        />
        <CustomInput
          label="GitHub URL"
          icon="code"
          value={form.github_url}
          onChangeText={(val) => setForm({ ...form, github_url: val })}
          placeholder="https://github.com/username"
          autoCapitalize="none"
        />
        <CustomInput
          label="Facebook URL"
          icon="facebook"
          value={form.facebook_url}
          onChangeText={(val) => setForm({ ...form, facebook_url: val })}
          placeholder="https://facebook.com/username"
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={[styles.saveBtn, saving && styles.disabledBtn]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <MaterialIcons name="save" size={20} color="#fff" />
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20, backgroundColor: theme.colors.surface,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.heading },
  backBtn: { padding: 8, borderRadius: 12, backgroundColor: theme.colors.secondaryBackground },
  scroll: { padding: 20 },
  sectionTitle: {
    fontSize: 16, fontWeight: 'bold', color: theme.colors.primary,
    marginTop: 10, marginBottom: 15, borderLeftWidth: 4, borderLeftColor: theme.colors.primary,
    paddingLeft: 10,
  },
  row: { flexDirection: 'row' },
  textArea: { height: 100, textAlignVertical: 'top', paddingTop: 12 },
  saveBtn: {
    backgroundColor: theme.colors.primary, borderRadius: 16, height: 56,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10,
    marginTop: 20, ...theme.shadows.teal,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  disabledBtn: { opacity: 0.7 },
});
