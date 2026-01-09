// adminaiinterview/src/services/api.ts
import axios from 'axios';
import { JobPost } from '../types';

// User interface for type safety (NO USERNAME)
export interface User {
  id: number;
  email: string;
  name?: string;
  phoneNumber?: string;
  access_token?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_AIINTERVIEW_API_KEY || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token storage
api.interceptors.response.use(
  (response) => {
    // Store token if present in response (from login/register)
    if (response.data?.user?.access_token) {
      const token = response.data.user.access_token;
      localStorage.setItem('token', token);
      console.log('✅ Token stored in localStorage from response');
    }
    return response;
  },
  (error) => {
    // Handle 401 (unauthorized) - clear token and redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      console.log('❌ 401 Unauthorized - Clearing auth data');
    }
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ============================================
// USER / AUTH API FUNCTIONS
// ============================================

export const userAPI = {
  // Login user - USES EMAIL ONLY (NO USERNAME)
  login: async (email: string, password: string) => {
    const response = await api.post('/login', { email, password });
    
    // Store user info in localStorage (token is stored by interceptor)
    if (response.data.success && response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  // Register new user - NO USERNAME REQUIRED
  register: async (payload: { 
    name: string; 
    email: string; 
    phoneNumber?: string; 
    password: string 
  }) => {
    const response = await api.post('/register', payload);
    
    // Store user info in localStorage (token is stored by interceptor)
    if (response.data.success && response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  // Get current user profile (protected)
  getProfile: async () => {
    const response = await api.get('/profile');
    return response.data;
  },

  // Logout user (protected)
  logout: async () => {
    try {
      const response = await api.post('/users/logout');
      return response.data;
    } finally {
      // Always clear local storage on logout
      userAPI.clearAuth();
    }
  },

  // Clear local storage
  clearAuth: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get stored user from localStorage
  getStoredUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  // Get stored token from localStorage
  getStoredToken: (): string | null => {
    return localStorage.getItem('token');
  },

  // ============================================
  // USER CRUD OPERATIONS
  // ============================================

  // Get all users (with pagination and search)
  getAllUsers: async (params?: { page?: number; limit?: number; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    
    const response = await api.get(`/users?${queryParams.toString()}`);
    return response.data;
  },

  // Get user by ID
  getUserById: async (id: number | string): Promise<{ success: boolean; user: User }> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Update user (NO USERNAME)
  updateUser: async (
    id: number | string, 
    userData: Partial<{ 
      name: string; 
      email: string; 
      phoneNumber: string; 
      password: string
    }>
  ): Promise<{ success: boolean; message: string; user: User }> => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  // Delete user
  deleteUser: async (id: number | string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};

// ============================================
// JOB POST API FUNCTIONS
// ============================================

export const jobPostAPI = {
  // Create a new job post
  create: async (jobPostData: Omit<JobPost, 'id' | 'createdAt' | 'updatedAt'>): Promise<JobPost> => {
    const response = await api.post('/jobposts', jobPostData);
    return response.data;
  },

  // Get all job posts (Public)
  getAll: async (): Promise<JobPost[]> => {
    const response = await api.get('/jobposts');
    return response.data;
  },

  // Get job post by ID (Public)
  getById: async (id: string) => {
    const response = await api.get(`/jobposts/${id}`);
    return response.data;
  },

  // Update job post
  update: async (id: string, jobPostData: Partial<JobPost>): Promise<JobPost> => {
    const response = await api.put(`/jobposts/${id}`, jobPostData);
    return response.data;
  },

  // Delete job post
  delete: async (id: string): Promise<void> => {
    await api.delete(`/jobposts/${id}`);
  },

  // Get job posts by status (Public)
  getByStatus: async (status: JobPost['status']): Promise<JobPost[]> => {
    const response = await api.get(`/jobposts?status=${status}`);
    return response.data;
  },

  // Get job posts by company (Public)
  getByCompany: async (company: string): Promise<JobPost[]> => {
    const response = await api.get(`/jobposts?company=${company}`);
    return response.data;
  },

  // Send job link to email (Public)
  sendJobLink: async (jobId: string, email: string[]): Promise<void> => {
    await api.post('/jobposts/send-job-link', { jobId, email });
  },

  // Generate token for job post interview link (Public)
  generateTokenForJobInterviewLink: async (jobId: string) => {
    const response = await api.post('/jobposts/generate-job-token', { jobId });
    return response.data;
  },

  // Get recent candidates
  getRecentCandidates: async () => {
    const response = await api.post('/jobposts/get-recent-candidates');
    return response.data;
  },

  // Get admin dashboard
  getAdminDashboard: async () => {
    const response = await api.post('/jobposts/get-admin-dashboard');
    return response.data;
  },

  // Get analytics dashboard
  getAnalyticsDashboard: async () => {
    const response = await api.post('/jobposts/get-analytics-dashboard');
    return response.data;
  },

  // Get candidate by ID (Public)
  getCandidateById: async (id: string): Promise<JobPost> => {
    const response = await api.get(`/jobposts/get-candidate-byid/${id}`);
    return response.data;
  },
};

export default api;