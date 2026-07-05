/**
 * SCHOLARSHIP DETAILS: Premium redesigned view for scholarship information.
 * - Featuring immersive header, modern info grid, and academic timeline.
 * - Connected to: apiService (getScholarshipDetail), /apply/[id], theme.js.
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, Share, ActivityIndicator,
  Dimensions, ImageBackground, Linking
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { apiService } from '../../services/api';

const { width, height } = Dimensions.get('window');

const InfoItem = ({ icon, label, value, isLink = false, onPress }) => (
    <View style={styles.infoItem}>
        <View style={styles.infoIconBox}>
            <MaterialIcons name={icon} size={18} color={theme.colors.primary} />
        </View>
        <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>{label}</Text>
            {isLink ? (
                <TouchableOpacity onPress={onPress}>
                    <Text style={[styles.infoValue, { color: theme.colors.primary }]}>{value} 🔗</Text>
                </TouchableOpacity>
            ) : (
                <Text style={styles.infoValue} numberOfLines={1}>{value}</Text>
            )}
        </View>
    </View>
);

export default function ScholarshipDetails() {
  const { id } = useLocalSearchParams();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [res, staffStatus] = await Promise.all([
          apiService.getScholarshipDetail(id),
          apiService.isStaff()
        ]);

        if (res.ok && res.data) {
          setDetails(res.data);
          setIsAdmin(staffStatus);
        } else {
          setDetails(null);
        }
      } catch (error) {
        console.error(error);
        setDetails(null);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const onShare = async () => {
    if (!details) return;
    try {
      await Share.share({
        message: `Apply for ${details.title} via ScholarshipConnectBD! Deadline: ${details.deadline}`,
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!details) {
    return (
      <View style={styles.loader}>
        <Text style={{ color: theme.colors.textSecondary, fontSize: 16 }}>Scholarship not found.</Text>
        <TouchableOpacity style={{ marginTop: 20 }} onPress={() => router.back()}>
          <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" transparent backgroundColor="transparent" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header Section */}
        <View style={styles.heroSection}>
            <ImageBackground
                source={{ uri: details.image_url || 'https://images.unsplash.com/photo-1526232759583-d6f44a7a4710?w=800' }}
                style={styles.heroBg}
                resizeMode="cover"
            >
                <View style={styles.heroOverlay} />
            </ImageBackground>

            <View style={styles.headerActions}>
                <TouchableOpacity
                    style={styles.circleBtn}
                    onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')}
                >
                    <MaterialIcons name="arrow-back" size={22} color={theme.colors.primary} />
                </TouchableOpacity>

                <View style={{ flexDirection: 'row', gap: 12 }}>
                    <TouchableOpacity style={styles.circleBtn} onPress={onShare}>
                        <MaterialIcons name="share" size={20} color={theme.colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.circleBtn}
                        onPress={() => setIsBookmarked(!isBookmarked)}
                    >
                        <MaterialIcons
                            name={isBookmarked ? "bookmark" : "bookmark-border"}
                            size={20}
                            color={isBookmarked ? theme.colors.warning : theme.colors.primary}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.heroContent}>
                {isAdmin && (
                  <View style={[styles.statusBadge, { backgroundColor: details.status === 'active' ? theme.colors.success : theme.colors.warning }]}>
                    <Text style={styles.statusText}>ADMIN: {details.status.toUpperCase()}</Text>
                  </View>
                )}
                <View style={styles.typeBadge}>
                    <Text style={styles.typeText}>{details.category ? details.category.toUpperCase() : 'PREMIUM PROGRAM'}</Text>
                </View>
                <Text style={styles.mainTitle}>{details.title}</Text>
                <View style={styles.providerRow}>
                    <MaterialIcons name="verified" size={16} color={theme.colors.primary} />
                    <Text style={styles.providerText}>{details.provider || 'Verified Organization'}</Text>
                </View>
            </View>
        </View>

        {/* Content Card */}
        <View style={styles.contentCard}>

            {/* Professional Info Grid */}
            <View style={styles.infoGrid}>
                <View style={styles.infoRow}>
                    <InfoItem icon="public" label="Country" value={details.country} />
                    <InfoItem icon="school" label="Degree Level" value={details.level} />
                </View>
                <View style={styles.infoRow}>
                    <InfoItem icon="account-balance-wallet" label="Financing" value={details.amount} />
                    <InfoItem icon="timer" label="Deadline" value={details.deadline} />
                </View>
                <View style={styles.infoRow}>
                    <InfoItem icon="category" label="Category" value={details.category || 'General'} />
                    <InfoItem icon="grade" label="Min CGPA" value={details.min_cgpa || 'None'} />
                </View>
                <View style={styles.infoRow}>
                    <InfoItem icon="book" label="Field" value={details.field || 'All Fields'} />
                    <InfoItem
                        icon="language"
                        label="Website"
                        value="Official Portal"
                        isLink
                        onPress={() => details.official_link && Linking.openURL(details.official_link)}
                    />
                </View>
            </View>

            {/* Sections */}
            <View style={styles.detailsContainer}>
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.titleAccent} />
                        <Text style={styles.sectionTitle}>Scholarship Overview</Text>
                    </View>
                    <Text style={styles.descriptionText}>{details.description}</Text>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.titleAccent} />
                        <Text style={styles.sectionTitle}>Eligibility Criteria</Text>
                    </View>
                    <View style={styles.bulletItem}>
                        <MaterialIcons name="check-circle" size={20} color={theme.colors.primary} style={{ marginTop: 2 }} />
                        <Text style={styles.bulletText}>{details.eligibility}</Text>
                    </View>
                </View>

                {/* Important Alert */}
                <View style={styles.alertBox}>
                    <Ionicons name="information-circle" size={22} color={theme.colors.primary} />
                    <Text style={styles.alertText}>
                        Applications are typically submitted directly through the official provider portal. Check the link above for details.
                    </Text>
                </View>
            </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky Bottom Action */}
      <View style={[styles.footer, theme.shadows.premium]}>
        <View style={styles.footerLeft}>
            <Text style={styles.footerLabel}>Application Deadline</Text>
            <Text style={styles.footerDate}>{details.deadline}</Text>
        </View>
        <TouchableOpacity
            style={styles.applyBtn}
            onPress={() => router.push(`/apply/${id}`)}
        >
            <Text style={styles.applyBtnText}>Apply Now</Text>
            <MaterialIcons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { flexGrow: 1 },
  heroSection: {
    height: height * 0.45,
    justifyContent: 'flex-end',
    padding: 24,
    position: 'relative',
  },
  heroBg: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 0,
    overflow: 'hidden',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(21, 78, 71, 0.7)', // Darker teal overlay for maximum text contrast
  },
  headerActions: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 0,
    backgroundColor: 'rgba(255, 255, 255, 1)', // Solid white for buttons
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.soft,
  },
  heroContent: {
    marginBottom: 32,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginBottom: 10,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: theme.typography.fontFamily.bold,
  },
  typeBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 0,
    alignSelf: 'flex-start',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  typeText: {
    color: '#fff',
    fontSize: 12, // Increased size
    fontFamily: theme.typography.fontFamily.bold,
    letterSpacing: 1.2,
  },
  mainTitle: {
    fontSize: 32, // Larger and bolder
    fontFamily: theme.typography.fontFamily.bold,
    color: '#FFFFFF',
    lineHeight: 40,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: {width: 0, height: 2},
    textShadowRadius: 4
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  providerText: {
    color: '#FFFFFF', // Pure white for better visibility
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.semiBold,
  },
  contentCard: {
    marginTop: -30,
    backgroundColor: theme.colors.surface,
    borderRadius: 0,
    padding: 24,
    flex: 1,
    ...theme.shadows.premium,
  },
  infoGrid: {
    marginBottom: 32,
    backgroundColor: '#F0F9F8', // Slightly lighter tint for contrast with text
    padding: 20,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: theme.colors.primaryLight,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    width: '48%',
    alignItems: 'center',
  },
  infoIconBox: {
    width: 42,
    height: 42,
    borderRadius: 0,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12, // Increased size
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16, // Increased size
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.heading,
    marginTop: 2,
  },
  detailsContainer: {
    gap: 32,
  },
  section: {
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleAccent: {
    width: 6,
    height: 24,
    backgroundColor: theme.colors.primary,
    borderRadius: 0,
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 22, // Larger
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.heading,
  },
  descriptionText: {
    fontSize: 17, // Increased size for readability
    fontFamily: theme.typography.fontFamily.regular,
    color: '#222222', // Darker text
    lineHeight: 28,
  },
  bulletItem: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    backgroundColor: theme.colors.primaryLight,
    padding: 20,
    borderRadius: 0,
    borderLeftWidth: 6,
    borderLeftColor: theme.colors.primary,
  },
  bulletText: {
    fontSize: 16, // Increased size
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.textPrimary,
    flex: 1,
    lineHeight: 26,
  },
  alertBox: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    padding: 18,
    borderRadius: 0,
    alignItems: 'center',
    gap: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  alertText: {
    fontSize: 14, // Increased size
    fontFamily: theme.typography.fontFamily.medium,
    color: '#444444',
    flex: 1,
    lineHeight: 22,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 20,
    paddingBottom: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 2,
    borderTopColor: theme.colors.divider,
    ...theme.shadows.premium,
  },
  footerLeft: {
    flex: 1,
  },
  footerLabel: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  footerDate: {
    fontSize: 20, // Increased size
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.error,
  },
  applyBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 18,
    borderRadius: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  applyBtnText: {
    color: '#fff',
    fontSize: 18, // Increased size
    fontFamily: theme.typography.fontFamily.bold,
  },
});
