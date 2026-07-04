import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, Alert
} from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';

const INITIAL_DOCS = [
  { id: '1', name: 'Resume_2024.pdf', type: 'CV/Resume', size: '1.2 MB', date: 'Oct 12, 2024' },
  { id: '2', name: 'Undergrad_Transcript.pdf', type: 'Transcript', size: '2.5 MB', date: 'Oct 15, 2024' },
  { id: '3', name: 'Passport_Scan.jpg', type: 'ID Proof', size: '800 KB', date: 'Nov 02, 2024' },
];

export default function DocumentManagement() {
  const [docs, setDocs] = useState(INITIAL_DOCS);

  const handleDelete = (id, name) => {
    Alert.alert(
      'Delete Document',
      `Are you sure you want to delete ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setDocs(docs.filter(d => d.id !== id))
        }
      ]
    );
  };

  const handleUpload = () => {
    Alert.alert('Upload', 'File picker would open here in a real device.');
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/profile')}
          style={styles.backBtn}
        >
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.heading} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Document Vault</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.uploadBanner, { backgroundColor: theme.colors.primaryLight }]}>
          <MaterialIcons name="cloud-upload" size={40} color={theme.colors.primary} />
          <Text style={styles.uploadTitle}>Upload New Document</Text>
          <Text style={styles.uploadSub}>PDF, JPG or PNG (Max 5MB)</Text>
          <TouchableOpacity style={styles.uploadActionBtn} onPress={handleUpload}>
            <Text style={styles.uploadActionText}>Select File</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Documents ({docs.length})</Text>
          <MaterialIcons name="filter-list" size={20} color={theme.colors.textSecondary} />
        </View>

        {docs.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="folder-open" size={60} color={theme.colors.placeholder} />
            <Text style={styles.emptyText}>No documents uploaded yet.</Text>
          </View>
        ) : (
          docs.map(doc => (
            <View key={doc.id} style={styles.docCard}>
              <View style={[styles.docIconWrap, {backgroundColor: theme.colors.secondaryBackground}]}>
                <MaterialIcons
                  name={doc.name.endsWith('.pdf') ? 'picture-as-pdf' : 'insert-photo'}
                  size={28}
                  color={doc.name.endsWith('.pdf') ? theme.colors.error : theme.colors.primary}
                />
              </View>

              <View style={styles.docInfo}>
                <Text style={styles.docName} numberOfLines={1}>{doc.name}</Text>
                <Text style={styles.docMeta}>{doc.type} • {doc.size}</Text>
                <Text style={styles.docDate}>Uploaded on {doc.date}</Text>
              </View>

              <View style={styles.docActions}>
                <TouchableOpacity style={styles.actionIcon} onPress={() => Alert.alert('View', 'Opening document...')}>
                  <MaterialIcons name="visibility" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionIcon} onPress={() => handleDelete(doc.id, doc.name)}>
                  <MaterialIcons name="delete-outline" size={20} color={theme.colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        <View style={[styles.infoTip, { backgroundColor: theme.colors.yellowCard }]}>
          <MaterialIcons name="info-outline" size={18} color={theme.colors.warning} />
          <Text style={styles.infoTipText}>
            Documents uploaded here can be easily attached when applying for scholarships.
          </Text>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    height: 100, backgroundColor: theme.colors.background,
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 40, paddingHorizontal: 20, gap: 12,
  },
  headerTitle: { color: theme.colors.heading, fontSize: 18, fontWeight: 'bold' },
  backBtn: { padding: 4 },
  scroll: { padding: 20 },
  uploadBanner: {
    borderRadius: 24, padding: 32,
    alignItems: 'center', marginBottom: 32
  },
  uploadTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.heading, marginTop: 16 },
  uploadSub: { fontSize: 14, color: theme.colors.textSecondary, marginTop: 6, marginBottom: 20 },
  uploadActionBtn: {
    backgroundColor: theme.colors.primary, paddingHorizontal: 28, paddingVertical: 12,
    borderRadius: 12, ...theme.shadows.soft
  },
  uploadActionText: { color: '#fff', fontWeight: 'bold' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingHorizontal: 4 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.heading },
  docCard: {
    backgroundColor: theme.colors.surface, borderRadius: 20, padding: 16,
    flexDirection: 'row', alignItems: 'center', marginBottom: 14,
    ...theme.shadows.soft
  },
  docIconWrap: {
    width: 52, height: 52, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', marginRight: 16
  },
  docInfo: { flex: 1 },
  docName: { fontSize: 15, fontWeight: '700', color: theme.colors.heading },
  docMeta: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 4 },
  docDate: { fontSize: 11, color: theme.colors.placeholder, marginTop: 4 },
  docActions: { flexDirection: 'row', gap: 10 },
  actionIcon: { padding: 10, borderRadius: 12, backgroundColor: theme.colors.secondaryBackground },
  emptyState: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { fontSize: 15, color: theme.colors.placeholder, marginTop: 12 },
  infoTip: {
    flexDirection: 'row',
    padding: 16, borderRadius: 16, marginTop: 16, gap: 12, alignItems: 'center',
  },
  infoTipText: { flex: 1, fontSize: 13, color: theme.colors.textSecondary, lineHeight: 20 }
});
