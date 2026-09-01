import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, StatusBar, Platform, Linking, Modal, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { MaterialIcons, FontAwesome5, Ionicons, Feather } from '@expo/vector-icons';
import { theme } from '../../theme';
import { apiService } from '../../services/api';
import { cacheService } from '../../services/cache';
import { Loader } from '../../components/Loader';

export default function MentorProfileScreen() {
  const { id } = useLocalSearchParams();
  const [mentor, setMentor] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchMentorDetails = async () => {
    // 1. Try Cache First
    try {
        const cachedMentor = await cacheService.get(`mentor_detail_${id}`);
        const cachedReviews = await cacheService.get(`mentor_reviews_${id}`);
        if (cachedMentor) {
            setMentor(cachedMentor);
            setLoading(false);
        }
        if (cachedReviews) setReviews(cachedReviews);
    } catch (e) {}

    try {
      const profileRes = await apiService.getProfile();
      if (profileRes.ok) {
          setCurrentUser(profileRes.data);
          await cacheService.set('user_profile', profileRes.data, 30);
      }

      // 2. Fetch via new Public Profile API (Flexible for both student/mentor)
      const res = await apiService.getPublicProfile(id);

      if (res.ok && res.data) {
          const userData = res.data;
          // Flatten user and profile data for consistency
          const combinedData = {
              ...userData.profile,
              user_id: userData.id,
              username: userData.username,
              email: userData.email,
              is_staff: userData.is_staff
          };

          setMentor(combinedData);
          await cacheService.set(`mentor_detail_${id}`, combinedData, 20);

          // Fetch reviews if they are a mentor
          if (combinedData.is_mentor) {
            const reviewsRes = await apiService.getMentorReviews(id);
            if (reviewsRes.ok) {
              setReviews(reviewsRes.data);
              await cacheService.set(`mentor_reviews_${id}`, reviewsRes.data, 15);
            }
          }
      }
    } catch (error) {
      console.error('Failed to load profile', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentorDetails();
  }, [id]);

  const handleSubmitReview = async () => {
    if (userRating < 1) {
      Alert.alert('Error', 'Please select at least 1 star.');
      return;
    }
    setSubmittingReview(true);
    try {
      const res = await apiService.submitMentorReview(id, userRating, userComment);
      if (res.ok) {
        Alert.alert('Success', 'Thank you for your review!');
        setShowRatingModal(false);
        fetchMentorDetails(); // Refresh to show new rating/review
      } else {
        Alert.alert('Error', res.data.error || 'Failed to submit review.');
      }
    } catch (e) {
      Alert.alert('Error', 'Connection failed.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading && !mentor) return <Loader message="Loading mentor profile..." />;

  if (!mentor) return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.heading} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 40 }} />
      </View>
      <View style={styles.errorContainer}>
        <Ionicons name="person-outline" size={80} color={theme.colors.divider} />
        <Text style={styles.errorTitle}>Profile Not Found</Text>
        <Text style={styles.errorSub}>The user you are looking for is not registered as a mentor or the profile is private.</Text>
        <TouchableOpacity style={styles.goBackBtn} onPress={() => router.back()}>
          <Text style={styles.goBackText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')}
          style={styles.backBtn}
        >
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.heading} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {mentor?.is_staff ? 'Staff Profile' : (mentor?.is_mentor ? 'Mentor Profile' : 'Student Profile')}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.topSection}>
          <View style={styles.avatarWrapper}>
            <Image
              source={{ uri: mentor.avatar_url || theme.images.avatar + mentor.full_name }}
              style={styles.avatar}
            />
            {mentor.is_mentor && (
              <View style={styles.verifiedBadge}>
                <MaterialIcons name="verified" size={20} color="#fff" />
              </View>
            )}
          </View>

          <Text style={styles.name}>{mentor.full_name || mentor.username}</Text>
          <Text style={styles.major}>
            {mentor.is_staff ? 'Administrator' : (mentor.is_mentor ? (mentor.major_course || 'Verified Mentor') : (mentor.university || 'Student'))}
          </Text>

          {mentor.is_staff ? (
            <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <MaterialIcons name="security" size={24} color={theme.colors.primary} />
                  <Text style={[styles.statLab, { marginTop: 8 }]}>Official Staff</Text>
                </View>
            </View>
          ) : mentor.is_mentor ? (
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statVal}>{mentor.rating || '0.0'}</Text>
                <Text style={styles.statLab}>Rating</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statVal}>50+</Text>
                <Text style={styles.statLab}>Sessions</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Text style={styles.statVal}>{mentor.reviews_count || 0}</Text>
                <Text style={styles.statLab}>Reviews</Text>
              </View>
            </View>
          ) : (
            <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statVal}>{mentor.scholar_points || 0}</Text>
                  <Text style={styles.statLab}>ScholarPoints</Text>
                </View>
            </View>
          )}
        </View>

        <View style={styles.content}>
          {mentor.is_mentor && mentor.user_id !== currentUser?.user_id && (
            <TouchableOpacity
              style={styles.rateMentorBtn}
              onPress={() => setShowRatingModal(true)}
            >
              <MaterialIcons name="star-rate" size={20} color={theme.colors.primary} />
              <Text style={styles.rateMentorBtnText}>Rate this Mentor</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.sectionTitle}>
            {mentor.is_staff ? 'About Administrator' : (mentor.is_mentor ? 'About Mentor' : 'About Student')}
          </Text>
          <Text style={styles.bioText}>
            {mentor.is_staff
              ? "Official system administrator helping students and managing the platform."
              : (mentor.mentorship_bio || mentor.bio || "Hello! I am a member of ScholarshipConnectBD.")
            }
          </Text>

          {mentor.is_mentor && (
            <>
              <Text style={styles.sectionTitle}>Expertise Areas</Text>
              <View style={styles.tagsContainer}>
                {(mentor.expertise_areas || mentor.research_interests || "General").split(',').map((tag, i) => (
                  <View key={i} style={styles.tagBadge}>
                    <Text style={styles.tagText}>{tag.trim()}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <MaterialIcons name="school" size={20} color={theme.colors.primary} />
              <View style={styles.infoTexts}>
                <Text style={styles.infoLabel}>University</Text>
                <Text style={styles.infoValue}>{mentor.university || 'Not Specified'}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons name="language" size={20} color={theme.colors.primary} />
              <View style={styles.infoTexts}>
                <Text style={styles.infoLabel}>Target Countries</Text>
                <Text style={styles.infoValue}>{mentor.target_countries || 'Global'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.socialGrid}>
            {!!mentor.linkedin_url && (
              <TouchableOpacity style={styles.socialBtn} onPress={() => Linking.openURL(mentor.linkedin_url)}>
                <FontAwesome5 name="linkedin" size={20} color="#0077b5" />
              </TouchableOpacity>
            )}
            {!!mentor.github_url && (
              <TouchableOpacity style={styles.socialBtn} onPress={() => Linking.openURL(mentor.github_url)}>
                <FontAwesome5 name="github" size={20} color="#333" />
              </TouchableOpacity>
            )}
            {!!mentor.google_scholar_url && (
              <TouchableOpacity style={styles.socialBtn} onPress={() => Linking.openURL(mentor.google_scholar_url)}>
                <FontAwesome5 name="google" size={18} color="#4285F4" />
              </TouchableOpacity>
            )}
          </View>

          {/* Reviews List */}
          <View style={styles.reviewsSection}>
            <Text style={styles.sectionTitle}>Reviews ({reviews.length})</Text>
            {reviews.length === 0 ? (
              <Text style={styles.noReviews}>No reviews yet. Be the first to rate!</Text>
            ) : (
              reviews.map((rev, idx) => (
                <View key={idx} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Image
                      source={{ uri: rev.user_avatar || theme.images.avatar + rev.user_name }}
                      style={styles.reviewAvatar}
                    />
                    <View style={styles.reviewInfo}>
                      <Text style={styles.reviewName}>{rev.user_name}</Text>
                      <View style={styles.starsRow}>
                        {[1,2,3,4,5].map(s => (
                          <MaterialIcons
                            key={s}
                            name={s <= rev.rating ? "star" : "star-outline"}
                            size={14}
                            color="#FFD700"
                          />
                        ))}
                      </View>
                    </View>
                    <Text style={styles.reviewDate}>{new Date(rev.created_at).toLocaleDateString()}</Text>
                  </View>
                  {rev.comment ? <Text style={styles.reviewComment}>{rev.comment}</Text> : null}
                </View>
              ))
            )}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Rating Modal */}
      <Modal
        visible={showRatingModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowRatingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Rate {mentor.full_name}</Text>

            <View style={styles.ratingPicker}>
              {[1,2,3,4,5].map(star => (
                <TouchableOpacity key={star} onPress={() => setUserRating(star)}>
                  <MaterialIcons
                    name={star <= userRating ? "star" : "star-outline"}
                    size={40}
                    color="#FFD700"
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.reviewInput}
              placeholder="Write your feedback (optional)..."
              multiline
              numberOfLines={4}
              value={userComment}
              onChangeText={setUserComment}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setShowRatingModal(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.submitBtn]}
                onPress={handleSubmitReview}
                disabled={submittingReview}
              >
                {submittingReview ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Submit</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.bottomBar}>
        {mentor.user_id !== currentUser?.user_id && (
          <TouchableOpacity
            style={styles.messageBtn}
            onPress={() => router.push({
              pathname: `/messages/${mentor.user_id || mentor.user || mentor.id}`,
              params: { name: mentor.full_name, avatar: mentor.avatar_url }
            })}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.messageBtnText}>Message</Text>
          </TouchableOpacity>
        )}

        {mentor.is_mentor && (
            <TouchableOpacity
              style={[styles.bookBtn, mentor.user_id === currentUser?.user_id ? { display: 'none' } : { flex: 2 }]}
              onPress={() => router.push({
                pathname: '/mentorship/request',
                params: { mentorId: mentor.user_id || mentor.user || mentor.id, mentorName: mentor.full_name }
              })}
            >
              <Text style={styles.bookBtnText}>Book Session</Text>
            </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 50 : 40, paddingBottom: 15,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: theme.colors.divider
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.heading },
  backBtn: { padding: 5 },
  topSection: { alignItems: 'center', padding: 30, backgroundColor: '#fff', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, ...theme.shadows.soft },
  avatarWrapper: { position: 'relative' },
  avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: theme.colors.primaryLight },
  verifiedBadge: { position: 'absolute', bottom: 5, right: 5, backgroundColor: theme.colors.primary, width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#fff' },
  name: { fontSize: 24, fontWeight: 'bold', color: theme.colors.heading, marginTop: 15 },
  major: { fontSize: 16, color: theme.colors.primary, fontWeight: '600', marginTop: 4 },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 25, width: '100%', justifyContent: 'center' },
  statBox: { alignItems: 'center', flex: 1 },
  statVal: { fontSize: 18, fontWeight: 'bold', color: theme.colors.heading },
  statLab: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: theme.colors.divider },
  content: { padding: 25 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.heading, marginBottom: 12, marginTop: 10 },
  bioText: { fontSize: 15, color: theme.colors.textPrimary, lineHeight: 24, opacity: 0.8 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 5 },
  tagBadge: { backgroundColor: theme.colors.primaryLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  tagText: { color: theme.colors.primary, fontSize: 12, fontWeight: 'bold' },
  infoCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginTop: 20, ...theme.shadows.soft },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  infoTexts: { marginLeft: 15 },
  infoLabel: { fontSize: 12, color: theme.colors.textSecondary },
  infoValue: { fontSize: 14, fontWeight: 'bold', color: theme.colors.heading, marginTop: 2 },
  socialGrid: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 20 },
  socialBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', ...theme.shadows.soft },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', padding: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 20, flexDirection: 'row', gap: 15, borderTopWidth: 1, borderTopColor: theme.colors.divider },
  messageBtn: { flex: 1, height: 55, borderRadius: 15, borderWidth: 1.5, borderColor: theme.colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  messageBtnText: { color: theme.colors.primary, fontWeight: 'bold', fontSize: 16 },
  bookBtn: { flex: 2, height: 55, borderRadius: 15, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center', ...theme.shadows.teal },
  bookBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, backgroundColor: '#fff' },
  errorTitle: { fontSize: 22, fontWeight: 'bold', color: theme.colors.heading, marginTop: 20 },
  errorSub: { fontSize: 14, color: theme.colors.textSecondary, textAlign: 'center', marginTop: 10, lineHeight: 20 },
  goBackBtn: { marginTop: 30, backgroundColor: theme.colors.primary, paddingHorizontal: 30, paddingVertical: 12, borderRadius: 12 },
  goBackText: { color: '#fff', fontWeight: 'bold' },
  rateMentorBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: theme.colors.primaryLight, paddingVertical: 12, borderRadius: 15,
    marginBottom: 20, borderWidth: 1, borderColor: theme.colors.primary,
  },
  rateMentorBtnText: { color: theme.colors.primary, fontWeight: 'bold', fontSize: 15 },
  reviewsSection: { marginTop: 30 },
  noReviews: { color: theme.colors.textSecondary, fontStyle: 'italic', textAlign: 'center', marginTop: 10 },
  reviewCard: {
    backgroundColor: '#fff', borderRadius: 15, padding: 15, marginBottom: 15,
    ...theme.shadows.soft, borderWidth: 1, borderColor: theme.colors.divider
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center' },
  reviewAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  reviewInfo: { flex: 1 },
  reviewName: { fontSize: 14, fontWeight: 'bold', color: theme.colors.heading },
  starsRow: { flexDirection: 'row', marginTop: 2 },
  reviewDate: { fontSize: 10, color: theme.colors.textSecondary },
  reviewComment: { fontSize: 13, color: theme.colors.textPrimary, marginTop: 10, lineHeight: 18 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContainer: { backgroundColor: '#fff', borderRadius: 25, padding: 25, ...theme.shadows.premium },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.heading, textAlign: 'center', marginBottom: 20 },
  ratingPicker: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 20 },
  reviewInput: {
    backgroundColor: theme.colors.background, borderRadius: 15, padding: 15,
    height: 100, textAlignVertical: 'top', marginBottom: 20, color: theme.colors.textPrimary
  },
  modalActions: { flexDirection: 'row', gap: 15 },
  modalBtn: { flex: 1, height: 50, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  cancelBtn: { backgroundColor: theme.colors.background },
  cancelBtnText: { color: theme.colors.textSecondary, fontWeight: 'bold' },
  submitBtn: { backgroundColor: theme.colors.primary },
  submitBtnText: { color: '#fff', fontWeight: 'bold' },
});
