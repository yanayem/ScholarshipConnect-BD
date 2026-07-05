import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, ScrollView,
  TouchableOpacity, StyleSheet, StatusBar, ActivityIndicator
} from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { apiService } from '../../services/api';

const ANNOUNCEMENTS = [];

const tagColor = { Hot: theme.colors.error, Popular: theme.colors.primary, New: theme.colors.success };

export default function HomeScreen() {
  const [search, setSearch] = useState('');
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const res = await apiService.getScholarships();
        if (res.ok && res.data) {
          const featuredOnly = res.data.filter(s => s.is_featured === true);
          setFeatured(featuredOnly);
        }
      } catch (error) {
        console.error('Failed to load featured scholarships', error);
      } finally {
        setLoading(false);
      }
    };
    loadFeatured();
  }, []);

  const statCards = [
    { icon: 'school', label: '500+', sub: 'Scholarships', bg: theme.colors.tealCard },
    { icon: 'public', label: '50+', sub: 'Countries', bg: theme.colors.lavenderCard },
    { icon: 'stars', label: '100+', sub: 'Stories', bg: theme.colors.peachCard, action: () => router.push('/blog') },
  ];

  return (
    <View style={styles.root}>
      <StatusBar backgroundColor={theme.colors.background} barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Search Bar & Notification */}
        <View style={styles.headerRow}>
          <View style={[styles.searchWrap, { flex: 1 }]}>
            <MaterialIcons name="search" size={20} color={theme.colors.placeholder} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search scholarships..."
              placeholderTextColor={theme.colors.placeholder}
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <TouchableOpacity
            style={styles.reminderIconBtn}
            onPress={() => router.push('/reminders')}
          >
            <MaterialIcons name="notifications-none" size={24} color={theme.colors.textPrimary} />
            <View style={styles.dot} />
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          {statCards.map((s, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.statCard, { backgroundColor: s.bg }]}
              onPress={s.action}
              activeOpacity={s.action ? 0.7 : 1}
            >
              <MaterialIcons name={s.icon} size={24} color={theme.colors.primary} />
              <Text style={styles.statNum}>{s.label}</Text>
              <Text style={styles.statSub}>{s.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Success Stories Preview */}
        <View style={styles.blogBanner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.blogBannerTitle}>Success Stories 🏆</Text>
            <Text style={styles.blogBannerSub}>Read how others got their scholarships.</Text>
            <TouchableOpacity
              style={styles.blogBtn}
              onPress={() => router.push('/blog')}
            >
              <Text style={styles.blogBtnText}>Read Blogs</Text>
              <MaterialIcons name="arrow-forward" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          <MaterialIcons name="auto-stories" size={60} color="rgba(255,255,255,0.2)" />
        </View>

        {/* Featured Scholarships */}
        <Text style={styles.sectionTitle}>Featured Scholarships</Text>
        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginVertical: 20 }} />
        ) : featured.filter(s =>
          s.title.toLowerCase().includes(search.toLowerCase())
        ).map(item => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => router.push(`/scholarships/${item.id}`)}
          >
            <View style={styles.cardTop}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              {item.is_featured ? (
                <View style={[styles.tag, { backgroundColor: tagColor['Hot'] }]}>
                  <Text style={styles.tagText}>Hot</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.cardMeta}>
              <MaterialIcons name="place" size={13} color={theme.colors.textSecondary} /> {item.country}
              {'   '}
              <MaterialIcons name="school" size={13} color={theme.colors.textSecondary} /> {item.level}
            </Text>
            <View style={styles.cardBottom}>
              <Text style={styles.cardDeadline}>
                <MaterialIcons name="event" size={13} color={theme.colors.error} /> Deadline: {item.deadline}
              </Text>
              <View style={styles.amountBadge}>
                <Text style={styles.amountText}>{item.amount}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
        {!loading && featured.length === 0 && (
          <Text style={{ textAlign: 'center', color: theme.colors.textSecondary, marginTop: 10 }}>No featured scholarships available.</Text>
        )}

        {/* Announcements */}
        {ANNOUNCEMENTS.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Latest Announcements</Text>
            {ANNOUNCEMENTS.map(a => (
              <View key={a.id} style={[styles.announcementCard, { backgroundColor: theme.colors.mintCard }]}>
                <MaterialIcons name="info-outline" size={20} color={theme.colors.primary} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.annoText}>{a.text}</Text>
                  <Text style={styles.annoTime}>{a.time}</Text>
                </View>
              </View>
            ))}
          </>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { paddingHorizontal: 20, paddingVertical: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: theme.colors.surface, borderRadius: 12,
    paddingHorizontal: 12,
  },
  reminderIconBtn: {
    backgroundColor: theme.colors.surface, padding: 10, borderRadius: 12,
    position: 'relative'
  },
  dot: {
    position: 'absolute', top: 10, right: 10,
    width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.error,
    borderWidth: 1.5, borderColor: '#fff'
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 48, fontSize: 15, color: theme.colors.textPrimary },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  statCard: {
    flex: 1, borderRadius: 20, alignItems: 'center',
    paddingVertical: 20, marginHorizontal: 4,
    ...theme.shadows.soft,
  },
  statNum: { fontSize: 18, fontWeight: 'bold', color: theme.colors.heading, marginTop: 8 },
  statSub: { fontSize: 11, color: theme.colors.textSecondary, marginTop: 2 },
  blogBanner: {
    backgroundColor: theme.colors.primary, borderRadius: 20, padding: 24,
    flexDirection: 'row', alignItems: 'center', marginBottom: 32,
    ...theme.shadows.premium,
  },
  blogBannerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  blogBannerSub: { fontSize: 14, color: 'rgba(255,255,255,0.85)', marginTop: 4, marginBottom: 16 },
  blogBtn: {
    backgroundColor: theme.colors.primaryDark, alignSelf: 'flex-start',
    paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10,
    flexDirection: 'row', alignItems: 'center', gap: 8
  },
  blogBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.heading, marginBottom: 16, marginTop: 8 },
  card: {
    backgroundColor: theme.colors.surface, borderRadius: 20, padding: 20, marginBottom: 14,
    ...theme.shadows.premium,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  cardTitle: { flex: 1, fontSize: 16, fontWeight: 'bold', color: theme.colors.heading },
  tag: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginLeft: 8 },
  tagText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  cardMeta: { fontSize: 13, color: theme.colors.textSecondary, marginBottom: 12 },
  cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardDeadline: { fontSize: 13, color: theme.colors.error, fontWeight: '500' },
  amountBadge: { backgroundColor: theme.colors.tealCard, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  amountText: { color: theme.colors.primary, fontWeight: 'bold', fontSize: 12 },
  announcementCard: {
    flexDirection: 'row', alignItems: 'flex-start',
    borderRadius: 16, padding: 16, marginBottom: 12,
  },
  annoText: { fontSize: 14, color: theme.colors.textPrimary, lineHeight: 20, fontWeight: '500' },
  annoTime: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 4 },
});
