import { useState, useEffect, useCallback } from 'react';
import { InterviewQuestion, JobPost } from '../types';
import { jobPostAPI } from '../services/api';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_APP_OPENAI_KEY,
  dangerouslyAllowBrowser: true,
});

export const useJobPosts = () => {
  const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  let ignore = false;

  // Fetch all job posts
  const fetchJobPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await jobPostAPI.getAll();
      setJobPosts(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch job posts'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new job post
  const createJobPost = useCallback(
    async (jobPostData: Omit<JobPost, 'id' | 'createdAt' | 'updatedAt'>) => {
      setLoading(true);
      setError(null);
      try {
        const newJobPost = await jobPostAPI.create(jobPostData);
        setJobPosts((prev) => [...prev, newJobPost]);
        return newJobPost;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to create job post'
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Update a job post
  const updateJobPost = useCallback(
    async (id: string, jobPostData: Partial<JobPost>) => {
      setLoading(true);
      setError(null);
      try {
        const updatedJobPost = await jobPostAPI.update(id, jobPostData);
        setJobPosts((prev) =>
          prev.map((job) => (job.id === id ? updatedJobPost : job))
        );
        return updatedJobPost;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to update job post'
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Delete a job post
  const deleteJobPost = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await jobPostAPI.delete(id);
      setJobPosts((prev) => prev.filter((job) => job.id !== id));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to delete job post'
      );
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
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to fetch job posts by status'
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get job questions using chatgtp openai
  const getJobPostOpenaiQuestions = useCallback(
    async (
      jobdata: Omit<
        JobPost,
        'id' | 'createdAt' | 'updatedAt' | 'questions' | 'status' | 'createdBy'
      >
    ) => {
      setLoading(true);
      setError(null);
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `
            You are an expert interview-question generator for hiring teams.
            
            ==================== MANDATORY RULES ====================
            
            1. Generate a MINIMUM of 40 interview questions.
            2. Generate AT LEAST 10 questions for EACH category:
               - Reasoning
               - Communication
               - Arithmetic / Quantitative
               - Subjective / Role-based
            3. All questions MUST be directly derived from the provided job post.
            4. Questions MUST adapt to the experience level:
               - Entry-level → fundamentals, basic scenarios
               - Mid-level → applied problem-solving, real-world cases
               - Senior-level → decision-making, trade-offs, leadership
            5. DO NOT generate generic or school-level questions.
            6. expectedDuration MUST be in seconds.
            7. suggestedAnswers MUST be an array (can be empty but must exist).
            8. evaluationCriteria MUST be an array with at least 2 items.
            9. id must be a unique integer starting from 1.
            10. order must match the id.
            11. difficulty must be one of: easy, medium, hard.
            12. type must be one of:
                - reasoning
                - communication
                - arithmetic
                - subjective
            13. category MUST clearly reflect the role or skill being assessed.
            14. isRequired MUST always be true.
            15. Output ONLY valid JSON — no explanations, no markdown, no extra text.
            
            ==================== ROLE AWARENESS RULES ====================
            
            - Reasoning questions:
              Evaluate logic, decision-making, and problem-solving using role-specific scenarios.
            
            - Communication questions:
              Simulate real workplace conversations relevant to the role, team, and stakeholders.
            
            - Arithmetic / Quantitative questions:
              Use role-related metrics, data, timelines, performance, or business calculations.
            
            - Subjective / Role-based questions:
              Assess ownership, judgment, ethics, leadership, role-fit, and experience-based decisions.
            
            ==================== OUTPUT FORMAT ====================
            
            Return a JSON ARRAY of objects:
            
            [
              {
                "id": number,
                "question": string,
                "type": "reasoning | communication | arithmetic | subjective",
                "expectedDuration": number,
                "difficulty": "easy | medium | hard",
                "category": string,
                "suggestedAnswers": string[],
                "evaluationCriteria": string[],
                "isRequired": true,
                "order": number
              }
            ]
            `,
            },
            {
              role: 'user',
              content: `
            Generate interview questions strictly following all system rules.
            
            ==================== JOB POST DETAILS ====================
            
            Position: ${jobdata?.title}
            Company: ${jobdata?.company}
            Department: ${jobdata?.department}
            Job Type: ${jobdata?.type}
            Experience Level: ${jobdata?.experience}
            
            Job Description:
            ${jobdata?.description}
            
            Requirements:
            ${jobdata?.requirements?.map((item) => `- ${item}`).join('\n')}
            
            Responsibilities:
            ${jobdata?.responsibilities?.map((item) => `- ${item}`).join('\n')}
            
            Skills:
            ${jobdata?.skills?.map((item) => `- ${item}`).join('\n')}
            
            ${
              jobdata?.salary?.min !== undefined
                ? `Min Salary: ${jobdata.salary.min} ${jobdata.salary.currency}`
                : ''
            }
            ${
              jobdata?.salary?.max !== undefined
                ? `Max Salary: ${jobdata.salary.max} ${jobdata.salary.currency}`
                : ''
            }
            `,
            },
          ],
          // max_tokens: 150,
          temperature: 0.3,
          response_format: {
            type: 'json_object',
          },
        });
        let responseText = response.choices[0]?.message?.content ?? '';
        const evaluation = JSON.parse(responseText);
        let data: InterviewQuestion[] = evaluation?.interviewQuestions ?? [];
        return data;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to generate Questions'
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Get job responsibilities from job description using chatgtp openai
  const getJobPostResponsibilityFromJD = useCallback(
    async (jobDescription: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content:
                'You are a helpful assistant that extracts job responsibilities from job descriptions and returns them in JSON format only.',
            },
            {
              role: 'user',
              content: `Extract the job responsibilities in JSON format from the following job description:\n\n${jobDescription}`,
            },
          ],
          // max_tokens: 150,
          temperature: 0.3,
          response_format: {
            type: 'json_object',
          },
        });
        let responseText = response.choices[0]?.message?.content ?? '';
        const evaluation = JSON.parse(responseText);
        let data: string[] = evaluation?.job_responsibilities ?? [];
        return data;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to generate responsibilities from job description'
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Get job description from uploaded pdf using chatgtp openai
  const getJobDescriptionFromPDf = useCallback(async (pdfText: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert at reading job postings and extracting the actual job description text, no matter what the section heading is.',
          },
          {
            role: 'user',
            // content: `Extract the job description as "job_description" in JSON format from the following PDF content:\n\n${pdfText}`,
            content: `
From the following text, find the section that describes the job role (this could be labeled as 'Overview', 'Description', 'About the Role', or similar).
Return it in JSON with a single key: job_description.
If there are multiple candidate sections, merge them into one continuous description.

PDF text:
"""${pdfText}"""
`,
          },
        ],
        // max_tokens: 150,
        temperature: 0.3,
        response_format: {
          type: 'json_object',
        },
      });
      let responseText = response.choices[0]?.message?.content ?? '';
      const evaluation = JSON.parse(responseText);
      let data: string = evaluation?.job_description ?? '';
      return data;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to generate job description pdf'
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get recent candidates
  const getRecentCandidatesData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await jobPostAPI.getRecentCandidates();
      return data;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to generate job description pdf'
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get admin dashboard data
  const getAdminDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await jobPostAPI.getAdminDashboard();
      return data;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to generate job description pdf'
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get analytics dashboard data
  const getAnalyticsDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await jobPostAPI.getAnalyticsDashboard();
      return data;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to generate job description pdf'
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get candidate by ID
  const getCandidateById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await jobPostAPI.getCandidateById(id);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch job post');
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
    if (!ignore) {
      fetchJobPosts();
    }
    return () => {
      ignore = true;
    };
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
    getJobPostOpenaiQuestions,
    getJobPostResponsibilityFromJD,
    getJobDescriptionFromPDf,
    getRecentCandidatesData,
    getAdminDashboard,
    getAnalyticsDashboard,
    getCandidateById,
  };
};
