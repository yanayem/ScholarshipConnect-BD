/**
 * MANAGE SCHOLARSHIPS: Admin interface to list, edit, and delete programs.
 * - Real-time search and filtering.
 * - Integration with delete API with confirmation alerts.
 * - Connected to: apiService.getScholarships, apiService.deleteScholarship, theme.js.
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, ScrollView,
  TextInput, TouchableOpacity, ActivityIndicator,
  Alert, ToastAndroid, Platform
} from 'react-native';
import { theme } from '../../theme';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { apiService } from '../../services/api';

export default function ManageScholarships() {
  const [search, setSearch] = useState('');
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const router = useRouter();

  const loadScholarships = async () => {
    setLoading(true);
    try {
      // Fetch based on status filter
      const statusParam = filterStatus === 'all' ? '' : `status=${filterStatus}`;
      const res = await apiService.getScholarships(statusParam);
      if (res.ok) {
        setScholarships(res.data);
      }
    } catch (error) {
      console.log('Error loading admin scholarships', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScholarships();
  }, [filterStatus]);

  const showToast = (msg) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    }
  };

  const handleDelete = (id, title) => {
    const performDelete = async () => {
      try {
        const res = await apiService.deleteScholarship(id);
        if (res.ok) {
          showToast('Scholarship deleted');
          setScholarships(prev => prev.filter(s => s.id !== id));
        } else {
          Alert.alert('Error', 'Failed to delete');
        }
      } catch (err) {
        Alert.alert('Error', 'Network error');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
        performDelete();
      }
    } else {
      Alert.alert(
        'Confirm Delete',
        `Are you sure you want to delete "${title}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: performDelete }
        ]
      );
    }
  };

  const handleApprove = async (id, action) => {
    try {
      const res = await apiService.approveScholarship(id, action);
      if (res.ok) {
        showToast(`Scholarship ${action}ed`);
        loadScholarships();
      } else {
        Alert.alert('Error', `Failed to ${action}`);
      }
    } catch (err) {
      Alert.alert('Error', 'Network error');
    }
  };

  const filtered = scholarships.filter(s =>
    (s.title || '').toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <View style={[styles.scholarshipItem, theme.shadows.soft]}>
      <View style={styles.itemInfo}>
        <View style={styles.titleRow}>
          <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
          <View style={[
            styles.statusPill,
            { backgroundColor: item.status === 'active' ? theme.colors.mintCard : item.status === 'pending' ? theme.colors.yellowCard : theme.colors.errorLight }
          ]}>
            <Text style={[
              styles.statusPillText,
              { color: item.status === 'active' ? theme.colors.success : item.status === 'pending' ? theme.colors.warning : theme.colors.error }
            ]}>{item.status}</Text>
          </View>
        </View>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <MaterialIcons name="event" size={14} color={theme.colors.textSecondary} />
            <Text style={styles.metaText}>{item.deadline}</Text>
          </View>
          <View style={styles.metaItem}>
            <MaterialIcons name="place" size={14} color={theme.colors.textSecondary} />
            <Text style={styles.metaText}>{item.country}</Text>
          </View>
        </View>
      </View>

      <View style={styles.itemActions}>
        {item.status === 'pending' && (
          <>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: theme.colors.mintCard }]}
              onPress={() => handleApprove(item.id, 'approve')}
            >
              <MaterialIcons name="check" size={20} color={theme.colors.success} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: theme.colors.errorLight }]}
              onPress={() => handleApprove(item.id, 'reject')}
            >
              <MaterialIcons name="close" size={20} color={theme.colors.error} />
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: theme.colors.primaryLight }]}
          onPress={() => router.push(`/admin/edit-scholarship/${item.id}`)}
          activeOpacity={0.7}
        >
          <MaterialIcons name="edit" size={20} color={theme.colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: theme.colors.errorLight }]}
          onPress={() => handleDelete(item.id, item.title)}
          activeOpacity={0.7}
        >
          <MaterialIcons name="delete-outline" size={20} color={theme.colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchHeader}>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={20} color={theme.colors.placeholder} />
          <TextInput
            placeholder="Search..."
            placeholderTextColor={theme.colors.placeholder}
            style={styles.input}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Status Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {['all', 'pending', 'active', 'rejected'].map(st => (
            <TouchableOpacity
              key={st}
              style={[styles.statusChip, filterStatus === st && styles.statusChipActive]}
              onPress={() => setFilterStatus(st)}
            >
              <Text style={[styles.statusChipText, filterStatus === st && styles.statusChipTextActive]}>
                {st.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/admin/add-scholarship')}
        >
          <MaterialIcons name="add" size={22} color="white" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="search-off" size={48} color={theme.colors.placeholder} />
              <Text style={styles.emptyText}>No scholarships found</Text>
            </View>
          }
          onRefresh={loadScholarships}
          refreshing={loading}
        />
      )}
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
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
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
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderRadius: theme.borderRadius.md,
    gap: 4,
  },
  addButtonText: {
    color: 'white',
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 14,
  },
  listContent: {
    padding: theme.spacing.lg,
    paddingBottom: 40,
    gap: 12,
  },
  scholarshipItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 16,
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
    fontSize: 15,
    color: theme.colors.heading,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  itemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 16,
    color: theme.colors.placeholder,
    marginTop: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusPillText: {
    fontSize: 10,
    fontFamily: theme.typography.fontFamily.bold,
    textTransform: 'uppercase',
  },
  filterRow: {
    flexDirection: 'row',
    marginHorizontal: 4,
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    marginRight: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    height: 32,
    justifyContent: 'center',
  },
  statusChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  statusChipText: {
    fontSize: 10,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.textSecondary,
  },
  statusChipTextActive: {
    color: '#fff',
  },
});
