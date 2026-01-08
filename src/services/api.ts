// adminaiinterview/src/api/api.ts
import axios from 'axios';
import { JobPost } from '../types';

// User interface for type safety
export interface User {
  id: number;
  username: string;
  email: string;
  name?: string;
  phoneNumber?: string;
  isAdmin: boolean;
  access_token?: string;
  refresh_token?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_AIINTERVIEW_API_KEY, // Adjust this to match your server port
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

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 (unauthorized) - clear token and redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Optionally trigger a global event or use router to redirect
      // window.location.href = '/'; // Will trigger login view
    }
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ============================================
// USER / AUTH API FUNCTIONS
// ============================================

export const userAPI = {
  // Login user - NOW USES EMAIL INSTEAD OF LOGIN
  login: async (email: string, password: string) => {
    const response = await api.post('/login', { email, password });
    
    // Store token and user info in localStorage
    if (response.data.success && response.data.user) {
      localStorage.setItem('token', response.data.user.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  },

  // Register new user (accepts payload: { name, username, email, phoneNumber, password })
  register: async (payload: { 
    name?: string; 
    username: string; 
    email: string; 
    phoneNumber?: string; 
    password: string 
  }) => {
    const response = await api.post('/register', payload);
    
    // Store token and user info in localStorage
    if (response.data.success && response.data.user) {
      localStorage.setItem('token', response.data.user.access_token);
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

  // Check if user is admin
  isAdmin: (): boolean => {
    const user = userAPI.getStoredUser();
    return user?.isAdmin || false;
  },

  // ============================================
  // ADMIN USER CRUD OPERATIONS
  // ============================================

  // Get all users (Admin only)
  getAllUsers: async (params?: { page?: number; limit?: number; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    
    const response = await api.get(`/users?${queryParams.toString()}`);
    return response.data;
  },

  // Get user by ID (Admin only)
  getUserById: async (id: number | string): Promise<{ success: boolean; user: User }> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Update user (Admin only)
  updateUser: async (
    id: number | string, 
    userData: Partial<{ 
      name: string; 
      username: string; 
      email: string; 
      phoneNumber: string; 
      password: string; 
      isAdmin: boolean 
    }>
  ): Promise<{ success: boolean; message: string; user: User }> => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  // Delete user (Admin only)
  deleteUser: async (id: number | string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};

// ============================================
// JOB POST API FUNCTIONS
// ============================================

export const jobPostAPI = {
  // Create a new job post (Admin only)
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

  // Update job post (Admin only)
  update: async (id: string, jobPostData: Partial<JobPost>): Promise<JobPost> => {
    const response = await api.put(`/jobposts/${id}`, jobPostData);
    return response.data;
  },

  // Delete job post (Admin only)
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

  // Get recent candidates (Admin only)
  getRecentCandidates: async () => {
    const response = await api.post('/jobposts/get-recent-candidates');
    return response.data;
  },

  // Get admin dashboard (Admin only)
  getAdminDashboard: async () => {
    const response = await api.post('/jobposts/get-admin-dashboard');
    return response.data;
  },

  // Get analytics dashboard (Admin only)
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