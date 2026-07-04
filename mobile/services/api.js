/**
 * API SERVICE: Central hub for all network requests.
 * - Handles authentication headers, error catching, and JSON parsing.
 * - Manages Scholarships, Blog, Applications, and Notifications endpoints.
 * - Connected to: Config.js (API_URL), AsyncStorage (token), Backend Django API.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/Config';
import { Platform } from 'react-native';

const handleResponse = async (response) => {
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    console.error('[API] Parse Error. Raw response:', text);
    data = { error: 'Invalid JSON response from server', details: text };
  }
  return { ok: response.ok, status: response.status, data };
};

const getHeaders = async (includeToken = true) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (includeToken) {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
};

const networkError = (error, context) => {
  console.warn(`[API] ${context} Connection Issue:`, error.message);
  let msg = 'Network request failed. Ensure your Django server is running and your Android device can reach the server IP.';
  return { ok: false, data: { error: msg, details: error.message } };
};

export const apiService = {
  async login(username, password) {
    // Note: User login should be handled by Firebase SDK on the frontend.
    // After getting the idToken from Firebase, call apiService.setToken(idToken)
    console.warn('apiService.login is deprecated. Use Firebase SDK to sign in.');
    return { ok: false, data: { detail: 'Please use Firebase Authentication' } };
  },

  async register(userData) {
    // Note: User registration should be handled by Firebase SDK on the frontend.
    console.warn('apiService.register is deprecated. Use Firebase SDK to sign up.');
    return { ok: false, data: { detail: 'Please use Firebase Authentication' } };
  },

  async setToken(token) {
    await AsyncStorage.setItem('token', token);
  },

  async getProfile() {
    try {
      const response = await fetch(`${API_URL}/accounts/profile/`, {
        method: 'GET',
        headers: await getHeaders(true),
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Get Profile');
    }
  },

  async updateProfile(profileData) {
    try {
      const isFormData = profileData instanceof FormData;
      const headers = await getHeaders(true);

      if (isFormData) {
        delete headers['Content-Type']; // Let the browser/native set it with boundary
      }

      const response = await fetch(`${API_URL}/accounts/profile/`, {
        method: 'PATCH',
        headers: headers,
        body: isFormData ? profileData : JSON.stringify(profileData),
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Update Profile');
    }
  },

  async getScholarships(params = '') {
    try {
      const url = `${API_URL}/scholarships/${params ? '?' + params : ''}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: await getHeaders(true), // Include token to see non-active ones if admin
        mode: 'cors',
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Get Scholarships');
    }
  },

  async getScholarshipDetail(id) {
    try {
      const response = await fetch(`${API_URL}/scholarships/${id}/`, {
        method: 'GET',
        headers: await getHeaders(false),
        mode: 'cors',
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Get Scholarship Detail');
    }
  },

  async addScholarship(scholarshipData) {
    try {
      console.log('[API] Posting Scholarship Data:', JSON.stringify(scholarshipData, null, 2));
      const response = await fetch(`${API_URL}/scholarships/`, {
        method: 'POST',
        headers: await getHeaders(),
        body: JSON.stringify(scholarshipData),
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Add Scholarship');
    }
  },

  async updateScholarship(id, scholarshipData) {
    try {
      const response = await fetch(`${API_URL}/scholarships/${id}/`, {
        method: 'PUT',
        headers: await getHeaders(),
        body: JSON.stringify(scholarshipData),
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Update Scholarship');
    }
  },

  async deleteScholarship(id) {
    try {
      const response = await fetch(`${API_URL}/scholarships/${id}/`, {
        method: 'DELETE',
        headers: await getHeaders(),
      });
      return { ok: response.ok };
    } catch (error) {
      return networkError(error, 'Delete Scholarship');
    }
  },

  async approveScholarship(id, action) {
    try {
      const response = await fetch(`${API_URL}/scholarships/${id}/approve/`, {
        method: 'POST',
        headers: await getHeaders(),
        body: JSON.stringify({ action }),
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Approve Scholarship');
    }
  },

  async logout() {
    await AsyncStorage.removeItem('token');
    // If using Firebase SDK, also call auth().signOut() or similar
  },

  // — Blog / Success Stories —
  async getBlogPosts() {
    try {
      const response = await fetch(`${API_URL}/blog/`, {
        method: 'GET',
        headers: await getHeaders(false),
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Get Blogs');
    }
  },

  async createBlogPost(blogData) {
    try {
      const response = await fetch(`${API_URL}/blog/`, {
        method: 'POST',
        headers: await getHeaders(),
        body: JSON.stringify(blogData),
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Create Blog');
    }
  },

  // — Saved & Applications —
  async getSavedScholarships() {
    try {
      const response = await fetch(`${API_URL}/applications/saved/`, {
        method: 'GET',
        headers: await getHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Get Saved');
    }
  },

  async applyForScholarship(applicationData) {
    try {
      const response = await fetch(`${API_URL}/applications/apply/`, {
        method: 'POST',
        headers: await getHeaders(),
        body: JSON.stringify(applicationData),
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Apply Scholarship');
    }
  },

  // — Documents —
  async getDocuments() {
    try {
      const response = await fetch(`${API_URL}/applications/documents/`, {
        method: 'GET',
        headers: await getHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Get Documents');
    }
  },

  async deleteDocument(id) {
    try {
      const response = await fetch(`${API_URL}/applications/documents/${id}/`, {
        method: 'DELETE',
        headers: await getHeaders(),
      });
      return { ok: response.ok };
    } catch (error) {
      return networkError(error, 'Delete Document');
    }
  },

  // — Notifications —
  async getNotifications() {
    try {
      const response = await fetch(`${API_URL}/notifications/`, {
        method: 'GET',
        headers: await getHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Get Notifications');
    }
  }
};
