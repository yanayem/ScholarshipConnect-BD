import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, StatusBar, Platform, Linking } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { MaterialIcons, FontAwesome5, Ionicons, Feather } from '@expo/vector-icons';
import { theme } from '../../theme';
import { apiService } from '../../services/api';
import { Loader } from '../../components/Loader';

export default function MentorProfileScreen() {
  const { id } = useLocalSearchParams();
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMentorDetails = async () => {
      // Since we don't have a specific getMentorById, we'll find him in the list
      // Or if the backend profile returns a user, we use that.
      // For now, let's try to get profile of that user id.
      try {
        const res = await apiService.getMentors();
        if (res.ok) {
          const found = res.data.find(m => (m.user_id || m.user || m.id).toString() === id.toString());
          setMentor(found);
        }
      } catch (error) {
        console.error('Failed to load mentor profile', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMentorDetails();
  }, [id]);

  if (loading) return <Loader message="Loading mentor profile..." />;
  if (!mentor) return (
    <View style={styles.errorContainer}>
      <Text>Mentor not found</Text>
      <TouchableOpacity onPress={() => router.back()}><Text style={{color: theme.colors.primary, marginTop: 10}}>Go Back</Text></TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.heading} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mentor Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.topSection}>
          <View style={styles.avatarWrapper}>
            <Image
              source={{ uri: mentor.avatar_url || theme.images.avatar + mentor.full_name }}
              style={styles.avatar}
            />
            <View style={styles.verifiedBadge}>
              <MaterialIcons name="verified" size={20} color="#fff" />
            </View>
          </View>

          <Text style={styles.name}>{mentor.full_name || mentor.username}</Text>
          <Text style={styles.major}>{mentor.major_course || mentor.university || 'Expert Mentor'}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>4.9</Text>
              <Text style={styles.statLab}>Rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statVal}>50+</Text>
              <Text style={styles.statLab}>Sessions</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statVal}>12</Text>
              <Text style={styles.statLab}>Reviews</Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionTitle}>About Mentor</Text>
          <Text style={styles.bioText}>
            {mentor.mentorship_bio || mentor.bio || "Hello! I am a verified mentor on ScholarshipConnectBD. I specialize in helping students navigate their higher education journey."}
          </Text>

          <Text style={styles.sectionTitle}>Expertise Areas</Text>
          <View style={styles.tagsContainer}>
            {(mentor.expertise_areas || mentor.research_interests || "General, SOP, CV").split(',').map((tag, i) => (
              <View key={i} style={styles.tagBadge}>
                <Text style={styles.tagText}>{tag.trim()}</Text>
              </View>
            ))}
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <MaterialIcons name="school" size={20} color={theme.colors.primary} />
              <View style={styles.infoTexts}>
                <Text style={styles.infoLabel}>University</Text>
                <Text style={styles.infoValue}>{mentor.university || 'Not Specified'}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons name="language" size={20} color={theme.colors.primary} />
              <View style={styles.infoTexts}>
                <Text style={styles.infoLabel}>Target Countries</Text>
                <Text style={styles.infoValue}>{mentor.target_countries || 'Global'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.socialGrid}>
            {mentor.linkedin_url && (
              <TouchableOpacity style={styles.socialBtn} onPress={() => Linking.openURL(mentor.linkedin_url)}>
                <FontAwesome5 name="linkedin" size={20} color="#0077b5" />
              </TouchableOpacity>
            )}
            {mentor.github_url && (
              <TouchableOpacity style={styles.socialBtn} onPress={() => Linking.openURL(mentor.github_url)}>
                <FontAwesome5 name="github" size={20} color="#333" />
              </TouchableOpacity>
            )}
            {mentor.google_scholar_url && (
              <TouchableOpacity style={styles.socialBtn} onPress={() => Linking.openURL(mentor.google_scholar_url)}>
                <FontAwesome5 name="google" size={18} color="#4285F4" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.messageBtn}
          onPress={() => router.push({
            pathname: `/messages/${mentor.user_id || mentor.user || mentor.id}`,
            params: { name: mentor.full_name || mentor.username, avatar: mentor.avatar_url }
          })}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={24} color={theme.colors.primary} />
          <Text style={styles.messageBtnText}>Message</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bookBtn}
          onPress={() => router.push({
            pathname: '/mentorship/request',
            params: { mentorId: mentor.user_id || mentor.user || mentor.id, mentorName: mentor.full_name }
          })}
        >
          <Text style={styles.bookBtnText}>Book Session</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 50 : 40, paddingBottom: 15,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: theme.colors.divider
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.heading },
  backBtn: { padding: 5 },
  topSection: { alignItems: 'center', padding: 30, backgroundColor: '#fff', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, ...theme.shadows.soft },
  avatarWrapper: { position: 'relative' },
  avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: theme.colors.primaryLight },
  verifiedBadge: { position: 'absolute', bottom: 5, right: 5, backgroundColor: theme.colors.primary, width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#fff' },
  name: { fontSize: 24, fontWeight: 'bold', color: theme.colors.heading, marginTop: 15 },
  major: { fontSize: 16, color: theme.colors.primary, fontWeight: '600', marginTop: 4 },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 25, width: '100%', justifyContent: 'center' },
  statBox: { alignItems: 'center', flex: 1 },
  statVal: { fontSize: 18, fontWeight: 'bold', color: theme.colors.heading },
  statLab: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: theme.colors.divider },
  content: { padding: 25 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.heading, marginBottom: 12, marginTop: 10 },
  bioText: { fontSize: 15, color: theme.colors.textPrimary, lineHeight: 24, opacity: 0.8 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 5 },
  tagBadge: { backgroundColor: theme.colors.primaryLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  tagText: { color: theme.colors.primary, fontSize: 12, fontWeight: 'bold' },
  infoCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginTop: 20, ...theme.shadows.soft },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  infoTexts: { marginLeft: 15 },
  infoLabel: { fontSize: 12, color: theme.colors.textSecondary },
  infoValue: { fontSize: 14, fontWeight: 'bold', color: theme.colors.heading, marginTop: 2 },
  socialGrid: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 20 },
  socialBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', ...theme.shadows.soft },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', padding: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 20, flexDirection: 'row', gap: 15, borderTopWidth: 1, borderTopColor: theme.colors.divider },
  messageBtn: { flex: 1, height: 55, borderRadius: 15, borderWidth: 1.5, borderColor: theme.colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  messageBtnText: { color: theme.colors.primary, fontWeight: 'bold', fontSize: 16 },
  bookBtn: { flex: 2, height: 55, borderRadius: 15, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center', ...theme.shadows.teal },
  bookBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' }
});
