/**
 * ADMIN TOAST: Custom toast notification component for Admin Panel.
 * - Provides success, error, warning, and info toast types.
 * - Animated slide-in from top with auto-dismiss.
 * - Works on all platforms (Android, iOS, Web).
 * - Connected to: theme.js, all admin screens.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';

const TOAST_CONFIG = {
  success: {
    icon: 'check-circle',
    bg: theme.colors.successLight,
    border: theme.colors.success,
    color: '#2E7D32',
  },
  error: {
    icon: 'error',
    bg: theme.colors.errorLight,
    border: theme.colors.error,
    color: '#C62828',
  },
  warning: {
    icon: 'warning',
    bg: theme.colors.warningLight,
    border: theme.colors.warning,
    color: '#E65100',
  },
  info: {
    icon: 'info',
    bg: theme.colors.infoLight,
    border: theme.colors.info,
    color: '#1565C0',
  },
};

let _showToast = () => {};

export function showToast(message, type = 'info', duration = 3000) {
  _showToast(message, type, duration);
}

export default function AdminToast() {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef(null);

  const hide = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setVisible(false));
  }, [translateY, opacity]);

  const show = useCallback((msg, toastType = 'info', duration = 3000) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    setMessage(msg);
    setType(toastType);
    setVisible(true);

    translateY.setValue(-100);
    opacity.setValue(0);

    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        tension: 80,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    timerRef.current = setTimeout(hide, duration);
  }, [translateY, opacity, hide]);

  useEffect(() => {
    _showToast = show;
    return () => {
      _showToast = () => {};
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [show]);

  if (!visible) return null;

  const config = TOAST_CONFIG[type] || TOAST_CONFIG.info;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: config.bg,
          borderLeftColor: config.border,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <MaterialIcons name={config.icon} size={22} color={config.color} />
      <Text style={[styles.message, { color: config.color }]} numberOfLines={2}>
        {message}
      </Text>
      <TouchableOpacity onPress={hide} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <MaterialIcons name="close" size={18} color={config.color} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 20 : 50,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderLeftWidth: 4,
    zIndex: 9999,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    gap: 10,
  },
  message: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: 13,
    lineHeight: 18,
  },
});
