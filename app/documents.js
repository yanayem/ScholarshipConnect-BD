import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, Alert
} from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

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
      <StatusBar barStyle="light-content" backgroundColor="#1565C0" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Document Management</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.uploadBanner}>
          <MaterialIcons name="cloud-upload" size={40} color="#1565C0" />
          <Text style={styles.uploadTitle}>Upload New Document</Text>
          <Text style={styles.uploadSub}>PDF, JPG or PNG (Max 5MB)</Text>
          <TouchableOpacity style={styles.uploadActionBtn} onPress={handleUpload}>
            <Text style={styles.uploadActionText}>Select File</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Documents ({docs.length})</Text>
          <MaterialIcons name="filter-list" size={20} color="#607D8B" />
        </View>

        {docs.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="folder-open" size={60} color="#B0BEC5" />
            <Text style={styles.emptyText}>No documents uploaded yet.</Text>
          </View>
        ) : (
          docs.map(doc => (
            <View key={doc.id} style={styles.docCard}>
              <View style={styles.docIconWrap}>
                <MaterialIcons
                  name={doc.name.endsWith('.pdf') ? 'picture-as-pdf' : 'insert-photo'}
                  size={28}
                  color={doc.name.endsWith('.pdf') ? '#E53935' : '#1565C0'}
                />
              </View>

              <View style={styles.docInfo}>
                <Text style={styles.docName} numberOfLines={1}>{doc.name}</Text>
                <Text style={styles.docMeta}>{doc.type} • {doc.size}</Text>
                <Text style={styles.docDate}>Uploaded on {doc.date}</Text>
              </View>

              <View style={styles.docActions}>
                <TouchableOpacity style={styles.actionIcon} onPress={() => Alert.alert('View', 'Opening document...')}>
                  <MaterialIcons name="visibility" size={20} color="#607D8B" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionIcon} onPress={() => handleDelete(doc.id, doc.name)}>
                  <MaterialIcons name="delete-outline" size={20} color="#E53935" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        <View style={styles.infoTip}>
          <MaterialIcons name="info-outline" size={18} color="#1565C0" />
          <Text style={styles.infoTipText}>
            Documents uploaded here can be easily attached when applying for scholarships.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F4F6FA' },
  header: {
    height: 100, backgroundColor: '#1565C0',
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 40, paddingHorizontal: 16, gap: 12
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  backBtn: { padding: 4 },
  scroll: { padding: 16 },
  uploadBanner: {
    backgroundColor: '#fff', borderRadius: 16, padding: 24,
    alignItems: 'center', borderStyle: 'dashed', borderWidth: 2,
    borderColor: '#BBDEFB', marginBottom: 24
  },
  uploadTitle: { fontSize: 17, fontWeight: 'bold', color: '#1A237E', marginTop: 12 },
  uploadSub: { fontSize: 13, color: '#90A4AE', marginTop: 4, marginBottom: 16 },
  uploadActionBtn: {
    backgroundColor: '#1565C0', paddingHorizontal: 24, paddingVertical: 10,
    borderRadius: 8, elevation: 2
  },
  uploadActionText: { color: '#fff', fontWeight: 'bold' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1A237E' },
  docCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    flexDirection: 'row', alignItems: 'center', marginBottom: 12,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4
  },
  docIconWrap: {
    width: 48, height: 48, borderRadius: 10, backgroundColor: '#F5F5F5',
    alignItems: 'center', justifyContent: 'center', marginRight: 12
  },
  docInfo: { flex: 1 },
  docName: { fontSize: 14, fontWeight: '700', color: '#263238' },
  docMeta: { fontSize: 12, color: '#607D8B', marginTop: 2 },
  docDate: { fontSize: 11, color: '#90A4AE', marginTop: 4 },
  docActions: { flexDirection: 'row', gap: 8 },
  actionIcon: { padding: 8, borderRadius: 8, backgroundColor: '#F8F9FA' },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 15, color: '#90A4AE', marginTop: 12 },
  infoTip: {
    flexDirection: 'row', backgroundColor: '#E3F2FD',
    padding: 12, borderRadius: 10, marginTop: 10, gap: 8, alignItems: 'center'
  },
  infoTipText: { flex: 1, fontSize: 12, color: '#1565C0', lineHeight: 18 }
});
