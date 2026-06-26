import { View, Text, StyleSheet, Pressable } from 'react-native';
import { theme } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

export default function MentorCard({ name, role, company, matchPercentage }) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{name.charAt(0)}</Text>
        </View>
        <View style={styles.matchBadge}>
          <Text style={styles.matchText}>{matchPercentage}% Match</Text>
        </View>
      </View>
      <View style={styles.content}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.role}>{role}</Text>
        <Text style={styles.company}>at {company}</Text>
      </View>
      <Pressable style={styles.connectBtn}>
        <Text style={styles.connectBtnText}>Connect</Text>
        <Ionicons name="chatbubble-outline" size={16} color={theme.colors.textPrimary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.communityMint,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    width: 240,
    marginRight: theme.spacing.md,
    ...theme.shadows.soft,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.textPrimary,
  },
  matchBadge: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  matchText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textPrimary,
  },
  content: {
    marginBottom: theme.spacing.lg,
  },
  name: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.sizes.base,
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  role: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
  },
  company: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
  },
  connectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
  },
  connectBtnText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textPrimary,
  },
});
