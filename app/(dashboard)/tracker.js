import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { theme } from '../../theme';
import { MaterialIcons } from '@expo/vector-icons';

const STATUS_CONFIG = {
  Saved:        { color: theme.colors.textSecondary, bg: theme.colors.secondaryBackground, icon: 'bookmark-outline' },
  Preparing:    { color: theme.colors.warning, bg: theme.colors.yellowCard, icon: 'edit' },
  Submitted:    { color: theme.colors.info, bg: 'rgba(106, 169, 255, 0.1)', icon: 'send' },
  'Under Review': { color: '#8E44AD', bg: theme.colors.lavenderCard, icon: 'hourglass-empty' },
  Shortlisted:  { color: theme.colors.primary, bg: theme.colors.tealCard, icon: 'stars' },
  Accepted:     { color: theme.colors.success, bg: theme.colors.mintCard, icon: 'check-circle' },
  Rejected:     { color: theme.colors.error, bg: 'rgba(232, 93, 117, 0.1)', icon: 'cancel' },
};

const APPLICATIONS = [
  { id: '1', title: 'MEXT Japan Research Scholarship', deadline: '2025-05-15', status: 'Accepted', country: 'Japan' },
  { id: '2', title: 'Chevening Masters Scholarship', deadline: '2024-11-01', status: 'Under Review', country: 'UK' },
  { id: '3', title: 'DAAD Development-Related Courses', deadline: '2025-03-31', status: 'Submitted', country: 'Germany' },
  { id: '4', title: 'Erasmus Mundus Joint Masters', deadline: '2025-01-15', status: 'Preparing', country: 'Europe' },
  { id: '5', title: 'Fulbright Foreign Student Program', deadline: '2025-02-28', status: 'Shortlisted', country: 'USA' },
];

export default function ApplicationTracker() {
  const STEPS = ['Saved', 'Preparing', 'Submitted', 'Under Review', 'Shortlisted', 'Accepted'];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Application Tracker</Text>
        <Text style={styles.subtitle}>Monitor your journey to global education</Text>
      </View>

      <View style={styles.grid}>
        {APPLICATIONS.map((app) => {
          const cfg = STATUS_CONFIG[app.status];
          const currentIdx = STEPS.indexOf(app.status);

          return (
            <View key={app.id} style={[styles.card, theme.shadows.soft]}>
              <View style={styles.cardTop}>
                <View>
                  <Text style={styles.appTitle}>{app.title}</Text>
                  <Text style={styles.appCountry}>{app.country} • Deadline: {app.deadline}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
                  <Text style={[styles.badgeText, { color: cfg.color }]}>{app.status}</Text>
                </View>
              </View>

              <View style={styles.progressContainer}>
                {STEPS.map((step, index) => {
                  const isActive = index <= currentIdx;
                  const isCompleted = index < currentIdx;

                  return (
                    <View key={step} style={styles.stepItem}>
                      <View style={styles.stepVisual}>
                        <View style={[
                          styles.stepCircle,
                          isActive && styles.stepCircleActive,
                          isCompleted && { backgroundColor: theme.colors.primary }
                        ]}>
                          {isCompleted ? (
                            <MaterialIcons name="check" size={12} color="white" />
                          ) : (
                            <View style={[styles.innerCircle, isActive && { backgroundColor: 'white' }]} />
                          )}
                        </View>
                        {index < STEPS.length - 1 && (
                          <View style={[styles.connector, index < currentIdx && styles.connectorActive]} />
                        )}
                      </View>
                      <Text style={[styles.stepLabel, isActive && styles.stepLabelActive]}>{step}</Text>
                    </View>
                  );
                })}
              </View>

              <View style={styles.cardActions}>
                <Pressable style={styles.actionBtn}>
                  <Text style={styles.actionBtnText}>Update Progress</Text>
                </Pressable>
                <Pressable style={[styles.actionBtn, styles.secondaryBtn]}>
                  <Text style={styles.secondaryBtnText}>Documents</Text>
                </Pressable>
              </View>
            </View>
          );
        })}
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
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.xxl,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.sizes.base,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  grid: {
    gap: theme.spacing.lg,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xl,
  },
  appTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  appCountry: {
    fontFamily: theme.typography.fontFamily.medium,
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
    fontSize: 10,
    textTransform: 'uppercase',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xs,
  },
  stepItem: {
    flex: 1,
    alignItems: 'center',
  },
  stepVisual: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
    marginBottom: 8,
  },
  stepCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.divider,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  stepCircleActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  innerCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.divider,
  },
  connector: {
    position: 'absolute',
    left: '50%',
    right: '-50%',
    height: 2,
    backgroundColor: theme.colors.divider,
    top: 9,
    zIndex: 1,
  },
  connectorActive: {
    backgroundColor: theme.colors.primary,
  },
  stepLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 10,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  stepLabelActive: {
    color: theme.colors.primary,
    fontFamily: theme.typography.fontFamily.bold,
  },
  cardActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
    paddingTop: theme.spacing.lg,
  },
  actionBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.md,
  },
  actionBtnText: {
    fontFamily: theme.typography.fontFamily.bold,
    color: 'white',
    fontSize: 13,
  },
  secondaryBtn: {
    backgroundColor: theme.colors.background,
  },
  secondaryBtnText: {
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.textPrimary,
    fontSize: 13,
  },
});
