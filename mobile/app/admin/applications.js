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

export default function ApplicationManager() {
  const [search, setSearch] = useState('');
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const handleViewDocs = (item) => {
    if (item.document_url) {
      Linking.openURL(item.document_url);
    } else {
      Alert.alert('No Documents', 'This student did not upload any supporting documents.');
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

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleViewDocs(item)}>
            <MaterialIcons name="visibility" size={20} color={theme.colors.primary} />
            <Text style={styles.actionLabel}>View Docs</Text>
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
  emptyText: { marginTop: 16, fontSize: 15, color: theme.colors.placeholder, fontFamily: theme.typography.fontFamily.medium }
});
