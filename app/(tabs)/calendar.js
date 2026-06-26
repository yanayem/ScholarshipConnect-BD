import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

// Helper to get current month dates for mock data
const today = new Date();
const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
const nextMonth = `${today.getMonth() === 11 ? today.getFullYear() + 1 : today.getFullYear()}-${String(today.getMonth() === 11 ? 1 : today.getMonth() + 2).padStart(2, '0')}`;

const MOCK_SCHOLARSHIPS = [
  { id: '1', title: 'MEXT (Japan)', country: 'Japan', level: 'Masters', amount: 'Full Funded', date: `${currentMonth}-15` },
  { id: '2', title: 'Chevening (UK)', country: 'UK', level: 'Masters', amount: 'Full Funded', date: `${currentMonth}-25` },
  { id: '3', title: 'DAAD (Germany)', country: 'Germany', level: 'PhD', amount: 'Full Funded', date: `${nextMonth}-10` },
  { id: '4', title: 'Australia Awards', country: 'Australia', level: 'Masters', amount: 'Full Funded', date: `${nextMonth}-10` },
  { id: '7', title: 'Fulbright (USA)', country: 'USA', level: 'Masters', amount: 'Full Funded', date: `${currentMonth}-28` },
];

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState('');

  // Group scholarships by date
  const groupedScholarships = MOCK_SCHOLARSHIPS.reduce((acc, curr) => {
    if (!acc[curr.date]) acc[curr.date] = [];
    acc[curr.date].push(curr);
    return acc;
  }, {});

  // Format marked dates for react-native-calendars
  const markedDates = {};
  Object.keys(groupedScholarships).forEach(date => {
    markedDates[date] = { 
      marked: true, 
      dotColor: '#E53935', 
      activeOpacity: 0.8 
    };
  });

  // Add selection styling
  if (selectedDate) {
    markedDates[selectedDate] = {
      ...markedDates[selectedDate],
      selected: true,
      selectedColor: '#C97352',
      disableTouchEvent: true
    };
  }

  const selectedScholarships = groupedScholarships[selectedDate] || [];

  return (
    <View style={styles.root}>
      <StatusBar backgroundColor="#C97352" barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        <View style={styles.calendarContainer}>
          <Calendar
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={markedDates}
            theme={{
              backgroundColor: '#ffffff',
              calendarBackground: '#ffffff',
              textSectionTitleColor: '#7A746E',
              selectedDayBackgroundColor: '#C97352',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#C97352',
              dayTextColor: '#2d4150',
              textDisabledColor: '#d9e1e8',
              dotColor: '#E53935',
              selectedDotColor: '#ffffff',
              arrowColor: '#C97352',
              monthTextColor: '#C97352',
              indicatorColor: '#C97352',
              textDayFontWeight: '500',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '600',
              textDayFontSize: 15,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 13
            }}
          />
        </View>

        <View style={styles.listContainer}>
          <Text style={styles.listHeader}>
            {selectedDate ? `Deadlines on ${selectedDate}` : 'Select a date to view deadlines'}
          </Text>
          
          {!!selectedDate && selectedScholarships.length === 0 && (
            <View style={styles.emptyBox}>
              <MaterialIcons name="event-available" size={48} color="#7A746E" />
              <Text style={styles.emptyText}>No deadlines on this date.</Text>
            </View>
          )}

          {selectedScholarships.map(item => (
            <TouchableOpacity key={item.id} style={styles.card} activeOpacity={0.85}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <View style={styles.metaRow}>
                <View style={styles.metaBadge}>
                  <MaterialIcons name="place" size={13} color="#C97352" />
                  <Text style={styles.metaText}>{item.country}</Text>
                </View>
                <View style={styles.metaBadge}>
                  <MaterialIcons name="school" size={13} color="#C97352" />
                  <Text style={styles.metaText}>{item.level}</Text>
                </View>
              </View>
              <View style={styles.cardBottom}>
                <View style={styles.amountBadge}>
                  <Text style={styles.amountText}>{item.amount}</Text>
                </View>
                <TouchableOpacity
                  style={styles.applyBtn}
                  onPress={() => router.push(`/scholarship/${item.id}`)}
                >
                  <Text style={styles.applyText}>Details</Text>
                  <MaterialIcons name="arrow-forward" size={14} color="#fff" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F4F6FA' },
  scroll: { padding: 16 },
  calendarContainer: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 8,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#2D2A26',
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  listContainer: {
    paddingHorizontal: 4,
  },
  listHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#C97352',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff', 
    borderRadius: 14, 
    padding: 16, 
    marginBottom: 14,
    elevation: 3, 
    shadowColor: '#2D2A26', 
    shadowOpacity: 0.07, 
    shadowRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#E53935'
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#C97352', marginBottom: 10 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  metaBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#E3F2FD',
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, gap: 4,
  },
  metaText: { fontSize: 12, color: '#C97352', fontWeight: '600' },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  amountBadge: { backgroundColor: '#E8F5E9', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  amountText: { color: '#2E7D32', fontWeight: 'bold', fontSize: 12 },
  applyBtn: {
    backgroundColor: '#C97352', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 4,
  },
  applyText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  emptyBox: { alignItems: 'center', paddingVertical: 30, backgroundColor: '#fff', borderRadius: 14 },
  emptyText: { fontSize: 15, color: '#7A746E', marginTop: 12 },
});
