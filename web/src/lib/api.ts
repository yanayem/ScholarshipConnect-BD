import { auth } from './firebase';
import { ApiResponse } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://scholarshipconnectbd.onrender.com/api";

const handleResponse = async (response: Response) => {
  const contentType = response.headers.get("content-type");
  const text = await response.text();
  let data;

  try {
    if (contentType && contentType.includes("application/json")) {
      data = text ? JSON.parse(text) : {};
    } else {
      data = text ? { message: text } : {};
    }
  } catch (e) {
    data = { error: 'Invalid response format', details: text };
  }

  // Handle Django paginated responses automatically
  if (data && typeof data === 'object' && data.results && Array.isArray(data.results)) {
    const results = data.results;
    Object.defineProperty(results, '_pagination', {
      value: { count: data.count, next: data.next, previous: data.previous },
      enumerable: false
    });
    data = results;
  }

  return { ok: response.ok, status: response.status, data };
};

const getHeaders = async (includeToken = true) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (includeToken) {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

export const apiService = {
  // --- System ---
  async getHealth() {
    const response = await fetch(`${API_URL}/health/`, {
      method: 'GET',
      headers: await getHeaders(false),
    });
    return await handleResponse(response);
  },

  // --- Auth & Profile ---
  async getProfile() {
    const response = await fetch(`${API_URL}/accounts/profile/`, {
      method: 'GET',
      headers: await getHeaders(true),
    });
    return await handleResponse(response);
  },

  async updateProfile(profileData: any) {
    const response = await fetch(`${API_URL}/accounts/profile/`, {
      method: 'PATCH',
      headers: await getHeaders(true),
      body: JSON.stringify(profileData),
    });
    return await handleResponse(response);
  },

  // --- Scholarships ---
  async getScholarships(params = '') {
    const url = `${API_URL}/scholarships/${params ? '?' + params : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: await getHeaders(true),
    });
    return await handleResponse(response);
  },

  async getScholarshipDetail(id: number | string) {
    const response = await fetch(`${API_URL}/scholarships/${id}/`, {
      method: 'GET',
      headers: await getHeaders(true),
    });
    return await handleResponse(response);
  },

  async saveScholarship(scholarshipId: number) {
    const response = await fetch(`${API_URL}/applications/saved/`, {
      method: 'POST',
      headers: await getHeaders(true),
      body: JSON.stringify({ scholarship: scholarshipId }),
    });
    return await handleResponse(response);
  },

  async unsaveScholarship(saveId: number) {
    const response = await fetch(`${API_URL}/applications/saved/${saveId}/`, {
      method: 'DELETE',
      headers: await getHeaders(true),
    });
    return await handleResponse(response);
  },

  async addScholarship(formData: FormData) {
    const user = auth.currentUser;
    const headers: Record<string, string> = {};
    if (user) {
      const token = await user.getIdToken();
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/scholarships/`, {
      method: 'POST',
      headers,
      body: formData,
    });
    return await handleResponse(response);
  },

  // --- Community ---
  async getDiscussions(params = '') {
    const response = await fetch(`${API_URL}/community/${params ? '?' + params : ''}`, {
      method: 'GET',
      headers: await getHeaders(true),
    });
    return await handleResponse(response);
  },

  async getMentors() {
    const response = await fetch(`${API_URL}/community/mentors/`, {
      method: 'GET',
      headers: await getHeaders(true),
    });
    return await handleResponse(response);
  },

  async getLeaderboard() {
    const response = await fetch(`${API_URL}/community/leaderboard/`, {
      method: 'GET',
      headers: await getHeaders(true),
    });
    return await handleResponse(response);
  },

  // --- Blog ---
  async getBlogPosts(type = '') {
    const response = await fetch(`${API_URL}/blog/${type ? '?type=' + type : ''}`, {
      method: 'GET',
      headers: await getHeaders(true),
    });
    return await handleResponse(response);
  },

  // --- AI Assistant ---
  async getScholarshipMatches() {
    const response = await fetch(`${API_URL}/ai/matchmaker/`, {
      method: 'GET',
      headers: await getHeaders(true),
    });
    return await handleResponse(response);
  },

  async getApplications() {
    const response = await fetch(`${API_URL}/applications/`, {
      method: 'GET',
      headers: await getHeaders(true),
    });
    return await handleResponse(response);
  },

  async getSavedScholarships() {
    const response = await fetch(`${API_URL}/applications/saved/`, {
      method: 'GET',
      headers: await getHeaders(true),
    });
    return await handleResponse(response);
  },

  async applyForScholarship(applicationData: any) {
    const response = await fetch(`${API_URL}/applications/apply/`, {
      method: 'POST',
      headers: await getHeaders(true),
      body: JSON.stringify(applicationData),
    });
    return await handleResponse(response);
  },

  async upgradeWithPoints() {
    const response = await fetch(`${API_URL}/accounts/upgrade-pro/`, {
      method: 'POST',
      headers: await getHeaders(true),
      body: JSON.stringify({ method: 'points' }),
    });
    return await handleResponse(response);
  },

  async getNotifications() {
    const response = await fetch(`${API_URL}/accounts/notifications/`, {
      method: 'GET',
      headers: await getHeaders(true),
    });
    return await handleResponse(response);
  },

  async getMentorships() {
    const response = await fetch(`${API_URL}/community/mentorships/`, {
      method: 'GET',
      headers: await getHeaders(true),
    });
    return await handleResponse(response);
  },

  async getDocuments() {
    const response = await fetch(`${API_URL}/applications/documents/`, {
      method: 'GET',
      headers: await getHeaders(true),
    });
    return await handleResponse(response);
  },

  async updateMentorshipStatus(id: number, status: string) {
    const response = await fetch(`${API_URL}/community/mentorships/${id}/`, {
      method: 'PATCH',
      headers: await getHeaders(true),
      body: JSON.stringify({ status }),
    });
    return await handleResponse(response);
  },

  async aiWriteSOP(scholarshipId: number) {
    const response = await fetch(`${API_URL}/ai/write-sop/`, {
      method: 'POST',
      headers: await getHeaders(true),
      body: JSON.stringify({ scholarship_id: scholarshipId }),
    });
    return await handleResponse(response);
  },

  async aiLiveSupport(message: string, history: string[] = []) {
    const response = await fetch(`${API_URL}/ai/live-support/`, {
      method: 'POST',
      headers: await getHeaders(true),
      body: JSON.stringify({ message, history }),
    });
    return await handleResponse(response);
  },

  async getAIChatHistory() {
    const response = await fetch(`${API_URL}/ai/chat-history/`, {
      method: 'GET',
      headers: await getHeaders(true),
    });
    return await handleResponse(response);
  },

  // --- Admin ---
  async getAdminStats() {
    const response = await fetch(`${API_URL}/scholarships/admin-stats/`, {
      method: 'GET',
      headers: await getHeaders(true),
    });
    return await handleResponse(response);
  },

  async logout() {
    await auth.signOut();
  }
};
