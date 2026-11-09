import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, ActivityIndicator, StatusBar, Alert, Clipboard
} from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { theme } from '../../theme';
import { apiService } from '../../services/api';
import { useToast } from '../../components/Toast';

export default function SmartAiAutoFillScreen() {
  const [mode, setMode] = useState('url'); // 'url' | 'text'
  const [urlInput, setUrlInput] = useState('');
  const [rawText, setRawText] = useState('');
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const { showToast, ToastComponent } = useToast();

  const handleExtract = async () => {
    if (mode === 'url') {
      if (!urlInput.trim()) {
        showToast('Please enter a valid webpage link', 'warning');
        return;
      }
      setLoading(true);
      try {
        const res = await apiService.extractScholarshipFromUrl(urlInput.trim());
        if (res.ok && res.data?.scholarship) {
          setExtractedData(res.data.scholarship);
          showToast('Extracted webpage info successfully!', 'success');
        } else {
          showToast(res.data?.error || 'Extraction failed', 'error');
        }
      } catch (err) {
        showToast('Network error during extraction', 'error');
      } finally {
        setLoading(false);
      }
    } else {
      if (!rawText.trim()) {
        showToast('Please paste circular text', 'warning');
        return;
      }
      setLoading(true);
      try {
        const res = await apiService.aiExtractScholarship(rawText.trim());
        if (res.ok && res.data?.scholarship) {
          setExtractedData(res.data.scholarship);
          showToast('Extracted text details successfully!', 'success');
        } else {
          showToast(res.data?.error || 'AI extraction failed', 'error');
        }
      } catch (err) {
        showToast('Network error during AI extraction', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const copyJson = () => {
    if (extractedData) {
      Clipboard.setString(JSON.stringify(extractedData, null, 2));
      showToast('Copied JSON to clipboard', 'info');
    }
  };

  const handleProceedToAdd = () => {
    router.push('/add-scholarship');
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      {ToastComponent}

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.heading} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Smart AI Auto-Fill</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <FontAwesome5 name="magic" size={40} color={theme.colors.primary} />
          <Text style={styles.heroTitle}>Extract Scholarship Details</Text>
          <Text style={styles.heroSub}>
            Provide an official webpage URL or paste circular text to automatically parse eligibility and requirements.
          </Text>
        </View>

        {/* Mode Selector */}
        <View style={styles.modeContainer}>
          <TouchableOpacity
            style={[styles.modeBtn, mode === 'url' && styles.modeBtnActive]}
            onPress={() => setMode('url')}
          >
            <MaterialIcons name="language" size={18} color={mode === 'url' ? '#fff' : theme.colors.textSecondary} />
            <Text style={[styles.modeText, mode === 'url' && styles.modeTextActive]}>Web Link</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeBtn, mode === 'text' && styles.modeBtnActive]}
            onPress={() => setMode('text')}
          >
            <MaterialIcons name="description" size={18} color={mode === 'text' ? '#fff' : theme.colors.textSecondary} />
            <Text style={[styles.modeText, mode === 'text' && styles.modeTextActive]}>Circular Text</Text>
          </TouchableOpacity>
        </View>

        {/* Input Card */}
        <View style={styles.card}>
          {mode === 'url' ? (
            <View>
              <Text style={styles.label}>Webpage URL</Text>
              <TextInput
                style={styles.input}
                placeholder="https://www.daad.de/..."
                placeholderTextColor={theme.colors.placeholder}
                value={urlInput}
                onChangeText={setUrlInput}
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>
          ) : (
            <View>
              <Text style={styles.label}>Notice / Circular Content</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Paste circular text or requirements here..."
                placeholderTextColor={theme.colors.placeholder}
                value={rawText}
                onChangeText={setRawText}
                multiline
                numberOfLines={5}
              />
            </View>
          )}

          <TouchableOpacity
            style={[styles.actionBtn, loading && styles.btnDisabled]}
            onPress={handleExtract}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <MaterialIcons name="auto-awesome" size={20} color="#fff" />
                <Text style={styles.actionBtnText}>Extract with AI</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Output Extracted Card */}
        {extractedData && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <MaterialIcons name="check-circle" size={24} color={theme.colors.success || '#10B981'} />
              <Text style={styles.resultTitle}>Extracted Information</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Title:</Text>
              <Text style={styles.infoValue}>{extractedData.title || 'N/A'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Provider:</Text>
              <Text style={styles.infoValue}>{extractedData.provider || 'N/A'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Country:</Text>
              <Text style={styles.infoValue}>{extractedData.country || 'N/A'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Amount:</Text>
              <Text style={styles.infoValue}>{extractedData.amount || 'N/A'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Level:</Text>
              <Text style={styles.infoValue}>{extractedData.level || 'N/A'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Field:</Text>
              <Text style={styles.infoValue}>{extractedData.field || 'N/A'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Min CGPA:</Text>
              <Text style={styles.infoValue}>{extractedData.min_cgpa || 'None'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoKey}>Deadline:</Text>
              <Text style={styles.infoValue}>{extractedData.deadline || 'Ongoing'}</Text>
            </View>

            <View style={styles.resultActions}>
              <TouchableOpacity style={styles.secondaryBtn} onPress={copyJson}>
                <MaterialIcons name="content-copy" size={18} color={theme.colors.primary} />
                <Text style={styles.secondaryBtnText}>Copy JSON</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.primaryBtn} onPress={handleProceedToAdd}>
                <MaterialIcons name="add-circle" size={18} color="#fff" />
                <Text style={styles.primaryBtnText}>Submit Scholarship</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.m,
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 40,
    paddingBottom: 15,
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backBtn: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.heading,
  },
  scroll: {
    padding: theme.spacing.m,
  },
  hero: {
    alignItems: 'center',
    marginVertical: 15,
    paddingHorizontal: 10,
  },
  heroTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.heading,
    marginTop: 10,
  },
  heroSub: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 5,
  },
  modeContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.m,
    padding: 4,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: theme.borderRadius.s,
    gap: 6,
  },
  modeBtnActive: {
    backgroundColor: theme.colors.primary,
  },
  modeText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textSecondary,
  },
  modeTextActive: {
    color: '#fff',
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.m,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 20,
  },
  label: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.heading,
    marginBottom: 8,
  },
  input: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.m,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textPrimary,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 15,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  actionBtn: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: theme.borderRadius.m,
    gap: 8,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.sm,
  },
  resultCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.m,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    marginBottom: 30,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  resultTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.heading,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border + '40',
  },
  infoKey: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textSecondary,
  },
  infoValue: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.heading,
    maxWidth: '65%',
    textAlign: 'right',
  },
  resultActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 15,
    paddingTop: 10,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.s,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    gap: 4,
  },
  secondaryBtnText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.s,
    backgroundColor: theme.colors.primary,
    gap: 4,
  },
  primaryBtnText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: '#fff',
  },
});
