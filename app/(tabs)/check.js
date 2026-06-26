import { useState } from 'react';
import {
  View, Text, TextInput, ScrollView,
  TouchableOpacity, StyleSheet, StatusBar,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

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
      <StatusBar backgroundColor="#C97352" barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Info Banner */}
        <View style={styles.banner}>
          <MaterialIcons name="tips-and-updates" size={24} color="#C97352" />
          <Text style={styles.bannerText}>
            Enter your details below to find scholarships you are eligible for!
          </Text>
        </View>

        {/* Input Form */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>📋 Your Information</Text>

          <Text style={styles.label}>CGPA (out of 4.0)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 3.5"
            placeholderTextColor="#7A746E"
            keyboardType="decimal-pad"
            value={cgpa}
            onChangeText={setCgpa}
          />

          <Text style={styles.label}>Desired Study Level</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Masters, PhD, Bachelors"
            placeholderTextColor="#7A746E"
            value={level}
            onChangeText={setLevel}
          />

          <Text style={styles.label}>Field of Study (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Engineering, Business, Any"
            placeholderTextColor="#7A746E"
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
          <View style={{ marginTop: 4 }}>
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
                <MaterialIcons name="sentiment-dissatisfied" size={48} color="#7A746E" />
                <Text style={styles.noMatchText}>
                  Try improving your CGPA or adjusting your preferences.
                </Text>
              </View>
            )}

            {results.map(item => (
              <View key={item.id} style={styles.resultCard}>
                <View style={styles.resultTop}>
                  <MaterialIcons name="check-circle" size={20} color="#2E7D32" />
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
  root: { flex: 1, backgroundColor: '#F4F6FA' },
  scroll: { padding: 16 },
  banner: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#E3F2FD',
    borderRadius: 12, padding: 14, marginBottom: 16, gap: 10,
  },
  bannerText: { flex: 1, fontSize: 14, color: '#C97352', lineHeight: 20 },
  formCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 18, marginBottom: 16,
    elevation: 3, shadowColor: '#2D2A26', shadowOpacity: 0.07, shadowRadius: 6,
  },
  formTitle: { fontSize: 16, fontWeight: 'bold', color: '#C97352', marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '700', color: '#7A746E', marginBottom: 6 },
  input: {
    borderWidth: 1.5, borderColor: '#ECE7E1', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15,
    color: '#2D2A26', backgroundColor: '#FCFAF7', marginBottom: 16,
  },
  checkBtn: {
    backgroundColor: '#C97352', borderRadius: 12, paddingVertical: 14,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 4,
  },
  checkBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  resultTitle: { fontSize: 16, fontWeight: 'bold', color: '#C97352' },
  resetText: { fontSize: 14, color: '#E53935', fontWeight: '600' },
  noMatch: { alignItems: 'center', paddingVertical: 30 },
  noMatchText: { fontSize: 14, color: '#7A746E', marginTop: 12, textAlign: 'center' },
  resultCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10,
    borderLeftWidth: 4, borderLeftColor: '#2E7D32',
    elevation: 2, shadowColor: '#2D2A26', shadowOpacity: 0.05, shadowRadius: 4,
  },
  resultTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  resultName: { fontSize: 14, fontWeight: '700', color: '#C97352', flex: 1 },
  resultMeta: { flexDirection: 'row', gap: 8 },
  resultTag: {
    backgroundColor: '#E8F5E9', color: '#2E7D32', fontSize: 12,
    fontWeight: '600', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3,
  },
});
