import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, Image
} from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

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
    tags: ['Germany', 'DAAD', 'Masters']
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
    tags: ['Japan', 'MEXT', 'PhD']
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
    tags: ['UK', 'Chevening', 'Leadership']
  }
];

export default function BlogListScreen() {
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#1565C0" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Success Stories (Blog)</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.topInfo}>
          <Text style={styles.pageTitle}>Learn from the Winners 🏆</Text>
          <Text style={styles.pageSub}>Read real experiences from students who secured prestigious scholarships.</Text>
        </View>

        {BLOG_POSTS.map(post => (
          <TouchableOpacity
            key={post.id}
            style={styles.postCard}
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
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.authorName}>{post.author}</Text>
                  <Text style={styles.authorUni}>{post.university}</Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <MaterialIcons name="access-time" size={14} color="#90A4AE" />
                  <Text style={styles.metaText}>{post.date} • {post.readTime}</Text>
                </View>
                <Text style={styles.readMore}>Read Full Story →</Text>
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
  root: { flex: 1, backgroundColor: '#F4F6FA' },
  header: {
    height: 100, backgroundColor: '#1565C0',
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 40, paddingHorizontal: 16, gap: 12
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  backBtn: { padding: 4 },
  scroll: { padding: 16 },
  topInfo: { marginBottom: 24 },
  pageTitle: { fontSize: 22, fontWeight: 'bold', color: '#1A237E' },
  pageSub: { fontSize: 14, color: '#607D8B', marginTop: 4, lineHeight: 20 },
  postCard: {
    backgroundColor: '#fff', borderRadius: 16, marginBottom: 20,
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8,
    overflow: 'hidden'
  },
  postContent: { padding: 16 },
  tagRow: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  tag: { backgroundColor: '#E3F2FD', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  tagText: { color: '#1565C0', fontSize: 11, fontWeight: 'bold' },
  postTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A237E', marginBottom: 8 },
  excerpt: { fontSize: 14, color: '#455A64', lineHeight: 20, marginBottom: 16 },
  authorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  authorIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#BBDEFB', alignItems: 'center', justifyContent: 'center' },
  authorInitial: { color: '#1565C0', fontWeight: 'bold' },
  authorName: { fontSize: 14, fontWeight: 'bold', color: '#263238' },
  authorUni: { fontSize: 12, color: '#607D8B' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F5F5F5' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: '#90A4AE' },
  readMore: { fontSize: 13, color: '#1565C0', fontWeight: 'bold' },
  shareYourStoryBtn: {
    backgroundColor: '#2E7D32', borderRadius: 12, height: 56,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, marginTop: 10, elevation: 4
  },
  shareYourStoryText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
