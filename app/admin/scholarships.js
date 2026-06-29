import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Pressable, Modal } from 'react-native';
import { theme } from '../../theme';
import { MaterialIcons } from '@expo/vector-icons';

const SCHOLARSHIPS_DATA = [
  { id: '1', title: 'MEXT Japan Research Scholarship', deadline: '2025-05-15', applications: 450, status: 'Active' },
  { id: '2', title: 'Chevening Masters Scholarship', deadline: '2024-11-01', applications: 1200, status: 'Closed' },
  { id: '3', title: 'Fulbright Foreign Student Program', deadline: '2025-02-28', applications: 320, status: 'Active' },
  { id: '4', title: 'DAAD Development-Related Courses', deadline: '2025-03-31', applications: 180, status: 'Active' },
  { id: '5', title: 'Erasmus Mundus Joint Masters', deadline: '2025-01-15', applications: 890, status: 'Active' },
];

export default function ManageScholarships() {
  const [search, setSearch] = useState('');

  const renderItem = ({ item }) => (
    <View style={[styles.scholarshipItem, theme.shadows.soft]}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <MaterialIcons name="event" size={14} color={theme.colors.textSecondary} />
            <Text style={styles.metaText}>{item.deadline}</Text>
          </View>
          <View style={styles.metaItem}>
            <MaterialIcons name="assignment" size={14} color={theme.colors.textSecondary} />
            <Text style={styles.metaText}>{item.applications} Apps</Text>
          </View>
        </View>
      </View>
      <View style={styles.itemActions}>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'Active' ? theme.colors.mintCard : theme.colors.divider }]}>
          <Text style={[styles.statusText, { color: item.status === 'Active' ? theme.colors.primary : theme.colors.textSecondary }]}>
            {item.status}
          </Text>
        </View>
        <Pressable style={styles.editButton}>
          <MaterialIcons name="edit" size={20} color={theme.colors.primary} />
        </Pressable>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchHeader}>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={20} color={theme.colors.placeholder} />
          <TextInput
            placeholder="Search scholarships..."
            style={styles.input}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <Pressable style={styles.addButton}>
          <MaterialIcons name="add" size={24} color="white" />
          <Text style={styles.addButtonText}>Add New</Text>
        </Pressable>
      </View>

      <FlatList
        data={SCHOLARSHIPS_DATA}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  searchHeader: {
    padding: theme.spacing.lg,
    flexDirection: 'row',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    height: 48,
  },
  input: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.sizes.sm,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
  },
  addButtonText: {
    color: 'white',
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.sm,
  },
  listContent: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  scholarshipItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  itemTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.base,
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
  },
  itemActions: {
    alignItems: 'flex-end',
    gap: theme.spacing.md,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
  },
  statusText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
