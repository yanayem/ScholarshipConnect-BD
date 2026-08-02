import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text, Modal } from 'react-native';
import { theme } from '../theme';

/**
 * REUSABLE LOADER: A consistent loading indicator for the app.
 * - Supports full-screen modal mode or inline mode.
 * - Uses theme colors for consistency.
 */
export const Loader = ({ visible = true, fullScreen = false, message = 'Loading...' }) => {
  const content = (
    <View style={fullScreen ? styles.modalOverlay : styles.inlineContainer}>
      <View style={styles.loaderBox}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        {message ? <Text style={styles.loaderText}>{message}</Text> : null}
      </View>
    </View>
  );

  if (fullScreen) {
    return (
      <Modal transparent visible={visible} animationType="fade">
        {content}
      </Modal>
    );
  }

  return visible ? content : null;
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inlineContainer: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  loaderBox: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    gap: 12,
    ...theme.shadows.card,
  },
  loaderText: {
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.textPrimary,
    fontSize: 14,
  },
});

export default Loader;
