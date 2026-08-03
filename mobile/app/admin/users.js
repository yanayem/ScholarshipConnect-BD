/**
 * USER AUDIT: Manage registered students and staff.
 * - Search by name or email.
 * - Material 3 item cards.
 * - Simple role identification.
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TextInput, TouchableOpacity, StatusBar, ActivityIndicator, RefreshControl
} from 'react-native';
import { theme } from '../../theme';
import { MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { apiService } from '../../services/api';
import { useRouter } from 'expo-router';
import { Loader } from '../../components/Loader';

export default function UserAudit() {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const loadUsers = async () => {
    try {
        const res = await apiService.getUsers();
        if (res.ok) {
            setUsers(res.data);
        }
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
        setRefreshing(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadUsers();
  };

  const filtered = (users || []).filter(u =>
    (u.profile?.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.username || '').toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }) => {
    const name = item.profile?.full_name || item.username;
    const role = item.is_staff ? 'Admin' : 'Student';

    return (
        <View style={styles.card}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{name[0].toUpperCase()}</Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.email}>{item.email}</Text>
            <View style={styles.meta}>
                <Text style={styles.joined}>Username: {item.username}</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 8 }}>
            <View style={[styles.badge, {
              backgroundColor: item.is_staff ? theme.colors.primary : '#F1F5F9'
            }]}>
              <Text style={[styles.badgeText, {
                  color: item.is_staff ? '#FFF' : theme.colors.textSecondary
              }]}>{role}</Text>
            </View>
            {!item.is_staff && (
              <TouchableOpacity
                style={styles.chatBtn}
                onPress={() => router.push({
                  pathname: `/messages/${item.id}`,
                  params: { name: name, avatar: item.profile?.avatar_url }
                })}
              >
                <MaterialCommunityIcons name="chat-outline" size={18} color={theme.colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.surface} />

      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <TouchableOpacity onPress={() => router.back()}>
                <MaterialIcons name="arrow-back" size={24} color={theme.colors.heading} />
            </TouchableOpacity>
            <Text style={styles.title}>System Users</Text>
        </View>
        <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color={theme.colors.textSecondary} />
            <TextInput
                placeholder="Find a user by name or email..."
                style={styles.input}
                value={search}
                onChangeText={setSearch}
            />
        </View>
      </View>

      {loading ? (
        <Loader message="Loading directory..." />
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
          }
          ListEmptyComponent={
              <View style={styles.empty}>
                  <MaterialCommunityIcons name="account-search-outline" size={60} color={theme.colors.placeholder} />
                  <Text style={styles.emptyText}>No users found</Text>
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
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.divider
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16
  },
  avatarText: { fontSize: 18, fontFamily: theme.typography.fontFamily.bold, color: theme.colors.primary },
  info: { flex: 1 },
  name: { fontSize: 15, fontFamily: theme.typography.fontFamily.bold, color: theme.colors.heading },
  email: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 },
  meta: { marginTop: 4 },
  joined: { fontSize: 11, color: theme.colors.placeholder },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 10, fontFamily: theme.typography.fontFamily.bold, textTransform: 'uppercase' },
  chatBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 16, fontSize: 15, color: theme.colors.placeholder, fontFamily: theme.typography.fontFamily.medium }
});
