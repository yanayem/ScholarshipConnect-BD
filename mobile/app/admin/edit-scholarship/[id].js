/**
 * EDIT SCHOLARSHIP: Admin page to update existing scholarship details.
 * - Fetches current data based on ID.
 * - Allows modification of all fields including min_cgpa and deadline.
 * - Connected to: apiService.getScholarshipDetail, apiService.updateScholarship, theme.js.
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TextInput, TouchableOpacity, KeyboardAvoidingView,
  Platform, Modal, ActivityIndicator
} from 'react-native';
import { theme } from '../../../theme';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Calendar } from 'react-native-calendars';
import { apiService } from '../../../services/api';
import { showToast } from '../../../components/AdminToast';

const InputField = ({ label, value, onChangeText, name, placeholder, multiline = false, numberOfLines = 1, keyboardType = 'default' }) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, multiline && styles.textArea]}
      placeholder={placeholder}
      placeholderTextColor={theme.colors.placeholder}
      value={value}
      onChangeText={(text) => onChangeText(name, text)}
      multiline={multiline}
      numberOfLines={numberOfLines}
      keyboardType={keyboardType}
      underlineColorAndroid="transparent"
    />
  </View>
);

export default function EditScholarship() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    provider: '',
    country: '',
    amount: '',
    category: '',
    level: '',
    field: '',
    min_cgpa: '',
    deadline: '',
    description: '',
    eligibility: '',
    official_link: '',
    image_url: '',
  });

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await apiService.getScholarshipDetail(id);
        if (res.ok) {
          const data = res.data;
          setFormData({
            title: data.title || '',
            provider: data.provider || '',
            country: data.country || '',
            amount: data.amount || '',
            category: data.category || '',
            level: data.level || '',
            field: data.field || '',
            min_cgpa: data.min_cgpa ? data.min_cgpa.toString() : '',
            deadline: data.deadline || '',
            description: data.description || '',
            eligibility: data.eligibility || '',
            official_link: data.official_link || '',
            image_url: data.image_url || '',
          });
        } else {
          showToast('Could not load scholarship details', 'error');
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    if (!formData.title || !formData.deadline) {
      showToast('Title and Deadline are required', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        min_cgpa: formData.min_cgpa === '' ? 0.00 : parseFloat(formData.min_cgpa)
      };

      const res = await apiService.updateScholarship(id, payload);
      if (res.ok) {
        showToast('Scholarship updated successfully!', 'success');
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/(tabs)');
        }
      } else {
        showToast('Update failed', 'error');
      }
    } catch (error) {
      showToast('Network error occurred', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Scholarship</Text>
        </View>

        <View style={styles.formCard}>
          <InputField
            label="Scholarship Title *"
            name="title"
            value={formData.title}
            onChangeText={handleInputChange}
            placeholder="e.g. MEXT Research Scholarship"
          />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <InputField
                label="Country"
                name="country"
                value={formData.country}
                onChangeText={handleInputChange}
                placeholder="e.g. Japan"
              />
            </View>
            <View style={{ width: theme.spacing.md }} />
            <View style={{ flex: 1 }}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Deadline *</Text>
                <View style={styles.dateInputWrapper}>
                  <TextInput
                    style={[styles.input, { flex: 1, borderRightWidth: 0, borderTopRightRadius: 0, borderBottomRightRadius: 0 }]}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={theme.colors.placeholder}
                    value={formData.deadline}
                    onChangeText={(text) => handleInputChange('deadline', text)}
                    underlineColorAndroid="transparent"
                  />
                  <TouchableOpacity
                    onPress={() => setShowCalendar(true)}
                    style={styles.calendarIconBtn}
                  >
                    <MaterialIcons name="event" size={22} color={theme.colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Calendar Modal */}
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
                  <Text style={styles.calendarHeaderTitle}>Select Deadline</Text>
                  <TouchableOpacity onPress={() => setShowCalendar(false)}>
                    <MaterialIcons name="close" size={24} color={theme.colors.textPrimary} />
                  </TouchableOpacity>
                </View>
                <Calendar
                  onDayPress={(day) => {
                    handleInputChange('deadline', day.dateString);
                    setShowCalendar(false);
                  }}
                  markedDates={{
                    [formData.deadline]: { selected: true, selectedColor: theme.colors.primary }
                  }}
                />
              </View>
            </TouchableOpacity>
          </Modal>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <InputField
                label="Minimum CGPA"
                name="min_cgpa"
                value={formData.min_cgpa}
                onChangeText={handleInputChange}
                placeholder="3.50"
                keyboardType="numeric"
              />
            </View>
            <View style={{ width: theme.spacing.md }} />
            <View style={{ flex: 1 }}>
              <InputField
                label="Study Level"
                name="level"
                value={formData.level}
                onChangeText={handleInputChange}
                placeholder="Masters"
              />
            </View>
          </View>

          <InputField
            label="Eligibility Criteria"
            name="eligibility"
            value={formData.eligibility}
            onChangeText={handleInputChange}
            placeholder="Outline requirements..."
            multiline
            numberOfLines={4}
          />

          <InputField
            label="Official Link"
            name="official_link"
            value={formData.official_link}
            onChangeText={handleInputChange}
            placeholder="https://..."
          />

          <InputField
            label="Description"
            name="description"
            value={formData.description}
            onChangeText={handleInputChange}
            placeholder="Detailed info..."
            multiline
            numberOfLines={6}
          />

          <TouchableOpacity
            style={[
              styles.submitButton,
              saving && { opacity: 0.7 }
            ]}
            onPress={handleUpdate}
            disabled={saving}
          >
            <Text style={styles.submitButtonText}>
              {saving ? 'Updating...' : 'Save Changes'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: theme.spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.xl, gap: theme.spacing.md },
  backButton: { padding: theme.spacing.xs },
  headerTitle: { fontSize: theme.typography.sizes.xxl, fontFamily: theme.typography.fontFamily.bold, color: theme.colors.heading },
  formCard: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.xl, padding: theme.spacing.xl, ...theme.shadows.premium },
  inputContainer: { marginBottom: theme.spacing.lg },
  label: { fontSize: theme.typography.sizes.sm, fontFamily: theme.typography.fontFamily.semiBold, color: theme.colors.textPrimary, marginBottom: theme.spacing.xs },
  input: { backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.borderRadius.md, paddingHorizontal: theme.spacing.md, height: 48, fontSize: theme.typography.sizes.base, fontFamily: theme.typography.fontFamily.regular, color: theme.colors.textPrimary },
  textArea: { height: 120, paddingTop: theme.spacing.md, textAlignVertical: 'top' },
  row: { flexDirection: 'row' },
  dateInputWrapper: { flexDirection: 'row', alignItems: 'center' },
  calendarIconBtn: { backgroundColor: theme.colors.primaryLight, height: 48, width: 48, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border, borderLeftWidth: 0, borderTopRightRadius: theme.borderRadius.md, borderBottomRightRadius: theme.borderRadius.md },
  submitButton: { backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.md, height: 52, alignItems: 'center', justifyContent: 'center', marginTop: theme.spacing.md },
  submitButtonText: { color: 'white', fontSize: theme.typography.sizes.base, fontFamily: theme.typography.fontFamily.bold },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center', padding: theme.spacing.lg },
  calendarModalContent: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.xl, padding: theme.spacing.lg, width: '100%', maxWidth: 400, ...theme.shadows.premium },
  calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md },
  calendarHeaderTitle: { fontSize: theme.typography.sizes.lg, fontFamily: theme.typography.fontFamily.bold, color: theme.colors.heading }
});
