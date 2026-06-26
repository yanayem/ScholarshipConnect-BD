import { View, Text, StyleSheet, ScrollView, TextInput, Pressable } from 'react-native';
import { theme } from '../../theme';
import ScholarshipCard from '../../components/cards/ScholarshipCard';
import { Ionicons } from '@expo/vector-icons';

export default function ScholarshipsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Discover Scholarships</Text>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput} 
            placeholder="Search by keyword, field, or location..."
            placeholderTextColor={theme.colors.textSecondary}
          />
          <Pressable style={styles.filterBtn}>
            <Ionicons name="options" size={20} color={theme.colors.textPrimary} />
          </Pressable>
        </View>
      </View>

      <View style={styles.categories}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['All', 'STEM', 'Arts', 'Need-Based', 'Merit-Based', 'International'].map((cat, index) => (
            <Pressable key={index} style={[styles.categoryPill, index === 0 && styles.categoryPillActive]}>
              <Text style={[styles.categoryText, index === 0 && styles.categoryTextActive]}>{cat}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.gridContainer}>
        <View style={styles.grid}>
          <ScholarshipCard 
            title="National Science Foundation Grant" 
            organization="NSF BD" 
            amount="$2,000" 
            deadline="Aug 15" 
          />
          <ScholarshipCard 
            title="Arts & Culture Fellowship" 
            organization="Creative Arts Council" 
            amount="$1,000" 
            deadline="Sep 01" 
          />
          <ScholarshipCard 
            title="Future Leaders in Tech" 
            organization="Tech BD Initiative" 
            amount="$3,500" 
            deadline="Oct 10" 
            type="featured"
          />
          <ScholarshipCard 
            title="Global Business Scholarship" 
            organization="Business Chamber BD" 
            amount="$4,000" 
            deadline="Nov 20" 
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
  },
  pageTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.h1,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.lg,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    height: 48,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: 40,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textPrimary,
    ...theme.shadows.soft,
  },
  searchIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  filterBtn: {
    width: 48,
    height: 48,
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.soft,
  },
  categories: {
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  categoryPill: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  categoryPillActive: {
    backgroundColor: theme.colors.textPrimary,
    borderColor: theme.colors.textPrimary,
  },
  categoryText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
  },
  categoryTextActive: {
    color: theme.colors.surface,
  },
  gridContainer: {
    padding: theme.spacing.xl,
    paddingTop: 0,
    paddingBottom: 40,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.lg,
  },
});
