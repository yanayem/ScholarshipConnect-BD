/**
 * BROADCAST TOOL: Send messages to all users.
 * - Simple form to write title and message.
 * - Material 3 visual feedback.
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, StatusBar, ScrollView,
  Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import { theme } from '../../theme';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { apiService } from '../../services/api';

export default function BroadcastMessage() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const router = useRouter();

  const handleSend = async () => {
    if (!title || !message) {
      Alert.alert('Oops', 'Please fill in all boxes');
      return;
    }

    setSending(true);
    try {
      const res = await apiService.sendBroadcast(title, message);
      if (res.ok) {
        Alert.alert('Success', 'Message sent to all users!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        Alert.alert('Error', 'Failed to send broadcast');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error');
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.surface} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back" size={24} color={theme.colors.heading} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Send Message</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
            <View style={styles.infoBox}>
                <Ionicons name="information-circle" size={20} color={theme.colors.primary} />
                <Text style={styles.infoText}>This message will go to every registered student instantly.</Text>
            </View>

            <View style={styles.form}>
                <Text style={styles.label}>Message Title</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. New Scholarship Alert!"
                    value={title}
                    onChangeText={setTitle}
                />

                <Text style={styles.label}>Message Body</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Write your message here..."
                    multiline
                    numberOfLines={6}
                    value={message}
                    onChangeText={setMessage}
                    textAlignVertical="top"
                />

                <TouchableOpacity
                    style={[styles.sendBtn, sending && { opacity: 0.7 }]}
                    onPress={handleSend}
                    disabled={sending}
                >
                    <Text style={styles.sendBtnText}>
                        {sending ? 'Sending...' : 'Send to Everyone'}
                    </Text>
                    {!sending && <MaterialIcons name="send" size={20} color="#FFF" />}
                </TouchableOpacity>
            </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: theme.colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider
  },
  headerTitle: { fontSize: 20, fontFamily: theme.typography.fontFamily.bold, color: theme.colors.heading },
  scroll: { padding: 24 },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primaryLight,
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 30,
    alignItems: 'center'
  },
  infoText: { flex: 1, fontSize: 13, color: theme.colors.primary, fontFamily: theme.typography.fontFamily.medium },
  form: { gap: 20 },
  label: { fontSize: 14, fontFamily: theme.typography.fontFamily.bold, color: theme.colors.textSecondary, marginLeft: 4 },
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.divider,
    borderRadius: 14,
    padding: 16,
    fontSize: 15,
    fontFamily: theme.typography.fontFamily.medium
  },
  textArea: { height: 150 },
  sendBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 18,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginTop: 20,
    ...theme.shadows.teal
  },
  sendBtnText: { color: '#FFF', fontSize: 16, fontFamily: theme.typography.fontFamily.bold }
});
