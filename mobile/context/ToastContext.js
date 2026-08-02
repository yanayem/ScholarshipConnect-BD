import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Platform, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme';

const ToastContext = createContext();

const TOAST_DURATION = 3500;

const TYPES = {
  success: {
    icon: 'check-circle',
    iconColor: '#22c55e',
    borderColor: '#22c55e',
    labelColor: '#16a34a',
    label: 'Success',
    backgroundColor: '#f0fdf4',
  },
  error: {
    icon: 'cancel',
    iconColor: '#ef4444',
    borderColor: '#ef4444',
    labelColor: '#dc2626',
    label: 'Error',
    backgroundColor: '#fef2f2',
  },
  info: {
    icon: 'info',
    iconColor: '#3b82f6',
    borderColor: '#3b82f6',
    labelColor: '#2563eb',
    label: 'Info',
    backgroundColor: '#eff6ff',
  },
  warning: {
    icon: 'warning-amber',
    iconColor: '#f59e0b',
    borderColor: '#f59e0b',
    labelColor: '#d97706',
    label: 'Warning',
    backgroundColor: '#fffbeb',
  },
};

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-50)).current;
  const scale = useRef(new Animated.Value(0.9)).current;
  const progress = useRef(new Animated.Value(0)).current;
  const timerRef = useRef(null);

  const hideToast = useCallback(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: -50, duration: 300, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 0.9, duration: 300, useNativeDriver: true }),
    ]).start(() => {
        setToast(null);
        progress.setValue(0);
    });
  }, [opacity, translateY, scale, progress]);

  const showToast = useCallback((message, type = 'info') => {
    if (timerRef.current) clearTimeout(timerRef.current);

    setToast({ message, type });
    progress.setValue(0);

    // Animate in
    Animated.parallel([
      Animated.spring(opacity, { toValue: 1, useNativeDriver: true, tension: 80, friction: 10 }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 80, friction: 10 }),
      Animated.timing(progress, { toValue: 1, duration: TOAST_DURATION, useNativeDriver: false })
    ]).start();

    // Auto-dismiss
    timerRef.current = setTimeout(hideToast, TOAST_DURATION);
  }, [opacity, translateY, scale, progress, hideToast]);

  const activeType = TYPES[toast?.type] || TYPES.info;

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {toast && (
        <Animated.View
          style={[
            styles.container,
            {
              opacity,
              transform: [{ translateY }, { scale }],
              borderLeftColor: activeType.borderColor,
              backgroundColor: '#fff',
            },
            theme.shadows.premium
          ]}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={hideToast}
            style={styles.content}
          >
            <View style={[styles.iconWrapper, { backgroundColor: activeType.iconColor + '15' }]}>
                <MaterialIcons name={activeType.icon} size={22} color={activeType.iconColor} />
            </View>

            <View style={styles.textWrapper}>
                <Text style={[styles.label, { color: activeType.labelColor }]}>{activeType.label}</Text>
                <Text style={styles.message} numberOfLines={2}>{toast.message}</Text>
            </View>

            <TouchableOpacity onPress={hideToast} style={styles.closeBtn}>
                <MaterialIcons name="close" size={18} color="#9ca3af" />
            </TouchableOpacity>
          </TouchableOpacity>

          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                    backgroundColor: activeType.borderColor,
                    width: progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['100%', '0%']
                    })
                }
              ]}
            />
          </View>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

export const useGlobalToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useGlobalToast must be used within a ToastProvider');
    return context;
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 50,
    left: 16,
    right: 16,
    zIndex: 99999,
    borderRadius: 16,
    borderLeftWidth: 5,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textWrapper: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  message: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    lineHeight: 18,
  },
  closeBtn: {
    padding: 4,
  },
  progressTrack: {
    height: 3,
    width: '100%',
    backgroundColor: '#f3f4f6',
  },
  progressBar: {
    height: 3,
    opacity: 0.6,
  },
});
