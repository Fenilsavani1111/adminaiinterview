import axios from 'axios';
import { JobPost } from '../types';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Adjust this to match your server port
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
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Job Post API functions
export const jobPostAPI = {
  // Create a new job post
  create: async (jobPostData: Omit<JobPost, 'id' | 'createdAt' | 'updatedAt'>): Promise<JobPost> => {
    const response = await api.post('/jobposts', jobPostData);
    return response.data;
  },

  // Get all job posts
  getAll: async (): Promise<JobPost[]> => {
    const response = await api.get('/jobposts');
    return response.data;
  },

  // Get job post by ID
  getById: async (id: string): Promise<JobPost> => {
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

  // Get job posts by status
  getByStatus: async (status: JobPost['status']): Promise<JobPost[]> => {
    const response = await api.get(`/jobposts?status=${status}`);
    return response.data;
  },

  // Get job posts by company
  getByCompany: async (company: string): Promise<JobPost[]> => {
    const response = await api.get(`/jobposts?company=${company}`);
    return response.data;
  },

  // Send job link to email
  sendJobLink: async (jobId: string, email: string[]): Promise<void> => {
    await api.post('/jobposts/send-job-link', { jobId, email });
  },

  // generate token for job post interview link
  generateTokenForJobInterviewLink: async (jobId: string) => {
    const response = await api.post('/jobposts/generate-job-token', { jobId });
    return response.data;
  },
};

// User API functions (if needed)
export const userAPI = {
  // Add user-related API calls here if needed
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },
};

export default api; 