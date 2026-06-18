import axios from 'axios';
import { getSessionToken } from './auth';

const api = axios.create({
  // ✅ Caminho relativo, usa o rewrite acima
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Adicionar token
api.interceptors.request.use(
  (config) => {
    const token = getSessionToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Tratar erro 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Rotas
export const authAPI = {
  getLoginUrl: () => api.get('/auth/login'),
  handleCallback: (code) => api.get(`/auth/callback?code=${code}`),
  refreshToken: (refreshToken) => api.post('/auth/refresh', { refresh_token: refreshToken }),
  getMe: () => api.get('/auth/me'),
};

export const dashboardAPI = {
  getOverview: (userId) => api.get(`/dashboard/overview?user_id=${userId}`),
  getVideoAnalytics: (videoId) => api.get(`/dashboard/video/${videoId}`),
};

export const hashtagsAPI = {
  getTop: (userId, params = {}) => api.get(`/hashtags/top?user_id=${userId}`, { params }),
  getSuggestions: (params) => api.get('/hashtags/suggestions', { params }),
  getTrending: (limit = 20) => api.get(`/hashtags/trending?limit=${limit}`),
  getHashtagAnalytics: (hashtag, userId) => api.get(`/hashtags/${encodeURIComponent(hashtag)}/analytics`, { params: { user_id: userId } }),
};

export default api;