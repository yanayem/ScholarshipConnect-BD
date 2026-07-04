/**
 * REGISTRATION SCREEN: Create new user account.
 * - Handles user sign-up logic.
 * - Redirects to login or dashboard upon successful registration.
 * - Connected to: apiService.register, /login, theme.js.
 */
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView,
  StatusBar, Dimensions, Alert
} from 'react-native';
import { router, Link } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import CustomInput from '../../components/CustomInput';
import { apiService } from '../../services/api';

const { width, height } = Dimensions.get('window');

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    if (!username || !email || !password) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const { ok, data } = await apiService.register({
        username,
        email,
        password
      });

      if (ok) {
        Alert.alert('Success', 'Account created successfully! Please login.', [
          { text: 'OK', onPress: () => router.replace('/(tabs)') }
        ]);
      } else {
        let errorMsg = 'Registration failed';
        if (typeof data === 'object') {
            errorMsg = Object.values(data).flat().join('\n');
        }
        Alert.alert('Registration Failed', errorMsg);
      }
    } catch (error) {
      Alert.alert('Error', 'Connection failed. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Decorative Header */}
      <View style={styles.headerDecoration}>
        <View style={styles.shape1} />
        <View style={styles.shape2} />

        <View style={styles.headerContent}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.canGoBack() ? router.back() : router.replace('/(auth)/login')}
            >
                <MaterialIcons name="arrow-back-ios" size={20} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Create Account</Text>
            <Text style={styles.headerSub}>Start your global journey today</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.mainCard, theme.shadows.premium]}>
            <View style={styles.inputsWrapper}>
              <CustomInput
                label="Full Name / Username"
                icon="person-outline"
                placeholder="Choose a username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />

              <CustomInput
                label="Email Address"
                icon="mail-outline"
                placeholder="you@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <CustomInput
                label="Password"
                icon="lock-outline"
                placeholder="Create a password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                rightIcon={showPassword ? "visibility" : "visibility-off"}
                onRightIconPress={() => setShowPassword(!showPassword)}
              />

              <CustomInput
                label="Confirm Security Password"
                icon="verified-user"
                placeholder="Repeat password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
              />
            </View>

            <View style={styles.termsWrapper}>
                <MaterialIcons name="info-outline" size={16} color={theme.colors.textSecondary} />
                <Text style={styles.termsText}>
                    By continuing, you agree to our <Text style={styles.linkText}>Terms</Text> and <Text style={styles.linkText}>Policy</Text>.
                </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.registerBtn,
                loading && { opacity: 0.8 },
                theme.shadows.teal
              ]}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.registerBtnText}>
                {loading ? 'Creating Account...' : 'Get Started'}
              </Text>
              {!loading && <MaterialIcons name="arrow-forward" size={20} color="white" />}
            </TouchableOpacity>

            <View style={styles.socialHeader}>
              <View style={styles.line} />
              <Text style={styles.socialText}>SOCIAL SIGNUP</Text>
              <View style={styles.line} />
            </View>

            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialBtn}>
                <Ionicons name="logo-google" size={22} color="#EA4335" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialBtn}>
                <Ionicons name="logo-facebook" size={22} color="#1877F2" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialBtn}>
                <Ionicons name="logo-apple" size={22} color="black" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text style={styles.loginLink}>Log In Instead</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerDecoration: {
    height: height * 0.28,
    backgroundColor: theme.colors.primary,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 24,
    overflow: 'hidden',
  },
  shape1: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  shape2: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  headerContent: {
    zIndex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    paddingLeft: 6,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: theme.typography.fontFamily.bold,
    color: '#fff',
  },
  headerSub: {
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.medium,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  keyboardView: {
    flex: 1,
    marginTop: -30,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  mainCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 32,
    padding: 28,
    zIndex: 2,
  },
  inputsWrapper: {
    gap: 0,
  },
  termsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 20,
    paddingHorizontal: 4,
  },
  termsText: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  linkText: {
    color: theme.colors.primary,
    fontFamily: theme.typography.fontFamily.bold,
  },
  registerBtn: {
    backgroundColor: theme.colors.primary,
    height: 58,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 24,
  },
  registerBtnText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.bold,
  },
  socialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.divider,
  },
  socialText: {
    paddingHorizontal: 12,
    fontSize: 10,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.placeholder,
    letterSpacing: 1,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
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
    marginTop: 4,
  },
});
