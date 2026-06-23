import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, Switch
} from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

const UPCOMING_DEADLINES = [
  { id: '1', title: 'MEXT (Japan)', deadline: 'May 15, 2025', daysLeft: 5, category: 'Full Funded' },
  { id: '2', title: 'Chevening (UK)', deadline: 'Nov 1, 2025', daysLeft: 140, category: 'Masters' },
  { id: '3', title: 'Erasmus Mundus', deadline: 'Jan 10, 2026', daysLeft: 210, category: 'Europe' },
];

export default function RemindersScreen() {
  const [reminders, setReminders] = useState({
    '1': true,
    '2': false,
    '3': true,
  });

  const toggleReminder = (id) => {
    setReminders(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#1565C0" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Deadline Reminders</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.banner}>
          <MaterialIcons name="notifications-active" size={32} color="#1565C0" />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.bannerTitle}>Never miss a deadline!</Text>
            <Text style={styles.bannerSub}>Get notified 7 days before scholarship applications close.</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Upcoming Deadlines</Text>

        {UPCOMING_DEADLINES.map(item => (
          <View key={item.id} style={styles.reminderCard}>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDeadline}>
                <MaterialIcons name="event" size={14} color="#E53935" /> Ends: {item.deadline}
              </Text>
              <View style={[styles.daysBadge, item.daysLeft < 7 && styles.daysBadgeUrgent]}>
                <Text style={[styles.daysText, item.daysLeft < 7 && styles.daysTextUrgent]}>
                  {item.daysLeft} days left
                </Text>
              </View>
            </View>

            <View style={styles.actionArea}>
              <Text style={styles.notifyLabel}>{reminders[item.id] ? 'On' : 'Off'}</Text>
              <Switch
                value={reminders[item.id]}
                onValueChange={() => toggleReminder(item.id)}
                trackColor={{ false: "#CFD8DC", true: "#BBDEFB" }}
                thumbColor={reminders[item.id] ? "#1565C0" : "#90A4AE"}
              />
            </View>
          </View>
        ))}

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Reminder Settings</Text>
          <TouchableOpacity style={styles.settingItem}>
            <MaterialIcons name="vibration" size={22} color="#607D8B" />
            <Text style={styles.settingText}>Vibrate on alert</Text>
            <MaterialIcons name="chevron-right" size={24} color="#B0BEC5" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <MaterialIcons name="volume-up" size={22} color="#607D8B" />
            <Text style={styles.settingText}>Notification sound</Text>
            <MaterialIcons name="chevron-right" size={24} color="#B0BEC5" />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F4F6FA' },
  header: {
    height: 100, backgroundColor: '#1565C0',
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 40, paddingHorizontal: 16, gap: 12
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  backBtn: { padding: 4 },
  scroll: { padding: 16 },
  banner: {
    flexDirection: 'row', backgroundColor: '#E3F2FD',
    padding: 20, borderRadius: 16, marginBottom: 24, alignItems: 'center'
  },
  bannerTitle: { fontSize: 16, fontWeight: 'bold', color: '#1565C0' },
  bannerSub: { fontSize: 13, color: '#1565C0', marginTop: 4, lineHeight: 18 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#1A237E', marginBottom: 12, marginTop: 8 },
  reminderCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16,
    flexDirection: 'row', marginBottom: 12, alignItems: 'center',
    elevation: 3, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6
  },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1A237E', marginBottom: 4 },
  cardDeadline: { fontSize: 13, color: '#607D8B', marginBottom: 8 },
  daysBadge: {
    backgroundColor: '#F5F5F5', paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 6, alignSelf: 'flex-start'
  },
  daysBadgeUrgent: { backgroundColor: '#FFEBEE' },
  daysText: { fontSize: 11, fontWeight: '700', color: '#607D8B' },
  daysTextUrgent: { color: '#E53935' },
  actionArea: { alignItems: 'center', marginLeft: 12 },
  notifyLabel: { fontSize: 10, color: '#90A4AE', marginBottom: 2, fontWeight: 'bold' },
  settingsSection: { marginTop: 20, backgroundColor: '#fff', borderRadius: 16, padding: 8 },
  settingItem: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    borderBottomWidth: 1, borderBottomColor: '#F5F5F5'
  },
  settingText: { flex: 1, fontSize: 14, color: '#263238', marginLeft: 12 }
});
