import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, Image
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';

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
  const post = BLOG_DETAILS[id] || BLOG_DETAILS['1'];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.canGoBack() ? router.back() : router.replace('/blog')}
          style={styles.backBtn}
        >
          <MaterialIcons name="close" size={24} color={theme.colors.heading} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareBtn}>
          <MaterialIcons name="share" size={22} color={theme.colors.heading} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.tagRow}>
          {post.tags.map(tag => (
            <View key={tag} style={[styles.tag, { backgroundColor: theme.colors.tealCard }]}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.title}>{post.title}</Text>

        <View style={styles.authorCard}>
          <View style={styles.authorIcon}>
            <Text style={styles.authorInitial}>{post.author[0]}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={styles.authorName}>{post.author}</Text>
            <Text style={styles.authorUni}>{post.university}</Text>
          </View>
          <Text style={styles.date}>{post.date}</Text>
        </View>

        <View style={styles.divider} />

        <Text style={styles.content}>{post.content}</Text>

        <View style={[styles.tipsBox, { backgroundColor: theme.colors.peachCard }]}>
          <Text style={styles.tipsTitle}>💡 Key Takeaway</Text>
          <Text style={styles.tipsText}>Focus on how your study will benefit your home country. DAAD looks for future leaders who will contribute back to their society.</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    height: 100, backgroundColor: theme.colors.background,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 40, paddingHorizontal: 20
  },
  backBtn: { padding: 10, backgroundColor: theme.colors.surface, borderRadius: 14, borderWidth: 1, borderColor: theme.colors.divider, ...theme.shadows.soft },
  shareBtn: { padding: 10, backgroundColor: theme.colors.surface, borderRadius: 14, borderWidth: 1, borderColor: theme.colors.divider, ...theme.shadows.soft },
  scroll: { padding: 24 },
  tagRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  tag: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10 },
  tagText: { color: theme.colors.primaryDark, fontSize: 12, fontWeight: 'bold' },
  title: { fontSize: 26, fontWeight: 'bold', color: theme.colors.heading, lineHeight: 36, marginBottom: 24 },
  authorCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  authorIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: theme.colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  authorInitial: { fontSize: 18, color: theme.colors.primary, fontWeight: 'bold' },
  authorName: { fontSize: 16, fontWeight: 'bold', color: theme.colors.heading },
  authorUni: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 4 },
  date: { fontSize: 12, color: theme.colors.textSecondary },
  divider: { height: 1, backgroundColor: theme.colors.divider, marginBottom: 32 },
  content: { fontSize: 16, color: theme.colors.textPrimary, lineHeight: 28, marginBottom: 32 },
  tipsBox: { padding: 24, borderRadius: 24, borderLeftWidth: 4, borderLeftColor: theme.colors.primary, ...theme.shadows.soft },
  tipsTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.heading, marginBottom: 10 },
  tipsText: { fontSize: 14, color: theme.colors.textSecondary, lineHeight: 24 }
});
