import { supabase } from './supabase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const getAuthToken = (): string | null => {
  return localStorage.getItem('medvault_token');
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('medvault_token', token);
};

export const clearAuthToken = (): void => {
  localStorage.removeItem('medvault_token');
  localStorage.removeItem('medvault_user');
};

export const getStoredUser = (): any | null => {
  const userStr = localStorage.getItem('medvault_user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
};

export const setStoredUser = (user: any): void => {
  localStorage.setItem('medvault_user', JSON.stringify(user));
};

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  // Only set application/json if body is not FormData
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'API request failed' }));
    throw new Error(errorData.error || `HTTP error ${response.status}`);
  }

  return response.json();
};

export const api = {
  // Auth
  login: async (email: string, password: string) => {
    // Try Supabase auth first if configured
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (!error && data.session) {
        setAuthToken(data.session.access_token);
        const user = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || email.split('@')[0]
        };
        setStoredUser(user);
        return { token: data.session.access_token, user };
      }
    }
    // Fallback to Express backend auth
    const res = await apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    if (res.token) {
      setAuthToken(res.token);
      if (res.user) setStoredUser(res.user);
    }
    return res;
  },

  register: async (userData: any) => {
    if (supabase) {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            dob: userData.dob,
            gender: userData.gender,
            bloodGroup: userData.bloodGroup,
            phone: userData.phone
          }
        }
      });
      if (!error && data.session) {
        setAuthToken(data.session.access_token);
        const user = {
          id: data.user?.id,
          email: data.user?.email,
          name: userData.name
        };
        setStoredUser(user);
        return { token: data.session.access_token, user };
      }
    }
    const res = await apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(userData) });
    if (res.token) {
      setAuthToken(res.token);
      if (res.user) setStoredUser(res.user);
    }
    return res;
  },

  signInWithGoogle: async () => {
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) throw error;
      return data;
    }
    throw new Error('Supabase client is not configured for Google Sign-In');
  },

  logout: async () => {
    if (supabase) {
      await supabase.auth.signOut().catch(() => {});
    }
    clearAuthToken();
    window.location.href = '/login';
  },

  getMe: () => apiFetch('/auth/me'),

  // Patient Profile (Strictly per user)
  getProfile: () => apiFetch('/patient/profile'),
  updateProfile: (profileData: any) =>
    apiFetch('/patient/profile', { method: 'PUT', body: JSON.stringify(profileData) }),

  // Records (Strictly per user)
  getRecords: () => apiFetch('/records'),
  getRecordById: (id: string) => apiFetch(`/records/${id}`),
  deleteRecord: (id: string) => apiFetch(`/records/${id}`, { method: 'DELETE' }),

  // AI Assistant & Risk Analysis
  askAssistant: (question: string) =>
    apiFetch('/ai/assistant', { method: 'POST', body: JSON.stringify({ question }) }),
  getRiskAnalysis: () => apiFetch('/ai/risk-analysis'),

  // Emergency QR (Strictly per user)
  generateEmergencyQR: () => apiFetch('/emergency/qr', { method: 'POST' }),
  verifyEmergencyToken: (token: string) => apiFetch(`/emergency/verify/${token}`),

  // Analytics (Strictly per user)
  getVitals: () => apiFetch('/analytics/vitals'),
  addVital: (vitalData: any) =>
    apiFetch('/analytics/vitals', { method: 'POST', body: JSON.stringify(vitalData) }),
};
