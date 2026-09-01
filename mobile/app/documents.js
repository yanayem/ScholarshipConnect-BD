import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, Alert, Image, ActivityIndicator, Modal, TextInput, Platform, KeyboardAvoidingView
} from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { theme } from '../theme';
import { apiService } from '../services/api';
import { cacheService } from '../services/cache';
import { Loader } from '../components/Loader';

export default function DocumentManagement() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Upload Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [docName, setDocName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [uploading, setUploading] = useState(false);

  const loadDocuments = async () => {
    // 1. Try Cache First
    try {
        const cachedDocs = await cacheService.get('user_documents_vault');
        if (cachedDocs) {
            setDocs(cachedDocs);
            setLoading(false);
        }
    } catch (e) {}

    try {
      const res = await apiService.getDocuments();
      if (res.ok) {
        setDocs(res.data);
        await cacheService.set('user_documents_vault', res.data, 30); // Cache for 30 mins
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleDelete = (id, name) => {
    Alert.alert(
      'Delete Document',
      `Are you sure you want to delete ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const res = await apiService.deleteDocument(id);
            if (res.ok) {
              setDocs(docs.filter(d => d.id !== id));
            } else {
              Alert.alert('Error', 'Failed to delete document');
            }
          }
        }
      ]
    );
  };

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        setSelectedFile(asset);
        setDocName(asset.name || 'My Document');
        setModalVisible(true);
      }
    } catch (err) {
      console.log('Error picking document:', err);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleConfirmUpload = async () => {
    if (!docName.trim()) {
      Alert.alert('Required', 'Please enter a document name.');
      return;
    }

    setUploading(true);
    try {
      const typeStr = docName.toLowerCase().includes('passport') ? 'Identity' :
                     docName.toLowerCase().includes('transcript') ? 'Academic' : 'Other';

      const res = await apiService.uploadDocument(selectedFile, docName, typeStr, expiryDate);
      
      if (res.ok) {
        setModalVisible(false);
        setDocName('');
        setExpiryDate('');
        setSelectedFile(null);
        loadDocuments();
        Alert.alert('Success', 'Document added to vault!');
      } else {
        Alert.alert('Error', 'Failed to upload document.');
      }
    } catch (e) {
      Alert.alert('Error', 'Something went wrong.');
    }
    setUploading(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Expired': return theme.colors.error;
      case 'Expiring Soon': return theme.colors.warning;
      case 'Valid': return theme.colors.success;
      default: return theme.colors.textSecondary;
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

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

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryInfo}>
            <Text style={styles.summaryTitle}>Storage Status</Text>
            <Text style={styles.summarySub}>{docs.length} Documents stored safely</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={handlePickFile}>
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>All Documents</Text>
          <MaterialIcons name="sort" size={20} color={theme.colors.textSecondary} />
        </View>

        {loading && docs.length === 0 ? (
          <Loader message="Accessing vault..." />
        ) : docs.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="folder-zip" size={80} color={theme.colors.divider} />
            <Text style={styles.emptyText}>Vault is empty</Text>
            <TouchableOpacity style={styles.emptyAction} onPress={handlePickFile}>
                <Text style={styles.emptyActionText}>Upload First Document</Text>
            </TouchableOpacity>
          </View>
        ) : (
          docs.map(doc => (
            <View key={doc.id} style={[styles.docCard, theme.shadows.soft]}>
              <View style={styles.docIconBox}>
                 <MaterialIcons name="description" size={24} color={theme.colors.primary} />
              </View>

              <View style={styles.docMain}>
                <Text style={styles.docName} numberOfLines={1}>{doc.name}</Text>
                <View style={styles.statusRow}>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(doc.status) }]} />
                  <Text style={[styles.statusText, { color: getStatusColor(doc.status) }]}>{doc.status}</Text>
                  {doc.expiry_date && (
                    <Text style={styles.expiryText}> • Exp: {doc.expiry_date}</Text>
                  )}
                </View>
              </View>

              <View style={styles.docActions}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(doc.id, doc.name)}>
                  <MaterialIcons name="delete-outline" size={20} color={theme.colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        <View style={styles.infoBox}>
           <MaterialIcons name="security" size={20} color={theme.colors.primary} />
           <Text style={styles.infoBoxText}>Your documents are encrypted and only accessible by you.</Text>
        </View>
      </ScrollView>

      {/* Upload Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContent}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Upload Document</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.previewBox}>
               {selectedFile?.mimeType?.includes('image') ? (
                 <Image source={{ uri: selectedFile.uri }} style={styles.previewImage} />
               ) : (
                 <View style={styles.pdfPreview}>
                   <FontAwesome5 name="file-pdf" size={50} color={theme.colors.error} />
                   <Text style={styles.pdfName}>{selectedFile?.name}</Text>
                 </View>
               )}
            </View>

            <Text style={styles.label}>Document Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Passport, IELTS Result"
              value={docName}
              onChangeText={setDocName}
            />

            <Text style={styles.label}>Expiry Date (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={expiryDate}
              onChangeText={setExpiryDate}
            />

            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={handleConfirmUpload}
              disabled={uploading}
            >
              {uploading ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmBtnText}>Save to Vault</Text>}
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 50,
    paddingHorizontal: 20, paddingBottom: 15, backgroundColor: '#fff',
    flexDirection: 'row', alignItems: 'center', gap: 12
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.heading },
  backBtn: { padding: 4 },
  scroll: { padding: 20 },
  summaryCard: {
    backgroundColor: theme.colors.primary, borderRadius: 24, padding: 24,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 32
  },
  summaryTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  summarySub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 4 },
  addBtn: {
    width: 48, height: 48, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center'
  },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.heading },
  docCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12,
    flexDirection: 'row', alignItems: 'center'
  },
  docIconBox: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: theme.colors.primaryLight,
    alignItems: 'center', justifyContent: 'center'
  },
  docMain: { flex: 1, marginLeft: 16 },
  docName: { fontSize: 15, fontWeight: 'bold', color: theme.colors.heading },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  statusText: { fontSize: 12, fontWeight: '600' },
  expiryText: { fontSize: 12, color: theme.colors.textSecondary },
  actionBtn: { padding: 8 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { color: theme.colors.placeholder, marginTop: 12, fontSize: 16 },
  emptyAction: { marginTop: 20, backgroundColor: theme.colors.primaryLight, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  emptyActionText: { color: theme.colors.primary, fontWeight: 'bold' },
  infoBox: {
    flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 20,
    backgroundColor: '#fff', padding: 16, borderRadius: 16, borderStyle: 'dashed', borderWidth: 1, borderColor: theme.colors.divider
  },
  infoBoxText: { flex: 1, fontSize: 12, color: theme.colors.textSecondary },

  pdfPreview: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' },
  pdfName: { marginTop: 10, fontSize: 12, color: theme.colors.textSecondary, textAlign: 'center', paddingHorizontal: 20 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.heading },
  previewBox: { height: 150, width: '100%', borderRadius: 16, backgroundColor: theme.colors.background, marginBottom: 20, overflow: 'hidden' },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  label: { fontSize: 14, fontWeight: 'bold', color: theme.colors.heading, marginBottom: 8, marginTop: 12 },
  input: { backgroundColor: theme.colors.background, borderRadius: 12, padding: 14, fontSize: 15, borderWidth: 1, borderColor: theme.colors.divider },
  confirmBtn: { backgroundColor: theme.colors.primary, borderRadius: 16, padding: 16, alignItems: 'center', marginTop: 32 },
  confirmBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
