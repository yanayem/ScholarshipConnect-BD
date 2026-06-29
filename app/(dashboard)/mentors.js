import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native';
import { theme } from '../../theme';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

const MENTORS = [
  {
    id: '1',
    name: 'Dr. Rafiqul Islam',
    role: 'MEXT Scholar (Tokyo University)',
    specialty: 'Engineering & Robotics',
    rating: 4.9,
    sessions: 124,
    image: 'https://i.pravatar.cc/150?u=1',
    verified: true,
  },
  {
    id: '2',
    name: 'Sarah Rahman',
    role: 'Chevening Scholar (Oxford)',
    specialty: 'Public Policy & Law',
    rating: 5.0,
    sessions: 89,
    image: 'https://i.pravatar.cc/150?u=2',
    verified: true,
  },
  {
    id: '3',
    name: 'Asif Chowdhury',
    role: 'Fulbright Scholar (Stanford)',
    specialty: 'Computer Science',
    rating: 4.8,
    sessions: 56,
    image: 'https://i.pravatar.cc/150?u=3',
    verified: true,
  },
  {
    id: '4',
    name: 'Mehnaz Parveen',
    role: 'DAAD Scholar (TU Munich)',
    specialty: 'Biotechnology',
    rating: 4.7,
    sessions: 42,
    image: 'https://i.pravatar.cc/150?u=4',
    verified: true,
  }
];

export default function MentorsScreen() {
  const renderMentor = ({ item }) => (
    <View style={[styles.mentorCard, theme.shadows.soft]}>
      <Image source={{ uri: item.image }} style={styles.mentorImage} />
      <View style={styles.mentorInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.mentorName}>{item.name}</Text>
          {item.verified && <MaterialIcons name="verified" size={16} color={theme.colors.info} />}
        </View>
        <Text style={styles.mentorRole}>{item.role}</Text>
        <Text style={styles.mentorSpecialty}>{item.specialty}</Text>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <MaterialIcons name="star" size={14} color={theme.colors.warning} />
            <Text style={styles.statText}>{item.rating}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.stat}>
            <MaterialIcons name="event-available" size={14} color={theme.colors.textSecondary} />
            <Text style={styles.statText}>{item.sessions} Sessions</Text>
          </View>
        </View>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.primaryBtn}>
          <Text style={styles.primaryBtnText}>Book Session</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryBtn}>
          <MaterialIcons name="chat-bubble-outline" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mentor Network</Text>
        <Text style={styles.subtitle}>Get guided by those who have already succeeded</Text>
      </View>

      <FlatList
        data={MENTORS}
        renderItem={renderMentor}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
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
  header: {
    padding: theme.spacing.lg,
  },
  title: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.xxl,
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.sizes.base,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  listContent: {
    padding: theme.spacing.md,
  },
  columnWrapper: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  mentorCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  mentorImage: {
    width: '100%',
    height: 120,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  mentorInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  mentorName: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.base,
    color: theme.colors.textPrimary,
  },
  mentorRole: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 11,
    color: theme.colors.primary,
    marginBottom: 4,
  },
  mentorSpecialty: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  statText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 11,
    color: theme.colors.textPrimary,
  },
  divider: {
    width: 1,
    height: 10,
    backgroundColor: theme.colors.divider,
  },
  cardActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  primaryBtn: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontFamily: theme.typography.fontFamily.bold,
    color: 'white',
    fontSize: 12,
  },
  secondaryBtn: {
    paddingHorizontal: 8,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
