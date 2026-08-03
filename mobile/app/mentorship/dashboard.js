import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, StatusBar, Platform, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { theme } from '../../theme';
import { apiService } from '../../services/api';

export default function MentorDashboardScreen() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [contributionData, setContributionData] = useState({
    scholarships: 0,
    discussions: 0,
    solved: 0
  });

  const loadData = async () => {
    try {
      const userRes = await apiService.getProfile();
      if (userRes.ok) setCurrentUser(userRes.data);

      const [mentorshipRes, scholarRes, communityRes] = await Promise.all([
        apiService.getMentorships(),
        apiService.getScholarships(),
        apiService.getDiscussions()
      ]);

      if (mentorshipRes.ok) setSessions(mentorshipRes.data);

      // Filter contributions by current user
      if (scholarRes.ok && userRes.ok) {
        const myScholarships = (scholarRes.data.results || scholarRes.data).filter(s => s.submitted_by === userRes.data.user_id);
        const myDiscussions = (communityRes.data.results || communityRes.data).filter(d => d.author === userRes.data.user_id);

        setContributionData({
          scholarships: myScholarships.length,
          discussions: myDiscussions.length,
          solved: myDiscussions.filter(d => d.is_solved).length
        });
      }
    } catch (error) {
      console.error('Failed to load dashboard data', error);
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

  const renderHeader = () => {
    const total = sessions.length;
    const pending = sessions.filter(s => s.status === 'pending').length;
    const completed = sessions.filter(s => s.status === 'completed').length;
    const successRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return (
      <View style={styles.dashboardHeader}>
        {/* Profile Identity Card */}
        <View style={[styles.identityCard, theme.shadows.soft]}>
          <View style={styles.identityTop}>
            <View style={styles.identityText}>
              <Text style={styles.identityName}>{currentUser?.full_name || currentUser?.username}</Text>
              <View style={styles.badgeRow}>
                <View style={styles.mentorBadge}>
                  <MaterialIcons name="verified" size={12} color="#fff" />
                  <Text style={styles.mentorBadgeText}>VERIFIED MENTOR</Text>
                </View>
                <Text style={styles.memberSince}>Since {new Date(currentUser?.created_at).getFullYear() || '2024'}</Text>
              </View>
            </View>
            <View style={styles.pointsCircle}>
               <Text style={styles.pointsVal}>{currentUser?.scholar_points || 0}</Text>
               <Text style={styles.pointsUnit}>PTS</Text>
            </View>
          </View>

          <View style={styles.expertiseDivider} />

          <View style={styles.expertiseRow}>
            <MaterialIcons name="psychology" size={18} color={theme.colors.primary} />
            <Text style={styles.expertiseText}>
              Expertise: <Text style={{fontWeight: 'bold'}}>{currentUser?.expertise_areas || 'General Mentorship'}</Text>
            </Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsGrid}>
          <View style={[styles.statBox, { backgroundColor: theme.colors.primaryLight }]}>
            <Text style={styles.statNum}>{total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: theme.colors.warningLight }]}>
            <Text style={[styles.statNum, { color: theme.colors.warning }]}>{pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: theme.colors.mintCard }]}>
            <Text style={[styles.statNum, { color: theme.colors.success }]}>{successRate}%</Text>
            <Text style={styles.statLabel}>Success Rate</Text>
          </View>
        </View>

        {/* Contribution Data Section */}
        <View style={styles.contributionCard}>
           <Text style={styles.contributionTitle}>Community Impact</Text>
           <View style={styles.contributionRow}>
              <View style={styles.contribItem}>
                 <MaterialIcons name="school" size={20} color={theme.colors.primary} />
                 <Text style={styles.contribVal}>{contributionData.scholarships}</Text>
                 <Text style={styles.contribLabel}>Scholarships</Text>
              </View>
              <View style={styles.contribDivider} />
              <View style={styles.contribItem}>
                 <MaterialIcons name="forum" size={20} color={theme.colors.chartSecondary} />
                 <Text style={styles.contribVal}>{contributionData.discussions}</Text>
                 <Text style={styles.contribLabel}>Discussions</Text>
              </View>
              <View style={styles.contribDivider} />
              <View style={styles.contribItem}>
                 <MaterialIcons name="check-circle" size={20} color={theme.colors.success} />
                 <Text style={styles.contribVal}>{contributionData.solved}</Text>
                 <Text style={styles.contribLabel}>Problems Solved</Text>
              </View>
           </View>
        </View>



        <TouchableOpacity
          style={styles.editProfileBanner}
          onPress={() => router.push('/edit-profile')}
        >
          <View style={styles.bannerInfo}>
            <View style={[styles.iconCircle, { backgroundColor: '#f0f0f0' }]}>
               <MaterialIcons name="edit" size={20} color={theme.colors.textSecondary} />
            </View>
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.bannerTitle}>Edit Mentorship Profile</Text>
              <Text style={styles.bannerSub}>Update your expertise and bio to attract more students.</Text>
            </View>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={theme.colors.divider} />
        </TouchableOpacity>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Mentorship Requests</Text>
          <View style={styles.requestCount}>
            <Text style={styles.requestCountText}>{pending} New</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
           <MaterialIcons name="arrow-back" size={24} color={theme.colors.heading} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mentor Dashboard</Text>
      </View>

      <FlatList
        data={sessions}
        renderItem={renderSession}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
        }
        // ... rest of the code ...
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
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: theme.colors.divider
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.heading, marginLeft: 16 },
  list: { padding: 20 },
  dashboardHeader: { marginBottom: 24 },
  identityCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  identityTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  identityText: { flex: 1 },
  identityName: { fontSize: 20, fontWeight: 'bold', color: theme.colors.heading },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6 },
  mentorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4
  },
  mentorBadgeText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
  memberSince: { fontSize: 11, color: theme.colors.textSecondary },
  pointsCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primaryLight
  },
  pointsVal: { fontSize: 18, fontWeight: 'bold', color: theme.colors.primary },
  pointsUnit: { fontSize: 8, color: theme.colors.textSecondary, fontWeight: 'bold' },
  expertiseDivider: {
    height: 1,
    backgroundColor: theme.colors.divider,
    marginVertical: 15,
  },
  expertiseRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  expertiseText: { fontSize: 13, color: theme.colors.textPrimary },

  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statBox: { flex: 1, padding: 16, borderRadius: 16, alignItems: 'center', ...theme.shadows.soft },
  statNum: { fontSize: 22, fontWeight: 'bold', color: theme.colors.primary },
  statLabel: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 4 },
  editProfileBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 24,
    ...theme.shadows.soft
  },
  bannerInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconCircle: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center'
  },
  bannerTitle: { fontSize: 14, fontWeight: 'bold', color: theme.colors.heading },
  bannerSub: { fontSize: 11, color: theme.colors.textSecondary, marginTop: 2 },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.heading },
  requestCount: {
    backgroundColor: theme.colors.errorLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20
  },
  requestCountText: { fontSize: 11, color: theme.colors.error, fontWeight: 'bold' },

  contributionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    ...theme.shadows.soft,
    borderWidth: 1,
    borderColor: theme.colors.divider
  },
  contributionTitle: { color: theme.colors.heading, fontSize: 16, fontWeight: 'bold', marginBottom: 20 },
  contributionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  contribItem: { flex: 1, alignItems: 'center' },
  contribVal: { color: theme.colors.primary, fontSize: 18, fontWeight: 'bold', marginTop: 8 },
  contribLabel: { color: theme.colors.textSecondary, fontSize: 10, marginTop: 2, textAlign: 'center' },
  contribDivider: { width: 1, height: 40, backgroundColor: theme.colors.divider },
  card: {
    backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 16,
    borderLeftWidth: 5, borderLeftColor: theme.colors.primary,
    ...theme.shadows.soft
  },
  // ... rest of the existing styles ...
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
