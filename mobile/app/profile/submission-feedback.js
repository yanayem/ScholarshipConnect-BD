import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, RefreshControl,
  StatusBar, ActivityIndicator
} from 'react-native';
import { theme } from '../../theme';
import { MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { apiService } from '../../services/api';
import { useToast } from '../../components/Toast';
import { Loader } from '../../components/Loader';
import ScholarshipCard from '../../components/cards/ScholarshipCard';

export default function SubmissionFeedbackScreen() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const { showToast, ToastComponent } = useToast();

  const loadSubmissions = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await apiService.getSubmissionFeedback();
      if (res.ok) {
        setSubmissions(res.data);
      }
    } catch (error) {
      console.log('Error loading submission feedback', error);
      showToast('Error loading feedback', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadSubmissions(submissions.length > 0);
    }, [])
  );

  const renderItem = ({ item, index }) => (
    <View style={styles.cardContainer}>
        <View style={styles.simpleCard}>
            <View style={styles.cardInfo}>
                <MaterialCommunityIcons name="alert-circle-outline" size={24} color={theme.colors.error} />
                <View style={{ flex: 1 }}>
                    <Text style={styles.simpleTitle} numberOfLines={2}>{item.title}</Text>
                    <Text style={styles.dateText}>Submitted on {new Date(item.created_at).toLocaleDateString()}</Text>
                </View>
            </View>

            {item.admin_note && (
                <View style={styles.noteBox}>
                    <View style={styles.noteHeader}>
                        <MaterialIcons name="feedback" size={16} color={theme.colors.error} />
                        <Text style={styles.noteTitle}>Rejection Reason</Text>
                    </View>
                    <Text style={styles.noteText}>{item.admin_note}</Text>
                </View>
            )}
        </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={24} color={theme.colors.heading} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Submission Feedback</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <Loader message="Fetching your submissions..." />
      ) : (
        <FlatList
          data={submissions}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadSubmissions(true)} />}
          ListEmptyComponent={
            <View style={styles.centered}>
              <MaterialCommunityIcons name="clipboard-check-outline" size={64} color={theme.colors.placeholder} />
              <Text style={styles.emptyText}>No rejected submissions or feedback found.</Text>
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={() => router.push('/add-scholarship')}
              >
                <Text style={styles.submitBtnText}>Submit New Scholarship</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {ToastComponent}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  backBtn: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.heading,
  },
  list: {
    padding: 20,
  },
  cardContainer: {
    marginBottom: 16,
  },
  simpleCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.divider,
    ...theme.shadows.soft,
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  simpleTitle: {
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.heading,
    flex: 1,
  },
  noteBox: {
    backgroundColor: '#FFF5F5',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FED7D7',
    marginBottom: 12,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  noteTitle: {
    fontSize: 11,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.error,
    textTransform: 'uppercase',
  },
  noteText: {
    fontSize: 13,
    color: theme.colors.textPrimary,
    lineHeight: 18,
  },
  dateText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.medium,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.placeholder,
    marginTop: 16,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  submitBtn: {
    marginTop: 20,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  submitBtnText: {
    color: '#fff',
    fontFamily: theme.typography.fontFamily.bold,
  }
});
