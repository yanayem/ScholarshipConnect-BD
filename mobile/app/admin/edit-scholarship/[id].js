/**
 * EDIT SCHOLARSHIP: Admin page to update existing scholarship details.
 * - Fetches current data based on ID.
 * - Allows modification of all fields including min_cgpa and deadline.
 * - Connected to: apiService.getScholarshipDetail, apiService.updateScholarship, theme.js.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TextInput, TouchableOpacity, KeyboardAvoidingView,
  Platform, Alert, Modal, ActivityIndicator, Pressable, Image
} from 'react-native';
import { theme } from '../../../theme';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Calendar } from 'react-native-calendars';
import * as ImagePicker from 'expo-image-picker';
import { apiService } from '../../../services/api';
import { useToast } from '../../../components/Toast';

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
  const { showToast, ToastComponent } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [existingImage, setExistingImage] = useState(null);

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
          setExistingImage(data.image);
        } else {
          Alert.alert('Error', 'Could not load scholarship details');
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

  const handleUpdate = async () => {
    if (!formData.title || !formData.deadline) {
      Alert.alert('Error', 'Title and Deadline are required');
      return;
    }

    // Basic date validation
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(formData.deadline)) {
      Alert.alert('Invalid Date', 'Deadline must be in YYYY-MM-DD format');
      return;
    }

    setSaving(true);
    try {
      const data = new FormData();

      // Add all text fields to FormData
      Object.keys(formData).forEach(key => {
        if (key === 'min_cgpa') {
          data.append(key, parseFloat(formData[key]) || 0.00);
        } else {
          data.append(key, formData[key]);
        }
      });

      // Add image if selected
      if (selectedImage) {
        data.append('image', {
          uri: Platform.OS === 'ios' ? selectedImage.uri.replace('file://', '') : selectedImage.uri,
          name: 'scholarship_update.jpg',
          type: 'image/jpeg',
        });
      }

      const res = await apiService.updateScholarship(id, data);
      if (res.ok) {
        showToast('Scholarship updated successfully!', 'success');

        setTimeout(() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/admin/scholarships');
          }
        }, 1200);
      } else {
        console.error('[EDIT FAIL] Response:', res.status, res.data);
        let errorMsg = 'Update failed. ';

        if (res.data && typeof res.data === 'object') {
          // Extract specific field errors from Django
          const details = Object.entries(res.data)
            .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
            .join('\n');
          errorMsg += details || 'Please check all fields.';
        } else {
          errorMsg += res.data?.error || res.data?.message || 'Server error occurred.';
        }

        Alert.alert('Update Error', errorMsg);
      }
    } catch (error) {
      console.error('[EDIT ERROR]', error);
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
                    underlineColorAndroid="transparent"
                  />
                  <Pressable
                    onPress={() => setShowCalendar(true)}
                    style={styles.calendarIconBtn}
                  >
                    <MaterialIcons name="event" size={24} color={theme.colors.primary} />
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
                placeholder="e.g. Full Tuition"
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
            label="Minimum CGPA"
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
            placeholder="Outline requirements..."
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
            placeholder="https://..."
          />

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Scholarship Banner Image</Text>
            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              {selectedImage ? (
                <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} />
              ) : existingImage ? (
                <Image source={{ uri: existingImage }} style={styles.previewImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <MaterialIcons name="add-a-photo" size={32} color={theme.colors.primary} />
                  <Text style={styles.imagePickerText}>Change Scholarship Poster</Text>
                </View>
              )}
            </TouchableOpacity>
            {selectedImage && (
              <TouchableOpacity onPress={() => setSelectedImage(null)} style={styles.removeImgBtn}>
                <Text style={styles.removeImgText}>Reset to Original</Text>
              </TouchableOpacity>
            )}
          </View>

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
      {ToastComponent}
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
  calendarHeaderTitle: { fontSize: theme.typography.sizes.lg, fontFamily: theme.typography.fontFamily.bold, color: theme.colors.heading },
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
