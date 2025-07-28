import { useState, useEffect, useCallback } from "react";
import { InterviewQuestion, JobPost } from "../types";
import { jobPostAPI } from "../services/api";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_APP_OPENAI_KEY,
  dangerouslyAllowBrowser: true,
});

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
      setError(
        err instanceof Error ? err.message : "Failed to fetch job posts"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new job post
  const createJobPost = useCallback(
    async (jobPostData: Omit<JobPost, "id" | "createdAt" | "updatedAt">) => {
      setLoading(true);
      setError(null);
      try {
        const newJobPost = await jobPostAPI.create(jobPostData);
        setJobPosts((prev) => [...prev, newJobPost]);
        return newJobPost;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to create job post"
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
          err instanceof Error ? err.message : "Failed to update job post"
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
        err instanceof Error ? err.message : "Failed to delete job post"
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
      setError(err instanceof Error ? err.message : "Failed to fetch job post");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get job posts by status
  const getJobPostsByStatus = useCallback(async (status: JobPost["status"]) => {
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
          : "Failed to fetch job posts by status"
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
        "id" | "createdAt" | "updatedAt" | "questions" | "status" | "createdBy"
      >
    ) => {
      setLoading(true);
      setError(null);
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "Generate a array of interview questions in JSON format with the following fields: id, question, type, expectedDuration, difficulty, category, suggestedAnswers (array), evaluationCriteria (array), isRequired, order.",
            },
            {
              role: "user",
              content: `Generate a list of interview questions with type, expected Duration in seconds, difficulty, category, suggested Answers in array, evaluation Criteria in array for the following job post:\n\nPosition: ${jobdata?.title}\nCompany: ${jobdata?.company}\nDepartment: ${jobdata?.department}\nJob Type: ${jobdata?.type}\nExperience Level: ${jobdata.experience}\nJob Description: ${jobdata?.description}\nRequirements:\n${jobdata?.requirements?.map(item => `- ${item}`).join("\n")}\nResponsibilities: \n${jobdata?.responsibilities?.map(item => `- ${item}`).join("\n")}\nSkills: \n${jobdata?.skills?.map(item => `- ${item}`).join("\n")}\n${jobdata?.salary?.min !== undefined ? `Min Salary: ${jobdata.salary.min} ${jobdata.salary.currency}` : ""}\n${jobdata?.salary?.max !== undefined ? `Max Salary: ${jobdata.salary.max} ${jobdata.salary.currency}` : ""}`,
            },
          ],
          // max_tokens: 150,
          temperature: 0.3,
          response_format: {
            type: "json_object",
          },
        });
        let responseText = response.choices[0]?.message?.content ?? "";
        const evaluation = JSON.parse(responseText);
        let data: InterviewQuestion[] = evaluation?.interviewQuestions ?? [];
        return data;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to generate Questions"
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
    async (
      jobDescription: string
    ) => {
      setLoading(true);
      setError(null);
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              "role": "system",
              "content": "You are a helpful assistant that extracts job responsibilities from job descriptions and returns them in JSON format only."
            },
            {
              "role": "user",
              "content": `Extract the job responsibilities in JSON format from the following job description:\n\n${jobDescription}`
            }
          ],
          // max_tokens: 150,
          temperature: 0.3,
          response_format: {
            type: "json_object",
          },
        });
        let responseText = response.choices[0]?.message?.content ?? "";
        const evaluation = JSON.parse(responseText);
        let data: string[] = evaluation?.job_responsibilities ?? [];
        return data;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to generate responsibilities from job description"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Get job description from uploaded pdf using chatgtp openai
  const getJobDescriptionFromPDf = useCallback(
    async (
      jobDescription: string
    ) => {
      setLoading(true);
      setError(null);
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are an HR assistant who extracts job descriptions.",
            },
            {
              role: "user",
              content: `Extract the job description in JSON format from the following PDF content:\n\n${jobDescription}`,
            },
          ],
          // max_tokens: 150,
          temperature: 0.3,
          response_format: {
            type: "json_object",
          },
        });
        let responseText = response.choices[0]?.message?.content ?? "";
        const evaluation = JSON.parse(responseText);
        let data: string = evaluation?.job_description ?? "";
        return data;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to generate job description pdf"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Get recent candidates
  const getRecentCandidatesData = useCallback(
    async (
    ) => {
      setLoading(true);
      setError(null);
      try {
        const data = await jobPostAPI.getRecentCandidates();
        return data;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to generate job description pdf"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Get admin dashboard data
  const getAdminDashboard = useCallback(
    async (
    ) => {
      setLoading(true);
      setError(null);
      try {
        const data = await jobPostAPI.getAdminDashboard();
        return data;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to generate job description pdf"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

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
    getJobPostOpenaiQuestions,
    getJobPostResponsibilityFromJD,
    getJobDescriptionFromPDf,
    getRecentCandidatesData, getAdminDashboard
  };
};
