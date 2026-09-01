import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';

export default function PrivacyPolicyScreen() {
  const sections = [
    {
      title: '1. Information We Collect',
      content: 'We collect information that you provide directly to us when you register, create a profile, or use our services.',
      subsections: [
        { name: 'Personal Information', items: ['Account Data: Name, email, username, profile picture.', 'Contact Details: Phone number and social media links.', 'Identity Verification: Firebase UID and tokens.'] },
        { name: 'Academic Information', items: ['Academic Records: University, department, CGPA.', 'Test Scores: IELTS and GRE scores.', 'Academic Interests: Major, research interests, and target countries.'] },
        { name: 'User Content', items: ['Documents: Certificates, SOPs, CVs uploaded to Vault.', 'Community Data: Forum posts, comments, polls.', 'Messages: Direct messages between users.'] }
      ]
    },
    {
      title: '2. How We Use Your Information',
      content: 'We use the collected information for various purposes, including:',
      items: [
        'AI Matchmaking: Using NLP to match your profile with scholarships.',
        'Mentorship Sessions: Facilitating 1-on-1 bookings.',
        'Scholarship Discovery: Providing personalized recommendations.',
        'Application Tracking: Managing saved scholarships and reminders.',
        'Gamification: Managing "ScholarPoints" earned.',
        'Pro Features: Verifying subscription status.'
      ]
    },
    {
      title: '3. Sharing Your Information',
      content: 'We do not sell your data. We share information only in the following cases:',
      items: [
        'With Mentors: If you book a session, mentors see your profile.',
        'With Admins: Staff members review submissions and reports.',
        'AI Providers: Processing data through models (e.g., Google Gemini).',
        'Payment Processor: Securely processed via SSLCommerz.'
      ]
    },
    {
      title: '4. Data Security & Storage',
      content: 'We use industry-standard encryption and secure cloud providers:',
      items: [
        'Database: MongoDB Atlas with encryption.',
        'Media Storage: Cloudinary for images and documents.',
        'Authentication: Secured by Firebase Auth.',
        'Data Retention: Retained while account is active.'
      ]
    },
    {
      title: '5. Your Privacy Rights',
      content: 'You have the right to access, export, update, or delete your data at any time via the Profile section or by contacting support.'
    }
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.heading} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Privacy Policy</Text>
          <Text style={styles.headerSub}>Last Updated: May 20, 2024</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.introBox}>
          <Ionicons name="shield-checkmark" size={40} color={theme.colors.primary} />
          <Text style={styles.introText}>
            Your privacy is our priority. This policy explains how ScholarshipConnectBD
            protects your data while you discover global opportunities.
          </Text>
        </View>

        {sections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionContent}>{section.content}</Text>

            {section.subsections && section.subsections.map((sub, sIdx) => (
              <View key={sIdx} style={styles.subsection}>
                <Text style={styles.subsectionName}>{sub.name}</Text>
                {sub.items.map((item, iIdx) => (
                  <View key={iIdx} style={styles.listItem}>
                    <View style={styles.dot} />
                    <Text style={styles.listItemText}>{item}</Text>
                  </View>
                ))}
              </View>
            ))}

            {section.items && section.items.map((item, iIdx) => (
              <View key={iIdx} style={styles.listItem}>
                <View style={styles.dot} />
                <Text style={styles.listItemText}>{item}</Text>
              </View>
            ))}
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={styles.footerTitle}>Contact Us</Text>
          <Text style={styles.footerText}>Team ScholarshipConnectBD</Text>
          <Text style={styles.footerText}>Dept. of CSE, BUBT</Text>
          <TouchableOpacity onPress={() => {}}>
            <Text style={styles.emailText}>support@scholarshipconnect.bd</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
    backgroundColor: '#fff',
  },
  backButton: { marginRight: 16, padding: 4 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: theme.colors.heading },
  headerSub: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
  scroll: { padding: 20 },
  introBox: {
    backgroundColor: theme.colors.primaryLight,
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 30,
  },
  introText: {
    textAlign: 'center',
    fontSize: 14,
    color: theme.colors.primaryDark,
    lineHeight: 20,
    marginTop: 12,
    fontWeight: '500',
  },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.heading, marginBottom: 12 },
  sectionContent: { fontSize: 15, color: theme.colors.textPrimary, lineHeight: 22, marginBottom: 12 },
  subsection: { marginTop: 12, marginLeft: 10, marginBottom: 10 },
  subsectionName: { fontSize: 14, fontWeight: 'bold', color: theme.colors.primary, marginBottom: 8 },
  listItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8, paddingRight: 10 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: theme.colors.primary, marginTop: 8, marginRight: 12 },
  listItemText: { flex: 1, fontSize: 14, color: theme.colors.textSecondary, lineHeight: 20 },
  footer: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
    paddingTop: 30,
    alignItems: 'center',
  },
  footerTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.heading, marginBottom: 8 },
  footerText: { fontSize: 14, color: theme.colors.textSecondary, marginBottom: 4 },
  emailText: { fontSize: 14, color: theme.colors.primary, fontWeight: 'bold', marginTop: 4 },
});
