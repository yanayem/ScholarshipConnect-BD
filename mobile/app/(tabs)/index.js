import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, ScrollView,
  TouchableOpacity, StyleSheet, StatusBar, ActivityIndicator, Image, Platform,
  FlatList, RefreshControl, Alert
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeIn, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../theme';
import { apiService } from '../../services/api';
import { cacheService } from '../../services/cache';
import { useToast } from '../../components/Toast';
import { useMentorMode } from '../../context/MentorModeContext';

import { useUser } from '../../context/UserContext';

const tagColor = { Hot: theme.colors.error, Popular: theme.colors.primary, New: theme.colors.success };

function StudentHome({ user, featured, loading, leaderboard, activeCountries, allScholarships, isSearching, setIsSearching, search, setSearch, handleSearchSubmit, initials }) {
    const insets = useSafeAreaInsets();

    return (
    <View style={styles.root}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />

      {/* Facebook-style Transforming Header */}
      <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, 15), height: 70 + insets.top }]}>
        {isSearching ? (
          <View style={{ flex: 1 }}>
            <Animated.View entering={FadeIn} style={styles.searchBarRow}>
              <TouchableOpacity onPress={() => { setIsSearching(false); setSearch(''); }} style={styles.backBtn}>
                <MaterialIcons name="arrow-back" size={24} color={theme.colors.heading} />
              </TouchableOpacity>
              <TextInput
                style={styles.headerSearchInput}
                placeholder="Search Scholarships..."
                placeholderTextColor={theme.colors.placeholder}
                value={search}
                onChangeText={setSearch}
                autoFocus
                returnKeyType="search"
                onSubmitEditing={handleSearchSubmit}
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch('')} style={styles.clearBtn}>
                  <MaterialIcons name="close" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              )}
            </Animated.View>

            {/* Auto-Suggestion List */}
            {search.length > 0 && (
              <View style={styles.suggestionContainer}>
                <ScrollView keyboardShouldPersistTaps="handled">
                  {allScholarships
                    .filter(s => s.title.toLowerCase().includes(search.toLowerCase()))
                    .slice(0, 5) // Limit to 5 suggestions
                    .map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        style={styles.suggestionItem}
                        onPress={() => {
                          router.push(`/scholarships/${item.id}`);
                          setIsSearching(false);
                          setSearch('');
                        }}
                      >
                        <MaterialIcons name="history" size={18} color={theme.colors.placeholder} />
                        <Text style={styles.suggestionText} numberOfLines={1}>{item.title}</Text>
                        <MaterialIcons name="north-west" size={16} color={theme.colors.placeholder} />
                      </TouchableOpacity>
                    ))}
                  {allScholarships.filter(s => s.title.toLowerCase().includes(search.toLowerCase())).length === 0 && (
                    <View style={styles.noSuggestion}>
                      <Text style={styles.noSuggestionText}>No matching scholarships found</Text>
                    </View>
                  )}
                </ScrollView>
              </View>
            )}
          </View>
        ) : (
          <Animated.View entering={FadeIn} style={styles.defaultHeaderRow}>
            <Text style={styles.headerTitle}>ScholarshipConnectBD</Text>
            <View style={styles.headerIcons}>
              <TouchableOpacity
                style={styles.iconCircleBtn}
                onPress={() => setIsSearching(true)}
              >
                <MaterialIcons name="search" size={22} color={theme.colors.heading} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconCircleBtn}
                onPress={() => router.push('/notifications')}
              >
                <MaterialIcons name="notifications-none" size={22} color={theme.colors.heading} />
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* User Greeting Section */}
        <View style={styles.greetingSection}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={styles.userNameGreeting}>{user?.full_name || user?.username || ''}</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/profile')}
              style={styles.profileBtn}
            >
               {(user?.avatar_url || user?.profile_picture) ? (
                 <Image
                   source={{ uri: user?.avatar_url || user?.profile_picture }}
                   style={styles.headerAvatarSmall}
                   key={user?.avatar_url || user?.profile_picture}
                   defaultSource={{ uri: 'https://ui-avatars.com/api/?name=' + initials }}
                 />
               ) : (
                 <View style={styles.headerAvatarFallbackSmall}>
                   <Text style={styles.avatarInitialTextSmall}>{initials}</Text>
                 </View>
               )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Success Stories Preview */}
        <View style={styles.blogBanner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.blogBannerTitle}>Success Stories</Text>
            <Text style={styles.blogBannerSub}>Read how others got their scholarships.</Text>
            <TouchableOpacity
              style={styles.blogBtn}
              onPress={() => router.push('/blog')}
            >
              <Text style={styles.blogBtnText}>Read Blogs</Text>
              <MaterialIcons name="arrow-forward" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          <MaterialIcons name="auto-stories" size={60} color="rgba(255,255,255,0.2)" />
        </View>

        {/* Explore by Country */}
        <Text style={styles.sectionTitle}>Explore by Country</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.countryRow}>
            {(activeCountries.length > 0 ? activeCountries : ['USA', 'UK', 'Canada', 'Germany']).map((country) => (
                <TouchableOpacity
                    key={country}
                    style={styles.countryCard}
                    onPress={() => router.push(`/scholarships?country=${country}`)}
                >
                    <View style={styles.countryIconBox}>
                        <MaterialIcons name="language" size={24} color={theme.colors.primary} />
                    </View>
                    <Text style={styles.countryName}>{country}</Text>
                </TouchableOpacity>
            ))}
        </ScrollView>

        {/* AI Smart Tools */}
        <Text style={styles.sectionTitle}>AI Smart Tools</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.aiToolsRow}>
          <TouchableOpacity
            style={[styles.aiCard, { backgroundColor: '#FFF7ED' }]}
            onPress={() => router.push('/ai-tools/support-bot')}
          >
            <MaterialIcons name="support-agent" size={24} color="#EA580C" />
            <Text style={styles.aiCardTitle}>Live Support</Text>
            <Text style={styles.aiCardSub}>Instant AI Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.aiCard, { backgroundColor: '#ECFDF5' }]}
            onPress={() => router.push('/eligibility')}
          >
            <MaterialIcons name="fact-check" size={24} color="#059669" />
            <Text style={styles.aiCardTitle}>Eligibility</Text>
            <Text style={styles.aiCardSub}>Instant Analysis</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.aiCard, { backgroundColor: '#FFFBEB' }]}
            onPress={() => router.push('/documents')}
          >
            <MaterialIcons name="folder-special" size={24} color="#D97706" />
            <Text style={styles.aiCardTitle}>Doc Vault</Text>
            <Text style={styles.aiCardSub}>Store Safely</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Featured Scholarships */}
        <Text style={styles.sectionTitle}>Featured Scholarships</Text>
        {loading && featured.length === 0 ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
             <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        ) : featured.filter(s =>
          s.title.toLowerCase().includes(search.toLowerCase())
        ).map((item, index) => (
          <Animated.View
            key={item.id}
            entering={FadeInDown.delay(index * 100).duration(600)}
          >
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => router.push(`/scholarships/${item.id}`)}
            >
              <View style={styles.cardTop}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                {item.is_featured ? (
                  <View style={[styles.tag, { backgroundColor: tagColor['Hot'] }]}>
                    <Text style={styles.tagText}>Hot</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.cardMeta}>
                <MaterialIcons name="place" size={13} color={theme.colors.textSecondary} /> {item.country}
                {'   '}
                <MaterialIcons name="school" size={13} color={theme.colors.textSecondary} /> {item.level}
              </Text>
              <View style={styles.cardBottom}>
                <Text style={[styles.cardDeadline, { flexShrink: 0 }]} numberOfLines={1}>
                  <MaterialIcons name="event" size={13} color={theme.colors.error} /> Deadline: {item.deadline}
                </Text>
                <View style={[styles.amountBadge, { marginLeft: 10, flexShrink: 1 }]}>
                  <Text style={styles.amountText} numberOfLines={1} ellipsizeMode="tail">{item.amount}</Text>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
        {!loading && featured.length === 0 && (
          <Text style={{ textAlign: 'center', color: theme.colors.textSecondary, marginTop: 10 }}>No featured scholarships available.</Text>
        )}

        {/* Top Contributors / Leaderboard */}
        <Text style={styles.sectionTitle}>Top Scholars</Text>
        <View style={styles.leaderboardCard}>
            {leaderboard.length > 0 ? (
                leaderboard.map((item, index) => (
                    <View key={item.id} style={styles.leaderboardItem}>
                        <View style={[
                            styles.rankBadge,
                            index === 1 && {backgroundColor: '#C0C0C0'},
                            index === 2 && {backgroundColor: '#CD7F32'}
                        ]}>
                            <Text style={styles.rankText}>{index + 1}</Text>
                        </View>
                        <View style={styles.leaderAvatar}>
                            <Text style={styles.avatarInitial}>{(item.full_name || item.user || 'A')[0].toUpperCase()}</Text>
                        </View>
                        <Text style={styles.leaderName}>{item.full_name || item.username}</Text>
                        <Text style={styles.leaderPoints}>{item.scholar_points} pts</Text>
                    </View>
                ))
            ) : (
                <Text style={{textAlign: 'center', padding: 20, color: theme.colors.textSecondary}}>Be the first to earn ScholarPoints!</Text>
            )}
            <TouchableOpacity style={styles.viewFullLeaderboard} onPress={() => router.push('/leaderboard')}>
                <Text style={styles.viewFullText}>View Full Leaderboard</Text>
            </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
    );
}

