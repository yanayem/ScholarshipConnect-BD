import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, Share
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';

const SCHOLARSHIP_DETAILS = {
  '1': {
    title: 'Japanese Government (MEXT) Scholarship 2025',
    country: 'Japan',
    level: 'Masters / PhD',
    amount: 'Full Funded',
    deadline: 'May 15, 2025',
    description: 'The MEXT Scholarship is a prestigious fully funded scholarship offered by the Japanese Ministry of Education, Culture, Sports, Science and Technology. It covers tuition fees, monthly allowance, and round-trip airfare.',
    eligibility: [
      'Must be a citizen of Bangladesh.',
      'Age must be under 35 years.',
      'Minimum CGPA 3.0 out of 4.0.',
      'Bachelor degree completed for Masters application.'
    ],
    documents: [
      'Academic Transcripts',
      'Research Plan',
      'Recommendation Letter',
      'Passport Copy',
      'Health Certificate'
    ],
    benefits: 'Full tuition, Monthly stipend of 144,000 JPY, Travel expenses.'
  },
  'default': {
    title: 'Scholarship Opportunity',
    country: 'International',
    level: 'Various',
    amount: 'Partial/Full',
    deadline: 'Contact Provider',
    description: 'Details for this specific scholarship are being updated. Please check back later or visit the official website for more information.',
    eligibility: ['Check official website for eligibility criteria.'],
    documents: ['Academic records', 'Identity proof'],
    benefits: 'Varies by program.'
  }
};

export default function ScholarshipDetails() {
  const { id } = useLocalSearchParams();
  const details = SCHOLARSHIP_DETAILS[id] || SCHOLARSHIP_DETAILS['default'];

  const onShare = async () => {
    try {
      await Share.share({
        message: `Check out this scholarship: ${details.title}. Deadline: ${details.deadline}`,
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/scholarships')}
          style={styles.backBtn}
        >
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.heading} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Details</Text>
        <TouchableOpacity onPress={onShare} style={styles.shareBtn}>
          <MaterialIcons name="share" size={24} color={theme.colors.heading} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Basic Info Card */}
        <View style={styles.mainCard}>
          <View style={styles.badgeRow}>
            <View style={[styles.statusBadge, { backgroundColor: theme.colors.mintCard }]}>
              <Text style={{ color: theme.colors.success, fontWeight: 'bold', fontSize: 12 }}>Open Now</Text>
            </View>
            <TouchableOpacity>
              <MaterialIcons name="bookmark-border" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>{details.title}</Text>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <MaterialIcons name="public" size={20} color={theme.colors.primary} />
              <Text style={styles.infoLabel}>Country</Text>
              <Text style={styles.infoValue}>{details.country}</Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialIcons name="school" size={20} color={theme.colors.primary} />
              <Text style={styles.infoLabel}>Level</Text>
              <Text style={styles.infoValue}>{details.level}</Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialIcons name="payments" size={20} color={theme.colors.primary} />
              <Text style={styles.infoLabel}>Grant</Text>
              <Text style={styles.infoValue}>{details.amount}</Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialIcons name="event" size={20} color={theme.colors.error} />
              <Text style={styles.infoLabel}>Deadline</Text>
              <Text style={[styles.infoValue, { color: theme.colors.error }]}>{details.deadline}</Text>
            </View>
          </View>
        </View>

        {/* Description Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Scholarship</Text>
          <Text style={styles.description}>{details.description}</Text>
        </View>

        {/* Benefits Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Program Benefits</Text>
          <View style={[styles.highlightBox, { backgroundColor: theme.colors.tealCard }]}>
             <Text style={styles.highlightText}>{details.benefits}</Text>
          </View>
        </View>

        {/* Eligibility Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Eligibility Criteria</Text>
          {details.eligibility.map((item, index) => (
            <View key={index} style={styles.listItem}>
              <MaterialIcons name="check-circle" size={18} color={theme.colors.success} />
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* Deadline Reminder Quick Action */}
        <View style={[styles.section, { backgroundColor: theme.colors.yellowCard }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <MaterialIcons name="alarm-add" size={28} color={theme.colors.warning} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.sectionTitle, { marginBottom: 4, color: theme.colors.heading }]}>Set Reminder</Text>
              <Text style={{ fontSize: 13, color: theme.colors.textSecondary }}>We will alert you 7 days before.</Text>
            </View>
            <TouchableOpacity
              style={styles.remindMeBtn}
              onPress={() => router.push('/reminders')}
            >
              <Text style={styles.remindMeText}>Notify Me</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Documents Section */}
        <View style={[styles.section, { marginBottom: 32 }]}>
          <Text style={styles.sectionTitle}>Required Documents</Text>
          {details.documents.map((doc, index) => (
            <View key={index} style={styles.listItem}>
              <MaterialIcons name="description" size={18} color={theme.colors.primary} />
              <Text style={styles.listText}>{doc}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky Apply Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.applyBtn}
          onPress={() => router.push(`/apply/${id}`)}
        >
          <Text style={styles.applyBtnText}>Start Application</Text>
          <MaterialIcons name="open-in-new" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
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
  headerTitle: { color: theme.colors.heading, fontSize: 18, fontWeight: 'bold', flex: 1 },
  backBtn: { padding: 4 },
  shareBtn: { padding: 4 },
  scroll: { padding: 20 },
  mainCard: {
    backgroundColor: theme.colors.surface, borderRadius: 24, padding: 24,
    ...theme.shadows.soft,
    marginBottom: 24
  },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  title: { fontSize: 22, fontWeight: 'bold', color: theme.colors.heading, marginBottom: 24, lineHeight: 30 },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 20 },
  infoItem: { width: '45%', marginBottom: 12 },
  infoLabel: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 4 },
  infoValue: { fontSize: 15, fontWeight: 'bold', color: theme.colors.heading, marginTop: 4 },
  section: { backgroundColor: theme.colors.surface, borderRadius: 24, padding: 24, marginBottom: 16 },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', color: theme.colors.heading, marginBottom: 14 },
  description: { fontSize: 14, color: theme.colors.textPrimary, lineHeight: 24 },
  highlightBox: { padding: 16, borderRadius: 12 },
  highlightText: { fontSize: 14, color: theme.colors.primaryDark, fontWeight: 'bold', lineHeight: 22 },
  listItem: { flexDirection: 'row', gap: 12, marginBottom: 12, alignItems: 'flex-start' },
  listText: { fontSize: 14, color: theme.colors.textPrimary, flex: 1, lineHeight: 20 },
  remindMeBtn: {
    backgroundColor: theme.colors.primary, paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 10,
  },
  remindMeText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: theme.colors.surface, padding: 20,
  },
  applyBtn: {
    backgroundColor: theme.colors.secondary, height: 56, borderRadius: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    ...theme.shadows.premium,
  },
  applyBtnText: { color: theme.colors.heading, fontSize: 16, fontWeight: 'bold' }
});
