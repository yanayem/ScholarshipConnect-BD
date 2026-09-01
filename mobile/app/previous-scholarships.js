import { useState, useCallback } from 'react';
import {
  View, Text, ScrollView,
  TouchableOpacity, StyleSheet, StatusBar, RefreshControl, Platform
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { theme } from '../theme';
import { apiService } from '../services/api';
import { cacheService } from '../services/cache';
import { useToast } from '../components/Toast';
import { Loader } from '../components/Loader';
import ScholarshipCard from '../components/cards/ScholarshipCard';

export default function PreviousScholarshipsScreen() {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { showToast, ToastComponent } = useToast();

  const loadData = async () => {
    // 1. Try Cache First
    try {
      const cachedArchive = await cacheService.get('scholarships_archive');
      if (cachedArchive) {
        setScholarships(cachedArchive);
        setLoading(false);
      }
    } catch (e) {}

    // 2. Fetch fresh data in the background
    try {
      const res = await apiService.getScholarships();
      if (res.ok) {
        const data = Array.isArray(res.data) ? res.data : (res.data?.results || []);
        const today = new Date();
        const expired = data.filter(s => new Date(s.deadline) < today);
        setScholarships(expired);
        await cacheService.set('scholarships_archive', expired, 60); // Cache for 1 hour
      }
    } catch (error) {
      if (!scholarships.length) showToast('Error loading expired scholarships', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  return (
    <View style={styles.root}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.heading} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Archive</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); loadData();}} colors={[theme.colors.primary]} />
        }
      >
        <View style={styles.infoBanner}>
            <MaterialIcons name="info-outline" size={20} color={theme.colors.textSecondary} />
            <Text style={styles.infoText}>These scholarships have already passed their application deadlines.</Text>
        </View>

        {loading ? (
          <Loader message="Loading archives..." />
        ) : scholarships.length === 0 ? (
          <View style={styles.emptyBox}>
            <MaterialIcons name="history" size={56} color={theme.colors.placeholder} />
            <Text style={styles.emptyText}>No archived scholarships found.</Text>
          </View>
        ) : (
          scholarships.map((item, index) => (
            <ScholarshipCard
              key={item.id}
              item={item}
              index={index}
              onPress={() => router.push(`/scholarships/${item.id}`)}
            />
          ))
        )}
      </ScrollView>
      {ToastComponent}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    height: 100, backgroundColor: '#fff',
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 40, paddingHorizontal: 20, gap: 12,
    borderBottomWidth: 1, borderBottomColor: theme.colors.divider
  },
  headerTitle: { color: theme.colors.heading, fontSize: 18, fontWeight: 'bold' },
  backBtn: { padding: 4 },
  scroll: { padding: 20 },
  infoBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(0,0,0,0.03)', padding: 15,
    borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)'
  },
  infoText: { fontSize: 13, color: theme.colors.textSecondary, flex: 1 },
  emptyBox: { alignItems: 'center', paddingVertical: 100 },
  emptyText: { fontSize: 15, color: theme.colors.placeholder, marginTop: 12 },
});
