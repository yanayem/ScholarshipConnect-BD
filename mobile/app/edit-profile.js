import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Modal, Pressable, TextInput, StatusBar, Animated } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';
import { apiService } from '../services/api';
import CustomInput from '../components/CustomInput';
import AutocompleteInput from '../components/AutocompleteInput';
import { useToast } from '../components/Toast';
import { Loader } from '../components/Loader';

const SECTIONS = [
  { key: 'personal', title: 'Personal', icon: 'badge', color: theme.colors.primary },
  { key: 'academic', title: 'Academic', icon: 'school', color: theme.colors.primary },
  { key: 'skills', title: 'Skills & Goals', icon: 'auto-fix-high', color: theme.colors.primary },
  { key: 'preferences', title: 'Preferences', icon: 'psychology', color: theme.colors.primary },
  { key: 'social', title: 'Social Links', icon: 'share', color: theme.colors.primary },
];

export default function EditProfileScreen() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingBio, setGeneratingBio] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [activeSection, setActiveSection] = useState('personal');
  const { showToast, ToastComponent } = useToast();
  const [form, setForm] = useState({
    username: '',
    full_name: '',
    email: '',
    phone_number: '',
    date_of_birth: '',
    cgpa: '',
    academic_level: '',
    ielts_score: '',
    gre_score: '',
    department: '',
    university: '',
    bio: '',
    linkedin_url: '',
    github_url: '',
    facebook_url: '',
    google_scholar_url: '',
    skills: '',
    achievements: '',
    target_countries: '',
    major_course: '',
    research_interests: '',
  });

  const getCompletion = () => {
    const fields = Object.values(form);
    if (!fields || fields.length === 0) return 0;
    const filled = fields.filter(v => v && v.toString().trim() !== '').length;
    const percent = Math.round((filled / fields.length) * 100);
    return isNaN(percent) ? 0 : percent;
  };

  const fetchProfile = async () => {
    try {
      const res = await apiService.getProfile();
      if (res && res.ok) {
        const data = res.data;
        setUser(data);
        console.log('[EDIT PROFILE] Data received:', data.username);

        setForm({
          username: data.username || '',
          full_name: data.full_name || '',
          email: data.email || '',
          phone_number: data.phone_number || '',
          date_of_birth: data.date_of_birth || '',
          cgpa: (data.cgpa !== null && data.cgpa !== undefined) ? data.cgpa.toString() : '',
          academic_level: data.academic_level || '',
          ielts_score: (data.ielts_score !== null && data.ielts_score !== undefined) ? data.ielts_score.toString() : '',
          gre_score: (data.gre_score !== null && data.gre_score !== undefined) ? data.gre_score.toString() : '',
          department: data.department || '',
          university: data.university || '',
          bio: data.bio || '',
          linkedin_url: data.linkedin_url || '',
          github_url: data.github_url || '',
          facebook_url: data.facebook_url || '',
          google_scholar_url: data.google_scholar_url || '',
          skills: data.skills || '',
          achievements: data.achievements || '',
          target_countries: data.target_countries || '',
          major_course: data.major_course || '',
          research_interests: data.research_interests || '',
        });
      } else {
        showToast('Failed to load profile data. Please try again.', 'error');
        if (res.status === 401) {
           await apiService.logout();
           router.replace('/(auth)/login');
        }
      }
    } catch (error) {
      console.error('[EDIT PROFILE] Fetch error:', error);
      showToast('Connection error. Check your server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await apiService.updateProfile(form);
      if (res && res.ok) {
        showToast('Profile updated successfully', 'success');
        setTimeout(() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/(tabs)/profile');
          }
        }, 1000);
      } else {
        showToast(res.data?.error || 'Failed to update profile', 'error');
      }
    } catch (error) {
      showToast('Connection failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAIBio = async () => {
    setGeneratingBio(true);
    const res = await apiService.aiGenerateBio();
    if (res.ok) {
      setForm({ ...form, bio: res.data.bio });
      showToast('AI bio generated!', 'success');
    } else {
      showToast('AI assistance failed. Try again.', 'error');
    }
    setGeneratingBio(false);
  };

  if (loading) {
    return <Loader message="Setting up editor..." />;
  }

  const completion = getCompletion();

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'personal':
        return (
          <>
            <CustomInput
              label="Username"
              icon="alternate-email"
              value={form.username}
              onChangeText={(val) => setForm({ ...form, username: val })}
              placeholder="Choose a unique username"
              autoCapitalize="none"
            />
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
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Date of Birth</Text>
              <View style={styles.dateInputWrapper}>
                <TextInput
                  style={[styles.input, { flex: 1, borderRightWidth: 0, borderTopRightRadius: 0, borderBottomRightRadius: 0 }]}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={theme.colors.placeholder}
                  value={form.date_of_birth}
                  onChangeText={(val) => setForm({ ...form, date_of_birth: val })}
                />
                <TouchableOpacity
                  onPress={() => setShowCalendar(true)}
                  style={styles.calendarIconBtn}
                >
                  <MaterialIcons name="event" size={22} color={theme.colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.inputContainer}>
              <View style={styles.labelRow}>
                 <Text style={styles.label}>Bio</Text>
                 <TouchableOpacity
                   style={styles.aiAssistBtn}
                   onPress={handleAIBio}
                   disabled={generatingBio}
                 >
                   {generatingBio ? <ActivityIndicator size="small" color={theme.colors.primary} /> : (
                     <>
                       <MaterialIcons name="auto-fix-high" size={14} color={theme.colors.primary} />
                       <Text style={styles.aiAssistText}>AI Write</Text>
                       {!user?.is_pro && (
                         <TouchableOpacity onPress={() => router.push('/upgrade-pro')}>
                            <View style={styles.proBadgeSmall}>
                                <Text style={styles.proBadgeText}>PRO: UNLOCK</Text>
                            </View>
                         </TouchableOpacity>
                       )}
                     </>
                   )}
                 </TouchableOpacity>
              </View>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={form.bio}
                onChangeText={(val) => setForm({ ...form, bio: val })}
                placeholder="Briefly describe your academic background, research interests, and career goals."
                multiline
                numberOfLines={4}
              />
            </View>
          </>
        );
      case 'academic':
        return (
          <>
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
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <CustomInput
                  label="IELTS Score"
                  icon="language"
                  value={form.ielts_score}
                  onChangeText={(val) => setForm({ ...form, ielts_score: val })}
                  placeholder="0.0"
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={{ flex: 1 }}>
                <CustomInput
                  label="GRE Score"
                  icon="analytics"
                  value={form.gre_score}
                  onChangeText={(val) => setForm({ ...form, gre_score: val })}
                  placeholder="e.g. 320"
                  keyboardType="number-pad"
                />
              </View>
            </View>
          </>
        );
      case 'skills':
        return (
          <>
            <AutocompleteInput
              label="Skills"
              icon="auto-fix-high"
              value={form.skills}
              onChangeText={(val) => setForm({ ...form, skills: val })}
              placeholder="e.g. Python, Public Speaking, Research"
              multiline
              numberOfLines={2}
              type="skills"
            />
            <CustomInput
              label="Key Achievements"
              icon="emoji-events"
              value={form.achievements}
              onChangeText={(val) => setForm({ ...form, achievements: val })}
              placeholder="List your awards, research papers, or key projects"
              multiline
              numberOfLines={3}
            />
          </>
        );
      case 'preferences':
        return (
          <>
            <AutocompleteInput
              label="Target Countries"
              icon="public"
              value={form.target_countries}
              onChangeText={(val) => setForm({ ...form, target_countries: val })}
              placeholder="e.g. USA, UK, Canada, Australia"
              multiline
              numberOfLines={2}
              type="country"
            />
            <AutocompleteInput
              label="Major / Course"
              icon="school"
              value={form.major_course}
              onChangeText={(val) => setForm({ ...form, major_course: val })}
              placeholder="e.g. Computer Science, Mechanical Engineering"
              type="field"
            />
            <AutocompleteInput
              label="Research Interests / Sub-fields"
              icon="psychology"
              value={form.research_interests}
              onChangeText={(val) => setForm({ ...form, research_interests: val })}
              placeholder="e.g. AI, Machine Learning, IoT, Robotics"
              multiline
              numberOfLines={2}
              type="interests"
            />
          </>
        );
      case 'social':
        return (
          <>
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
            <CustomInput
              label="Google Scholar URL"
              icon="school"
              value={form.google_scholar_url}
              onChangeText={(val) => setForm({ ...form, google_scholar_url: val })}
              placeholder="https://scholar.google.com/citations?user=..."
              autoCapitalize="none"
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} translucent={true} />
      {ToastComponent}

      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientHeader}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/profile')} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.completionSection}>
          <View style={styles.completionRow}>
            <Text style={styles.completionLabel}>Scholar Profile Readiness</Text>
            <Text style={styles.completionPercent}>{completion}%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <Animated.View style={[styles.progressBarFill, { width: `${completion}%` }]} />
          </View>
          <Text style={styles.completionHint}>
            {completion < 50 ? '💡 Complete your profile for AI Matchmaking' :
             completion < 80 ? 'High accuracy matching is almost ready!' :
             '🌟 Your profile is elite! Ready for applications.'}
          </Text>
        </View>
      </LinearGradient>

      {/* Fixed Top Navigation - No Scrolling */}
      <View style={styles.fixedTabsWrapper}>
        {SECTIONS.map((sec) => (
          <TouchableOpacity
            key={sec.key}
            style={[styles.fixedTabItem, activeSection === sec.key && styles.fixedTabActive]}
            onPress={() => setActiveSection(sec.key)}
          >
            <MaterialIcons
              name={sec.icon}
              size={18}
              color={activeSection === sec.key ? theme.colors.primary : theme.colors.placeholder}
            />
            <Text
              numberOfLines={1}
              style={[styles.fixedTabText, activeSection === sec.key && styles.fixedTabTextActive]}
            >
              {sec.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={true}
          contentContainerStyle={[styles.mainScroll, { paddingBottom: 150 }]}
          keyboardShouldPersistTaps="handled"
        >
          {/* Unified Main Card */}
          <View style={styles.unifiedCard}>
            <View style={styles.formContent}>
              {renderSectionContent()}
            </View>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>

        <View style={styles.bottomActions}>
            <TouchableOpacity
              style={[styles.saveBtn, saving && styles.disabledBtn, theme.shadows.premium]}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.85}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.saveBtnText}>Save All Changes</Text>
                  <MaterialIcons name="arrow-forward" size={20} color="#fff" />
                </>
              )}
            </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={showCalendar}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCalendar(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCalendar(false)}
        >
          <View style={styles.calendarModalContent}>
            <View style={styles.calendarHeader}>
              <Text style={styles.calendarHeaderTitle}>Select Birthday</Text>
              <TouchableOpacity onPress={() => setShowCalendar(false)}>
                <MaterialIcons name="close" size={24} color={theme.colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <Calendar
              current={form.date_of_birth || undefined}
              onDayPress={(day) => {
                setForm({ ...form, date_of_birth: day.dateString });
                setShowCalendar(false);
              }}
              markedDates={{
                [form.date_of_birth]: { selected: true, selectedColor: theme.colors.primary }
              }}
              theme={{
                todayTextColor: theme.colors.primary,
                selectedDayBackgroundColor: theme.colors.primary,
                selectedDayTextColor: '#ffffff',
                arrowColor: theme.colors.primary,
                monthTextColor: theme.colors.heading,
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background },
  gradientHeader: {
    paddingTop: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 24) + 10,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backBtn: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22, fontWeight: 'bold', color: '#fff',
    fontFamily: theme.typography.fontFamily.bold,
  },
  completionSection: { marginTop: 0 },
  completionRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10,
  },
  completionLabel: { color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: '600' },
  completionPercent: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  progressBarBg: {
    height: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 4, overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%', backgroundColor: theme.colors.warning, borderRadius: 4,
  },
  completionHint: {
    color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 10, fontStyle: 'italic',
  },
  // ─── Unified Section Redesign ──────────────────
  fixedTabsWrapper: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  fixedTabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  fixedTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
  },
  fixedTabText: {
    fontSize: 10,
    marginTop: 4,
    color: theme.colors.placeholder,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  fixedTabTextActive: {
    color: theme.colors.primary,
  },
  mainScroll: {
    backgroundColor: theme.colors.background,
    padding: 16,
  },
  unifiedCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    minHeight: 400,
    ...theme.shadows.premium,
    // Removed overflow: 'hidden' to allow dropdowns to be visible
  },
  cardHeader: {
    padding: 24,
    backgroundColor: theme.colors.primaryLight,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  cardHeaderTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.heading,
  },
  cardHeaderSub: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  formContent: {
    padding: 24,
  },
  row: { flexDirection: 'row' },
  textArea: { minHeight: 100, textAlignVertical: 'top', paddingTop: 12 },
  inputContainer: { marginBottom: 16 },
  label: {
    fontSize: 14, fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.textPrimary, marginBottom: 8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiAssistBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  aiAssistText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  proBadgeSmall: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 4,
  },
  proBadgeText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#000',
  },
  input: {
    backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md, paddingHorizontal: 16, height: 48,
    fontSize: 16, color: theme.colors.textPrimary,
  },
  dateInputWrapper: { flexDirection: 'row', alignItems: 'center' },
  calendarIconBtn: {
    backgroundColor: theme.colors.primaryLight, height: 48, width: 48,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border,
    borderLeftWidth: 0, borderTopRightRadius: theme.borderRadius.md, borderBottomRightRadius: theme.borderRadius.md,
  },
  bottomActions: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 24, paddingVertical: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderTopWidth: 1, borderTopColor: theme.colors.divider,
  },
  saveBtn: {
    backgroundColor: theme.colors.primary, borderRadius: 20, height: 60,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12,
    ...theme.shadows.teal,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  disabledBtn: { opacity: 0.7 },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center', alignItems: 'center', padding: 24,
  },
  calendarModalContent: {
    backgroundColor: theme.colors.surface, borderRadius: 24,
    padding: 20, width: '100%', maxWidth: 400, ...theme.shadows.premium,
  },
  calendarHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 16,
  },
  calendarHeaderTitle: {
    fontSize: 18, fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.heading,
  },
  aiHintCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: theme.colors.primaryLight,
    padding: 14, borderRadius: 12, marginBottom: 16,
  },
  aiHintText: {
    flex: 1, fontSize: 13, color: theme.colors.primary, fontWeight: '500',
    lineHeight: 18,
  },
});
