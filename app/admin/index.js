import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { theme } from '../../theme';
import { MaterialIcons } from '@expo/vector-icons';

const StatCard = ({ title, value, icon, trend, trendColor }) => (
  <View style={[styles.card, theme.shadows.soft]}>
    <View style={styles.cardHeader}>
      <View style={[styles.iconContainer, { backgroundColor: theme.colors.primaryLight }]}>
        <MaterialIcons name={icon} size={24} color={theme.colors.primary} />
      </View>
      <Text style={styles.trendText(trendColor)}>{trend}</Text>
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statTitle}>{title}</Text>
  </View>
);

export default function AdminDashboard() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>System Overview</Text>
        <Text style={styles.subText}>Real-time performance metrics</Text>
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          title="Total Scholarships"
          value="1,284"
          icon="school"
          trend="+12%"
          trendColor={theme.colors.success}
        />
        <StatCard
          title="Active Users"
          value="45.2k"
          icon="people"
          trend="+5.4%"
          trendColor={theme.colors.success}
        />
        <StatCard
          title="Pending Apps"
          value="156"
          icon="pending-actions"
          trend="-2%"
          trendColor={theme.colors.error}
        />
        <StatCard
          title="Revenue (MDT)"
          value="৳45,000"
          icon="payments"
          trend="+18%"
          trendColor={theme.colors.success}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Scholarship Postings</Text>
          <Pressable><Text style={styles.viewAll}>View All</Text></Pressable>
        </View>

        <View style={[styles.listCard, theme.shadows.soft]}>
          {[
            { id: 1, name: 'MEXT Scholarship 2025', country: 'Japan', status: 'Active' },
            { id: 2, name: 'Chevening Award', country: 'UK', status: 'Pending' },
            { id: 3, name: 'DAAD Scholarship', country: 'Germany', status: 'Active' },
          ].map((item, index) => (
            <View key={item.id} style={[styles.listItem, index === 2 && { borderBottomWidth: 0 }]}>
              <View>
                <Text style={styles.itemTitle}>{item.name}</Text>
                <Text style={styles.itemSub}>{item.country}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: item.status === 'Active' ? theme.colors.mintCard : theme.colors.peachCard }]}>
                <Text style={[styles.badgeText, { color: item.status === 'Active' ? theme.colors.primary : theme.colors.error }]}>
                  {item.status}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionGrid}>
          <Pressable style={styles.actionButton}>
            <MaterialIcons name="add-circle-outline" size={24} color={theme.colors.primary} />
            <Text style={styles.actionText}>Post Scholarship</Text>
          </Pressable>
          <Pressable style={styles.actionButton}>
            <MaterialIcons name="notification-add" size={24} color={theme.colors.primary} />
            <Text style={styles.actionText}>Send Broadcast</Text>
          </Pressable>
          <Pressable style={styles.actionButton}>
            <MaterialIcons name="analytics" size={24} color={theme.colors.primary} />
            <Text style={styles.actionText}>Export Report</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  welcomeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.xxl,
    color: theme.colors.textPrimary,
  },
  subText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.sizes.base,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  card: {
    flex: 1,
    minWidth: 160,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendText: (color) => ({
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.xs,
    color: color || theme.colors.success,
  }),
  statValue: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.xl,
    color: theme.colors.textPrimary,
  },
  statTitle: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.textPrimary,
  },
  viewAll: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.primary,
  },
  listCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  itemTitle: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.sizes.base,
    color: theme.colors.textPrimary,
  },
  itemSub: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
  },
  badgeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.xs,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  actionButton: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  actionText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
});
