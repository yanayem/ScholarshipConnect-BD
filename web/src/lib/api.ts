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
      try {
        const token = await user.getIdToken();
        headers['Authorization'] = `Bearer ${token}`;
      } catch (err) {
        console.warn('[API] Token fetch error, retrying fresh token:', err);
        try {
          const freshToken = await user.getIdToken(true);
          headers['Authorization'] = `Bearer ${freshToken}`;
        } catch (e) {
          console.error('[API] Auth token error:', e);
        }
      }
    }
  }

  return headers;
};

const safeFetch = async (url: string, options: RequestInit) => {
  try {
    const response = await fetch(url, options);
    return await handleResponse(response);
  } catch (err: any) {
    // If local dev server is unreachable, attempt fallback to production API
    if (url.includes('127.0.0.1:8000') || url.includes('localhost:8000')) {
      const fallbackUrl = url.replace(/http:\/\/(127\.0\.0\.1|localhost):8000\/api/, 'https://scholarshipconnectbd.onrender.com/api');
      try {
        console.warn(`[API] Local backend unreachable at ${url}. Falling back to production API (${fallbackUrl})...`);
        const fallbackResponse = await fetch(fallbackUrl, options);
        return await handleResponse(fallbackResponse);
      } catch (fallbackErr: any) {
        console.error('[API] Fallback request failed:', fallbackErr);
      }
    }
    console.error(`[API] Network error fetching ${url}:`, err?.message || err);
    return {
      ok: false,
      status: 0,
      data: {
        error: 'Network Error',
        message: 'Unable to connect to backend server. Please check if local backend is running or check internet connection.'
      }
    };
  }
};

