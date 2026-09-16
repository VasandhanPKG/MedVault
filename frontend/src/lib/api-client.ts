import { supabase } from './supabase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getAuthToken = (): string | null => {
  return localStorage.getItem('medvault_token');
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('medvault_token', token);
};

export const removeAuthToken = (): void => {
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
  login: async (credentialsOrEmail: any, maybePassword?: string) => {
    const credentials =
      typeof credentialsOrEmail === 'string'
        ? { email: credentialsOrEmail, password: maybePassword }
        : credentialsOrEmail;

    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
      if (!error && data.session) {
        setAuthToken(data.session.access_token);
        const user = {
          id: data.user?.id,
          email: data.user?.email,
          name: data.user?.user_metadata?.name || 'Patient'
        };
        setStoredUser(user);
        return { token: data.session.access_token, user };
      }
    }
    const res = await apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(credentials) });
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

  logout: async () => {
    if (supabase) {
      await supabase.auth.signOut().catch(() => {});
    }
    removeAuthToken();
    window.location.href = '/login';
  },

  signInWithGoogle: async () => {
    if (!supabase) {
      throw new Error('Supabase client is not configured for OAuth');
    }
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) throw error;
    return data;
  },

  getProfile: () => apiFetch('/auth/me'),
  updateProfile: (data: any) => apiFetch('/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),

  getRecords: () => apiFetch('/records'),
  getRecordById: (id: string) => apiFetch(`/records/${id}`),
  uploadRecord: (formData: FormData) => apiFetch('/records/upload', { method: 'POST', body: formData }),
  deleteRecord: (id: string) => apiFetch(`/records/${id}`, { method: 'DELETE' }),

  getConditions: () => apiFetch('/conditions'),
  addCondition: (data: any) => apiFetch('/conditions', { method: 'POST', body: JSON.stringify(data) }),
  createCondition: (data: any) => apiFetch('/conditions', { method: 'POST', body: JSON.stringify(data) }),
  updateCondition: (id: string, data: any) => apiFetch(`/conditions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCondition: (id: string) => apiFetch(`/conditions/${id}`, { method: 'DELETE' }),

  getVaccinations: () => apiFetch('/vaccinations'),
  addVaccination: (data: any) => apiFetch('/vaccinations', { method: 'POST', body: JSON.stringify(data) }),
  createVaccination: (data: any) => apiFetch('/vaccinations', { method: 'POST', body: JSON.stringify(data) }),
  deleteVaccination: (id: string) => apiFetch(`/vaccinations/${id}`, { method: 'DELETE' }),

  getVitals: () => apiFetch('/vitals'),
  addVital: (data: any) => apiFetch('/vitals', { method: 'POST', body: JSON.stringify(data) }),

  getRiskAssessment: () => apiFetch('/risk/assessment'),
  getRiskAnalysis: () => apiFetch('/risk/assessment'),
  recalculateRisk: () => apiFetch('/risk/calculate', { method: 'POST' }),

  generateEmergencyQR: (type = 'emergency', durationHours = 24) =>
    apiFetch('/emergency/generate', { method: 'POST', body: JSON.stringify({ type, durationHours }) }),
  verifyEmergencyToken: (token: string) => apiFetch(`/emergency/verify/${token}`),
  listActiveTokens: () => apiFetch('/emergency/tokens'),
  revokeToken: (token: string) => apiFetch(`/emergency/revoke/${token}`, { method: 'DELETE' }),

  sendChatMessage: (data: { message: string; conversationId?: string; language?: string; mode?: string }) =>
    apiFetch('/chat/message', { method: 'POST', body: JSON.stringify(data) }),
  askAssistant: (dataOrMessage: any) => {
    const payload = typeof dataOrMessage === 'string' ? { message: dataOrMessage } : dataOrMessage;
    return apiFetch('/ai/assistant', { method: 'POST', body: JSON.stringify(payload) });
  },
  getChatHistory: () => apiFetch('/chat/history'),
  clearChatHistory: () => apiFetch('/chat/history', { method: 'DELETE' }),

  // Department-Specific Adaptive AI Intake
  getIntakeDepartments: () => apiFetch('/ai/intake/departments'),
  startIntakeSession: (data: { departmentId: string; language?: string }) =>
    apiFetch('/ai/intake/session/start', { method: 'POST', body: JSON.stringify(data) }),
  submitIntakeAnswer: (sessionId: string, data: { answerText: string; inputMode?: 'voice' | 'text' | 'touch'; language?: string }) =>
    apiFetch(`/ai/intake/session/${sessionId}/answer`, { method: 'POST', body: JSON.stringify(data) }),
  getIntakeSummary: (sessionId: string) => apiFetch(`/ai/intake/session/${sessionId}/summary`),
  updateIntakeSummary: (sessionId: string, data: { summary?: any; doctorNotes?: string }) =>
    apiFetch(`/ai/intake/session/${sessionId}/summary`, { method: 'PUT', body: JSON.stringify(data) }),
  verifyIntakeSession: (sessionId: string, data: { doctorName?: string; doctorNotes?: string }) =>
    apiFetch(`/ai/intake/session/${sessionId}/verify`, { method: 'POST', body: JSON.stringify(data) }),
  getPatientIntakes: () => apiFetch('/ai/intake/patient/history'),
};
