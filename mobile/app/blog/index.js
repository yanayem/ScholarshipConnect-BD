import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, Image, ActivityIndicator, RefreshControl, Dimensions,
  Platform, Alert
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { apiService } from '../../services/api';
import { cacheService } from '../../services/cache';
import { Loader } from '../../components/Loader';

const { width } = Dimensions.get('window');

const REACTION_TYPES = [
  { type: 'love', icon: '❤️', label: 'Love' },
];

export default function BlogListScreen() {
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const loadPosts = async () => {
    // 1. Try Cache First
    try {
      const cachedPosts = await cacheService.get('blog_posts');
      const cachedStories = await cacheService.get('blog_stories');
      const cachedProfile = await cacheService.get('user_profile');

      if (cachedPosts) {
        setPosts(cachedPosts);
        setLoading(false);
      }
      if (cachedStories) setStories(cachedStories);
      if (cachedProfile) setCurrentUser(cachedProfile);
    } catch (e) {}

    // 2. Fetch fresh data in the background
    try {
      const profileRes = await apiService.getProfile();
      if (profileRes.ok) {
        setCurrentUser(profileRes.data);
        await cacheService.set('user_profile', profileRes.data, 30);
      }

      const storyRes = await apiService.getStories();
      if (storyRes.ok) {
        const processedStories = storyRes.data.map(s => ({
          ...s,
          author_avatar_url: s.author_avatar_url || s.author_profile_picture
        }));
        setStories(processedStories);
        await cacheService.set('blog_stories', processedStories, 10);
      }

      const res = await apiService.getBlogPosts('blog');
      if (res.ok) {
        setPosts(res.data);
        await cacheService.set('blog_posts', res.data, 20);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadPosts();
  };

  const handleReact = async (postId, reactionType) => {
    if (!currentUser) {
      Alert.alert('Login Required', 'Please login to react.');
      return;
    }

    // Optimistic Update
    const originalPosts = [...posts];
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const wasReacted = p.user_reaction === reactionType;
        return {
          ...p,
          user_reaction: wasReacted ? null : reactionType,
          reactions_count: wasReacted ? p.reactions_count - 1 : (p.user_reaction ? p.reactions_count : p.reactions_count + 1)
        };
      }
      return p;
    }));

    const res = await apiService.reactToBlogPost(postId, reactionType);
    if (!res.ok) {
      setPosts(originalPosts);
      Alert.alert('Error', 'Failed to update reaction');
    }
  };

  const renderStories = () => {
    if (stories.length === 0) return null;
    return (
      <View style={styles.storiesSection}>
        <Text style={styles.subHeading}>Daily Highlights</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storiesScroll}>
          {stories.map(story => (
            <TouchableOpacity
              key={story.id}
              style={styles.storyCircleWrapper}
              onPress={() => router.push(`/community/story/${story.id}`)}
            >
              <View style={styles.storyCircle}>
                <Image
                    source={{ uri: story.media || theme.images.scholarship }}
                    style={styles.storyCircleImage}
                />
                <View style={styles.storyOverlay} />
              </View>
              <Text style={styles.storyCircleName} numberOfLines={1}>
                {story.author_full_name || story.author_name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderPost = (post) => (
    <View key={post.id} style={styles.liPostContainer}>
      {/* Header: Author & Meta */}
      <View style={styles.liHeader}>
        <View style={styles.liAvatar}>
           <Image
              source={{ uri: post.author_avatar_url || theme.images.avatar + (post.author_full_name || post.author_name) }}
              style={styles.liAvatarImage}
           />
        </View>
        <View style={styles.liAuthorInfo}>
          <Text style={styles.liAuthorName}>{post.author_full_name || post.author_name}</Text>
          <Text style={styles.liAuthorSub}>{post.university} • {new Date(post.created_at).toLocaleDateString()}</Text>
        </View>
      </View>

      {/* Body: Text Content */}
      <View style={styles.liBody}>
        <Text style={styles.liTitle}>{post.title}</Text>
        <Text style={styles.liContentText} numberOfLines={3}>
          {post.content}
        </Text>
        <TouchableOpacity onPress={() => router.push(`/blog/${post.id}`)} style={styles.liSeeMoreBtn}>
           <Text style={styles.liSeeMoreText}>...see more</Text>
        </TouchableOpacity>
      </View>

      {/* Media: If any image exists */}
      {post.image_url ? (
        <TouchableOpacity style={styles.liMediaContainer} onPress={() => router.push(`/blog/${post.id}`)}>
           <Image source={{ uri: post.image_url }} style={styles.liMediaImage} resizeMode="cover" />
        </TouchableOpacity>
      ) : null}

      {/* Engagement Stats */}
      <View style={styles.liEngagement}>
        <View style={styles.liStatGroup}>
           <View style={styles.liStatIcon}>
              <Ionicons name="heart" size={12} color={theme.colors.error} />
           </View>
           <Text style={styles.liStatText}>{post.reactions_count || 0}</Text>
        </View>
        <Text style={styles.liStatText}>{post.comments_count || 0} comments</Text>
      </View>

      {/* Action Bar */}
      <View style={styles.liActionBar}>
        <TouchableOpacity
          style={styles.liActionBtn}
          onPress={() => handleReact(post.id, 'love')}
        >
          <Ionicons
            name={post.user_reaction === 'love' ? "heart" : "heart-outline"}
            size={22}
            color={post.user_reaction === 'love' ? theme.colors.error : theme.colors.textSecondary}
          />
          <Text style={[styles.liActionText, post.user_reaction === 'love' && { color: '#000000', fontWeight: 'bold' }]}>
            Love
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.liActionBtn} onPress={() => router.push(`/blog/${post.id}`)}>
           <Ionicons name="chatbubble-outline" size={20} color={theme.colors.textSecondary} />
           <Text style={styles.liActionText}>Comment</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.liActionBtn}>
           <Ionicons name="share-social-outline" size={20} color={theme.colors.textSecondary} />
           <Text style={styles.liActionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />

      {/* Modern Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')}
          style={styles.headerAction}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.heading} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Success Stories</Text>
        <TouchableOpacity style={styles.headerAction}>
           <Ionicons name="search-outline" size={24} color={theme.colors.heading} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
        }
      >


        {renderStories()}

        {loading ? (
            <Loader message="Fetching stories..." />
        ) : (
          <View style={styles.content}>
            <View style={styles.postList}>
              {posts.map(post => renderPost(post))}
              {posts.length === 0 && (
                <View style={styles.emptyContainer}>
                  <Ionicons name="book-outline" size={64} color={theme.colors.placeholder} />
                  <Text style={styles.emptyText}>No stories published yet.</Text>
                </View>
              )}
            </View>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, theme.shadows.teal]}
        onPress={() => router.push('/blog/create-story')}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#E9E5DF' }, // Neutral greyish background like LI
  header: {
    height: Platform.OS === 'ios' ? 110 : 90,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  headerTitle: { color: theme.colors.heading, fontSize: 18, fontFamily: theme.typography.fontFamily.bold },
  headerAction: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingBottom: 20 },

  welcomeSection: {
    padding: 24,
    backgroundColor: 'white',
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider
  },
  welcomeTitle: { fontSize: 26, fontFamily: theme.typography.fontFamily.bold, color: theme.colors.heading, letterSpacing: -0.5 },
  welcomeSub: { fontSize: 14, color: theme.colors.textSecondary, marginTop: 8, lineHeight: 20, fontFamily: theme.typography.fontFamily.regular },

  subHeading: { fontSize: 12, fontFamily: theme.typography.fontFamily.bold, color: theme.colors.primary, marginLeft: 16, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1.5 },
  storiesSection: {
    paddingVertical: 15,
    backgroundColor: 'white',
    marginBottom: 12,
  },
  storiesScroll: { paddingHorizontal: 16, gap: 12 },
  storyCircleWrapper: { alignItems: 'center', width: 70 },
  storyCircle: { width: 66, height: 66, borderRadius: 33, borderWidth: 2, borderColor: theme.colors.primary, padding: 3, backgroundColor: 'white' },
  storyCircleImage: { width: '100%', height: '100%', borderRadius: 30 },
  storyOverlay: { ...StyleSheet.absoluteFillObject, borderRadius: 33, backgroundColor: 'rgba(0,0,0,0.02)' },
  storyCircleName: { fontSize: 10, color: theme.colors.textPrimary, marginTop: 6, fontFamily: theme.typography.fontFamily.medium, textAlign: 'center' },

  content: { },
  postList: { gap: 0 },

  // LinkedIn Style Post Container
  liPostContainer: {
    backgroundColor: 'white',
    paddingTop: 12,
    marginBottom: 8,
    position: 'relative',
  },
  liHeader: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  liAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  liAvatarImage: {
    width: '100%',
    height: '100%',
  },
  liAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  liAuthorInfo: {
    marginLeft: 12,
    flex: 1,
  },
  liAuthorName: {
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.heading,
  },
  liAuthorSub: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  liBody: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  liTitle: {
    fontSize: 17,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.heading,
    marginBottom: 8,
  },
  liContentText: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    lineHeight: 20,
  },
  liSeeMoreBtn: {
    marginTop: 4,
  },
  liSeeMoreText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  liMediaContainer: {
    width: '100%',
    height: 300,
    backgroundColor: theme.colors.background,
  },
  liMediaImage: {
    width: '100%',
    height: '100%',
  },
  liEngagement: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  liStatGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  liStatIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.errorLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  liStatText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  liActionBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 4,
  },
  liActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 8,
  },
  liActionText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },

  fab: {
    position: 'absolute', bottom: 30, right: 24,
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  emptyContainer: { alignItems: 'center', paddingVertical: 60, gap: 16 },
  emptyText: { color: theme.colors.placeholder, fontSize: 15, textAlign: 'center' }
});
