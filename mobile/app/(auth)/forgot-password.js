import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView,
  StatusBar, Dimensions, ActivityIndicator, Alert
} from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme';
import CustomInput from '../../components/CustomInput';
import { useToast } from '../../components/Toast';
import { firebaseAuth } from '../../services/firebase';

const { width, height } = Dimensions.get('window');

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast, ToastComponent } = useToast();

  const handleResetPassword = async () => {
    if (!email) {
      showToast('Please enter your email address', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    setLoading(true);
    try {
      console.log('[FORGOT PASSWORD] Sending reset email to:', email.trim());
      await firebaseAuth.sendPasswordReset(email.trim().toLowerCase());

      Alert.alert(
        "Email Sent",
        "A password reset link has been sent to your email address. Please check your inbox or spam folder.",
        [{ text: "Back to Login", onPress: () => router.back() }]
      );
    } catch (error) {
      console.log('[FORGOT PASSWORD ERROR]:', error);
      let errorMsg = 'Failed to send reset email.';

      if (error.code === 'auth/user-not-found') {
        errorMsg = 'No account found with this email.';
      } else if (error.code === 'auth/invalid-email') {
        errorMsg = 'The email address is badly formatted.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMsg = 'Too many attempts. Please try again later.';
      } else {
        errorMsg = error.message || 'An unexpected error occurred.';
      }

      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {ToastComponent}

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <MaterialIcons name="arrow-back-ios" size={24} color={theme.colors.heading} />
      </TouchableOpacity>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.headerSection}>
            <View style={styles.iconCircle}>
              <MaterialIcons name="lock-reset" size={50} color={theme.colors.primary} />
            </View>
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              Enter your email address and we&apos;ll send you a link to reset your password.
            </Text>
          </View>

          <View style={[styles.formCard, theme.shadows.premium]}>
            <CustomInput
              label="Email Address"
              icon="mail-outline"
              placeholder="Enter your registered email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!loading}
            />

            <TouchableOpacity
              style={[styles.resetButton, loading && { opacity: 0.8 }, theme.shadows.teal]}
              onPress={handleResetPassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text style={styles.resetButtonText}>Send Reset Link</Text>
                  <MaterialIcons name="send" size={20} color="white" />
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Remember your password? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background },
  backButton: {
    padding: 20,
    marginTop: Platform.OS === 'ios' ? 40 : 20,
    zIndex: 10,
  },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },
  headerSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.heading,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  formCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 32,
    padding: 32,
    marginBottom: 32,
  },
  resetButton: {
    backgroundColor: theme.colors.primary,
    height: 58,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 10,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.bold,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 14,
  },
  loginLink: {
    color: theme.colors.primary,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 15,
  },
});
