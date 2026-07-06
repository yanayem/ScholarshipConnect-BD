import React, { useState, useEffect } from 'react';
import {
  Modal, View, Text, TextInput,
  TouchableOpacity, StyleSheet, Dimensions,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../theme';
import { useToast } from './Toast';

const { width } = Dimensions.get('window');

export default function GuestIdentityModal({ visible, onClose, onSave }) {
  const [email, setEmail] = useState('');
  const { showToast, ToastComponent } = useToast();

  useEffect(() => {
    const loadEmail = async () => {
      const saved = await AsyncStorage.getItem('guest_email');
      if (saved) setEmail(saved);
    };
    if (visible) loadEmail();
  }, [visible]);

  const handleSave = async () => {
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email', 'warning');
      return;
    }
    try {
      await AsyncStorage.setItem('guest_email', email);
      showToast('Identity saved!', 'success');
      setTimeout(() => {
        onSave(email);
        onClose();
      }, 1000);
    } catch (error) {
      showToast('Failed to save identity', 'error');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.title}>Identify as Guest</Text>
              <TouchableOpacity onPress={onClose}>
                <MaterialIcons name="close" size={24} color={theme.colors.placeholder} />
              </TouchableOpacity>
            </View>

            <Text style={styles.subtitle}>
              Enter your email to save scholarships and receive updates without an account.
            </Text>

            <View style={styles.inputWrap}>
              <MaterialIcons name="email" size={20} color={theme.colors.primary} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={styles.btn}
              onPress={handleSave}
            >
              <Text style={styles.btnText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
        {ToastComponent}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: width * 0.85,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    ...theme.shadows.premium,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.heading,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 24,
    lineHeight: 20,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 24,
  },
  icon: { marginRight: 10 },
  input: {
    flex: 1,
    height: 48,
    fontSize: 15,
  },
  btn: {
    backgroundColor: theme.colors.primary,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.bold,
  },
});
