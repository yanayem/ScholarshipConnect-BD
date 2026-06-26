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

const tagColor = { Hot: '#E53935', Popular: '#C97352', New: '#2E7D32' };

export default function HomeScreen() {
  const [search, setSearch] = useState('');

  return (
    <View style={styles.root}>
      <StatusBar backgroundColor="#C97352" barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Search Bar & Notification */}
        <View style={styles.headerRow}>
          <View style={[styles.searchWrap, { flex: 1 }]}>
            <MaterialIcons name="search" size={22} color={theme.colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search scholarships..."
              placeholderTextColor={theme.colors.textSecondary}
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <TouchableOpacity
            style={styles.reminderIconBtn}
            onPress={() => router.push('/reminders')}
          >
            <MaterialIcons name="notifications-active" size={26} color="#C97352" />
            <View style={styles.dot} />
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          {[
            { icon: 'school', label: '500+', sub: 'Scholarships' },
            { icon: 'public', label: '50+', sub: 'Countries' },
            { icon: 'stars', label: '100+', sub: 'Stories', action: () => router.push('/blog') },
          ].map((s, i) => (
            <TouchableOpacity
              key={i}
              style={styles.statCard}
              onPress={s.action}
              activeOpacity={s.action ? 0.7 : 1}
            >
              <MaterialIcons name={s.icon} size={26} color="#C97352" />
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
          <MaterialIcons name="auto-stories" size={60} color="rgba(255,255,255,0.3)" />
        </View>

        {/* Featured Scholarships */}
        <Text style={styles.sectionTitle}>⭐ Featured Scholarships</Text>
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
                <MaterialIcons name="event" size={13} color="#E53935" /> Deadline: {item.deadline}
              </Text>
              <View style={styles.amountBadge}>
                <Text style={styles.amountText}>{item.amount}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {/* Announcements */}
        <Text style={styles.sectionTitle}>📢 Latest Announcements</Text>
        {ANNOUNCEMENTS.map(a => (
          <View key={a.id} style={styles.announcementCard}>
            <MaterialIcons name="notifications" size={20} color="#C97352" />
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
  scroll: { paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.md },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: theme.spacing.xs },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: theme.colors.surface, borderRadius: 12,
    paddingHorizontal: 12, marginBottom: 16,
    borderWidth: 1, borderColor: theme.colors.border,
    ...theme.shadows.soft,
  },
  reminderIconBtn: {
    backgroundColor: theme.colors.surface, padding: 10, borderRadius: 12, marginBottom: 16,
    borderWidth: 1, borderColor: theme.colors.border,
    ...theme.shadows.soft,
    position: 'relative'
  },
  dot: {
    position: 'absolute', top: 10, right: 10,
    width: 8, height: 8, borderRadius: 4, backgroundColor: '#E53935',
    borderWidth: 1.5, borderColor: '#fff'
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 46, fontSize: 15, color: theme.colors.textPrimary, fontFamily: theme.typography.fontFamily.regular },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statCard: {
    flex: 1, backgroundColor: theme.colors.surface, borderRadius: 12, alignItems: 'center',
    paddingVertical: 14, marginHorizontal: 4,
    borderWidth: 1, borderColor: theme.colors.border,
    ...theme.shadows.soft,
  },
  statNum: { fontSize: 18, fontWeight: 'bold', color: '#C97352', marginTop: 4, fontFamily: theme.typography.fontFamily.bold },
  statSub: { fontSize: 11, color: theme.colors.textSecondary, marginTop: 2, fontFamily: theme.typography.fontFamily.medium },
  blogBanner: {
    backgroundColor: '#C97352', borderRadius: 16, padding: theme.spacing.lg,
    flexDirection: 'row', alignItems: 'center', marginBottom: 24,
    ...theme.shadows.medium,
  },
  blogBannerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', fontFamily: theme.typography.fontFamily.bold },
  blogBannerSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4, marginBottom: 12, fontFamily: theme.typography.fontFamily.regular },
  blogBtn: {
    backgroundColor: '#2E7D32', alignSelf: 'flex-start',
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8,
    flexDirection: 'row', alignItems: 'center', gap: 6
  },
  blogBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13, fontFamily: theme.typography.fontFamily.bold },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.textPrimary, marginBottom: 16, marginTop: 8, fontFamily: theme.typography.fontFamily.bold },
  card: {
    backgroundColor: theme.colors.surface, borderRadius: 14, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: theme.colors.border,
    ...theme.shadows.soft,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  cardTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: '#C97352', fontFamily: theme.typography.fontFamily.bold },
  tag: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginLeft: 8 },
  tagText: { color: '#fff', fontSize: 11, fontWeight: 'bold', fontFamily: theme.typography.fontFamily.bold },
  cardMeta: { fontSize: 13, color: theme.colors.textSecondary, marginBottom: 10, fontFamily: theme.typography.fontFamily.regular },
  cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardDeadline: { fontSize: 13, color: '#E53935', fontFamily: theme.typography.fontFamily.medium },
  amountBadge: { backgroundColor: '#E8F5E9', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  amountText: { color: '#2E7D32', fontWeight: 'bold', fontSize: 12, fontFamily: theme.typography.fontFamily.bold },
  announcementCard: {
    flexDirection: 'row', alignItems: 'flex-start', backgroundColor: theme.colors.surface,
    borderRadius: 12, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: theme.colors.border,
    ...theme.shadows.soft,
  },
  annoText: { fontSize: 14, color: theme.colors.textPrimary, lineHeight: 20, fontFamily: theme.typography.fontFamily.medium },
  annoTime: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 4, fontFamily: theme.typography.fontFamily.regular },
});
