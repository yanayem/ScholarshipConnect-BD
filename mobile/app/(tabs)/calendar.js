import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { theme } from '../../theme';
import { apiService } from '../../services/api';

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState('');
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadScholarships = async () => {
      try {
        const res = await apiService.getScholarships();
        if (res.ok) {
          setScholarships(res.data);
        }
      } catch (error) {
        console.log('Error loading scholarships for calendar', error);
      } finally {
        setLoading(false);
      }
    };
    loadScholarships();
  }, []);

  const groupedScholarships = scholarships.reduce((acc, curr) => {
    const date = curr.deadline;
    if (!date) return acc;
    if (!acc[date]) acc[date] = [];
    acc[date].push(curr);
    return acc;
  }, {});

  const markedDates = {};
  Object.keys(groupedScholarships).forEach(date => {
    markedDates[date] = { 
      marked: true, 
      dotColor: theme.colors.primary,
      activeOpacity: 0.8 
    };
  });

  if (selectedDate) {
    markedDates[selectedDate] = {
      ...markedDates[selectedDate],
      selected: true,
      selectedColor: theme.colors.primary,
      disableTouchEvent: true
    };
  }

  const selectedScholarships = groupedScholarships[selectedDate] || [];

  return (
    <View style={styles.root}>
      <StatusBar backgroundColor={theme.colors.background} barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        <View style={styles.calendarContainer}>
          <Calendar
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={markedDates}
            theme={{
              backgroundColor: theme.colors.surface,
              calendarBackground: theme.colors.surface,
              textSectionTitleColor: theme.colors.textSecondary,
              selectedDayBackgroundColor: theme.colors.primary,
              selectedDayTextColor: '#ffffff',
              todayTextColor: theme.colors.primary,
              dayTextColor: theme.colors.textPrimary,
              textDisabledColor: theme.colors.placeholder,
              dotColor: theme.colors.primary,
              selectedDotColor: '#ffffff',
              arrowColor: theme.colors.primary,
              monthTextColor: theme.colors.heading,
              indicatorColor: theme.colors.primary,
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
              <MaterialIcons name="event-available" size={48} color={theme.colors.placeholder} />
              <Text style={styles.emptyText}>No deadlines on this date.</Text>
            </View>
          )}

          {selectedScholarships.map(item => (
            <TouchableOpacity key={item.id} style={styles.card} activeOpacity={0.85}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <View style={styles.metaRow}>
                <View style={[styles.metaBadge, { backgroundColor: theme.colors.tealCard }]}>
                  <MaterialIcons name="place" size={13} color={theme.colors.primary} />
                  <Text style={styles.metaText}>{item.country}</Text>
                </View>
                <View style={[styles.metaBadge, { backgroundColor: theme.colors.lavenderCard }]}>
                  <MaterialIcons name="school" size={13} color={theme.colors.chartSecondary} />
                  <Text style={[styles.metaText, {color: theme.colors.chartSecondary}]}>{item.level || item.category || 'Various'}</Text>
                </View>
              </View>
              <View style={styles.cardBottom}>
                <View style={[styles.amountBadge, { backgroundColor: theme.colors.mintCard }]}>
                  <Text style={styles.amountText}>{item.amount || 'Varies'}</Text>
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
  root: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { padding: 20 },
  calendarContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 8,
    marginBottom: 24,
    ...theme.shadows.soft,
  },
  listContainer: {
    paddingHorizontal: 4,
  },
  listHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.heading,
    marginBottom: 16,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
    ...theme.shadows.premium,
  },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.heading, marginBottom: 12 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  metaBadge: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, gap: 4,
  },
  metaText: { fontSize: 12, color: theme.colors.primary, fontWeight: '600' },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  amountBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  amountText: { color: theme.colors.success, fontWeight: 'bold', fontSize: 12 },
  applyBtn: {
    backgroundColor: theme.colors.primary, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6,
  },
  applyText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  emptyBox: { alignItems: 'center', paddingVertical: 40, backgroundColor: theme.colors.surface, borderRadius: 20 },
  emptyText: { fontSize: 15, color: theme.colors.placeholder, marginTop: 12 },
});
