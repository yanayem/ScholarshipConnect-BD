import { auth } from './firebase';
import { ApiResponse } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://scholarshipconnectbd.onrender.com/api";

export function getAvatarUrl(u: any): string | null {
  if (!u) return null;
  let url = typeof u === 'string' ? u : (u.avatar_url || u.profile_picture_url || u.profile_picture || u.avatar);
  if (!url || typeof url !== 'string') return null;
  url = url.trim();
  if (!url) return null;

  // Convert http to https for remote domains (like Cloudinary), but keep plain http for local dev servers (127.0.0.1 / localhost)
  if (url.startsWith('http://') && !url.includes('127.0.0.1') && !url.includes('localhost')) {
    url = 'https://' + url.substring(7);
  }

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    if (!url.startsWith('/')) {
      url = '/' + url;
    }
    const backendBase = (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api').replace(/\/api\/?$/, '');
    url = `${backendBase}${url}`;
  }

  // Safety net: if Cloudinary URL still lacks a file extension (old data), try .jpg as last resort
  if (url.includes('res.cloudinary.com') && !url.split('?')[0].toLowerCase().match(/\.(jpg|jpeg|png|webp|gif|svg)$/)) {
    if (url.includes('?')) {
      const parts = url.split('?');
      url = `${parts[0]}.jpg?${parts.slice(1).join('?')}`;
    } else {
      url = `${url}.jpg`;
    }
  }

  if (typeof u === 'object' && u !== null) {
    const ts = u.updated_at ? new Date(u.updated_at).getTime() : null;
    if (ts && !isNaN(ts)) {
      url += (url.includes('?') ? '&' : '?') + `v=${ts}`;
    }
  }

  return url;
}

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
    const isFormData = typeof FormData !== 'undefined' && profileData instanceof FormData;

    if (isFormData) {
      const user = auth.currentUser;
      const headers: Record<string, string> = {};
      if (user) {
        const token = await user.getIdToken();
        headers['Authorization'] = `Bearer ${token}`;
      }
      return await safeFetch(`${API_URL}/accounts/profile/`, {
        method: 'PATCH',
        headers,
        body: profileData,
      });
    }

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

  async extractScholarshipFromUrl(url: string) {
    return await safeFetch(`${API_URL}/scholarships/extract-url/`, {
      method: 'POST',
      headers: await getHeaders(true),
      body: JSON.stringify({ url }),
    });
  },

  async aiExtractScholarship(text: string) {
    return await safeFetch(`${API_URL}/scholarships/ai-extract/`, {
      method: 'POST',
      headers: await getHeaders(true),
      body: JSON.stringify({ text }),
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

  async getDiscussionDetail(id: number | string) {
    return await safeFetch(`${API_URL}/community/${id}/`, {
      method: 'GET',
      headers: await getHeaders(true),
    });
  },

  async createDiscussion(data: FormData | object) {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    const headers = await getHeaders(true);
    if (isFormData) {
      delete headers['Content-Type'];
    }
    return await safeFetch(`${API_URL}/community/`, {
      method: 'POST',
      headers: headers,
      body: isFormData ? (data as FormData) : JSON.stringify(data),
    });
  },

  async updateDiscussion(id: number | string, data: FormData | object) {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    const headers = await getHeaders(true);
    if (isFormData) {
      delete headers['Content-Type'];
    }
    return await safeFetch(`${API_URL}/community/${id}/`, {
      method: 'PATCH',
      headers: headers,
      body: isFormData ? (data as FormData) : JSON.stringify(data),
    });
  },

  async deleteDiscussion(id: number | string) {
    return await safeFetch(`${API_URL}/community/${id}/`, {
      method: 'DELETE',
      headers: await getHeaders(true),
    });
  },

  async likeDiscussion(id: number | string) {
    return await safeFetch(`${API_URL}/community/${id}/like/`, {
      method: 'POST',
      headers: await getHeaders(true),
    });
  },

  async voteDiscussion(id: number | string, optionId: number | string) {
    return await safeFetch(`${API_URL}/community/${id}/vote/`, {
      method: 'POST',
      headers: await getHeaders(true),
      body: JSON.stringify({ option_id: optionId }),
    });
  },

  async commentDiscussion(id: number | string, content: string) {
    return await safeFetch(`${API_URL}/community/${id}/comment/`, {
      method: 'POST',
      headers: await getHeaders(true),
      body: JSON.stringify({ content }),
    });
  },

  async updateDiscussionComment(commentId: number | string, content: string) {
    return await safeFetch(`${API_URL}/community/comments/${commentId}/`, {
      method: 'PATCH',
      headers: await getHeaders(true),
      body: JSON.stringify({ content }),
    });
  },

  async deleteDiscussionComment(commentId: number | string) {
    return await safeFetch(`${API_URL}/community/comments/${commentId}/`, {
      method: 'DELETE',
      headers: await getHeaders(true),
    });
  },

  async getStories() {
    return await safeFetch(`${API_URL}/community/stories/`, {
      method: 'GET',
      headers: await getHeaders(true),
    });
  },

  async createStory(data: FormData | object) {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    const headers = await getHeaders(true);
    if (isFormData) {
      delete headers['Content-Type'];
    }
    return await safeFetch(`${API_URL}/community/stories/`, {
      method: 'POST',
      headers: headers,
      body: isFormData ? (data as FormData) : JSON.stringify(data),
    });
  },

  async createReport(data: any) {
    return await safeFetch(`${API_URL}/community/reports/`, {
      method: 'POST',
      headers: await getHeaders(true),
      body: JSON.stringify(data),
    });
  },

  async getMentors() {
    return await safeFetch(`${API_URL}/community/mentors/`, {
      method: 'GET',
      headers: await getHeaders(true),
    });
  },

  async getMentorReviews(mentorId: number | string) {
    return await safeFetch(`${API_URL}/community/reviews/?mentor=${mentorId}`, {
      method: 'GET',
      headers: await getHeaders(true),
    });
  },

  async submitMentorReview(mentorId: number | string, rating: number, comment: string) {
    return await safeFetch(`${API_URL}/community/reviews/`, {
      method: 'POST',
      headers: await getHeaders(true),
      body: JSON.stringify({ mentor: mentorId, rating, comment }),
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

  async getBlogPostDetail(id: number | string) {
    return await safeFetch(`${API_URL}/blog/${id}/`, {
      method: 'GET',
      headers: await getHeaders(true),
    });
  },

  async createBlogPost(data: FormData | object) {
    const isFormData = data instanceof FormData;
    return await safeFetch(`${API_URL}/blog/`, {
      method: 'POST',
      headers: await getHeaders(!isFormData),
      body: isFormData ? (data as FormData) : JSON.stringify(data),
    });
  },

  async reactBlogPost(id: number | string, reactionType = 'love') {
    return await safeFetch(`${API_URL}/blog/${id}/react/`, {
      method: 'POST',
      headers: await getHeaders(true),
      body: JSON.stringify({ reaction_type: reactionType }),
    });
  },

  async addBlogComment(id: number | string, content: string) {
    return await safeFetch(`${API_URL}/blog/${id}/comment/`, {
      method: 'POST',
      headers: await getHeaders(true),
      body: JSON.stringify({ content }),
    });
  },

  async getPublicStats() {
    return await safeFetch(`${API_URL}/scholarships/public-stats/`, {
      method: 'GET',
      headers: await getHeaders(false),
    });
  },

  // --- AI Assistant ---
  async getScholarshipMatches() {
    return await safeFetch(`${API_URL}/ai/matchmaker/`, {
      method: 'GET',
      headers: await getHeaders(true),
    });
  },

  async getApplications(admin?: boolean) {
    const url = admin ? `${API_URL}/applications/?admin=true` : `${API_URL}/applications/`;
    return await safeFetch(url, {
      method: 'GET',
      headers: await getHeaders(true),
    });
  },

  async getApplicationDetail(id: number | string) {
    return await safeFetch(`${API_URL}/applications/apply/${id}/`, {
      method: 'GET',
      headers: await getHeaders(true),
    });
  },

  async updateApplicationStatus(id: number | string, status: string) {
    return await safeFetch(`${API_URL}/applications/apply/${id}/`, {
      method: 'PATCH',
      headers: await getHeaders(true),
      body: JSON.stringify({ status }),
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

  async initiateCheckout(paymentMethod: string = 'SSLCommerz') {
    return await safeFetch(`${API_URL}/payments/checkout/`, {
      method: 'POST',
      headers: await getHeaders(true),
      body: JSON.stringify({ payment_method: paymentMethod }),
    });
  },

  async createBKashPayment() {
    return await safeFetch(`${API_URL}/payments/bkash/create/`, {
      method: 'POST',
      headers: await getHeaders(true),
    });
  },

  async executeBKashPayment(paymentID: string, otp: string, pin: string) {
    return await safeFetch(`${API_URL}/payments/bkash/execute/`, {
      method: 'POST',
      headers: await getHeaders(true),
      body: JSON.stringify({ paymentID, otp, pin }),
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

  async uploadDocument(formData: FormData) {
    const user = auth.currentUser;
    const headers: Record<string, string> = {};
    if (user) {
      const token = await user.getIdToken();
      headers['Authorization'] = `Bearer ${token}`;
    }
    return await safeFetch(`${API_URL}/applications/documents/`, {
      method: 'POST',
      headers,
      body: formData,
    });
  },

  async deleteDocument(id: number | string) {
    return await safeFetch(`${API_URL}/applications/documents/${id}/`, {
      method: 'DELETE',
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

  async aiReviewSOP(sopText: string) {
    return await safeFetch(`${API_URL}/ai/review-sop/`, {
      method: 'POST',
      headers: await getHeaders(true),
      body: JSON.stringify({ sop_text: sopText }),
    });
  },

  async aiParaphraseSOP(sopText: string, style: string = 'academic') {
    return await safeFetch(`${API_URL}/ai/paraphrase-sop/`, {
      method: 'POST',
      headers: await getHeaders(true),
      body: JSON.stringify({ sop_text: sopText, style }),
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

  async updateAIChatMessage(id: string | number, message: string) {
    return await safeFetch(`${API_URL}/ai/chat-history/${id}/`, {
      method: 'PATCH',
      headers: await getHeaders(true),
      body: JSON.stringify({ message }),
    });
  },

  async deleteAIChatMessage(id: string | number) {
    return await safeFetch(`${API_URL}/ai/chat-history/${id}/`, {
      method: 'DELETE',
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

  async deleteScholarship(id: number | string) {
    return await safeFetch(`${API_URL}/scholarships/${id}/`, {
      method: 'DELETE',
      headers: await getHeaders(true),
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
