import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, StatusBar, Alert, Modal } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { apiService } from '../../services/api';
import { useToast } from '../../components/Toast';

export default function SOPHelperScreen() {
    const { scholarshipId, scholarshipTitle } = useLocalSearchParams();
    const [user, setUser] = useState(null);
    const [sopText, setSopText] = useState('');
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState('write'); // 'write' or 'review'
    const [showApplyModal, setShowApplyModal] = useState(false);
    const { showToast, ToastComponent } = useToast();

    useEffect(() => {
        apiService.getProfile().then(res => {
            if (res.ok) setUser(res.data);
        });
    }, []);

    const handleGenerate = async () => {
        if (!scholarshipId) {
            showToast('Scholarship context missing', 'error');
            return;
        }
        setLoading(true);
        const res = await apiService.aiWriteSOP(scholarshipId);
        if (res.ok) {
            setSopText(res.data.sop);
            showToast('AI SOP Generated!', 'success');
        } else {
            showToast(res.data.error || 'Failed to generate SOP', 'error');
        }
        setLoading(false);
    };

    const handleReview = async () => {
        if (!sopText || sopText.length < 50) {
            showToast('Please provide at least 50 characters of SOP text.', 'warning');
            return;
        }
        setLoading(true);
        const res = await apiService.aiReviewSOP(sopText);
        if (res.ok) {
            Alert.alert('AI Review Feedback', res.data.feedback);
        } else {
            showToast(res.data.error || 'Review failed', 'error');
        }
        setLoading(false);
    };

    return (
        <View style={styles.root}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialIcons name="arrow-back" size={24} color={theme.colors.heading} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>AI SOP Assistant</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.tabRow}>
                    <TouchableOpacity
                        style={[styles.tab, mode === 'write' && styles.activeTab]}
                        onPress={() => setMode('write')}
                    >
                        <Text style={[styles.tabText, mode === 'write' && styles.activeTabText]}>Write Draft</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tab, mode === 'review' && styles.activeTab]}
                        onPress={() => setMode('review')}
                    >
                        <Text style={[styles.tabText, mode === 'review' && styles.activeTabText]}>Review & Fix</Text>
                    </TouchableOpacity>
                </View>

                {scholarshipTitle && (
                    <View style={styles.infoBox}>
                        <Ionicons name="school" size={20} color={theme.colors.primary} />
                        <Text style={styles.infoText}>Target: {scholarshipTitle}</Text>
                    </View>
                )}

                <View style={styles.card}>
                    <View style={styles.labelRow}>
                        <Text style={styles.label}>{mode === 'write' ? 'Generated Draft' : 'Paste your SOP here'}</Text>
                        {!user?.is_pro && (
                            <TouchableOpacity
                                style={styles.proLabel}
                                onPress={() => router.push('/upgrade-pro')}
                            >
                                <MaterialIcons name="workspace-premium" size={12} color="#fff" />
                                <Text style={styles.proLabelText}>PRO: GET UNLIMITED</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <TextInput
                        style={styles.textArea}
                        multiline
                        numberOfLines={12}
                        placeholder="AI will generate your draft here or paste yours..."
                        placeholderTextColor={theme.colors.placeholder}
                        value={sopText}
                        onChangeText={setSopText}
                        textAlignVertical="top"
                    />

                    {loading ? (
                        <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 20 }} />
                    ) : (
                        <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={mode === 'write' ? handleGenerate : handleReview}
                        >
                            <MaterialIcons name={mode === 'write' ? "auto-fix-high" : "rate-review"} size={20} color="#fff" />
                            <Text style={styles.actionBtnText}>
                                {mode === 'write' ? 'Generate AI Draft' : 'Get AI Feedback'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {sopText.length > 0 && (
                     <TouchableOpacity
                        style={styles.copyBtn}
                        onPress={() => setShowApplyModal(true)}
                     >
                        <Text style={styles.copyBtnText}>Use this in Application</Text>
                        <MaterialIcons name="check-circle" size={18} color={theme.colors.success} />
                     </TouchableOpacity>
                )}
            </ScrollView>
            {ToastComponent}

            {/* Hybrid Apply Modal */}
            <Modal visible={showApplyModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Choose Application Method</Text>
                            <TouchableOpacity onPress={() => setShowApplyModal(false)}>
                                <Ionicons name="close" size={24} color={theme.colors.textMuted} />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity 
                            style={[styles.hybridOptionCard, { borderColor: theme.colors.primary, borderWidth: 1.5, backgroundColor: 'rgba(42, 157, 143, 0.05)' }]}
                            onPress={async () => {
                                setShowApplyModal(false);
                                try {
                                    const res = await apiService.getScholarshipDetail(scholarshipId);
                                    if (res.ok && res.data.official_link) {
                                        const { openBrowserAsync } = require('expo-web-browser');
                                        let url = res.data.official_link.trim();
                                        if (!url.startsWith('http')) url = 'https://' + url;
                                        await openBrowserAsync(url);
                                    } else {
                                        Alert.alert("Notice", "Official portal link not found for this scholarship.");
                                    }
                                } catch (e) {
                                    Alert.alert("Error", "Could not open official portal.");
                                }
                            }}
                        >
                            <View style={[styles.hybridIconBox, { backgroundColor: theme.colors.primaryLight }]}>
                                <MaterialIcons name="language" size={28} color={theme.colors.primary} />
                            </View>
                            <View style={styles.hybridOptionText}>
                                <Text style={styles.hybridOptionTitle}>Apply on Official Site</Text>
                                <Text style={styles.hybridOptionDesc}>Go directly to the university portal. Your AI draft is saved in your history.</Text>
                            </View>
                            <Ionicons name="open-outline" size={20} color={theme.colors.primary} />
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.hybridOptionCard, { borderColor: '#8E44AD', borderWidth: 1.5, backgroundColor: 'rgba(142, 68, 173, 0.05)' }]}
                            onPress={() => {
                                setShowApplyModal(false);
                                router.push({
                                    pathname: `/apply/agency/${scholarshipId}`,
                                    params: { title: scholarshipTitle, prefilledSop: sopText }
                                });
                            }}
                        >
                            <View style={[styles.hybridIconBox, { backgroundColor: '#8E44AD' }]}>
                                <MaterialIcons name="business-center" size={24} color="#FFF" />
                            </View>
                            <View style={styles.hybridOptionText}>
                                <Text style={styles.hybridOptionTitle}>Let Experts Apply For You</Text>
                                <Text style={[styles.hybridOptionDesc, { color: '#8E44AD' }]}>Premium Service: Our consultants will handle formatting and official submission.</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#8E44AD" />
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.colors.background },
    header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20, flexDirection: 'row', alignItems: 'center', gap: 15 },
    backBtn: { padding: 8, backgroundColor: theme.colors.surface, borderRadius: 12 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.heading },
    scroll: { padding: 20 },
    tabRow: { flexDirection: 'row', backgroundColor: theme.colors.surface, borderRadius: 15, padding: 5, marginBottom: 20 },
    tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
    activeTab: { backgroundColor: theme.colors.primaryLight },
    tabText: { color: theme.colors.textMuted, fontWeight: '600' },
    activeTabText: { color: theme.colors.primaryDark },
    infoBox: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20, backgroundColor: theme.colors.tealCard, padding: 15, borderRadius: 12 },
    infoText: { color: theme.colors.primaryDark, fontWeight: 'bold', fontSize: 13 },
    labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    proLabel: { backgroundColor: '#FFD700', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 4 },
    proLabelText: { color: '#000', fontSize: 10, fontWeight: 'bold' },
    card: { backgroundColor: theme.colors.surface, padding: 20, borderRadius: 20, ...theme.shadows.soft },
    label: { fontSize: 14, fontWeight: 'bold', marginBottom: 12, color: theme.colors.heading },
    textArea: { backgroundColor: theme.colors.background, borderRadius: 12, padding: 15, minHeight: 250, fontSize: 14, color: theme.colors.textPrimary, borderWidth: 1, borderColor: theme.colors.border },
    actionBtn: { backgroundColor: theme.colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 15, borderRadius: 15, marginTop: 20, ...theme.shadows.teal },
    actionBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
    copyBtn: { marginTop: 20, padding: 15, borderRadius: 15, borderWidth: 1, borderStyle: 'dashed', borderColor: theme.colors.success, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
    copyBtnText: { color: theme.colors.success, fontWeight: 'bold' },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: theme.colors.surface,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.heading,
    },
    hybridOptionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    hybridIconBox: {
        width: 50,
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    hybridOptionText: {
        flex: 1,
    },
    hybridOptionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.heading,
        marginBottom: 4,
    },
    hybridOptionDesc: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        lineHeight: 18,
    },
});
