import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, Switch
} from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';

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
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')}
          style={styles.backBtn}
        >
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.heading} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reminders</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.banner, { backgroundColor: theme.colors.tealCard }]}>
          <MaterialIcons name="notifications-active" size={32} color={theme.colors.primary} />
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={styles.bannerTitle}>Stay on Track!</Text>
            <Text style={styles.bannerSub}>Get notified before deadlines close.</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Upcoming Deadlines</Text>

        {UPCOMING_DEADLINES.map(item => (
          <View key={item.id} style={styles.reminderCard}>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDeadline}>
                <MaterialIcons name="event" size={14} color={theme.colors.textSecondary} /> Ends: {item.deadline}
              </Text>
              <View style={[styles.daysBadge, item.daysLeft < 7 ? {backgroundColor: 'rgba(232, 93, 117, 0.1)'} : {backgroundColor: theme.colors.secondaryBackground}]}>
                <Text style={[styles.daysText, item.daysLeft < 7 && {color: theme.colors.error}]}>
                  {item.daysLeft} days left
                </Text>
              </View>
            </View>

            <View style={styles.actionArea}>
              <Text style={styles.notifyLabel}>{reminders[item.id] ? 'On' : 'Off'}</Text>
              <Switch
                value={reminders[item.id]}
                onValueChange={() => toggleReminder(item.id)}
                trackColor={{ false: theme.colors.divider, true: theme.colors.primaryLight }}
                thumbColor={reminders[item.id] ? theme.colors.primary : theme.colors.placeholder}
              />
            </View>
          </View>
        ))}

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Global Settings</Text>
          <TouchableOpacity style={styles.settingItem}>
            <MaterialIcons name="vibration" size={22} color={theme.colors.textSecondary} />
            <Text style={styles.settingText}>Haptic vibration</Text>
            <MaterialIcons name="chevron-right" size={20} color={theme.colors.placeholder} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.settingItem, { borderBottomWidth: 0 }]}>
            <MaterialIcons name="volume-up" size={22} color={theme.colors.textSecondary} />
            <Text style={styles.settingText}>Alert sound</Text>
            <MaterialIcons name="chevron-right" size={20} color={theme.colors.placeholder} />
          </TouchableOpacity>
        </View>

      </ScrollView>
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
  banner: {
    flexDirection: 'row',
    padding: 24, borderRadius: 24, marginBottom: 32, alignItems: 'center',
  },
  bannerTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.heading },
  bannerSub: { fontSize: 14, color: theme.colors.textSecondary, marginTop: 4, lineHeight: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.heading, marginBottom: 16, marginTop: 12 },
  reminderCard: {
    backgroundColor: theme.colors.surface, borderRadius: 24, padding: 20,
    flexDirection: 'row', marginBottom: 16, alignItems: 'center',
    ...theme.shadows.soft,
  },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.heading, marginBottom: 6 },
  cardDeadline: { fontSize: 13, color: theme.colors.textSecondary, marginBottom: 10 },
  daysBadge: {
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 8, alignSelf: 'flex-start'
  },
  daysText: { fontSize: 11, fontWeight: 'bold', color: theme.colors.textSecondary },
  actionArea: { alignItems: 'center', marginLeft: 16 },
  notifyLabel: { fontSize: 10, color: theme.colors.textSecondary, marginBottom: 4, fontWeight: 'bold' },
  settingsSection: { marginTop: 20, backgroundColor: theme.colors.surface, borderRadius: 24, padding: 8 },
  settingItem: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
  },
  settingText: { flex: 1, fontSize: 14, color: theme.colors.heading, marginLeft: 16 }
});
