import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, Image, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { apiService } from '../../services/api';
import { Loader } from '../../components/Loader';

const REACTION_TYPES = [
  { type: 'like', icon: '👍', label: 'Like' },
  { type: 'celebrate', icon: '👏', label: 'Celebrate' },
  { type: 'support', icon: '🤝', label: 'Support' },
  { type: 'insightful', icon: '💡', label: 'Insightful' },
  { type: 'inspiring', icon: '✨', label: 'Inspiring' },
];

export default function BlogDetailScreen() {
  const { id } = useLocalSearchParams();
  const [post, setPost] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [activeTab, setActiveTab] = useState('info'); // 'info' or 'discussion'
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [showReactions, setShowReactions] = useState(false);
  const [hoveredReaction, setHoveredReaction] = useState(null);

  const loadPost = async () => {
    try {
      const profileRes = await apiService.getProfile();
      if (profileRes.ok) setCurrentUser(profileRes.data);

      const res = await apiService.getBlogPostDetail(id);
      if (res.ok) {
        setPost(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPost();
  }, [id]);

  const handleLike = async () => {
    if (!post || !currentUser) {
      Alert.alert('Login Required', 'Please login to like this post.');
      return;
    }

    // Optimistic UI update
    const wasLiked = post.is_liked;
    setPost({
      ...post,
      is_liked: !wasLiked,
      likes_count: wasLiked ? post.likes_count - 1 : post.likes_count + 1
    });

    const res = await apiService.likeBlogPost(post.id);
    if (!res.ok) {
      // Revert if error
      loadPost();
    }
  };

  const handleReact = async (reactionType) => {
    if (!currentUser) {
      Alert.alert('Login Required', 'Please login to react.');
      return;
    }

    const res = await apiService.reactToBlogPost(post.id, reactionType);
    if (res.ok) {
      setShowReactions(false);
      loadPost();
    }
  };

  const handleComment = async () => {
    if (!currentUser) {
      Alert.alert('Login Required', 'Please login to comment.');
      return;
    }
    if (!comment.trim() || submittingComment) return;
    setSubmittingComment(true);

    let res;
    if (editingCommentId) {
      res = await apiService.updateComment(editingCommentId, comment);
    } else {
      res = await apiService.commentBlogPost(post.id, comment);
    }

    if (res.ok) {
      setComment('');
      setEditingCommentId(null);
      loadPost();
    } else {
      Alert.alert('Error', res.data.error || 'Failed to post comment');
    }
    setSubmittingComment(false);
  };

  const startEditComment = (commentObj) => {
    setComment(commentObj.content);
    setEditingCommentId(commentObj.id);
  };

  const cancelEditComment = () => {
    setComment('');
    setEditingCommentId(null);
  };

  const handleDeleteComment = (commentId) => {
    Alert.alert(
      'Delete Comment',
      'Are you sure you want to remove this comment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const res = await apiService.deleteComment(commentId);
            if (res.ok) {
              loadPost();
            } else {
              Alert.alert('Error', 'Failed to delete comment');
            }
          }
        }
      ]
    );
  };

  const handleEdit = () => {
    router.push({
      pathname: isDiscussion ? '/blog/create-discussion' : '/blog/create-story',
      params: { id: post.id }
    });
  };

  const handleToggleSolved = async () => {
    try {
      const res = await apiService.updateBlogPost(post.id, { is_solved: !post.is_solved });
      if (res.ok) {
        setPost({ ...post, is_solved: !post.is_solved });
        Alert.alert('Success', post.is_solved ? 'Discussion reopened' : 'Discussion marked as solved!');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this discussion? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const res = await apiService.deleteBlogPost(post.id);
            if (res.ok) {
              router.replace('/(tabs)/community');
            } else {
              Alert.alert('Error', 'Failed to delete post.');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return <Loader message="Opening post..." />;
  }

  if (!post) {
    return (
      <View style={[styles.root, styles.center]}>
        <Text>Post not found.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: theme.colors.primary }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isDiscussion = post.post_type === 'discussion';

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.surface} />

      {/* Header / Workspace Toolbar */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => router.canGoBack() ? router.back() : router.replace(isDiscussion ? '/(tabs)/community' : '/blog')}
            style={styles.backBtn}
          >
            <MaterialIcons name="arrow-back" size={24} color={theme.colors.heading} />
          </TouchableOpacity>
          <View>
            <Text style={styles.workspaceTag}>{isDiscussion ? 'COMMUNITY WORKSPACE' : 'SUCCESS STORY'}</Text>
            <Text style={styles.headerTitle} numberOfLines={1}>{post.title}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          {post && isDiscussion && currentUser && (post.author === currentUser.user_id || currentUser.is_staff) && (
            <TouchableOpacity
              style={[styles.actionBtn, post.is_solved && { backgroundColor: theme.colors.successLight }]}
              onPress={handleToggleSolved}
              title={post.is_solved ? "Mark Unsolved" : "Mark Solved"}
            >
              <MaterialIcons
                name={post.is_solved ? "check-circle" : "check-circle-outline"}
                size={20}
                color={post.is_solved ? theme.colors.success : theme.colors.textSecondary}
              />
            </TouchableOpacity>
          )}
          {post && currentUser && (post.author === currentUser.user_id || currentUser.is_staff) && (
            <View style={styles.authorActions}>
              <TouchableOpacity style={styles.actionBtn} onPress={handleEdit}>
                <MaterialIcons name="edit" size={20} color={theme.colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={handleDelete}>
                <MaterialIcons name="delete-outline" size={20} color={theme.colors.error} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'info' && styles.activeTab]}
          onPress={() => setActiveTab('info')}
        >
          <MaterialIcons name="info-outline" size={20} color={activeTab === 'info' ? theme.colors.primary : theme.colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'info' && styles.activeTabText]}>{isDiscussion ? 'Information' : 'The Story'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'discussion' && styles.activeTab]}
          onPress={() => setActiveTab('discussion')}
        >
          <MaterialIcons name="forum" size={20} color={activeTab === 'discussion' ? theme.colors.primary : theme.colors.textSecondary} />
          <Text style={[styles.tabText, activeTab === 'discussion' && styles.activeTabText]}>
            {isDiscussion ? 'Discussion' : 'Comments'} ({post.comments_count})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {activeTab === 'info' ? (
          <View style={styles.infoSection}>
            {post.is_solved && (
              <View style={styles.solvedBanner}>
                <MaterialIcons name="verified" size={24} color={theme.colors.success} />
                <View>
                  <Text style={styles.solvedBannerTitle}>Solved</Text>
                  <Text style={styles.solvedBannerSub}>This problem has been resolved!</Text>
                </View>
              </View>
            )}
            <View style={styles.authorCard}>
              <View style={styles.authorIcon}>
                {post.author_avatar_url ? (
                  <Image source={{ uri: post.author_avatar_url }} style={styles.authorIconImage} />
                ) : (
                  <Text style={styles.authorInitial}>{(post.author_full_name || post.author_name || 'A')[0]}</Text>
                )}
              </View>
              <View style={{ flex: 1, marginLeft: 16 }}>
                <View style={styles.nameRow}>
                  <Text style={styles.authorName}>{post.author_full_name || post.author_name}</Text>
                  {post.author_role === 'Staff' && (
                    <MaterialIcons name="verified" size={16} color={theme.colors.primary} />
                  )}
                </View>
                <Text style={styles.authorUni}>{post.university || (isDiscussion ? 'Scholar User' : 'Winner')}</Text>
              </View>
              <View style={styles.dateChip}>
                 <Text style={styles.dateText}>{new Date(post.created_at).toLocaleDateString()}</Text>
              </View>
            </View>

            <View style={styles.tagRow}>
              {post.tags && post.tags.split(',').map(tag => (
                <View key={tag.trim()} style={styles.tagBadge}>
                  <Text style={styles.tagBadgeText}># {tag.trim()}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.contentTitle}>{isDiscussion ? 'Topic Overview' : 'Full Experience'}</Text>
            <View style={styles.contentContainer}>
               <Text style={styles.content}>{post.content}</Text>
            </View>

            <View style={styles.engagementBar}>
               <TouchableOpacity
                 style={styles.statBtn}
                 onPress={() => setShowReactions(!showReactions)}
                 onLongPress={() => setShowReactions(true)}
               >
                  <Text style={styles.reactionText}>
                    {post.user_reaction ?
                      REACTION_TYPES.find(r => r.type === post.user_reaction)?.icon :
                      <Ionicons name="heart-outline" size={22} color={theme.colors.textSecondary} />
                    }
                  </Text>
                  <Text style={[styles.statBtnText, post.user_reaction && {color: theme.colors.primary}]}>
                    {post.reactions_count || 0} {post.reactions_count === 1 ? 'Reaction' : 'Reactions'}
                  </Text>
               </TouchableOpacity>

               {showReactions && (
                <View style={styles.reactionPicker}>
                  {hoveredReaction && (
                    <View style={styles.hoveredLabelContainer}>
                      <Text style={styles.hoveredLabelText}>{hoveredReaction}</Text>
                    </View>
                  )}
                  <View style={styles.reactionIconsRow}>
                    {REACTION_TYPES.map(r => (
                      <TouchableOpacity
                        key={r.type}
                        style={styles.reactionItem}
                        onPress={() => handleReact(r.type)}
                        onPressIn={() => setHoveredReaction(r.label)}
                        onPressOut={() => setHoveredReaction(null)}
                      >
                        <Text style={styles.reactionIcon}>{r.icon}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.discussionSection}>
            <View style={styles.workroomAlert}>
               <MaterialIcons name="tips-and-updates" size={20} color={theme.colors.primary} />
               <Text style={styles.workroomAlertText}>
                 {isDiscussion
                   ? 'You are in a collaborative workspace. Please be respectful and helpful.'
                   : 'Engage with the author or ask questions about their journey!'}
               </Text>
            </View>


            <View style={styles.commentsList}>
              {post.comments && post.comments.length > 0 ? (
                post.comments.map((c) => (
                  <View key={c.id} style={styles.commentCard}>
                    <View style={styles.commentHeader}>
                      <View style={styles.smallAvatar}>
                        {c.author_avatar_url ? (
                          <Image source={{ uri: c.author_avatar_url }} style={styles.smallAvatarImage} />
                        ) : (
                          <Text style={styles.smallAvatarText}>{(c.author_full_name || c.author_name || 'U')[0].toUpperCase()}</Text>
                        )}
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={styles.commentNameRow}>
                          <Text style={styles.commentAuthor}>{c.author_full_name || c.author_name}</Text>
                          {currentUser && (c.user === currentUser.user_id || currentUser.is_staff) && (
                            <View style={styles.commentActions}>
                              <TouchableOpacity onPress={() => startEditComment(c)}>
                                <MaterialIcons name="edit" size={14} color={theme.colors.primary} />
                              </TouchableOpacity>
                              <TouchableOpacity onPress={() => handleDeleteComment(c.id)}>
                                <MaterialIcons name="delete-outline" size={14} color={theme.colors.error} />
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>
                        <Text style={styles.commentEmail}>{c.author_email}</Text>
                        <Text style={styles.commentDate}>{new Date(c.created_at).toLocaleDateString()}</Text>
                      </View>
                    </View>
                    <Text style={styles.commentText}>{c.content}</Text>
                  </View>
                ))
              ) : (
                <View style={styles.emptyComments}>
                  <Ionicons name="chatbubbles-outline" size={48} color={theme.colors.placeholder} />
                  <Text style={styles.noComments}>No contributions yet.</Text>
                  <Text style={styles.noCommentsSub}>Start the collaboration by adding a comment below.</Text>
                </View>
              )}
            </View>
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Persistent Interaction Bar */}
      <View style={styles.interactionBar}>
        {editingCommentId && (
          <TouchableOpacity style={styles.cancelEditBtn} onPress={cancelEditComment}>
            <MaterialIcons name="close" size={20} color={theme.colors.error} />
          </TouchableOpacity>
        )}
        <TextInput
          style={styles.commentInput}
          placeholder={editingCommentId ? "Edit your comment..." : "Share your thoughts or ask a question..."}
          value={comment}
          onChangeText={setComment}
          multiline={false}
          returnKeyType="send"
          onSubmitEditing={handleComment}
          blurOnSubmit={true}
        />
        <TouchableOpacity
          style={[styles.sendBtn, !comment.trim() && { opacity: 0.5 }]}
          onPress={handleComment}
          disabled={!comment.trim() || submittingComment}
        >
          {submittingComment ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <MaterialIcons name={editingCommentId ? "check" : "send"} size={24} color="white" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: {
    height: 110, backgroundColor: theme.colors.surface,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 50, paddingHorizontal: 20,
    borderBottomWidth: 1, borderBottomColor: theme.colors.divider,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  authorActions: { flexDirection: 'row', gap: 4 },
  actionBtn: { padding: 8, backgroundColor: theme.colors.background, borderRadius: 10 },
  workspaceTag: { fontSize: 10, fontWeight: 'bold', color: theme.colors.primary, letterSpacing: 1 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.heading, flex: 1 },
  backBtn: { padding: 4 },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: { borderBottomColor: theme.colors.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: theme.colors.textSecondary },
  activeTabText: { color: theme.colors.primary },

  scroll: { padding: 20 },

  infoSection: { gap: 20 },
  solvedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    backgroundColor: theme.colors.successLight,
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.success + '30',
  },
  solvedBannerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.success,
  },
  solvedBannerSub: {
    fontSize: 12,
    color: theme.colors.success,
    opacity: 0.8,
  },
  authorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 16,
    ...theme.shadows.soft,
  },
  authorIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: theme.colors.primaryLight, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  authorIconImage: { width: '100%', height: '100%' },
  authorInitial: { fontSize: 18, color: theme.colors.primary, fontWeight: 'bold' },
  authorName: { fontSize: 15, fontWeight: 'bold', color: theme.colors.heading },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  authorUni: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
  dateChip: { backgroundColor: theme.colors.background, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  dateText: { fontSize: 11, color: theme.colors.textSecondary, fontWeight: '600' },

  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagBadge: { backgroundColor: theme.colors.tealCard, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  tagBadgeText: { fontSize: 11, color: theme.colors.primaryDark, fontWeight: 'bold' },

  contentTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.heading, marginTop: 10 },
  contentContainer: {
    backgroundColor: theme.colors.surface,
    padding: 20,
    borderRadius: 20,
    lineHeight: 24,
    ...theme.shadows.soft
  },
  content: { fontSize: 15, color: theme.colors.textPrimary, lineHeight: 24 },

  engagementBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
    marginTop: 10
  },
  statBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: theme.colors.surface, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, ...theme.shadows.soft },
  statBtnText: { fontSize: 13, fontWeight: 'bold', color: theme.colors.textPrimary },
  reactionText: { fontSize: 20 },
  reactionPicker: {
    position: 'absolute',
    bottom: 60,
    left: '10%',
    right: '10%',
    backgroundColor: 'white',
    borderRadius: 30,
    padding: 10,
    elevation: 0,
    zIndex: 10,
    borderWidth: 1,
    borderColor: theme.colors.divider,
    alignItems: 'center',
  },
  hoveredLabelContainer: {
    position: 'absolute',
    top: -35,
    backgroundColor: theme.colors.heading,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  hoveredLabelText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  reactionIconsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
  },
  reactionItem: {
    padding: 5,
  },
  reactionIcon: {
    fontSize: 24,
  },

  discussionSection: { gap: 16 },
  workroomAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: theme.colors.primaryLight,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.primary + '30',
  },
  workroomAlertText: { fontSize: 12, color: theme.colors.primaryDark, flex: 1, fontWeight: '500' },

  commentsList: { gap: 12 },
  commentCard: {
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 16,
    ...theme.shadows.soft,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  commentHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  smallAvatar: { width: 32, height: 32, borderRadius: 8, backgroundColor: theme.colors.lavenderCard, alignItems: 'center', justifyContent: 'center', marginRight: 12, overflow: 'hidden' },
  smallAvatarImage: { width: '100%', height: '100%' },
  smallAvatarText: { fontSize: 14, fontWeight: 'bold', color: theme.colors.primary },
  commentNameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  commentActions: { flexDirection: 'row', gap: 10 },
  commentAuthor: { fontSize: 14, fontWeight: 'bold', color: theme.colors.textPrimary },
  commentEmail: { fontSize: 11, color: theme.colors.primary, marginTop: -2, marginBottom: 2 },
  commentDate: { fontSize: 11, color: theme.colors.textSecondary },
  commentText: { fontSize: 14, color: theme.colors.textSecondary, lineHeight: 20 },

  emptyComments: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  noComments: { fontSize: 16, fontWeight: 'bold', color: theme.colors.heading, marginTop: 12 },
  noCommentsSub: { fontSize: 13, color: theme.colors.textSecondary, textAlign: 'center', marginTop: 4 },

  interactionBar: {
    flexDirection: 'row', alignItems: 'center', padding: 16,
    backgroundColor: theme.colors.surface, borderTopWidth: 1, borderTopColor: theme.colors.divider,
    paddingBottom: Platform.OS === 'ios' ? 36 : 16,
    ...theme.shadows.premium,
  },
  cancelEditBtn: {
    padding: 8,
    marginRight: 8,
    backgroundColor: theme.colors.background,
    borderRadius: 20,
  },
  commentInput: {
    flex: 1, backgroundColor: theme.colors.background, borderRadius: 24,
    paddingHorizontal: 16, paddingVertical: 10, marginRight: 12,
    maxHeight: 100, fontSize: 15, color: theme.colors.textPrimary,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: theme.colors.primary,
    alignItems: 'center', justifyContent: 'center', ...theme.shadows.soft
  }
});
