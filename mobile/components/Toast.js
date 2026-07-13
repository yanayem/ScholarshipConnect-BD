/**
 * TOAST COMPONENT: Modern Tailwind-style animated toast notifications.
 * Usage: const { showToast, ToastComponent } = useToast();
 *        showToast('Message here', 'success' | 'error' | 'info' | 'warning');
 */
import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const TOAST_DURATION = 3500;

const TYPES = {
  success: {
    icon: 'check-circle',
    iconColor: '#22c55e',
    borderColor: '#22c55e',
    labelColor: '#16a34a',
    label: 'Success',
  },
  error: {
    icon: 'cancel',
    iconColor: '#ef4444',
    borderColor: '#ef4444',
    labelColor: '#dc2626',
    label: 'Error',
  },
  info: {
    icon: 'info',
    iconColor: '#3b82f6',
    borderColor: '#3b82f6',
    labelColor: '#2563eb',
    label: 'Info',
  },
  warning: {
    icon: 'warning-amber',
    iconColor: '#f59e0b',
    borderColor: '#f59e0b',
    labelColor: '#d97706',
    label: 'Warning',
  },
};

export function useToast() {
  const [toast, setToast] = useState(null);
  const [opacity] = useState(() => new Animated.Value(0));
  const [translateY] = useState(() => new Animated.Value(-30));
  const [scale] = useState(() => new Animated.Value(0.95));
  const timerRef = useRef(null);

  const showToast = useCallback((message, type = 'info') => {
    if (timerRef.current) clearTimeout(timerRef.current);

    setToast({ message, type });

    // Animate in
    Animated.parallel([
      Animated.spring(opacity, { toValue: 1, useNativeDriver: true, tension: 100, friction: 10 }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 100, friction: 10 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 100, friction: 10 }),
    ]).start();

    // Auto-dismiss
    timerRef.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -20, duration: 250, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.95, duration: 250, useNativeDriver: true }),
      ]).start(() => setToast(null));
    }, TOAST_DURATION);
  }, [opacity, translateY, scale]);

  const ToastComponent = toast ? (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [{ translateY }, { scale }],
          borderLeftColor: (TYPES[toast.type] || TYPES.info).borderColor,
        },
      ]}
      pointerEvents="none"
    >
      <View style={[styles.iconWrapper, { backgroundColor: (TYPES[toast.type] || TYPES.info).iconColor + '18' }]}>
        <MaterialIcons name={(TYPES[toast.type] || TYPES.info).icon} size={20} color={(TYPES[toast.type] || TYPES.info).iconColor} />
      </View>

      <View style={styles.textWrapper}>
        <Text style={[styles.label, { color: (TYPES[toast.type] || TYPES.info).labelColor }]}>{(TYPES[toast.type] || TYPES.info).label}</Text>
        <Text style={styles.message}>{toast.message}</Text>
      </View>

      <View style={styles.progressTrack}>
        <Animated.View
          style={[styles.progressBar, { backgroundColor: (TYPES[toast.type] || TYPES.info).borderColor }]}
        />
      </View>
    </Animated.View>
  ) : null;

  return { showToast, ToastComponent };
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 44,
    left: 16,
    right: 16,
    zIndex: 9999,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
    overflow: 'hidden',
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  textWrapper: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  message: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
    lineHeight: 18,
  },
  progressTrack: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#f3f4f6',
  },
  progressBar: {
    height: 3,
    width: '100%',
    opacity: 0.5,
    borderRadius: 99,
  },
});
