import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, ActivityIndicator, RefreshControl, Platform
} from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { theme } from '../theme';
import { apiService } from '../services/api';

const getTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'Just now';
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " min ago";
  return Math.floor(seconds) + " seconds ago";
};

const getNotificationStyles = (title = '') => {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('application') || lowerTitle.includes('review')) {
    return { icon: 'assignment', color: '#8B5E3C', bg: '#F5E6D3' }; // Brownish
  }
  if (lowerTitle.includes('match') || lowerTitle.includes('found')) {
    return { icon: 'auto-awesome', color: '#0070E0', bg: '#E6F4FE' }; // Blue
  }
  if (lowerTitle.includes('verify') || lowerTitle.includes('document')) {
    return { icon: 'verified-user', color: '#1F6F66', bg: '#E6F7F5' }; // Teal
  }
  if (lowerTitle.includes('like') || lowerTitle.includes('comment')) {
    return { icon: 'favorite', color: '#E85D75', bg: '#FFF0F3' }; // Red/Pink
  }
  if (lowerTitle.includes('deadline') || lowerTitle.includes('reminder')) {
    return { icon: 'event-available', color: '#D97706', bg: '#FFFBEB' }; // Orange/Yellow
  }
  return { icon: 'notifications', color: theme.colors.primary, bg: theme.colors.primaryLight };
};

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = async () => {
    try {
      const res = await apiService.getNotifications();
      if (res.ok) {
        setNotifications(res.data);
      }
    } catch (error) {
      console.error('Failed to load notifications', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadNotifications();
  }, []);

  const renderNotification = ({ item }) => {
    const styles_obj = getNotificationStyles(item.title);

    return (
      <TouchableOpacity
        style={styles.notificationItem}
        onPress={() => {
            // Logic to mark as read or navigate
            if (item.scholarship_id) {
                router.push(`/scholarships/${item.scholarship_id}`);
            }
        }}
      >
        <View style={[styles.iconContainer, { backgroundColor: styles_obj.bg }]}>
          <MaterialIcons name={styles_obj.icon} size={22} color={styles_obj.color} />
        </View>

        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
          <Text style={styles.time}>{getTimeAgo(item.created_at)}</Text>
        </View>

        <MaterialIcons name="chevron-right" size={20} color={theme.colors.placeholder} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
        >
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.heading} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity
          onPress={() => {
             setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
          }}
        >
          <Text style={styles.markReadText}>Read All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 100 }} />
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="notifications-none" size={64} color={theme.colors.placeholder} />
              <Text style={styles.emptyText}>No notifications yet.</Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Clean white as per image
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#FFFFFF',
    // Removed border bottom for a cleaner look like the image
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.heading,
    fontFamily: theme.typography.fontFamily.bold,
  },
  backBtn: {
    padding: 5,
  },
  markReadText: {
    fontSize: 13,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0', // Very light divider
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  content: {
    flex: 1,
    paddingRight: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    color: theme.colors.heading,
    marginBottom: 2,
  },
  message: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: theme.colors.placeholder,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 150,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.placeholder,
    marginTop: 15,
  },
});
