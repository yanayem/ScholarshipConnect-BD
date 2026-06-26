import { useState } from 'react';
import {
  View, Text, TextInput, ScrollView,
  TouchableOpacity, StyleSheet, StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

const ALL_SCHOLARSHIPS = [
  { id: '1', title: 'MEXT (Japan)', country: 'Japan', level: 'Masters', deadline: 'May 2025', amount: 'Full Funded', field: 'Any' },
  { id: '2', title: 'Chevening (UK)', country: 'UK', level: 'Masters', deadline: 'Nov 2025', amount: 'Full Funded', field: 'Any' },
  { id: '3', title: 'DAAD (Germany)', country: 'Germany', level: 'PhD', deadline: 'Oct 2025', amount: 'Full Funded', field: 'STEM' },
  { id: '4', title: 'Erasmus Mundus', country: 'Europe', level: 'Masters', deadline: 'Jan 2026', amount: 'Full Funded', field: 'Any' },
  { id: '5', title: 'Australia Awards', country: 'Australia', level: 'Masters', deadline: 'Apr 2025', amount: 'Full Funded', field: 'Any' },
  { id: '6', title: 'Korean Government (GKS)', country: 'Korea', level: 'Bachelors', deadline: 'Feb 2026', amount: 'Full Funded', field: 'Any' },
  { id: '7', title: 'Fulbright (USA)', country: 'USA', level: 'Masters', deadline: 'Jun 2025', amount: 'Full Funded', field: 'Any' },
  { id: '8', title: 'Chinese Government (CSC)', country: 'China', level: 'PhD', deadline: 'Mar 2026', amount: 'Full Funded', field: 'Any' },
  { id: '9', title: 'Commonwealth Scholarship', country: 'UK', level: 'PhD', deadline: 'Dec 2025', amount: 'Full Funded', field: 'Any' },
  { id: '10', title: 'Turkish Government (Türkiye)', country: 'Turkey', level: 'Bachelors', deadline: 'Feb 2026', amount: 'Full Funded', field: 'Any' },
];

const COUNTRIES = ['All', 'Japan', 'UK', 'Germany', 'Europe', 'Australia', 'Korea', 'USA', 'China', 'Turkey'];
const LEVELS = ['All', 'Bachelors', 'Masters', 'PhD'];

export default function ScholarshipsScreen() {
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('All');
  const [level, setLevel] = useState('All');
  const [bookmarks, setBookmarks] = useState(['4']); // Mocking Erasmus as saved

  const toggleBookmark = (id) => {
    setBookmarks(prev =>
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  const getDaysLeft = (deadline) => {
    const parts = deadline.split(' ');
    if (parts.length < 2) return null;
    const months = { 'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5, 'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11 };
    const month = months[parts[0]];
    const year = parseInt(parts[1]);
    const target = new Date(year, month || 0, 15); // Assume mid-month
    const diff = target - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const filtered = ALL_SCHOLARSHIPS.filter(s => {
    const matchSearch = s.title.toLowerCase().includes(search.toLowerCase());
    const matchCountry = country === 'All' || s.country === country;
    const matchLevel = level === 'All' || s.level === level;
    return matchSearch && matchCountry && matchLevel;
  });

  return (
    <View style={styles.root}>
      <StatusBar backgroundColor="#C97352" barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Search */}
        <View style={styles.searchWrap}>
          <MaterialIcons name="search" size={22} color="#7A746E" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search scholarships..."
            placeholderTextColor="#7A746E"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Country Filter */}
        <Text style={styles.filterLabel}>🌍 Country</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          {COUNTRIES.map(c => (
            <TouchableOpacity
              key={c}
              onPress={() => setCountry(c)}
              style={[styles.chip, country === c && styles.chipActive]}
            >
              <Text style={[styles.chipText, country === c && styles.chipTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Level Filter */}
        <Text style={styles.filterLabel}>🎓 Level</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          {LEVELS.map(l => (
            <TouchableOpacity
              key={l}
              onPress={() => setLevel(l)}
              style={[styles.chip, level === l && styles.chipActive]}
            >
              <Text style={[styles.chipText, level === l && styles.chipTextActive]}>{l}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Results Count */}
        <Text style={styles.resultCount}>{filtered.length} scholarships found</Text>

        {/* List */}
        {filtered.length === 0 ? (
          <View style={styles.emptyBox}>
            <MaterialIcons name="search-off" size={48} color="#7A746E" />
            <Text style={styles.emptyText}>No scholarships match your filters.</Text>
          </View>
        ) : (
          filtered.map(item => (
            <TouchableOpacity key={item.id} style={styles.card} activeOpacity={0.85}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <TouchableOpacity onPress={() => toggleBookmark(item.id)} style={styles.bookmarkBtn}>
                  <MaterialIcons
                    name={bookmarks.includes(item.id) ? "bookmark" : "bookmark-outline"}
                    size={22}
                    color={bookmarks.includes(item.id) ? "#C97352" : "#7A746E"}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.metaRow}>
                <View style={styles.metaBadge}>
                  <MaterialIcons name="place" size={13} color="#C97352" />
                  <Text style={styles.metaText}>{item.country}</Text>
                </View>
                <View style={styles.metaBadge}>
                  <MaterialIcons name="school" size={13} color="#C97352" />
                  <Text style={styles.metaText}>{item.level}</Text>
                </View>
                <View style={styles.metaBadge}>
                  <MaterialIcons name="work" size={13} color="#C97352" />
                  <Text style={styles.metaText}>{item.field}</Text>
                </View>
              </View>
              <View style={styles.cardBottom}>
                <Text style={styles.deadline}>
                  <MaterialIcons name="event" size={13} color="#E53935" /> {item.deadline}
                </Text>
                <TouchableOpacity onPress={() => router.push('/reminders')} style={styles.remindBadge}>
                  <MaterialIcons name="notifications-active" size={14} color="#C97352" />
                  <Text style={styles.remindText}>Remind</Text>
                </TouchableOpacity>
                <View style={styles.amountBadge}>
                  <Text style={styles.amountText}>{item.amount}</Text>
                </View>
              </View>

              {/* Deadline Tracker */}
              {getDaysLeft(item.deadline) !== null && (
                <View style={styles.trackerContainer}>
                  <View style={styles.trackerHeader}>
                    <Text style={styles.trackerText}>Deadline Tracker</Text>
                    <Text style={styles.daysLeftText}>{getDaysLeft(item.deadline)} days left</Text>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${Math.min(100, Math.max(10, 100 - (getDaysLeft(item.deadline) / 365) * 100))}%` }
                      ]}
                    />
                  </View>
                </View>
              )}

              <TouchableOpacity
                style={styles.applyBtn}
                onPress={() => router.push(`/scholarship/${item.id}`)}
              >
                <Text style={styles.applyText}>View Details</Text>
                <MaterialIcons name="arrow-forward" size={16} color="#fff" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.md },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 12, paddingHorizontal: 12, marginBottom: 14,
    elevation: 3, shadowColor: '#2D2A26', shadowOpacity: 0.06, shadowRadius: 6,
  },
  searchInput: { flex: 1, height: 46, fontSize: 15, color: '#2D2A26' },
  filterLabel: { fontSize: 13, fontWeight: '700', color: '#7A746E', marginBottom: 8, marginTop: 4 },
  chipRow: { marginBottom: 16 },
  chip: {
    borderWidth: 1.5, borderColor: '#7A746E', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 6, marginRight: 8, backgroundColor: '#fff',
  },
  chipActive: { backgroundColor: '#C97352', borderColor: '#C97352' },
  chipText: { fontSize: 13, color: '#7A746E', fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  resultCount: { fontSize: 13, color: '#7A746E', marginBottom: 16, fontFamily: theme.typography.fontFamily.medium },
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 14,
    elevation: 3, shadowColor: '#2D2A26', shadowOpacity: 0.07, shadowRadius: 6,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#C97352', flex: 1, marginRight: 8 },
  bookmarkBtn: { padding: 2 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  metaBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#E3F2FD',
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, gap: 4,
  },
  metaText: { fontSize: 12, color: '#C97352', fontWeight: '600' },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  deadline: { fontSize: 13, color: '#E53935' },
  amountBadge: { backgroundColor: '#E8F5E9', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  amountText: { color: '#2E7D32', fontWeight: 'bold', fontSize: 12 },
  remindBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFF3E0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  remindText: { color: '#C97352', fontWeight: '700', fontSize: 11 },
  trackerContainer: { marginBottom: 16, backgroundColor: '#FFF9F6', padding: 8, borderRadius: 10, borderWidth: 1, borderColor: '#FFEBEE' },
  trackerHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  trackerText: { fontSize: 11, color: '#7A746E', fontWeight: '600' },
  daysLeftText: { fontSize: 11, color: '#E53935', fontWeight: 'bold' },
  progressBarBg: { height: 6, backgroundColor: '#ECE7E1', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#E53935', borderRadius: 3 },
  applyBtn: {
    backgroundColor: '#C97352', borderRadius: 10, paddingVertical: 10,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6,
  },
  applyText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  emptyBox: { alignItems: 'center', paddingVertical: 50 },
  emptyText: { fontSize: 15, color: '#7A746E', marginTop: 12 },
});
