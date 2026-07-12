/**
 * MENTOR MANAGEMENT: Review and approve mentor applications.
 * - List of students who applied to be mentors.
 * - Actions: Approve or Reject application.
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, StatusBar, RefreshControl,
  ActivityIndicator, Image, Alert
} from 'react-native';
import { theme } from '../../theme';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { apiService } from '../../services/api';
import { useToast } from '../../components/Toast';

export default function MentorManagement() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { showToast, ToastComponent } = useToast();

  const loadApplications = async () => {
    try {
      setLoading(true);
      const res = await apiService.getMentorApplications();
      if (res.ok) {
        setApplications(res.data);
      }
    } catch (e) {
      console.error('[ADMIN] Failed to load mentor applications:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleDecision = (id, status, name) => {
    const title = status === 'approved' ? 'Approve Mentor' : 'Reject Application';
    const msg = `Are you sure you want to ${status} ${name} as a mentor?`;

    Alert.alert(title, msg, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: status.toUpperCase(),
        style: status === 'rejected' ? 'destructive' : 'default',
        onPress: async () => {
          const res = await apiService.approveMentor(id, status);
          if (res.ok) {
            showToast(`Mentor ${status} successfully`, 'success');
            loadApplications();
          }
        }
      }
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.profileSection}>
        <View style={styles.avatarBox}>
          {item.profile_picture ? (
            <Image source={{ uri: item.profile_picture }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.initialsAvatar]}>
              <Text style={styles.avatarText}>{(item.full_name || 'M')[0]}</Text>
            </View>
          )}
        </View>
        <View style={styles.mainInfo}>
          <Text style={styles.mentorName}>{item.full_name}</Text>
          <Text style={styles.mentorEmail}>{item.email}</Text>
          <View style={styles.expertiseRow}>
            <FontAwesome5 name="graduation-cap" size={12} color={theme.colors.primary} />
            <Text style={styles.expertiseText}>{item.expertise || 'Scholarship Expert'}</Text>
          </View>
        </View>
        <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{item.status || 'PENDING'}</Text>
        </View>
      </View>

      <View style={styles.detailBox}>
        <Text style={styles.detailLabel}>Motivation / Bio:</Text>
        <Text style={styles.detailText}>{item.bio || 'No bio provided'}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.rejectBtn]}
          onPress={() => handleDecision(item.id, 'rejected', item.full_name)}
        >
          <MaterialIcons name="close" size={20} color={theme.colors.error} />
          <Text style={[styles.actionLabel, { color: theme.colors.error }]}>Reject</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity
          style={[styles.actionBtn, styles.approveBtn]}
          onPress={() => handleDecision(item.id, 'approved', item.full_name)}
        >
          <MaterialIcons name="check" size={20} color={theme.colors.success} />
          <Text style={[styles.actionLabel, { color: theme.colors.success }]}>Approve Mentor</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.surface} />
      {ToastComponent}

      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color={theme.colors.heading} />
          </TouchableOpacity>
          <Text style={styles.title}>Mentor Requests</Text>
        </View>
        <Text style={styles.subtitle}>Review students who want to become official mentors</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={applications}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadApplications} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={80} color={theme.colors.placeholder} />
              <Text style={styles.emptyText}>No new mentor applications.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingTop: 50,
    paddingHorizontal: 24,
    paddingBottom: 20,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  title: { fontSize: 22, fontFamily: theme.typography.fontFamily.bold, color: theme.colors.heading },
  subtitle: { fontSize: 13, color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.medium },
  list: { padding: 16 },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.divider,
    overflow: 'hidden',
    ...theme.shadows.soft
  },
  profileSection: { flexDirection: 'row', padding: 16, alignItems: 'center' },
  avatarBox: { marginRight: 14 },
  avatar: { width: 56, height: 56, borderRadius: 28 },
  initialsAvatar: { backgroundColor: theme.colors.primaryLight, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 22, color: theme.colors.primary, fontFamily: theme.typography.fontFamily.bold },
  mainInfo: { flex: 1 },
  mentorName: { fontSize: 16, fontFamily: theme.typography.fontFamily.bold, color: theme.colors.heading },
  mentorEmail: { fontSize: 13, color: theme.colors.textSecondary },
  expertiseRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  expertiseText: { fontSize: 12, color: theme.colors.primary, fontFamily: theme.typography.fontFamily.bold },
  statusBadge: { backgroundColor: theme.colors.warningLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 10, color: theme.colors.warning, fontFamily: theme.typography.fontFamily.bold },
  detailBox: { padding: 16, backgroundColor: '#FAFAFA', marginHorizontal: 16, borderRadius: 16, marginBottom: 16 },
  detailLabel: { fontSize: 11, fontFamily: theme.typography.fontFamily.bold, color: theme.colors.textSecondary, marginBottom: 4 },
  detailText: { fontSize: 13, color: theme.colors.textPrimary, lineHeight: 18 },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 8
  },
  actionLabel: { fontSize: 14, fontFamily: theme.typography.fontFamily.bold },
  divider: { width: 1, backgroundColor: theme.colors.divider },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 16, fontSize: 15, color: theme.colors.placeholder, fontFamily: theme.typography.fontFamily.medium }
});
