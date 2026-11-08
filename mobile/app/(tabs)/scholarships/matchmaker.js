import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Platform,
  RefreshControl,
  useWindowDimensions
} from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../../theme';
import { apiService } from '../../../services/api';

export default function MatchmakerScreen() {
  const { width } = useWindowDimensions();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  const isTablet = width >= 768;

  const loadMatches = async (isPullToRefresh = false) => {
    if (isPullToRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [res, profileRes] = await Promise.all([
        apiService.getScholarshipMatches(),
        apiService.getProfile()
      ]);

      if (profileRes?.ok && profileRes.data) {
        setUser(profileRes.data);
      }

      if (res && res.ok && res.data) {
        setRecommendations(res.data.recommendations || []);
      } else {
        console.warn('[MATCHMAKER] Failed to load matches:', res?.status);
      }
    } catch (e) {
      console.error('[MATCHMAKER] Error fetching matches:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <StatusBar barStyle="dark-content" />
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingTitle}>Analyzing Your Profile</Text>
        <Text style={styles.loadingText}>Finding best matching scholarships...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel="Go back"
        >
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.heading} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Scholarship Matchmaker</Text>
          <Text style={styles.headerSubtitle}>
            {recommendations.length} match{recommendations.length === 1 ? '' : 'es'} found
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => loadMatches(true)}
          style={styles.refreshBtn}
          disabled={refreshing}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons name="refresh" size={22} color={theme.colors.heading} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          isTablet && styles.scrollTablet
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadMatches(true)}
            colors={[theme.colors.primary]}
          />
        }
      >
        {/* Simple Pro note / banner */}
        {!user?.is_pro ? (
          <TouchableOpacity
            style={styles.proCard}
            onPress={() => router.push('/upgrade-pro')}
            activeOpacity={0.8}
          >
            <View style={styles.proCardIconWrap}>
              <MaterialIcons name="auto-awesome" size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.proCardTextWrap}>
              <Text style={styles.proCardTitle}>Upgrade for 100% Precision</Text>
              <Text style={styles.proCardSub}>Unlock deep AI analysis & hidden matches</Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color={theme.colors.primary} />
          </TouchableOpacity>
        ) : null}

        {/* List of recommendations */}
        {recommendations.length > 0 ? (
          recommendations.map((item, index) => {
            const score = Math.round(item.match_score || 0);
            const isBestFit = index === 0 && score >= 70;

            return (
              <TouchableOpacity
                key={item.scholarship.id}
                style={[styles.card, theme.shadows.soft]}
                activeOpacity={0.7}
                onPress={() => router.push(`/scholarships/${item.scholarship.id}`)}
              >
                {/* Header row: score badge & best fit */}
                <View style={styles.cardHeaderRow}>
                  <View style={styles.scoreBadge}>
                    <Text style={styles.scoreBadgeText}>{score}% Match</Text>
                  </View>
                  {isBestFit && (
                    <View style={styles.bestFitBadge}>
                      <MaterialIcons name="star" size={12} color="#fff" />
                      <Text style={styles.bestFitText}>BEST FIT</Text>
                    </View>
                  )}
                </View>

                {/* Title & Provider */}
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {item.scholarship.title}
                </Text>
                <Text style={styles.cardProvider} numberOfLines={1}>
                  {item.scholarship.provider}
                </Text>

                {/* Details / Tags */}
                <View style={styles.metaRow}>
                  {item.scholarship.country ? (
                    <View style={styles.metaItem}>
                      <MaterialIcons name="location-on" size={14} color={theme.colors.textSecondary} />
                      <Text style={styles.metaText} numberOfLines={1}>
                        {item.scholarship.country}
                      </Text>
                    </View>
                  ) : null}
                  {item.scholarship.level ? (
                    <View style={styles.metaItem}>
                      <MaterialIcons name="school" size={14} color={theme.colors.textSecondary} />
                      <Text style={styles.metaText} numberOfLines={1}>
                        {item.scholarship.level}
                      </Text>
                    </View>
                  ) : null}
                </View>

                {/* Match bar */}
                <View style={styles.barBg}>
                  <View style={[styles.barFill, { width: `${Math.min(100, Math.max(5, score))}%` }]} />
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIconWrap}>
              <MaterialIcons name="search-off" size={40} color={theme.colors.placeholder} />
            </View>
            <Text style={styles.emptyTitle}>No Matches Found</Text>
            <Text style={styles.emptySub}>
              Update your profile with your education level, GPA, and target countries to get personalized recommendations.
            </Text>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => router.push('/(tabs)/profile')}
            >
              <Text style={styles.actionBtnText}>Update Profile</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 24
  },
  loadingTitle: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.heading
  },
  loadingText: {
    marginTop: 4,
    fontSize: 13,
    color: theme.colors.textSecondary
  },
  header: {
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 8 : 50,
    paddingHorizontal: 16,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  backBtn: {
    padding: 4,
    marginRight: 8
  },
  headerTitleWrap: {
    flex: 1
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.heading
  },
  headerSubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 1
  },
  refreshBtn: {
    padding: 6,
    borderRadius: 8
  },
  scroll: {
    padding: 16,
    paddingBottom: 36
  },
  scrollTablet: {
    maxWidth: 720,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 24
  },
  proCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E7FF'
  },
  proCardIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10
  },
  proCardTextWrap: {
    flex: 1
  },
  proCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.primaryDark || '#1E1B4B'
  },
  proCardSub: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  scoreBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0'
  },
  scoreBadgeText: {
    color: '#065F46',
    fontSize: 11,
    fontWeight: '700'
  },
  bestFitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  bestFitText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.heading,
    lineHeight: 20,
    marginBottom: 4
  },
  cardProvider: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 10
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  metaText: {
    fontSize: 11,
    color: theme.colors.textSecondary
  },
  barBg: {
    height: 4,
    backgroundColor: '#F1F5F9',
    borderRadius: 2,
    overflow: 'hidden'
  },
  barFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 2
  },
  emptyWrap: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 32,
    marginTop: 20
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.heading,
    marginBottom: 6
  },
  emptySub: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    maxWidth: 280
  },
  actionBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700'
  }
});
