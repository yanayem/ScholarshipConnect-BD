/**
 * ANALYTICS DASHBOARD: Visualize system performance and user engagement.
 * - Key performance indicators (KPIs).
 * - Application trends.
 * - Popular countries and categories.
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, StatusBar, RefreshControl,
  ActivityIndicator, Dimensions
} from 'react-native';
import { theme } from '../../theme';
import { MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { apiService } from '../../services/api';

const { width } = Dimensions.get('window');

const StatCard = ({ title, value, subValue, icon, color }) => (
    <View style={styles.statCard}>
        <View style={[styles.statIcon, { backgroundColor: color + '15' }]}>
            <MaterialCommunityIcons name={icon} size={24} color={color} />
        </View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
        {subValue && <Text style={[styles.statSub, { color: color }]}>{subValue}</Text>}
    </View>
);

const ProgressBar = ({ label, percentage, color, value }) => (
    <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>{label}</Text>
            <Text style={styles.progressValue}>{value}</Text>
        </View>
        <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${percentage}%`, backgroundColor: color }]} />
        </View>
    </View>
);

export default function AnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const res = await apiService.getAdminStats();
      if (res.ok) {
        setData(res.data);
      }
    } catch (e) {
      console.error('[ADMIN] Failed to load analytics:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Generating Insights...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.surface} />

      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color={theme.colors.heading} />
          </TouchableOpacity>
          <Text style={styles.title}>System Analytics</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={loadAnalytics} />}
      >
        <Text style={styles.sectionTitle}>Key Performance Indicators</Text>
        <View style={styles.kpiGrid}>
            <StatCard
                title="Total Users"
                value={data?.total_users || 0}
                subValue="+12% this month"
                icon="account-group"
                color={theme.colors.primary}
            />
            <StatCard
                title="Applications"
                value={data?.total_applications || 0}
                subValue="85% Success Rate"
                icon="file-document-check"
                color={theme.colors.success}
            />
            <StatCard
                title="Mentorships"
                value={data?.total_mentorships || 0}
                subValue="Active Sessions"
                icon="account-tie"
                color={theme.colors.info}
            />
            <StatCard
                title="Scholarships"
                value={data?.total_scholarships || 0}
                subValue="Live Worldwide"
                icon="school"
                color={theme.colors.chartSecondary}
            />
        </View>

        <View style={styles.analyticsCard}>
            <Text style={styles.cardTitle}>Top Countries (Interests)</Text>
            {(data?.popular_countries || []).map((item, idx) => (
                <ProgressBar
                    key={idx}
                    label={item.name}
                    percentage={item.percentage}
                    value={item.count}
                    color={idx % 2 === 0 ? theme.colors.primary : theme.colors.chartSecondary}
                />
            ))}
        </View>

        <View style={styles.analyticsCard}>
            <Text style={styles.cardTitle}>Engagement by Category</Text>
            <View style={styles.categoryStats}>
                <View style={styles.catItem}>
                    <View style={[styles.catDot, { backgroundColor: theme.colors.primary }]} />
                    <Text style={styles.catLabel}>Scholarships</Text>
                    <Text style={styles.catValue}>45%</Text>
                </View>
                <View style={styles.catItem}>
                    <View style={[styles.catDot, { backgroundColor: theme.colors.success }]} />
                    <Text style={styles.catLabel}>Visa Advice</Text>
                    <Text style={styles.catValue}>25%</Text>
                </View>
                <View style={styles.catItem}>
                    <View style={[styles.catDot, { backgroundColor: theme.colors.warning }]} />
                    <Text style={styles.catLabel}>Test Prep</Text>
                    <Text style={styles.catValue}>20%</Text>
                </View>
                <View style={styles.catItem}>
                    <View style={[styles.catDot, { backgroundColor: theme.colors.error }]} />
                    <Text style={styles.catLabel}>Others</Text>
                    <Text style={styles.catValue}>10%</Text>
                </View>
            </View>
        </View>

        <TouchableOpacity style={styles.exportBtn}>
            <MaterialIcons name="file-download" size={20} color="#fff" />
            <Text style={styles.exportText}>Export Monthly Report (PDF)</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 14, color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.medium },
  header: {
    paddingTop: 50,
    paddingHorizontal: 24,
    paddingBottom: 20,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontSize: 22, fontFamily: theme.typography.fontFamily.bold, color: theme.colors.heading },
  scroll: { flex: 1 },
  scrollContent: { padding: 20 },
  sectionTitle: { fontSize: 16, fontFamily: theme.typography.fontFamily.bold, color: theme.colors.heading, marginBottom: 16 },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: {
    width: (width - 52) / 2,
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.divider,
    ...theme.shadows.soft
  },
  statIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statValue: { fontSize: 24, fontFamily: theme.typography.fontFamily.bold, color: theme.colors.heading },
  statTitle: { fontSize: 12, color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.medium, marginTop: 4 },
  statSub: { fontSize: 10, fontFamily: theme.typography.fontFamily.bold, marginTop: 4 },
  analyticsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 28,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.divider,
    ...theme.shadows.soft
  },
  cardTitle: { fontSize: 17, fontFamily: theme.typography.fontFamily.bold, color: theme.colors.heading, marginBottom: 20 },
  progressContainer: { marginBottom: 16 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { fontSize: 14, fontFamily: theme.typography.fontFamily.medium, color: theme.colors.textPrimary },
  progressValue: { fontSize: 14, fontFamily: theme.typography.fontFamily.bold, color: theme.colors.heading },
  progressTrack: { height: 8, backgroundColor: theme.colors.background, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  categoryStats: { gap: 12 },
  catItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  catDot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
  catLabel: { flex: 1, fontSize: 14, fontFamily: theme.typography.fontFamily.medium, color: theme.colors.textPrimary },
  catValue: { fontSize: 14, fontFamily: theme.typography.fontFamily.bold, color: theme.colors.heading },
  exportBtn: {
    backgroundColor: theme.colors.heading,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
    borderRadius: 18,
    gap: 10,
    marginTop: 10,
    ...theme.shadows.premium
  },
  exportText: { color: '#fff', fontSize: 15, fontFamily: theme.typography.fontFamily.bold }
});
