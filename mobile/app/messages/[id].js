import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Image, ActivityIndicator, StatusBar, Modal, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { MaterialIcons, Ionicons, Feather, FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../theme';
import { apiService } from '../../services/api';
import { useUser } from '../../context/UserContext';
import Animated, { FadeInUp, ZoomIn } from 'react-native-reanimated';
import Markdown from 'react-native-markdown-display';

const REACTIONS = [
  { emoji: '👍', label: 'Like' },
  { emoji: '👏', label: 'Celebrate' },
  { emoji: '❤️', label: 'Support' },
  { emoji: '💡', label: 'Insightful' },
  { emoji: '😮', label: 'Curious' }
];

const MessageItem = memo(({ item, index, messages, currentUser, avatar, name, onAction, onReact }) => {
  if (!item) return null;

  // Handles both sender_id (from your DB) and sender (fallback)
  const currentUserId = String(currentUser?.user_id || currentUser?.user || currentUser?.id || '');
  const senderId = String(item.sender_id || item.sender || '');
  const isMine = senderId === currentUserId || item.is_me === true;

  const prevMsg = index > 0 ? messages[index - 1] : null;
  const nextMsg = index < messages.length - 1 ? messages[index + 1] : null;

  const isLastInGroup = !nextMsg || String(nextMsg.sender) !== senderId;
  const isFirstInGroup = !prevMsg || String(prevMsg.sender) !== senderId;

  // Session time logic (30 min gap)
  let showSessionTime = false;
  const currentMsgTime = new Date(item.created_at);
  if (isFirstInGroup) {
    if (index === 0) {
      showSessionTime = true;
    } else if (prevMsg) {
      const prevMsgTime = new Date(prevMsg.created_at);
      const diffInMinutes = (currentMsgTime - prevMsgTime) / (1000 * 60);
      if (diffInMinutes > 30) showSessionTime = true;
    }
  }

  return (
    <View style={{ marginBottom: item.reaction ? (isLastInGroup ? 20 : 15) : (isLastInGroup ? 12 : 2) }}>
      {showSessionTime && (
        <View style={styles.sessionTimeContainer}>
          <Text style={styles.sessionTimeText}>
            {currentMsgTime.toLocaleDateString([], { month: 'short', day: 'numeric' })} • {currentMsgTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      )}

      <View style={[styles.messageContainer, isMine ? styles.myMessage : styles.theirMessage]}>
        {!isMine && (
           <View style={styles.avatarSpace}>
             {isLastInGroup ? (
               <Image source={{ uri: avatar || theme.images.avatar + name }} style={styles.miniAvatar} />
             ) : null}
           </View>
        )}

        <View style={[
          styles.bubbleContainer,
          isMine ? { alignItems: 'flex-end' } : { alignItems: 'flex-start' }
        ]}>
          <TouchableOpacity
            activeOpacity={0.9}
            onLongPress={() => onAction(item)}
            delayLongPress={300}
            style={[
              styles.bubble,
              !isMine && styles.theirBubble,
              isMine ? {
                borderTopRightRadius: isFirstInGroup ? 20 : 4,
                borderBottomRightRadius: isLastInGroup ? 20 : 4,
              } : {
                borderTopLeftRadius: isFirstInGroup ? 20 : 4,
                borderBottomLeftRadius: isLastInGroup ? 20 : 4,
              },
              item.reaction ? { paddingBottom: 14 } : null
            ]}
          >
            {isMine && (
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            )}
            {item.sender_is_staff && !isMine && (
                <Text style={styles.roleTagAdmin}>STAFF</Text>
            )}
            {item.sender_is_mentor && !isMine && (
                <Text style={styles.roleTagMentor}>MENTOR</Text>
            )}

            {item.image && (
              <Image source={{ uri: item.image }} style={styles.messageImage} resizeMode="cover" />
            )}

            {item.message ? (
              <Markdown
                style={{
                  body: {
                    ...styles.messageText,
                    color: isMine ? '#fff' : theme.colors.textPrimary,
                  },
                  strong: {
                    fontWeight: 'bold',
                    color: isMine ? '#fff' : theme.colors.textPrimary,
                  },
                  paragraph: {
                    marginBottom: 0,
                    marginTop: 0,
                  }
                }}
              >
                {item.message}
              </Markdown>
            ) : null}
          </TouchableOpacity>

          {item.reaction && (
            <Animated.View entering={ZoomIn} style={[styles.reactionBadge, isMine ? { right: 5 } : { left: 5 }]}>
              <Text style={styles.reactionEmoji}>{item.reaction}</Text>
            </Animated.View>
          )}
        </View>
      </View>

      {isMine && isLastInGroup && (
        <View style={styles.statusRow}>
          <MaterialIcons
            name={item.is_read ? "done-all" : "check-circle"}
            size={12}
            color={item.is_read ? theme.colors.primary : theme.colors.placeholder}
            style={styles.checkIcon}
          />
        </View>
      )}
    </View>
  );
});
MessageItem.displayName = 'MessageItem';

export default function ChatScreen() {
  const { id, name, avatar, prefill } = useLocalSearchParams();
  const { user: currentUser, loading: userLoading } = useUser();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState(prefill || '');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const flatListRef = useRef();

  const loadChat = useCallback(async (isFirstLoad = false) => {
    if (!id || id === 'undefined') return;
    try {
      const historyRes = await apiService.getChatHistory(id);

      if (historyRes.ok) {
        let serverData = [];
        const rawData = historyRes.data;

        if (Array.isArray(rawData)) {
          serverData = rawData;
        } else if (rawData && typeof rawData === 'object') {
          serverData = rawData.messages || rawData.data || rawData.chat_history || rawData.results || rawData.history || [];

          if (serverData.length === 0 && (rawData._id || rawData.id || rawData.message)) {
            serverData = [rawData];
          }
        }

        setMessages(prev => {
          const messageMap = new Map();

          serverData.forEach(msg => {
            const key = String(msg.id || msg._id || msg.message_id || `msg-${msg.created_at}-${msg.sender}`);
            messageMap.set(key, msg);
          });

          prev.forEach(msg => {
            const key = String(msg.id || msg._id || '');
            if (key.startsWith('temp-')) {
               const isSynced = Array.from(messageMap.values()).some(m => m.message === msg.message && !String(m.id).includes('temp'));
               if (!isSynced) messageMap.set(key, msg);
            }
          });

          const finalMessages = Array.from(messageMap.values()).sort((a, b) =>
            new Date(a.created_at) - new Date(b.created_at)
          );

          if ((isFirstLoad || finalMessages.length > prev.length) && finalMessages.length > 0) {
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 300);
          }
          return finalMessages;
        });
      } else {
        console.warn(`[CHAT] Could not fetch history for user ${id}. Status: ${historyRes.status}`);
      }
    } catch (error) {
      if (isFirstLoad) console.error('[CHAT] Load Error:', error);
    } finally {
      if (isFirstLoad) setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadChat(true);
    const interval = setInterval(() => loadChat(false), 3000);
    return () => clearInterval(interval);
  }, [id, loadChat]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
    }
  };

  const handleSend = async () => {
    if ((!inputText.trim() && !selectedImage) || sending) return;

    const text = inputText.trim();
    const image = selectedImage;
    setSending(true);
    setSelectedImage(null);
    setInputText('');

    try {
      if (editingMessage) {
        const msgId = editingMessage.id || editingMessage.message_id;
        const res = await apiService.editMessage(msgId, text);
        if (res.ok) {
          setMessages(prev => prev.map(m =>
            (m.id == msgId || m.message_id == msgId) ? { ...m, message: text } : m
          ));
          setEditingMessage(null);
        } else {
          Alert.alert('Error', res.data?.error || 'Failed to edit message.');
        }
        setSending(false);
        return;
      }

      const currentUserId = currentUser?.user_id || currentUser?.user || currentUser?.id;
      const tempId = `temp-${Date.now()}`;
      const optimisticMessage = {
        id: tempId,
        sender: currentUserId,
        message: text,
        image: image ? image.uri : null,
        created_at: new Date().toISOString(),
        is_read: false,
        is_me: true
      };

      setMessages(prev => [...prev, optimisticMessage]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);

      const res = await apiService.sendMessage(id, text, image);

      if (res.ok && res.data) {
        const serverId = res.data._id || res.data.id || res.data.message_id;
        setMessages(prev => prev.map(m => m.id === tempId ? { ...res.data, id: serverId, _id: serverId, is_me: true } : m));
      } else {
        setMessages(prev => prev.filter(m => m.id !== tempId));
        Alert.alert('Error', 'Failed to send message.');
        setInputText(text);
        setSelectedImage(image);
      }
    } catch (error) {
      console.error('[CHAT] handleSend Error:', error);
    } finally {
      setSending(false);
    }
  };

  const handleReact = async (emoji) => {
    if (!selectedMessage) return;
    const msgId = selectedMessage._id || selectedMessage.id || selectedMessage.message_id;
    setActionModalVisible(false);

    // Optimistic update
    setMessages(prev => prev.map(m =>
      (m._id == msgId || m.id == msgId || m.message_id == msgId) ? { ...m, reaction: emoji } : m
    ));

    const res = await apiService.reactToMessage(msgId, emoji);
    if (!res.ok) {
      loadChat(false);
    }
  };

  const handleLongPress = (item) => {
    setSelectedMessage(item);
    setActionModalVisible(true);
  };

  const handleEdit = () => {
    const msgId = selectedMessage._id || selectedMessage.id || selectedMessage.message_id;
    if (!msgId) {
      Alert.alert('Action Unavailable', 'This message cannot be edited because it lacks a unique ID from the server.');
      return;
    }
    setEditingMessage(selectedMessage);
    setInputText(selectedMessage.message);
    setActionModalVisible(false);
  };

  const handleDelete = async () => {
    if (!selectedMessage) return;
    const msgId = selectedMessage._id || selectedMessage.id || selectedMessage.message_id;

    if (!msgId) {
      Alert.alert('Action Unavailable', 'This message cannot be deleted because it lacks a unique ID from the server.');
      return;
    }

    const res = await apiService.deleteMessage(msgId);
    if (res.ok) {
      setMessages(prev => prev.filter(m => (m._id != msgId && m.id != msgId && m.message_id != msgId)));
      setActionModalVisible(false);
    } else {
      Alert.alert('Error', 'Could not delete message.');
    }
  };

  const renderMessage = useCallback(({ item, index }) => (
    <MessageItem
      item={item}
      index={index}
      messages={messages}
      currentUser={currentUser}
      avatar={avatar}
      name={name}
      onAction={handleLongPress}
    />
  ), [messages, currentUser, avatar, name]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/inbox')}
          style={styles.backBtn}
        >
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.heading} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerProfileContainer}
          onPress={() => router.push(`/mentorship/${id}`)}
        >
          <Image source={{ uri: avatar || theme.images.avatar + name }} style={styles.headerAvatar} />
          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>{name}</Text>
            <Text style={styles.onlineStatus}>Online</Text>
          </View>
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
          keyExtractor={(item, index) => {
            const key = item?._id || item?.id || item?.message_id || `msg-${item?.created_at}-${item?.sender}-${index}`;
            return String(key);
          }}
          contentContainerStyle={styles.list}
          onContentSizeChange={() => {
            if (messages.length > 0) {
              flatListRef.current?.scrollToEnd({ animated: false });
            }
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No messages yet. Say hello!</Text>
            </View>
          }
        />
      )}

      {/* Image Preview */}
      {selectedImage && (
        <View style={styles.imagePreviewBar}>
          <Image source={{ uri: selectedImage.uri }} style={styles.miniPreview} />
          <TouchableOpacity onPress={() => setSelectedImage(null)} style={styles.removeImgBtn}>
            <MaterialIcons name="close" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
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
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={{ backgroundColor: theme.colors.surface }}
      >
        <View style={styles.inputRow}>
          <TouchableOpacity style={styles.attachBtn} onPress={pickImage}>
            <MaterialIcons name="image" size={26} color={theme.colors.primary} />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder={editingMessage ? "Edit your message..." : "Type a message..."}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxHeight={100}
            returnKeyType="send"
            onSubmitEditing={handleSend}
            onKeyPress={(e) => {
              if (Platform.OS === 'web' && e.nativeEvent.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            blurOnSubmit={false}
            enablesReturnKeyAutomatically
          />

          <TouchableOpacity
            style={[styles.sendBtn, (!inputText.trim() && !selectedImage) && { opacity: 0.5 }]}
            onPress={handleSend}
            disabled={(!inputText.trim() && !selectedImage) || sending}
          >
            {sending ? <ActivityIndicator color="#fff" size="small" /> : (
                <MaterialIcons name={editingMessage ? "check" : "send"} size={20} color="#fff" />
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
            <Animated.View entering={FadeInUp} style={styles.actionMenu}>
                <View style={styles.reactionBar}>
                    {REACTIONS.map(item => (
                        <TouchableOpacity
                          key={item.label}
                          onPress={() => handleReact(item.emoji)}
                          style={styles.reactionItem}
                        >
                            <Text style={styles.reactionEmojiLarge}>{item.emoji}</Text>
                            <Text style={styles.reactionLabelText}>{item.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.menuOptions}>
                  {String(selectedMessage?.sender) === String(currentUser?.user_id || currentUser?.user || currentUser?.id) && (
                      <TouchableOpacity style={styles.actionBtn} onPress={handleEdit}>
                          <MaterialIcons name="edit" size={20} color={theme.colors.primary} />
                          <Text style={styles.actionText}>Edit Message</Text>
                      </TouchableOpacity>
                  )}
                  {(String(selectedMessage?.sender) === String(currentUser?.user_id || currentUser?.user || currentUser?.id) || currentUser?.is_staff) && (
                      <TouchableOpacity style={[styles.actionBtn, { borderBottomWidth: 0 }]} onPress={handleDelete}>
                          <MaterialIcons name="delete-outline" size={20} color={theme.colors.error} />
                          <Text style={[styles.actionText, { color: theme.colors.error }]}>Unsend</Text>
                      </TouchableOpacity>
                  )}
                </View>
            </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15,
    paddingTop: Platform.OS === 'ios' ? 50 : 40, paddingBottom: 15,
    backgroundColor: theme.colors.surface, borderBottomWidth: 0.5, borderBottomColor: theme.colors.divider
  },
  backBtn: { padding: 5, marginRight: 5 },
  headerAvatar: { width: 36, height: 36, borderRadius: 18 },
  headerProfileContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  headerInfo: { flex: 1, marginLeft: 12 },
  headerName: { fontSize: 16, fontWeight: 'bold', color: theme.colors.heading },
  onlineStatus: { fontSize: 12, color: theme.colors.success, fontWeight: '500' },
  headerAction: { padding: 8 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 15, paddingBottom: 30 },
  messageContainer: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 2 },
  myMessage: { justifyContent: 'flex-end' },
  theirMessage: { justifyContent: 'flex-start' },
  avatarSpace: { width: 32, marginRight: 8, alignItems: 'center', justifyContent: 'center' },
  miniAvatar: { width: 24, height: 24, borderRadius: 12 },
  bubbleContainer: { maxWidth: '75%', position: 'relative' },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    overflow: 'hidden',
    minWidth: 60, // Better width for short messages
  },
  myBubble: {
    backgroundColor: theme.colors.primary,
  },
  theirBubble: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.divider
  },
  messageText: { fontSize: 15, lineHeight: 20 },
  myText: { color: '#fff' },
  theirText: { color: theme.colors.textPrimary },
  messageImage: { width: 200, height: 200, borderRadius: 15, marginBottom: 5 },
  roleTagAdmin: { fontSize: 8, fontWeight: 'bold', color: theme.colors.error, marginBottom: 2 },
  roleTagMentor: { fontSize: 8, fontWeight: 'bold', color: theme.colors.primary, marginBottom: 2 },
  reactionBadge: {
    position: 'absolute',
    bottom: -8,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    ...theme.shadows.soft,
    borderWidth: 1.5,
    borderColor: theme.colors.divider,
    zIndex: 10,
  },
  reactionEmoji: { fontSize: 12 },
  statusRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 2 },
  checkIcon: { marginLeft: 4 },
  sessionTimeContainer: { alignItems: 'center', marginVertical: 20 },
  sessionTimeText: { fontSize: 11, color: theme.colors.textSecondary, fontWeight: '600' },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12,
    paddingVertical: 10, backgroundColor: theme.colors.surface, borderTopWidth: 0.5, borderTopColor: theme.colors.divider,
    paddingBottom: Platform.OS === 'ios' ? 30 : 12
  },
  attachBtn: { marginRight: 5 },
  input: {
    flex: 1, backgroundColor: theme.colors.secondaryBackground, borderRadius: 20,
    paddingHorizontal: 15, paddingVertical: 8, fontSize: 15, color: theme.colors.textPrimary
  },
  sendBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.primary,
    justifyContent: 'center', alignItems: 'center', marginLeft: 10
  },
  imagePreviewBar: {
    flexDirection: 'row', padding: 10, backgroundColor: theme.colors.surface, borderTopWidth: 0.5, borderTopColor: theme.colors.divider
  },
  miniPreview: { width: 60, height: 60, borderRadius: 8 },
  removeImgBtn: {
    position: 'absolute', top: 5, left: 55, backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center'
  },
  editBar: { flexDirection: 'row', justifyContent: 'space-between', padding: 10, backgroundColor: theme.colors.primaryLight },
  editText: { color: theme.colors.primary, fontSize: 12, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  actionMenu: { width: '90%', alignItems: 'center' },
  reactionBar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    padding: 12,
    borderRadius: 30,
    gap: 8,
    ...theme.shadows.premium,
    marginBottom: 15
  },
  reactionItem: { alignItems: 'center', paddingHorizontal: 4 },
  reactionEmojiLarge: { fontSize: 26 },
  reactionLabelText: { fontSize: 8, color: theme.colors.textSecondary, marginTop: 2, fontWeight: 'bold' },
  menuOptions: { backgroundColor: theme.colors.surface, width: '80%', borderRadius: 20, overflow: 'hidden', ...theme.shadows.soft },
  actionBtn: { flexDirection: 'row', alignItems: 'center', padding: 15, gap: 15, borderBottomWidth: 0.5, borderBottomColor: theme.colors.divider },
  actionText: { fontSize: 16, fontWeight: '500', color: theme.colors.textPrimary },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  emptyText: { color: theme.colors.textSecondary }
});
