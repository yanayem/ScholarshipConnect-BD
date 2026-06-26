import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, StatusBar
} from 'react-native';
import { router, Link } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Basic validation
    if (!email || !password) {
      alert('Please enter email and password');
      return;
    }
    // In a real app, logic would go here
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.root}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F4F6FA" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <MaterialIcons name="school" size={40} color="#fff" />
          </View>
          <Text style={styles.title}>Welcome Back!</Text>
          <Text style={styles.subtitle}>Sign in to continue your journey</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <MaterialIcons name="email" size={20} color="#7A746E" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor="#7A746E"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <MaterialIcons name="lock" size={20} color="#7A746E" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#7A746E"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.forgotPass}>
            <Text style={styles.forgotPassText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
            <Text style={styles.loginBtnText}>Sign In</Text>
            <MaterialIcons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.line} />
          </View>

          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialBtn}>
              <MaterialIcons name="facebook" size={24} color="#1877F2" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn}>
              <MaterialIcons name="email" size={24} color="#DB4437" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity>
              <Text style={styles.signupText}>Sign Up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F4F6FA' },
  scroll: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#C97352', alignItems: 'center',
    justifyContent: 'center', marginBottom: 20,
    elevation: 5, shadowColor: '#C97352', shadowOpacity: 0.3, shadowRadius: 10,
  },
  title: { fontSize: 28, fontWeight: 'bold', color: '#C97352' },
  subtitle: { fontSize: 16, color: '#7A746E', marginTop: 8 },
  form: { width: '100%' },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 12, paddingHorizontal: 16, marginBottom: 16,
    borderWidth: 1, borderColor: '#ECE7E1', height: 56,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: '#2D2A26' },
  forgotPass: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotPassText: { color: '#C97352', fontWeight: '600', fontSize: 14 },
  loginBtn: {
    backgroundColor: '#C97352', borderRadius: 12, height: 56,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, elevation: 3, shadowColor: '#C97352', shadowOpacity: 0.3, shadowRadius: 6,
  },
  loginBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 30 },
  line: { flex: 1, height: 1, backgroundColor: '#ECE7E1' },
  dividerText: { marginHorizontal: 16, color: '#7A746E', fontWeight: 'bold' },
  socialRow: { flexDirection: 'row', justifyContent: 'center', gap: 20 },
  socialBtn: {
    width: 56, height: 56, borderRadius: 12, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#ECE7E1',
  },
  footer: {
    flexDirection: 'row', justifyContent: 'center', marginTop: 40,
  },
  footerText: { color: '#7A746E', fontSize: 15 },
  signupText: { color: '#C97352', fontSize: 15, fontWeight: 'bold' },
});
