import { useState } from 'react';
import {
  View, Text, ScrollView,
  TouchableOpacity, StyleSheet, StatusBar,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const STATUS_CONFIG = {
  Saved:        { color: '#7A746E', bg: '#FCFAF7', icon: 'bookmark' },
  Applied:      { color: '#C97352', bg: '#E3F2FD', icon: 'send' },
  'Under Review': { color: '#E65100', bg: '#FFF3E0', icon: 'hourglass-top' },
  Accepted:     { color: '#2E7D32', bg: '#E8F5E9', icon: 'check-circle' },
  Rejected:     { color: '#C62828', bg: '#FFEBEE', icon: 'cancel' },
};

const INITIAL = [
  { id: '1', title: 'MEXT (Japan)', country: '🇯🇵 Japan', level: 'Masters', deadline: 'May 2025', status: 'Accepted' },
  { id: '2', title: 'Chevening (UK)', country: '🇬🇧 UK', level: 'Masters', deadline: 'Nov 2025', status: 'Under Review' },
  { id: '3', title: 'DAAD (Germany)', country: '🇩🇪 Germany', level: 'PhD', deadline: 'Oct 2025', status: 'Applied' },
  { id: '4', title: 'Erasmus Mundus', country: '🇪🇺 Europe', level: 'Masters', deadline: 'Jan 2026', status: 'Saved' },
  { id: '5', title: 'Fulbright (USA)', country: '🇺🇸 USA', level: 'Masters', deadline: 'Jun 2025', status: 'Rejected' },
];

const TABS = ['All', 'Saved', 'Applied', 'Under Review', 'Accepted', 'Rejected'];

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

  return (
    <View style={styles.root}>
      <StatusBar backgroundColor="#C97352" barStyle="light-content" />

      {/* Status Filter Tabs */}
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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {filtered.length === 0 ? (
          <View style={styles.emptyBox}>
            <MaterialIcons name="inbox" size={56} color="#7A746E" />
            <Text style={styles.emptyTitle}>No applications here</Text>
            <Text style={styles.emptyText}>
              {activeTab === 'Saved'
                ? 'Save scholarships to apply later.'
                : `No applications with status "${activeTab}".`}
            </Text>
          </View>
        ) : (
          filtered.map(item => {
            const cfg = STATUS_CONFIG[item.status];
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
                  <MaterialIcons name="place" size={14} color="#7A746E" />
                  <Text style={styles.metaText}>{item.country}</Text>
                  <MaterialIcons name="school" size={14} color="#7A746E" style={{ marginLeft: 10 }} />
                  <Text style={styles.metaText}>{item.level}</Text>
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.deadline}>
                    <MaterialIcons name="event" size={13} color="#E53935" /> Deadline: {item.deadline}
                  </Text>
                  <TouchableOpacity style={styles.detailBtn}>
                    <Text style={styles.detailBtnText}>Details</Text>
                  </TouchableOpacity>
                </View>

                {/* Progress Indicator */}
                <View style={styles.progressRow}>
                  {['Saved', 'Applied', 'Under Review', 'Accepted'].map((s, i) => {
                    const steps = ['Saved', 'Applied', 'Under Review', 'Accepted'];
                    const currentIdx = steps.indexOf(item.status);
                    const isActive = i <= currentIdx && item.status !== 'Rejected';
                    return (
                      <View key={s} style={styles.progressStep}>
                        <View style={[styles.progressDot, isActive && styles.progressDotActive]} />
                        {i < 3 && <View style={[styles.progressLine, isActive && i < currentIdx && styles.progressLineActive]} />}
                        <Text style={[styles.progressLabel, isActive && styles.progressLabelActive]}>
                          {s === 'Under Review' ? 'Review' : s}
                        </Text>
                      </View>
                    );
                  })}
                </View>
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
  root: { flex: 1, backgroundColor: '#F4F6FA' },
  tabRow: {
    backgroundColor: '#fff', paddingVertical: 10, paddingHorizontal: 12,
    elevation: 2, flexGrow: 0,
  },
  tabChip: {
    borderWidth: 1.5, borderColor: '#ECE7E1', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 7, marginRight: 8, backgroundColor: '#fff',
  },
  tabChipActive: { backgroundColor: '#C97352', borderColor: '#C97352' },
  tabChipText: { fontSize: 13, color: '#7A746E', fontWeight: '600' },
  tabChipTextActive: { color: '#fff' },
  scroll: { padding: 16 },
  emptyBox: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 17, fontWeight: 'bold', color: '#7A746E', marginTop: 14 },
  emptyText: { fontSize: 14, color: '#7A746E', marginTop: 8, textAlign: 'center', paddingHorizontal: 30 },
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 14,
    elevation: 3, shadowColor: '#2D2A26', shadowOpacity: 0.07, shadowRadius: 6,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 },
  cardTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: '#C97352', marginRight: 10 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 5, gap: 4,
  },
  statusText: { fontSize: 12, fontWeight: '700' },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  metaText: { fontSize: 13, color: '#7A746E', marginLeft: 4 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  deadline: { fontSize: 13, color: '#E53935' },
  detailBtn: { borderWidth: 1.5, borderColor: '#C97352', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 6 },
  detailBtnText: { color: '#C97352', fontWeight: '700', fontSize: 13 },
  progressRow: { flexDirection: 'row', alignItems: 'center' },
  progressStep: { flex: 1, alignItems: 'center', position: 'relative' },
  progressDot: {
    width: 12, height: 12, borderRadius: 6, backgroundColor: '#ECE7E1', marginBottom: 4,
  },
  progressDotActive: { backgroundColor: '#C97352' },
  progressLine: {
    position: 'absolute', top: 5, left: '50%', right: '-50%', height: 2, backgroundColor: '#ECE7E1',
  },
  progressLineActive: { backgroundColor: '#C97352' },
  progressLabel: { fontSize: 10, color: '#7A746E', textAlign: 'center' },
  progressLabelActive: { color: '#C97352', fontWeight: '700' },
});
