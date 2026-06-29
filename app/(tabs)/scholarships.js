import { useState } from 'react';
import {
  View, Text, TextInput, ScrollView,
  TouchableOpacity, StyleSheet, StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';

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
  const [bookmarks, setBookmarks] = useState(['4']);

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
    const target = new Date(year, month || 0, 15);
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
      <StatusBar backgroundColor={theme.colors.background} barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Search */}
        <View style={styles.searchWrap}>
          <MaterialIcons name="search" size={20} color={theme.colors.placeholder} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search scholarships..."
            placeholderTextColor={theme.colors.placeholder}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Country Filter */}
        <Text style={styles.filterLabel}>Country</Text>
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
        <Text style={styles.filterLabel}>Study Level</Text>
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
            <MaterialIcons name="search-off" size={48} color={theme.colors.placeholder} />
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
                    color={bookmarks.includes(item.id) ? theme.colors.primary : theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.metaRow}>
                <View style={[styles.metaBadge, { backgroundColor: theme.colors.tealCard }]}>
                  <MaterialIcons name="place" size={13} color={theme.colors.primary} />
                  <Text style={styles.metaText}>{item.country}</Text>
                </View>
                <View style={[styles.metaBadge, { backgroundColor: theme.colors.lavenderCard }]}>
                  <MaterialIcons name="school" size={13} color="#8E7DF5" />
                  <Text style={[styles.metaText, {color: '#8E7DF5'}]}>{item.level}</Text>
                </View>
                <View style={[styles.metaBadge, { backgroundColor: theme.colors.peachCard }]}>
                  <MaterialIcons name="work" size={13} color="#F4B942" />
                  <Text style={[styles.metaText, {color: '#F4B942'}]}>{item.field}</Text>
                </View>
              </View>
              <View style={styles.cardBottom}>
                <Text style={styles.deadline}>
                  <MaterialIcons name="event" size={13} color={theme.colors.error} /> {item.deadline}
                </Text>
                <TouchableOpacity onPress={() => router.push('/reminders')} style={styles.remindBadge}>
                  <MaterialIcons name="notifications-active" size={14} color={theme.colors.primary} />
                  <Text style={styles.remindText}>Remind</Text>
                </TouchableOpacity>
                <View style={[styles.amountBadge, { backgroundColor: theme.colors.mintCard }]}>
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
  scroll: { paddingHorizontal: 20, paddingVertical: 20 },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.base, paddingHorizontal: 12, marginBottom: 20,
  },
  searchInput: { flex: 1, height: 48, fontSize: 15, color: theme.colors.textPrimary },
  filterLabel: { fontSize: 13, fontWeight: '700', color: theme.colors.heading, marginBottom: 10, marginTop: 4 },
  chipRow: { marginBottom: 20 },
  chip: {
    borderRadius: theme.borderRadius.base,
    paddingHorizontal: 16, paddingVertical: 8, marginRight: 8, backgroundColor: theme.colors.surface,
  },
  chipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  chipText: { fontSize: 13, color: theme.colors.textSecondary, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  resultCount: { fontSize: 13, color: theme.colors.textSecondary, marginBottom: 16 },
  card: {
    backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.base, padding: 20, marginBottom: 16,
    ...theme.shadows.premium,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.heading, flex: 1, marginRight: 8 },
  bookmarkBtn: { padding: 2 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  metaBadge: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, gap: 4,
  },
  metaText: { fontSize: 12, color: theme.colors.primary, fontWeight: '600' },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  deadline: { fontSize: 13, color: theme.colors.error, fontWeight: '500' },
  amountBadge: { backgroundColor: theme.colors.mintCard, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  amountText: { color: theme.colors.success, fontWeight: 'bold', fontSize: 12 },
  remindBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: theme.colors.primaryLight, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  remindText: { color: theme.colors.primary, fontWeight: '700', fontSize: 11 },
  trackerContainer: { marginBottom: 20, backgroundColor: theme.colors.secondaryBackground, padding: 12, borderRadius: 12 },
  trackerHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  trackerText: { fontSize: 11, color: theme.colors.textSecondary, fontWeight: '600' },
  daysLeftText: { fontSize: 11, color: theme.colors.error, fontWeight: 'bold' },
  progressBarBg: { height: 6, backgroundColor: theme.colors.primaryLight, borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: theme.colors.primary, borderRadius: 3 },
  applyBtn: {
    backgroundColor: theme.colors.secondary, borderRadius: theme.borderRadius.base, paddingVertical: 14,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8,
    ...theme.shadows.soft,
  },
  applyText: { color: theme.colors.heading, fontWeight: 'bold', fontSize: 14 },
  emptyBox: { alignItems: 'center', paddingVertical: 50 },
  emptyText: { fontSize: 15, color: theme.colors.placeholder, marginTop: 12 },
});
