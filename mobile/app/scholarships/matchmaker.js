import React from 'react';
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, StatusBar, Platform } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { theme } from '../../theme';
import { apiService } from '../../services/api';

export default function MatchmakerScreen() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [profileSummary, setProfileSummary] = useState(null);

  const loadMatches = async () => {
    setLoading(true);
    try {
      const [res, profileRes] = await Promise.all([
        apiService.getScholarshipMatches(),
        apiService.getProfile()
      ]);

      if (profileRes.ok) setUser(profileRes.data);

      if (res && res.ok && res.data) {
        setRecommendations(res.data.recommendations || []);
        setProfileSummary(res.data.profile_summary || null);
      } else {
        console.warn('[MATCHMAKER] Failed to load matches:', res?.status);
      }
    } catch (e) {
      console.error('[MATCHMAKER] Error fetching matches:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Analyzing your profile with AI...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.heading} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Matchmaker</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.aiBanner}>
          <FontAwesome5 name="robot" size={40} color={theme.colors.primary} />
          <View style={styles.aiBannerContent}>
            <Text style={styles.aiBannerTitle}>Smart Suggestions</Text>
            {!user?.is_pro ? (
                <TouchableOpacity onPress={() => router.push('/upgrade-pro')}>
                    <Text style={[styles.aiBannerSub, { color: theme.colors.error, fontWeight: 'bold' }]}>
                        PRO FEATURE: Upgrade for 100% precision matching & hidden opportunities.
                    </Text>
                </TouchableOpacity>
            ) : (
                <Text style={styles.aiBannerSub}>NLP model is currently analyzing your deep profile.</Text>
            )}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Top Recommendations</Text>

        {recommendations.length > 0 ? (
          recommendations.map((item, index) => (
            <TouchableOpacity
              key={item.scholarship.id}
              style={[styles.matchCard, theme.shadows.soft]}
              onPress={() => router.push(`/scholarships/${item.scholarship.id}`)}
            >
              <View style={styles.matchHeader}>
                <View style={styles.matchScoreBadge}>
                  <Text style={styles.matchScoreText}>{item.match_score}% Match</Text>
                </View>
                {index === 0 && (
                  <View style={styles.bestMatchBadge}>
                    <Text style={styles.bestMatchText}>Best Fit</Text>
                  </View>
                )}
              </View>

              <View style={styles.cardContent}>
                <View style={styles.scholarshipInfo}>
                  <Text style={styles.scholarshipTitle}>{item.scholarship.title}</Text>
                  <Text style={styles.scholarshipProvider}>{item.scholarship.provider}</Text>

                  <View style={styles.tagRow}>
                    <View style={styles.tag}>
                      <MaterialIcons name="location-on" size={12} color={theme.colors.textSecondary} />
                      <Text style={styles.tagText}>{item.scholarship.country}</Text>
                    </View>
                    <View style={styles.tag}>
                      <MaterialIcons name="school" size={12} color={theme.colors.textSecondary} />
                      <Text style={styles.tagText}>{item.scholarship.level}</Text>
                    </View>
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={24} color={theme.colors.divider} />
              </View>

              <View style={styles.scoreBarContainer}>
                <View style={[styles.scoreBar, { width: `${item.match_score}%` }]} />
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="search-off" size={64} color={theme.colors.placeholder} />
            <Text style={styles.emptyText}>No matches found. Try updating your profile details.</Text>
            <TouchableOpacity
              style={styles.updateProfileBtn}
              onPress={() => router.push('/(tabs)/profile')}
            >
              <Text style={styles.updateProfileBtnText}>Update Profile</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  loadingText: { marginTop: 16, color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.medium },
  header: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: theme.colors.divider
  },
  backBtn: { marginRight: 16 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.heading },
  scroll: { padding: 20 },
  aiBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: theme.colors.primaryLight,
    padding: 20, borderRadius: 20, marginBottom: 24
  },
  aiBannerContent: { marginLeft: 16, flex: 1 },
  aiBannerTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.primaryDark },
  aiBannerSub: { fontSize: 13, color: theme.colors.primaryDark, opacity: 0.8 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.heading, marginBottom: 16 },
  matchCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.03)'
  },
  matchHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  matchScoreBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  matchScoreText: { color: '#2E7D32', fontSize: 12, fontWeight: 'bold' },
  bestMatchBadge: { backgroundColor: theme.colors.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  bestMatchText: { color: '#fff', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  cardContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  scholarshipInfo: { flex: 1 },
  scholarshipTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.heading, marginBottom: 4 },
  scholarshipProvider: { fontSize: 13, color: theme.colors.textSecondary, marginBottom: 10 },
  tagRow: { flexDirection: 'row', gap: 12 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tagText: { fontSize: 11, color: theme.colors.textSecondary },
  scoreBarContainer: { height: 4, backgroundColor: theme.colors.background, borderRadius: 2, marginTop: 16, overflow: 'hidden' },
  scoreBar: { height: '100%', backgroundColor: theme.colors.primary },
  emptyContainer: { alignItems: 'center', paddingVertical: 60, gap: 16 },
  emptyText: { color: theme.colors.placeholder, textAlign: 'center' },
  updateProfileBtn: { backgroundColor: theme.colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  updateProfileBtnText: { color: '#fff', fontWeight: 'bold' }
});
