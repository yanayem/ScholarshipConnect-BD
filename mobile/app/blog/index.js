import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, Image
} from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';

const BLOG_POSTS = [
  {
    id: '1',
    title: 'How I got the DAAD Scholarship in 2024',
    author: 'Arif Ahmed',
    university: 'Technical University of Munich',
    date: '2 days ago',
    readTime: '5 min read',
    excerpt: 'Getting the DAAD scholarship was a dream come true. Here is my step-by-step guide on writing a winning motivation letter...',
    image: 'https://images.unsplash.com/photo-1523050853021-eb30896dc19e?w=400',
    tags: ['Germany', 'DAAD', 'Masters'],
    bg: theme.colors.tealCard
  },
  {
    id: '2',
    title: 'My Journey to MEXT: From Dhaka to Tokyo',
    author: 'Nusrat Jahan',
    university: 'University of Tokyo',
    date: '1 week ago',
    readTime: '8 min read',
    excerpt: 'The MEXT interview was the most challenging part. In this blog, I share the common questions and how I prepared for them...',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400',
    tags: ['Japan', 'MEXT', 'PhD'],
    bg: theme.colors.lavenderCard
  },
  {
    id: '3',
    title: 'Tips for Chevening Scholarship Applications',
    author: 'Rakibul Hasan',
    university: 'Oxford University',
    date: '2 weeks ago',
    readTime: '6 min read',
    excerpt: 'Chevening looks for leadership qualities. I focused on my volunteering work and impact. Here is how I structured my essays...',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400',
    tags: ['UK', 'Chevening', 'Leadership'],
    bg: theme.colors.peachCard
  }
];

export default function BlogListScreen() {
  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')}
          style={styles.backBtn}
        >
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.heading} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Success Stories</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.topInfo}>
          <Text style={styles.pageTitle}>Learn from the Winners 🏆</Text>
          <Text style={styles.pageSub}>Real experiences from students who secured prestigious scholarships.</Text>
        </View>

        {BLOG_POSTS.map(post => (
          <TouchableOpacity
            key={post.id}
            style={[styles.postCard, { backgroundColor: post.bg }]}
            onPress={() => router.push(`/blog/${post.id}`)}
          >
            <View style={styles.postContent}>
              <View style={styles.tagRow}>
                {post.tags.map(tag => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>

              <Text style={styles.postTitle}>{post.title}</Text>
              <Text style={styles.excerpt} numberOfLines={2}>{post.excerpt}</Text>

              <View style={styles.authorRow}>
                <View style={styles.authorIcon}>
                  <Text style={styles.authorInitial}>{post.author[0]}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.authorName}>{post.author}</Text>
                  <Text style={styles.authorUni}>{post.university}</Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <MaterialIcons name="access-time" size={14} color={theme.colors.textSecondary} />
                  <Text style={styles.metaText}>{post.date} • {post.readTime}</Text>
                </View>
                <Text style={styles.readMore}>Read Story →</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={styles.shareYourStoryBtn}
          onPress={() => router.push('/blog/create')}
        >
          <MaterialIcons name="edit" size={20} color="#fff" />
          <Text style={styles.shareYourStoryText}>Share Your Story</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    height: 100, backgroundColor: theme.colors.background,
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 40, paddingHorizontal: 20, gap: 12,
    borderBottomWidth: 1, borderBottomColor: theme.colors.divider,
  },
  headerTitle: { color: theme.colors.heading, fontSize: 18, fontWeight: 'bold' },
  backBtn: { padding: 4 },
  scroll: { padding: 20 },
  topInfo: { marginBottom: 28 },
  pageTitle: { fontSize: 24, fontWeight: 'bold', color: theme.colors.heading },
  pageSub: { fontSize: 14, color: theme.colors.textSecondary, marginTop: 6, lineHeight: 22 },
  postCard: {
    borderRadius: 24, marginBottom: 20,
    borderWidth: 1, borderColor: theme.colors.divider,
    overflow: 'hidden',
    ...theme.shadows.premium,
  },
  postContent: { padding: 20 },
  tagRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  tag: { backgroundColor: 'rgba(255,255,255,0.7)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8 },
  tagText: { color: theme.colors.heading, fontSize: 11, fontWeight: 'bold' },
  postTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.heading, marginBottom: 10, lineHeight: 24 },
  excerpt: { fontSize: 14, color: theme.colors.textSecondary, lineHeight: 22, marginBottom: 20 },
  authorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  authorIcon: { width: 40, height: 40, borderRadius: 14, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', ...theme.shadows.soft },
  authorInitial: { color: theme.colors.primary, fontWeight: 'bold', fontSize: 16 },
  authorName: { fontSize: 14, fontWeight: 'bold', color: theme.colors.heading },
  authorUni: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 12, color: theme.colors.textSecondary },
  readMore: { fontSize: 13, color: theme.colors.primary, fontWeight: 'bold' },
  shareYourStoryBtn: {
    backgroundColor: theme.colors.primary, borderRadius: 16, height: 56,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, marginTop: 12, ...theme.shadows.soft,
  },
  shareYourStoryText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
