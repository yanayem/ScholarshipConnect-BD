import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Linking
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { apiService } from '../../services/api';
import { useToast } from '../../components/Toast';

export default function ApplyScreen() {
  const { id, prefilledSop } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const { showToast, ToastComponent } = useToast();
  const [scholarshipTitle, setScholarshipTitle] = useState('...');
  const [officialLink, setOfficialLink] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    university: '',
    cgpa: '',
    ielts: '',
    academicLevel: '',
    sop: prefilledSop || '',
  });

  const [isAutoFilled, setIsAutoFilled] = useState(false);

  useEffect(() => {
    const loadScholarship = async () => {
      try {
        const res = await apiService.getScholarshipDetail(id);
        if (res.ok) {
          setScholarshipTitle(res.data.title);
          setOfficialLink(res.data.official_link);
        }
      } catch (e) {}
    };
    loadScholarship();

    const loadProfile = async () => {
      try {
        const res = await apiService.getProfile();
        if (res.ok) {
          setFormData(prev => ({
            ...prev,
            fullName: res.data.full_name || '',
            email: res.data.email || '',
            phone: res.data.phone_number || '',
            university: res.data.university || '',
            cgpa: res.data.cgpa ? res.data.cgpa.toString() : '',
            ielts: res.data.ielts_score ? res.data.ielts_score.toString() : '',
            academicLevel: res.data.academic_level || '',
          }));
          setIsAutoFilled(true);
        }
      } catch (e) {}
    };
    loadProfile();
  }, [id]);

  const handleSubmit = async () => {
    if (!formData.fullName || !formData.email || !formData.sop) {
      showToast('Please fill in all required fields.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        scholarship: id,
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        university: formData.university,
        cgpa: formData.cgpa || null,
        ielts_score: formData.ielts || null,
        academic_level: formData.academicLevel,
        sop: formData.sop,
        application_type: 'Self',
      };

      const res = await apiService.applyForScholarship(payload);
      if (res.ok) {
        showToast('Application tracking saved!', 'success');
        setTimeout(() => {
          if (officialLink) {
            Linking.openURL(officialLink).catch(err => {
               showToast('Could not open official portal.', 'error');
            });
          }
          router.replace('/(tabs)/applications');
        }, 1500);
      } else {
        const errorMsg = res.data?.error || 'Failed to submit application';
        showToast(errorMsg, 'error');
      }
    } catch (error) {
      showToast('Network error occurred', 'error');
    } finally {
      setLoading(false);
    }
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
          {isAutoFilled && (
            <View style={styles.autoFillBanner}>
               <MaterialIcons name="bolt" size={18} color={theme.colors.success} />
               <Text style={styles.autoFillText}>Profile info auto-filled for your convenience.</Text>
            </View>
          )}

          <View style={[styles.infoBox, { backgroundColor: theme.colors.tealCard }]}>
            <MaterialIcons name="info" size={20} color={theme.colors.primary} />
            <Text style={styles.infoText}>
              Applying for: <Text style={{fontWeight: 'bold', color: theme.colors.heading}}>{scholarshipTitle}</Text>
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

            <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.label}>CGPA</Text>
                    <View style={styles.inputWrap}>
                        <TextInput
                            style={styles.input}
                            placeholder="0.00"
                            keyboardType="decimal-pad"
                            value={formData.cgpa}
                            onChangeText={(v) => setFormData({...formData, cgpa: v})}
                        />
                    </View>
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={styles.label}>IELTS Score</Text>
                    <View style={styles.inputWrap}>
                        <TextInput
                            style={styles.input}
                            placeholder="0.0"
                            keyboardType="decimal-pad"
                            value={formData.ielts}
                            onChangeText={(v) => setFormData({...formData, ielts: v})}
                        />
                    </View>
                </View>
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
              {loading ? 'Saving...' : 'Save & Open Official Portal'}
            </Text>
            {!loading && <MaterialIcons name="open-in-new" size={18} color={theme.colors.heading} />}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
        {ToastComponent}
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
  autoFillBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F4EA', // Light success green
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: '#34A853',
  },
  autoFillText: {
    fontSize: 12,
    color: '#1E4620',
    fontWeight: '600',
  },
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
    flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.secondaryBackgroundBackground,
    borderRadius: 12, paddingHorizontal: 16,
    height: 52
  },
  input: { flex: 1, fontSize: 15, color: theme.colors.textPrimary, marginLeft: 10 },
  sectionTitle: {
    fontSize: 16, fontWeight: 'bold', color: theme.colors.primary,
    marginTop: 10, marginBottom: 15, borderLeftWidth: 4, borderLeftColor: theme.colors.primary,
    paddingLeft: 10,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  textArea: {
    backgroundColor: theme.colors.secondaryBackgroundBackground,
    borderRadius: 12, padding: 16, minHeight: 140, marginLeft: 0, marginTop: 4
  },
  uploadBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: 12, padding: 16, marginTop: 6, gap: 10, backgroundColor: theme.colors.primaryLight
  },
  uploadBtnText: { color: theme.colors.primaryDark, fontWeight: 'bold', fontSize: 14 },
  uploadHint: { fontSize: 11, color: theme.colors.textSecondary, marginTop: 8, marginLeft: 4 },
  submitBtn: {
    backgroundColor: theme.colors.secondaryBackground, borderRadius: 16, height: 56,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, marginTop: 32, ...theme.shadows.soft,
  },
  submitBtnText: { color: theme.colors.heading, fontSize: 16, fontWeight: 'bold' }
});
