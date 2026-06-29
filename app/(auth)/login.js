import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, StatusBar, Dimensions, Alert
} from 'react-native';
import { router, Link } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import CustomInput from '../../components/CustomInput';
import { apiService } from '../../services/api';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const [username, setUsername] = useState(''); // Django uses username by default
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter username and password');
      return;
    }

    setLoading(true);
    try {
      const { ok, data } = await apiService.login(username, password);
      if (ok) {
        router.replace('/(tabs)');
      } else {
        Alert.alert('Login Failed', data.detail || 'Invalid credentials');
      }
    } catch (error) {
      Alert.alert('Error', 'Connection failed. Please check your API URL.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.root}
    >
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      {/* Decorative Circles */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={[styles.logoBox, theme.shadows.premium]}>
            <MaterialIcons name="school" size={42} color="white" />
          </View>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue your global journey</Text>
        </View>

        <View style={[styles.formContainer, theme.shadows.premium]}>
          <CustomInput
            label="Username"
            icon="person-outline"
            placeholder="Enter your username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />

          <CustomInput
            label="Password"
            icon="lock-outline"
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            rightIcon={showPassword ? "visibility" : "visibility-off"}
            onRightIconPress={() => setShowPassword(!showPassword)}
          />

          <TouchableOpacity style={styles.forgotPass}>
            <Text style={styles.forgotPassText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginBtn, theme.shadows.soft, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginBtnText}>{loading ? 'Signing In...' : 'Sign In'}</Text>
            {!loading && <MaterialIcons name="arrow-forward" size={20} color="white" />}
          </TouchableOpacity>


          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
            <View style={styles.line} />
          </View>

          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialBtn}>
              <Ionicons name="logo-google" size={24} color="#EA4335" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn}>
              <Ionicons name="logo-apple" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn}>
              <Ionicons name="logo-facebook" size={24} color="#1877F2" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity>
              <Text style={styles.signupText}>Join Now</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.background },
  circle1: {
    position: 'absolute', top: -100, right: -100,
    width: 300, height: 300, borderRadius: 150,
    backgroundColor: theme.colors.primaryLight, opacity: 0.5,
  },
  circle2: {
    position: 'absolute', bottom: -50, left: -50,
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: theme.colors.lavenderCard, opacity: 0.3,
  },
  scroll: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  logoBox: {
    width: 84, height: 84, borderRadius: theme.borderRadius.base,
    backgroundColor: theme.colors.primary, alignItems: 'center',
    justifyContent: 'center', marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.heading
  },
  subtitle: {
    fontSize: 15,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.textSecondary,
    marginTop: 8,
    textAlign: 'center'
  },
  formContainer: {
    backgroundColor: theme.colors.surface,
    padding: 30,
    borderRadius: theme.borderRadius.base,
  },
  inputGroup: { marginBottom: 20 },
  label: {
    fontSize: 13,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.heading,
    marginBottom: 8,
    marginLeft: 4
  },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.base, paddingHorizontal: 16,
    height: 56, borderWidth: 1, borderColor: theme.colors.border,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.textPrimary,
    marginLeft: 12,
  },
  forgotPass: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotPassText: {
    color: theme.colors.primary,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 14
  },
  loginBtn: {
    backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.base, height: 56,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10,
  },
  loginBtnText: { color: 'white', fontSize: 17, fontFamily: theme.typography.fontFamily.bold },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 30 },
  line: { flex: 1, height: 1, backgroundColor: theme.colors.divider },
  dividerText: {
    marginHorizontal: 12,
    color: theme.colors.placeholder,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10
  },
  socialRow: { flexDirection: 'row', justifyContent: 'center', gap: 16 },
  socialBtn: {
    width: 54, height: 54, borderRadius: theme.borderRadius.base, backgroundColor: 'white',
    alignItems: 'center', justifyContent: 'center',
    ...theme.shadows.soft,
  },
  footer: {
    flexDirection: 'row', justifyContent: 'center', marginTop: 32,
  },
  footerText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.medium
  },
  signupText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.bold
  },
});
