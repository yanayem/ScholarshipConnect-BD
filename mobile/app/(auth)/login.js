/**
 * LOGIN SCREEN: User authentication entry point.
 * - Handles Firebase Hybrid login (Native & Web).
 * - Consolidated to Modular API style for better performance and no warnings.
 */
import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView,
  StatusBar, Dimensions, ActivityIndicator, Alert, Image
} from 'react-native';
import { router, Link } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import CustomInput from '../../components/CustomInput';
import { apiService } from '../../services/api';
import { firebaseAuth } from '../../services/firebase';
import { useToast } from '../../components/Toast';
import { useUser } from '../../context/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const { setUser } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { showToast, ToastComponent } = useToast();
  const passwordRef = useRef(null);

  const isExpoGo = Constants.executionEnvironment === 'storeClient';

  const handleLogin = async () => {
    if (!email || !password) {
      showToast('Please enter email and password', 'error');
      return;
    }

    setLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();

      // Basic validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        showToast('Please enter a valid email address.', 'error');
        setLoading(false);
        return;
      }

      if (isExpoGo) {
         console.log('[LOGIN] Expo Go detected, using Firebase Web SDK fallback.');
      }

      console.log('[LOGIN] Attempting sign-in for:', cleanEmail);

      // 1. Sign in with Firebase using our Unified Service
      const userCredential = await firebaseAuth.signIn(cleanEmail, password);

      // Reload user to get fresh emailVerified status (Crucial for Android/Native)
      await userCredential.reload();
      const updatedUser = firebaseAuth.getCurrentUser();

      /*
      // TEMPORARILY DISABLED: Check if email is verified
      if (!updatedUser.emailVerified) {
        console.log('[LOGIN] Email not verified.');
        await firebaseAuth.signOut();
        showToast('Please verify your email address first. Check your inbox.', 'warning');
        setLoading(false);
        return;
      }
      */

      const idToken = await firebaseAuth.getIdToken();
      console.log('[LOGIN] Step 1 Success. Token received.');

      // 2. Set token in storage and API service
      console.log('[LOGIN] Step 2: Storing token...');
      await apiService.setToken(idToken);

      // 3. Verify and cache profile/roles
      console.log('[LOGIN] Step 3: Verifying with Backend API...');
      const profile = await apiService.getProfile();

      if (profile.ok) {
        console.log('[LOGIN] Step 3 Success. User verified:', profile.data.username);

        // Update global user context immediately
        setUser(profile.data);

        if (profile.data.is_staff) {
          await AsyncStorage.setItem('is_staff', 'true');
        } else {
          await AsyncStorage.removeItem('is_staff');
        }

        showToast('Successfully logged in!', 'success');

        setTimeout(() => {
            router.replace('/(tabs)');
        }, 500);
      } else {
        console.log('[LOGIN] Backend Verification Failed:', profile.data);
        const errorMsg = profile.data?.error || profile.data?.details || 'Backend server rejected the session.';
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.log('[LOGIN ERROR]:', error);
      let errorMsg = 'Login failed.';

      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMsg = 'Incorrect email or password.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMsg = 'Firebase network error. Check your internet.';
      } else if (error.message.includes('Network request failed')) {
        errorMsg = 'Cannot reach the Django server. Is it running?';
      } else {
        errorMsg = error.message || 'An unexpected error occurred.';
      }

      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (isExpoGo) {
      showToast('Google Sign-In requires a Native Development Build. Please use Email/Password in Expo Go.', 'info');
      return;
    }

    setLoading(true);
    try {
      console.log('[LOGIN] Attempting Google Sign-In...');
      const userCredential = await firebaseAuth.signInWithGoogle();
      const idToken = await firebaseAuth.getIdToken();

      if (!idToken) throw new Error('Failed to retrieve ID token from Google account.');

      console.log('[LOGIN] Google Auth Success. Syncing with backend...');
      await apiService.setToken(idToken);

      const profile = await apiService.getProfile();

      if (profile.ok) {
        // Update global user context immediately
        setUser(profile.data);

        if (profile.data.is_staff) {
          await AsyncStorage.setItem('is_staff', 'true');
        } else {
          await AsyncStorage.removeItem('is_staff');
        }

        showToast('Logged in with Google!', 'success');
        setTimeout(() => router.replace('/(tabs)'), 500);
      } else {
        throw new Error(profile.data?.error || 'Backend verification failed.');
      }
    } catch (error) {
      console.log('[GOOGLE LOGIN ERROR]:', error);
      let msg = error.message || 'Google Sign-In failed.';

      if (error.code === 'auth/popup-closed-by-user') {
        msg = 'Login cancelled.';
      } else if (error.message && error.message.includes('not installed')) {
        msg = 'Native Google Sign-In not configured. Use email/password.';
      }

      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      {ToastComponent}

      <View style={styles.topSection}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
        <View style={styles.headerContent}>
          <Text style={styles.welcomeText}>Welcome Back</Text>
          <Text style={styles.subWelcomeText}>Sign in to continue your journey</Text>
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} bounces={false}>
          <View style={[styles.mainCard, theme.shadows.premium]}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>Login Account</Text>
              <View style={styles.titleUnderline} />
            </View>

            <View style={styles.inputsWrapper}>
              <CustomInput
                label="Email Address"
                icon="mail-outline"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                blurOnSubmit={false}
              />
              <View style={{ height: 8 }} />
              <CustomInput
                innerRef={passwordRef}
                label="Security Password"
                icon="lock-outline"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                rightIcon={showPassword ? "visibility" : "visibility-off"}
                onRightIconPress={() => setShowPassword(!showPassword)}
                editable={!loading}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity
                style={styles.forgotBtn}
                onPress={() => router.push('/(auth)/forgot-password')}
                disabled={loading}
              >
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.loginButton, loading && { opacity: 0.8 }, theme.shadows.teal]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text style={styles.loginButtonText}>Sign In</Text>
                  <MaterialIcons name="chevron-right" size={24} color="white" />
                </>
              )}
            </TouchableOpacity>

            <View style={styles.orDivider}>
              <View style={styles.dividerLine} /><Text style={styles.orText}>OR LOGIN WITH</Text><View style={styles.dividerLine} />
            </View>

            <View style={styles.socialGrid}>
              <TouchableOpacity
                style={[styles.socialIconBtn, { borderColor: '#EA4335', width: '100%', flexDirection: 'row', gap: 12 }]}
                onPress={handleGoogleLogin}
                disabled={loading}
              >
                <Ionicons name="logo-google" size={22} color="#EA4335" />
                <Text style={{ fontFamily: theme.typography.fontFamily.bold, color: theme.colors.heading }}>Continue with Google</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.footerSection}>
            <Text style={styles.noAccountText}>New to the platform?</Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity disabled={loading}><Text style={styles.createAccountText}>Create an account</Text></TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background },
  topSection: { height: height * 0.35, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  circle1: { position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.1)' },
  circle2: { position: 'absolute', bottom: -30, left: -30, width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(255,255,255,0.05)' },
  headerContent: { alignItems: 'center', zIndex: 1, marginTop: 20 },
  welcomeText: { fontSize: 28, fontFamily: theme.typography.fontFamily.bold, color: '#fff' },
  subWelcomeText: { fontSize: 14, fontFamily: theme.typography.fontFamily.medium, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  keyboardView: { flex: 1, marginTop: -40 },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },
  mainCard: { backgroundColor: theme.colors.surface, borderRadius: 32, padding: 32, zIndex: 2 },
  formHeader: { marginBottom: 24 },
  formTitle: { fontSize: 20, fontFamily: theme.typography.fontFamily.bold, color: theme.colors.heading },
  titleUnderline: { width: 40, height: 4, backgroundColor: theme.colors.primary, borderRadius: 2, marginTop: 6 },
  inputsWrapper: { gap: 4 },
  forgotBtn: { alignSelf: 'flex-end', marginTop: 8, marginBottom: 24 },
  forgotText: { color: theme.colors.primary, fontFamily: theme.typography.fontFamily.semiBold, fontSize: 13 },
  loginButton: { backgroundColor: theme.colors.primary, height: 58, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  loginButtonText: { color: '#fff', fontSize: 16, fontFamily: theme.typography.fontFamily.bold },
  orDivider: { flexDirection: 'row', alignItems: 'center', marginVertical: 28 },
  dividerLine: { flex: 1, height: 1, backgroundColor: theme.colors.divider },
  orText: { paddingHorizontal: 12, fontSize: 10, fontFamily: theme.typography.fontFamily.bold, color: theme.colors.placeholder, letterSpacing: 1 },
  socialGrid: { flexDirection: 'row', justifyContent: 'center', gap: 16 },
  socialIconBtn: { width: 54, height: 54, borderRadius: 16, borderWidth: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.surface },
  footerSection: { alignItems: 'center', marginTop: 32 },
  noAccountText: { color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily.medium, fontSize: 14 },
  createAccountText: { color: theme.colors.primary, fontFamily: theme.typography.fontFamily.bold, fontSize: 15, marginTop: 4 },
});
