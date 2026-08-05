/**
 * API SERVICE: Central hub for all network requests.
 * - Handles authentication headers, error catching, and JSON parsing.
 * - Manages Scholarships, Blog, Applications, and Notifications endpoints.
 * - Connected to: Config.js (API_URL), AsyncStorage (token), Backend Django API.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/Config';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { firebaseAuth } from './firebase';

const isExpoGo = Constants.executionEnvironment === 'storeClient';

const handleResponse = async (response) => {
  const text = await response.text();

  if (!response.ok) {
    // Don't spam console.error for 401s as they are often handled by auto-refresh
    if (response.status === 401) {
      console.warn(`[API 401] Unauthorized: ${response.url}`);
    } else {
      console.error(`[API ERROR] ${response.status} from ${response.url}`);
      console.error(`[API ERROR BODY]`, text.substring(0, 300));
    }
  } else {
    console.log(`[API SUCCESS] ${response.status} from ${response.url}`);
  }

  let data;
  try {
    if (text && (text.trim().startsWith('{') || text.trim().startsWith('['))) {
      data = JSON.parse(text);
    } else {
      data = text ? { message: text } : {};
    }
  } catch (e) {
    console.error(`[API] Parse Error (${response.status}) from ${response.url}. Raw response snippet:`, text.substring(0, 200));
    data = { error: 'Invalid JSON response from server', details: text };
  }

  if (response.status === 401) {
    const lastRefreshAttempt = await AsyncStorage.getItem('last_refresh_attempt');
    const now = Date.now();

    if (!lastRefreshAttempt || (now - parseInt(lastRefreshAttempt)) > 10000) {
      try {
        await AsyncStorage.setItem('last_refresh_attempt', now.toString());
        console.log('[API] Attempting to auto-refresh token from Firebase...');
        const newToken = await firebaseAuth.getIdToken(true);

        if (newToken) {
            await AsyncStorage.setItem('token', newToken);
            console.log('[API] Token refreshed successfully.');
            // Note: Ideally we would retry the request here, but we'll let
            // the calling component (like UserContext) handle the retry for now.
        } else {
            console.warn('[API] Firebase session lost. Logging out...');
            await AsyncStorage.multiRemove(['token', 'admin_verified', 'is_staff']);
            await firebaseAuth.signOut();
        }
      } catch (e) {
        console.error('[API] Failed to auto-refresh token:', e.message);
        await AsyncStorage.multiRemove(['token', 'admin_verified', 'is_staff']);
        await firebaseAuth.signOut();
      }
    }
  }

  // Post-process data to ensure URLs are absolute if they are relative media paths
  if (data && typeof data === 'object') {
    const processUrls = (obj) => {
      const baseUrl = API_URL.replace('/api', '');
      for (const key in obj) {
        if (typeof obj[key] === 'string') {
          // Fix relative media paths
          if (obj[key].startsWith('/media/')) {
            obj[key] = `${baseUrl}${obj[key]}`;
          }
          // Fix Django returning 127.0.0.1 or localhost when running on device/emulator
          else if (obj[key].includes('127.0.0.1:8000') || obj[key].includes('localhost:8000')) {
            obj[key] = obj[key].replace(/127\.0\.0\.1:8000|localhost:8000/, API_URL.split('/')[2].split(':')[0] + ':8000');
          }
        } else if (obj[key] && typeof obj[key] === 'object') {
          processUrls(obj[key]);
        }
      }
    };
    processUrls(data);
  }

  return { ok: response.ok, status: response.status, data };
};

const getToken = async () => {
  try {
    // 1. Try to get token from current Firebase session
    let token = await firebaseAuth.getIdToken();
    if (token) {
      await AsyncStorage.setItem('token', token);
      return token;
    }

    // 2. If no user yet, check if we were previously logged in
    const cachedToken = await AsyncStorage.getItem('token');
    if (cachedToken) {
      console.log('[API] Firebase session not ready but cached token found. Waiting briefly...');
      // Wait for Firebase to restore session (max 2s wait for better UX)
      const user = await Promise.race([
        firebaseAuth.waitForUser(),
        new Promise(resolve => setTimeout(() => resolve(null), 2000))
      ]);

      if (user) {
        token = await firebaseAuth.getIdToken();
        if (token) {
          await AsyncStorage.setItem('token', token);
          return token;
        }
      }

      // 3. Fallback to cached token if Firebase is still not ready
      // This allows the request to proceed; if the token is expired,
      // the backend will return 401 and handleResponse will trigger refresh.
      return cachedToken;
    }
  } catch (e) {
    console.warn('[API] Token retrieval error:', e.message);
  }
  return await AsyncStorage.getItem('token');
};

const getHeaders = async (includeToken = true) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  if (includeToken) {
    const token = await getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.log('[API] No token found');
    }
  }
  return headers;
};

const networkError = (error, context) => {
  console.warn(`[API] ${context} Connection Issue:`, error.message);
  let msg = 'Network request failed. Ensure your Django server is running and your Android device can reach the server IP.';
  if (error.message.includes('timeout')) msg = 'Request timed out. Server might be slow.';
  return { ok: false, data: { error: msg, details: error.message } };
};

// Generic fetch with timeout
const fetchWithTimeout = async (url, options = {}, timeout = 10000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
};

export const apiService = {
  async setToken(token) {
    await AsyncStorage.setItem('token', token);
  },

  async adminLogin(username, password) {
    try {
      const response = await fetchWithTimeout(`${API_URL}/accounts/admin-login/`, {
        method: 'POST',
        headers: await getHeaders(true),
        body: JSON.stringify({ username, password }),
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Admin Login');
    }
  },

  async getProfile() {
    try {
      const response = await fetchWithTimeout(`${API_URL}/accounts/profile/`, {
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
      const isFormData = !!profileData && typeof profileData.append === 'function';
      const headers = await getHeaders(true);

      if (isFormData) {
        const token = headers['Authorization'];
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('PATCH', `${API_URL}/accounts/profile/`);
          if (token) {
            xhr.setRequestHeader('Authorization', token);
          }
          xhr.onload = () => {
            try {
              const data = JSON.parse(xhr.responseText);
              resolve({ ok: xhr.status >= 200 && xhr.status < 300, status: xhr.status, data });
            } catch (e) {
              resolve({ ok: false, data: { error: 'Invalid response from server' } });
            }
          };
          xhr.onerror = () => {
            resolve({ ok: false, data: { error: 'Network request failed' } });
          };
          xhr.send(profileData);
        });
      }

      const response = await fetch(`${API_URL}/accounts/profile/`, {
        method: 'PATCH',
        headers: headers,
        body: JSON.stringify(profileData),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('[API ERROR] Update Profile:', error);
      return networkError(error, 'Update Profile');
    }
  },

  async changePassword(old_password, new_password) {
    try {
      const response = await fetch(`${API_URL}/accounts/change-password/`, {
        method: 'PUT',
        headers: await getHeaders(true),
        body: JSON.stringify({ old_password, new_password }),
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Change Password');
    }
  },

  async getScholarships(params = '') {
    try {
      const url = `${API_URL}/scholarships/${params ? '?' + params : ''}`;
      const response = await fetchWithTimeout(url, {
        method: 'GET',
        headers: await getHeaders(true),
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
        headers: await getHeaders(true),
        mode: 'cors',
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Get Scholarship Detail');
    }
  },

  async getSubmissionFeedback() {
    try {
      const response = await fetch(`${API_URL}/scholarships/submission-feedback/`, {
        method: 'GET',
        headers: await getHeaders(true),
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Get Submission Feedback');
    }
  },

  async addScholarship(scholarshipData) {
    try {
      const isFormData = scholarshipData instanceof FormData;
      const headers = await getHeaders(true);

      if (isFormData && Platform.OS === 'web') {
        const token = headers['Authorization'];
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', `${API_URL}/scholarships/`);
          if (token) {
            xhr.setRequestHeader('Authorization', token);
          }
          xhr.onload = () => {
            try {
              const data = JSON.parse(xhr.responseText);
              resolve({ ok: xhr.status >= 200 && xhr.status < 300, status: xhr.status, data });
            } catch (e) {
              resolve({ ok: false, data: { error: 'Invalid response from server' } });
            }
          };
          xhr.onerror = () => {
            resolve({ ok: false, data: { error: 'Network request failed' } });
          };
          xhr.send(scholarshipData);
        });
      }

      // If it's FormData, let the browser/native fetch set the Content-Type boundary
      if (isFormData) {
        delete headers['Content-Type'];
      }

      const response = await fetch(`${API_URL}/scholarships/`, {
        method: 'POST',
        headers: headers,
        body: isFormData ? scholarshipData : JSON.stringify(scholarshipData),
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Add Scholarship');
    }
  },

  async updateScholarship(id, scholarshipData) {
    try {
      const isFormData = scholarshipData instanceof FormData;
      const headers = await getHeaders(true);

      if (isFormData && Platform.OS === 'web') {
        const token = headers['Authorization'];
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('PATCH', `${API_URL}/scholarships/${id}/`);
          if (token) {
            xhr.setRequestHeader('Authorization', token);
          }
          xhr.onload = () => {
            try {
              const data = JSON.parse(xhr.responseText);
              resolve({ ok: xhr.status >= 200 && xhr.status < 300, status: xhr.status, data });
            } catch (e) {
              resolve({ ok: false, data: { error: 'Invalid response from server' } });
            }
          };
          xhr.onerror = () => {
            resolve({ ok: false, data: { error: 'Network request failed' } });
          };
          xhr.send(scholarshipData);
        });
      }

      if (isFormData) {
        delete headers['Content-Type'];
      }

      const response = await fetch(`${API_URL}/scholarships/${id}/`, {
        method: 'PATCH',
        headers: headers,
        body: isFormData ? scholarshipData : JSON.stringify(scholarshipData),
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

  async saveScholarship(scholarshipId) {
    try {
      const response = await fetch(`${API_URL}/applications/saved/`, {
        method: 'POST',
        headers: await getHeaders(),
        body: JSON.stringify({ scholarship: scholarshipId }),
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Save Scholarship');
    }
  },

  async unsaveScholarship(saveId) {
    try {
      const response = await fetch(`${API_URL}/applications/saved/${saveId}/`, {
        method: 'DELETE',
        headers: await getHeaders(),
      });
      return { ok: response.ok };
    } catch (error) {
      return networkError(error, 'Unsave Scholarship');
    }
  },

  async approveScholarship(id, action, note = '') {
    try {
      const response = await fetch(`${API_URL}/scholarships/${id}/approve/`, {
        method: 'POST',
        headers: await getHeaders(),
        body: JSON.stringify({ action, note }),
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Approve Scholarship');
    }
  },

  async isStaff() {
    try {
      const cached = await AsyncStorage.getItem('is_staff');
      if (cached !== null) return cached === 'true';
      const res = await this.getProfile();
      if (res.ok) {
        const status = res.data.is_staff === true;
        await AsyncStorage.setItem('is_staff', status.toString());
        return status;
      }
      return false;
    } catch (e) {
      return false;
    }
  },

  async getUsers(params = '') {
    try {
      const response = await fetch(`${API_URL}/accounts/users/${params ? '?' + params : ''}`, {
        method: 'GET',
        headers: await getHeaders(true),
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Get Users');
    }
  },

  async getAdminStats() {
    try {
      const response = await fetch(`${API_URL}/scholarships/admin-stats/`, {
        method: 'GET',
        headers: await getHeaders(true),
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Get Admin Stats');
    }
  },

  async getReportedContent() {
    try {
      const response = await fetch(`${API_URL}/community/reports/`, {
        method: 'GET',
        headers: await getHeaders(true),
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Get Reported Content');
    }
  },

  async resolveReport(reportId, action) {
    try {
      const response = await fetch(`${API_URL}/community/reports/${reportId}/`, {
        method: 'PATCH',
        headers: await getHeaders(),
        body: JSON.stringify({ status: action === 'delete' ? 'resolved' : 'dismissed' }),
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Resolve Report');
    }
  },

  async getMentorApplications() {
    try {
      const response = await fetch(`${API_URL}/community/mentor-applications/`, {
        method: 'GET',
        headers: await getHeaders(true),
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Get Mentor Applications');
    }
  },

  async approveMentor(id, status) {
    try {
      const response = await fetch(`${API_URL}/community/mentor-applications/${id}/`, {
        method: 'PATCH',
        headers: await getHeaders(),
        body: JSON.stringify({ status }),
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Approve Mentor');
    }
  },

  async getLeaderboard() {
    try {
      const response = await fetch(`${API_URL}/accounts/leaderboard/`, {
        method: 'GET',
        headers: await getHeaders(true),
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Get Leaderboard');
    }
  },

  async logout() {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('admin_verified');
    await AsyncStorage.removeItem('is_staff');
    try {
      await firebaseAuth.signOut();
    } catch (e) {
      console.warn('Firebase logout failed:', e.message);
    }
  },

  // — Community Discussions —
  async getDiscussions(params = '') {
    try {
      const url = `${API_URL}/community/${params ? '?' + params : ''}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: await getHeaders(true),
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Get Discussions');
    }
  },

  async getDiscussionDetail(id) {
    try {
      const response = await fetch(`${API_URL}/community/${id}/`, {
        method: 'GET',
        headers: await getHeaders(true),
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Get Discussion Detail');
    }
  },

  async createDiscussion(data) {
    try {
      const token = await getToken();
      const formData = new FormData();
      if (data.title) formData.append('title', data.title);
      if (data.content) formData.append('content', data.content);
      if (data.category) formData.append('category', data.category);
      if (data.poll_question) formData.append('poll_question', data.poll_question);
      if (data.image) {
        if (Platform.OS === 'web') {
          const response = await fetch(data.image.uri);
          const blob = await response.blob();
          formData.append('image', blob, data.image.fileName || `img_${Date.now()}.jpg`);
        } else {
          const uri = Platform.OS === 'ios' ? data.image.uri.replace('file://', '') : data.image.uri;
          formData.append('image', {
            uri,
            name: data.image.fileName || `img_${Date.now()}.jpg`,
            type: data.image.mimeType || 'image/jpeg'
          });
        }
      }
      if (data.poll_options && data.poll_options.length > 0) {
        formData.append('poll_options', JSON.stringify(data.poll_options));
      }
      const headers = await getHeaders(true);
      delete headers['Content-Type'];
      headers['Accept'] = 'application/json';

      const response = await fetch(`${API_URL}/community/`, {
        method: 'POST',
        headers: headers,
        body: formData,
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Create Discussion');
    }
  },

  async updateDiscussion(id, data) {
    try {
      const headers = await getHeaders(true);
      let body;
      const isMultipart = !!data.image;

      if (isMultipart) {
        const formData = new FormData();
        if (data.title) formData.append('title', data.title);
        if (data.content) formData.append('content', data.content);
        if (data.category) formData.append('category', data.category);
        if (data.is_solved !== undefined) formData.append('is_solved', data.is_solved);

        if (data.image) {
          if (Platform.OS === 'web') {
            const response = await fetch(data.image.uri);
            const blob = await response.blob();
            formData.append('image', blob, data.image.fileName || 'discussion_update.jpg');
          } else {
            formData.append('image', {
              uri: Platform.OS === 'ios' ? data.image.uri.replace('file://', '') : data.image.uri,
              name: data.image.fileName || 'discussion_update.jpg',
              type: data.image.mimeType || 'image/jpeg'
            });
          }
        }
        delete headers['Content-Type'];
        body = formData;
      } else {
        body = JSON.stringify(data);
      }

      const response = await fetch(`${API_URL}/community/${id}/`, {
        method: 'PATCH',
        headers: headers,
        body: body,
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Update Discussion');
    }
  },

  async voteDiscussion(id, optionId) {
    try {
      const response = await fetch(`${API_URL}/community/${id}/vote/`, {
        method: 'POST',
        headers: await getHeaders(),
        body: JSON.stringify({ option_id: optionId }),
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Vote Discussion');
    }
  },

  async likeDiscussion(id) {
    try {
      const response = await fetch(`${API_URL}/community/${id}/like/`, {
        method: 'POST',
        headers: await getHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Like Discussion');
    }
  },

  async commentDiscussion(id, content) {
    try {
      const response = await fetch(`${API_URL}/community/${id}/comment/`, {
        method: 'POST',
        headers: await getHeaders(),
        body: JSON.stringify({ content }),
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Comment Discussion');
    }
  },

  // — Community Stories —
  async getStories() {
    try {
      const response = await fetch(`${API_URL}/community/stories/`, {
        method: 'GET',
        headers: await getHeaders(true),
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Get Stories');
    }
  },

  async createStory(data) {
    try {
      const token = await getToken();
      const formData = new FormData();
      if (data.caption) formData.append('caption', data.caption);
      if (data.media) {
        if (Platform.OS === 'web') {
          const response = await fetch(data.media.uri);
          const blob = await response.blob();
          formData.append('media', blob, data.media.fileName || 'story.jpg');
        } else {
          formData.append('media', {
            uri: Platform.OS === 'ios' ? data.media.uri.replace('file://', '') : data.media.uri,
            name: data.media.fileName || 'story.jpg',
            type: data.media.mimeType || 'image/jpeg'
          });
        }
      }
      const headers = await getHeaders(true);
      delete headers['Content-Type'];

      const response = await fetch(`${API_URL}/community/stories/`, {
        method: 'POST',
        headers: headers,
        body: formData,
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Create Story');
    }
  },

  // — Blog / Success Stories —
  async getBlogPosts(type = '') {
    try {
      const url = `${API_URL}/blog/${type ? '?type=' + type : ''}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: await getHeaders(true),
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Get Blogs');
    }
  },

  async getBlogPostDetail(id) {
    try {
      const response = await fetch(`${API_URL}/blog/${id}/`, {
        method: 'GET',
        headers: await getHeaders(true),
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Get Blog Detail');
    }
  },

  async createBlogPost(formData) {
    try {
      const headers = await getHeaders(true);
      delete headers['Content-Type'];

      const response = await fetch(`${API_URL}/blog/`, {
        method: 'POST',
        headers: headers,
        body: formData,
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Create Blog');
    }
  },

  async updateBlogPost(id, data) {
    try {
      const response = await fetch(`${API_URL}/blog/${id}/`, {
        method: 'PATCH',
        headers: await getHeaders(),
        body: JSON.stringify(data)
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Update Blog');
    }
  },

  async deleteBlogPost(id) {
    try {
      const response = await fetch(`${API_URL}/blog/${id}/`, {
        method: 'DELETE',
        headers: await getHeaders()
      });
      return { ok: response.ok };
    } catch (error) {
      return networkError(error, 'Delete Blog');
    }
  },

  async reactToBlogPost(id, reaction) {
    try {
      const response = await fetch(`${API_URL}/blog/${id}/like/`, {
        method: 'POST',
        headers: await getHeaders(),
        body: JSON.stringify({ reaction_type: reaction })
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'React to Blog');
    }
  },

  async commentBlogPost(id, content) {
    try {
      const response = await fetch(`${API_URL}/blog/${id}/comment/`, {
        method: 'POST',
        headers: await getHeaders(),
        body: JSON.stringify({ content })
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Comment Blog');
    }
  },

  async deleteComment(commentId) {
    try {
      const response = await fetch(`${API_URL}/community/comments/${commentId}/`, {
        method: 'DELETE',
        headers: await getHeaders()
      });
      return { ok: response.ok };
    } catch (error) {
      return networkError(error, 'Delete Comment');
    }
  },

  async updateComment(commentId, content) {
    try {
      const response = await fetch(`${API_URL}/community/comments/${commentId}/`, {
        method: 'PATCH',
        headers: await getHeaders(),
        body: JSON.stringify({ content })
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Update Comment');
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

  async getApplications() {
    try {
      const response = await fetch(`${API_URL}/applications/apply/`, {
        method: 'GET',
        headers: await getHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Get Applications');
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

  async uploadDocument(fileData, name, type, expiryDate = null) {
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('doc_type', type);
      if (expiryDate) formData.append('expiry_date', expiryDate);

      if (Platform.OS === 'web') {
        const response = await fetch(fileData.uri);
        const blob = await response.blob();
        formData.append('file', blob, fileData.name || 'document.pdf');
      } else {
        formData.append('file', {
          uri: Platform.OS === 'ios' ? fileData.uri.replace('file://', '') : fileData.uri,
          name: fileData.name || 'document.pdf',
          type: fileData.mimeType || 'application/pdf'
        });
      }

      const response = await fetch(`${API_URL}/applications/documents/`, {
        method: 'POST',
        headers: await getHeaders(true),
        body: formData,
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Upload Document');
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
  },

  // — AI Assistant —
  async aiWriteSOP(scholarshipId) {
    try {
      const response = await fetch(`${API_URL}/ai/write-sop/`, {
        method: 'POST',
        headers: await getHeaders(),
        body: JSON.stringify({ scholarship_id: scholarshipId }),
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'AI Write SOP');
    }
  },

  async aiCheckEligibility(scholarshipId) {
    try {
      const response = await fetch(`${API_URL}/ai/check-eligibility/`, {
        method: 'POST',
        headers: await getHeaders(),
        body: JSON.stringify({ scholarship_id: scholarshipId }),
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'AI Check Eligibility');
    }
  },

  async aiLiveSupport(message, history = []) {
    try {
      const response = await fetch(`${API_URL}/ai/live-support/`, {
        method: 'POST',
        headers: await getHeaders(),
        body: JSON.stringify({ message, history }),
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'AI Live Support');
    }
  },

  async aiGenerateBio() {
    try {
      const response = await fetch(`${API_URL}/ai/generate-bio/`, {
        method: 'POST',
        headers: await getHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'AI Generate Bio');
    }
  },

  async getScholarshipMatches() {
    try {
      const response = await fetch(`${API_URL}/ai/matchmaker/`, {
        method: 'GET',
        headers: await getHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Get Matchmaker');
    }
  },

  // — Mentorship —
  async getMentors() {
    try {
      const response = await fetch(`${API_URL}/community/mentors/`, {
        method: 'GET',
        headers: await getHeaders(true),
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Get Mentors');
    }
  },

  async requestMentorship(mentorId, topic, message, scheduledDate = null, scheduledTime = null) {
    try {
      const response = await fetch(`${API_URL}/community/mentorships/`, {
        method: 'POST',
        headers: await getHeaders(),
        body: JSON.stringify({
          mentor: mentorId,
          topic,
          message,
          scheduled_date: scheduledDate,
          scheduled_time: scheduledTime
        }),
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Request Mentorship');
    }
  },

  async getMentorships() {
    try {
      const response = await fetch(`${API_URL}/community/mentorships/`, {
        method: 'GET',
        headers: await getHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Get Mentorships');
    }
  },

  async updateMentorshipStatus(id, status) {
    try {
      const response = await fetch(`${API_URL}/community/mentorships/${id}/`, {
        method: 'PATCH',
        headers: await getHeaders(),
        body: JSON.stringify({ status }),
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Update Mentorship Status');
    }
  },

  async submitMentorReview(mentorId, rating, comment) {
    try {
      const response = await fetch(`${API_URL}/community/reviews/`, {
        method: 'POST',
        headers: await getHeaders(),
        body: JSON.stringify({ mentor: mentorId, rating, comment }),
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Submit Review');
    }
  },

  async getMentorReviews(mentorId) {
    try {
      const response = await fetch(`${API_URL}/community/reviews/?mentor=${mentorId}`, {
        method: 'GET',
        headers: await getHeaders(true),
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Get Reviews');
    }
  },

  async getAutocomplete(type, query) {
    try {
      const response = await fetch(`${API_URL}/accounts/autocomplete/?type=${type}&q=${query}`, {
        method: 'GET',
        headers: await getHeaders(true),
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Get Autocomplete');
    }
  },

  // — Payments & Pro Tier —
  async initiateCheckout(paymentMethod = 'Generic') {
    try {
      const response = await fetch(`${API_URL}/payments/checkout/`, {
        method: 'POST',
        headers: await getHeaders(),
        body: JSON.stringify({ payment_method: paymentMethod }),
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Initiate Checkout');
    }
  },

  async createStripeIntent() {
    try {
      const response = await fetch(`${API_URL}/payments/stripe/create-intent/`, {
        method: 'POST',
        headers: await getHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Create Stripe Intent');
    }
  },

  async createBKashPayment() {
    try {
      const response = await fetch(`${API_URL}/payments/bkash/create/`, {
        method: 'POST',
        headers: await getHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Create bKash');
    }
  },

  async executeBKashPayment(paymentID, otp, pin) {
    try {
      const response = await fetch(`${API_URL}/payments/bkash/execute/`, {
        method: 'POST',
        headers: await getHeaders(),
        body: JSON.stringify({ paymentID, otp, pin }),
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Execute bKash');
    }
  },

  async getPaymentHistory() {
    try {
      const response = await fetch(`${API_URL}/payments/history/`, {
        method: 'GET',
        headers: await getHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Get Payment History');
    }
  },

  async upgradeWithPoints() {
    try {
      const response = await fetch(`${API_URL}/accounts/upgrade-pro/`, {
        method: 'POST',
        headers: await getHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Upgrade with Points');
    }
  },

  async forgotPassword(email) {
    try {
      const response = await fetch(`${API_URL}/accounts/forgot-password/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Forgot Password');
    }
  },

  async getUserActivity() {
    try {
      const response = await fetch(`${API_URL}/accounts/activity/`, {
        method: 'GET',
        headers: await getHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Get User Activity');
    }
  },

  async getStudentAnalytics() {
    try {
      const response = await fetch(`${API_URL}/accounts/analytics/`, {
        method: 'GET',
        headers: await getHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Get Student Analytics');
    }
  },

  // — Admin APIs —
  async getAdminLogs() {
    try {
      const response = await fetch(`${API_URL}/accounts/admin/logs/`, {
        method: 'GET',
        headers: await getHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Get Admin Logs');
    }
  },

  async getAdminBroadcasts() {
    try {
      const response = await fetch(`${API_URL}/notifications/broadcast/`, {
        method: 'GET',
        headers: await getHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Get Broadcasts');
    }
  },

  async createReport(data) {
    try {
      const response = await fetch(`${API_URL}/community/reports/`, {
        method: 'POST',
        headers: await getHeaders(),
        body: JSON.stringify(data),
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Create Report');
    }
  },

  async sendBroadcast(title, message) {
    try {
      const response = await fetch(`${API_URL}/notifications/broadcast/`, {
        method: 'POST',
        headers: await getHeaders(),
        body: JSON.stringify({ title, message }),
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Send Broadcast');
    }
  },

  async getModerationReports() {
    try {
      const response = await fetch(`${API_URL}/community/reports/`, {
        method: 'GET',
        headers: await getHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Get Moderation Reports');
    }
  },

  // — Connections & Chat —
  async getConnections() {
    try {
      const response = await fetch(`${API_URL}/community/connections/`, {
        method: 'GET',
        headers: await getHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Get Connections');
    }
  },

  async requestConnection(receiverId) {
    try {
      const response = await fetch(`${API_URL}/community/connections/`, {
        method: 'POST',
        headers: await getHeaders(),
        body: JSON.stringify({ receiver: receiverId }),
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Request Connection');
    }
  },

  async handleConnectionRequest(connectionId, action) {
    try {
      const response = await fetch(`${API_URL}/community/connections/${connectionId}/action/`, {
        method: 'POST',
        headers: await getHeaders(),
        body: JSON.stringify({ action }),
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Handle Connection');
    }
  },

  async sendMessage(receiverId, message, image = null, relatedAppId = null) {
    try {
      const headers = await getHeaders(true);

      let body;
      if (image) {
        body = new FormData();
        body.append('receiver', receiverId);
        if (message) body.append('message', message);
        if (relatedAppId) body.append('related_application_id', relatedAppId);

        if (Platform.OS === 'web') {
          const response = await fetch(image.uri);
          const blob = await response.blob();
          body.append('image', blob, image.fileName || 'chat_image.jpg');
        } else {
          body.append('image', {
            uri: Platform.OS === 'ios' ? image.uri.replace('file://', '') : image.uri,
            name: image.fileName || 'chat_image.jpg',
            type: image.type || 'image/jpeg'
          });
        }
        delete headers['Content-Type'];
      } else {
        body = JSON.stringify({ receiver: receiverId, message, related_application_id: relatedAppId });
        // Content-Type is already application/json from getHeaders()
      }

      const response = await fetchWithTimeout(`${API_URL}/community/chat/`, {
        method: 'POST',
        headers: headers,
        body: body,
      }, 10000);
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Send Message');
    }
  },

  async reactToMessage(messageId, reaction) {
    try {
      const response = await fetch(`${API_URL}/community/chat/msg/${messageId}/react/`, {
        method: 'POST',
        headers: await getHeaders(),
        body: JSON.stringify({ reaction }),
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'React to Message');
    }
  },

  async getChatHistory(otherUserId) {
    try {
      const response = await fetchWithTimeout(`${API_URL}/community/chat/${otherUserId}/`, {
        method: 'GET',
        headers: await getHeaders(),
      }, 15000); // 15s timeout for chat history
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Get Chat History');
    }
  },

  async getConversations(params = '') {
    try {
      const response = await fetch(`${API_URL}/community/conversations/${params ? '?' + params : ''}`, {
        method: 'GET',
        headers: await getHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Get Conversations');
    }
  },

  async editMessage(messageId, message) {
    try {
      const response = await fetchWithTimeout(`${API_URL}/community/chat/msg/${messageId}/`, {
        method: 'PATCH',
        headers: await getHeaders(),
        body: JSON.stringify({ message }),
      }, 5000);
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Edit Message');
    }
  },

  async deleteMessage(messageId) {
    try {
      const response = await fetchWithTimeout(`${API_URL}/community/chat/msg/${messageId}/`, {
        method: 'DELETE',
        headers: await getHeaders(),
      }, 5000);
      return await handleResponse(response);
    } catch (error) {
      return networkError(error, 'Delete Message');
    }
  }
};
