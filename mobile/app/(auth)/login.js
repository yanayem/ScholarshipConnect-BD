/**
 * LOGIN SCREEN: User authentication entry point.
 * - Handles Firebase/SimpleJWT authentication login.
 * - Supports temporary 'admin' login for testing.
 * - Connected to: apiService.login, apiService.setToken, AsyncStorage, /(tabs), /register.
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

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter username and password');
      return;
    }

    const normalizedUser = username.trim().toLowerCase();
    const normalizedPass = password.trim();

    if (normalizedUser === 'admin' && normalizedPass === '1234') {
      await apiService.setToken('mock-admin-token');
      router.replace('/(tabs)');
      return;
    }

    setLoading(true);
    try {
      const { ok, data } = await apiService.login(username, password);
      if (ok) {
        router.replace('/(tabs)');
      } else {
        Alert.alert('Login Failed', data.detail || 'Invalid credentials.');
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

      {/* Premium Gradient Background Effect */}
      <View style={styles.topSection}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />

        <View style={styles.headerContent}>
          <View style={styles.logoBadge}>
            <MaterialIcons name="school" size={40} color={theme.colors.primary} />
          </View>
          <Text style={styles.welcomeText}>Welcome Back</Text>
          <Text style={styles.subWelcomeText}>Sign in to continue your journey</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={[styles.mainCard, theme.shadows.premium]}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>Login Account</Text>
              <View style={styles.titleUnderline} />
            </View>

            <View style={styles.inputsWrapper}>
              <CustomInput
                label="Username / ID"
                icon="person-outline"
                placeholder="Enter your username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />

              <View style={{ height: 8 }} />

              <CustomInput
                label="Security Password"
                icon="lock-outline"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                rightIcon={showPassword ? "visibility" : "visibility-off"}
                onRightIconPress={() => setShowPassword(!showPassword)}
              />

              <TouchableOpacity style={styles.forgotBtn}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.loginButton,
                loading && { opacity: 0.8 },
                theme.shadows.teal
              ]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>
                {loading ? 'Authenticating...' : 'Sign In'}
              </Text>
              {!loading && <MaterialIcons name="chevron-right" size={24} color="white" />}
            </TouchableOpacity>

            <View style={styles.orDivider}>
              <View style={styles.dividerLine} />
              <Text style={styles.orText}>OR LOGIN WITH</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialGrid}>
              <TouchableOpacity style={[styles.socialIconBtn, { borderColor: '#EA4335' }]}>
                <Ionicons name="logo-google" size={22} color="#EA4335" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.socialIconBtn, { borderColor: '#1877F2' }]}>
                <Ionicons name="logo-facebook" size={22} color="#1877F2" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.socialIconBtn, { borderColor: '#000000' }]}>
                <Ionicons name="logo-apple" size={22} color="#000000" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footerSection}>
            <Text style={styles.noAccountText}>New to the platform?</Text>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity>
                <Text style={styles.createAccountText}>Create an account</Text>
              </TouchableOpacity>
            </Link>
          </View>

          {/* Admin Hint */}
          <View style={styles.adminTip}>
             <MaterialIcons name="verified-user" size={14} color={theme.colors.textSecondary} />
             <Text style={styles.adminTipText}>Demo: admin / 1234</Text>
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
  topSection: {
    height: height * 0.35,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  circle1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  circle2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  headerContent: {
    alignItems: 'center',
    zIndex: 1,
    marginTop: 20,
  },
  logoBadge: {
    width: 80,
    height: 80,
    backgroundColor: '#fff',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    ...theme.shadows.premium,
  },
  welcomeText: {
    fontSize: 28,
    fontFamily: theme.typography.fontFamily.bold,
    color: '#fff',
  },
  subWelcomeText: {
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.medium,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  keyboardView: {
    flex: 1,
    marginTop: -40,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  mainCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 32,
    padding: 32,
    zIndex: 2,
  },
  formHeader: {
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 20,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.heading,
  },
  titleUnderline: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
    marginTop: 6,
  },
  inputsWrapper: {
    gap: 4,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: 8,
    marginBottom: 24,
  },
  forgotText: {
    color: theme.colors.primary,
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 13,
  },
  loginButton: {
    backgroundColor: theme.colors.primary,
    height: 58,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.bold,
  },
  orDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 28,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.divider,
  },
  orText: {
    paddingHorizontal: 12,
    fontSize: 10,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.placeholder,
    letterSpacing: 1,
  },
  socialGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialIconBtn: {
    width: 54,
    height: 54,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
  footerSection: {
    alignItems: 'center',
    marginTop: 32,
  },
  noAccountText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 14,
  },
  createAccountText: {
    color: theme.colors.primary,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 15,
    marginTop: 4,
  },
  adminTip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    opacity: 0.6,
    gap: 6,
  },
  adminTipText: {
    fontSize: 11,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.textSecondary,
  },
});
