import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, ActivityIndicator, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { apiService } from '../../services/api';

export default function ActivityScreen() {
  const [activity, setActivity] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadActivity = async () => {
    const res = await apiService.getUserActivity();
    if (res.ok) {
      setActivity(res.data.activity);
      setSummary(res.data.summary);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    loadActivity();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadActivity();
  };

  const renderActivityItem = ({ item }) => (
    <TouchableOpacity
      style={styles.activityCard}
      onPress={() => item.target_id && router.push(`/community/${item.target_id}`)}
    >
      <View style={[
        styles.iconContainer,
        { backgroundColor: item.type === 'like' ? theme.colors.errorLight : theme.colors.primaryLight }
      ]}>
        <MaterialIcons
          name={item.type === 'like' ? 'favorite' : 'comment'}
          size={20}
          color={item.type === 'like' ? theme.colors.error : theme.colors.primary}
        />
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityTitle}>{item.title}</Text>
        {item.subtitle && (
          <Text style={styles.activitySubtitle} numberOfLines={2}>{item.subtitle}</Text>
        )}
        <Text style={styles.activityTime}>
          {new Date(item.timestamp).toLocaleDateString()} at {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color={theme.colors.placeholder} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.heading} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Activity</Text>
      </View>

      <View style={styles.summaryContainer}>
         <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{summary?.total_likes || 0}</Text>
            <Text style={styles.summaryLabel}>Likes</Text>
         </View>
         <View style={styles.summaryDivider} />
         <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{summary?.total_comments || 0}</Text>
            <Text style={styles.summaryLabel}>Comments</Text>
         </View>
      </View>

      <FlatList
        data={activity}
        renderItem={renderActivityItem}
        keyExtractor={(item, index) => `${item.type}-${item.id}-${index}`}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 50 }} />
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="history" size={64} color={theme.colors.placeholder} />
              <Text style={styles.emptyText}>No recent activity found.</Text>
              <TouchableOpacity style={styles.exploreBtn} onPress={() => router.push('/community')}>
                 <Text style={styles.exploreBtnText}>Explore Community</Text>
              </TouchableOpacity>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.heading, marginLeft: 16 },
  summaryContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    ...theme.shadows.soft
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: 24, fontWeight: 'bold', color: theme.colors.primary },
  summaryLabel: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 4 },
  summaryDivider: { width: 1, height: 40, backgroundColor: theme.colors.divider },
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  activityCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    ...theme.shadows.soft
  },
  iconContainer: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 16
  },
  activityContent: { flex: 1 },
  activityTitle: { fontSize: 14, fontWeight: 'bold', color: theme.colors.heading },
  activitySubtitle: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 4, lineHeight: 18 },
  activityTime: { fontSize: 11, color: theme.colors.placeholder, marginTop: 6 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: 16, color: theme.colors.placeholder, marginTop: 16 },
  exploreBtn: { backgroundColor: theme.colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 24 },
  exploreBtnText: { color: '#fff', fontWeight: 'bold' }
});
