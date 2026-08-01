import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, StatusBar, Platform, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons, Ionicons, Feather } from '@expo/vector-icons';
import { theme } from '../../theme';
import { apiService } from '../../services/api';

export default function InboxScreen() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadConversations = async () => {
    const res = await apiService.getConversations();
    if (res.ok) {
      setConversations(res.data);
    }
    setLoading(false);
    setRefreshing(false);
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
        pathname: `/messages/${item.user_id}`,
        params: { name: item.full_name, avatar: item.avatar_url }
      })}
    >
      <View style={styles.avatarWrapper}>
        <Image
          source={{ uri: item.avatar_url || theme.images.avatar + item.full_name }}
          style={styles.avatar}
        />
        {item.unread_count > 0 && <View style={styles.unreadBadge} />}
      </View>

      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.userName} numberOfLines={1}>{item.full_name}</Text>
          <Text style={styles.timeText}>
            {new Date(item.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.heading} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity style={styles.searchBtn}>
          <Feather name="search" size={20} color={theme.colors.textSecondary} />
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
          keyExtractor={item => item.user_id.toString()}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="chatbubbles-outline" size={80} color={theme.colors.divider} />
              <Text style={styles.emptyTitle}>No messages yet</Text>
              <Text style={styles.emptySub}>Connect with scholars and start a conversation.</Text>
              <TouchableOpacity
                style={styles.startBtn}
                onPress={() => router.push('/mentorship')}
              >
                <Text style={styles.startBtnText}>Find Someone</Text>
              </TouchableOpacity>
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
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 50 : 40, paddingBottom: 15,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: theme.colors.divider
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.heading },
  backBtn: { padding: 5 },
  searchBtn: { padding: 5 },
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
  emptySub: { fontSize: 14, color: theme.colors.textSecondary, textAlign: 'center', marginTop: 10, lineHeight: 20 },
  startBtn: { backgroundColor: theme.colors.primary, paddingHorizontal: 25, paddingVertical: 12, borderRadius: 15, marginTop: 30 },
  startBtnText: { color: '#fff', fontWeight: 'bold' }
});
