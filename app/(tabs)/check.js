import { useState } from 'react';
import {
  View, Text, TextInput, ScrollView,
  TouchableOpacity, StyleSheet, StatusBar,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';

const SCHOLARSHIPS = [
  { id: '1', title: 'MEXT (Japan)', minCGPA: 3.0, level: 'Masters', countries: ['Japan'], fields: ['Any'] },
  { id: '2', title: 'Chevening (UK)', minCGPA: 3.2, level: 'Masters', countries: ['UK'], fields: ['Any'] },
  { id: '3', title: 'DAAD (Germany)', minCGPA: 3.5, level: 'PhD', countries: ['Germany'], fields: ['STEM'] },
  { id: '4', title: 'Erasmus Mundus', minCGPA: 3.0, level: 'Masters', countries: ['Europe'], fields: ['Any'] },
  { id: '5', title: 'Australia Awards', minCGPA: 3.0, level: 'Masters', countries: ['Australia'], fields: ['Any'] },
  { id: '6', title: 'Korean Government (GKS)', minCGPA: 2.8, level: 'Bachelors', countries: ['Korea'], fields: ['Any'] },
  { id: '7', title: 'Fulbright (USA)', minCGPA: 3.5, level: 'Masters', countries: ['USA'], fields: ['Any'] },
  { id: '8', title: 'Chinese Government (CSC)', minCGPA: 3.0, level: 'PhD', countries: ['China'], fields: ['Any'] },
];

export default function CheckScreen() {
  const [cgpa, setCgpa] = useState('');
  const [level, setLevel] = useState('');
  const [field, setField] = useState('');
  const [results, setResults] = useState(null);
  const [checked, setChecked] = useState(false);

  const handleCheck = () => {
    const cgpaNum = parseFloat(cgpa);
    if (!cgpa || isNaN(cgpaNum)) {
      alert('Please enter a valid CGPA');
      return;
    }
    const matched = SCHOLARSHIPS.filter(s => {
      const cgpaOk = cgpaNum >= s.minCGPA;
      const levelOk = !level || s.level.toLowerCase().includes(level.toLowerCase());
      const fieldOk = !field || s.fields.includes('Any') || s.fields.some(f => f.toLowerCase().includes(field.toLowerCase()));
      return cgpaOk && levelOk && fieldOk;
    });
    setResults(matched);
    setChecked(true);
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
        <View style={[styles.banner, { backgroundColor: theme.colors.tealCard }]}>
          <MaterialIcons name="lightbulb_outline" size={24} color={theme.colors.primary} />
          <Text style={styles.bannerText}>
            Enter your details below to find scholarships you are eligible for!
          </Text>
        </View>

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
        {checked && (
          <View style={{ marginTop: 8 }}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>
                {results.length > 0
                  ? `✅ ${results.length} Scholarships Match!`
                  : '❌ No Matches Found'}
              </Text>
              <TouchableOpacity onPress={handleReset}>
                <Text style={styles.resetText}>Reset</Text>
              </TouchableOpacity>
            </View>

            {checked && results.length === 0 && (
              <View style={styles.noMatch}>
                <MaterialIcons name="sentiment-dissatisfied" size={48} color={theme.colors.placeholder} />
                <Text style={styles.noMatchText}>
                  Try improving your CGPA or adjusting your preferences.
                </Text>
              </View>
            )}

            {results.map(item => (
              <View key={item.id} style={[styles.resultCard, { backgroundColor: theme.colors.mintCard }]}>
                <View style={styles.resultTop}>
                  <MaterialIcons name="check-circle" size={20} color={theme.colors.success} />
                  <Text style={styles.resultName}>{item.title}</Text>
                </View>
                <View style={styles.resultMeta}>
                  <Text style={styles.resultTag}>{item.level}</Text>
                  <Text style={styles.resultTag}>Min CGPA: {item.minCGPA}</Text>
                </View>
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
    borderRadius: 16, padding: 16, marginBottom: 24, gap: 12,
  },
  bannerText: { flex: 1, fontSize: 14, color: theme.colors.primaryDark, lineHeight: 22, fontWeight: '500' },
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
  resultMeta: { flexDirection: 'row', gap: 8 },
  resultTag: {
    backgroundColor: 'rgba(255,255,255,0.6)', color: theme.colors.textSecondary, fontSize: 12,
    fontWeight: '600', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4,
  },
});
