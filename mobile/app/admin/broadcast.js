import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, StatusBar, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { theme } from '../../theme';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { apiService } from '../../services/api';

export default function BroadcastScreen() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [broadcasts, setBroadcasts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadBroadcasts = async () => {
        const res = await apiService.getAdminBroadcasts();
        if (res.ok) {
            setBroadcasts(res.data);
        }
        setLoading(false);
        setRefreshing(false);
    };

    useEffect(() => {
        loadBroadcasts();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadBroadcasts();
    };

    const handleSend = async () => {
        if (!title || !message) return Alert.alert('Error', 'Please fill all fields');
        setSending(true);
        const res = await apiService.sendBroadcast(title, message);
        if (res.ok) {
            Alert.alert('Success', 'Push notification sent to all users!');
            setTitle('');
            setMessage('');
            loadBroadcasts();
        } else {
            Alert.alert('Error', 'Failed to send broadcast');
        }
        setSending(false);
    };

    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialIcons name="arrow-back" size={24} color={theme.colors.heading} />
                </TouchableOpacity>
                <Text style={styles.title}>Global Broadcast</Text>
            </View>

            <ScrollView
                contentContainerStyle={styles.scroll}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <View style={styles.card}>
                    <MaterialCommunityIcons name="bullhorn-outline" size={48} color={theme.colors.primary} style={styles.icon} />
                    <Text style={styles.infoText}>Send a push notification to all registered students.</Text>

                    <Text style={styles.label}>Broadcast Title</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., MEXT Scholarship is Live!"
                        value={title}
                        onChangeText={setTitle}
                    />

                    <Text style={styles.label}>Message Content</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Type your announcement here..."
                        multiline
                        numberOfLines={4}
                        value={message}
                        onChangeText={setMessage}
                    />

                    <TouchableOpacity style={styles.sendBtn} onPress={handleSend} disabled={sending}>
                        {sending ? <ActivityIndicator color="#fff" /> : (
                            <>
                                <Text style={styles.sendBtnText}>Send Broadcast</Text>
                                <MaterialIcons name="send" size={20} color="#fff" />
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                <Text style={styles.historyTitle}>Recent Broadcasts</Text>
                {loading ? <ActivityIndicator color={theme.colors.primary} /> : (
                    broadcasts.map(b => (
                        <View key={b.id} style={styles.broadcastItem}>
                            <Text style={styles.itemTitle}>{b.title}</Text>
                            <Text style={styles.itemMsg}>{b.message}</Text>
                            <Text style={styles.itemMeta}>Sent by {b.sender_name} • {new Date(b.created_at).toLocaleDateString()}</Text>
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.colors.background },
    header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', gap: 16 },
    backBtn: { padding: 4 },
    title: { fontSize: 20, fontWeight: 'bold', color: theme.colors.heading },
    scroll: { padding: 20 },
    card: { backgroundColor: '#fff', borderRadius: 24, padding: 24, ...theme.shadows.soft, marginBottom: 30 },
    icon: { alignSelf: 'center', marginBottom: 16 },
    infoText: { textAlign: 'center', color: theme.colors.textSecondary, marginBottom: 30, fontSize: 14 },
    label: { fontSize: 14, fontWeight: 'bold', color: theme.colors.textPrimary, marginBottom: 8 },
    input: { backgroundColor: theme.colors.background, borderRadius: 12, padding: 16, fontSize: 16, marginBottom: 20 },
    textArea: { height: 120, textAlignVertical: 'top' },
    sendBtn: { backgroundColor: theme.colors.primary, height: 56, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12 },
    sendBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    historyTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.heading, marginBottom: 16 },
    broadcastItem: { backgroundColor: '#fff', padding: 16, borderRadius: 16, marginBottom: 12, ...theme.shadows.soft },
    itemTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.heading },
    itemMsg: { fontSize: 14, color: theme.colors.textPrimary, marginTop: 4 },
    itemMeta: { fontSize: 11, color: theme.colors.textSecondary, marginTop: 8 }
});
