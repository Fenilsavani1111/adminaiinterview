import { useState, useEffect, useCallback } from 'react';
import { JobPost } from '../types';
import { jobPostAPI } from '../services/api';

export const useJobPosts = () => {
  const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all job posts
  const fetchJobPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await jobPostAPI.getAll();
      setJobPosts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch job posts');
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new job post
  const createJobPost = useCallback(async (jobPostData: Omit<JobPost, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    setError(null);
    try {
      const newJobPost = await jobPostAPI.create(jobPostData);
      setJobPosts(prev => [...prev, newJobPost]);
      return newJobPost;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create job post');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update a job post
  const updateJobPost = useCallback(async (id: string, jobPostData: Partial<JobPost>) => {
    setLoading(true);
    setError(null);
    try {
      const updatedJobPost = await jobPostAPI.update(id, jobPostData);
      setJobPosts(prev => prev.map(job => job.id === id ? updatedJobPost : job));
      return updatedJobPost;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update job post');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a job post
  const deleteJobPost = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await jobPostAPI.delete(id);
      setJobPosts(prev => prev.filter(job => job.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete job post');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get job post by ID
  const getJobPostById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const jobPost = await jobPostAPI.getById(id);
      return jobPost;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch job post');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get job posts by status
  const getJobPostsByStatus = useCallback(async (status: JobPost['status']) => {
    setLoading(true);
    setError(null);
    try {
      const data = await jobPostAPI.getByStatus(status);
      setJobPosts(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch job posts by status');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load job posts on mount
  useEffect(() => {
    fetchJobPosts();
  }, [fetchJobPosts]);

  return {
    jobPosts,
    loading,
    error,
    fetchJobPosts,
    createJobPost,
    updateJobPost,
    deleteJobPost,
    getJobPostById,
    getJobPostsByStatus,
    clearError,
  };
}; 