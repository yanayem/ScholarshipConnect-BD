/**
 * SCHOLARSHIP AUDIT: Professional management list.
 * - Material 3 inspired list items.
 * - Advanced filtering and real-time search.
 * - Connected to: apiService, theme.js, router.
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TextInput, TouchableOpacity, ActivityIndicator,
  Alert, Platform, RefreshControl,
  StatusBar
} from 'react-native';
import { theme } from '../../theme';
import { MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { apiService } from '../../services/api';
import { useToast } from '../../components/Toast';
import { Loader } from '../../components/Loader';
import { useCallback } from 'react';

export default function ManageScholarships() {
  const [search, setSearch] = useState('');
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const router = useRouter();
  const { showToast, ToastComponent } = useToast();

  const loadScholarships = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const statusParam = filterStatus === 'all' ? '' : `status=${filterStatus}`;
      const res = await apiService.getScholarships(statusParam);
      if (res.ok) {
        setScholarships(res.data);
      }
    } catch (error) {
      console.log('Error loading admin scholarships', error);
      showToast('Error loading scholarships', 'error');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadScholarships(scholarships.length > 0);
    }, [filterStatus])
  );

  const handleDelete = (id, title) => {
    const performDelete = async () => {
      try {
        const res = await apiService.deleteScholarship(id);
        if (res.ok) {
          showToast('Scholarship deleted', 'success');
          setScholarships(prev => prev.filter(s => s.id !== id));
        } else {
          showToast('Failed to delete', 'error');
        }
      } catch (err) {
        showToast('Network error', 'error');
      }
    };

    Alert.alert(
      'Confirm Deletion',
      `Permanently remove "${title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: performDelete }
      ]
    );
  };

  const handleApprove = async (id, action) => {
    try {
      const res = await apiService.approveScholarship(id, action);
      if (res.ok) {
        showToast(`Scholarship ${action}ed`, 'success');
        loadScholarships();
      } else {
        showToast(`Failed to ${action}`, 'error');
      }
    } catch (err) {
      showToast('Network error', 'error');
    }
  };

  const filtered = scholarships.filter(s =>
    (s.title || '').toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.headerMain}>
            <View style={[styles.statusDot, {
                backgroundColor: item.status === 'active' ? theme.colors.success :
                                 item.status === 'pending' ? theme.colors.warning :
                                 theme.colors.error
            }]} />
            <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
        </View>
        <TouchableOpacity onPress={() => handleDelete(item.id, item.title)}>
            <MaterialCommunityIcons name="delete-sweep-outline" size={22} color={theme.colors.error} />
        </TouchableOpacity>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.metaInfo}>
            <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={14} color={theme.colors.textSecondary} />
                <Text style={styles.metaText}>{item.deadline}</Text>
            </View>
            <View style={styles.metaItem}>
                <Ionicons name="location-outline" size={14} color={theme.colors.textSecondary} />
                <Text style={styles.metaText}>{item.country}</Text>
            </View>
        </View>
      </View>

      <View style={styles.cardActions}>
        {item.status === 'pending' && (
          <View style={styles.approvalRow}>
            <TouchableOpacity
                style={[styles.btnAction, { backgroundColor: theme.colors.primary }]}
                onPress={() => handleApprove(item.id, 'approve')}
            >
                <Text style={styles.btnText}>Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.btnAction, { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.error }]}
                onPress={() => handleApprove(item.id, 'reject')}
            >
                <Text style={[styles.btnText, { color: theme.colors.error }]}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
            style={styles.editBtn}
            onPress={() => router.push(`/admin/edit-scholarship/${item.id}`)}
        >
            <Text style={styles.editBtnText}>Edit Details</Text>
            <MaterialIcons name="edit" size={16} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.surface} />

      {/* Search and Filters */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
            <TextInput
                placeholder="Search scholarship audit log..."
                style={styles.searchInput}
                value={search}
                onChangeText={setSearch}
            />
        </View>

        <View style={styles.filterBox}>
            {['all', 'pending', 'active'].map(st => (
                <TouchableOpacity
                    key={st}
                    style={[styles.chip, filterStatus === st && styles.chipActive]}
                    onPress={() => setFilterStatus(st)}
                >
                    <Text style={[styles.chipText, filterStatus === st && styles.chipTextActive]}>
                        {st.toUpperCase()}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
      </View>

      {loading ? (
        <Loader message="Fetching scholarship records..." />
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadScholarships} />}
          ListEmptyComponent={
            <View style={styles.centered}>
              <MaterialCommunityIcons name="database-off-outline" size={64} color={theme.colors.placeholder} />
              <Text style={styles.emptyText}>No records found</Text>
            </View>
          }
        />
      )}

      {/* Android FAB */}
      <TouchableOpacity
        style={[styles.fab, theme.shadows.premium]}
        onPress={() => router.push('/add-scholarship')}
      >
        <MaterialIcons name="add" size={28} color="#FFF" />
      </TouchableOpacity>
      {ToastComponent}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.surface,
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 15,
  },
  filterBox: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    fontSize: 11,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.textSecondary,
  },
  chipTextActive: {
    color: '#FFF',
  },
  list: {
    padding: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.divider,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  itemTitle: {
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.heading,
  },
  metaInfo: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.textSecondary,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
    paddingTop: 16,
  },
  approvalRow: {
    flexDirection: 'row',
    gap: 8,
  },
  btnAction: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    justifyContent: 'center',
  },
  btnText: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.bold,
    color: '#FFF',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  editBtnText: {
    fontSize: 13,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.primary,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.placeholder,
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 0,
  },
});
