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

  useEffect(() => {
    const loadDetails = async () => {
      try {
        const res = await apiService.getScholarshipDetail(id);
        if (res.ok) {
          setDetails(res.data);
        } else {
          // Fallback data
          setDetails({
            id: id,
            title: 'Japanese Government (MEXT) Research Scholarship 2025',
            provider: 'Ministry of Education, Japan',
            country: 'Japan',
            level: 'Masters / PhD',
            amount: 'Fully Funded (143,000 JPY/mo)',
            deadline: '2025-05-15',
            category: 'Government',
            min_cgpa: '3.80',
            field: 'All Fields',
            official_link: 'https://www.mext.go.jp/en/',
            image_url: 'https://images.unsplash.com/photo-1526232759583-d6f44a7a4710?w=800',
            description: 'The Ministry of Education, Culture, Sports, Science and Technology (MEXT) of Japan offers scholarships to international students who wish to study in graduate courses at Japanese universities.',
            eligibility: 'Must be a Bangladeshi citizen, under 35 years of age, and have completed 16 years of education.',
            benefits: 'Tuition fees, monthly stipend, and round-trip airfare included.',
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
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

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.titleAccent} />
                        <Text style={styles.sectionTitle}>Key Benefits</Text>
                    </View>
                    <View style={styles.benefitsCard}>
                        <View style={styles.benefitsIconBox}>
                            <MaterialIcons name="stars" size={24} color={theme.colors.primary} />
                        </View>
                        <Text style={styles.benefitsText}>{details.benefits}</Text>
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
    height: height * 0.4,
    justifyContent: 'flex-end',
    padding: 20,
    position: 'relative',
  },
  heroBg: {
    ...StyleSheet.absoluteFillObject,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    overflow: 'hidden',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroContent: {
    marginBottom: 16,
  },
  typeBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 0,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  typeText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: theme.typography.fontFamily.bold,
    letterSpacing: 1,
  },
  mainTitle: {
    fontSize: 26,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.heading,
    lineHeight: 34,
  },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  providerText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.medium,
  },
  contentCard: {
    marginTop: -40,
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    padding: 20,
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  infoGrid: {
    marginBottom: 24,
    backgroundColor: theme.colors.background,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.divider,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    width: '48%',
    alignItems: 'center',
  },
  infoIconBox: {
    width: 32,
    height: 32,
    borderRadius: 0,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: theme.colors.divider,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 10,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 13,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.heading,
    marginTop: 1,
  },
  detailsContainer: {
    gap: 20,
  },
  section: {
    marginBottom: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleAccent: {
    width: 4,
    height: 18,
    backgroundColor: theme.colors.primary,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.heading,
  },
  descriptionText: {
    fontSize: 15,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.textPrimary,
    lineHeight: 24,
  },
  bulletItem: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    backgroundColor: theme.colors.primaryLight,
    padding: 16,
    borderRadius: 0,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  bulletText: {
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.textPrimary,
    flex: 1,
    lineHeight: 22,
  },
  benefitsCard: {
    backgroundColor: theme.colors.mintCard,
    padding: 16,
    borderRadius: 0,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.divider,
  },
  benefitsIconBox: {
    width: 44,
    height: 44,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.divider,
  },
  benefitsText: {
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.semiBold,
    color: theme.colors.primaryDark,
    flex: 1,
    lineHeight: 22,
  },
  alertBox: {
    flexDirection: 'row',
    backgroundColor: theme.colors.secondaryBackground,
    padding: 16,
    borderRadius: 0,
    alignItems: 'center',
    gap: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: theme.colors.divider,
  },
  alertText: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  footerLeft: {
    flex: 1,
  },
  footerLabel: {
    fontSize: 11,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  footerDate: {
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.error,
  },
  applyBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    ...theme.shadows.teal,
  },
  applyBtnText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.bold,
  },
});