function MentorHome({ user }) {
    const insets = useSafeAreaInsets();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [contributionData, setContributionData] = useState({
      scholarships: 0,
      discussions: 0,
      solved: 0
    });

    const loadData = async () => {
      // Try Cache First
      try {
        const cachedSessions = await cacheService.get('mentor_sessions');
        const cachedImpact = await cacheService.get('mentor_impact');

        if (cachedSessions) {
          setSessions(cachedSessions);
          setLoading(false);
        }
        if (cachedImpact) {
          setContributionData(cachedImpact);
        }
      } catch (e) {}

      try {
        const [mentorshipRes, scholarRes, communityRes] = await Promise.all([
          apiService.getMentorships(),
          apiService.getScholarships(),
          apiService.getDiscussions()
        ]);

        if (mentorshipRes.ok) {
          setSessions(mentorshipRes.data);
          await cacheService.set('mentor_sessions', mentorshipRes.data, 10);
        }

        if (scholarRes.ok && user) {
          const myScholarships = (scholarRes.data.results || scholarRes.data).filter(s => s.submitted_by === user.user_id);
          const myDiscussions = (communityRes.data.results || communityRes.data).filter(d => d.author === user.user_id);

          const impact = {
            scholarships: myScholarships.length,
            discussions: myDiscussions.length,
            solved: myDiscussions.filter(d => d.is_solved).length
          };
          setContributionData(impact);
          await cacheService.set('mentor_impact', impact, 30);
        }
      } catch (error) {
        console.error('Failed to load mentor dashboard', error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

    useEffect(() => {
      loadData();
    }, [user]);

    const onRefresh = () => {
      setRefreshing(true);
      loadData();
    };

    const handleUpdateStatus = async (sessionId, status) => {
      const statusText = status === 'approved' ? 'Approve' : (status === 'rejected' ? 'Reject' : 'Complete');
      Alert.alert(
        'Update Session',
        `Are you sure you want to ${statusText.toLowerCase()} this session?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: statusText,
            onPress: async () => {
              const res = await apiService.updateMentorshipStatus(sessionId, status);
              if (res.ok) {
                Alert.alert('Success', `Session ${statusText.toLowerCase()}d!`);
                loadData();
              } else {
                Alert.alert('Error', res.data?.detail || res.data?.error || 'Failed to update status');
              }
            }
          }
        ]
      );
    };

    const getStatusStyle = (status) => {
      switch (status) {
        case 'approved': return { bg: '#ECFDF5', color: '#059669', icon: 'check-circle' };
        case 'rejected': return { bg: '#FEF2F2', color: '#DC2626', icon: 'cancel' };
        case 'completed': return { bg: '#F5F3FF', color: '#7C3AED', icon: 'verified' };
        default: return { bg: '#F8FAFC', color: '#64748B', icon: 'pending' };
      }
    };

    const renderSession = ({ item }) => {
      const isMentor = user && item.mentor === user.user_id;
      const statusStyle = getStatusStyle(item.status);

      return (
        <Animated.View entering={FadeInDown.duration(400)}>
            <View style={[styles.mentorCard, theme.shadows.premium]}>
              <View style={styles.cardHeader}>
                <View style={styles.topicRow}>
                  <Text style={styles.topicText} numberOfLines={1}>{item.topic}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                    <MaterialIcons name={statusStyle.icon} size={12} color={statusStyle.color} />
                    <Text style={[styles.statusText, { color: statusStyle.color }]}>
                      {item.status.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <View style={styles.dateTimeRow}>
                    <View style={styles.dateChip}>
                        <MaterialIcons name="event" size={14} color={theme.colors.textSecondary} />
                        <Text style={styles.dateText}>{item.scheduled_date || 'TBD'}</Text>
                    </View>
                    <View style={styles.dateChip}>
                        <MaterialIcons name="access-time" size={14} color={theme.colors.textSecondary} />
                        <Text style={styles.dateText}>{item.scheduled_time?.substring(0, 5) || 'TBD'}</Text>
                    </View>
                </View>
              </View>

              <View style={styles.cardBody}>
                <View style={styles.mentorInfoRow}>
                   <View style={styles.userIconCircle}>
                        <MaterialIcons name={isMentor ? "person" : "school"} size={16} color={theme.colors.primary} />
                   </View>
                   <View>
                        <Text style={styles.roleLabel}>{isMentor ? 'Student' : 'Mentor'}</Text>
                        <Text style={styles.mentorInfoName}>
                          {isMentor ? (item.mentee_name || 'Student') : (item.mentor_name || 'Scholar')}
                        </Text>
                   </View>
                </View>
                <View style={styles.messageContainer}>
                    <Text style={styles.messageText} numberOfLines={2}>{item.message}</Text>
                </View>
              </View>

              {isMentor && item.status === 'pending' && (
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={[styles.mentorActionBtn, styles.mentorRejectBtn]}
                    onPress={() => handleUpdateStatus(item.id, 'rejected')}
                  >
                    <Text style={styles.mentorRejectBtnText}>Decline</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.mentorActionBtn, styles.mentorApproveBtn]}
                    onPress={() => handleUpdateStatus(item.id, 'approved')}
                  >
                    <Text style={styles.mentorApproveBtnText}>Accept Request</Text>
                  </TouchableOpacity>
                </View>
              )}

              {isMentor && item.status === 'approved' && (
                <TouchableOpacity
                  style={[styles.mentorActionBtn, styles.mentorCompleteBtn]}
                  onPress={() => handleUpdateStatus(item.id, 'completed')}
                >
                  <MaterialIcons name="done-all" size={18} color="#fff" />
                  <Text style={styles.mentorCompleteBtnText}>Mark as Completed</Text>
                </TouchableOpacity>
              )}
            </View>
        </Animated.View>
      );
    };

    const renderHeader = () => {
      const pendingCount = sessions.filter(s => s.status === 'pending').length;
      const completedCount = sessions.filter(s => s.status === 'completed').length;
      const successRate = sessions.length > 0 ? Math.round((completedCount / sessions.length) * 100) : 0;

      return (
        <View style={styles.dashboardContent}>
          {/* Modern Identity Section */}
          <View style={[styles.modernIdentityCard, theme.shadows.premium]}>
              <View style={styles.identityTopRow}>
                  <View style={styles.identityDetails}>
                      <Text style={styles.welcomeMentorText}>Welcome back,</Text>
                      <Text style={styles.identityNameLarge}>{user?.full_name || user?.username}</Text>
                      <View style={styles.verifiedMentorBadge}>
                          <MaterialIcons name="verified" size={14} color="#fff" />
                          <Text style={styles.verifiedMentorBadgeText}>VERIFIED MENTOR</Text>
                      </View>
                  </View>
                  <View style={styles.modernPointsContainer}>
                      <View style={styles.modernPointsCircle}>
                          <Text style={styles.modernPointsVal}>{user?.scholar_points || 0}</Text>
                          <Text style={styles.modernPointsLabel}>PTS</Text>
                      </View>
                  </View>
              </View>

              <View style={styles.modernStatsGrid}>
                  <View style={styles.modernStatItem}>
                      <Text style={styles.modernStatVal}>{sessions.length}</Text>
                      <Text style={styles.modernStatLabel}>Total Sessions</Text>
                  </View>
                  <View style={styles.modernStatDivider} />
                  <View style={styles.modernStatItem}>
                      <Text style={[styles.modernStatVal, { color: theme.colors.warning }]}>{pendingCount}</Text>
                      <Text style={styles.modernStatLabel}>Pending</Text>
                  </View>
                  <View style={styles.modernStatDivider} />
                  <View style={styles.modernStatItem}>
                      <Text style={[styles.modernStatVal, { color: theme.colors.success }]}>{successRate}%</Text>
                      <Text style={styles.modernStatLabel}>Success Rate</Text>
                  </View>
              </View>
          </View>

          {/* Quick Actions Row */}
          <View style={styles.quickActionsRow}>
              <TouchableOpacity style={[styles.quickActionCard, { backgroundColor: '#EEF2FF' }]} onPress={() => router.push('/edit-profile')}>
                  <View style={[styles.quickActionIcon, { backgroundColor: '#E0E7FF' }]}>
                    <MaterialIcons name="edit" size={20} color="#4F46E5" />
                  </View>
                  <Text style={styles.quickActionLabel}>Edit Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.quickActionCard, { backgroundColor: '#FFF7ED' }]} onPress={() => router.push('/notifications')}>
                  <View style={[styles.quickActionIcon, { backgroundColor: '#FFEDD5' }]}>
                    <MaterialIcons name="notifications" size={20} color="#EA580C" />
                  </View>
                  <Text style={styles.quickActionLabel}>Alerts</Text>
              </TouchableOpacity>
          </View>

          {/* Impact Overview */}
          <View style={[styles.impactCard, theme.shadows.soft]}>
              <Text style={styles.impactTitle}>Your Community Impact</Text>
              <View style={styles.impactGrid}>
                  <View style={styles.impactItem}>
                      <View style={[styles.impactIconBox, { backgroundColor: '#DBEAFE' }]}>
                        <MaterialIcons name="school" size={24} color="#2563EB" />
                      </View>
                      <Text style={styles.impactVal}>{contributionData.scholarships}</Text>
                      <Text style={styles.impactLabel}>Scholarships</Text>
                  </View>
                  <View style={styles.impactItem}>
                      <View style={[styles.impactIconBox, { backgroundColor: '#F3E8FF' }]}>
                        <MaterialIcons name="forum" size={24} color="#9333EA" />
                      </View>
                      <Text style={styles.impactVal}>{contributionData.discussions}</Text>
                      <Text style={styles.impactLabel}>Discussions</Text>
                  </View>
                  <View style={styles.impactItem}>
                      <View style={[styles.impactIconBox, { backgroundColor: '#DCFCE7' }]}>
                        <MaterialIcons name="check-circle" size={24} color="#16A34A" />
                      </View>
                      <Text style={styles.impactVal}>{contributionData.solved}</Text>
                      <Text style={styles.impactLabel}>Solved</Text>
                  </View>
              </View>
          </View>

          {/* Success Stories / Blog Banner for Mentors */}
          <View style={[styles.blogBanner, { marginBottom: 24, marginTop: 0 }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.blogBannerTitle}>Share Your Journey</Text>
              <Text style={styles.blogBannerSub}>Inspire others by writing a success story or tips.</Text>
              <TouchableOpacity
                style={styles.blogBtn}
                onPress={() => router.push('/blog')}
              >
                <Text style={styles.blogBtnText}>Go to Blog</Text>
                <MaterialIcons name="arrow-forward" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
            <MaterialIcons name="auto-stories" size={60} color="rgba(255,255,255,0.2)" />
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Session Requests</Text>
            {pendingCount > 0 && (
                <View style={styles.pendingDot}>
                    <Text style={styles.pendingDotText}>{pendingCount}</Text>
                </View>
            )}
          </View>
        </View>
      );
    };

    // if (loading) return <Loader message="Setting up your dashboard..." />;

    return (
        <View style={styles.root}>
            <StatusBar backgroundColor="#fff" barStyle="dark-content" />
            <View style={[styles.mentorHeader, { paddingTop: Math.max(insets.top, 15) }]}>
                <View>
                    <Text style={styles.headerSubtitle}>ScholarshipConnectBD</Text>
                    <Text style={styles.headerTitle}>Mentor Panel</Text>
                </View>
                <View style={styles.headerIcons}>
                    <TouchableOpacity onPress={() => router.push('/notifications')} style={styles.iconCircleBtn}>
                       <MaterialIcons name="notifications-none" size={22} color={theme.colors.heading} />
                       {sessions.some(s => s.status === 'pending') && <View style={styles.notifIndicator} />}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push('/profile')} style={styles.headerProfileBtn}>
                        {user?.avatar_url ? (
                            <Image source={{ uri: user.avatar_url }} style={styles.headerAvatar} />
                        ) : (
                            <View style={styles.headerAvatarPlaceholder}>
                                <Text style={styles.avatarInitial}>{user?.username?.[0].toUpperCase()}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
              data={sessions}
              renderItem={renderSession}
              keyExtractor={item => item.id.toString()}
              contentContainerStyle={styles.mentorScroll}
              ListHeaderComponent={renderHeader}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <View style={styles.emptyIllustration}>
                    <FontAwesome5 name="calendar-check" size={60} color={theme.colors.placeholder} />
                  </View>
                  <Text style={styles.emptyTitle}>No Sessions Yet</Text>
                  <Text style={styles.emptySub}>Your mentorship requests will appear here once students book a session.</Text>
                </View>
              }
            />
        </View>
    );
}

export default function HomeScreen() {
  const { isMentorMode } = useMentorMode();
  const { user, fetchProfile } = useUser();
  const [search, setSearch] = useState('');

  useFocusEffect(
    useCallback(() => {
      if (!user) fetchProfile();
    }, [user])
  );
  const [isSearching, setIsSearching] = useState(false);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allScholarships, setAllScholarships] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [activeCountries, setActiveCountries] = useState([]);
  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    const loadData = async () => {
      // 1. Try to load from cache first
      try {
        const cachedScholarships = await cacheService.get('home_scholarships');
        const cachedLeaderboard = await cacheService.get('home_leaderboard');

        if (cachedScholarships) {
          setAllScholarships(cachedScholarships);
          setFeatured(
            cachedScholarships
              .filter(s => s.is_featured && new Date(s.deadline) >= new Date())
              .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
              .slice(0, 3)
          );
          const rawCountriesCached = cachedScholarships
            .map(s => s.country)
            .filter(Boolean)
            .flatMap(c => c.split(',').map(name => name.trim()));
          const countries = [...new Set(rawCountriesCached)].slice(0, 8);
          setActiveCountries(countries);
          setLoading(false); // Stop showing full screen loader if we have cache
        }

        if (cachedLeaderboard) {
          setLeaderboard(cachedLeaderboard.slice(0, 3));
        }
      } catch (e) {
        console.log('[Home] Cache load error:', e);
      }

      // 2. Fetch fresh data in the background
      try {
        const [scholarRes, leaderRes] = await Promise.all([
          apiService.getScholarships(),
          apiService.getLeaderboard()
        ]);

        if (scholarRes.ok) {
          const data = Array.isArray(scholarRes.data) ? scholarRes.data : scholarRes.data.results || [];
          setAllScholarships(data);
          setFeatured(
            data
              .filter(s => s.is_featured && new Date(s.deadline) >= new Date())
              .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
              .slice(0, 3)
          );
          const rawCountries = data
            .map(s => s.country)
            .filter(Boolean)
            .flatMap(c => c.split(',').map(name => name.trim()));
          const countries = [...new Set(rawCountries)].slice(0, 8);
          setActiveCountries(countries);

          // Save to cache
          await cacheService.set('home_scholarships', data, 30); // Cache for 30 mins
        }

        if (leaderRes.ok) {
          setLeaderboard(leaderRes.data.slice(0, 3));
          await cacheService.set('home_leaderboard', leaderRes.data, 60);
        }

      } catch (error) {
        console.error('Failed to load home data', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // if (loading) return <Loader message="Loading..." />;

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : (user?.username?.substring(0, 2).toUpperCase() || 'S');

  const handleSearchSubmit = () => {
    if (search.trim()) {
      router.push(`/scholarships?search=${encodeURIComponent(search.trim())}`);
      setIsSearching(false);
      setSearch('');
    }
  };

  if (isMentorMode && user?.is_mentor) {
      return <MentorHome user={user} />;
  }

  return (
    <StudentHome
        user={user}
        featured={featured}
        loading={loading}
        leaderboard={leaderboard}
        activeCountries={activeCountries}
        allScholarships={allScholarships}
        isSearching={isSearching}
        setIsSearching={setIsSearching}
        search={search}
        setSearch={setSearch}
        handleSearchSubmit={handleSearchSubmit}
        initials={initials}
    />
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { paddingHorizontal: 20, paddingBottom: 20 },
  mentorHeader: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingBottom: 15, paddingHorizontal: 20,
      backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: theme.colors.divider
  },
  headerSubtitle: { fontSize: 12, color: theme.colors.textSecondary, fontWeight: '600' },
  mentorScroll: { paddingBottom: 30 },
  dashboardContent: { padding: 20 },
  modernIdentityCard: {
      backgroundColor: theme.colors.primary,
      borderRadius: 24,
      padding: 24,
      marginBottom: 20,
  },
  identityTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  identityDetails: { flex: 1 },
  welcomeMentorText: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '500' },
  identityNameLarge: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginTop: 4 },
  verifiedMentorBadge: {
      flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)',
      paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start', marginTop: 12, gap: 6
  },
  verifiedMentorBadgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  modernPointsContainer: { alignItems: 'center' },
  modernPointsCircle: {
      width: 65, height: 65, borderRadius: 32.5, backgroundColor: 'rgba(255,255,255,0.15)',
      alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)'
  },
  modernPointsVal: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  modernPointsLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 9, fontWeight: 'bold' },
  modernStatsGrid: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      marginTop: 24, paddingTop: 20, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.15)'
  },
  modernStatItem: { flex: 1, alignItems: 'center' },
  modernStatVal: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  modernStatLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 11, marginTop: 4 },
  modernStatDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.15)' },

  quickActionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, gap: 12 },
  quickActionCard: {
      flex: 1, borderRadius: 20, padding: 15, alignItems: 'center',
      borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)'
  },
  quickActionIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  quickActionLabel: { fontSize: 12, fontWeight: 'bold', color: theme.colors.heading },

  impactCard: { backgroundColor: '#fff', borderRadius: 24, padding: 20, marginBottom: 24 },
  impactTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.heading, marginBottom: 20 },
  impactGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  impactItem: { alignItems: 'center', flex: 1 },
  impactIconBox: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  impactVal: { fontSize: 18, fontWeight: 'bold', color: theme.colors.heading },
  impactLabel: { fontSize: 10, color: theme.colors.textSecondary, marginTop: 2 },

  notifIndicator: {
      position: 'absolute', top: 8, right: 8, width: 8, height: 8,
      borderRadius: 4, backgroundColor: theme.colors.error, borderWidth: 1.5, borderColor: '#fff'
  },
  headerProfileBtn: { marginLeft: 12 },
  headerAvatar: { width: 38, height: 38, borderRadius: 19, borderWidth: 1, borderColor: theme.colors.divider },
  headerAvatarPlaceholder: {
      width: 38, height: 38, borderRadius: 19, backgroundColor: theme.colors.primaryLight,
      alignItems: 'center', justifyContent: 'center'
  },
  pendingDot: { backgroundColor: theme.colors.error, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  pendingDotText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

  mentorCard: {
    backgroundColor: '#fff', borderRadius: 24, padding: 20, marginBottom: 16, marginHorizontal: 20,
    borderWidth: 1, borderColor: theme.colors.divider
  },
  dateTimeRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  dateChip: {
      flexDirection: 'row', alignItems: 'center', gap: 4,
      backgroundColor: '#F8FAFC', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8
  },
  mentorInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  userIconCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  roleLabel: { fontSize: 10, color: theme.colors.textSecondary, fontWeight: 'bold', textTransform: 'uppercase' },
  mentorInfoName: { fontSize: 15, fontWeight: 'bold', color: theme.colors.heading },
  messageContainer: { backgroundColor: '#F8FAFC', padding: 12, borderRadius: 12, marginTop: 12 },
  mentorActionBtn: {
      flex: 1, paddingVertical: 14, borderRadius: 15,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8
  },
  mentorApproveBtn: { backgroundColor: theme.colors.primary },
  mentorApproveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  mentorRejectBtn: { backgroundColor: '#fff', borderWidth: 1, borderColor: theme.colors.divider },
  mentorRejectBtnText: { color: theme.colors.textSecondary, fontWeight: 'bold', fontSize: 14 },
  mentorCompleteBtn: { backgroundColor: theme.colors.success },
  mentorCompleteBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  emptyContainer: { alignItems: 'center', padding: 40, marginTop: 20 },
  emptyIllustration: {
      width: 120, height: 120, borderRadius: 60, backgroundColor: '#F8FAFC',
      alignItems: 'center', justifyContent: 'center', marginBottom: 20
  },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.heading },
  emptySub: { fontSize: 13, color: theme.colors.textSecondary, textAlign: 'center', marginTop: 8, lineHeight: 20 },

  // Facebook Style Header
  headerContainer: {
    backgroundColor: '#fff',
    paddingBottom: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
    justifyContent: 'center',
  },
  defaultHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.primary,
    letterSpacing: -0.5,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.secondaryBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Search Transition Styles
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.secondaryBackground,
    borderRadius: 25,
    paddingHorizontal: 10,
    height: 45,
  },
  backBtn: {
    padding: 5,
  },
  headerSearchInput: {
    flex: 1,
    height: '100%',
    marginLeft: 8,
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  clearBtn: {
    padding: 5,
  },

  // Suggestion Styles
  suggestionContainer: {
    position: 'absolute',
    top: 55,
    left: -15,
    right: -15,
    backgroundColor: '#fff',
    maxHeight: 300,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
    zIndex: 999,
    ...theme.shadows.soft,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.colors.divider,
  },
  suggestionText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: theme.colors.textPrimary,
  },
  noSuggestion: {
    padding: 20,
    alignItems: 'center',
  },
  noSuggestionText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },

  greetingSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.medium
  },
  userNameGreeting: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.heading,
    marginTop: 2
  },
  profileBtn: {
    padding: 2,
  },
  headerAvatarSmall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  headerAvatarFallbackSmall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
  },
  avatarInitialTextSmall: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 8 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.heading },
  seeAll: { color: theme.colors.primary, fontSize: 14, fontWeight: '600' },
  blogBanner: {
    backgroundColor: theme.colors.primary, borderRadius: 20, padding: 24,
    flexDirection: 'row', alignItems: 'center', marginBottom: 32,
    ...theme.shadows.premium,
  },
  blogBannerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  blogBannerSub: { fontSize: 14, color: 'rgba(255,255,255,0.85)', marginTop: 4, marginBottom: 16 },
  blogBtn: {
    backgroundColor: theme.colors.primaryDark, alignSelf: 'flex-start',
    paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10,
    flexDirection: 'row', alignItems: 'center', gap: 8
  },
  blogBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  aiToolsRow: { paddingBottom: 10, paddingRight: 20 },
  aiCard: {
    width: 140, height: 110, borderRadius: 20, padding: 15,
    marginRight: 12, justifyContent: 'center', ...theme.shadows.soft
  },
  aiCardTitle: { fontSize: 14, fontWeight: 'bold', color: theme.colors.heading, marginTop: 10 },
  aiCardSub: { fontSize: 10, color: theme.colors.textSecondary, marginTop: 2 },
  countryRow: { paddingBottom: 24, gap: 12 },
  countryCard: {
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      padding: 12,
      borderRadius: 16,
      width: 90,
      ...theme.shadows.soft
  },
  countryIconBox: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8
  },
  countryName: { fontSize: 12, fontWeight: '600', color: theme.colors.heading },
  card: {
    backgroundColor: theme.colors.surface, borderRadius: 20, padding: 20, marginBottom: 14,
    ...theme.shadows.premium,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  cardTitle: { flex: 1, fontSize: 16, fontWeight: 'bold', color: theme.colors.heading },
  tag: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginLeft: 8 },
  tagText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  cardMeta: { fontSize: 13, color: theme.colors.textSecondary, marginBottom: 12 },
  cardBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardDeadline: { fontSize: 13, color: theme.colors.error, fontWeight: '500' },
  amountBadge: { backgroundColor: theme.colors.tealCard, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  amountText: { color: theme.colors.primary, fontWeight: 'bold', fontSize: 14 },
  leaderboardCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      padding: 16,
      marginBottom: 20,
      ...theme.shadows.premium
  },
  leaderboardItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.divider
  },
  rankBadge: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: '#FFD700',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12
  },
  rankText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  leaderAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.primaryLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12
  },
  avatarInitial: { color: theme.colors.primary, fontWeight: 'bold' },
  leaderName: { flex: 1, fontSize: 14, color: theme.colors.textPrimary, fontWeight: '500' },
  leaderPoints: { fontSize: 14, fontWeight: 'bold', color: theme.colors.primary },
  viewFullLeaderboard: { paddingVertical: 12, alignItems: 'center' },
  viewFullText: { color: theme.colors.primary, fontSize: 14, fontWeight: 'bold' },
});
