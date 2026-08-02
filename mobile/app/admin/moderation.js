import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { theme } from '../../theme';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { apiService } from '../../services/api';

export default function ModerationScreen() {
    const router = useRouter();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadReports = async () => {
        const res = await apiService.getModerationReports();
        if (res.ok) {
            setReports(res.data);
        }
        setLoading(false);
        setRefreshing(false);
    };

    useEffect(() => {
        loadReports();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadReports();
    };

    const handleAction = async (id, action) => {
        const res = await apiService.resolveReport(id, action);
        if (res.ok) {
            Alert.alert('Moderation', `Report ${action === 'delete' ? 'resolved' : 'dismissed'}`);
            loadReports();
        } else {
            Alert.alert('Error', 'Failed to update report');
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
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
                <Text style={styles.title}>Moderation Center</Text>
            </View>

            <ScrollView
                contentContainerStyle={styles.scroll}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <Text style={styles.sectionTitle}>Pending Reports ({reports.length})</Text>

                {reports.map(report => (
                    <View key={report.id} style={styles.reportCard}>
                        <View style={styles.reportHeader}>
                            <View style={styles.typeBadge}>
                                <Text style={styles.typeText}>{report.content_type}</Text>
                            </View>
                            <Text style={styles.reasonText}>{report.reason}</Text>
                        </View>
                        <Text style={styles.userText}>Reported User: @{report.reported_user_name}</Text>
                        <Text style={styles.contentText}>{report.description || 'No description provided'}</Text>

                        <View style={styles.actions}>
                            <TouchableOpacity
                                style={styles.dismissBtn}
                                onPress={() => handleAction(report.id, 'dismiss')}
                            >
                                <Text style={styles.dismissText}>Dismiss</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.deleteBtn}
                                onPress={() => {
                                    Alert.alert(
                                        'Resolve Report',
                                        'This will delete the reported content permanently and mark this report as resolved. Continue?',
                                        [
                                            { text: 'Cancel', style: 'cancel' },
                                            { text: 'Resolve & Delete', onPress: () => handleAction(report.id, 'delete') }
                                        ]
                                    );
                                }}
                            >
                                <Text style={styles.deleteText}>Resolve & Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}

                {reports.length === 0 && (
                    <View style={styles.empty}>
                        <MaterialCommunityIcons name="shield-check" size={60} color={theme.colors.success} />
                        <Text style={styles.emptyText}>Community is clean!</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.colors.background },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', gap: 16 },
    backBtn: { padding: 4 },
    title: { fontSize: 20, fontWeight: 'bold', color: theme.colors.heading },
    scroll: { padding: 20 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 20, color: theme.colors.textSecondary },
    reportCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 16, ...theme.shadows.soft },
    reportHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    typeBadge: { backgroundColor: theme.colors.primaryLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    typeText: { fontSize: 12, fontWeight: 'bold', color: theme.colors.primary },
    reasonText: { color: theme.colors.error, fontWeight: 'bold' },
    userText: { fontWeight: 'bold', color: theme.colors.heading, marginBottom: 8 },
    contentText: { fontStyle: 'italic', color: theme.colors.textSecondary, marginBottom: 20 },
    actions: { flexDirection: 'row', gap: 12 },
    dismissBtn: { flex: 1, height: 44, borderRadius: 10, borderWidth: 1, borderColor: theme.colors.divider, justifyContent: 'center', alignItems: 'center' },
    dismissText: { fontWeight: 'bold', color: theme.colors.textSecondary },
    deleteBtn: { flex: 2, height: 44, borderRadius: 10, backgroundColor: theme.colors.error, justifyContent: 'center', alignItems: 'center' },
    deleteText: { fontWeight: 'bold', color: '#fff' },
    empty: { alignItems: 'center', marginTop: 100 },
    emptyText: { fontSize: 18, color: theme.colors.textSecondary, marginTop: 16, fontWeight: 'bold' }
});
