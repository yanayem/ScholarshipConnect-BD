import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { theme } from '../../theme';
import ScholarshipCard from '../../components/cards/ScholarshipCard';
import MentorCard from '../../components/cards/MentorCard';
import { Ionicons } from '@expo/vector-icons';

export default function DashboardMain() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Welcome Banner */}
      <View style={styles.welcomeBanner}>
        <View>
          <Text style={styles.welcomeTitle}>Welcome back, Student!</Text>
          <Text style={styles.welcomeSubtitle}>You have 2 applications pending and 3 new matches.</Text>
        </View>
        <Pressable style={styles.primaryBtn}>
          <Text style={styles.primaryBtnText}>View Matches</Text>
        </Pressable>
      </View>

      {/* Progress Cards */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { borderTopColor: theme.colors.ctaPrimary }]}>
          <Text style={styles.statNumber}>12</Text>
          <Text style={styles.statLabel}>Saved Scholarships</Text>
        </View>
        <View style={[styles.statCard, { borderTopColor: theme.colors.primaryAccent }]}>
          <Text style={styles.statNumber}>3</Text>
          <Text style={styles.statLabel}>Applications Sent</Text>
        </View>
        <View style={[styles.statCard, { borderTopColor: theme.colors.communityMint }]}>
          <Text style={styles.statNumber}>1</Text>
          <Text style={styles.statLabel}>Upcoming Deadline</Text>
        </View>
      </View>

      {/* Recommended Scholarships */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recommended for You</Text>
          <Pressable><Text style={styles.seeAllText}>See All</Text></Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
          <ScholarshipCard 
            title="Global Excellence Tech Scholarship" 
            organization="Tech Foundation BD" 
            amount="$5,000" 
            deadline="Oct 15" 
            type="featured" 
          />
          <ScholarshipCard 
            title="Women in STEM Initiative" 
            organization="Global EduCorp" 
            amount="$3,000" 
            deadline="Nov 1" 
            type="standard" 
          />
          <ScholarshipCard 
            title="Future Leaders Grant" 
            organization="Leadership Institute" 
            amount="$1,500" 
            deadline="Sep 30" 
            type="deadline" 
          />
        </ScrollView>
      </View>

      {/* Mentor Suggestions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Suggested Mentors</Text>
          <Pressable><Text style={styles.seeAllText}>Find Mentors</Text></Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
          <MentorCard name="Aisha Rahman" role="Software Engineer" company="Google" matchPercentage={95} />
          <MentorCard name="Rahim Ali" role="Data Scientist" company="Microsoft" matchPercentage={88} />
          <MentorCard name="Sarah Islam" role="Product Manager" company="Meta" matchPercentage={82} />
        </ScrollView>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.xl,
    paddingBottom: 60,
  },
  welcomeBanner: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    ...theme.shadows.medium,
  },
  welcomeTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.xl,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  welcomeSubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
  },
  primaryBtn: {
    backgroundColor: theme.colors.ctaPrimary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
  },
  primaryBtnText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textPrimary,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderTopWidth: 4,
    ...theme.shadows.soft,
  },
  statNumber: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.h1,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.textPrimary,
  },
  seeAllText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
  },
  horizontalScroll: {
    paddingBottom: theme.spacing.md,
  },
});
