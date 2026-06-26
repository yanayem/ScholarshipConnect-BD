import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

export default function ScholarshipCard({ title, organization, deadline, amount, type = 'standard' }) {
  
  const getCardStyle = () => {
    switch(type) {
      case 'featured': return { backgroundColor: theme.colors.primaryAccent };
      case 'deadline': return { backgroundColor: theme.colors.secondaryAccent };
      default: return { backgroundColor: theme.colors.surface };
    }
  };

  return (
    <View style={[styles.card, getCardStyle()]}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="school" size={24} color={theme.colors.textPrimary} />
        </View>
        <Text style={styles.amount}>{amount}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        <Text style={styles.organization}>{organization}</Text>
      </View>
      <View style={styles.footer}>
        <View style={styles.deadlineContainer}>
          <Ionicons name="time-outline" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.deadlineText}>Ends {deadline}</Text>
        </View>
        <Pressable style={styles.applyBtn}>
          <Text style={styles.applyBtnText}>Apply</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    width: 300,
    marginRight: theme.spacing.md,
    ...theme.shadows.soft,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  amount: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.textPrimary,
  },
  content: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.sizes.base,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  organization: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deadlineText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
  },
  applyBtn: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    ...theme.shadows.soft,
  },
  applyBtnText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textPrimary,
  },
});
