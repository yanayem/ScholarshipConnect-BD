import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Platform, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { theme } from '../theme';

const { width } = Dimensions.get('window');

const MANUAL_SECTIONS = [
  {
    id: 'start',
    title: 'Getting Started',
    icon: 'launch',
    content: [
      { q: 'What is ScholarshipConnectBD?', a: 'It is a specialized platform designed to help Bangladeshi students secure international scholarships through data-driven matching and AI assistance.' },
      { q: 'How to use the app?', a: 'Start by completing your academic profile. The app will then automatically filter scholarships that match your CGPA and field of study.' },
    ]
  },
  {
    id: 'profile',
    title: 'Profile & CGPA',
    icon: 'person-search',
    content: [
      { q: 'Why is CGPA important?', a: 'Our Eligibility Checker uses your CGPA to tell you instantly if you qualify for a program. Keep it updated in "Edit Profile".' },
      { q: 'What is the Document Vault?', a: 'Go to Profile > Documents to upload your SOP, CV, and transcripts. You can then attach them to any application with one tap.' },
    ]
  },
  {
    id: 'ai',
    title: 'AI Assistant Guide',
    icon: 'auto-fix-high',
    content: [
      { q: 'How to generate an SOP?', a: 'Go to any scholarship detail page and tap "AI SOP Assistant". The AI will draft a tailored statement based on your profile and the program.' },
      { q: 'Is there a limit on AI usage?', a: 'Free users get 5 AI operations per day. Pro users get unlimited access. Limits reset every 24 hours.' },
    ]
  },
  {
    id: 'chat',
    title: 'Messenger & Chat',
    icon: 'chat',
    content: [
      { q: 'Can I edit my messages?', a: 'Yes! Long-press any message you sent to see the "Edit" option. Update the text and send again.' },
      { q: 'How to unsend a message?', a: 'Long-press a message and select "Unsend for everyone". It will be removed from both devices.' },
      { q: 'What do the checkmarks mean?', a: 'Single check (✓) means sent. Double check (✓✓) means the recipient has opened the chat.' },
    ]
  },
  {
    id: 'pro',
    title: 'ScholarConnect Pro',
    icon: 'workspace-premium',
    content: [
      { q: 'What are Pro benefits?', a: 'Unlimited AI tools, priority scholarship matching (up to 10 matches), and a verified gold badge.' },
      { q: 'How to upgrade?', a: 'You can upgrade via 200 ScholarPoints (earned by helping others) or a one-time payment of 500 BDT via bKash/Cards.' },
    ]
  },
  {
    id: 'help',
    title: 'Troubleshooting',
    icon: 'help-outline',
    content: [
      { q: 'App shows "Network Error"', a: 'Ensure your internet is stable. If you are using a local server, ensure your phone is on the same WiFi as your computer.' },
      { q: 'Forgot Password?', a: 'Go to the Login screen and tap "Forgot Password". We will send a secure reset link to your email.' },
      { q: 'Document upload failing?', a: 'Ensure your file size is under 5MB and is in PDF, JPG, or PNG format.' },
    ]
  }
];

export default function UserManualScreen() {
  const [expanded, setExpanded] = useState('start');

  const Section = ({ item }) => {
    const isExpanded = expanded === item.id;
    return (
      <View style={[styles.section, isExpanded && styles.sectionActive]}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => setExpanded(isExpanded ? null : item.id)}
          activeOpacity={0.7}
        >
          <View style={styles.headerLeft}>
            <View style={[styles.iconBox, { backgroundColor: isExpanded ? theme.colors.primary : theme.colors.background }]}>
              <MaterialIcons name={item.icon} size={20} color={isExpanded ? '#fff' : theme.colors.primary} />
            </View>
            <Text style={[styles.sectionTitle, isExpanded && { color: theme.colors.primary }]}>{item.title}</Text>
          </View>
          <MaterialIcons
            name={isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"}
            size={24}
            color={theme.colors.placeholder}
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.sectionBody}>
            {item.content.map((chat, idx) => (
              <View key={idx} style={styles.qaPair}>
                <Text style={styles.question}>{chat.q}</Text>
                <Text style={styles.answer}>{chat.a}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.heading} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Manual</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/community')} style={styles.supportBtn}>
          <Text style={styles.supportBtnText}>Ask Community</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.introBox}>
          <FontAwesome5 name="book-reader" size={40} color={theme.colors.primary} />
          <Text style={styles.introTitle}>How can we help you?</Text>
          <Text style={styles.introSub}>Find answers to common questions and learn how to navigate the platform like a pro.</Text>
        </View>

        <View style={styles.list}>
          {MANUAL_SECTIONS.map(section => (
            <Section key={section.id} item={section} />
          ))}
        </View>

        <View style={styles.footer}>
           <Text style={styles.footerText}>Still stuck? Contact our support team</Text>
           <Text style={styles.emailText}>support@scholarshipconnect.bd</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  header: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.heading, flex: 1, marginLeft: 12 },
  supportBtn: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  supportBtnText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  scroll: { padding: 20 },
  introBox: {
    alignItems: 'center',
    marginBottom: 30,
    padding: 20,
    backgroundColor: theme.colors.background,
    borderRadius: 24,
  },
  introTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.heading,
    marginTop: 16,
    marginBottom: 8,
  },
  introSub: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  list: { gap: 12 },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.divider,
    overflow: 'hidden',
  },
  sectionActive: {
    borderColor: theme.colors.primary,
    ...theme.shadows.soft,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  sectionBody: {
    padding: 16,
    paddingTop: 0,
    backgroundColor: '#FCFCFC',
  },
  qaPair: {
    marginBottom: 16,
  },
  question: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.heading,
    marginBottom: 4,
  },
  answer: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  emailText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginTop: 4,
  }
});
