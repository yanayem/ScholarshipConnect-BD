import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, Image
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

const BLOG_DETAILS = {
  '1': {
    title: 'How I got the DAAD Scholarship in 2024',
    author: 'Arif Ahmed',
    university: 'Technical University of Munich',
    date: 'Oct 20, 2024',
    content: `Securing the DAAD scholarship was a journey of patience and preparation. DAAD (German Academic Exchange Service) is one of the most prestigious scholarships in the world for international students.

Step 1: Research
I started researching one year before the deadline. Germany offers many programs, so I chose "Sustainable Engineering" which perfectly aligned with my background.

Step 2: Documentation
The most critical part is the Motivation Letter. I wrote 5 drafts before finalizing it. In my letter, I focused on:
- My academic achievements in Bangladesh.
- Why Germany? (specifically their engineering prowess).
- How this scholarship will help my country.

Step 3: The Interview
The interview was technical yet focused on my vision. They asked about my research plan and how I would adapt to German culture.

My advice: Start early and be authentic. Don't just copy-paste templates.`,
    tags: ['Germany', 'DAAD', 'Masters']
  }
};

export default function BlogDetailScreen() {
  const { id } = useLocalSearchParams();
  const post = BLOG_DETAILS[id] || BLOG_DETAILS['1']; // Default to 1 for demo

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="close" size={24} color="#263238" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareBtn}>
          <MaterialIcons name="share" size={24} color="#263238" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.tagRow}>
          {post.tags.map(tag => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.title}>{post.title}</Text>

        <View style={styles.authorCard}>
          <View style={styles.authorIcon}>
            <Text style={styles.authorInitial}>{post.author[0]}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.authorName}>{post.author}</Text>
            <Text style={styles.authorUni}>{post.university}</Text>
          </View>
          <Text style={styles.date}>{post.date}</Text>
        </View>

        <View style={styles.divider} />

        <Text style={styles.content}>{post.content}</Text>

        <View style={styles.tipsBox}>
          <Text style={styles.tipsTitle}>💡 Key Takeaway</Text>
          <Text style={styles.tipsText}>Focus on how your study will benefit your home country. DAAD looks for future leaders who will contribute back to their society.</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  header: {
    height: 100, backgroundColor: '#fff',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 40, paddingHorizontal: 16
  },
  backBtn: { padding: 8, backgroundColor: '#F5F5F5', borderRadius: 12 },
  shareBtn: { padding: 8, backgroundColor: '#F5F5F5', borderRadius: 12 },
  scroll: { padding: 20 },
  tagRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  tag: { backgroundColor: '#E3F2FD', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  tagText: { color: '#1565C0', fontSize: 12, fontWeight: 'bold' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1A237E', lineHeight: 34, marginBottom: 20 },
  authorCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  authorIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#BBDEFB', alignItems: 'center', justifyContent: 'center' },
  authorInitial: { fontSize: 18, color: '#1565C0', fontWeight: 'bold' },
  authorName: { fontSize: 16, fontWeight: 'bold', color: '#263238' },
  authorUni: { fontSize: 13, color: '#607D8B' },
  date: { fontSize: 12, color: '#90A4AE' },
  divider: { height: 1, backgroundColor: '#ECEFF1', marginBottom: 24 },
  content: { fontSize: 16, color: '#455A64', lineHeight: 28, marginBottom: 24 },
  tipsBox: { backgroundColor: '#FFF9C4', padding: 20, borderRadius: 16, borderLeftWidth: 4, borderLeftColor: '#FBC02D' },
  tipsTitle: { fontSize: 16, fontWeight: 'bold', color: '#F57F17', marginBottom: 8 },
  tipsText: { fontSize: 14, color: '#7F4D00', lineHeight: 22 }
});
