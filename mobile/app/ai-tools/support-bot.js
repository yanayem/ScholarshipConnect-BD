import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, TextInput,
    FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, StatusBar
} from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { apiService } from '../../services/api';
import { Loader } from '../../components/Loader';

export default function SupportBotScreen() {
    const [messages, setMessages] = useState([
        { id: '1', text: 'Hello! I am your ScholarshipConnect AI Assistant. How can I help you today?', isUser: false }
    ]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(true);
    const flatListRef = useRef(null);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const res = await apiService.getAIChatHistory();
            if (res.ok && res.data && res.data.length > 0) {
                const formattedMessages = res.data.map((m, index) => ({
                    id: m.id ? m.id.toString() : `history-${index}`,
                    text: m.message,
                    isUser: m.is_user
                }));
                setMessages([
                    { id: '1', text: 'Hello! I am your ScholarshipConnect AI Assistant. How can I help you today?', isUser: false },
                    ...formattedMessages
                ]);
            }
        } catch (error) {
            console.error('[SupportBot] Load History Error:', error);
        } finally {
            setHistoryLoading(false);
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 300);
        }
    };

    useEffect(() => {
        if (messages.length > 1) {
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 200);
        }
    }, [messages.length]);

    const handleSend = async () => {
        if (!inputText.trim() || loading) return;

        const userMessage = { id: Date.now().toString(), text: inputText, isUser: true };
        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setLoading(true);

        // Prepare history for context (last 6 messages)
        const history = messages.slice(-6).map(m => m.text);

        const res = await apiService.aiLiveSupport(userMessage.text, history);

        if (res.ok) {
            const botMessage = { id: (Date.now() + 1).toString(), text: res.data.response, isUser: false };
            setMessages(prev => [...prev, botMessage]);
        } else {
            const errorMessage = { id: (Date.now() + 1).toString(), text: 'Sorry, I am having trouble connecting right now.', isUser: false };
            setMessages(prev => [...prev, errorMessage]);
        }
        setLoading(false);
    };

    const renderMessage = ({ item }) => (
        <View style={[styles.messageWrapper, item.isUser ? styles.userWrapper : styles.botWrapper]}>
            {!item.isUser && (
                <View style={styles.botIcon}>
                    <MaterialIcons name="smart-toy" size={16} color="#fff" />
                </View>
            )}
            <View style={[styles.messageBubble, item.isUser ? styles.userBubble : styles.botBubble]}>
                <Text style={[styles.messageText, item.isUser ? styles.userText : styles.botText]}>
                    {item.text}
                </Text>
            </View>
        </View>
    );

    return (
        <KeyboardAvoidingView
            style={styles.root}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <StatusBar barStyle="dark-content" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialIcons name="arrow-back" size={24} color={theme.colors.heading} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Live Support</Text>
                    <View style={styles.statusRow}>
                        <View style={styles.statusDot} />
                        <Text style={styles.statusText}>AI Assistant Online</Text>
                    </View>
                </View>
            </View>

            {historyLoading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={{ marginTop: 10, color: theme.colors.textSecondary }}>Loading chat history...</Text>
                </View>
            ) : (
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={item => item.id}
                    renderItem={renderMessage}
                    contentContainerStyle={styles.chatContent}
                />
            )}

            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={theme.colors.primary} />
                    <Text style={styles.loadingText}>AI is thinking...</Text>
                </View>
            )}

            <View style={styles.inputArea}>
                <TextInput
                    style={styles.input}
                    placeholder="Ask me anything..."
                    value={inputText}
                    onChangeText={setInputText}
                    multiline
                />
                <TouchableOpacity
                    style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
                    onPress={handleSend}
                    disabled={!inputText.trim() || loading}
                >
                    <Ionicons name="send" size={20} color="#fff" />
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: theme.colors.background },
    header: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border
    },
    backBtn: { padding: 8, backgroundColor: theme.colors.background, borderRadius: 12 },
    headerTitleContainer: { marginLeft: 15 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.heading },
    statusRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
    statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.success },
    statusText: { fontSize: 12, color: theme.colors.textSecondary },

    chatContent: { padding: 20, paddingBottom: 40 },
    messageWrapper: { flexDirection: 'row', marginBottom: 15, maxWidth: '85%' },
    userWrapper: { alignSelf: 'flex-end' },
    botWrapper: { alignSelf: 'flex-start' },
    botIcon: {
        width: 30, height: 30, borderRadius: 15,
        backgroundColor: theme.colors.primary,
        alignItems: 'center', justifyContent: 'center',
        marginRight: 8, marginTop: 5
    },
    messageBubble: { padding: 12, borderRadius: 18 },
    userBubble: { backgroundColor: theme.colors.primary, borderBottomRightRadius: 4 },
    botBubble: { backgroundColor: '#F0F0F0', borderBottomLeftRadius: 4 },
    messageText: { fontSize: 15, lineHeight: 20 },
    userText: { color: '#fff' },
    botText: { color: theme.colors.textPrimary },

    loadingContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, marginBottom: 10 },
    loadingText: { fontSize: 12, color: theme.colors.textSecondary, fontStyle: 'italic' },

    inputArea: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: 15,
        paddingBottom: Platform.OS === 'ios' ? 30 : 15,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: theme.colors.border
    },
    input: {
        flex: 1,
        backgroundColor: theme.colors.background,
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        maxHeight: 100,
        fontSize: 15,
        color: theme.colors.textPrimary
    },
    sendBtn: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: theme.colors.primary,
        alignItems: 'center', justifyContent: 'center',
        marginLeft: 10,
        ...theme.shadows.teal
    },
    sendBtnDisabled: { backgroundColor: theme.colors.textMuted }
});
