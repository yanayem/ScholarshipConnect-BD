/**
 * APPLICATION MANAGER: Oversee student scholarship submissions.
 * - Material 3 List of all applied students.
 * - Simple status updates (Check, Approve, Reject).
 */
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, StatusBar, RefreshControl,
  ActivityIndicator, TextInput, Alert, Linking
} from 'react-native';
import { theme } from '../../theme';
import { MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { apiService } from '../../services/api';
import { useToast } from '../../components/Toast';
import { useState, useEffect } from 'react';
import { Loader } from '../../components/Loader';

export default function ApplicationManager() {
  const [search, setSearch] = useState('');
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSop, setExpandedSop] = useState(null);
  const router = useRouter();
  const { showToast, ToastComponent } = useToast();

  const loadApplications = async () => {
    try {
      setLoading(true);
      const res = await apiService.getApplications();
      if (res.ok) {
        setApps(res.data);
      }
    } catch (e) {
      console.error('[ADMIN] Failed to load applications:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const onRefresh = () => {
    loadApplications();
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await apiService.updateApplicationStatus(id, status);
      if (res.ok) {
        showToast(`Application ${status}`, 'success');
        loadApplications();
      } else {
        showToast('Failed to update status', 'error');
      }
    } catch (error) {
      showToast('Network error', 'error');
    }
  };

  const openExternalLink = async (url) => {
    if (!url) return;
    try {
      if (Platform.OS === 'web') {
        window.open(url, '_blank');
      } else {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
        } else {
          Alert.alert("Error", "Don't know how to open this URL: " + url);
        }
      }
    } catch (error) {
      console.error('Error opening link:', error);
      Alert.alert("Error", "Could not open the document link.");
    }
  };

  const handleViewDocs = (item) => {
    if (item.user_documents && item.user_documents.length > 0) {
      // If multiple docs, let user pick
      if (item.user_documents.length === 1) {
        openExternalLink(item.user_documents[0].file);
      } else {
        const docList = item.user_documents.map(d => d.name).join('\n');
        Alert.alert(
          'Student Documents',
          `This student has ${item.user_documents.length} documents in their vault:\n\n${docList}`,
          [
            { text: 'Close' },
            ...item.user_documents.map(d => ({
              text: `Open ${d.name.substring(0, 15)}`,
              onPress: () => openExternalLink(d.file)
            }))
          ]
        );
      }
    } else if (item.document_url) {
      openExternalLink(item.document_url);
    } else {
      Alert.alert('No Documents', 'This student did not upload any supporting documents to their vault.');
    }
  };

  const filtered = (apps || []).filter(a =>
    (a.user_full_name || a.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (a.scholarship_title || '').toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <View style={styles.avatarBox}>
            <Text style={styles.avatarText}>{(item.user_full_name || item.full_name || 'U')[0]}</Text>
        </View>
        <View style={styles.textDetails}>
            <Text style={styles.userName}>{item.user_full_name || item.full_name}</Text>
            <Text style={styles.programName}>{item.scholarship_title}</Text>
            <Text style={styles.dateText}>{item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A'}</Text>
            {item.application_type === 'Agency' && (
              <View style={styles.agencyBadge}>
                <MaterialIcons name="star" size={10} color="#fff" />
                <Text style={styles.agencyBadgeText}>Agency Request</Text>
              </View>
            )}
        </View>
        <View style={[styles.statusBadge, {
            backgroundColor:
              item.status === 'Approved' ? theme.colors.successLight :
              item.status === 'Rejected' ? theme.colors.errorLight :
              item.status === 'Submitted' ? theme.colors.primaryLight : '#F1F5F9'
        }]}>
            <Text style={[styles.statusText, {
                color:
                  item.status === 'Approved' ? theme.colors.success :
                  item.status === 'Rejected' ? theme.colors.error :
                  item.status === 'Submitted' ? theme.colors.primary : theme.colors.textSecondary
            }]}>{item.status}</Text>
        </View>
      </View>

      {/* SOP Section */}
      {item.sop ? (
        <TouchableOpacity
          style={styles.sopToggle}
          onPress={() => setExpandedSop(expandedSop === item.id ? null : item.id)}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="file-document-outline" size={16} color={theme.colors.primary} />
          <Text style={styles.sopToggleText}>Statement of Purpose (SOP)</Text>
          <MaterialIcons
            name={expandedSop === item.id ? "keyboard-arrow-up" : "keyboard-arrow-down"}
            size={20}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      ) : null}

      {expandedSop === item.id && item.sop ? (
        <View style={styles.sopBox}>
          <Text style={styles.sopText}>{item.sop}</Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleViewDocs(item)}>
            <MaterialIcons name="visibility" size={20} color={theme.colors.primary} />
            <Text style={styles.actionLabel}>View Docs</Text>
        </TouchableOpacity>
        <View style={styles.divider} />
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => router.push({
            pathname: `/messages/${item.user_id || item.user}`,
            params: { name: item.user_full_name || item.full_name }
          })}
        >
            <MaterialCommunityIcons name="chat-outline" size={20} color={theme.colors.info} />
            <Text style={styles.actionLabel}>Chat</Text>
        </TouchableOpacity>
        <View style={styles.divider} />
        {item.status === 'Submitted' ? (
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleUpdateStatus(item.id, 'Approved')}>
              <MaterialIcons name="check-circle-outline" size={20} color={theme.colors.success} />
              <Text style={styles.actionLabel}>Approve</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.actionBtn} onPress={() => handleUpdateStatus(item.id, 'Submitted')}>
              <MaterialIcons name="refresh" size={20} color={theme.colors.warning} />
              <Text style={styles.actionLabel}>Reset</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.surface} />
      {ToastComponent}

      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <TouchableOpacity onPress={() => router.back()}>
                <MaterialIcons name="arrow-back" size={24} color={theme.colors.heading} />
            </TouchableOpacity>
            <Text style={styles.title}>All Applications</Text>
        </View>
        <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color={theme.colors.textSecondary} />
            <TextInput
                placeholder="Search by name or program..."
                style={styles.input}
                value={search}
                onChangeText={setSearch}
            />
        </View>
      </View>

      {loading && apps.length === 0 ? (
        <Loader message="Loading submissions..." />
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={onRefresh} />}
          ListEmptyComponent={
              <View style={styles.empty}>
                  <MaterialCommunityIcons name="folder-search-outline" size={60} color={theme.colors.placeholder} />
                  <Text style={styles.emptyText}>No applications found</Text>
              </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    paddingTop: 50,
    paddingHorizontal: 24,
    paddingBottom: 20,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider
  },
  title: { fontSize: 22, fontFamily: theme.typography.fontFamily.bold, color: theme.colors.heading, marginBottom: 16 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48
  },
  input: { flex: 1, marginLeft: 10, fontFamily: theme.typography.fontFamily.medium, fontSize: 14 },
  list: { padding: 20 },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.divider,
    overflow: 'hidden'
  },
  cardInfo: { flexDirection: 'row', padding: 16, alignItems: 'center' },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14
  },
  avatarText: { color: '#FFF', fontSize: 18, fontFamily: theme.typography.fontFamily.bold },
  textDetails: { flex: 1 },
  userName: { fontSize: 15, fontFamily: theme.typography.fontFamily.bold, color: theme.colors.heading },
  programName: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 },
  dateText: { fontSize: 11, color: theme.colors.placeholder, marginTop: 4 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontFamily: theme.typography.fontFamily.bold, textTransform: 'uppercase' },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
    backgroundColor: '#FAFAFA'
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 6
  },
  actionLabel: { fontSize: 12, fontFamily: theme.typography.fontFamily.bold, color: theme.colors.textPrimary },
  divider: { width: 1, backgroundColor: theme.colors.divider },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 16, fontSize: 15, color: theme.colors.placeholder, fontFamily: theme.typography.fontFamily.medium },
  agencyBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: theme.colors.primary, paddingHorizontal: 6,
    paddingVertical: 2, borderRadius: 6, alignSelf: 'flex-start', marginTop: 4
  },
  agencyBadgeText: { color: '#fff', fontSize: 9, fontFamily: theme.typography.fontFamily.bold },
  sopToggle: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: theme.colors.divider,
    backgroundColor: theme.colors.primaryLight,
  },
  sopToggleText: {
    flex: 1, fontSize: 13, fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.primary,
  },
  sopBox: {
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: '#F8FAFF',
    borderTopWidth: 1, borderTopColor: theme.colors.divider,
  },
  sopText: {
    fontSize: 13, color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.medium,
    lineHeight: 20,
  },
});
