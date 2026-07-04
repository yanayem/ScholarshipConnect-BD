import { useState } from 'react';
import {
  View, Text, ScrollView,
  TouchableOpacity, StyleSheet, StatusBar,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';

const STATUS_CONFIG = {
  Saved:        { color: theme.colors.textSecondary, bg: theme.colors.secondaryBackground, icon: 'bookmark-outline' },
  Preparing:    { color: theme.colors.warning, bg: theme.colors.yellowCard, icon: 'edit' },
  Submitted:    { color: theme.colors.info, bg: 'rgba(106, 169, 255, 0.1)', icon: 'send' },
  'Under Review': { color: '#8E44AD', bg: theme.colors.lavenderCard, icon: 'hourglass-empty' },
  Shortlisted:  { color: theme.colors.primary, bg: theme.colors.tealCard, icon: 'stars' },
  Accepted:     { color: theme.colors.success, bg: theme.colors.mintCard, icon: 'check-circle' },
  Rejected:     { color: theme.colors.error, bg: 'rgba(232, 93, 117, 0.1)', icon: 'cancel' },
};

const INITIAL = [
  { id: '1', title: 'MEXT (Japan)', country: '🇯🇵 Japan', level: 'Masters', deadline: 'May 2025', status: 'Accepted' },
  { id: '2', title: 'Chevening (UK)', country: '🇬🇧 UK', level: 'Masters', deadline: 'Nov 2025', status: 'Under Review' },
  { id: '3', title: 'DAAD (Germany)', country: '🇩🇪 Germany', level: 'PhD', deadline: 'Oct 2025', status: 'Submitted' },
  { id: '4', title: 'Erasmus Mundus', country: '🇪🇺 Europe', level: 'Masters', deadline: 'Jan 2026', status: 'Preparing' },
  { id: '5', title: 'Fulbright (USA)', country: '🇺🇸 USA', level: 'Masters', deadline: 'Jun 2025', status: 'Shortlisted' },
  { id: '6', title: 'Stipendium Hungaricum', country: '🇭🇺 Hungary', level: 'Bachelors', deadline: 'Jan 2025', status: 'Saved' },
];

const TABS = ['All', 'Saved', 'Preparing', 'Submitted', 'Under Review', 'Shortlisted', 'Accepted', 'Rejected'];

export default function ApplicationsScreen() {
  const [activeTab, setActiveTab] = useState('All');
  const [applications, setApplications] = useState(INITIAL);

  const filtered = activeTab === 'All'
    ? applications
    : applications.filter(a => a.status === activeTab);

  const counts = {};
  TABS.forEach(t => {
    counts[t] = t === 'All'
      ? applications.length
      : applications.filter(a => a.status === t).length;
  });

  const STEPS = ['Saved', 'Preparing', 'Submitted', 'Under Review', 'Shortlisted', 'Accepted'];

  return (
    <View style={styles.root}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />

      {/* Status Filter Tabs */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabRow}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tabChip, activeTab === tab && styles.tabChipActive]}
            >
              <Text style={[styles.tabChipText, activeTab === tab && styles.tabChipTextActive]}>
                {tab} {counts[tab] > 0 ? `(${counts[tab]})` : ''}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {filtered.length === 0 ? (
          <View style={styles.emptyBox}>
            <MaterialIcons name="inbox" size={56} color={theme.colors.placeholder} />
            <Text style={styles.emptyTitle}>No applications here</Text>
            <Text style={styles.emptyText}>
              {activeTab === 'Saved'
                ? 'Save scholarships to apply later.'
                : `No applications found for status "${activeTab}".`}
            </Text>
          </View>
        ) : (
          filtered.map(item => {
            const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.Saved;
            return (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                    <MaterialIcons name={cfg.icon} size={14} color={cfg.color} />
                    <Text style={[styles.statusText, { color: cfg.color }]}>{item.status}</Text>
                  </View>
                </View>

                <View style={styles.metaRow}>
                  <MaterialIcons name="place" size={14} color={theme.colors.textSecondary} />
                  <Text style={styles.metaText}>{item.country}</Text>
                  <MaterialIcons name="school" size={14} color={theme.colors.textSecondary} style={{ marginLeft: 12 }} />
                  <Text style={styles.metaText}>{item.level}</Text>
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.deadline}>
                    <MaterialIcons name="event" size={13} color={theme.colors.error} /> {item.deadline}
                  </Text>
                  <TouchableOpacity style={styles.detailBtn}>
                    <Text style={styles.detailBtnText}>Update Status</Text>
                  </TouchableOpacity>
                </View>

                {/* Progress Indicator */}
                {item.status !== 'Rejected' && (
                  <View style={styles.progressRow}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 10 }}>
                      {STEPS.map((s, i) => {
                        const currentIdx = STEPS.indexOf(item.status);
                        const isActive = i <= currentIdx;
                        return (
                          <View key={s} style={styles.progressStep}>
                            <View style={styles.dotRow}>
                              <View style={[styles.progressDot, isActive && styles.progressDotActive]} />
                              {i < STEPS.length - 1 && <View style={[styles.progressLine, i < currentIdx && styles.progressLineActive]} />}
                            </View>
                            <Text style={[styles.progressLabel, isActive && styles.progressLabelActive]}>
                              {s === 'Under Review' ? 'Review' : s}
                            </Text>
                          </View>
                        );
                      })}
                    </ScrollView>
                  </View>
                )}
              </View>
            );
          })
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background },
  tabContainer: { backgroundColor: '#fff' },
  tabRow: {
    paddingVertical: 14, paddingHorizontal: 16,
  },
  tabChip: {
    borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 8, marginRight: 8, backgroundColor: theme.colors.surface,
  },
  tabChipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  tabChipText: { fontSize: 13, color: theme.colors.textSecondary, fontWeight: '600' },
  tabChipTextActive: { color: '#fff' },
  scroll: { padding: 20 },
  emptyBox: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 17, fontWeight: 'bold', color: theme.colors.heading, marginTop: 14 },
  emptyText: { fontSize: 14, color: theme.colors.textSecondary, marginTop: 8, textAlign: 'center', paddingHorizontal: 30 },
  card: {
    backgroundColor: theme.colors.surface, borderRadius: 24, padding: 20, marginBottom: 16,
    ...theme.shadows.premium,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 },
  cardTitle: { flex: 1, fontSize: 16, fontWeight: 'bold', color: theme.colors.heading, marginRight: 10 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5, gap: 4,
  },
  statusText: { fontSize: 12, fontWeight: '700' },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  metaText: { fontSize: 13, color: theme.colors.textSecondary, marginLeft: 4 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  deadline: { fontSize: 13, color: theme.colors.error, fontWeight: '500' },
  detailBtn: { borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: theme.colors.primaryLight },
  detailBtnText: { color: theme.colors.primary, fontWeight: '700', fontSize: 13 },
  progressRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, borderTopWidth: 1, borderTopColor: theme.colors.divider, paddingTop: 15 },
  progressStep: { width: 80, alignItems: 'center' },
  dotRow: { flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'center', marginBottom: 6 },
  progressDot: {
    width: 10, height: 10, borderRadius: 5, backgroundColor: theme.colors.divider, zIndex: 2,
  },
  progressDotActive: { backgroundColor: theme.colors.primary },
  progressLine: {
    position: 'absolute', top: 4, left: '50%', right: '-50%', height: 2, backgroundColor: theme.colors.divider, zIndex: 1,
  },
  progressLineActive: { backgroundColor: theme.colors.primary },
  progressLabel: { fontSize: 10, color: theme.colors.textSecondary, textAlign: 'center' },
  progressLabelActive: { color: theme.colors.primary, fontWeight: '700' },
});
