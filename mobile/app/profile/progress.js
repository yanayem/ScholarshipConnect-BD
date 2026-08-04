import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withTiming, withDelay } from 'react-native-reanimated';
import { theme } from '../../theme';
import { apiService } from '../../services/api';

const { width } = Dimensions.get('window');

const ProgressBar = ({ label, value, max, color, index }) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  const animatedWidth = useSharedValue(0);

  useEffect(() => {
    animatedWidth.value = withDelay(index * 200, withTiming(percentage, { duration: 1000 }));
  }, [percentage]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value}%`,
  }));

  return (
    <View style={styles.barContainer}>
      <View style={styles.barHeader}>
        <Text style={styles.barLabel}>{label}</Text>
        <Text style={styles.barValue}>{value}{max === 100 ? '%' : ''}</Text>
      </View>
      <View style={styles.barTrack}>
        <Animated.View style={[styles.barFill, { backgroundColor: color }, animatedStyle]} />
      </View>
    </View>
  );
};

export default function ProgressScreen() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const res = await apiService.getStudentAnalytics();
      if (res.ok) {
        setAnalytics(res.data);
      }
      setLoading(false);
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.heading} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Progress</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View entering={FadeInDown.duration(600)} style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Scholarship Readiness</Text>
          <Text style={styles.summarySub}>Based on your applications and document status</Text>

          <View style={styles.mainProgressContainer}>
             <View style={styles.circularProgressPlaceholder}>
                <Text style={styles.readinessText}>{analytics?.success_rate || 0}%</Text>
                <Text style={styles.readinessLabel}>Success Rate</Text>
             </View>
          </View>
        </Animated.View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Performance Indicators</Text>
          <ProgressBar
            label="Applications Submitted"
            value={analytics?.applications_submitted || 0}
            max={20}
            color={theme.colors.primary}
            index={0}
          />
          <ProgressBar
            label="Scholarships Saved"
            value={analytics?.saved_scholarships || 0}
            max={50}
            color={theme.colors.warning}
            index={1}
          />
          <ProgressBar
            label="Deadlines (Next 30 Days)"
            value={analytics?.deadlines_this_month || 0}
            max={10}
            color={theme.colors.error}
            index={2}
          />
          <ProgressBar
            label="Success Probability"
            value={analytics?.success_rate || 0}
            max={100}
            color={theme.colors.success}
            index={3}
          />
        </View>

        <View style={styles.docSection}>
           <Text style={styles.sectionTitle}>Document Health</Text>
           {analytics?.missing_documents.length === 0 ? (
             <View style={styles.successDocBox}>
               <MaterialIcons name="check-circle" size={24} color={theme.colors.success} />
               <Text style={styles.successDocText}>All standard documents are ready in your Vault!</Text>
             </View>
           ) : (
             <View style={styles.warningDocBox}>
                <MaterialIcons name="warning" size={24} color={theme.colors.warning} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.warningDocTitle}>Pending Documents</Text>
                  <Text style={styles.warningDocText}>
                    Please upload: {analytics?.missing_documents.join(', ')}
                  </Text>
                </View>
                <TouchableOpacity style={styles.fixBtn} onPress={() => router.push('/documents')}>
                   <Text style={styles.fixBtnText}>Fix</Text>
                </TouchableOpacity>
             </View>
           )}
        </View>

        <View style={styles.tipsSection}>
           <Text style={styles.sectionTitle}>Scholarship Insights</Text>
           <View style={styles.tipCard}>
              <MaterialIcons name="lightbulb" size={24} color={theme.colors.primary} />
              <Text style={styles.tipText}>
                Students with a completed &quot;Vault&quot; are 3x more likely to submit applications before deadlines.
              </Text>
           </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.heading, marginLeft: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 20 },
  summaryCard: {
    backgroundColor: theme.colors.primary,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    ...theme.shadows.premium
  },
  summaryTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  summarySub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  mainProgressContainer: { marginTop: 20 },
  circularProgressPlaceholder: {
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 8, borderColor: '#fff',
    alignItems: 'center', justifyContent: 'center'
  },
  readinessText: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  readinessLabel: { fontSize: 10, color: '#fff', textTransform: 'uppercase', marginTop: 4 },
  section: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    ...theme.shadows.soft
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.heading, marginBottom: 20 },
  barContainer: { marginBottom: 20 },
  barHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  barLabel: { fontSize: 13, color: theme.colors.textSecondary, fontWeight: '500' },
  barValue: { fontSize: 13, fontWeight: 'bold', color: theme.colors.heading },
  barTrack: { height: 8, backgroundColor: theme.colors.divider, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  docSection: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    ...theme.shadows.soft
  },
  successDocBox: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  successDocText: { flex: 1, fontSize: 14, color: theme.colors.success, fontWeight: '500' },
  warningDocBox: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  warningDocTitle: { fontSize: 14, fontWeight: 'bold', color: theme.colors.heading },
  warningDocText: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
  fixBtn: { backgroundColor: theme.colors.warning, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  fixBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  tipsSection: { marginBottom: 40 },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primaryLight,
    padding: 20,
    borderRadius: 20,
    gap: 15,
    alignItems: 'center'
  },
  tipText: { flex: 1, fontSize: 13, color: theme.colors.primaryDark, lineHeight: 20, fontWeight: '500' }
});
