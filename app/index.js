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
            <Text style={styles.badgeText}>Verified Education Platform</Text>
          </View>
          <Text style={styles.heroTitle}>Unlock Your Future with the Right Scholarship</Text>
          <Text style={styles.heroSubtitle}>
            Connecting students in Bangladesh with prestigious international opportunities through modern data-driven matching.
          </Text>

          <View style={[styles.ctaWrapper, !isDesktop && styles.ctaWrapperMobile]}>
            <Pressable
              style={[styles.ctaButton, !isDesktop && styles.ctaFullWidth]}
              onPress={() => router.push('/(tabs)')}
            >
              <Text style={styles.ctaText}>Explore Opportunities</Text>
              <MaterialIcons name="arrow-forward" size={18} color="#fff" />
            </Pressable>
            <Pressable
              style={[styles.ctaButton, styles.ctaSecondary, !isDesktop && styles.ctaFullWidth]}
              onPress={() => router.push('/(tabs)/check')}
            >
              <Text style={styles.ctaSecondaryText}>Check Eligibility</Text>
            </Pressable>
          </View>
        </View>

        {/* Stats Section */}
        <View style={[styles.statsSection, isDesktop && styles.desktopPadding]}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>500+</Text>
            <Text style={styles.statLabel}>Active Programs</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>50+</Text>
            <Text style={styles.statLabel}>Partner Countries</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>10k+</Text>
            <Text style={styles.statLabel}>Happy Scholars</Text>
          </View>
        </View>

        {/* Features */}
        <Text style={[styles.sectionTitle, isDesktop && styles.desktopPadding]}>Why choose us?</Text>
        <View style={[styles.featuresSection, isDesktop && styles.desktopPadding]}>
          <View style={[styles.featureCard, { backgroundColor: theme.colors.tealCard }]}>
            <View style={styles.iconWrapper}>
              <Ionicons name="search-outline" size={24} color={theme.colors.primary} />
            </View>
            <Text style={styles.featureTitle}>Smart Discovery</Text>
            <Text style={styles.featureDesc}>Find programs tailored to your academic profile and CGPA.</Text>
          </View>
          <View style={[styles.featureCard, { backgroundColor: theme.colors.lavenderCard }]}>
            <View style={styles.iconWrapper}>
              <Ionicons name="document-text-outline" size={24} color="#8E7DF5" />
            </View>
            <Text style={styles.featureTitle}>Secure Vault</Text>
            <Text style={styles.featureDesc}>Safely store and organize your SOPs, LORs, and Transcripts.</Text>
          </View>
          <View style={[styles.featureCard, { backgroundColor: theme.colors.peachCard }]}>
            <View style={styles.iconWrapper}>
              <Ionicons name="notifications-outline" size={24} color="#F4B942" />
            </View>
            <Text style={styles.featureTitle}>Real-time Tracking</Text>
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
    paddingBottom: 60,
  },
  desktopPadding: {
    paddingHorizontal: '15%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoIcon: {
    backgroundColor: theme.colors.primary,
    padding: 8,
    borderRadius: 12,
    ...theme.shadows.soft,
  },
  logoText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 20,
    color: theme.colors.heading,
  },
  loginBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
  },
  loginBtnText: {
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.textPrimary,
    fontSize: 14,
  },
  heroSection: {
    paddingHorizontal: 24,
    paddingVertical: 40,
    alignItems: 'center',
  },
  badge: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 24,
  },
  badgeText: {
    color: theme.colors.primary,
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 12,
  },
  heroTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 36,
    color: theme.colors.heading,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 46,
  },
  heroSubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    maxWidth: 600,
    lineHeight: 24,
  },
  ctaWrapper: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
    justifyContent: 'center',
  },
  ctaWrapperMobile: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
    ...theme.shadows.soft,
    minWidth: 200,
  },
  ctaFullWidth: {
    width: '90%',
  },
  ctaSecondary: {
    backgroundColor: theme.colors.surface,
  },
  ctaText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 15,
    color: '#fff',
  },
  ctaSecondaryText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 15,
    color: theme.colors.primary,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
    marginTop: 20,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statNum: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 24,
    color: theme.colors.primary,
  },
  statLabel: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 6,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: theme.colors.divider,
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 20,
    color: theme.colors.heading,
    marginTop: 48,
    marginBottom: 24,
    textAlign: 'center',
  },
  featuresSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
    paddingHorizontal: 24,
  },
  featureCard: {
    padding: 24,
    borderRadius: 24,
    width: '100%',
    maxWidth: 340,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    backgroundColor: '#fff',
    ...theme.shadows.soft,
  },
  featureTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 18,
    color: theme.colors.heading,
    marginBottom: 8,
  },
  featureDesc: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  footerBanner: {
    margin: 24,
    padding: 32,
    backgroundColor: theme.colors.heading,
    borderRadius: 32,
    alignItems: 'center',
    marginTop: 80,
  },
  footerBannerTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 24,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 24,
  },
  startBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 16,
    ...theme.shadows.medium,
  },
  startBtnText: {
    fontFamily: theme.typography.fontFamily.bold,
    color: '#fff',
    fontSize: 16,
  }
});
