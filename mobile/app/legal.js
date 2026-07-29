import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { theme } from '../theme';

export default function LegalScreen() {
  const { type } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState(type || 'privacy');

  const content = {
    privacy: {
      title: 'Privacy Policy',
      lastUpdated: 'October 24, 2024',
      sections: [
        {
          title: '1. Information We Collect',
          content: 'We collect information you provide directly to us, such as when you create an account, update your profile (including academic records like CGPA), or apply for a scholarship. This includes your name, email, phone number, and educational background.'
        },
        {
          title: '2. How We Use Your Information',
          content: 'We use the information we collect to provide, maintain, and improve our services, including matching you with relevant scholarships and connecting you with mentors.'
        },
        {
          title: '3. Data Sharing',
          content: 'We do not share your personal information with third parties except as described in this policy, such as when you apply for a scholarship or when required by law.'
        },
        {
          title: '4. Security',
          content: 'We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access. We use Firebase Authentication to ensure secure login.'
        }
      ]
    },
    terms: {
      title: 'Terms of Use',
      lastUpdated: 'October 24, 2024',
      sections: [
        {
          title: '1. Acceptance of Terms',
          content: 'By accessing or using ScholarshipConnect BD, you agree to be bound by these Terms of Use and all applicable laws and regulations.'
        },
        {
          title: '2. User Accounts',
          content: 'You are responsible for maintaining the confidentiality of your account and password and for restricting access to your mobile device.'
        },
        {
          title: '3. Content Standards',
          content: 'Users must not post any content that is defamatory, obscene, or violates any laws. Our moderation center monitors community discussions to ensure these standards are met.'
        },
        {
          title: '4. Scholarship Applications',
          content: 'ScholarshipConnect BD provides information about scholarships but does not guarantee the success of any application. All applications are subject to the provider\'s terms.'
        }
      ]
    },
    updates: {
      title: 'App Updates',
      lastUpdated: 'Version 1.2.0 (Stable)',
      sections: [
        {
          title: 'What\'s New in v1.2.0',
          content: '• New "About Developers" page with social links\n• Integrated Onboarding/Intro screens for new users\n• Improved Profile Sidebar menu with modern Instagram-style drawer\n• Enhanced security with Firebase Auth token refreshing'
        },
        {
          title: 'Coming Soon',
          content: '• AI-powered CV reviewer\n• Direct real-time chat with Mentors\n• Multi-language support (Bangla/English)'
        }
      ]
    }
  };

  const activeData = content[activeTab];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.heading} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{activeData.title}</Text>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'privacy' && styles.activeTab]}
          onPress={() => setActiveTab('privacy')}
        >
          <Text style={[styles.tabText, activeTab === 'privacy' && styles.activeTabText]}>Privacy</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'terms' && styles.activeTab]}
          onPress={() => setActiveTab('terms')}
        >
          <Text style={[styles.tabText, activeTab === 'terms' && styles.activeTabText]}>Terms</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'updates' && styles.activeTab]}
          onPress={() => setActiveTab('updates')}
        >
          <Text style={[styles.tabText, activeTab === 'updates' && styles.activeTabText]}>Updates</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.lastUpdated}>Last Updated: {activeData.lastUpdated}</Text>

        {activeData.sections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionContent}>{section.content}</Text>
          </View>
        ))}

        <View style={styles.contactInfo}>
          <Text style={styles.contactTitle}>Have questions?</Text>
          <Text style={styles.contactText}>Contact us at support@scholarshipconnect.bd</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.heading, marginLeft: 16 },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: theme.colors.background
  },
  activeTab: {
    backgroundColor: theme.colors.primary
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary
  },
  activeTabText: {
    color: '#fff'
  },
  scrollContent: { padding: 20 },
  lastUpdated: {
    fontSize: 12,
    color: theme.colors.placeholder,
    marginBottom: 24
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.heading,
    marginBottom: 8
  },
  sectionContent: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    lineHeight: 22
  },
  contactInfo: {
    marginTop: 20,
    padding: 20,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: 16,
    alignItems: 'center'
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 4
  },
  contactText: {
    fontSize: 13,
    color: theme.colors.primaryDark
  }
});
