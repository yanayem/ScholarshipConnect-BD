import React from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';
import { theme } from '../../theme';
import { MaterialIcons } from '@expo/vector-icons';

const USERS_DATA = [
  { id: '1', name: 'Anisur Rahman', email: 'anis@example.com', role: 'Student', joined: '2024-10-01' },
  { id: '2', name: 'Farzana Yasmin', email: 'farzana@example.com', role: 'Premium', joined: '2024-09-15' },
  { id: '3', name: 'Sabbir Ahmed', email: 'sabbir@example.com', role: 'Student', joined: '2024-10-05' },
  { id: '4', name: 'Admin User', email: 'admin@scholarshipconnect.bd', role: 'Admin', joined: '2024-01-01' },
];

export default function UserManagement() {
  const renderItem = ({ item }) => (
    <View style={styles.userRow}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.name[0]}</Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
      </View>
      <View style={styles.userMeta}>
        <View style={[styles.roleBadge, { backgroundColor: item.role === 'Admin' ? theme.colors.lavenderCard : theme.colors.background }]}>
          <Text style={styles.roleText}>{item.role}</Text>
        </View>
        <Text style={styles.joinedText}>Since {item.joined}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.countText}>{USERS_DATA.length} Total Registered Users</Text>
      </View>

      <FlatList
        data={USERS_DATA}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  header: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  countText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  avatarText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.primary,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.base,
    color: theme.colors.textPrimary,
  },
  userEmail: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
  },
  userMeta: {
    alignItems: 'flex-end',
    gap: 4,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roleText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 10,
    color: theme.colors.textPrimary,
  },
  joinedText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 10,
    color: theme.colors.placeholder,
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.divider,
    marginHorizontal: theme.spacing.lg,
  }
});
