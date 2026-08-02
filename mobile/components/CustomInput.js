/**
 * CUSTOM INPUT COMPONENT: Reusable styled text input.
 * - Supports labels, left icons, and right interactive icons (e.g., password toggle).
 * - Handles focus states and error styling.
 * - Connected to: theme.js, React Native TextInput.
 */
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Animated, Platform } from 'react-native';
import { theme } from '../theme';
import { MaterialIcons } from '@expo/vector-icons';

const CustomInput = ({
  label,
  icon,
  error,
  secureTextEntry,
  rightIcon,
  onRightIconPress,
  innerRef,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[
          styles.label,
          isFocused && { color: theme.colors.primary },
          error && { color: theme.colors.error }
        ]}>
          {label}
        </Text>
      )}

      <View style={[
        styles.inputWrapper,
        isFocused && styles.inputWrapperFocused,
        error && styles.inputWrapperError,
        props.multiline && { height: 'auto', minHeight: 100, alignItems: 'flex-start', paddingTop: 12 }
      ]}>
        {icon && (
          <MaterialIcons
            name={icon}
            size={20}
            color={isFocused ? theme.colors.primary : theme.colors.placeholder}
            style={[styles.icon, props.multiline && { marginTop: 4 }]}
          />
        )}

        <TextInput
          ref={innerRef}
          style={[styles.input, props.multiline && { textAlignVertical: 'top' }]}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={secureTextEntry}
          placeholderTextColor={theme.colors.placeholder}
          underlineColorAndroid="transparent"
          {...props}
        />

        {rightIcon && (
          <MaterialIcons
            name={rightIcon}
            size={20}
            color={theme.colors.placeholder}
            onPress={onRightIconPress}
            style={styles.rightIcon}
          />
        )}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
    width: '100%',
  },
  label: {
    fontSize: 13,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.heading,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    height: 56,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    // Removed shadows
  },
  inputWrapperFocused: {
    borderColor: theme.colors.primary,
    backgroundColor: '#FFFFFF',
  },
  inputWrapperError: {
    borderColor: theme.colors.error,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.textPrimary,
    height: '100%',
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      }
    })
  },
  rightIcon: {
    marginLeft: 10,
  },
  errorText: {
    fontSize: 11,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.error,
    marginTop: 4,
    marginLeft: 4,
  }
});

export default CustomInput;
