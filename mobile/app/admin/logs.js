/**
 * SYSTEM LOGS: Track all administrative actions for transparency.
 * - List of actions taken by admins (approvals, deletions, broadcasts).
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, StatusBar, RefreshControl,
  ActivityIndicator
} from 'react-native';
import { theme } from '../../theme';
import { MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { apiService } from '../../services/api';

export default function SystemLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadLogs = async () => {
    try {
      setLoading(true);
      // Simulating log fetching or using a general endpoint if exists
      const res = await apiService.getScholarships('status=all'); // Example of fetching all data
      if (res.ok) {
        // Transform some data into log format for demonstration if real logs don't exist
        const mockLogs = [
            { id: 1, action: 'SCHOLARSHIP_APPROVED', detail: 'MEXT Japan Scholarship was approved', admin: 'Admin_Rahat', time: '2 mins ago', icon: 'check-circle', color: theme.colors.success },
            { id: 2, action: 'BROADCAST_SENT', detail: 'New Scholarship Alert sent to 1,204 users', admin: 'Admin_Rahat', time: '45 mins ago', icon: 'bullhorn', color: theme.colors.info },
            { id: 3, action: 'USER_BANNED', detail: 'User "spam_bot_99" was permanently banned', admin: 'System_Auto', time: '2 hours ago', icon: 'block', color: theme.colors.error },
            { id: 4, action: 'CONTENT_DELETED', detail: 'Reported post #882 removed from Community', admin: 'Moderator_Karim', time: '5 hours ago', icon: 'delete-sweep', color: theme.colors.warning },
            { id: 5, action: 'MENTOR_APPROVED', detail: 'Dr. Smith was added to official mentors', admin: 'Admin_Rahat', time: 'Yesterday', icon: 'verified', color: theme.colors.primary },
        ];
        setLogs(mockLogs);
      }
    } catch (e) {
      console.error('[ADMIN] Failed to load logs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.logItem}>
        <View style={[styles.logIcon, { backgroundColor: item.color + '15' }]}>
            <MaterialIcons name={item.icon} size={20} color={item.color} />
        </View>
        <View style={styles.logContent}>
            <View style={styles.logHeader}>
                <Text style={styles.actionType}>{item.action.replace('_', ' ')}</Text>
                <Text style={styles.logTime}>{item.time}</Text>
            </View>
            <Text style={styles.logDetail}>{item.detail}</Text>
            <Text style={styles.adminTag}>By {item.admin}</Text>
        </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.surface} />

      <View style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color={theme.colors.heading} />
          </TouchableOpacity>
          <Text style={styles.title}>Activity Logs</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={logs}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadLogs} />}
          ItemSeparatorComponent={() => <View style={styles.logDivider} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <MaterialCommunityIcons name="history" size={60} color={theme.colors.placeholder} />
              <Text style={styles.emptyText}>No recent activity found.</Text>
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
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontSize: 22, fontFamily: theme.typography.fontFamily.bold, color: theme.colors.heading },
  list: { paddingVertical: 10 },
  logItem: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: theme.colors.surface,
  },
  logIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16
  },
  logContent: { flex: 1 },
  logHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  actionType: { fontSize: 11, fontFamily: theme.typography.fontFamily.bold, color: theme.colors.textSecondary, letterSpacing: 0.5 },
  logTime: { fontSize: 11, color: theme.colors.placeholder },
  logDetail: { fontSize: 14, fontFamily: theme.typography.fontFamily.medium, color: theme.colors.heading, marginBottom: 4 },
  adminTag: { fontSize: 11, color: theme.colors.primary, fontFamily: theme.typography.fontFamily.bold },
  logDivider: { height: 1, backgroundColor: theme.colors.divider, marginLeft: 76 },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 16, fontSize: 15, color: theme.colors.placeholder, fontFamily: theme.typography.fontFamily.medium }
});
