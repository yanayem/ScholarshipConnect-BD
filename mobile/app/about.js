import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, StatusBar, Platform, Linking } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons, FontAwesome5, Feather, Entypo } from '@expo/vector-icons';
import { theme } from '../theme';

const teamMembers = [
  {
    id: '20245103-160',
    name: 'Yeasin Arafat Nayem',
    designation: 'Team Leader / Frontend Dev',
    responsibilities: 'Project coordination, React Native UI architecture, NativeWind styling, scholarship listing & eligibility checker screens',
    github: 'https://github.com/yanayem',
    instagram: 'https://www.instagram.com/itsblackbang',
    linkedin: 'https://www.linkedin.com/in/yeasin-arafat-nayem-bhuiyan',
    icon: 'crown'
  },
  {
    id: '20245103-133',
    name: 'S.M. Azman Sikder Durjay',
    designation: 'Co-Leader / Backend Dev',
    responsibilities: 'Django REST API design, JWT authentication, Google OAuth2 integration',
    github: 'https://github.com/azmansikder',
    instagram: 'https://www.instagram.com/amazmas_d',
    linkedin: 'https://www.linkedin.com/in/azman-sikder-600213229/',
    icon: 'server'
  },
  {
    id: '20245103-139',
    name: 'Mostar-Shid Billah',
    designation: 'Frontend Developer',
    responsibilities: 'Application tracker UI, document management screens, deadline reminder & notification UI',
    github: 'https://github.com/mostarshid',
    instagram: 'https://www.instagram.com/_mostar_shid_',
    linkedin: 'https://www.linkedin.com/in/mostar-shid-billah-a231572bb/',
    icon: 'code'
  },
  {
    id: '20245103-151',
    name: 'Shudipto Ghosh',
    designation: 'Backend Developer',
    responsibilities: 'Scholarship listing API, Cloudinary integration, community discussion & mentor network API, FCM notifications',
    github: 'https://github.com/shudiptoghosh',
    instagram: 'https://www.instagram.com/shudipto_bond_009/',
    linkedin: null,
    icon: 'database'
  },
  {
    id: '20245103-143',
    name: 'Dipta Dey',
    designation: 'QA Engineer / Database Admin',
    responsibilities: 'MongoDB schema design, database management, end-to-end testing, bug fixing, cloud deployment',
    github: 'https://github.com/Dipto-04',
    instagram: 'https://www.instagram.com/_.yukaze._?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==',
    linkedin: 'https://www.linkedin.com/in/dipta-dey-7ab029309/',
    icon: 'shield-alt'
  }
];

export default function AboutScreen() {
  const openLink = (url) => {
    if (!url) return;
    Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.heading} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About Developers</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.projectIntro}>
          <Text style={styles.projectName}>ScholarshipConnect BD</Text>
          <Text style={styles.projectTagline}>Empowering Dreams through Education</Text>
        </View>

        <Text style={styles.sectionTitle}>Meet the Team</Text>

        {teamMembers.map((member, index) => (
          <View key={index} style={[styles.memberCard, theme.shadows.soft]}>
            <View style={styles.memberHeader}>
              <View style={[styles.iconContainer, { backgroundColor: index === 0 ? theme.colors.primary : theme.colors.primaryLight }]}>
                <FontAwesome5 name={member.icon} size={20} color={index === 0 ? '#fff' : theme.colors.primary} />
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberDesignation}>{member.designation}</Text>
              </View>
            </View>

            <View style={styles.socialRow}>
              <TouchableOpacity onPress={() => openLink(member.github)} style={styles.socialBtn}>
                <Feather name="github" size={18} color={theme.colors.heading} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => openLink(member.linkedin)} style={[styles.socialBtn, !member.linkedin && { opacity: 0.3 }]}>
                <Entypo name="linkedin" size={18} color="#0077b5" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => openLink(member.instagram)} style={styles.socialBtn}>
                <Entypo name="instagram" size={18} color="#e4405f" />
              </TouchableOpacity>
              <View style={{ flex: 1 }} />
              <View style={styles.idBadge}>
                 <Text style={styles.idText}>ID: {member.id.split('-')[1]}</Text>
              </View>
            </View>

            <View style={styles.detailsRow}>
              <Text style={styles.detailLabel}>Full Student ID:</Text>
              <Text style={styles.detailValue}>{member.id}</Text>
            </View>

            <View style={styles.responsibilitiesBox}>
              <Text style={styles.responsibilitiesTitle}>Responsibilities:</Text>
              <Text style={styles.responsibilitiesText}>{member.responsibilities}</Text>
            </View>
          </View>
        ))}

        <View style={styles.supervisorCard}>
          <View style={styles.supervisorBadge}>
            <Text style={styles.supervisorBadgeText}>SUPERVISED BY</Text>
          </View>
          <Text style={styles.supervisorName}>Jahid Tanvir</Text>
          <Text style={styles.supervisorTitle}>Lecturer, Dept. of CSE</Text>
          <Text style={styles.supervisorDept}>BUBT</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
          <Text style={styles.copyText}>© 2024 ScholarshipConnect BD Team</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
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
  scrollContent: { padding: 20 },
  projectIntro: { alignItems: 'center', marginBottom: 30 },
  projectName: { fontSize: 24, fontWeight: 'bold', color: theme.colors.primary },
  projectTagline: { fontSize: 14, color: theme.colors.textSecondary, marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.heading, marginBottom: 16 },
  memberCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary
  },
  memberHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 16, fontWeight: 'bold', color: theme.colors.heading },
  memberDesignation: { fontSize: 13, color: theme.colors.primary, fontWeight: '600' },
  socialRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  socialBtn: { padding: 8, backgroundColor: theme.colors.background, borderRadius: 8 },
  idBadge: { backgroundColor: theme.colors.primaryLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  idText: { fontSize: 10, fontWeight: 'bold', color: theme.colors.primary },
  detailsRow: { flexDirection: 'row', marginBottom: 8 },
  detailLabel: { fontSize: 12, color: theme.colors.textSecondary, width: 100 },
  detailValue: { fontSize: 12, color: theme.colors.textPrimary, fontWeight: '600' },
  responsibilitiesBox: { backgroundColor: theme.colors.background, padding: 10, borderRadius: 8 },
  responsibilitiesTitle: { fontSize: 12, fontWeight: 'bold', color: theme.colors.textPrimary, marginBottom: 4 },
  responsibilitiesText: { fontSize: 12, color: theme.colors.textSecondary, lineHeight: 18 },
  supervisorCard: {
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30
  },
  supervisorBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 12
  },
  supervisorBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  supervisorName: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  supervisorTitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  supervisorDept: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  footer: { alignItems: 'center', marginBottom: 20 },
  versionText: { fontSize: 12, color: theme.colors.placeholder },
  copyText: { fontSize: 12, color: theme.colors.placeholder, marginTop: 4 }
});
