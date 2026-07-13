import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Image, TouchableOpacity,
  StatusBar, ActivityIndicator, Dimensions, SafeAreaView,
  Alert
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { theme } from '../../../theme';
import { apiService } from '../../../services/api';

const { width, height } = Dimensions.get('window');

const REACTION_TYPES = [
  { type: 'like', icon: '👍', label: 'Like' },
  { type: 'celebrate', icon: '👏', label: 'Celebrate' },
  { type: 'support', icon: '🤝', label: 'Support' },
  { type: 'insightful', icon: '💡', label: 'Insightful' },
  { type: 'inspiring', icon: '✨', label: 'Inspiring' },
];

export default function StoryViewScreen() {
  const { id } = useLocalSearchParams();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [showReactions, setShowReactions] = useState(false);
  const [hoveredReaction, setHoveredReaction] = useState(null);

  const loadStory = async () => {
    try {
      const profileRes = await apiService.getProfile();
      if (profileRes.ok) setCurrentUser(profileRes.data);

      const res = await apiService.getStoryDetail(id);
      if (res.ok) {
        setStory(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStory();
  }, [id]);

  const handleReact = async (reactionType) => {
    if (!currentUser) {
      Alert.alert('Login Required', 'Please login to react to stories.');
      return;
    }

    const res = await apiService.reactToStory(id, reactionType);
    if (res.ok) {
      setShowReactions(false);
      loadStory();
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="white" />
      </View>
    );
  }

  if (!story) {
    return (
      <View style={styles.center}>
        <Text style={{ color: 'white' }}>Story not found.</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: theme.colors.primary }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <Image source={{ uri: story.media }} style={styles.mainImage} resizeMode="cover" />

      <View style={styles.overlay}>
        <SafeAreaView>
          <View style={styles.header}>
            <View style={styles.userInfo}>
              <View style={styles.avatarBorder}>
                {story.author_avatar_url ? (
                  <Image source={{ uri: story.author_avatar_url }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, { backgroundColor: theme.colors.primaryLight }]}>
                    <Text style={styles.avatarText}>{(story.author_full_name || story.author_name || 'A')[0]}</Text>
                  </View>
                )}
              </View>
              <View>
                <Text style={styles.userName}>{story.author_full_name || story.author_name}</Text>
                <Text style={styles.timeText}>{new Date(story.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
              <Ionicons name="close" size={30} color="white" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        <View style={styles.footer}>
          {story.caption ? (
            <Text style={styles.caption}>{story.caption}</Text>
          ) : null}

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.reactionTrigger}
              onPress={() => setShowReactions(!showReactions)}
            >
              <Text style={styles.reactionPlaceholder}>
                {story.user_reaction ?
                  REACTION_TYPES.find(r => r.type === story.user_reaction)?.icon + ' You reacted' :
                  'React to this story...'}
              </Text>
            </TouchableOpacity>

            <View style={styles.statsRow}>
               <Ionicons name="heart" size={20} color={theme.colors.error} />
               <Text style={styles.statsText}>{story.reactions_count}</Text>
            </View>
          </View>

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

          {story.reactions && story.reactions.length > 0 && (
            <View style={styles.recentReactions}>
              <Text style={styles.recentReactionsText}>
                {story.reactions.slice(0, 3).map(r => r.user_name).join(', ')}
                {story.reactions.length > 3 ? ` and ${story.reactions.length - 3} others` : ''} reacted
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  center: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainImage: {
    width: width,
    height: height,
    position: 'absolute',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarBorder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
    marginRight: 10,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
  },
  userName: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  timeText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  closeBtn: {
    padding: 5,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  caption: {
    color: 'white',
    fontSize: 16,
    marginBottom: 20,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reactionTrigger: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginRight: 15,
  },
  reactionPlaceholder: {
    color: 'white',
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statsText: {
    color: 'white',
    fontWeight: 'bold',
  },
  reactionPicker: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 30,
    padding: 10,
    elevation: 5,
    alignItems: 'center',
  },
  hoveredLabelContainer: {
    position: 'absolute',
    top: -35,
    backgroundColor: 'rgba(0,0,0,0.8)',
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
  recentReactions: {
    marginTop: 15,
  },
  recentReactionsText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontStyle: 'italic',
  }
});
