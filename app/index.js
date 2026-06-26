import { View, Text, StyleSheet, Pressable, ScrollView, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function LandingPage() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, isDesktop && styles.desktopPadding]}>
          <View style={styles.logoRow}>
            <View style={styles.logoIcon}>
              <MaterialIcons name="school" size={24} color="#fff" />
            </View>
            <Text style={styles.logoText}>ScholarshipConnect</Text>
          </View>
          <Pressable 
            style={styles.loginBtn}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.loginBtnText}>Sign In</Text>
          </Pressable>
        </View>

        {/* Hero Section */}
        <View style={[styles.heroSection, isDesktop && styles.desktopPadding]}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>#1 Educational Platform in BD</Text>
          </View>
          <Text style={styles.heroTitle}>Unlock Your Future with the Right Scholarship</Text>
          <Text style={styles.heroSubtitle}>
            Connecting students in Bangladesh with prestigious international and local opportunities through data-driven matching.
          </Text>

          <View style={[styles.ctaWrapper, !isDesktop && styles.ctaWrapperMobile]}>
            <Pressable
              style={[styles.ctaButton, !isDesktop && styles.ctaFullWidth]}
              onPress={() => router.push('/(tabs)')}
            >
              <Text style={styles.ctaText}>Explore Scholarships</Text>
              <MaterialIcons name="arrow-forward" size={20} color={theme.colors.textPrimary} />
            </Pressable>
            <Pressable
              style={[styles.ctaButton, styles.ctaSecondary, !isDesktop && styles.ctaFullWidth]}
              onPress={() => router.push('/(tabs)/check')}
            >
              <Text style={styles.ctaText}>Check Eligibility</Text>
            </Pressable>
          </View>
        </View>

        {/* Stats Section */}
        <View style={[styles.statsSection, isDesktop && styles.desktopPadding]}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>500+</Text>
            <Text style={styles.statLabel}>Scholarships</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>50+</Text>
            <Text style={styles.statLabel}>Countries</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>10k+</Text>
            <Text style={styles.statLabel}>Students</Text>
          </View>
        </View>

        {/* Features / How It Works */}
        <Text style={[styles.sectionTitle, isDesktop && styles.desktopPadding]}>How it helps you</Text>
        <View style={[styles.featuresSection, isDesktop && styles.desktopPadding]}>
          <View style={styles.featureCard}>
            <View style={[styles.iconWrapper, { backgroundColor: theme.colors.primaryAccent }]}>
              <Ionicons name="search" size={24} color="#6B46C1" />
            </View>
            <Text style={styles.featureTitle}>Smart Discovery</Text>
            <Text style={styles.featureDesc}>Find scholarships tailored to your academic profile and CGPA.</Text>
          </View>
          <View style={styles.featureCard}>
            <View style={[styles.iconWrapper, { backgroundColor: theme.colors.secondaryAccent }]}>
              <Ionicons name="document-text" size={24} color="#C05621" />
            </View>
            <Text style={styles.featureTitle}>Document Vault</Text>
            <Text style={styles.featureDesc}>Securely store and organize your SOPs, LORs, and Transcripts.</Text>
          </View>
          <View style={styles.featureCard}>
            <View style={[styles.iconWrapper, { backgroundColor: theme.colors.communityMint }]}>
              <Ionicons name="notifications" size={24} color="#2C7A7B" />
            </View>
            <Text style={styles.featureTitle}>Deadline Tracker</Text>
            <Text style={styles.featureDesc}>Never miss a deadline with automated alerts and reminders.</Text>
          </View>
        </View>

        {/* Bottom CTA */}
        <View style={[styles.footerBanner, isDesktop && styles.desktopPadding]}>
          <Text style={styles.footerBannerTitle}>Ready to start your journey?</Text>
          <Pressable
            style={styles.startBtn}
            onPress={() => router.push('/(auth)/register')}
          >
            <Text style={styles.startBtnText}>Create Free Account</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  desktopPadding: {
    paddingHorizontal: '15%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    backgroundColor: '#C97352',
    padding: 6,
    borderRadius: 8,
  },
  logoText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.textPrimary,
  },
  loginBtn: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  loginBtnText: {
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.sm,
  },
  heroSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xxl,
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#FFE7DF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  badgeText: {
    color: '#C97352',
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 12,
  },
  heroTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 40,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    lineHeight: 48,
  },
  heroSubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.sizes.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    maxWidth: 600,
    lineHeight: 24,
  },
  ctaWrapper: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    justifyContent: 'center',
  },
  ctaWrapperMobile: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.ctaPrimary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
    ...theme.shadows.soft,
    minWidth: 180,
  },
  ctaFullWidth: {
    width: '100%',
  },
  ctaSecondary: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  ctaText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.sizes.base,
    color: theme.colors.textPrimary,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    marginTop: 20,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statNum: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 24,
    color: '#C97352',
  },
  statLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: theme.colors.border,
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 20,
    color: theme.colors.textPrimary,
    marginTop: 40,
    marginBottom: 20,
    textAlign: 'center',
  },
  featuresSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  featureCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    width: '100%',
    maxWidth: 320,
    ...theme.shadows.soft,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  featureTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.base,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  featureDesc: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  footerBanner: {
    margin: theme.spacing.xl,
    padding: theme.spacing.xl,
    backgroundColor: '#C97352',
    borderRadius: theme.borderRadius.xl,
    alignItems: 'center',
    marginTop: 60,
  },
  footerBannerTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 22,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  startBtn: {
    backgroundColor: theme.colors.ctaPrimary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.full,
    ...theme.shadows.medium,
  },
  startBtnText: {
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.textPrimary,
    fontSize: 16,
  }
});