export const apiService = {
  // --- System ---
  async getHealth() {
    return await safeFetch(`${API_URL}/health/`, {
      method: 'GET',
      headers: await getHeaders(false),
    });
  },

  // --- Auth & Profile ---
  async getProfile() {
    return await safeFetch(`${API_URL}/accounts/profile/`, {
      method: 'GET',
      headers: await getHeaders(true),
    });
  },

  async getAutocomplete(type: string, q = '') {
    return await safeFetch(`${API_URL}/accounts/autocomplete/?type=${type}&q=${encodeURIComponent(q)}`, {
      method: 'GET',
      headers: await getHeaders(true),
    });
  },

  async updateProfile(profileData: any) {
    return await safeFetch(`${API_URL}/accounts/profile/`, {
      method: 'PATCH',
      headers: await getHeaders(true),
      body: JSON.stringify(profileData),
    });
  },

  async aiGenerateBio() {
    return await safeFetch(`${API_URL}/ai/generate-bio/`, {
      method: 'POST',
      headers: await getHeaders(true),
    });
  },

  // --- Scholarships ---
  async getScholarships(params = '') {
    const url = `${API_URL}/scholarships/${params ? '?' + params : ''}`;
    return await safeFetch(url, {
      method: 'GET',
      headers: await getHeaders(true),
    });
  },

  async getScholarshipDetail(id: number | string) {
    return await safeFetch(`${API_URL}/scholarships/${id}/`, {
      method: 'GET',
      headers: await getHeaders(true),
    });
  },

  async saveScholarship(scholarshipId: number) {
    return await safeFetch(`${API_URL}/applications/saved/`, {
      method: 'POST',
      headers: await getHeaders(true),
      body: JSON.stringify({ scholarship: scholarshipId }),
    });
  },

  async unsaveScholarship(saveId: number) {
    return await safeFetch(`${API_URL}/applications/saved/${saveId}/`, {
      method: 'DELETE',
      headers: await getHeaders(true),
    });
  },

  async addScholarship(formData: FormData) {
    const user = auth.currentUser;
    const headers: Record<string, string> = {};
    if (user) {
      const token = await user.getIdToken();
      headers['Authorization'] = `Bearer ${token}`;
    }

    return await safeFetch(`${API_URL}/scholarships/`, {
      method: 'POST',
      headers,
      body: formData,
    });
  },

  // --- Community ---
  async getDiscussions(params = '') {
    return await safeFetch(`${API_URL}/community/${params ? '?' + params : ''}`, {
      method: 'GET',
      headers: await getHeaders(true),
    });
  },

  async getMentors() {
    return await safeFetch(`${API_URL}/community/mentors/`, {
      method: 'GET',
      headers: await getHeaders(true),
    });
  },

  async getLeaderboard() {
    return await safeFetch(`${API_URL}/community/leaderboard/`, {
      method: 'GET',
      headers: await getHeaders(true),
    });
  },

  // --- Blog ---
  async getBlogPosts(type = '') {
    return await safeFetch(`${API_URL}/blog/${type ? '?type=' + type : ''}`, {
      method: 'GET',
      headers: await getHeaders(true),
    });
  },

  // --- AI Assistant ---
  async getScholarshipMatches() {
    return await safeFetch(`${API_URL}/ai/matchmaker/`, {
      method: 'GET',
      headers: await getHeaders(true),
    });
  },

  async getApplications() {
    return await safeFetch(`${API_URL}/applications/`, {
      method: 'GET',
      headers: await getHeaders(true),
    });
  },

  async getSavedScholarships() {
    return await safeFetch(`${API_URL}/applications/saved/`, {
      method: 'GET',
      headers: await getHeaders(true),
    });
  },

  async searchLiveScholarships(query: string = '') {
    return await safeFetch(`${API_URL}/scholarships/live-search/${query ? '?q=' + query : ''}`, {
      method: 'GET',
      headers: await getHeaders(true),
    });
  },

  async applyForScholarship(applicationData: any) {
    return await safeFetch(`${API_URL}/applications/apply/`, {
      method: 'POST',
      headers: await getHeaders(true),
      body: JSON.stringify(applicationData),
    });
  },

  async upgradeWithPoints() {
    return await safeFetch(`${API_URL}/accounts/upgrade-pro/`, {
      method: 'POST',
      headers: await getHeaders(true),
      body: JSON.stringify({ method: 'points' }),
    });
  },

  async getNotifications() {
    return await safeFetch(`${API_URL}/accounts/notifications/`, {
      method: 'GET',
      headers: await getHeaders(true),
    });
  },

  async getMentorships() {
    return await safeFetch(`${API_URL}/community/mentorships/`, {
      method: 'GET',
      headers: await getHeaders(true),
    });
  },

  async getDocuments() {
    return await safeFetch(`${API_URL}/applications/documents/`, {
      method: 'GET',
      headers: await getHeaders(true),
    });
  },

  async updateMentorshipStatus(id: number, status: string) {
    return await safeFetch(`${API_URL}/community/mentorships/${id}/`, {
      method: 'PATCH',
      headers: await getHeaders(true),
      body: JSON.stringify({ status }),
    });
  },

  async aiWriteSOP(scholarshipId: number) {
    return await safeFetch(`${API_URL}/ai/write-sop/`, {
      method: 'POST',
      headers: await getHeaders(true),
      body: JSON.stringify({ scholarship_id: scholarshipId }),
    });
  },

  async aiCheckEligibility(scholarshipId: number) {
    return await safeFetch(`${API_URL}/ai/check-eligibility/`, {
      method: 'POST',
      headers: await getHeaders(true),
      body: JSON.stringify({ scholarship_id: scholarshipId }),
    });
  },

  async aiLiveSupport(message: string, history: string[] = []) {
    return await safeFetch(`${API_URL}/ai/live-support/`, {
      method: 'POST',
      headers: await getHeaders(true),
      body: JSON.stringify({ message, history }),
    });
  },

  async getAIChatHistory() {
    return await safeFetch(`${API_URL}/ai/chat-history/`, {
      method: 'GET',
      headers: await getHeaders(true),
    });
  },

  // --- Admin ---
  async adminLogin(username: string, password: string) {
    return await safeFetch(`${API_URL}/accounts/admin-login/`, {
      method: 'POST',
      headers: await getHeaders(true),
      body: JSON.stringify({ username, password }),
    });
  },

  async getUsers(params = '') {
    return await safeFetch(`${API_URL}/accounts/users/${params ? '?' + params : ''}`, {
      method: 'GET',
      headers: await getHeaders(true),
    });
  },

  async getAdminStats() {
    return await safeFetch(`${API_URL}/scholarships/admin-stats/`, {
      method: 'GET',
      headers: await getHeaders(true),
    });
  },

  async getAdminLogs() {
    return await safeFetch(`${API_URL}/accounts/admin/logs/`, {
      method: 'GET',
      headers: await getHeaders(true),
    });
  },

  async getAdminBroadcasts() {
    return await safeFetch(`${API_URL}/notifications/broadcast/`, {
      method: 'GET',
      headers: await getHeaders(true),
    });
  },

  async sendBroadcast(title: string, message: string) {
    return await safeFetch(`${API_URL}/notifications/broadcast/`, {
      method: 'POST',
      headers: await getHeaders(true),
      body: JSON.stringify({ title, message }),
    });
  },

  async getModerationReports() {
    return await safeFetch(`${API_URL}/community/reports/`, {
      method: 'GET',
      headers: await getHeaders(true),
    });
  },

  async resolveReport(reportId: number, status: string) {
    return await safeFetch(`${API_URL}/community/reports/${reportId}/`, {
      method: 'PATCH',
      headers: await getHeaders(true),
      body: JSON.stringify({ status }),
    });
  },

  async getMentorApplications() {
    return await safeFetch(`${API_URL}/community/mentor-applications/`, {
      method: 'GET',
      headers: await getHeaders(true),
    });
  },

  async approveMentor(id: number, status: string) {
    return await safeFetch(`${API_URL}/community/mentor-applications/${id}/`, {
      method: 'PATCH',
      headers: await getHeaders(true),
      body: JSON.stringify({ status }),
    });
  },

  async updateScholarship(id: number | string, data: any) {
    const isFormData = data instanceof FormData;
    const headers = await getHeaders(true);
    if (isFormData) {
      delete headers['Content-Type'];
    }

    return await safeFetch(`${API_URL}/scholarships/${id}/`, {
      method: 'PATCH',
      headers: headers,
      body: isFormData ? data : JSON.stringify(data),
    });
  },

  async approveScholarship(id: number | string, action: string, note = '') {
    return await safeFetch(`${API_URL}/scholarships/${id}/approve/`, {
      method: 'POST',
      headers: await getHeaders(true),
      body: JSON.stringify({ action, note }),
    });
  },

  async logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_verified');
    }
    await auth.signOut();
  }
};
