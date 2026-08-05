import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Image, ActivityIndicator, Alert, Platform, StatusBar
} from 'react-native';
import { router } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../../theme';
import { apiService } from '../../services/api';
import { useToast } from '../../components/Toast';

export default function CreateBlogScreen() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const { showToast, ToastComponent } = useToast();

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Gallery access is required to add images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) {
      showToast('Please fill in both title and content', 'error');
      return;
    }

    setLoading(true);
    try {
      // Assuming apiService.addBlogPost exists or creating a generic one
      // For now, let's use the discussion create logic as a template or assume addScholarship-like FormData
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('type', 'blog'); // Mark as blog post

      if (image) {
        if (Platform.OS === 'web') {
          const response = await fetch(image.uri);
          const blob = await response.blob();
          formData.append('image', blob, 'blog_image.jpg');
        } else {
          formData.append('image', {
            uri: Platform.OS === 'ios' ? image.uri.replace('file://', '') : image.uri,
            name: 'blog_image.jpg',
            type: 'image/jpeg',
          });
        }
      }

      // We might need to add a dedicated endpoint in apiService
      const res = await apiService.createBlogPost(formData);

      if (res.ok) {
        showToast('Story published successfully!', 'success');
        router.back();
      } else {
        showToast(res.data?.error || 'Failed to publish', 'error');
      }
    } catch (error) {
      showToast('Connection error', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="close" size={28} color={theme.colors.heading} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Write Story</Text>
        <TouchableOpacity
          onPress={handlePublish}
          disabled={loading}
          style={[styles.publishBtn, loading && { opacity: 0.5 }]}
        >
          {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.publishText}>Publish</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <TextInput
          style={styles.titleInput}
          placeholder="Story Title..."
          placeholderTextColor={theme.colors.placeholder}
          value={title}
          onChangeText={setTitle}
          multiline
        />

        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image.uri }} style={styles.previewImage} />
          ) : (
            <View style={styles.placeholder}>
              <Ionicons name="image-outline" size={40} color={theme.colors.placeholder} />
              <Text style={styles.placeholderText}>Add a cover photo</Text>
            </View>
          )}
        </TouchableOpacity>

        <TextInput
          style={styles.contentInput}
          placeholder="Share your success story, tips, or experience..."
          placeholderTextColor={theme.colors.placeholder}
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
        />
      </ScrollView>

      {ToastComponent}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 45, paddingBottom: 15, paddingHorizontal: 20,
    borderBottomWidth: 1, borderBottomColor: theme.colors.divider
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.heading },
  publishBtn: { backgroundColor: theme.colors.primary, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
  publishText: { color: '#fff', fontWeight: 'bold' },
  scroll: { padding: 20 },
  titleInput: {
    fontSize: 24, fontWeight: 'bold', color: theme.colors.heading,
    marginBottom: 20, paddingVertical: 10,
  },
  imagePicker: {
    width: '100%', height: 200, backgroundColor: '#F8FAFC',
    borderRadius: 16, overflow: 'hidden', justifyContent: 'center', alignItems: 'center',
    marginBottom: 20, borderWidth: 1, borderColor: theme.colors.divider, borderStyle: 'dashed'
  },
  previewImage: { width: '100%', height: '100%' },
  placeholder: { alignItems: 'center' },
  placeholderText: { fontSize: 14, color: theme.colors.textSecondary, marginTop: 8 },
  contentInput: {
    fontSize: 16, color: theme.colors.textPrimary, minHeight: 300,
    lineHeight: 24,
  }
});
