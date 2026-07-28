import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Image, ActivityIndicator, StatusBar, Modal, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { MaterialIcons, Ionicons, Feather } from '@expo/vector-icons';
import { theme } from '../../theme';
import { apiService } from '../../services/api';

export default function ChatScreen() {
  const { id, name, avatar } = useLocalSearchParams();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const flatListRef = useRef();

  const loadChat = async () => {
    try {
      const [historyRes, profileRes] = await Promise.all([
        apiService.getChatHistory(id),
        apiService.getProfile()
      ]);

      if (profileRes.ok) setCurrentUser(profileRes.data);
      if (historyRes.ok && Array.isArray(historyRes.data)) {
        setMessages(historyRes.data); // Backend returns in ascending order
      }
    } catch (error) {
      console.error('Failed to load chat history', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChat();
    // Poll for new messages every 5 seconds
    const interval = setInterval(loadChat, 5000);
    return () => clearInterval(interval);
  }, [id]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const text = inputText.trim();

    if (editingMessage) {
        // Edit mode
        const res = await apiService.editMessage(editingMessage.id, text);
        if (res.ok) {
            setMessages(prev => prev.map(m => m.id === editingMessage.id ? { ...m, message: text } : m));
            setEditingMessage(null);
            setInputText('');
        }
        return;
    }

    setInputText('');
    setSending(true);

    const res = await apiService.sendMessage(id, text);
    if (res.ok) {
      // Use the actual data from server which contains the real database ID
      const newMessage = {
        ...res.data,
        is_me: true
      };
      setMessages(prev => [...prev, newMessage]);
      setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
    }
    setSending(false);
  };

  const handleLongPress = (item) => {
    setSelectedMessage(item);
    setActionModalVisible(true);
  };

  const handleEdit = () => {
    setEditingMessage(selectedMessage);
    setInputText(selectedMessage.message);
    setActionModalVisible(false);
  };

  const handleDelete = async () => {
    if (!selectedMessage) return;
    const res = await apiService.deleteMessage(selectedMessage.id);
    if (res.ok) {
      setMessages(prev => prev.filter(m => m.id !== selectedMessage.id));
      setActionModalVisible(false);
    } else {
      Alert.alert('Error', 'Could not delete message.');
    }
  };

  const renderMessage = ({ item, index }) => {
    if (!item) return null;
    const currentUserId = currentUser?.user_id || currentUser?.user || currentUser?.id;
    const isMine = item.sender === currentUserId;

    // logic for session time
    let showSessionTime = false;
    const currentMsgTime = new Date(item.created_at);

    if (index === 0) {
      showSessionTime = true;
    } else {
      const prevMsg = messages[index - 1];
      if (prevMsg) {
        const prevMsgTime = new Date(prevMsg.created_at);
        const diffInMinutes = (currentMsgTime - prevMsgTime) / (1000 * 60);
        if (diffInMinutes > 30) {
          showSessionTime = true;
        }
      }
    }

    return (
      <View key={item.id || index}>
        {showSessionTime && (
          <View style={styles.sessionTimeContainer}>
            <Text style={styles.sessionTimeText}>
              {currentMsgTime.toLocaleDateString([], { month: 'short', day: 'numeric' })} • {currentMsgTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        )}
        <View style={[styles.messageContainer, isMine ? styles.myMessage : styles.theirMessage]}>
          {!isMine && (
             <Image source={{ uri: avatar || theme.images.avatar + name }} style={styles.miniAvatar} />
          )}
          <View style={isMine ? styles.bubbleWithActions : { maxWidth: '85%' }}>
            {isMine && (
              <TouchableOpacity
                style={styles.threeDotBtn}
                onPress={() => {
                  setSelectedMessage(item);
                  setActionModalVisible(true);
                }}
              >
                <MaterialIcons name="more-vert" size={18} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              activeOpacity={0.8}
              onLongPress={() => {
                setSelectedMessage(item);
                setActionModalVisible(true);
              }}
              style={[styles.bubble, isMine ? styles.myBubble : styles.theirBubble]}
            >
              <Text style={[styles.messageText, isMine ? styles.myText : styles.theirText]}>{item.message}</Text>
              {isMine && (
                <View style={styles.statusRow}>
                   <MaterialIcons
                     name={item.is_read ? "done-all" : "check"}
                     size={15}
                     color={item.is_read ? "#40FBFF" : "rgba(255,255,255,0.5)"}
                   />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.heading} />
        </TouchableOpacity>
        <Image source={{ uri: avatar || theme.images.avatar + name }} style={styles.headerAvatar} />
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{name}</Text>
          <Text style={styles.onlineStatus}>Online</Text>
        </View>
        <TouchableOpacity style={styles.headerAction}>
          <Feather name="phone" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={theme.colors.primary} size="large" />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages.filter(m => m !== null)}
          renderItem={renderMessage}
          keyExtractor={(item, index) => item?.id?.toString() || `msg-${index}`}
          contentContainerStyle={styles.list}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        />
      )}

      {/* Edit Hint */}
      {editingMessage && (
        <View style={styles.editBar}>
           <Text style={styles.editText}>Editing Message...</Text>
           <TouchableOpacity onPress={() => { setEditingMessage(null); setInputText(''); }}>
              <MaterialIcons name="close" size={20} color={theme.colors.primary} />
           </TouchableOpacity>
        </View>
      )}

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputRow}>
          <TouchableOpacity style={styles.attachBtn}>
            <Ionicons name="add" size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder={editingMessage ? "Edit your message..." : "Type a message..."}
            value={inputText}
            onChangeText={setInputText}
            multiline
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[styles.sendBtn, !inputText.trim() && { opacity: 0.5 }]}
            onPress={handleSend}
            disabled={!inputText.trim() || sending}
          >
            {sending ? <ActivityIndicator color="#fff" size="small" /> : (
                <MaterialIcons name={editingMessage ? "check" : "send"} size={24} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Message Actions Modal */}
      <Modal
        visible={actionModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setActionModalVisible(false)}
      >
        <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setActionModalVisible(false)}
        >
            <View style={styles.actionMenu}>
                {selectedMessage?.sender === (currentUser?.user_id || currentUser?.user || currentUser?.id) && (
                    <TouchableOpacity style={styles.actionBtn} onPress={handleEdit}>
                        <MaterialIcons name="edit" size={20} color={theme.colors.primary} />
                        <Text style={styles.actionText}>Edit Message</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={[styles.actionBtn, { borderBottomWidth: 0 }]} onPress={handleDelete}>
                    <MaterialIcons name="delete-outline" size={20} color={theme.colors.error} />
                    <Text style={[styles.actionText, { color: theme.colors.error }]}>Unsend for everyone</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15,
    paddingTop: Platform.OS === 'ios' ? 50 : 40, paddingBottom: 15,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: theme.colors.divider
  },
  backBtn: { padding: 5, marginRight: 10 },
  headerAvatar: { width: 40, height: 40, borderRadius: 20 },
  headerInfo: { flex: 1, marginLeft: 12 },
  headerName: { fontSize: 16, fontWeight: 'bold', color: theme.colors.heading },
  onlineStatus: { fontSize: 12, color: theme.colors.success, fontWeight: '500' },
  headerAction: { padding: 8 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 15 },
  messageContainer: { flexDirection: 'row', marginBottom: 15, alignItems: 'flex-end' },
  myMessage: { justifyContent: 'flex-end' },
  theirMessage: { justifyContent: 'flex-start' },
  miniAvatar: { width: 28, height: 28, borderRadius: 14, marginRight: 8 },
  bubbleWithActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  threeDotBtn: {
    padding: 4,
    opacity: 0.6,
  },
  bubble: { maxWidth: '85%', padding: 12, borderRadius: 18 },
  myBubble: { backgroundColor: theme.colors.primary, borderBottomRightRadius: 4 },
  theirBubble: { backgroundColor: '#fff', borderBottomLeftRadius: 4, elevation: 1 },
  messageText: { fontSize: 15, lineHeight: 20 },
  myText: { color: '#fff' },
  theirText: { color: theme.colors.textPrimary },
  timeText: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end', opacity: 0.6 },
  sessionTimeContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  sessionTimeText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontWeight: '500',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 2,
  },
  editBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: theme.colors.primaryLight,
    borderTopWidth: 1,
    borderTopColor: theme.colors.primary,
  },
  editText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: 'bold'
  },
  inputRow: { flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: theme.colors.divider },
  attachBtn: { padding: 8 },
  input: { flex: 1, backgroundColor: '#F1F3F5', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 8, maxHeight: 100, fontSize: 15 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },

  // Modal Actions
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  actionMenu: { backgroundColor: '#fff', width: '70%', borderRadius: 15, overflow: 'hidden' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', padding: 15, gap: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  actionText: { fontSize: 16, fontWeight: '500' }
});
