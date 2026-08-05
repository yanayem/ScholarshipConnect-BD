/**
 * ADMIN SECURITY LOGIN: Second-layer authentication for staff area.
 * - Authenticates using Django Superuser credentials.
 * - Matches the "Premium Warm Teal" design system.
 * - Connected to: admin/_layout.js, apiService.adminLogin, theme.js.
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView,
  StatusBar, Dimensions, TextInput
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../../services/api';
import { useToast } from '../../components/Toast';

const { width, height } = Dimensions.get('window');

export default function AdminSecurityLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast, ToastComponent } = useToast();
  const router = useRouter();

  const handleVerify = async () => {
    if (!username || !password) {
      showToast('Please enter admin username and password', 'warning');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.adminLogin(username.trim(), password.trim());

      if (response.ok) {
        // Do NOT overwrite the Firebase token with the Django JWT.
        // The backend uses Firebase authentication globally.
        await AsyncStorage.setItem('admin_verified', 'true');
        showToast('Access Granted! Welcome Admin.', 'success');
        router.replace('/admin');
      } else {
        const errorMsg = response.data.detail || 'Invalid admin credentials.';
        showToast(errorMsg, 'error');
      }
    } catch (error) {
      console.error(error);
      showToast('Could not verify admin status. Check your connection.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Matching Gradient/Teal Top Section */}
      <View style={styles.topSection}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />

        <View style={styles.headerContent}>
          <View style={styles.logoBadge}>
            <MaterialIcons name="admin-panel-settings" size={40} color={theme.colors.primary} />
          </View>
          <Text style={styles.welcomeText}>Admin Portal</Text>
          <Text style={styles.subWelcomeText}>Secure authentication required</Text>
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
              <Text style={styles.formTitle}>Staff Sign In</Text>
              <View style={styles.titleUnderline} />
            </View>

            <View style={styles.inputsWrapper}>
              <Text style={styles.inputLabel}>Admin Email or Username</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="mail-outline" size={20} color={theme.colors.placeholder} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  placeholderTextColor={theme.colors.placeholder}
                />
              </View>

              <View style={{ height: 16 }} />

              <Text style={styles.inputLabel}>Security Password</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="lock-outline" size={20} color={theme.colors.placeholder} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholderTextColor={theme.colors.placeholder}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <MaterialIcons
                    name={showPassword ? "visibility" : "visibility-off"}
                    size={20}
                    color={theme.colors.placeholder}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.loginButton,
                loading && { opacity: 0.8 },
                theme.shadows.teal
              ]}
              onPress={handleVerify}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>
                {loading ? 'Authenticating...' : 'Unlock Dashboard'}
              </Text>
              {!loading && <MaterialIcons name="vpn-key" size={22} color="white" />}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.exitBtn}
              onPress={() => router.replace('/(tabs)/profile')}
            >
              <Text style={styles.exitBtnText}>Return to App</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      {ToastComponent}
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
    marginBottom: 32,
  },
  inputLabel: {
    fontSize: 13,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.textSecondary,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: theme.colors.divider,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.heading,
  },
  loginButton: {
    backgroundColor: theme.colors.primary,
    height: 58,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: theme.typography.fontFamily.bold,
  },
  exitBtn: {
    alignItems: 'center',
    marginTop: 20,
  },
  exitBtnText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 14,
  },
});
