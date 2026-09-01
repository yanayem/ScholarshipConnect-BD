/**
 * SCHOLARSHIP AUDIT: Professional management list.
 * - Material 3 inspired list items.
 * - Advanced filtering and real-time search.
 * - Connected to: apiService, theme.js, router.
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TextInput, TouchableOpacity, RefreshControl,
  StatusBar, Alert, Modal, ActivityIndicator,
  Platform
} from 'react-native';
import { theme } from '../../theme';
import { cacheService } from '../../services/cache';
import { MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { apiService } from '../../services/api';
import { useToast } from '../../components/Toast';
import { Loader } from '../../components/Loader';
import { useCallback } from 'react';
import ScholarshipCard from '../../components/cards/ScholarshipCard';

export default function ManageScholarships() {
  const [search, setSearch] = useState('');
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [rejectingItem, setRejectingItem] = useState(null);
  const [rejectionNote, setRejectionNote] = useState('');
  const [isRejectModalVisible, setIsRejectModalVisible] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  // New: Generic Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    visible: false,
    title: '',
    message: '',
    actionType: '', // 'approve' or 'delete'
    targetId: null,
    targetTitle: ''
  });

  const router = useRouter();
  const { showToast, ToastComponent } = useToast();

  const loadScholarships = async (silent = false) => {
    // 1. Try Cache First (only for initial load and if no search/filters)
    if (!silent && !search && filterStatus === 'all') {
        try {
            const cached = await cacheService.get('admin_scholarships');
            if (cached) {
                setScholarships(cached);
                setLoading(false);
            }
        } catch (e) {}
    }

    if (!silent && !scholarships.length) setLoading(true);

    try {
      let params = filterStatus === 'all' || filterStatus === 'archive' ? '' : `status=${filterStatus}`;
      if (search) {
        params += (params ? '&' : '') + `search=${search}`;
      }
      const res = await apiService.getScholarships(params);
      if (res.ok) {
        let data = res.data;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (filterStatus === 'archive') {
          data = data.filter(s => new Date(s.deadline) < today);
        } else {
          data = data.filter(s => new Date(s.deadline) >= today);
        }

        setScholarships(data);

        // Only cache the main 'all' list without search
        if (!search && filterStatus === 'all') {
            await cacheService.set('admin_scholarships', data, 10);
        }
      }
    } catch (error) {
      console.log('Error loading admin scholarships', error);
      if (!scholarships.length) showToast('Error loading scholarships', 'error');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadScholarships(scholarships.length > 0);
    }, [filterStatus, search])
  );

  const handleDelete = (id, title) => {
    setConfirmModal({
        visible: true,
        title: 'Confirm Deletion',
        message: `Are you sure you want to permanently remove "${title}"? This action cannot be undone.`,
        actionType: 'delete',
        targetId: id,
        targetTitle: title
    });
  };

  const handleApprove = async (id, action) => {
    if (action === 'approve') {
        const item = scholarships.find(s => s.id === id);
        setConfirmModal({
            visible: true,
            title: 'Confirm Approval',
            message: `Are you sure you want to approve "${item?.title}"? This will make it visible to all users and award 200 points to the submitter.`,
            actionType: 'approve',
            targetId: id,
            targetTitle: item?.title || ''
        });
    } else if (action === 'reject') {
      const item = scholarships.find(s => s.id === id);
      setRejectingItem(item);
      setRejectionNote('');
      setIsRejectModalVisible(true);
    }
  };

  const executeConfirmedAction = async () => {
    const { actionType, targetId } = confirmModal;
    if (!targetId) return;

    setProcessingId(targetId);
    setConfirmModal(prev => ({ ...prev, visible: false }));

    try {
      let res;
      if (actionType === 'approve') {
        res = await apiService.approveScholarship(targetId, 'approve');
        if (res.ok) {
          showToast('Scholarship approved', 'success');
          await loadScholarships(true);
        } else {
          showToast(res.data?.error || 'Failed to approve', 'error');
        }
      } else if (actionType === 'delete') {
        res = await apiService.deleteScholarship(targetId);
        if (res.ok) {
          showToast('Scholarship deleted', 'success');
          setScholarships(prev => prev.filter(s => s.id !== targetId));
        } else {
          showToast('Failed to delete', 'error');
        }
      }
    } catch (err) {
      showToast('Network error', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const confirmRejection = async () => {
    if (!rejectingItem) return;

    setProcessingId(rejectingItem.id);
    try {
      const res = await apiService.approveScholarship(rejectingItem.id, 'reject', rejectionNote);
      if (res.ok) {
        showToast('Scholarship rejected', 'success');
        setIsRejectModalVisible(false);
        setRejectingItem(null);
        await loadScholarships(true);
      } else {
        showToast(res.data?.error || 'Failed to reject', 'error');
      }
    } catch (err) {
      showToast('Network error', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const renderItem = ({ item, index }) => (
    <View style={processingId === item.id ? { opacity: 0.6 } : null}>
      <ScholarshipCard
        item={item}
        index={index}
        isAdmin={true}
        onPress={() => router.push(`/scholarships/${item.id}`)}
        onDelete={handleDelete}
        onApprove={handleApprove}
        onReject={handleApprove}
        onEdit={(id) => router.push(`/admin/edit-scholarship/${id}`)}
      />
      {processingId === item.id && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      )}
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
                returnKeyType="search"
                onSubmitEditing={() => loadScholarships()}
            />
        </View>

        <View style={styles.filterBox}>
            {['all', 'pending', 'active', 'archive'].map(st => (
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

      {loading && scholarships.length === 0 ? (
        <Loader message="Fetching scholarship records..." />
      ) : (
        <FlatList
          data={scholarships}
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

      {/* Rejection Modal */}
      <Modal
        visible={isRejectModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsRejectModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reject Scholarship</Text>
            <Text style={styles.modalText}>
              Are you sure you want to reject "{rejectingItem?.title}"? This will deduct 50 points from the user.
            </Text>

            <Text style={styles.modalLabel}>Optional Note (Reason for rejection):</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g., Missing document link, expired..."
              value={rejectionNote}
              onChangeText={setRejectionNote}
              multiline
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => setIsRejectModalVisible(false)}
              >
                <Text style={styles.modalBtnTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnReject]}
                onPress={confirmRejection}
              >
                <Text style={styles.modalBtnTextReject}>Confirm Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Generic Confirmation Modal (Replaces window.confirm/Alert) */}
      <Modal
        visible={confirmModal.visible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setConfirmModal({ ...confirmModal, visible: false })}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{confirmModal.title}</Text>
            <Text style={styles.modalText}>{confirmModal.message}</Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => setConfirmModal({ ...confirmModal, visible: false })}
              >
                <Text style={styles.modalBtnTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                    styles.modalBtn,
                    confirmModal.actionType === 'delete' ? styles.modalBtnReject : { backgroundColor: theme.colors.primary }
                ]}
                onPress={executeConfirmedAction}
              >
                <Text style={styles.modalBtnTextReject}>
                    {confirmModal.actionType === 'delete' ? 'Delete' : 'Approve'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 24,
    ...theme.shadows.soft,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.heading,
    marginBottom: 12,
  },
  modalText: {
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.textPrimary,
    lineHeight: 20,
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 13,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.colors.divider,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBtnCancel: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.divider,
  },
  modalBtnReject: {
    backgroundColor: theme.colors.error,
  },
  modalBtnTextCancel: {
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.textSecondary,
  },
  modalBtnTextReject: {
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.bold,
    color: '#FFF',
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
    zIndex: 10,
  }
});
