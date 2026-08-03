import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, ActivityIndicator, RefreshControl } from 'react-native';
import { theme } from '../../theme';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { apiService } from '../../services/api';

export default function HistoryLogsScreen() {
    const router = useRouter();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadLogs = async () => {
        const res = await apiService.getAdminLogs();
        if (res.ok) {
            setLogs(res.data);
        }
        setLoading(false);
        setRefreshing(false);
    };

    useEffect(() => {
        loadLogs();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadLogs();
    };

    const getLogIcon = (action) => {
        if (action.toLowerCase().includes('approve')) return { name: 'check-circle', color: theme.colors.success };
        if (action.toLowerCase().includes('delete')) return { name: 'delete', color: theme.colors.error };
        if (action.toLowerCase().includes('broadcast')) return { name: 'bullhorn', color: theme.colors.warning };
        return { name: 'settings', color: theme.colors.primary };
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
                <Text style={styles.title}>History Logs</Text>
            </View>

            <ScrollView
                contentContainerStyle={styles.scroll}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {logs.map(log => {
                    const iconConfig = getLogIcon(log.action);
                    return (
                        <View key={log.id} style={styles.logCard}>
                            <View style={[styles.iconBox, { backgroundColor: iconConfig.color + '15' }]}>
                                <MaterialCommunityIcons name={iconConfig.name} size={22} color={iconConfig.color} />
                            </View>
                            <View style={styles.logInfo}>
                                <Text style={styles.actionText}>{log.action}</Text>
                                <Text style={styles.targetText}>{log.target}</Text>
                                <Text style={styles.metaText}>By {log.admin_name} • {new Date(log.created_at).toLocaleString()}</Text>
                            </View>
                        </View>
                    );
                })}
                {logs.length === 0 && (
                    <Text style={styles.emptyText}>No logs found</Text>
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
    logCard: { flexDirection: 'row', backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 12, alignItems: 'center', ...theme.shadows.soft },
    iconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    logInfo: { flex: 1 },
    actionText: { fontSize: 14, fontWeight: 'bold', color: theme.colors.heading },
    targetText: { fontSize: 13, color: theme.colors.textPrimary, marginTop: 2 },
    metaText: { fontSize: 11, color: theme.colors.textSecondary, marginTop: 4 },
    emptyText: { textAlign: 'center', marginTop: 40, color: theme.colors.textSecondary }
});
