import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { theme } from '../../theme';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

const CATEGORIES = ['All', 'Scholarships', 'SOP/CV', 'Visa', 'Test Prep', 'Life Abroad'];

const DISCUSSIONS = [
  {
    id: '1',
    user: 'Tahmid Hasan',
    title: 'Tips for MEXT Research Plan?',
    content: 'I am struggling with the research plan for MEXT. Any tips on how to structure it for a Masters in CS?',
    likes: 24,
    comments: 12,
    category: 'Scholarships',
    time: '2h ago',
    avatar: 'T'
  },
  {
    id: '2',
    user: 'Sadia Rahman',
    title: 'Best IELTS center in Dhaka?',
    content: 'Looking for recommendations for IELTS coaching and exam centers. Mentors, please suggest!',
    likes: 15,
    comments: 8,
    category: 'Test Prep',
    time: '5h ago',
    avatar: 'S'
  },
  {
    id: '3',
    user: 'Arif Ahmed',
    title: 'DAAD health insurance requirements',
    content: 'Do we need to get insurance from Bangladesh or after arriving in Germany?',
    likes: 10,
    comments: 4,
    category: 'Visa',
    time: '1d ago',
    avatar: 'A'
  }
];

export default function CommunityScreen() {
  const [activeCategory, setActiveCategory] = useState('All');

  const renderDiscussion = ({ item }) => (
    <View style={[styles.card, theme.shadows.soft]}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.avatar}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.user}</Text>
          <Text style={styles.timeText}>{item.time} • {item.category}</Text>
        </View>
        <TouchableOpacity>
          <MaterialIcons name="more-vert" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <Text style={styles.discussionTitle}>{item.title}</Text>
      <Text style={styles.discussionContent} numberOfLines={3}>{item.content}</Text>

      <View style={styles.cardFooter}>
        <View style={styles.stats}>
          <TouchableOpacity style={styles.statItem}>
            <Ionicons name="heart-outline" size={18} color={theme.colors.textSecondary} />
            <Text style={styles.statText}>{item.likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statItem}>
            <Ionicons name="chatbubble-outline" size={17} color={theme.colors.textSecondary} />
            <Text style={styles.statText}>{item.comments}</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.joinBtn}>
          <Text style={styles.joinBtnText}>Join Discussion</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchHeader}>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={20} color={theme.colors.placeholder} />
          <TextInput placeholder="Search discussions..." style={styles.searchInput} />
        </View>
        <TouchableOpacity style={styles.askBtn}>
          <MaterialIcons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.categoryContainer}>
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
        data={DISCUSSIONS}
        renderItem={renderDiscussion}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  searchHeader: {
    padding: theme.spacing.md,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    fontFamily: theme.typography.fontFamily.regular,
  },
  askBtn: {
    backgroundColor: theme.colors.primary,
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryContainer: {
    backgroundColor: theme.colors.surface,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  categoryScroll: {
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  categoryChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  categoryTextActive: {
    color: 'white',
  },
  listContent: {
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.lavenderCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.primary,
  },
  userInfo: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  userName: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textPrimary,
  },
  timeText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 10,
    color: theme.colors.textSecondary,
  },
  discussionTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.base,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  discussionContent: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  stats: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  joinBtn: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.sm,
  },
  joinBtnText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 12,
    color: theme.colors.primary,
  },
});
