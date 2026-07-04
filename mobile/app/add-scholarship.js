import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TextInput, Pressable, KeyboardAvoidingView,
  Platform, Alert, Modal, TouchableOpacity,
  ToastAndroid
} from 'react-native';
import { theme } from '../theme';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Calendar } from 'react-native-calendars';

import { apiService } from '../services/api';

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
    />
  </View>
);

export default function AddScholarship() {
  const router = useRouter();
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

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.deadline) {
      Alert.alert('Error', 'Please fill in all required fields (Title and Deadline)');
      return;
    }
    try {
      // Prepare data for submission: clean up empty strings for optional fields
      const payload = {};
      Object.keys(formData).forEach(key => {
        if (formData[key] !== '' || key === 'title' || key === 'deadline') {
           payload[key] = formData[key];
        }
      });

      // Handle min_cgpa conversion
      if (payload.min_cgpa) {
        payload.min_cgpa = parseFloat(payload.min_cgpa);
      } else {
        payload.min_cgpa = 0.00;
      }

      const res = await apiService.addScholarship(payload);
      if (res.ok) {
        if (Platform.OS === 'android') {
          ToastAndroid.show('Scholarship submitted for review!', ToastAndroid.LONG);
        } else {
          Alert.alert('Success', 'Scholarship submitted for review');
        }

        // Return to the previous screen
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/(tabs)/scholarships');
        }
      } else {
        // More robust error handling
        let errorMsg = 'Failed to submit scholarship';
        if (res.data) {
          if (typeof res.data === 'object') {
            errorMsg = Object.entries(res.data)
              .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
              .join('\n');
          } else {
            errorMsg = res.data.toString();
          }
        }
        Alert.alert('Error', errorMsg);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'An unexpected error occurred: ' + error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/scholarships')} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={theme.colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Submit Scholarship</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.hintText}>Shared scholarships will be reviewed by admins before becoming public.</Text>

          <InputField
            label="Scholarship Title *"
            name="title"
            value={formData.title}
            onChangeText={handleInputChange}
            placeholder="e.g. MEXT Research Scholarship"
          />
          <InputField
            label="Provider"
            name="provider"
            value={formData.provider}
            onChangeText={handleInputChange}
            placeholder="e.g. Government of Japan"
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
                  />
                  <Pressable
                    onPress={() => setShowCalendar(true)}
                    style={styles.calendarIconBtn}
                  >
                    <MaterialIcons name="event" size={22} color={theme.colors.primary} />
                  </Pressable>
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

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <InputField
                label="Amount"
                name="amount"
                value={formData.amount}
                onChangeText={handleInputChange}
                placeholder="e.g. Full Tuition + Stipend"
              />
            </View>
            <View style={{ width: theme.spacing.md }} />
            <View style={{ flex: 1 }}>
              <InputField
                label="Category"
                name="category"
                value={formData.category}
                onChangeText={handleInputChange}
                placeholder="e.g. Research"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <InputField
                label="Study Level"
                name="level"
                value={formData.level}
                onChangeText={handleInputChange}
                placeholder="e.g. Masters"
              />
            </View>
            <View style={{ width: theme.spacing.md }} />
            <View style={{ flex: 1 }}>
              <InputField
                label="Field of Study"
                name="field"
                value={formData.field}
                onChangeText={handleInputChange}
                placeholder="e.g. Computer Science"
              />
            </View>
          </View>

          <InputField
            label="Minimum CGPA Required"
            name="min_cgpa"
            value={formData.min_cgpa}
            onChangeText={handleInputChange}
            placeholder="e.g. 3.50 (Leave blank if none)"
            keyboardType="numeric"
          />

          <InputField
            label="Eligibility Criteria"
            name="eligibility"
            value={formData.eligibility}
            onChangeText={handleInputChange}
            placeholder="Outline requirements (GPA, Age, etc.)"
            multiline
            numberOfLines={4}
          />

          <InputField
            label="Official Website Link"
            name="official_link"
            value={formData.official_link}
            onChangeText={handleInputChange}
            placeholder="https://..."
          />

          <InputField
            label="Image URL"
            name="image_url"
            value={formData.image_url}
            onChangeText={handleInputChange}
            placeholder="https://... (Poster or Logo URL)"
          />

          <InputField
            label="Description"
            name="description"
            value={formData.description}
            onChangeText={handleInputChange}
            placeholder="Detailed scholarship information"
            multiline
            numberOfLines={6}
          />

          <Pressable
            style={({ pressed }) => [
              styles.submitButton,
              pressed && { backgroundColor: theme.colors.primaryHover }
            ]}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>Submit Scholarship</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.xxl,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.heading,
  },
  formCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    ...theme.shadows.premium,
  },
  hintText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.medium,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  inputContainer: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.typography.sizes.sm,
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  input: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    height: 48,
    fontSize: theme.typography.sizes.base,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.textPrimary,
  },
  textArea: {
    height: 120,
    paddingTop: theme.spacing.md,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  dateInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calendarIconBtn: {
    backgroundColor: theme.colors.primaryLight,
    height: 48,
    width: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderLeftWidth: 0,
    borderTopRightRadius: theme.borderRadius.md,
    borderBottomRightRadius: theme.borderRadius.md,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.md,
  },
  submitButtonText: {
    color: 'white',
    fontSize: theme.typography.sizes.base,
    fontFamily: theme.typography.fontFamily.bold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  calendarModalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    width: '100%',
    maxWidth: 400,
    ...theme.shadows.premium,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  calendarHeaderTitle: {
    fontSize: theme.typography.sizes.lg,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.heading,
  },
});
