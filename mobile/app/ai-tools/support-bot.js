import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, TextInput,
    FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, StatusBar, Alert
} from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import { apiService } from '../../services/api';
import { cacheService } from '../../services/cache';

export default function SupportBotScreen() {
    const [messages, setMessages] = useState([
        { id: '1', text: 'Hello! I am your ScholarshipConnect AI Assistant. How can I help you today?', isUser: false }
    ]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [editingMessageId, setEditingMessageId] = useState(null);
    const flatListRef = useRef(null);

    useEffect(() => {
        loadHistory();
    }, []);

    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

    const isWithin30Days = (msg) => {
        if (!msg) return false;
        if (msg.created_at) {
            const time = new Date(msg.created_at).getTime();
            return !isNaN(time) && (Date.now() - time) <= THIRTY_DAYS_MS;
        }
        if (msg.id && !isNaN(Number(msg.id)) && Number(msg.id) > 1000000000000) {
            const time = Number(msg.id);
            return (Date.now() - time) <= THIRTY_DAYS_MS;
        }
        return true;
    };

    const loadHistory = async () => {
        // 1. Try Cache First
        try {
            const cachedHistory = await cacheService.get('ai_chat_history');
            if (cachedHistory && cachedHistory.length > 0) {
                const validHistory = cachedHistory.filter(isWithin30Days);
                const formatted = validHistory.map((m, index) => ({
                    id: m.id ? m.id.toString() : `history-${index}`,
                    text: m.message,
                    isUser: m.is_user,
                    created_at: m.created_at
                }));
                setMessages([
                    { id: '1', text: 'Hello! I am your ScholarshipConnect AI Assistant. How can I help you today?', isUser: false },
                    ...formatted
                ]);
                setHistoryLoading(false);
            }
        } catch (e) {}

        try {
            const res = await apiService.getAIChatHistory();
            if (res.ok && res.data && res.data.length > 0) {
                const validHistory = res.data.filter(isWithin30Days);
                const formattedMessages = validHistory.map((m, index) => ({
                    id: m.id ? m.id.toString() : `history-${index}`,
                    text: m.message,
                    isUser: m.is_user,
                    created_at: m.created_at
                }));
                setMessages([
                    { id: '1', text: 'Hello! I am your ScholarshipConnect AI Assistant. How can I help you today?', isUser: false },
                    ...formattedMessages
                ]);
                await cacheService.set('ai_chat_history', validHistory, 60 * 24 * 30); // Cache for 30 days
            }
        } catch (error) {
            console.error('[SupportBot] Load History Error:', error);
        } finally {
            setHistoryLoading(false);
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 300);
        }
    };

    const saveToLocalCache = async (allMessages) => {
        try {
            const formattedForCache = allMessages
                .filter(m => m.id !== '1' && !m.text.includes('trouble connecting'))
                .filter(isWithin30Days)
                .map(m => ({
                    id: m.id,
                    message: m.text,
                    is_user: m.isUser,
                    created_at: m.created_at || new Date().toISOString()
                }));
            await cacheService.set('ai_chat_history', formattedForCache, 60 * 24 * 30); // Cache for 30 days
        } catch (e) {
            console.error('[SupportBot] Update Cache Error:', e);
        }
    };

    useEffect(() => {
        if (messages.length > 1) {
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 200);
        }
    }, [messages.length]);

    const handleLongPress = (item) => {
        if (item.id === '1') return; // Do not edit/delete default greeting

        const options = item.isUser
            ? [
                { text: 'Edit Message', onPress: () => startEditMessage(item) },
                { text: 'Delete Message', style: 'destructive', onPress: () => confirmDeleteMessage(item) },
                { text: 'Cancel', style: 'cancel' }
            ]
            : [
                { text: 'Delete Message', style: 'destructive', onPress: () => confirmDeleteMessage(item) },
                { text: 'Cancel', style: 'cancel' }
            ];

        Alert.alert(
            item.isUser ? 'Message Options' : 'AI Message Options',
            'Select an action:',
            options
        );
    };

    const startEditMessage = (item) => {
        setEditingMessageId(item.id);
        setInputText(item.text);
    };

    const cancelEditMessage = () => {
        setEditingMessageId(null);
        setInputText('');
    };

    const confirmDeleteMessage = (item) => {
        Alert.alert(
            'Delete Message',
            'Are you sure you want to delete this message?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => deleteMessage(item) }
            ]
        );
    };

    const deleteMessage = async (item) => {
        const index = messages.findIndex(m => m.id === item.id);
        if (index === -1) return;

        let idsToRemove = [item.id];
        // If user message is deleted, also remove its corresponding AI response immediately following it
        if (item.isUser && index + 1 < messages.length && !messages[index + 1].isUser) {
            idsToRemove.push(messages[index + 1].id);
        }

        const updated = messages.filter(m => !idsToRemove.includes(m.id));
        setMessages(updated);
        await saveToLocalCache(updated);

        if (item.id && !item.id.toString().startsWith('temp-') && !item.id.toString().startsWith('history-')) {
            try {
                await apiService.deleteAIChatMessage(item.id);
            } catch (e) {
                console.error('[SupportBot] Delete API Error:', e);
            }
        }
    };

    const handleSend = async () => {
        if (!inputText.trim() || loading) return;

        if (editingMessageId) {
            const updatedText = inputText.trim();
            const targetId = editingMessageId;
            setEditingMessageId(null);
            setInputText('');

            const updatedMessages = messages.map(m =>
                m.id === targetId ? { ...m, text: updatedText, isEdited: true } : m
            );
            setMessages(updatedMessages);
            await saveToLocalCache(updatedMessages);

            if (targetId && !targetId.toString().startsWith('temp-') && !targetId.toString().startsWith('history-')) {
                try {
                    await apiService.updateAIChatMessage(targetId, updatedText);
                } catch (e) {
                    console.error('[SupportBot] Update API Error:', e);
                }
            }
            return;
        }

        const tempUserMsgId = `temp-${Date.now()}`;
        const userMessage = { id: tempUserMsgId, text: inputText, isUser: true };
        const updatedWithUser = [...messages, userMessage];
        setMessages(updatedWithUser);
        setInputText('');
        setLoading(true);

        // Prepare history for context (last 6 valid messages)
        const history = messages
            .filter(m => m.text && !m.text.includes('trouble connecting') && !m.text.includes('unavailable') && !m.text.includes('experiencing high demand'))
            .slice(-6)
            .map(m => m.text);

        const res = await apiService.aiLiveSupport(userMessage.text, history);

        if (res.ok) {
            const realUserMsgId = res.data.user_msg_id ? res.data.user_msg_id.toString() : tempUserMsgId;
            const realAiMsgId = res.data.ai_msg_id ? res.data.ai_msg_id.toString() : `temp-${Date.now() + 1}`;

            const botMessage = { id: realAiMsgId, text: res.data.response, isUser: false };
            const finalMessages = updatedWithUser.map(m => m.id === tempUserMsgId ? { ...m, id: realUserMsgId } : m).concat(botMessage);

            setMessages(finalMessages);
            await saveToLocalCache(finalMessages);
        } else {
            const errorMessage = { id: `temp-${Date.now() + 1}`, text: 'Sorry, I am having trouble connecting right now.', isUser: false };
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

            {item.isUser && item.id !== '1' && (
                <TouchableOpacity
                    onPress={() => handleLongPress(item)}
                    style={styles.moreOptionsBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <MaterialIcons name="more-vert" size={18} color={theme.colors.textMuted} />
                </TouchableOpacity>
            )}

            <TouchableOpacity
                activeOpacity={0.85}
                onLongPress={() => handleLongPress(item)}
                style={[styles.messageBubble, item.isUser ? styles.userBubble : styles.botBubble]}
            >
                <Text style={[styles.messageText, item.isUser ? styles.userText : styles.botText]}>
                    {item.text}
                </Text>
                {item.isEdited && (
                    <Text style={[styles.editedLabel, item.isUser ? styles.userEditedLabel : styles.botEditedLabel]}>
                        (edited)
                    </Text>
                )}
            </TouchableOpacity>

            {!item.isUser && item.id !== '1' && (
                <TouchableOpacity
                    onPress={() => handleLongPress(item)}
                    style={styles.moreOptionsBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <MaterialIcons name="more-vert" size={18} color={theme.colors.textMuted} />
                </TouchableOpacity>
            )}
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

            {historyLoading && messages.length <= 1 ? (
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

            {editingMessageId && (
                <View style={styles.editingBanner}>
                    <View style={styles.editingBannerLeft}>
                        <MaterialIcons name="edit" size={16} color={theme.colors.primary} />
                        <Text style={styles.editingBannerText}>Editing message...</Text>
                    </View>
                    <TouchableOpacity onPress={cancelEditMessage} style={styles.cancelEditBtn}>
                        <MaterialIcons name="close" size={18} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                </View>
            )}

            <View style={styles.inputArea}>
                <TextInput
                    style={styles.input}
                    placeholder={editingMessageId ? "Edit your message..." : "Ask me anything..."}
                    value={inputText}
                    onChangeText={setInputText}
                    multiline
                />
                <TouchableOpacity
                    style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
                    onPress={handleSend}
                    disabled={!inputText.trim() || loading}
                >
                    <Ionicons name={editingMessageId ? "checkmark" : "send"} size={20} color="#fff" />
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
    messageWrapper: { flexDirection: 'row', marginBottom: 15, maxWidth: '85%', alignItems: 'center' },
    userWrapper: { alignSelf: 'flex-end' },
    botWrapper: { alignSelf: 'flex-start' },
    moreOptionsBtn: { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 },
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
    editedLabel: { fontSize: 10, marginTop: 4, fontStyle: 'italic', alignSelf: 'flex-end' },
    userEditedLabel: { color: 'rgba(255, 255, 255, 0.7)' },
    botEditedLabel: { color: theme.colors.textMuted },

    loadingContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, marginBottom: 10 },
    loadingText: { fontSize: 12, color: theme.colors.textSecondary, fontStyle: 'italic' },

    editingBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justify: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 8,
        backgroundColor: '#E6F4F1',
        borderTopWidth: 1,
        borderTopColor: theme.colors.border
    },
    editingBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    editingBannerText: { fontSize: 13, fontWeight: '600', color: theme.colors.primary },
    cancelEditBtn: { padding: 4 },

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
