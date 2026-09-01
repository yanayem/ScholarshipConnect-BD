import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator, Image } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import { apiService } from '../services/api';
import { cacheService } from '../services/cache';
import { useRouter } from 'expo-router';
import { Loader } from '../components/Loader';

export default function LeaderboardScreen() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    // 1. Try Cache First
    try {
      const cachedRankings = await cacheService.get('full_leaderboard');
      if (cachedRankings) {
        setData(cachedRankings);
        setLoading(false);
      }
    } catch (e) {}

    // 2. Fetch fresh data in the background
    try {
      const res = await apiService.getLeaderboard();
      if (res.ok) {
        setData(res.data);
        await cacheService.set('full_leaderboard', res.data, 60); // Cache for 60 mins
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader message="Loading Rankings..." />;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.heading} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Leaderboard</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.heroSection}>
          <MaterialIcons name="stars" size={80} color="#FFD700" />
          <Text style={styles.heroTitle}>Top Scholar Rankings</Text>
          <Text style={styles.heroSub}>Celebrate our most active contributors</Text>
        </View>

        <View style={styles.listCard}>
          {data.map((item, index) => (
            <View key={item.id} style={[styles.rankItem, index === data.length - 1 && { borderBottomWidth: 0 }]}>
              <View style={[
                styles.rankBadge,
                index === 0 && { backgroundColor: '#FFD700' },
                index === 1 && { backgroundColor: '#C0C0C0' },
                index === 2 && { backgroundColor: '#CD7F32' },
                index > 2 && { backgroundColor: theme.colors.primaryLight }
              ]}>
                <Text style={[styles.rankText, index > 2 && { color: theme.colors.primary }]}>{index + 1}</Text>
              </View>

              <View style={styles.avatar}>
                 {item.profile_picture || item.avatar_url ? (
                   <Image source={{ uri: item.profile_picture || item.avatar_url }} style={styles.avatarImg} />
                 ) : (
                   <Text style={styles.avatarText}>{(item.full_name || item.username || 'A')[0].toUpperCase()}</Text>
                 )}
              </View>

              <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>{item.full_name || item.username}</Text>
                <Text style={styles.level}>{item.academic_level || 'Member'}</Text>
              </View>

              <View style={styles.pointsBox}>
                <Text style={styles.points}>{item.scholar_points}</Text>
                <Text style={styles.pointsLabel}>pts</Text>
              </View>
            </View>
          ))}

          {data.length === 0 && (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No rankings available yet.</Text>
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  backBtn: {
    padding: 5,
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.heading,
  },
  scroll: {
    padding: 20,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.heading,
    marginTop: 15,
  },
  heroSub: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 5,
  },
  listCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 10,
    ...theme.shadows.premium,
  },
  rankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  rankText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    fontSize: 18,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.heading,
  },
  level: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  pointsBox: {
    alignItems: 'flex-end',
  },
  points: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  pointsLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: theme.colors.textSecondary,
  }
});
