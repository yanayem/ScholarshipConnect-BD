/**
 * SCHOLARSHIPS FEED: Displays the list of available scholarships.
 * - Handles advanced search, multi-layer filtering (Country, Level, Field, Funding).
 * - Real-time eligibility highlighting based on user profile.
 * - Features a Deadline Tracker and AI Matchmaker integration.
 */
import { useState, useCallback } from 'react';
import {
  View, Text, TextInput, ScrollView,
  TouchableOpacity, StyleSheet, StatusBar, RefreshControl, Platform
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { theme } from '../../theme';
import { apiService } from '../../services/api';
import { cacheService } from '../../services/cache';
import { useToast } from '../../components/Toast';
import { Loader } from '../../components/Loader';
import ScholarshipCard from '../../components/cards/ScholarshipCard';

const COUNTRIES = ['All', 'Japan', 'UK', 'Germany', 'Europe', 'Australia', 'Korea', 'USA', 'China', 'Turkey', 'Canada'];
const LEVELS = ['All', 'Bachelors', 'Masters', 'PhD', 'Diploma'];
const FIELDS = ['All', 'Engineering', 'STEM', 'Arts', 'Business', 'Medicine', 'Social Science', 'Computer Science'];
const FUNDING = ['All', 'Full Fund', 'Partial', 'Tuition Only'];

export default function ScholarshipsScreen() {
  const [search, setSearch] = useState('');
  const [country, setCountry] = useState('All');
  const [level, setLevel] = useState('All');
  const [field, setField] = useState('All');
  const [funding, setFunding] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [sortBy, setSortBy] = useState('deadline');

  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { showToast, ToastComponent } = useToast();

  const loadData = async (showLoading = true) => {
    // 1. Try Cache First
    if (showLoading) {
      const cachedData = await cacheService.get('scholarships_list');
      const cachedProfile = await cacheService.get('user_profile');

      if (cachedData) {
        setScholarships(cachedData);
        setLoading(false);
      }
      if (cachedProfile) {
        setUserProfile(cachedProfile);
      }
    }

    if (showLoading && !scholarships.length) setLoading(true);

    // 2. Refresh from API
    try {
      const [scholarRes, profileRes] = await Promise.all([
        apiService.getScholarships(),
        apiService.getProfile()
      ]);

      if (scholarRes.ok) {
        const data = Array.isArray(scholarRes.data) ? scholarRes.data : (scholarRes.data?.results || []);
        setScholarships(data);
        cacheService.set('scholarships_list', data, 15); // Cache for 15 mins
      }

      if (profileRes.ok) {
        setUserProfile(profileRes.data);
        cacheService.set('user_profile', profileRes.data, 30); // Cache for 30 mins
      }
    } catch (error) {
      console.log('Failed to fetch data', error);
      if (!scholarships.length) showToast('Network error loading data', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData(scholarships.length === 0);
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData(false);
  };

  const toggleBookmark = async (item) => {
    try {
      if (item.is_saved) {
        const res = await apiService.unsaveScholarship(item.save_id);
        if (res.ok) {
          setScholarships(prev => prev.map(s =>
            s.id === item.id ? { ...s, is_saved: false, save_id: null } : s
          ));
          showToast('Removed from bookmarks', 'info');
        }
      } else {
        const res = await apiService.saveScholarship(item.id);
        if (res.ok) {
          setScholarships(prev => prev.map(s =>
            s.id === item.id ? { ...s, is_saved: true, save_id: res.data.id } : s
          ));
          showToast('Saved to bookmarks!', 'success');
        }
      }
    } catch (e) {
      showToast('Error updating bookmarks', 'error');
    }
  };

  const getDaysLeft = (deadline) => {
    if (!deadline) return null;
    const target = new Date(deadline);
    if (isNaN(target.getTime())) return null;
    const diff = target - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const filtered = scholarships.filter(s => {
    // 1. Expiry Check: ONLY show active ones (deadline today or in future)
    const today = new Date();
    today.setHours(0,0,0,0);
    const deadlineDate = new Date(s.deadline);
    if (deadlineDate < today) return false;

    const matchSearch = (s.title || '').toLowerCase().includes(search.toLowerCase()) ||
                        (s.provider || '').toLowerCase().includes(search.toLowerCase()) ||
                        (s.description || '').toLowerCase().includes(search.toLowerCase());
    const matchCountry = country === 'All' || s.country === country;
    const matchLevel = level === 'All' || (s.level || '').includes(level);
    const matchField = field === 'All' || (s.field || '').includes(field);
    const matchFunding = funding === 'All' || (s.amount || '').toLowerCase().includes(funding.toLowerCase().replace(' fund', ''));

    return matchSearch && matchCountry && matchLevel && matchField && matchFunding;
  }).sort((a, b) => {
    if (sortBy === 'deadline') return new Date(a.deadline) - new Date(b.deadline);
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    return 0;
  });

  const isEligible = (s) => {
    if (!userProfile?.cgpa || !s.min_cgpa) return true;
    return parseFloat(userProfile.cgpa) >= parseFloat(s.min_cgpa);
  };

  return (
    <View style={styles.root}>
      <StatusBar backgroundColor={theme.colors.surface} barStyle="dark-content" />

      {/* Search & Filter Header */}
      <View style={styles.fixedHeader}>
        <View style={styles.searchRow}>
          <View style={styles.searchWrap}>
            <MaterialIcons name="search" size={22} color={theme.colors.placeholder} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search title, field, country..."
              placeholderTextColor={theme.colors.placeholder}
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <TouchableOpacity
            style={[styles.filterBtn, showFilters && styles.filterBtnActive]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <MaterialIcons name="tune" size={24} color={showFilters ? '#fff' : theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {showFilters && (
          <Animated.View entering={FadeInDown} style={styles.advancedFilters}>
             <View style={styles.filterGroup}>
               <Text style={styles.filterTitle}>Field of Study</Text>
               <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                 {FIELDS.map(f => (
                   <TouchableOpacity key={f} onPress={() => setField(f)} style={[styles.miniChip, field === f && styles.chipActive]}>
                     <Text style={[styles.miniChipText, field === f && styles.chipTextActive]}>{f}</Text>
                   </TouchableOpacity>
                 ))}
               </ScrollView>
             </View>

             <View style={styles.filterGroup}>
               <Text style={styles.filterTitle}>Funding Type</Text>
               <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                 {FUNDING.map(f => (
                   <TouchableOpacity key={f} onPress={() => setFunding(f)} style={[styles.miniChip, funding === f && styles.chipActive]}>
                     <Text style={[styles.miniChipText, funding === f && styles.chipTextActive]}>{f}</Text>
                   </TouchableOpacity>
                 ))}
               </ScrollView>
             </View>

             <View style={styles.sortRow}>
                <Text style={styles.filterTitle}>Sort By:</Text>
                <TouchableOpacity onPress={() => setSortBy('deadline')} style={styles.sortToggle}>
                   <MaterialIcons name={sortBy === 'deadline' ? "radio-button-checked" : "radio-button-unchecked"} size={18} color={theme.colors.primary} />
                   <Text style={styles.sortText}>Deadline</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSortBy('title')} style={styles.sortToggle}>
                   <MaterialIcons name={sortBy === 'title' ? "radio-button-checked" : "radio-button-unchecked"} size={18} color={theme.colors.primary} />
                   <Text style={styles.sortText}>Title</Text>
                </TouchableOpacity>
             </View>
          </Animated.View>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
        }
      >
        {/* AI Matchmaker Banner */}
        <TouchableOpacity
          style={styles.aiMatchBanner}
          onPress={() => router.push('/scholarships/matchmaker')}
        >
          <View style={styles.aiMatchIcon}>
            <MaterialIcons name="auto-awesome" size={24} color="#fff" />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.aiMatchTitle}>AI Smart Match</Text>
            <Text style={styles.aiMatchSub}>Based on your profile: CGPA {userProfile?.cgpa || 'N/A'}</Text>
          </View>
          <View style={styles.matchBadge}>
            <Text style={styles.matchBadgeText}>PRO</Text>
          </View>
        </TouchableOpacity>

        {/* Quick Filters */}
        <View style={styles.quickFilterSection}>
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
        </View>

        {/* Results Header */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultCount}>
            {loading ? 'Searching...' : `${filtered.length} scholarships found`}
          </Text>
          {(search || country !== 'All' || level !== 'All' || field !== 'All' || funding !== 'All') ? (
             <TouchableOpacity onPress={() => {setSearch(''); setCountry('All'); setLevel('All'); setField('All'); setFunding('All');}}>
               <Text style={styles.clearFilters}>Clear All</Text>
             </TouchableOpacity>
          ) : null}
        </View>

        {/* Scholarship List */}
        {loading ? (
          <Loader message="Finding scholarships..." />
        ) : filtered.length === 0 ? (
          <View style={styles.emptyBox}>
            <MaterialIcons name="search-off" size={48} color={theme.colors.placeholder} />
            <Text style={styles.emptyText}>No scholarships match your filters.</Text>
            <TouchableOpacity style={styles.resetBtn} onPress={() => {setSearch(''); setCountry('All'); setLevel('All'); setField('All'); setFunding('All');}}>
              <Text style={styles.resetBtnText}>Reset Filters</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filtered.map((item, index) => (
            <ScholarshipCard
              key={item.id}
              item={item}
              index={index}
              userProfile={userProfile}
              onPress={() => router.push(`/scholarships/${item.id}`)}
              onBookmark={toggleBookmark}
            />
          ))
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Floating Action Button for Adding Scholarship */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/add-scholarship')}
        activeOpacity={0.8}
      >
        <MaterialIcons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {ToastComponent}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background },
  fixedHeader: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingBottom: 15,
    paddingTop: Platform.OS === 'ios' ? 10 : 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
    zIndex: 100,
  },
  searchRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  searchWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 48,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 14, color: theme.colors.textPrimary },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.divider,
  },
  filterBtnActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  advancedFilters: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  filterGroup: { marginBottom: 12 },
  filterTitle: { fontSize: 12, fontWeight: 'bold', color: theme.colors.textSecondary, marginBottom: 8 },
  chipScroll: { flexDirection: 'row' },
  miniChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: theme.colors.background,
    marginRight: 8,
    borderWidth: 1,
    borderColor: theme.colors.divider
  },
  miniChipText: { fontSize: 11, color: theme.colors.textPrimary },
  sortRow: { flexDirection: 'row', alignItems: 'center', gap: 15, marginTop: 5 },
  sortToggle: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  sortText: { fontSize: 12, color: theme.colors.textPrimary },
  scroll: { paddingHorizontal: 20, paddingBottom: 20 },
  aiMatchBanner: {
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    borderWidth: 1,
    borderColor: theme.colors.divider,
    ...theme.shadows.soft,
  },
  aiMatchIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiMatchTitle: { fontSize: 15, fontWeight: 'bold', color: theme.colors.heading },
  aiMatchSub: { fontSize: 11, color: theme.colors.textSecondary, marginTop: 2 },
  matchBadge: { backgroundColor: '#FFD700', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  matchBadgeText: { fontSize: 9, fontWeight: 'bold', color: '#000' },
  quickFilterSection: { marginBottom: 15 },
  chipRow: { marginBottom: 10 },
  chip: {
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.divider,
  },
  chipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  chipText: { fontSize: 13, color: theme.colors.textSecondary, fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  resultsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  resultCount: { fontSize: 13, color: theme.colors.textSecondary },
  clearFilters: { fontSize: 12, color: theme.colors.primary, fontWeight: 'bold' },
  card: {
    backgroundColor: theme.colors.surface,
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    ...theme.shadows.soft,
    position: 'relative',
    overflow: 'hidden'
  },
  ineligibleCard: { opacity: 0.7, backgroundColor: '#fcfcfc' },
  ineligibleBadge: {
    position: 'absolute', top: 0, right: 0,
    backgroundColor: theme.colors.error,
    paddingHorizontal: 8, paddingVertical: 4,
    borderBottomLeftRadius: 10,
    flexDirection: 'row', alignItems: 'center', gap: 4, zIndex: 1
  },
  ineligibleText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.heading, flex: 1, marginRight: 8 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4 },
  statusBadgeText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
  bookmarkBtn: { padding: 4 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  metaBadge: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, gap: 4,
  },
  metaText: { fontSize: 12, color: theme.colors.primary, fontWeight: '600' },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  deadline: { fontSize: 13, color: theme.colors.error, fontWeight: '500' },
  amountBadge: { backgroundColor: theme.colors.mintCard, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  amountText: { color: theme.colors.success, fontWeight: 'bold', fontSize: 14 },
  trackerContainer: { marginBottom: 20, backgroundColor: '#f9f9f9', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#eee' },
  trackerHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  trackerText: { fontSize: 11, color: theme.colors.textSecondary, fontWeight: '600' },
  daysLeftText: { fontSize: 11, color: theme.colors.error, fontWeight: 'bold' },
  progressBarBg: { height: 6, backgroundColor: '#eee', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 3 },
  applyBtn: {
    backgroundColor: theme.colors.primary, borderRadius: 12, paddingVertical: 14,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8,
    ...theme.shadows.soft,
  },
  applyText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  emptyBox: { alignItems: 'center', paddingVertical: 50 },
  emptyText: { fontSize: 15, color: theme.colors.placeholder, marginTop: 12 },
  resetBtn: { marginTop: 15, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: theme.colors.primary, borderRadius: 8 },
  resetBtnText: { color: '#fff', fontWeight: 'bold' },
  fab: {
    position: 'absolute',
    bottom: 25,
    right: 25,
    backgroundColor: theme.colors.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    zIndex: 999,
  },
});
