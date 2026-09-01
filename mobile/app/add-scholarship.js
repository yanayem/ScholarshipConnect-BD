import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TextInput, Pressable, KeyboardAvoidingView,
  Platform, Alert, Modal, TouchableOpacity, Image,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { theme } from '../theme';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Calendar } from 'react-native-calendars';
import * as ImagePicker from 'expo-image-picker';

import { apiService } from '../services/api';
import { useToast } from '../components/Toast';

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
  const { showToast, ToastComponent } = useToast();
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
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

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.deadline) {
      Alert.alert('Error', 'Please fill in all required fields (Title and Deadline)');
      return;
    }
    try {
      const data = new FormData();

      // Add all text fields to FormData, skipping empty ones
      Object.keys(formData).forEach(key => {
        const value = formData[key];
        if (value !== '' && value !== null && value !== undefined) {
          // Send all numeric-looking data as strings to handle precision/empty values gracefully in backend
          data.append(key, value.toString());
        }
      });

      // Add image if selected
      if (selectedImage) {
        if (Platform.OS === 'web') {
          try {
            const response = await fetch(selectedImage.uri);
            const blob = await response.blob();

            console.log(`[Web Image] Blob size: ${blob.size}, type: ${blob.type}`);

            if (blob.size === 0) {
              throw new Error('Selected image is empty.');
            }

            const fileName = selectedImage.fileName || 'scholarship_image.jpg';
            const file = new File([blob], fileName, { type: blob.type || 'image/jpeg' });
            data.append('image', file);
          } catch (fetchError) {
            console.error('[Web Image Fetch Error]', fetchError);
            Alert.alert('Image Error', 'Failed to process the selected image. Please try another one.');
            return;
          }
        } else {
          data.append('image', {
            uri: Platform.OS === 'ios' ? selectedImage.uri.replace('file://', '') : selectedImage.uri,
            name: 'scholarship_image.jpg',
            type: 'image/jpeg',
          });
        }
      }

      const res = await apiService.addScholarship(data);
      if (res.ok) {
        showToast('Scholarship submitted for review!', 'success');

        const isStaff = await apiService.isStaff();

        setTimeout(() => {
          if (isStaff) {
            router.replace('/admin/scholarships');
          } else {
            router.replace('/(tabs)/scholarships');
          }
        }, 1500);
      } else {
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
        showToast(errorMsg, 'error');
      }
    } catch (error) {
      console.error(error);
      showToast('An unexpected error occurred', 'error');
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/scholarships');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color={theme.colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Submit Scholarship</Text>
        </View>

        <Animated.View
          entering={FadeInDown.duration(600)}
          style={styles.formCard}
        >
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
                    style={styles.dateInput}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={theme.colors.placeholder}
                    value={formData.deadline}
                    onChangeText={(text) => handleInputChange('deadline', text)}
                    editable={true}
                  />
                  <TouchableOpacity
                    onPress={() => setShowCalendar(true)}
                    style={styles.calendarIconBox}
                  >
                    <MaterialIcons name="event" size={22} color={theme.colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

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
            label="Image URL (Optional)"
            name="image_url"
            value={formData.image_url}
            onChangeText={handleInputChange}
            placeholder="https://... (Fallback or Logo URL)"
          />

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Upload Banner Image</Text>
            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              {selectedImage ? (
                <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <MaterialIcons name="add-a-photo" size={32} color={theme.colors.primary} />
                  <Text style={styles.imagePickerText}>Select Scholarship Poster</Text>
                </View>
              )}
            </TouchableOpacity>
            {selectedImage && (
              <TouchableOpacity onPress={() => setSelectedImage(null)} style={styles.removeImgBtn}>
                <Text style={styles.removeImgText}>Remove Image</Text>
              </TouchableOpacity>
            )}
          </View>

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
        </Animated.View>
      </ScrollView>
      {ToastComponent}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    marginTop: Platform.OS === 'android' ? 10 : 0,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingTop: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.md,
  },
  backButton: {
    padding: theme.spacing.sm,
    marginLeft: -theme.spacing.sm,
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
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    height: 48,
    overflow: 'hidden',
  },
  dateInput: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.typography.sizes.base,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.textPrimary,
    backgroundColor: 'transparent', // Ensure no background overlap
    borderWidth: 0, // Remove default borders
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }),
  },
  calendarIconBox: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(42, 157, 143, 0.05)', // Subtle teal tint
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
  imagePicker: {
    height: 180,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginTop: 5,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    alignItems: 'center',
    gap: 8,
  },
  imagePickerText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.medium,
  },
  removeImgBtn: {
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  removeImgText: {
    color: theme.colors.error,
    fontSize: 12,
    fontWeight: 'bold',
  }
});
