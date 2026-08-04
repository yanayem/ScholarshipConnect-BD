import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, StatusBar, Platform, RefreshControl, Alert } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons, Ionicons, Feather } from '@expo/vector-icons';
import { theme } from '../../theme';
import { apiService } from '../../services/api';

export default function InboxScreen() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadConversations = async () => {
    try {
      const res = await apiService.getConversations();
      if (res.ok) {
        let serverData = [];
        if (Array.isArray(res.data)) {
          serverData = res.data;
        } else if (res.data && typeof res.data === 'object') {
          serverData = res.data.results || res.data.conversations || res.data.data || [];
        }
        setConversations(serverData);
      } else {
        console.warn('[InboxTab] Failed to load:', res.status);
      }
    } catch (error) {
      console.error('[InboxTab] Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadConversations();
  };

  const renderConversation = ({ item }) => (
    <TouchableOpacity
      style={styles.chatCard}
      onPress={() => router.push({
        pathname: `/messages/${item.user_id || item.id || item._id}`,
        params: { name: item.full_name || item.username, avatar: item.avatar_url }
      })}
    >
      <View style={styles.avatarWrapper}>
        <Image
          source={{ uri: item.avatar_url || theme.images.avatar + (item.full_name || item.username) }}
          style={styles.avatar}
        />
        {item.unread_count > 0 && <View style={styles.unreadBadge} />}
      </View>

      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.userName} numberOfLines={1}>{item.full_name || item.username}</Text>
          <Text style={styles.timeText}>
            {item.last_message_time ? new Date(item.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
          </Text>
        </View>
        <View style={styles.msgPreviewRow}>
          <Text
            style={[styles.msgPreview, item.unread_count > 0 && styles.unreadText]}
            numberOfLines={1}
          >
            {item.last_message}
          </Text>
          {item.unread_count > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{item.unread_count}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const contactSupport = async () => {
    try {
      setLoading(true);
      const res = await apiService.getUsers();
      if (res.ok) {
        // Find the first staff member (admin)
        const staff = res.data.find(u => u.is_staff || u.is_superuser);
        if (staff) {
          router.push({
            pathname: `/messages/${staff.id || staff.user_id}`,
            params: { name: staff.full_name || staff.username, avatar: staff.avatar_url }
          });
        } else {
          Alert.alert('Notice', 'Support is currently offline. Please try again later.');
        }
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to connect to support.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity style={styles.supportBtn} onPress={contactSupport}>
          <MaterialIcons name="support-agent" size={24} color={theme.colors.primary} />
          <Text style={styles.supportText}>Support</Text>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item, index) => (item.user_id || item.id || item._id || index).toString()}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="chatbubbles-outline" size={80} color={theme.colors.divider} />
              <Text style={styles.emptyTitle}>No messages yet</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40, paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: theme.colors.divider,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.heading },
  supportBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: theme.colors.primaryLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  supportText: { fontSize: 12, fontWeight: 'bold', color: theme.colors.primary },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { paddingVertical: 10 },
  chatCard: {
    flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 15,
    alignItems: 'center'
  },
  avatarWrapper: { position: 'relative' },
  avatar: { width: 55, height: 55, borderRadius: 27.5, backgroundColor: theme.colors.background },
  unreadBadge: {
    position: 'absolute', right: 0, top: 0,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: theme.colors.primary,
    borderWidth: 2, borderColor: '#fff'
  },
  chatInfo: { flex: 1, marginLeft: 15, borderBottomWidth: 1, borderBottomColor: theme.colors.divider, paddingBottom: 15 },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  userName: { fontSize: 16, fontWeight: 'bold', color: theme.colors.heading },
  timeText: { fontSize: 12, color: theme.colors.textSecondary },
  msgPreviewRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  msgPreview: { fontSize: 14, color: theme.colors.textSecondary, flex: 1, marginRight: 10 },
  unreadText: { color: theme.colors.textPrimary, fontWeight: '600' },
  countBadge: {
    backgroundColor: theme.colors.primary,
    minWidth: 20, height: 20, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6
  },
  countText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.heading, marginTop: 20 },
});
