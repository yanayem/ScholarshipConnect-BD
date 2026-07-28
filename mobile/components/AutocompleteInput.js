import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { theme } from '../theme';
import { apiService } from '../services/api';
import { MaterialIcons } from '@expo/vector-icons';

/**
 * AUTOCOMPLETE INPUT (LinkedIn Style):
 * - Tag/Chip based input for Skills, Countries, etc.
 * - Integrated Inline Input to remove "Text Box" look.
 * - Minimum 2 characters required for suggestions.
 * - Manual comma (,) triggers tag creation.
 */
export default function AutocompleteInput({ label, icon, value, onChangeText, placeholder, type, style, ...props }) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState('');

  // Parse comma separated string to array for chip display
  const tags = value ? value.split(',').map(t => t.trim()).filter(Boolean) : [];

  useEffect(() => {
    const fetchSuggestions = async () => {
      // Fetch suggestions from backend (including defaults if input is empty)
      try {
        const res = await apiService.getAutocomplete(type, inputValue.trim());
        if (res.ok && Array.isArray(res.data)) {
          // Filter out already added tags to avoid duplicates
          const filtered = res.data.filter(item => !tags.includes(item));
          setSuggestions(filtered);
          // Only show dropdown if we have suggestions AND user is focused on the input
          // Or if they just started typing
        }
      } catch (e) {
        console.warn('[Autocomplete] Fetch error:', e.message);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 200);
    return () => clearTimeout(timeoutId);
  }, [inputValue, type, tags]);

  const handleInputChange = (text) => {
    // If comma is typed, turn text into a tag
    if (text.includes(',')) {
      const parts = text.split(',');
      const tagToAdd = parts[0].trim();
      if (tagToAdd && !tags.includes(tagToAdd)) {
        const newTags = [...tags, tagToAdd];
        onChangeText(newTags.join(', ') + ', ');
      }
      setInputValue('');
      setShowSuggestions(false);
    } else {
      setInputValue(text);
      setShowSuggestions(true);
    }
  };

  const handleBlur = () => {
    // Convert remaining text to tag on blur if any
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !tags.includes(trimmedValue)) {
      const newTags = [...tags, trimmedValue];
      onChangeText(newTags.join(', ') + ', ');
      setInputValue('');
    }
    // Delay hiding suggestions to allow for onPress on dropdown items
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleSelect = (suggestion) => {
    if (!tags.includes(suggestion)) {
      const newTags = [...tags, suggestion];
      onChangeText(newTags.join(', ') + ', ');
    }
    setInputValue('');
    setShowSuggestions(false);
  };

  const removeTag = (indexToRemove) => {
    const newTags = tags.filter((_, index) => index !== indexToRemove);
    onChangeText(newTags.length > 0 ? newTags.join(', ') + ', ' : '');
  };

  return (
    <View style={[styles.container, showSuggestions && { zIndex: 1000 }]}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.linkedinWrapper}>
        <View style={styles.flowLayout}>
          {tags.map((tag, index) => (
            <View key={index} style={styles.linkedinChip}>
              <Text style={styles.chipText}>{tag}</Text>
              <TouchableOpacity onPress={() => removeTag(index)} style={styles.closeBtn}>
                <MaterialIcons name="close" size={14} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>
          ))}

          <TextInput
            style={styles.inlineInput}
            value={inputValue}
            onChangeText={handleInputChange}
            onBlur={handleBlur}
            onFocus={() => setShowSuggestions(suggestions.length > 0)}
            placeholder={tags.length === 0 ? placeholder : "Add more..."}
            placeholderTextColor={theme.colors.placeholder}
            {...props}
          />
        </View>
      </View>
      
      {/* Dynamic Suggestion Dropdown */}
      {showSuggestions && (
        <View style={styles.dropdown}>
          <ScrollView keyboardShouldPersistTaps="handled">
            {suggestions.map((item, index) => (
              <TouchableOpacity key={index} style={styles.dropItem} onPress={() => handleSelect(item)}>
                <MaterialIcons name="add" size={18} color={theme.colors.primary} />
                <Text style={styles.dropText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 20, zIndex: 1 },
  label: {
    fontSize: 14,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.heading,
    marginBottom: 8,
    marginLeft: 4
  },
  linkedinWrapper: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: theme.colors.divider,
    borderRadius: 12,
    minHeight: 50,
    padding: 8,
    ...theme.shadows.soft
  },
  flowLayout: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6
  },
  linkedinChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.divider,
  },
  chipText: {
    fontSize: 13,
    color: theme.colors.textPrimary,
    fontWeight: '600',
    marginRight: 6
  },
  closeBtn: {
    padding: 2,
  },
  inlineInput: {
    flex: 1,
    minWidth: 100,
    height: 36,
    fontSize: 15,
    color: theme.colors.textPrimary,
    paddingHorizontal: 8
  },
  dropdown: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: theme.colors.divider,
    borderRadius: 12,
    marginTop: 4,
    maxHeight: 200,
    ...theme.shadows.premium,
    // Changed to relative so it expands the ScrollView height
    position: 'relative',
    zIndex: 100,
  },
  dropItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
    gap: 12
  },
  dropText: {
    fontSize: 15,
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily.medium
  }
});
