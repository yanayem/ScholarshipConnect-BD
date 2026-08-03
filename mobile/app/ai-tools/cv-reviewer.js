import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, StatusBar, Alert, Pressable } from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { apiService } from '../../services/api';
import { useToast } from '../../components/Toast';

import { useUser } from '../../context/UserContext';

export default function CVReviewerScreen() {
    const { user } = useUser();
    const [cvText, setCvText] = useState('');
    const [loading, setLoading] = useState(false);
    const { showToast, ToastComponent } = useToast();


    const handleReview = async () => {
        if (!cvText || cvText.length < 100) {
            showToast('Please paste more detailed CV content (at least 100 chars).', 'warning');
            return;
        }
        setLoading(true);
        const res = await apiService.aiReviewCV(cvText);
        if (res.ok) {
            Alert.alert('AI CV Analysis', res.data.feedback);
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
                <Text style={styles.headerTitle}>AI CV Reviewer</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
                <View style={styles.hero}>
                    <Ionicons name="document-text" size={50} color={theme.colors.primary} />
                    <Text style={styles.heroTitle}>Make your CV Global Ready</Text>
                    <Text style={styles.heroSub}>Paste your current CV text below and let AI analyze the gaps.</Text>
                    {!user?.is_pro && (
                        <TouchableOpacity
                            style={styles.proBanner}
                            onPress={() => router.push('/upgrade-pro')}
                        >
                            <MaterialIcons name="workspace-premium" size={16} color="#000" />
                            <Text style={styles.proBannerText}>PRO FEATURE: Limited Credits. Upgrade for Unlimited Access.</Text>
                            <MaterialIcons name="chevron-right" size={16} color="#000" />
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.card}>
                    <TextInput
                        style={styles.textArea}
                        multiline
                        numberOfLines={15}
                        placeholder="Paste your CV content here..."
                        placeholderTextColor={theme.colors.placeholder}
                        value={cvText}
                        onChangeText={setCvText}
                        textAlignVertical="top"
                    />

                    {loading ? (
                        <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 20 }} />
                    ) : (
                        <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={handleReview}
                        >
                            <MaterialIcons name="analytics" size={20} color="#fff" />
                            <Text style={styles.actionBtnText}>Analyze My CV</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.tipBox}>
                    <MaterialIcons name="lightbulb" size={20} color="#F59E0B" />
                    <Text style={styles.tipText}>Tip: For better results, include your Experience, Skills, and Education sections.</Text>
                </View>
            </ScrollView>
            {ToastComponent}
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.colors.background },
    header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20, flexDirection: 'row', alignItems: 'center', gap: 15 },
    backBtn: { padding: 8, backgroundColor: theme.colors.surface, borderRadius: 12 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.heading },
    scroll: { padding: 20 },
    hero: { alignItems: 'center', marginBottom: 30 },
    heroTitle: { fontSize: 22, fontWeight: 'bold', color: theme.colors.heading, marginTop: 15 },
    heroSub: { fontSize: 14, color: theme.colors.textMuted, textAlign: 'center', marginTop: 8, paddingHorizontal: 20 },
    proBanner: { backgroundColor: '#FFD700', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 16 },
    proBannerText: { color: '#000', fontSize: 11, fontWeight: 'bold' },
    card: { backgroundColor: theme.colors.surface, padding: 20, borderRadius: 24, ...theme.shadows.soft },
    textArea: { backgroundColor: theme.colors.background, borderRadius: 16, padding: 20, minHeight: 300, fontSize: 14, color: theme.colors.textPrimary, borderWidth: 1, borderColor: theme.colors.border },
    actionBtn: { backgroundColor: theme.colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, paddingVertical: 18, borderRadius: 18, marginTop: 25, ...theme.shadows.teal },
    actionBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    tipBox: { marginTop: 25, flexDirection: 'row', gap: 12, backgroundColor: '#FEF3C7', padding: 15, borderRadius: 12, alignItems: 'center' },
    tipText: { flex: 1, color: '#92400E', fontSize: 12, fontWeight: '500' }
});
