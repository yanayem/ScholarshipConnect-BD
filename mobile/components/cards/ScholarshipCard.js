import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { theme } from '../../theme';

export default function ScholarshipCard({
  item,
  index = 0,
  onPress,
  onBookmark,
  isAdmin = false,
  onApprove,
  onReject,
  onDelete,
  onEdit,
  userProfile = null
}) {
  const getDaysLeft = (deadline) => {
    if (!deadline) return null;
    const target = new Date(deadline);
    if (isNaN(target.getTime())) return null;
    const diff = target - new Date();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const isEligible = () => {
    if (!userProfile?.cgpa || !item.min_cgpa) return true;
    return parseFloat(userProfile.cgpa) >= parseFloat(item.min_cgpa);
  };

  const eligible = isEligible();
  const daysLeft = getDaysLeft(item.deadline);

  return (
    <Animated.View entering={FadeInDown.delay(index * 50)}>
      <TouchableOpacity
        style={[styles.card, !eligible && !isAdmin && styles.ineligibleCard]}
        activeOpacity={0.85}
        onPress={onPress}
      >
        {!eligible && !isAdmin && (
          <View style={styles.ineligibleBadge}>
            <MaterialIcons name="info" size={12} color="#fff" />
            <Text style={styles.ineligibleText}>Low CGPA</Text>
          </View>
        )}

        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
            {item.status !== 'active' && (
              <View style={[styles.statusBadge, {
                backgroundColor: item.status === 'pending' ? theme.colors.warning : theme.colors.error
              }]}>
                <Text style={styles.statusBadgeText}>{item.status.toUpperCase()}</Text>
              </View>
            )}
          </View>

          {!isAdmin && onBookmark && (
            <TouchableOpacity onPress={() => onBookmark(item)} style={styles.bookmarkBtn}>
              <MaterialIcons
                name={item.is_saved ? "bookmark" : "bookmark-outline"}
                size={24}
                color={item.is_saved ? theme.colors.primary : theme.colors.textSecondary}
              />
            </TouchableOpacity>
          )}

          {isAdmin && onDelete && (
            <TouchableOpacity
              onPress={() => onDelete(item.id, item.title)}
              style={styles.deleteBtn}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            >
              <MaterialCommunityIcons name="delete-sweep-outline" size={24} color={theme.colors.error} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.metaRow}>
          <View style={[styles.metaBadge, { backgroundColor: theme.colors.tealCard }]}>
            <MaterialIcons name="place" size={13} color={theme.colors.primary} />
            <Text style={styles.metaText}>{item.country}</Text>
          </View>
          <View style={[styles.metaBadge, { backgroundColor: theme.colors.lavenderCard }]}>
            <MaterialIcons name="school" size={13} color={theme.colors.chartSecondary} />
            <Text style={[styles.metaText, { color: theme.colors.chartSecondary }]}>{item.level}</Text>
          </View>
          <View style={[styles.metaBadge, { backgroundColor: theme.colors.peachCard }]}>
            <MaterialIcons name="work" size={13} color={theme.colors.chartAccent} />
            <Text style={[styles.metaText, { color: theme.colors.chartAccent }]}>{item.field || 'General'}</Text>
          </View>
        </View>

        <View style={styles.cardBottom}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={styles.deadline}>
              <MaterialIcons name="event" size={13} color={theme.colors.error} /> {item.deadline}
            </Text>
          </View>
          <View style={[styles.amountBadge, { marginLeft: 10, flexShrink: 1 }]}>
            <Text style={styles.amountText} numberOfLines={1} ellipsizeMode="tail">
              {item.amount || 'Full Fund'}
            </Text>
          </View>
        </View>

        {/* Progress Bar for Deadline (User only) */}
        {!isAdmin && daysLeft !== null && daysLeft > 0 && (
          <View style={styles.trackerContainer}>
            <View style={styles.trackerHeader}>
              <Text style={styles.trackerText}>Deadline Tracker</Text>
              <Text style={styles.daysLeftText}>{daysLeft} days left</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${Math.min(100, 100 - (daysLeft / 90) * 100)}%`,
                    backgroundColor: daysLeft < 15 ? theme.colors.error : theme.colors.primary
                  }
                ]}
              />
            </View>
          </View>
        )}

        {/* Admin Actions */}
        {isAdmin && (
          <View style={styles.adminActions}>
            {item.status === 'pending' && onApprove && onReject && (
              <View style={styles.approvalRow}>
                <TouchableOpacity
                  style={[styles.btnAction, { backgroundColor: theme.colors.primary }]}
                  onPress={() => onApprove(item.id, 'approve')}
                >
                  <Text style={styles.btnText}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btnAction, { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.error }]}
                  onPress={() => onReject(item.id, 'reject')}
                >
                  <Text style={[styles.btnText, { color: theme.colors.error }]}>Reject</Text>
                </TouchableOpacity>
              </View>
            )}

            {onEdit && (
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => onEdit(item.id)}
              >
                <Text style={styles.editBtnText}>Edit Details</Text>
                <MaterialIcons name="edit" size={16} color={theme.colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        )}

        {!isAdmin && (
          <TouchableOpacity
            style={styles.applyBtn}
            onPress={onPress}
          >
            <Text style={styles.applyText}>View Scholarship</Text>
            <MaterialIcons name="chevron-right" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    ...theme.shadows.soft,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.divider,
  },
  ineligibleCard: { opacity: 0.7, backgroundColor: '#fcfcfc' },
  ineligibleBadge: {
    position: 'absolute', top: 0, right: 0,
    backgroundColor: theme.colors.error,
    paddingHorizontal: 8, paddingVertical: 4,
    borderBottomLeftRadius: 10,
    flexDirection: 'row', alignItems: 'center', gap: 4, zIndex: 1
  },
  ineligibleText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  cardTitle: {
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.heading,
    flex: 1,
    marginRight: 8
  },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4 },
  statusBadgeText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
  bookmarkBtn: { padding: 4 },
  deleteBtn: { padding: 4 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  metaBadge: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, gap: 4,
  },
  metaText: { fontSize: 12, color: theme.colors.primary, fontWeight: '600' },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  deadline: { fontSize: 13, color: theme.colors.error, fontWeight: '500' },
  amountBadge: { backgroundColor: theme.colors.mintCard, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  amountText: { color: theme.colors.success, fontWeight: 'bold', fontSize: 14 },
  trackerContainer: { marginBottom: 20, backgroundColor: '#f9f9f9', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#eee' },
  trackerHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  trackerText: { fontSize: 11, color: theme.colors.textSecondary, fontWeight: '600' },
  daysLeftText: { fontSize: 11, color: theme.colors.error, fontWeight: 'bold' },
  progressBarBg: { height: 6, backgroundColor: '#eee', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 3 },
  applyBtn: {
    backgroundColor: theme.colors.primary, borderRadius: 12, paddingVertical: 14,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8,
    ...theme.shadows.soft,
  },
  applyText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  adminActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
    paddingTop: 16,
  },
  approvalRow: {
    flexDirection: 'row',
    gap: 8,
  },
  btnAction: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    justifyContent: 'center',
  },
  btnText: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.bold,
    color: '#FFF',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  editBtnText: {
    fontSize: 13,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.primary,
  },
});
