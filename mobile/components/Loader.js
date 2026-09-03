import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text, Modal } from 'react-native';
import { theme } from '../theme';

/**
 * REUSABLE LOADER: A consistent loading indicator for the app.
 * - MODIFIED: Removed the "Box" look and message to make it less intrusive.
 */
export const Loader = ({ visible = true, fullScreen = false, message = 'Loading...' }) => {
  const content = (
    <View style={fullScreen ? styles.modalOverlay : styles.inlineContainer}>
       <ActivityIndicator size="large" color={theme.colors.primary} />
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
    backgroundColor: 'rgba(255,255,255,0.7)', // More subtle background
    justifyContent: 'center',
    alignItems: 'center',
  },
  inlineContainer: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 150, // Ensure it takes some space
  },
  loaderBox: {
    // Box styles removed for a cleaner look
    alignItems: 'center',
    gap: 12,
  },
  loaderText: {
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.textPrimary,
    fontSize: 14,
  },
});

export default Loader;
