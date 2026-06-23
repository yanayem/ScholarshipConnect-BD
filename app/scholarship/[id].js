import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, Share
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

// Mock data based on the ID
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
  // Default fallback for other IDs
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
      <StatusBar barStyle="light-content" backgroundColor="#1565C0" />

      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Scholarship Details</Text>
        <TouchableOpacity onPress={onShare} style={styles.shareBtn}>
          <MaterialIcons name="share" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Basic Info Card */}
        <View style={styles.mainCard}>
          <View style={styles.badgeRow}>
            <View style={[styles.statusBadge, { backgroundColor: '#E8F5E9' }]}>
              <Text style={{ color: '#2E7D32', fontWeight: 'bold', fontSize: 12 }}>Open</Text>
            </View>
            <TouchableOpacity>
              <MaterialIcons name="bookmark-border" size={24} color="#1565C0" />
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>{details.title}</Text>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <MaterialIcons name="public" size={20} color="#607D8B" />
              <Text style={styles.infoLabel}>Country</Text>
              <Text style={styles.infoValue}>{details.country}</Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialIcons name="school" size={20} color="#607D8B" />
              <Text style={styles.infoLabel}>Level</Text>
              <Text style={styles.infoValue}>{details.level}</Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialIcons name="payments" size={20} color="#607D8B" />
              <Text style={styles.infoLabel}>Amount</Text>
              <Text style={styles.infoValue}>{details.amount}</Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialIcons name="event" size={20} color="#E53935" />
              <Text style={styles.infoLabel}>Deadline</Text>
              <Text style={[styles.infoValue, { color: '#E53935' }]}>{details.deadline}</Text>
            </View>
          </View>
        </View>

        {/* Description Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About this Scholarship</Text>
          <Text style={styles.description}>{details.description}</Text>
        </View>

        {/* Benefits Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Benefits</Text>
          <View style={styles.highlightBox}>
             <Text style={styles.highlightText}>{details.benefits}</Text>
          </View>
        </View>

        {/* Eligibility Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✅ Eligibility Criteria</Text>
          {details.eligibility.map((item, index) => (
            <View key={index} style={styles.listItem}>
              <MaterialIcons name="check-circle" size={18} color="#2E7D32" />
              <Text style={styles.listText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* Deadline Reminder Quick Action */}
        <View style={[styles.section, { backgroundColor: '#FFF3E0' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <MaterialIcons name="alarm-add" size={28} color="#E65100" />
            <View style={{ flex: 1 }}>
              <Text style={[styles.sectionTitle, { marginBottom: 4, color: '#E65100' }]}>Set Deadline Reminder</Text>
              <Text style={{ fontSize: 13, color: '#EF6C00' }}>Get notified before this scholarship closes.</Text>
            </View>
            <TouchableOpacity
              style={styles.remindMeBtn}
              onPress={() => router.push('/reminders')}
            >
              <Text style={styles.remindMeText}>Set Now</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Documents Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📄 Required Documents</Text>
          {details.documents.map((doc, index) => (
            <View key={index} style={styles.listItem}>
              <MaterialIcons name="description" size={18} color="#1565C0" />
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
          <Text style={styles.applyBtnText}>Apply Now</Text>
          <MaterialIcons name="open-in-new" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
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
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', flex: 1 },
  backBtn: { padding: 4 },
  shareBtn: { padding: 4 },
  scroll: { padding: 16 },
  mainCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 20,
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8,
    marginBottom: 20
  },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1A237E', marginBottom: 20 },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  infoItem: { width: '45%', marginBottom: 10 },
  infoLabel: { fontSize: 12, color: '#90A4AE', marginTop: 4 },
  infoValue: { fontSize: 14, fontWeight: '700', color: '#263238', marginTop: 2 },
  section: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16 },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', color: '#1A237E', marginBottom: 12 },
  description: { fontSize: 14, color: '#455A64', lineHeight: 22 },
  highlightBox: { backgroundColor: '#E3F2FD', padding: 12, borderRadius: 10 },
  highlightText: { fontSize: 14, color: '#1565C0', fontWeight: '600', lineHeight: 20 },
  listItem: { flexDirection: 'row', gap: 10, marginBottom: 8, alignItems: 'flex-start' },
  listText: { fontSize: 14, color: '#455A64', flex: 1 },
  remindMeBtn: {
    backgroundColor: '#E65100', paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 8, elevation: 2
  },
  remindMeText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff', padding: 16, borderTopWidth: 1, borderTopColor: '#E0E0E0'
  },
  applyBtn: {
    backgroundColor: '#1565C0', height: 56, borderRadius: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8
  },
  applyBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
