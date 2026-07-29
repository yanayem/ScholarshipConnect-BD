import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StatusBar, Modal, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { theme } from '../../theme';
import { apiService } from '../../services/api';

const TIME_SLOTS = [
  '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
  '07:00 PM', '08:00 PM', '09:00 PM'
];

export default function RequestMentorshipScreen() {
  const { mentorId, mentorName } = useLocalSearchParams();
  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(false);

  // UI State
  const [showCalendar, setShowCalendar] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleSubmit = async () => {
    if (!topic || !message || !selectedDate || !selectedTime) {
      Alert.alert('Required', 'Please fill in all fields including date and time.');
      return;
    }

    setLoading(true);
    // Convert 12h time to 24h for backend TimeField
    const [time, modifier] = selectedTime.split(' ');
    let [hours, minutes] = time.split(':');

    let hoursNum = parseInt(hours, 10);
    if (hoursNum === 12) hoursNum = 0;
    if (modifier === 'PM') hoursNum += 12;

    const h = hoursNum.toString().padStart(2, '0');
    const m = minutes.padStart(2, '0');
    const time24 = `${h}:${m}:00`;

    const res = await apiService.requestMentorship(mentorId, topic, message, selectedDate, time24);
    if (res.ok) {
      Alert.alert('Success', 'Your session booking request has been sent!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } else {
      // Better error handling for the UI
      let errorMsg = 'Failed to book session.';
      if (res.data && typeof res.data === 'object') {
        const details = Object.entries(res.data)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
          .join('\n');
        errorMsg = details || errorMsg;
      }

      // Use console.warn instead of console.error to avoid the red screen of death during development
      console.warn('[BOOKING FAILED]', res.data);
      Alert.alert('Booking Error', errorMsg);
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
           <MaterialIcons name="close" size={24} color={theme.colors.heading} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Mentor Session</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Mentor</Text>
        <View style={styles.mentorBox}>
           <View style={styles.mentorAvatar}>
             <Text style={styles.avatarText}>{mentorName?.[0] || 'M'}</Text>
           </View>
           <Text style={styles.mentorName}>{mentorName}</Text>
        </View>

        <Text style={styles.label}>Topic / Subject</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. SOP Review, Visa Guidance..."
          value={topic}
          onChangeText={setTopic}
          returnKeyType="next"
        />

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.label}>Date</Text>
            <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowCalendar(true)}>
              <MaterialIcons name="event" size={20} color={theme.colors.primary} />
              <Text style={[styles.pickerText, !selectedDate && { color: theme.colors.placeholder }]}>
                {selectedDate || 'Select Date'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.label}>Time</Text>
            <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowTimePicker(true)}>
              <MaterialIcons name="access-time" size={20} color={theme.colors.primary} />
              <Text style={[styles.pickerText, !selectedTime && { color: theme.colors.placeholder }]}>
                {selectedTime || 'Select Time'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.label}>Message / Details</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="What specific questions do you have?"
          value={message}
          onChangeText={setMessage}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          returnKeyType="done"
          blurOnSubmit={true}
          onSubmitEditing={handleSubmit}
        />

        <TouchableOpacity
          style={[styles.submitBtn, (!topic || !message || !selectedDate || !selectedTime) && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>Confirm Booking</Text>
          )}
        </TouchableOpacity>

        <View style={styles.hintBox}>
          <MaterialIcons name="info-outline" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.hintText}>The mentor will review your request and confirm the slot.</Text>
        </View>
      </ScrollView>

      {/* Date Picker Modal */}
      <Modal visible={showCalendar} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowCalendar(false)}>
           <View style={styles.modalContent}>
              <Calendar
                minDate={new Date().toISOString().split('T')[0]}
                onDayPress={(day) => {
                  setSelectedDate(day.dateString);
                  setShowCalendar(false);
                }}
                markedDates={{
                  [selectedDate]: { selected: true, selectedColor: theme.colors.primary }
                }}
                theme={{
                  todayTextColor: theme.colors.primary,
                  selectedDayBackgroundColor: theme.colors.primary,
                }}
              />
           </View>
        </TouchableOpacity>
      </Modal>

      {/* Time Picker Modal */}
      <Modal visible={showTimePicker} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowTimePicker(false)}>
           <View style={[styles.modalContent, { maxHeight: '60%' }]}>
              <Text style={styles.modalTitle}>Select Preferred Time</Text>
              <ScrollView>
                 {TIME_SLOTS.map(slot => (
                   <TouchableOpacity
                     key={slot}
                     style={[styles.timeSlot, selectedTime === slot && styles.timeSlotActive]}
                     onPress={() => {
                       setSelectedTime(slot);
                       setShowTimePicker(false);
                     }}
                   >
                     <Text style={[styles.timeSlotText, selectedTime === slot && styles.timeSlotTextActive]}>{slot}</Text>
                     {selectedTime === slot && <MaterialIcons name="check" size={20} color={theme.colors.primary} />}
                   </TouchableOpacity>
                 ))}
              </ScrollView>
           </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    flexDirection: 'row', alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: theme.colors.divider
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.heading, marginLeft: 16 },
  content: { padding: 24 },
  label: { fontSize: 13, fontWeight: 'bold', color: theme.colors.heading, marginBottom: 8, marginTop: 16 },
  mentorBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.primaryLight,
    padding: 12, borderRadius: 16, gap: 12
  },
  mentorAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: 'bold' },
  mentorName: { fontSize: 15, color: theme.colors.primaryDark, fontWeight: 'bold' },
  row: { flexDirection: 'row' },
  input: {
    backgroundColor: theme.colors.background, borderRadius: 12, padding: 16,
    fontSize: 15, color: theme.colors.textPrimary, borderWidth: 1, borderColor: theme.colors.divider
  },
  pickerBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.background,
    borderRadius: 12, padding: 16, borderWidth: 1, borderColor: theme.colors.divider, gap: 10
  },
  pickerText: { fontSize: 14, color: theme.colors.textPrimary },
  textArea: { height: 120 },
  submitBtn: {
    backgroundColor: theme.colors.primary, paddingVertical: 16, borderRadius: 16,
    alignItems: 'center', marginTop: 32, ...theme.shadows.soft
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  hintBox: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 20, justifyContent: 'center' },
  hintText: { fontSize: 12, color: theme.colors.textSecondary },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  modalContent: { backgroundColor: '#fff', borderRadius: 24, padding: 20, ...theme.shadows.premium },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.heading, marginBottom: 16, textAlign: 'center' },
  timeSlot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.divider },
  timeSlotActive: { backgroundColor: theme.colors.primaryLight, borderRadius: 12, paddingHorizontal: 12 },
  timeSlotText: { fontSize: 16, color: theme.colors.textPrimary },
  timeSlotTextActive: { color: theme.colors.primary, fontWeight: 'bold' }
});
