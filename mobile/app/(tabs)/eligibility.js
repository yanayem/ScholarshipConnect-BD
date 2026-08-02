/**
 * ELIGIBILITY CHECKER: Matches user profile with scholarships.
 * - Free Tier: Basic filtering by CGPA, Level, Field.
 * - Pro Tier: AI Smart Matchmaker per scholarship.
 */
import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, ScrollView,
  TouchableOpacity, StyleSheet, StatusBar, ActivityIndicator, Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { apiService } from '../../services/api';
import { useRouter } from 'expo-router';

export default function CheckScreen() {
  const [cgpa, setCgpa] = useState('');
  const [level, setLevel] = useState('');
  const [field, setField] = useState('');
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState(null);
  const [checked, setChecked] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [aiLoadingId, setAiLoadingId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await apiService.getScholarships();
        if (res.ok) {
          setScholarships(res.data);
        }

        const profileRes = await apiService.getProfile();
        if (profileRes.ok) {
          const p = profileRes.data;
          setIsPro(p.is_pro || false);
          if (p.cgpa) setCgpa(p.cgpa.toString());
          if (p.academic_level) setLevel(p.academic_level);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleCheck = () => {
    const cgpaNum = parseFloat(cgpa);
    if (!cgpa || isNaN(cgpaNum)) {
      alert('Please enter a valid CGPA');
      return;
    }

    const matched = scholarships.filter(s => {
      const minCGPA = parseFloat(s.eligibility?.match(/CGPA\s*[:>=]?\s*(\d+(\.\d+)?)/i)?.[1] || '0');
      const cgpaOk = cgpaNum >= minCGPA;
      const levelOk = !level || (s.level || '').toLowerCase().includes(level.toLowerCase());
      const fieldOk = !field || (s.field || '').toLowerCase().includes(field.toLowerCase());
      return cgpaOk && levelOk && fieldOk;
    });

    setResults(matched);
    setChecked(true);
  };

  const handleAiMatch = async (scholarshipId) => {
    setAiLoadingId(scholarshipId);
    const res = await apiService.aiCheckEligibility(scholarshipId);
    setAiLoadingId(null);
    if (res.ok) {
      Alert.alert("AI Match Result", res.data.analysis || res.data.result || "Match analysis complete.");
    } else {
      Alert.alert("Error", res.data?.error || "Failed to get AI match.");
    }
  };

  const handleReset = () => {
    setCgpa(''); setLevel(''); setField('');
    setResults(null); setChecked(false);
  };

  return (
    <View style={styles.root}>
      <StatusBar backgroundColor={theme.colors.background} barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Info Banner */}
        <View style={[styles.banner, { backgroundColor: isPro ? '#F0E7FF' : theme.colors.tealCard }]}>
          <MaterialIcons name={isPro ? "workspace-premium" : "lightbulb"} size={24} color={isPro ? "#7C3AED" : theme.colors.primary} />
          <Text style={[styles.bannerText, isPro && { color: '#7C3AED' }]}>
            {isPro 
              ? "ScholarConnect Pro: Advanced AI Eligibility Matching is enabled." 
              : "Enter your details below to find scholarships you are eligible for!"}
          </Text>
        </View>

        {!isPro && (
          <TouchableOpacity style={styles.upgradeBanner} onPress={() => router.push('/settings')}>
            <MaterialIcons name="diamond" size={20} color="#fff" />
            <Text style={styles.upgradeText}>Upgrade to Pro for AI Match Analysis!</Text>
          </TouchableOpacity>
        )}

        {/* Input Form */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Your Information</Text>

          <Text style={styles.label}>CGPA (out of 4.0)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 3.5"
            placeholderTextColor={theme.colors.placeholder}
            keyboardType="decimal-pad"
            value={cgpa}
            onChangeText={setCgpa}
          />

          <Text style={styles.label}>Desired Study Level</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Masters, PhD, Bachelors"
            placeholderTextColor={theme.colors.placeholder}
            value={level}
            onChangeText={setLevel}
          />

          <Text style={styles.label}>Field of Study (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Engineering, Business, Any"
            placeholderTextColor={theme.colors.placeholder}
            value={field}
            onChangeText={setField}
          />

          <TouchableOpacity style={styles.checkBtn} onPress={handleCheck} activeOpacity={0.85}>
            <MaterialIcons name="check-circle" size={20} color="#fff" />
            <Text style={styles.checkBtnText}>Check Eligibility</Text>
          </TouchableOpacity>
        </View>

        {/* Results */}
        {loading && <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 20 }} />}

        {checked && results && (
          <View style={{ marginTop: 8 }}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>
                {results.length > 0
                  ? `${results.length} Scholarships Match!`
                  : 'No Matches Found'}
              </Text>
              <TouchableOpacity onPress={handleReset}>
                <Text style={styles.resetText}>Reset</Text>
              </TouchableOpacity>
            </View>

            {results.length === 0 && (
              <View style={styles.noMatch}>
                <MaterialIcons name="sentiment-dissatisfied" size={48} color={theme.colors.placeholder} />
                <Text style={styles.noMatchText}>
                  Try improving your CGPA or adjusting your preferences.
                </Text>
              </View>
            )}

            {results.map(item => (
              <View key={item.id} style={[styles.resultCard, { backgroundColor: theme.colors.mintCard }]}>
                <TouchableOpacity onPress={() => router.push(`/scholarships/${item.id}`)}>
                  <View style={styles.resultTop}>
                    <MaterialIcons name="check-circle" size={20} color={theme.colors.success} />
                    <Text style={styles.resultName}>{item.title}</Text>
                  </View>
                  <View style={styles.resultMeta}>
                    <Text style={styles.resultTag}>{item.level}</Text>
                    <Text style={styles.resultTag}>{item.country}</Text>
                  </View>
                </TouchableOpacity>

                {isPro && (
                  <TouchableOpacity 
                    style={styles.aiMatchBtn} 
                    onPress={() => handleAiMatch(item.id)}
                    disabled={aiLoadingId === item.id}
                  >
                    {aiLoadingId === item.id ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <MaterialIcons name="auto-fix-high" size={16} color="#fff" />
                        <Text style={styles.aiMatchBtnText}>AI Analyze Match</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { padding: 20 },
  banner: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 16, padding: 16, marginBottom: 12, gap: 12,
  },
  bannerText: { flex: 1, fontSize: 14, color: theme.colors.primaryDark, lineHeight: 22, fontWeight: '500' },
  upgradeBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#7C3AED', padding: 12, borderRadius: 12, marginBottom: 24,
  },
  upgradeText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  formCard: {
    backgroundColor: theme.colors.surface, borderRadius: 24, padding: 24, marginBottom: 24,
    ...theme.shadows.premium,
  },
  formTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.heading, marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '700', color: theme.colors.textSecondary, marginBottom: 8 },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14, fontSize: 15,
    color: theme.colors.textPrimary, backgroundColor: theme.colors.secondaryBackground, marginBottom: 20,
  },
  checkBtn: {
    backgroundColor: theme.colors.primary, borderRadius: 14, paddingVertical: 16,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 4,
  },
  checkBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  resultTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.heading },
  resetText: { fontSize: 14, color: theme.colors.error, fontWeight: '600' },
  noMatch: { alignItems: 'center', paddingVertical: 30 },
  noMatchText: { fontSize: 14, color: theme.colors.textSecondary, marginTop: 12, textAlign: 'center' },
  resultCard: {
    borderRadius: 16, padding: 16, marginBottom: 12,
    borderLeftWidth: 4, borderLeftColor: theme.colors.success,
  },
  resultTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  resultName: { fontSize: 14, fontWeight: '700', color: theme.colors.heading, flex: 1 },
  resultMeta: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  resultTag: {
    backgroundColor: 'rgba(255,255,255,0.6)', color: theme.colors.textSecondary, fontSize: 12,
    fontWeight: '600', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4,
  },
  aiMatchBtn: {
    backgroundColor: '#7C3AED', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10, borderRadius: 10, marginTop: 4
  },
  aiMatchBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 }
});
