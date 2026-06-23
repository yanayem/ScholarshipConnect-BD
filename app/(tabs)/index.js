import { useState } from 'react';
import {
  View, Text, TextInput, ScrollView,
  TouchableOpacity, StyleSheet, StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

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

const tagColor = { Hot: '#E53935', Popular: '#1565C0', New: '#2E7D32' };

export default function HomeScreen() {
  const [search, setSearch] = useState('');

  return (
    <View style={styles.root}>
      <StatusBar backgroundColor="#1565C0" barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Search Bar & Notification */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={[styles.searchWrap, { flex: 1 }]}>
            <MaterialIcons name="search" size={22} color="#90A4AE" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search scholarships..."
              placeholderTextColor="#90A4AE"
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <TouchableOpacity
            style={styles.reminderIconBtn}
            onPress={() => router.push('/reminders')}
          >
            <MaterialIcons name="notifications-active" size={26} color="#1565C0" />
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
              <MaterialIcons name={s.icon} size={26} color="#1565C0" />
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
              <MaterialIcons name="place" size={13} color="#607D8B" /> {item.country}
              {'   '}
              <MaterialIcons name="school" size={13} color="#607D8B" /> {item.level}
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
            <MaterialIcons name="notifications" size={20} color="#1565C0" />
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
  root: { flex: 1, backgroundColor: '#F4F6FA' },
  scroll: { padding: 16 },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 12,
    paddingHorizontal: 12, marginBottom: 16,
    elevation: 3, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6,
  },
  reminderIconBtn: {
    backgroundColor: '#fff', padding: 10, borderRadius: 12, marginBottom: 16,
    elevation: 3, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6,
    position: 'relative'
  },
  dot: {
    position: 'absolute', top: 10, right: 10,
    width: 8, height: 8, borderRadius: 4, backgroundColor: '#E53935',
    borderWidth: 1.5, borderColor: '#fff'
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 46, fontSize: 15, color: '#263238' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12, alignItems: 'center',
    paddingVertical: 14, marginHorizontal: 4,
    elevation: 3, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6,
  },
  statNum: { fontSize: 18, fontWeight: 'bold', color: '#1565C0', marginTop: 4 },
  statSub: { fontSize: 11, color: '#607D8B', marginTop: 2 },
  blogBanner: {
    backgroundColor: '#1565C0', borderRadius: 16, padding: 20,
    flexDirection: 'row', alignItems: 'center', marginBottom: 24,
    elevation: 4, shadowColor: '#1565C0', shadowOpacity: 0.3, shadowRadius: 8
  },
  blogBannerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  blogBannerSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4, marginBottom: 12 },
  blogBtn: {
    backgroundColor: '#2E7D32', alignSelf: 'flex-start',
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8,
    flexDirection: 'row', alignItems: 'center', gap: 6
  },
  blogBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', color: '#1A237E', marginBottom: 12, marginTop: 4 },
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12,
    elevation: 3, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 6,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  cardTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: '#1A237E' },
  tag: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginLeft: 8 },
  tagText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  cardMeta: { fontSize: 13, color: '#607D8B', marginBottom: 10 },
  cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardDeadline: { fontSize: 13, color: '#E53935' },
  amountBadge: { backgroundColor: '#E8F5E9', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  amountText: { color: '#2E7D32', fontWeight: 'bold', fontSize: 12 },
  announcementCard: {
    flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#fff',
    borderRadius: 12, padding: 14, marginBottom: 10,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4,
  },
  annoText: { fontSize: 14, color: '#263238', lineHeight: 20 },
  annoTime: { fontSize: 12, color: '#90A4AE', marginTop: 4 },
});
