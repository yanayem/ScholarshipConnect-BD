import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, Alert, StatusBar, Platform } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { apiService } from '../../services/api';

export default function MentorsScreen() {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const loadMentors = async () => {
    setLoading(true);
    const [mentorsRes, userRes] = await Promise.all([
      apiService.getMentors(),
      apiService.getProfile()
    ]);
    if (mentorsRes.ok) setMentors(mentorsRes.data);
    if (userRes.ok) setUser(userRes.data);
    setLoading(false);
  };

  useEffect(() => {
    loadMentors();
  }, []);

  const renderMentor = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, theme.shadows.soft]}
      onPress={() => router.push(`/mentorship/${item.user_id || item.user || item.id}`)}
    >
      <View style={styles.avatarContainer}>
        <Image
          source={{ uri: item.avatar_url || theme.images.avatar + (item.full_name || item.username) }}
          style={styles.avatar}
        />
        <View style={styles.badge}>
          <MaterialIcons name="verified" size={12} color="#fff" />
        </View>
      </View>

      <View style={styles.info}>
        <Text style={styles.name}>{item.full_name || item.username}</Text>
        <Text style={styles.expertise}>{item.expertise_areas || item.major_course || 'General Mentorship'}</Text>
        <Text style={styles.bio} numberOfLines={2}>{item.mentorship_bio || 'I can help you with your applications and SOP.'}</Text>

        <View style={styles.footer}>
           <View style={styles.tag}>
             <Text style={styles.tagText}>{item.university || 'Verified Mentor'}</Text>
           </View>
           <TouchableOpacity
             style={styles.requestBtn}
             onPress={() => router.push(`/mentorship/${item.user_id || item.user || item.id}`)}
           >
             <Text style={styles.requestBtnText}>View Profile</Text>
           </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
           <MaterialIcons name="arrow-back" size={24} color={theme.colors.heading} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mentorship Hub</Text>
      </View>

      <FlatList
        data={mentors}
        renderItem={renderMentor}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          !user?.is_mentor ? (
            <TouchableOpacity
              style={styles.joinMentorCard}
              onPress={() => router.push('/settings')}
            >
              <View style={styles.joinContent}>
                 <Text style={styles.joinTitle}>Are you an expert?</Text>
                 <Text style={styles.joinSub}>Join our mentor network and guide the next generation of scholars.</Text>
              </View>
              <View style={styles.joinBtn}>
                 <Text style={styles.joinBtnText}>Join Now</Text>
              </View>
            </TouchableOpacity>
          ) : null
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 100 }} />
          ) : (
            <View style={styles.empty}>
              <MaterialIcons name="people-outline" size={64} color={theme.colors.placeholder} />
              <Text style={styles.emptyText}>No mentors available right now.</Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  // ... existing styles ...
  joinMentorCard: {
    backgroundColor: theme.colors.heading,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...theme.shadows.soft
  },
  joinContent: { flex: 1, marginRight: 15 },
  joinTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  joinSub: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 4 },
  joinBtn: { backgroundColor: theme.colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  joinBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  header: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: theme.colors.divider
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.heading, marginLeft: 16 },
  list: { padding: 20 },
  card: {
    backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 16,
    flexDirection: 'row', alignItems: 'center'
  },
  avatarContainer: { position: 'relative' },
  avatar: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 24, fontWeight: 'bold', color: theme.colors.primary },
  badge: {
    position: 'absolute', bottom: 0, right: 0,
    backgroundColor: theme.colors.primary,
    width: 20, height: 20, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff'
  },
  info: { flex: 1, marginLeft: 16 },
  name: { fontSize: 16, fontWeight: 'bold', color: theme.colors.heading },
  expertise: { fontSize: 12, color: theme.colors.primary, fontWeight: '600', marginTop: 2 },
  bio: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 4, lineHeight: 18 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  tag: { backgroundColor: theme.colors.background, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  tagText: { fontSize: 10, color: theme.colors.textSecondary, fontWeight: 'bold' },
  requestBtn: { backgroundColor: theme.colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  requestBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  empty: { alignItems: 'center', marginTop: 100, gap: 16 },
  emptyText: { color: theme.colors.placeholder, fontSize: 15 }
});
