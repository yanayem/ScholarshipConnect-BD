import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, StatusBar, Alert, Modal, Share } from 'react-native';
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
    const [mode, setMode] = useState('write'); // 'write', 'review', 'paraphrase'
    const [style, setStyle] = useState('academic'); // 'academic', 'professional', 'persuasive', 'concise'
    const [paraphrasedText, setParaphrasedText] = useState('');
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
        if (!sopText || sopText.trim().length < 40) {
            showToast('Please provide at least 40 characters of SOP text.', 'warning');
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

    const handleParaphrase = async () => {
        if (!sopText || sopText.trim().length < 20) {
            showToast('Please enter at least 20 characters of SOP text to paraphrase.', 'warning');
            return;
        }
        setLoading(true);
        const res = await apiService.aiParaphraseSOP(sopText, style);
        if (res.ok) {
            const output = res.data.paraphrased_sop || res.data.sop || '';
            setParaphrasedText(output);
            showToast('SOP Paraphrased successfully!', 'success');
        } else {
            showToast(res.data.error || 'Paraphrase failed', 'error');
        }
        setLoading(false);
    };

    const applyParaphrasedToEditor = () => {
        if (paraphrasedText) {
            setSopText(paraphrasedText);
            setParaphrasedText('');
            showToast('Replaced main SOP text with paraphrased version!', 'success');
        }
    };

    const handleShareText = async (textToExport) => {
        if (!textToExport) return;
        try {
            await Share.share({
                title: `Statement of Purpose - ${scholarshipTitle || 'Scholarship'}`,
                message: `STATEMENT OF PURPOSE\nTarget: ${scholarshipTitle || 'Scholarship Application'}\n\n${textToExport}`,
            });
        } catch (error) {
            showToast('Could not share SOP document', 'error');
        }
    };

    const handleDownloadPDFMobile = async (textToExport) => {
        if (!textToExport) return;
        try {
            const { openBrowserAsync } = require('expo-web-browser');
            const paragraphs = textToExport
                .split('\n\n')
                .filter(p => p.trim())
                .map(p => `<p style="text-indent: 30px; margin-bottom: 16px; text-align: justify; line-height: 1.8;">${p.replace(/\n/g, '<br/>')}</p>`)
                .join('');

            const html = `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Statement of Purpose</title><style>body{font-family:Georgia,serif;padding:24px;line-height:1.8;color:#111;margin:0;}h1{text-align:center;font-size:20px;text-transform:uppercase;border-bottom:2px solid #0f172a;padding-bottom:10px;margin-bottom:15px;color:#0f172a;}.subtitle{text-align:center;font-size:12px;color:#64748b;margin-bottom:25px;font-style:italic;}.footer{margin-top:35px;text-align:center;font-size:11px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:12px;}</style></head><body><h1>Statement of Purpose</h1><div class="subtitle">Target: ${scholarshipTitle || 'Scholarship Application'}</div>${paragraphs}<div class="footer">Prepared with ScholarAI • ScholarshipConnect BD</div></body></html>`;

            const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
            await openBrowserAsync(dataUrl);
        } catch (e) {
            handleShareText(textToExport);
        }
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
                    <TouchableOpacity
                        style={[styles.tab, mode === 'paraphrase' && styles.activeTab]}
                        onPress={() => setMode('paraphrase')}
                    >
                        <Text style={[styles.tabText, mode === 'paraphrase' && styles.activeTabText]}>Paraphrase</Text>
                    </TouchableOpacity>
                </View>

                {scholarshipTitle && (
                    <View style={styles.infoBox}>
                        <Ionicons name="school" size={20} color={theme.colors.primary} />
                        <Text style={styles.infoText}>Target: {scholarshipTitle}</Text>
                    </View>
                )}

                {mode === 'paraphrase' && (
                    <View style={styles.styleSelector}>
                        <Text style={styles.styleLabel}>Select Tone & Style:</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
                            {['academic', 'professional', 'persuasive', 'concise'].map((s) => (
                                <TouchableOpacity
                                    key={s}
                                    style={[styles.chip, style === s && styles.activeChip]}
                                    onPress={() => setStyle(s)}
                                >
                                    <Text style={[styles.chipText, style === s && styles.activeChipText]}>
                                        {s.charAt(0).toUpperCase() + s.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}

                <View style={styles.card}>
                    <View style={styles.labelRow}>
                        <Text style={styles.label}>
                            {mode === 'write' ? 'Generated Draft' : mode === 'review' ? 'Paste your SOP here' : 'Original SOP to Paraphrase'}
                        </Text>
                        {!user?.is_pro && (
                            <TouchableOpacity
                                style={styles.proLabel}
                                onPress={() => router.push('/upgrade-pro')}
                            >
                                <MaterialIcons name="workspace-premium" size={12} color="#fff" />
                                <Text style={styles.proLabelText}>PRO: UNLIMITED</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <TextInput
                        style={styles.textArea}
                        multiline
                        numberOfLines={12}
                        placeholder={
                            mode === 'write'
                                ? "AI will generate your draft here or paste yours..."
                                : mode === 'review'
                                ? "Paste your SOP text to get AI review feedback..."
                                : "Paste or type written SOP text here to paraphrase and polish..."
                        }
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
                            onPress={mode === 'write' ? handleGenerate : mode === 'review' ? handleReview : handleParaphrase}
                        >
                            <MaterialIcons
                                name={mode === 'write' ? "auto-fix-high" : mode === 'review' ? "rate-review" : "transform"}
                                size={20}
                                color="#fff"
                            />
                            <Text style={styles.actionBtnText}>
                                {mode === 'write' ? 'Generate AI Draft' : mode === 'review' ? 'Get AI Feedback' : 'Paraphrase & Polish SOP'}
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {paraphrasedText.length > 0 && (
                    <View style={styles.paraphraseCard}>
                        <View style={styles.paraphraseHeader}>
                            <MaterialIcons name="auto-awesome" size={20} color={theme.colors.primary} />
                            <Text style={styles.paraphraseTitle}>Paraphrased Result ({style.toUpperCase()})</Text>
                        </View>
                        <Text style={styles.paraphraseBody}>{paraphrasedText}</Text>
                        <View style={styles.paraphraseBtnRow}>
                            <TouchableOpacity style={styles.downloadBtnPdf} onPress={() => handleDownloadPDFMobile(paraphrasedText)}>
                                <MaterialIcons name="picture-as-pdf" size={16} color="#C53030" />
                                <Text style={styles.downloadBtnPdfText}>PDF</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.downloadBtnDoc} onPress={() => handleShareText(paraphrasedText)}>
                                <MaterialIcons name="file-download" size={16} color="#2B6CB0" />
                                <Text style={styles.downloadBtnDocText}>Export DOC</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.applyParaphraseBtn} onPress={applyParaphrasedToEditor}>
                                <MaterialIcons name="swap-calls" size={16} color="#fff" />
                                <Text style={styles.applyParaphraseText}>Use Text</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {sopText.length > 0 && (
                    <View style={styles.downloadRow}>
                        <TouchableOpacity
                            style={styles.downloadBtnPdf}
                            onPress={() => handleDownloadPDFMobile(sopText)}
                        >
                            <MaterialIcons name="picture-as-pdf" size={18} color="#C53030" />
                            <Text style={styles.downloadBtnPdfText}>PDF Preview</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.downloadBtnDoc}
                            onPress={() => handleShareText(sopText)}
                        >
                            <MaterialIcons name="file-download" size={18} color="#2B6CB0" />
                            <Text style={styles.downloadBtnDocText}>Export DOC</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.copyBtnInline}
                            onPress={() => setShowApplyModal(true)}
                        >
                            <MaterialIcons name="send" size={16} color={theme.colors.primaryDark} />
                            <Text style={styles.copyBtnInlineText}>Use in App</Text>
                        </TouchableOpacity>
                    </View>
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
    tabText: { color: theme.colors.textMuted, fontWeight: '600', fontSize: 12 },
    activeTabText: { color: theme.colors.primaryDark, fontWeight: 'bold' },
    infoBox: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20, backgroundColor: theme.colors.tealCard, padding: 15, borderRadius: 12 },
    infoText: { color: theme.colors.primaryDark, fontWeight: 'bold', fontSize: 13 },
    styleSelector: { marginBottom: 15 },
    styleLabel: { fontSize: 13, fontWeight: 'bold', color: theme.colors.heading, marginBottom: 8 },
    chipScroll: { flexDirection: 'row', gap: 8 },
    chip: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: theme.colors.surface, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.border },
    activeChip: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    chipText: { fontSize: 12, color: theme.colors.textSecondary, fontWeight: '600' },
    activeChipText: { color: '#fff', fontWeight: 'bold' },
    labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    proLabel: { backgroundColor: '#FFD700', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 4 },
    proLabelText: { color: '#000', fontSize: 10, fontWeight: 'bold' },
    card: { backgroundColor: theme.colors.surface, padding: 20, borderRadius: 20, ...theme.shadows.soft },
    label: { fontSize: 14, fontWeight: 'bold', marginBottom: 12, color: theme.colors.heading },
    textArea: { backgroundColor: theme.colors.background, borderRadius: 12, padding: 15, minHeight: 250, fontSize: 14, color: theme.colors.textPrimary, borderWidth: 1, borderColor: theme.colors.border },
    actionBtn: { backgroundColor: theme.colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 15, borderRadius: 15, marginTop: 20, ...theme.shadows.teal },
    actionBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
    paraphraseCard: { marginTop: 20, backgroundColor: '#F0F9F8', padding: 18, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.primaryLight },
    paraphraseHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
    paraphraseTitle: { fontSize: 14, fontWeight: 'bold', color: theme.colors.primaryDark },
    paraphraseBody: { fontSize: 14, color: theme.colors.textPrimary, lineHeight: 22, marginBottom: 15 },
    paraphraseBtnRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
    applyParaphraseBtn: { flex: 1, backgroundColor: theme.colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, paddingHorizontal: 10, borderRadius: 12 },
    applyParaphraseText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
    downloadRow: { flexDirection: 'row', gap: 8, marginTop: 15 },
    downloadBtnPdf: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#FFF5F5', paddingVertical: 10, paddingHorizontal: 10, borderRadius: 12, borderWidth: 1, borderColor: '#FEB2B2' },
    downloadBtnPdfText: { color: '#C53030', fontWeight: 'bold', fontSize: 12 },
    downloadBtnDoc: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#EBF8FF', paddingVertical: 10, paddingHorizontal: 10, borderRadius: 12, borderWidth: 1, borderColor: '#90CDF4' },
    downloadBtnDocText: { color: '#2B6CB0', fontWeight: 'bold', fontSize: 12 },
    copyBtnInline: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: theme.colors.tealCard, paddingVertical: 10, paddingHorizontal: 10, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.primaryLight },
    copyBtnInlineText: { color: theme.colors.primaryDark, fontWeight: 'bold', fontSize: 12 },
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
        justify.content: 'space-between',
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
