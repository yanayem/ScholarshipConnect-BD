import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { theme } from '../../../theme';
import { apiService } from '../../../services/api';
import { useToast } from '../../../components/Toast';

export default function AgencyApplyScreen() {
  const { id, title, prefilledSop } = useLocalSearchParams();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [agencyAdminId, setAgencyAdminId] = useState(null);
  const { showToast, ToastComponent } = useToast();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    university: '',
    cgpa: '',
    ielts: '',
    academicLevel: '',
    sop: prefilledSop || 'I am requesting agency processing for this application. Please contact me for further details and document collection.', // Pre-filled for agency or uses draft
  });

  const [isAutoFilled, setIsAutoFilled] = useState(false);

  useEffect(() => {
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
  }, []);

  const handleSubmit = async () => {
    if (!formData.fullName || !formData.email || !formData.phone) {
      showToast('Please fill in your name, email, and phone number so we can contact you.', 'warning');
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
        application_type: 'Agency', // Sets this as an Agency Processing request
      };

      const res = await apiService.applyForScholarship(payload);
      if (res.ok) {
        if (res.data?.agency_admin_id) {
          setAgencyAdminId(res.data.agency_admin_id);
        }
        setSuccess(true);
      } else {
        const errorMsg = res.data?.error || 'Failed to submit request';
        showToast(errorMsg, 'error');
      }
    } catch (error) {
      showToast('Network error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={[styles.root, { justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
        <View style={styles.successIconBox}>
          <MaterialIcons name="check-circle" size={80} color={theme.colors.success} />
        </View>
        <Text style={styles.successTitle}>Request Received!</Text>
        <Text style={styles.successDesc}>
          Your request for Premium Agency Processing has been submitted successfully. 
          Our expert consultants have been notified and a chat thread has been created for you.
        </Text>
        
        {agencyAdminId && (
          <TouchableOpacity 
            style={[styles.homeBtn, { backgroundColor: '#8E44AD', marginBottom: 16 }]} 
            onPress={() => {
              // Route to the existing chat system
              router.replace(`/messages/${agencyAdminId}`);
            }}
          >
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
              <Ionicons name="chatbubbles-outline" size={20} color="#FFF" />
              <Text style={styles.homeBtnText}>Chat with Agent Now</Text>
            </View>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={[styles.homeBtn, !agencyAdminId && { marginTop: 20 }]} onPress={() => router.replace('/(tabs)/applications')}>
          <Text style={styles.homeBtnText}>View My Applications</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.heading} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Premium Processing</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          
          <View style={styles.premiumBanner}>
            <View style={styles.premiumIconBox}>
              <MaterialIcons name="business-center" size={24} color="#FFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.premiumTitle}>Expert Agency Service</Text>
              <Text style={styles.premiumDesc}>
                We will format your SOP/CV, verify your documents, and officially submit the application to the university on your behalf.
              </Text>
            </View>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Target: <Text style={{fontWeight: 'bold', color: theme.colors.heading}}>{decodeURIComponent(title || 'Scholarship')}</Text>
            </Text>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionHeader}>Contact Information</Text>
            <Text style={styles.sectionSubHeader}>Please ensure your phone number is correct. We will call you to finalize the process.</Text>

            <Text style={styles.label}>Full Name *</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                value={formData.fullName}
                onChangeText={(v) => setFormData({...formData, fullName: v})}
              />
            </View>

            <Text style={styles.label}>Email Address *</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                keyboardType="email-address"
                value={formData.email}
                onChangeText={(v) => setFormData({...formData, email: v})}
              />
            </View>

            <Text style={styles.label}>Phone Number *</Text>
            <View style={[styles.inputWrap, { borderColor: theme.colors.primary, borderWidth: 1 }]}>
              <TextInput
                style={styles.input}
                keyboardType="phone-pad"
                placeholder="e.g. +8801700000000"
                value={formData.phone}
                onChangeText={(v) => setFormData({...formData, phone: v})}
              />
            </View>

            <Text style={styles.sectionHeader}>Academic Profile (Optional)</Text>
            <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.label}>CGPA</Text>
                    <View style={styles.inputWrap}>
                        <TextInput
                            style={styles.input}
                            keyboardType="decimal-pad"
                            value={formData.cgpa}
                            onChangeText={(v) => setFormData({...formData, cgpa: v})}
                        />
                    </View>
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={styles.label}>IELTS</Text>
                    <View style={styles.inputWrap}>
                        <TextInput
                            style={styles.input}
                            keyboardType="decimal-pad"
                            value={formData.ielts}
                            onChangeText={(v) => setFormData({...formData, ielts: v})}
                        />
                    </View>
                </View>
            </View>

            <Text style={styles.sectionHeader}>Initial Draft / Message</Text>
            <Text style={styles.sectionSubHeader}>If you generated an AI SOP, it is attached here for our experts to review.</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Any specific requests for our experts?"
              placeholderTextColor={theme.colors.placeholder}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              value={formData.sop}
              onChangeText={(v) => setFormData({...formData, sop: v})}
            />

            <View style={[styles.infoBox, { marginTop: 24, backgroundColor: 'rgba(42, 157, 143, 0.1)', borderLeftColor: theme.colors.primary }]}>
              <MaterialIcons name="folder-shared" size={24} color={theme.colors.primaryDark} style={{marginRight: 10}} />
              <View style={{flex: 1}}>
                <Text style={{fontWeight: 'bold', color: theme.colors.primaryDark}}>Important Note</Text>
                <Text style={{fontSize: 12, color: theme.colors.textSecondary, marginTop: 4}}>
                  Please ensure your latest CV, Transcripts, and Passport are uploaded to the <Text style={{fontWeight: 'bold'}}>Document Vault</Text> in your Profile so our experts can access them.
                </Text>
              </View>
            </View>

          </View>

          <TouchableOpacity
            style={[styles.submitBtn, loading && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitBtnText}>
              {loading ? 'Submitting Request...' : 'Submit Request to Agency'}
            </Text>
            {!loading && <Ionicons name="shield-checkmark" size={18} color="#FFF" />}
          </TouchableOpacity>

          <Text style={styles.disclaimerText}>
            By submitting this request, you agree that our consultants can contact you regarding your application. A service fee will be discussed before any official processing begins.
          </Text>

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
  premiumBanner: {
    flexDirection: 'row',
    backgroundColor: 'rgba(142, 68, 173, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(142, 68, 173, 0.3)',
    alignItems: 'center',
  },
  premiumIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#8E44AD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  premiumTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8E44AD',
    marginBottom: 4,
  },
  premiumDesc: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  infoBox: {
    backgroundColor: theme.colors.surface,
    padding: 16, borderRadius: 12, marginBottom: 24,
    borderLeftWidth: 4, borderLeftColor: theme.colors.primary,
  },
  infoText: { fontSize: 14, color: theme.colors.textPrimary },
  formSection: {
    backgroundColor: theme.colors.surface, borderRadius: 24, padding: 24,
    ...theme.shadows.soft,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primaryDark,
    marginTop: 8,
    marginBottom: 4,
  },
  sectionSubHeader: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 16,
  },
  label: { fontSize: 13, fontWeight: '600', color: theme.colors.heading, marginBottom: 8, marginTop: 12, marginLeft: 4 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.secondaryBackgroundBackground,
    borderRadius: 12, paddingHorizontal: 16,
    height: 52
  },
  input: { flex: 1, fontSize: 15, color: theme.colors.textPrimary },
  row: { flexDirection: 'row', alignItems: 'center' },
  textArea: {
    backgroundColor: theme.colors.secondaryBackgroundBackground,
    borderRadius: 12, padding: 16, minHeight: 140, marginLeft: 0, marginTop: 8
  },
  submitBtn: {
    backgroundColor: '#8E44AD', borderRadius: 16, height: 56,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, marginTop: 32, ...theme.shadows.premium,
  },
  submitBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  disclaimerText: {
    fontSize: 11,
    color: theme.colors.placeholder,
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 10,
    lineHeight: 16,
  },
  successIconBox: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.heading,
    marginBottom: 12,
  },
  successDesc: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  homeBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  homeBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
