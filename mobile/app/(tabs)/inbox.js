import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, StatusBar, Platform, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { theme } from '../../theme';
import { apiService } from '../../services/api';

export default function SessionsScreen() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const loadData = async () => {
    try {
      const userRes = await apiService.getProfile();
      if (userRes.ok) setCurrentUser(userRes.data);

      const mentorshipRes = await apiService.getMentorships();
      if (mentorshipRes.ok) setSessions(mentorshipRes.data);
    } catch (error) {
      console.error('Failed to load sessions', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleUpdateStatus = async (sessionId, status) => {
    const statusText = status === 'approved' ? 'Approve' : (status === 'rejected' ? 'Reject' : 'Complete');

    Alert.alert(
      'Update Session',
      `Are you sure you want to ${statusText.toLowerCase()} this session?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: statusText,
          onPress: async () => {
            const res = await apiService.updateMentorshipStatus(sessionId, status);
            if (res.ok) {
              Alert.alert('Success', `Session ${statusText.toLowerCase()}d!`);
              loadData();
            } else {
              Alert.alert('Error', res.data?.detail || res.data?.error || 'Failed to update status');
            }
          }
        }
      ]
    );
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'approved': return { bg: theme.colors.mintCard, color: theme.colors.success };
      case 'rejected': return { bg: theme.colors.errorLight, color: theme.colors.error };
      case 'completed': return { bg: theme.colors.lavenderCard, color: theme.colors.chartSecondary };
      default: return { bg: theme.colors.background, color: theme.colors.textSecondary };
    }
  };

  const renderSession = ({ item }) => {
    const isMentor = currentUser && item.mentor === currentUser.user_id;
    const statusStyle = getStatusStyle(item.status);

    return (
      <View style={[styles.card, theme.shadows.soft]}>
        <View style={styles.cardHeader}>
          <View style={styles.topicRow}>
            <Text style={styles.topicText}>{item.topic}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
              <Text style={[styles.statusText, { color: statusStyle.color }]}>
                {item.status.toUpperCase()}
              </Text>
            </View>
          </View>
          <Text style={styles.dateText}>
            <MaterialIcons name="event" size={14} /> {item.scheduled_date || 'TBD'} at {item.scheduled_time?.substring(0, 5) || 'TBD'}
          </Text>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
             <MaterialIcons name={isMentor ? "person" : "school"} size={16} color={theme.colors.textSecondary} />
             <Text style={styles.infoText}>
               {isMentor ? `Mentee: ${item.mentee_name || 'Student'}` : `Mentor: ${item.mentor_name || 'Scholar'}`}
             </Text>
          </View>
          <Text style={styles.messageText} numberOfLines={3}>{item.message}</Text>
        </View>

        {isMentor && item.status === 'pending' && (
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.rejectBtn]}
              onPress={() => handleUpdateStatus(item.id, 'rejected')}
            >
              <Text style={styles.rejectBtnText}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.approveBtn]}
              onPress={() => handleUpdateStatus(item.id, 'approved')}
            >
              <Text style={styles.approveBtnText}>Approve</Text>
            </TouchableOpacity>
          </View>
        )}

        {isMentor && item.status === 'approved' && (
          <TouchableOpacity
            style={[styles.actionBtn, styles.completeBtn]}
            onPress={() => handleUpdateStatus(item.id, 'completed')}
          >
            <Text style={styles.completeBtnText}>Mark as Completed</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mentorship Sessions</Text>
      </View>

      <FlatList
        data={sessions}
        renderItem={renderSession}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 100 }} />
          ) : (
            <View style={styles.empty}>
              <FontAwesome5 name="calendar-check" size={64} color={theme.colors.placeholder} />
              <Text style={styles.emptyText}>No mentorship sessions found.</Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: theme.colors.divider
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.heading },
  list: { padding: 20 },
  card: {
    backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 16,
    borderLeftWidth: 5, borderLeftColor: theme.colors.primary,
    ...theme.shadows.soft
  },
  cardHeader: { marginBottom: 12 },
  topicRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  topicText: { fontSize: 16, fontWeight: 'bold', color: theme.colors.heading, flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: 'bold' },
  dateText: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 4 },
  cardBody: { marginBottom: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  infoText: { fontSize: 14, color: theme.colors.primary, fontWeight: '600' },
  messageText: { fontSize: 13, color: theme.colors.textSecondary, lineHeight: 18 },
  cardActions: { flexDirection: 'row', gap: 12 },
  actionBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  approveBtn: { backgroundColor: theme.colors.primary },
  approveBtnText: { color: '#fff', fontWeight: 'bold' },
  rejectBtn: { backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.error },
  rejectBtnText: { color: theme.colors.error, fontWeight: 'bold' },
  completeBtn: { backgroundColor: theme.colors.success, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  completeBtnText: { color: '#fff', fontWeight: 'bold' },
  empty: { alignItems: 'center', marginTop: 100, gap: 16 },
  emptyText: { color: theme.colors.placeholder, fontSize: 15 }
});
