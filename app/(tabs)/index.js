import { useState } from 'react';
import {
  View, Text, TextInput, ScrollView,
  TouchableOpacity, StyleSheet, StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';

const FEATURED = [
  { id: '1', title: 'Japanese Government (MEXT) Scholarship', country: '🇯🇵 Japan', level: 'Masters / PhD', deadline: 'May 2025', amount: 'Full Funded', tag: 'Hot' },
  { id: '2', title: 'Chevening Scholarship UK', country: '🇬🇧 United Kingdom', level: 'Masters', deadline: 'Nov 2025', amount: 'Full Funded', tag: 'Popular' },
  { id: '3', title: 'Erasmus Mundus Joint Masters', country: '🇪🇺 Europe', level: 'Masters', deadline: 'Jan 2026', amount: 'Full Funded', tag: 'New' },
  { id: '4', title: 'DAAD Scholarship Germany', country: '🇩🇪 Germany', level: 'Masters / PhD', deadline: 'Oct 2025', amount: 'Full Funded', tag: '' },
];

const ANNOUNCEMENTS = [
  { id: '1', text: 'MEXT 2025 application window is now open!', time: '2h ago' },
  { id: '2', text: 'New Australian Awards scholarships added.', time: '1d ago' },
  { id: '3', text: 'Chevening deadline extended to Nov 5.', time: '3d ago' },
];

const tagColor = { Hot: theme.colors.error, Popular: theme.colors.primary, New: theme.colors.success };

export default function HomeScreen() {
  const [search, setSearch] = useState('');

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
        {FEATURED.filter(s =>
          s.title.toLowerCase().includes(search.toLowerCase())
        ).map(item => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => router.push(`/scholarship/${item.id}`)}
          >
            <View style={styles.cardTop}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              {item.tag ? (
                <View style={[styles.tag, { backgroundColor: tagColor[item.tag] }]}>
                  <Text style={styles.tagText}>{item.tag}</Text>
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

        {/* Announcements */}
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
