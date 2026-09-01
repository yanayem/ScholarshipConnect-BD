import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList, RefreshControl, ActivityIndicator, Image, Alert, StatusBar, Platform, Modal, Pressable } from 'react-native';
import { apiService } from '../../services/api';
import { cacheService } from '../../services/cache';
import { theme } from '../../theme';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useToast } from '../../components/Toast';
import { Loader } from '../../components/Loader';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { useUser } from '../../context/UserContext';

const CATEGORIES = ['All', 'Open Problems', 'Scholarships', 'SOP/CV', 'Visa', 'Test Prep', 'Life Abroad'];

export default function CommunityScreen() {
  const { showToast, ToastComponent } = useToast();
  const { user: currentUser } = useUser();
  const [activeTab, setActiveTab] = useState('Discussions'); // 'Discussions' or 'Mentors'
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [discussions, setDiscussions] = useState([]);
  const [stories, setStories] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [actionModalVisible, setActionModalVisible] = useState(false);

  const loadBlogs = async () => {
    // 1. Try Cache First
    try {
      const cachedStories = await cacheService.get('community_stories');
      const cachedMentors = await cacheService.get('community_mentors');
      const cachedDiscussions = await cacheService.get('community_discussions');

      if (cachedStories) setStories(cachedStories);
      if (cachedMentors) setMentors(cachedMentors);
      if (cachedDiscussions) {
        setDiscussions(cachedDiscussions);
        setLoading(false);
      }
    } catch (e) {}

    // 2. Fetch fresh data in the background
    try {
      const [storiesRes, mentorRes, res] = await Promise.all([
        apiService.getStories(),
        apiService.getMentors(),
        apiService.getDiscussions()
      ]);

      if (storiesRes.ok) {
        const processedStories = storiesRes.data.map(s => ({
          ...s,
          author_avatar_url: s.author_avatar_url || s.author_profile_picture
        }));
        setStories(processedStories);
        await cacheService.set('community_stories', processedStories, 10);
      }

      if (mentorRes.ok) {
        setMentors(mentorRes.data.slice(0, 5));
        await cacheService.set('community_mentors', mentorRes.data.slice(0, 5), 30);
      }

      if (res.ok) {
        const formatted = res.data.map(item => ({
          id: item.id.toString(),
          authorId: item.author,
          user: item.author_full_name || item.author_name || 'Anonymous',
          email: item.author_email,
          role: item.author_role,
          title: item.title,
          content: item.content,
          likes: item.likes_count || 0,
          isLiked: item.is_liked || false,
          isSolved: item.is_solved || false,
          hasPoll: !!item.poll_question,
          image: item.image,
          comments: item.comments_count || 0,
          category: item.category || 'General',
          time: new Date(item.created_at).toLocaleDateString(),
          avatar: item.author_avatar_url || null,
          initials: (item.author_full_name || item.author_name || 'A')[0].toUpperCase()
        }));
        setDiscussions(formatted);
        await cacheService.set('community_discussions', formatted, 15);
      }
    } catch (error) {
      console.error('Failed to load discussions', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadBlogs();
  };

  const handleLike = async (id) => {
    if (!currentUser) {
      Alert.alert('Login Required', 'Please login to like discussions.');
      return;
    }
    setDiscussions(prev => prev.map(post => {
      if (post.id === id) {
        return { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 };
      }
      return post;
    }));
    const res = await apiService.likeDiscussion(id);
    if (!res.ok) loadBlogs();
  };

  const handleMoreActions = (item) => {
    setSelectedPost(item);
    setActionModalVisible(true);
  };

  const renderActionItem = (icon, label, onPress, color = theme.colors.textPrimary, isDestructive = false) => (
    <TouchableOpacity
      style={styles.actionItem}
      onPress={() => {
        setActionModalVisible(false);
        onPress();
      }}
    >
      <View style={[styles.actionIconBox, isDestructive && { backgroundColor: theme.colors.errorLight }]}>
        <MaterialIcons name={icon} size={22} color={isDestructive ? theme.colors.error : color} />
      </View>
      <Text style={[styles.actionLabel, isDestructive && { color: theme.colors.error }]}>{label}</Text>
    </TouchableOpacity>
  );

  const submitReport = async (item, reason) => {
    try {
      const res = await apiService.createReport({
        reported_user: item.authorId,
        content_type: 'Discussion',
        content_id: item.id,
        reason: reason,
        description: `User reported discussion: ${item.title}`
      });
      if (res.ok) {
        Alert.alert('Thank You', 'Your report has been received and will be reviewed by admins.');
      } else {
        console.log('[REPORT ERROR] Post:', res.data);
        showToast(res.data?.error || 'Failed to submit report', 'error');
      }
    } catch (e) {
      showToast('Connection error', 'error');
    }
  };

  const filteredDiscussions = discussions.filter(post => {
    let matchesCategory = activeCategory === 'All';
    if (activeCategory === 'Open Problems') {
      matchesCategory = !post.isSolved;
    } else if (activeCategory !== 'All') {
      matchesCategory = post.category && post.category.toLowerCase().includes(activeCategory.toLowerCase());
    }
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const renderDiscussion = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[styles.card, theme.shadows.soft]}
      onPress={() => router.push(`/community/${item.id}`)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.authorSection}>
          <View style={[styles.avatar, { backgroundColor: item.avatar ? 'transparent' : theme.colors.primaryLight }]}>
            {item.avatar ? (
              <Image source={{ uri: item.avatar }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{item.initials}</Text>
            )}
          </View>
          <View style={styles.userInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{item.user}</Text>
              {item.is_pro && (
                <MaterialIcons name="stars" size={14} color="#FFD700" style={{ marginLeft: 4 }} />
              )}
              {item.role === 'Staff' && (
                <MaterialIcons name="verified" size={14} color={theme.colors.primary} style={{ marginLeft: 4 }} />
              )}
              {item.isSolved && (
                <View style={styles.solvedBadgeSmall}>
                  <MaterialIcons name="check-circle" size={12} color={theme.colors.success} />
                  <Text style={styles.solvedBadgeTextSmall}>Solved</Text>
                </View>
              )}
            </View>
            <Text style={styles.timeText}>{item.time} • <Text style={{color: theme.colors.primary, fontWeight: '600'}}>{item.category}</Text></Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => handleMoreActions(item)} style={styles.moreBtn}>
          <MaterialIcons name="more-horiz" size={22} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.discussionTitle}>{item.title}</Text>
        <Text style={styles.discussionContent} numberOfLines={2}>{item.content}</Text>
        {(item.image || item.hasPoll) && (
          <View style={styles.attachmentBadges}>
            {item.image && (
              <View style={styles.attachmentBadge}>
                <MaterialIcons name="image" size={14} color={theme.colors.primary} />
                <Text style={styles.attachmentBadgeText}>Image</Text>
              </View>
            )}
            {item.hasPoll && (
              <View style={[styles.attachmentBadge, { backgroundColor: theme.colors.lavenderCard }]}>
                <MaterialIcons name="poll" size={14} color={theme.colors.chartSecondary} />
                <Text style={[styles.attachmentBadgeText, { color: theme.colors.chartSecondary }]}>Poll</Text>
              </View>
            )}
          </View>
        )}
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.stats}>
          <TouchableOpacity
            style={[styles.statItem, item.isLiked && styles.statItemLiked]}
            onPress={() => handleLike(item.id)}
          >
            <Ionicons
              name={item.isLiked ? "heart" : "heart-outline"}
              size={20}
              color={item.isLiked ? theme.colors.error : theme.colors.textSecondary}
            />
            <Text style={[styles.statText, item.isLiked && { color: theme.colors.error }]}>{item.likes}</Text>
          </TouchableOpacity>
          <View style={styles.statItem}>
            <Ionicons name="chatbubble-outline" size={18} color={theme.colors.textSecondary} />
            <Text style={styles.statText}>{item.comments}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.actionLinks} onPress={() => router.push(`/community/${item.id}`)}>
           <Text style={styles.readMoreText}>View discussion</Text>
           <MaterialIcons name="chevron-right" size={18} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {ToastComponent}

      <View style={styles.headerContainer}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'Discussions' && styles.activeTabButton]}
            onPress={() => setActiveTab('Discussions')}
          >
            <Ionicons name="chatbubbles" size={18} color={activeTab === 'Discussions' ? '#fff' : theme.colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'Discussions' && styles.activeTabText]}>Feed</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'Mentors' && styles.activeTabButton]}
            onPress={() => setActiveTab('Mentors')}
          >
            <FontAwesome5 name="user-graduate" size={16} color={activeTab === 'Mentors' ? '#fff' : theme.colors.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'Mentors' && styles.activeTabText]}>Mentors</Text>
          </TouchableOpacity>
        </View>
      </View>

      {activeTab === 'Discussions' ? (
        <>
          <View style={styles.searchSection}>
            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={20} color={theme.colors.textSecondary} />
              <TextInput
                placeholder="Search discussions, topics..."
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor={theme.colors.placeholder}
              />
            </View>
          </View>

          <View style={styles.categoryWrapper}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setActiveCategory(cat)}
                  style={[styles.categoryChip, activeCategory === cat && styles.categoryChipActive]}
                >
                  <Text style={[styles.categoryText, activeCategory === cat && styles.categoryTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <FlatList
            data={filteredDiscussions}
            renderItem={renderDiscussion}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
            }
            ListHeaderComponent={
              <>
                {stories.length > 0 && (
                  <View style={styles.storiesContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storiesScroll}>
                      <TouchableOpacity
                        style={styles.addStoryCard}
                        onPress={() => Alert.alert('Coming Soon', 'Story creation is coming soon!')}
                      >
                        <View style={styles.addStoryCircle}>
                          <Ionicons name="add" size={24} color={theme.colors.primary} />
                        </View>
                        <Text style={styles.storyUserText}>You</Text>
                      </TouchableOpacity>
                      {stories.map(story => (
                        <TouchableOpacity
                          key={story.id}
                          style={styles.storyCard}
                          onPress={() => router.push(`/community/story/${story.id}`)}
                        >
                          <View style={styles.storyCircle}>
                            <Image source={{ uri: story.media }} style={styles.storyImage} />
                            <View style={styles.storyAvatarBorder}>
                              <Image
                                 source={{ uri: story.author_avatar_url || theme.images.avatar + (story.author_full_name || story.author_name) }}
                                 style={styles.storyAvatar}
                              />
                            </View>
                          </View>
                          <Text style={styles.storyUserText} numberOfLines={1}>{story.author_full_name || story.author_name}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.composeBox}
                  onPress={() => currentUser ? router.push('/community/create') : Alert.alert('Login Required', 'Please login to post.')}
                >
                  <View style={styles.composeAvatar}>
                     {currentUser?.avatar_url || currentUser?.profile_picture ? (
                       <Image source={{ uri: currentUser?.avatar_url || currentUser?.profile_picture }} style={styles.avatarImage} />
                     ) : (
                       <Text style={styles.composeAvatarText}>{(currentUser?.full_name || currentUser?.username || 'U')[0].toUpperCase()}</Text>
                     )}
                  </View>
                  <View style={styles.composeInputPlaceholder}>
                    <Text style={styles.composePlaceholderText}>Have a problem? Ask the community...</Text>
                  </View>
                  <MaterialIcons name="image" size={24} color={theme.colors.primary} />
                </TouchableOpacity>
              </>
            }
            ListEmptyComponent={
              (loading && discussions.length === 0) ? (
                <View style={{ marginTop: 50, alignItems: 'center' }}>
                   <ActivityIndicator color={theme.colors.primary} size="small" />
                </View>
              ) : discussions.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <MaterialIcons name="forum" size={64} color={theme.colors.placeholder} />
                  <Text style={styles.emptyText}>No discussions found.</Text>
                </View>
              ) : null
            }
          />
        </>
      ) : (
        <View style={{ flex: 1 }}>
          <FlatList
            data={mentors}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={[styles.listContent, { paddingTop: 20 }]}
            ListHeaderComponent={
              <View style={styles.mentorInfoCard}>
                <View style={styles.mentorInfoText}>
                   <View style={styles.headerWithIcon}>
                      <MaterialIcons name="verified-user" size={24} color="#fff" />
                      <Text style={styles.mentorInfoHeader}>Connect with Verified Mentors</Text>
                   </View>
                   <Text style={styles.mentorInfoSub}>Get 1-on-1 guidance for your scholarship journey from students who&apos;ve already made it.</Text>
                </View>
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.mentorFullCard}
                onPress={() => router.push(`/mentorship/${item.user_id || item.user || item.id}`)}
              >
                <View style={styles.mentorLeft}>
                  <Image source={{ uri: item.avatar_url || theme.images.avatar + item.full_name }} style={styles.mentorFullAvatar} />
                  {item.is_pro && (
                    <View style={styles.proBadge}>
                      <MaterialIcons name="verified" size={12} color="#fff" />
                    </View>
                  )}
                </View>
                <View style={styles.mentorRight}>
                  <View style={styles.mentorHeaderRow}>
                    <Text style={styles.mentorFullName}>{item.full_name}</Text>
                    <Text style={styles.mentorUniversity}>{item.university || 'Verified'}</Text>
                  </View>
                  <Text style={styles.mentorExpertise}>{item.expertise_areas || item.major_course || 'Higher Education'}</Text>
                  <View style={styles.mentorStatsRow}>
                     <View style={styles.mStat}>
                        <MaterialIcons name="star" size={14} color="#FFD700" />
                        <Text style={styles.mStatText}>4.9</Text>
                     </View>
                     <View style={styles.mStat}>
                        <MaterialIcons name="schedule" size={14} color={theme.colors.textSecondary} />
                        <Text style={styles.mStatText}>Available</Text>
                     </View>
                  </View>
                  <TouchableOpacity
                    style={styles.connectBtnLarge}
                    onPress={() => router.push(`/mentorship/${item.user_id || item.user || item.id}`)}
                  >
                    <Text style={styles.connectBtnText}>View Profile</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              (loading && mentors.length === 0) ? (
                <ActivityIndicator color={theme.colors.primary} size="small" style={{ marginTop: 50 }} />
              ) : mentors.length === 0 ? (
                <Text style={styles.emptyText}>No mentors available at the moment.</Text>
              ) : null
            }
          />
        </View>
      )}

      {/* Bottom Sheet Action Menu */}
      <Modal
        visible={actionModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setActionModalVisible(false)}
      >
        <Pressable style={styles.sheetOverlay} onPress={() => setActionModalVisible(false)}>
          <Animated.View entering={FadeInDown.duration(300)} style={styles.sheetContent}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Post Options</Text>
            {selectedPost && (
              <View style={styles.actionList}>
                {(currentUser && (selectedPost.authorId === currentUser.user_id || currentUser.is_staff)) ? (
                  <>
                    {renderActionItem('edit', 'Edit Post', () => router.push(`/community/create?id=${selectedPost.id}`))}
                    {!selectedPost.isSolved && renderActionItem('check-circle', 'Mark as Solved', async () => {
                      const res = await apiService.updateDiscussion(selectedPost.id, { is_solved: true });
                      if (res.ok) {
                        showToast('Marked as solved! +50 points.', 'success');
                        loadBlogs();
                      }
                    }, theme.colors.success)}
                    {renderActionItem('delete-outline', 'Delete Post', () => {
                      Alert.alert('Confirm Delete', 'Are you sure?', [
                        { text: 'Cancel' },
                        { text: 'Delete', style: 'destructive', onPress: async () => {
                          const res = await apiService.deleteDiscussion(selectedPost.id);
                          if (res.ok) {
                            showToast('Deleted', 'success');
                            loadBlogs();
                          }
                        }}
                      ]);
                    }, theme.colors.error, true)}
                  </>
                ) : (
                  <>
                    <Text style={styles.sheetSubTitle}>Report this content</Text>
                    {renderActionItem('report-problem', 'Spam / Misleading', () => submitReport(selectedPost, 'Spam'))}
                    {renderActionItem('security', 'Abusive Content', () => submitReport(selectedPost, 'Abusive Content'))}
                    {renderActionItem('info-outline', 'Other Reason', () => submitReport(selectedPost, 'Other'))}
                  </>
                )}
              </View>
            )}
            <TouchableOpacity style={styles.sheetCloseBtn} onPress={() => setActionModalVisible(false)}>
              <Text style={styles.sheetCloseText}>Cancel</Text>
            </TouchableOpacity>
          </Animated.View>
        </Pressable>
      </Modal>

      {ToastComponent}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  headerContainer: { backgroundColor: theme.colors.surface, paddingHorizontal: theme.spacing.lg, paddingBottom: 8, paddingTop: 8, ...theme.shadows.soft, zIndex: 10 },
  headerTitle: { fontSize: 24, fontFamily: theme.typography.fontFamily.bold, color: theme.colors.heading },
  tabContainer: { flexDirection: 'row', backgroundColor: theme.colors.background, padding: 4, borderRadius: 12, gap: 4 },
  tabButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, gap: 8 },
  activeTabButton: { backgroundColor: theme.colors.primary, ...theme.shadows.teal },
  tabText: { fontSize: 14, fontFamily: theme.typography.fontFamily.bold, color: theme.colors.textSecondary },
  activeTabText: { color: '#fff' },
  searchSection: { paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.md, backgroundColor: theme.colors.surface },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.secondaryBackground, paddingHorizontal: theme.spacing.md, borderRadius: theme.borderRadius.lg, height: 48, borderWidth: 1, borderColor: theme.colors.divider },
  searchInput: { flex: 1, marginLeft: theme.spacing.sm, fontFamily: theme.typography.fontFamily.regular, fontSize: 15, color: theme.colors.textPrimary },
  mentorInfoCard: { backgroundColor: theme.colors.primary, marginHorizontal: theme.spacing.sm, borderRadius: 20, padding: 20, marginBottom: 20, flexDirection: 'row', overflow: 'hidden' },
  mentorInfoText: { flex: 1 },
  headerWithIcon: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  mentorInfoHeader: { color: '#fff', fontSize: 18, fontFamily: theme.typography.fontFamily.bold },
  mentorInfoSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, lineHeight: 18 },
  mentorFullCard: { flexDirection: 'row', backgroundColor: theme.colors.surface, marginHorizontal: theme.spacing.sm, borderRadius: 20, padding: 16, marginBottom: 12, ...theme.shadows.soft, borderWidth: 1, borderColor: 'rgba(0,0,0,0.02)' },
  mentorLeft: { position: 'relative', marginRight: 16 },
  mentorFullAvatar: { width: 70, height: 70, borderRadius: 35, borderWidth: 2, borderColor: theme.colors.primaryLight },
  proBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: theme.colors.primary, width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
  mentorRight: { flex: 1 },
  mentorHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  mentorFullName: { fontSize: 16, fontFamily: theme.typography.fontFamily.bold, color: theme.colors.heading },
  mentorUniversity: { fontSize: 10, fontFamily: theme.typography.fontFamily.bold, color: theme.colors.primary, backgroundColor: theme.colors.primaryLight, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  mentorExpertise: { fontSize: 13, color: theme.colors.textSecondary, marginBottom: 8 },
  mentorStatsRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  mStat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  mStatText: { fontSize: 12, color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.medium },
  connectBtnLarge: { backgroundColor: theme.colors.primary, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  connectBtnText: { color: '#fff', fontSize: 14, fontFamily: theme.typography.fontFamily.bold },
  categoryWrapper: { backgroundColor: theme.colors.surface, paddingBottom: theme.spacing.sm, borderBottomWidth: 1, borderBottomColor: theme.colors.divider },
  categoryScroll: { paddingHorizontal: theme.spacing.lg, gap: theme.spacing.sm },
  categoryChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: theme.borderRadius.full, backgroundColor: theme.colors.background, borderWidth: 1, borderColor: theme.colors.border },
  categoryChipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  categoryText: { fontFamily: theme.typography.fontFamily.medium, fontSize: 13, color: theme.colors.textSecondary },
  categoryTextActive: { color: 'white' },
  listContent: { padding: theme.spacing.sm, paddingBottom: 100 },
  storiesContainer: { marginBottom: theme.spacing.md, height: 110 },
  storiesScroll: { paddingLeft: theme.spacing.xs, alignItems: 'center' },
  addStoryCard: { alignItems: 'center', marginRight: 15, width: 70 },
  addStoryCircle: { width: 66, height: 66, borderRadius: 33, backgroundColor: theme.colors.surface, borderWidth: 2, borderColor: theme.colors.primary, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  storyCard: { alignItems: 'center', marginRight: 15, width: 70 },
  storyCircle: { width: 66, height: 66, borderRadius: 33, padding: 2, borderWidth: 2, borderColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 6, overflow: 'hidden' },
  storyImage: { width: '100%', height: '100%', borderRadius: 31 },
  storyAvatarBorder: { position: 'absolute', bottom: -2, right: -2, width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: theme.colors.surface, backgroundColor: theme.colors.surface, overflow: 'hidden' },
  storyAvatar: { width: '100%', height: '100%', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  storyUserText: { fontSize: 11, fontFamily: theme.typography.fontFamily.medium, color: theme.colors.textPrimary, textAlign: 'center' },
  composeBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, padding: theme.spacing.sm, borderRadius: theme.borderRadius.lg, marginBottom: theme.spacing.sm, borderWidth: 1, borderColor: theme.colors.divider },
  composeAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.primaryLight, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  composeAvatarText: { color: theme.colors.primary, fontFamily: theme.typography.fontFamily.bold },
  composeInputPlaceholder: { flex: 1, marginLeft: theme.spacing.md },
  composePlaceholderText: { fontFamily: theme.typography.fontFamily.regular, color: theme.colors.textSecondary, fontSize: 15 },
  card: { backgroundColor: theme.colors.surface, borderRadius: 20, padding: theme.spacing.md, marginBottom: theme.spacing.sm, borderWidth: 1, borderColor: 'rgba(0,0,0,0.03)' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme.spacing.sm },
  authorSection: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderWidth: 1, borderColor: theme.colors.divider },
  avatarImage: { width: '100%', height: '100%' },
  avatarText: { fontFamily: theme.typography.fontFamily.bold, color: theme.colors.primary, fontSize: 16 },
  userInfo: { marginLeft: theme.spacing.md },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  userName: { fontFamily: theme.typography.fontFamily.bold, fontSize: 15, color: theme.colors.textPrimary },
  solvedBadgeSmall: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.successLight, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 8, gap: 2 },
  solvedBadgeTextSmall: { fontFamily: theme.typography.fontFamily.bold, fontSize: 10, color: theme.colors.success },
  timeText: { fontFamily: theme.typography.fontFamily.regular, fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
  moreBtn: { padding: 4 },
  cardBody: { marginBottom: theme.spacing.sm },
  discussionTitle: { fontFamily: theme.typography.fontFamily.bold, fontSize: 18, color: theme.colors.heading, marginBottom: theme.spacing.xs, lineHeight: 24 },
  discussionContent: { fontFamily: theme.typography.fontFamily.regular, fontSize: 14, color: theme.colors.textPrimary, lineHeight: 22, opacity: 0.8 },
  attachmentBadges: { flexDirection: 'row', gap: 8, marginTop: 10 },
  attachmentBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: theme.colors.primaryLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  attachmentBadgeText: { fontSize: 11, fontFamily: theme.typography.fontFamily.bold, color: theme.colors.primary },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: theme.spacing.sm, borderTopWidth: 1, borderTopColor: theme.colors.divider },
  stats: { flexDirection: 'row', gap: theme.spacing.md },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8 },
  statItemLiked: { backgroundColor: theme.colors.errorLight },
  statText: { fontFamily: theme.typography.fontFamily.medium, fontSize: 13, color: theme.colors.textSecondary },
  actionLinks: { flexDirection: 'row', alignItems: 'center' },
  readMoreText: { fontFamily: theme.typography.fontFamily.semiBold, fontSize: 13, color: theme.colors.primary },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 100, gap: 16 },
  emptyText: { fontFamily: theme.typography.fontFamily.medium, fontSize: 16, color: theme.colors.placeholder },
  sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheetContent: { backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24 },
  sheetHandle: { width: 40, height: 5, backgroundColor: theme.colors.divider, borderRadius: 2.5, alignSelf: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 18, fontFamily: theme.typography.fontFamily.bold, color: theme.colors.heading, marginBottom: 20, textAlign: 'center' },
  sheetSubTitle: { fontSize: 12, fontFamily: theme.typography.fontFamily.bold, color: theme.colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginTop: 8 },
  actionList: { gap: 8 },
  actionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 16 },
  actionIconBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' },
  actionLabel: { fontSize: 16, fontFamily: theme.typography.fontFamily.medium, color: theme.colors.textPrimary },
  sheetCloseBtn: { marginTop: 12, paddingVertical: 16, alignItems: 'center', backgroundColor: theme.colors.background, borderRadius: 16 },
  sheetCloseText: { fontSize: 16, fontFamily: theme.typography.fontFamily.bold, color: theme.colors.textSecondary }
});
