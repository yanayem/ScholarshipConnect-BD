import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ScrollView, StatusBar, Dimensions
} from 'react-native';
import { router, Link } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';
import CustomInput from '../../components/CustomInput';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = () => {
    if (!name || !email || !age || !password) {
      alert('Please fill all fields');
      return;
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.root}
    >
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      <View style={styles.circle1} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.canGoBack() ? router.back() : router.replace('/')}
        >
          <MaterialIcons name="arrow-back-ios" size={20} color={theme.colors.heading} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join thousands of scholars worldwide</Text>
        </View>

        <View style={[styles.formContainer, theme.shadows.premium]}>
          <CustomInput
            label="Full Name"
            icon="person-outline"
            placeholder="John Doe"
            value={name}
            onChangeText={setName}
          />

          <CustomInput
            label="Email Address"
            icon="alternate-email"
            placeholder="john@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <CustomInput
            label="Age"
            icon="cake"
            placeholder="Your age"
            value={age}
            onChangeText={setAge}
            keyboardType="number-pad"
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
            label="Confirm Password"
            icon="lock-reset"
            placeholder="Repeat password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showPassword}
          />

          <TouchableOpacity style={[styles.registerBtn, theme.shadows.soft]} onPress={handleRegister}>
            <Text style={styles.registerBtnText}>Create Account</Text>
            <MaterialIcons name="person-add-alt" size={20} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={styles.loginText}>Sign In</Text>
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
    position: 'absolute', top: -150, left: -100,
    width: 350, height: 350, borderRadius: 175,
    backgroundColor: theme.colors.mintCard, opacity: 0.4,
  },
  scroll: { flexGrow: 1, padding: 24 },
  backBtn: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: 'white', alignItems: 'center', justifyContent: 'center',
    marginTop: 12, marginBottom: 28,
    ...theme.shadows.soft,
  },
  header: { marginBottom: 32, paddingLeft: 4 },
  title: {
    fontSize: 28,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.heading
  },
  subtitle: {
    fontSize: 15,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.textSecondary,
    marginTop: 8
  },
  formContainer: {
    backgroundColor: theme.colors.surface,
    padding: 24,
    borderRadius: theme.borderRadius.base,
  },
  inputGroup: { marginBottom: 16 },
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
    height: 54, borderWidth: 1, borderColor: theme.colors.border,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.textPrimary,
    marginLeft: 12,
  },
  registerBtn: {
    backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius.base, height: 56,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, marginTop: 12,
  },
  registerBtnText: { color: 'white', fontSize: 17, fontFamily: theme.typography.fontFamily.bold },
  footer: {
    flexDirection: 'row', justifyContent: 'center', marginTop: 32,
    marginBottom: 40
  },
  footerText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.medium
  },
  loginText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.bold
  },
});
