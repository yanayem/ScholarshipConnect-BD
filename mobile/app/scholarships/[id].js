/**
 * SCHOLARSHIP DETAILS: Independent Professional View
 * - Decoupled from global theme for specific educational styling.
 * - Simple, modern, and academic layout.
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, Share, ActivityIndicator,
  Dimensions, ImageBackground, Linking, Alert, Modal, Pressable
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { apiService } from '../../services/api';
import { useToast } from '../../components/Toast';
import { Loader } from '../../components/Loader';

const { width, height } = Dimensions.get('window');

// —————————————————————————————————————————————————————————————————————————————
// LOCAL DESIGN TOKENS (Professional Educational Palette)
// —————————————————————————————————————————————————————————————————————————————
const UI = {
  colors: {
    primary:    '#2A9D8F',      // Branded Teal
    primaryDark:'#1F6F66',      // Darker Teal for headers
    primarySub: '#E6F7F5',      // Sub-tint for cards
    secondary:  '#E76F51',      // Contrast accent (Terracotta/Orange)
    background: '#F8F9FA',      // Neutral grey-white bg
    surface:    '#FFFFFF',      // White cards
    textMain:   '#1A202C',      // Deep charcoal
    textMuted:  '#718096',      // Slate grey
    border:     '#E2E8F0',      // Soft divider color
    error:      '#E53E3E',      // Alert/Deadline red
    success:    '#38A169',      // Verified green
    shadow:     'rgba(0,0,0,0.08)',
  },
  fonts: {
    bold:     'Inter-Bold',
    semiBold: 'Inter-SemiBold',
    medium:   'Inter-Medium',
    regular:  'Inter-Regular',
  }
};

const InfoItem = ({ icon, label, value, isLink = false, onPress }) => (
    <View style={styles.infoItem}>
        <View style={styles.infoIconBox}>
            <MaterialIcons name={icon} size={20} color={UI.colors.primary} />
        </View>
        <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>{label}</Text>
            {isLink ? (
                <TouchableOpacity onPress={onPress}>
                    <Text style={[styles.infoValue, { color: UI.colors.primary, textDecorationLine: 'underline' }]}>{value}</Text>
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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const { showToast, ToastComponent } = useToast();

  const loadData = async () => {
    if (!id || id === 'undefined') return;
    try {
      const [res, staffStatus, profileRes] = await Promise.all([
        apiService.getScholarshipDetail(id),
        apiService.isStaff(),
        apiService.getProfile()
      ]);

      if (res.ok && res.data) {
        setDetails(res.data);
        setIsAdmin(staffStatus);
        if (profileRes.ok) setUser(profileRes.data);
      } else {
        setError(res.data?.error || 'Scholarship details could not be retrieved.');
      }
    } catch (err) {
      setError('Network error. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const getDirectImageUrl = (url) => {
    if (!url || typeof url !== 'string') return null;
    const trimmedUrl = url.trim();
    if (!trimmedUrl.startsWith('http')) return null;

    // Convert Google Drive sharing link to direct link
    if (trimmedUrl.includes('drive.google.com')) {
      const match = trimmedUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1]) {
        return `https://drive.google.com/uc?export=view&id=${match[1]}`;
      }
    }
    return trimmedUrl;
  };

  const toggleSave = async () => {
    if (!details) return;
    try {
      if (details.is_saved) {
        const res = await apiService.unsaveScholarship(details.save_id);
        if (res.ok) {
          setDetails({ ...details, is_saved: false, save_id: null });
          showToast('Removed from bookmarks', 'info');
        }
      } else {
        const res = await apiService.saveScholarship(details.id);
        if (res.ok) {
          setDetails({ ...details, is_saved: true, save_id: res.data.id });
          showToast('Saved to bookmarks!', 'success');
        } else {
          showToast('Please login to save scholarships', 'error');
        }
      }
    } catch (e) {
      showToast('Error updating bookmarks', 'error');
    }
  };

  const onShare = async () => {
    try {
      await Share.share({
        message: `Check out this scholarship: ${details.title}\nLevel: ${details.level}\nDeadline: ${details.deadline}`,
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  if (loading) {
    return <Loader message="Loading Scholarship..." />;
  }

  if (error || !details) {
    return (
      <View style={[styles.loader, { backgroundColor: UI.colors.background, padding: 20 }]}>
        <MaterialIcons name="error-outline" size={60} color={UI.colors.error} />
        <Text style={{ color: UI.colors.textMain, fontSize: 18, fontFamily: UI.fonts.bold, marginTop: 20, textAlign: 'center' }}>
            Oops! Something went wrong
        </Text>
        <Text style={{ color: UI.colors.textMuted, fontSize: 14, fontFamily: UI.fonts.medium, marginTop: 10, textAlign: 'center' }}>
            {error || 'Detail not found'}
        </Text>
        <TouchableOpacity style={styles.errorBackBtn} onPress={() => router.back()}>
          <Text style={styles.errorBackBtnText}>Return Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Top Branded Section */}
        <View style={styles.topSection}>
            {/* Simplified Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color={UI.colors.textMain} />
                </TouchableOpacity>

                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.actionBtn} onPress={onShare}>
                        <Ionicons name="share-social-outline" size={22} color={UI.colors.textMain} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={toggleSave}
                    >
                        <Ionicons
                            name={details.is_saved ? "bookmark" : "bookmark-outline"}
                            size={22}
                            color={details.is_saved ? UI.colors.primary : UI.colors.textMain}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Hero Image & Branding */}
            <View style={styles.heroWrapper}>
                <ImageBackground
                    source={
                        details.image && typeof details.image === 'string' && details.image.startsWith('http')
                            ? { uri: details.image }
                            : (getDirectImageUrl(details.image_url) ? { uri: getDirectImageUrl(details.image_url) } : null)
                    }
                    style={styles.mainImage}
                    imageStyle={{ backgroundColor: UI.colors.primary }}
                    resizeMode="cover"
                >
                    <View style={styles.imageOverlay} />
                    <View style={styles.badgeRow}>
                        <View style={styles.tag}>
                            <Text style={styles.tagText}>{details.category || 'GLOBAL'}</Text>
                        </View>
                        {details.status === 'active' && (
                            <View style={[styles.tag, { backgroundColor: UI.colors.success }]}>
                                <Text style={styles.tagText}>VERIFIED</Text>
                            </View>
                        )}
                    </View>
                </ImageBackground>
            </View>
        </View>

        {/* Title Section */}
        <View style={styles.titleSection}>
            <Text style={styles.scholarshipTitle}>{details.title}</Text>
            <View style={styles.providerBox}>
                <Ionicons name="business" size={16} color={UI.colors.primary} />
                <Text style={styles.providerName}>{details.provider || 'Academic Institution'}</Text>
            </View>
        </View>

        {/* Professional Stats Grid */}
        <View style={styles.gridCard}>
            <View style={styles.gridRow}>
                <InfoItem icon="language" label="Country" value={details.country} />
                <InfoItem icon="layers" label="Degree" value={details.level} />
            </View>
            <View style={styles.gridRow}>
                <InfoItem icon="account-balance" label="Funding" value={details.amount} />
                <InfoItem icon="event-note" label="Deadline" value={details.deadline} />
            </View>
            <View style={styles.gridRow}>
                <InfoItem icon="school" label="Field" value={details.field || 'General'} />
                <InfoItem
                    icon="launch"
                    label="Application"
                    value="Official Site"
                    isLink
                    onPress={() => details.official_link && Linking.openURL(details.official_link)}
                />
            </View>
        </View>

        {/* Content Body */}
        <View style={styles.body}>
            {/* Rejection Note Section (Visible only for submitted by user) */}
            {details.status === 'rejected' && details.admin_note && (
                <View style={styles.rejectionSection}>
                    <View style={styles.rejectionHeader}>
                        <MaterialIcons name="report-problem" size={24} color={UI.colors.error} />
                        <Text style={[styles.bodyHeading, { color: UI.colors.error, marginBottom: 0 }]}>Rejection Feedback</Text>
                    </View>
                    <View style={styles.rejectionBox}>
                        <Text style={styles.rejectionText}>{details.admin_note}</Text>
                        <Text style={styles.rejectionSubtext}>Please address the feedback above and submit a new request if applicable.</Text>
                    </View>
                </View>
            )}

            {/* AI Tools Bar */}
            <View style={styles.aiBar}>
                <TouchableOpacity
                    style={styles.aiToolBtn}
                    onPress={() => router.push({
                        pathname: '/ai-tools/sop-helper',
                        params: { scholarshipId: id, scholarshipTitle: details.title }
                    })}
                >
                    <MaterialIcons name="auto-fix-high" size={20} color={UI.colors.primary} />
                    <View>
                        <Text style={styles.aiToolText}>AI SOP Helper</Text>
                        {!user?.is_pro && (
                            <Pressable onPress={() => router.push('/upgrade-pro')}>
                                <View style={styles.proBadgeSmall}><Text style={styles.proBadgeText}>PRO: UNLOCK</Text></View>
                            </Pressable>
                        )}
                    </View>
                </TouchableOpacity>
                <View style={styles.aiDivider} />
                <TouchableOpacity
                    style={styles.aiToolBtn}
                    onPress={async () => {
                        if (!user?.is_pro) {
                            Alert.alert('Pro Feature', 'Deep Eligibility Analysis is a Pro feature. Please upgrade to unlock unlimited AI insights.', [
                                { text: 'Cancel', style: 'cancel' },
                                { text: 'Upgrade to Pro', onPress: () => router.push('/upgrade-pro') }
                            ]);
                            return;
                        }
                        showToast('AI Analyzing Eligibility...', 'info');
                        const res = await apiService.aiCheckEligibility(id);
                        if (res.ok) {
                            Alert.alert('AI Eligibility Analysis', res.data.analysis);
                        } else {
                            showToast(res.data?.error || 'AI check failed', 'error');
                        }
                    }}
                >
                    <MaterialIcons name="fact-check" size={20} color={UI.colors.primary} />
                    <View>
                        <Text style={styles.aiToolText}>Eligibility Check</Text>
                        {!user?.is_pro && (
                            <View style={styles.proBadgeSmall}><Text style={styles.proBadgeText}>PRO: UNLOCK</Text></View>
                        )}
                    </View>
                </TouchableOpacity>
            </View>

            <View style={styles.descriptionSection}>
                <Text style={styles.bodyHeading}>About this Program</Text>
                <Text style={styles.descriptionText}>{details.description}</Text>
            </View>

            <View style={styles.eligibilitySection}>
                <View style={styles.eligibilityHeader}>
                    <Ionicons name="list-circle" size={24} color={UI.colors.primary} />
                    <Text style={styles.bodyHeading}>Requirements</Text>
                </View>
                <View style={styles.eligibilityBox}>
                    <Text style={styles.eligibilityText}>{details.eligibility}</Text>
                </View>
            </View>

            <View style={styles.alertNote}>
                <Ionicons name="information-circle-outline" size={20} color={UI.colors.textMuted} />
                <Text style={styles.alertNoteText}>
                    Note: We give you the best info. Please check the official website to be sure.
                </Text>
            </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Modern Fixed Action Bar */}
      <View style={styles.footer}>
        <View style={styles.footerContent}>
            <View style={styles.deadlineMeta}>
                <Text style={styles.deadlineLabel}>Last Date</Text>
                <Text style={styles.deadlineValue}>{details.deadline}</Text>
            </View>
            <TouchableOpacity
                style={styles.applyButton}
                activeOpacity={0.9}
                onPress={() => setShowApplyModal(true)}
            >
                <Text style={styles.applyButtonText}>Apply Now</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFF" />
            </TouchableOpacity>
        </View>
      </View>
      {ToastComponent}

      {/* Hybrid Apply Modal */}
      <Modal visible={showApplyModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Application Method</Text>
              <TouchableOpacity onPress={() => setShowApplyModal(false)}>
                <Ionicons name="close" size={24} color={UI.colors.textMuted} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.hybridOptionCard}
              onPress={() => {
                setShowApplyModal(false);
                router.push(`/apply/${id}`);
              }}
            >
              <View style={[styles.hybridIconBox, { backgroundColor: UI.colors.primarySub }]}>
                <MaterialIcons name="person" size={28} color={UI.colors.primary} />
              </View>
              <View style={styles.hybridOptionText}>
                <Text style={styles.hybridOptionTitle}>Do It Yourself (Free)</Text>
                <Text style={styles.hybridOptionDesc}>Use our AI tools to prepare your SOP and CV, then apply on the official university portal.</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={UI.colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.hybridOptionCard, { borderColor: '#8E44AD', borderWidth: 1.5, backgroundColor: 'rgba(142, 68, 173, 0.05)' }]}
              onPress={() => {
                setShowApplyModal(false);
                router.push(`/apply/agency/${id}?title=${encodeURIComponent(details.title)}`);
              }}
            >
              <View style={[styles.hybridIconBox, { backgroundColor: '#8E44AD' }]}>
                <MaterialIcons name="business-center" size={24} color="#FFF" />
              </View>
              <View style={styles.hybridOptionText}>
                <Text style={styles.hybridOptionTitle}>Let Experts Apply For You</Text>
                <Text style={[styles.hybridOptionDesc, { color: '#8E44AD' }]}>Premium Service: Our consultants will handle formatting and official submission for a service fee.</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#8E44AD" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: UI.colors.background,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorBackBtn: {
    marginTop: 20,
    backgroundColor: UI.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  errorBackBtnText: {
    color: '#FFF',
    fontFamily: UI.fonts.bold,
  },
  scroll: {
    paddingBottom: 20,
  },
  topSection: {
    backgroundColor: UI.colors.primary,
    paddingBottom: 0,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 15,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: UI.colors.border,
  },
  heroWrapper: {
    height: 300,
  },
  mainImage: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  badgeRow: {
    flexDirection: 'row',
    padding: 15,
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  tagText: {
    color: '#FFF',
    fontSize: 10,
    fontFamily: UI.fonts.bold,
    letterSpacing: 1,
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  scholarshipTitle: {
    fontSize: 24,
    fontFamily: UI.fonts.bold,
    color: UI.colors.textMain,
    lineHeight: 32,
  },
  providerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  providerName: {
    fontSize: 15,
    fontFamily: UI.fonts.medium,
    color: UI.colors.primary,
  },
  gridCard: {
    marginHorizontal: 20,
    backgroundColor: UI.colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: UI.colors.border,
    marginTop: 10,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  infoItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: UI.colors.primarySub,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 10,
    fontFamily: UI.fonts.medium,
    color: UI.colors.textMuted,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 14,
    fontFamily: UI.fonts.bold,
    color: UI.colors.textMain,
    marginTop: 2,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  descriptionSection: {
    marginBottom: 30,
  },
  rejectionSection: {
    marginBottom: 30,
    backgroundColor: '#FFF5F5',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FED7D7',
  },
  rejectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  rejectionBox: {
    marginTop: 4,
  },
  rejectionText: {
    fontSize: 15,
    fontFamily: UI.fonts.bold,
    color: UI.colors.error,
    lineHeight: 22,
  },
  rejectionSubtext: {
    fontSize: 12,
    fontFamily: UI.fonts.medium,
    color: UI.colors.textMuted,
    marginTop: 8,
    fontStyle: 'italic',
  },
  aiBar: {
    flexDirection: 'row',
    backgroundColor: UI.colors.surface,
    borderRadius: 15,
    padding: 12,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: UI.colors.primarySub,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  aiToolBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiToolText: {
    fontSize: 13,
    fontFamily: UI.fonts.bold,
    color: UI.colors.textMain,
  },
  proBadgeSmall: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  proBadgeText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#000',
  },
  aiDivider: {
    width: 1,
    height: 20,
    backgroundColor: UI.colors.border,
  },
  bodyHeading: {
    fontSize: 18,
    fontFamily: UI.fonts.bold,
    color: UI.colors.textMain,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 15,
    fontFamily: UI.fonts.regular,
    color: UI.colors.textMain,
    lineHeight: 24,
  },
  eligibilitySection: {
    marginBottom: 30,
  },
  eligibilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  eligibilityBox: {
    backgroundColor: UI.colors.surface,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: UI.colors.primary,
    borderWidth: 1,
    borderColor: UI.colors.border,
  },
  eligibilityText: {
    fontSize: 14,
    fontFamily: UI.fonts.medium,
    color: UI.colors.textMain,
    lineHeight: 22,
  },
  alertNote: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: 'rgba(113, 128, 150, 0.05)',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  alertNoteText: {
    flex: 1,
    fontSize: 12,
    fontFamily: UI.fonts.regular,
    color: UI.colors.textMuted,
    lineHeight: 18,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: UI.colors.surface,
    borderTopWidth: 1,
    borderTopColor: UI.colors.border,
    paddingTop: 16,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deadlineMeta: {
    flex: 1,
  },
  deadlineLabel: {
    fontSize: 11,
    fontFamily: UI.fonts.medium,
    color: UI.colors.textMuted,
    textTransform: 'uppercase',
  },
  deadlineValue: {
    fontSize: 18,
    fontFamily: UI.fonts.bold,
    color: UI.colors.error,
    marginTop: 2,
  },
  applyButton: {
    backgroundColor: UI.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  applyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: UI.fonts.bold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: UI.colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: UI.fonts.bold,
    color: UI.colors.textMain,
  },
  hybridOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: UI.colors.background,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: UI.colors.border,
  },
  hybridIconBox: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  hybridOptionText: {
    flex: 1,
  },
  hybridOptionTitle: {
    fontSize: 16,
    fontFamily: UI.fonts.bold,
    color: UI.colors.textMain,
    marginBottom: 4,
  },
  hybridOptionDesc: {
    fontSize: 13,
    fontFamily: UI.fonts.regular,
    color: UI.colors.textMuted,
    lineHeight: 18,
  },
});
