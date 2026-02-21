import { useState, useEffect, useCallback, useRef } from 'react';
import { InterviewQuestion, JobPost } from '../types';
import { jobPostAPI, userAPI } from '../services/api';
import OpenAI from 'openai';

type KeyValidationState = {
  key: string;
  validatedAt: number;
};

const KEY_VALIDATION_TTL_MS = 5 * 60 * 1000; // 5 minutes

const mapOpenAiKeyError = (error: any): string => {
  const status: number | undefined =
    error?.status ??
    error?.response?.status ??
    error?.error?.status ??
    error?.cause?.status;
  const msg: string = error?.message || 'OpenAI request failed';

  // Requested mapping
  if (status === 401)
    return `❌ OpenAI key failed (401 Invalid / revoked key). ${msg}`;
  if (status === 429)
    return `❌ OpenAI key failed (429 Quota exceeded / billing issue). ${msg}`;
  if (status === 403)
    return `❌ OpenAI key failed (403 Org / project access issue). ${msg}`;

  return `❌ OpenAI key failed. ${msg}${status ? ` (HTTP ${status})` : ''}`;
};

export const useJobPosts = () => {
  const [jobPosts, setJobPosts] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  let ignore = false;

  const keyValidationRef = useRef<KeyValidationState | null>(null);

  const getValidatedOpenAiClient = useCallback(async (): Promise<OpenAI> => {
    try {
      const profileResp = await userAPI.getProfile();
      const key = profileResp?.user?.jobPostLlmKey;

      if (!key || String(key).trim() === '') {
        throw new Error(
          'Job post LLM key is missing. Please set it in LLM Key Manager, then try again.',
        );
      }

      const normalizedKey = String(key).trim();

      // Reuse recent validation to avoid repeated test calls
      const cached = keyValidationRef.current;
      const cacheValid =
        cached &&
        cached.key === normalizedKey &&
        Date.now() - cached.validatedAt < KEY_VALIDATION_TTL_MS;

      const client = new OpenAI({
        apiKey: normalizedKey,
        dangerouslyAllowBrowser: true,
      });

      if (!cacheValid) {
        // Test key before any real request (as requested)
        await client.responses.create({
          model: 'gpt-4.1-mini',
          input: 'Say hello in one word',
        });
        keyValidationRef.current = {
          key: normalizedKey,
          validatedAt: Date.now(),
        };
      }

      return client;
    } catch (e: any) {
      const message = mapOpenAiKeyError(e);
      setError(message);
      throw new Error(message);
    }
  }, []);

  // Fetch all job posts
  const fetchJobPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await jobPostAPI.getAll();
      setJobPosts(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch job posts',
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
          err instanceof Error ? err.message : 'Failed to create job post',
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Update a job post
  const updateJobPost = useCallback(
    async (id: string, jobPostData: Partial<JobPost>) => {
      setLoading(true);
      setError(null);
      try {
        const updatedJobPost = await jobPostAPI.update(id, jobPostData);
        setJobPosts((prev) =>
          prev.map((job) => (job.id === id ? updatedJobPost : job)),
        );
        return updatedJobPost;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to update job post',
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
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
        err instanceof Error ? err.message : 'Failed to delete job post',
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
          : 'Failed to fetch job posts by status',
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
      >,
    ) => {
      setLoading(true);
      setError(null);
      try {
        const client = await getValidatedOpenAiClient();
        const response = await client.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `
          You are an expert interview-question generator for hiring teams.
          
          ==================== MANDATORY RULES ====================
          
          1. Generate EXACTLY 49 interview questions total.
          2. Generate EXACTLY the following distribution:
             - Reasoning: 13 questions (at least 4 MCQ)
             - Communication: 12 questions (at least 3 MCQ)
             - Arithmetic/Quantitative: 12 questions (at least 5 MCQ)
             - Subjective/Role-based: 12 questions (at least 3 MCQ)
          3. Overall, generate at least 15 MCQ questions across all categories.
          4. All questions MUST be directly derived from the provided job post.
          5. Questions MUST adapt to the experience level:
             - Entry-level → fundamentals, basic scenarios
             - Mid-level → applied problem-solving, real-world cases
             - Senior-level → decision-making, trade-offs, leadership
          6. DO NOT generate generic or school-level questions.
          7. expectedDuration MUST be in seconds.
          8. For open-ended questions: suggestedAnswers MUST be an array (can be empty but must exist).
          9. For MCQ questions: 
             - options MUST be an array with exactly 4 choices
             - rightAnswer MUST contain the exact correct answer text from options
             - DO NOT include suggestedAnswers field
          10. evaluationCriteria MUST be an array with at least 2 items.
          11. id must be a unique integer starting from 1.
          12. order must match the id.
          13. difficulty must be one of: easy, medium, hard.
          14. questionFormat must be one of: open-ended, mcq.
          15. type must be one of:
              - reasoning
              - communication
              - arithmetic
              - subjective
          16. category MUST clearly reflect the role or skill being assessed.
          17. isRequired MUST always be true.
          18. Output ONLY valid JSON — no explanations, no markdown, no extra text.
          
          ==================== TYPE-SPECIFIC GUIDELINES ====================
          
          REASONING questions (13 total):
          - Test logical thinking, problem-solving, and analytical skills
          - Include scenario-based decisions relevant to the role
          - MCQ format: test understanding of frameworks, methodologies, or best approaches
          - Open-ended: explore thought process and decision-making rationale
          - Examples: troubleshooting scenarios, prioritization challenges, system design logic
          
          COMMUNICATION questions (12 total):
          - Assess written and verbal communication abilities
          - Test stakeholder management and collaboration skills
          - MCQ format: best practices for communication scenarios, email/message choices
          - Open-ended: role-play situations, explaining complex topics, conflict resolution
          - Examples: explaining technical concepts, handling difficult conversations, presentation skills
          
          ARITHMETIC/QUANTITATIVE questions (12 total):
          - Use role-specific calculations, metrics, and data analysis
          - Include business math, estimations, and quantitative reasoning
          - MCQ format: calculations with specific answer choices, data interpretation
          - Open-ended: explain methodology, analyze trends, forecast scenarios
          - Examples: budget calculations, performance metrics, ROI analysis, capacity planning
          
          SUBJECTIVE/ROLE-BASED questions (12 total):
          - Assess judgment, ethics, leadership, and role fit
          - Explore past experiences and situational responses
          - MCQ format: ethical dilemmas, best practices, approach selection
          - Open-ended: behavioral questions, experience-based scenarios, vision and strategy
          - Examples: handling failure, team conflicts, career motivations, leadership philosophy
          
          ==================== OUTPUT FORMAT ====================
          
          Return a JSON ARRAY of exactly 49 objects with TWO possible structures:
          
          For OPEN-ENDED questions:
          {
            "id": number,
            "question": string,
            "type": "reasoning | communication | arithmetic | subjective",
            "questionFormat": "open-ended",
            "expectedDuration": number,
            "difficulty": "easy | medium | hard",
            "category": string,
            "suggestedAnswers": string[],
            "evaluationCriteria": string[],
            "isRequired": true,
            "order": number
          }
          
          For MULTIPLE-CHOICE questions:
          {
            "id": number,
            "question": string,
            "type": "reasoning | communication | arithmetic | subjective",
            "questionFormat": "mcq",
            "expectedDuration": number,
            "difficulty": "easy | medium | hard",
            "category": string,
            "options": [string, string, string, string],
            "rightAnswer": string,
            "evaluationCriteria": string[],
            "isRequired": true,
            "order": number
          }
          
          CRITICAL REQUIREMENTS:
          - Total count MUST be exactly 49 questions
          - MUST include all 4 types: reasoning, communication, arithmetic, subjective
          - Each type MUST have the specified count (13, 12, 12, 12)
          - MCQ questions must NOT have suggestedAnswers field
          - Open-ended questions must NOT have options or rightAnswer fields
          - rightAnswer MUST exactly match one of the options
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
          
          REMINDER: Generate EXACTLY 49 questions with the following distribution:
          - 13 Reasoning questions
          - 12 Communication questions
          - 12 Arithmetic/Quantitative questions
          - 12 Subjective/Role-based questions
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
        console.log('evaluation', evaluation);
        let data: InterviewQuestion[] = evaluation?.questions ?? [];
        return data;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to generate Questions',
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getValidatedOpenAiClient],
  );

  // Generate filtered questions by type
  const getJobPostFilteredQuestions = useCallback(
    async (
      jobdata: Omit<
        JobPost,
        'id' | 'createdAt' | 'updatedAt' | 'questions' | 'status' | 'createdBy'
      >,
      questionType: string,
      questionCount: number,
      questionFormat: 'mcq' | 'open-ended' | 'mix' = 'mix',
      existingQuestions: InterviewQuestion[] = [],
    ) => {
      setLoading(true);
      setError(null);
      try {
        const client = await getValidatedOpenAiClient();

        // Extract only relevant fields from existing questions to send to OpenAI
        const simplifiedExistingQuestions = existingQuestions.map((q) => ({
          question: q.question,
          type: q.type,
          questionFormat: q.questionFormat as 'mcq' | 'open-ended' | 'mix',
          category: q.category,
        }));

        // Type-specific guidelines
        const typeGuidelines: Record<string, string> = {
          reasoning: `
REASONING questions:
- Test logical thinking, problem-solving, and analytical skills
- Include scenario-based decisions relevant to the role
- MCQ format: test understanding of frameworks, methodologies, or best approaches
- Open-ended: explore thought process and decision-making rationale
- Examples: troubleshooting scenarios, prioritization challenges, system design logic, pattern recognition`,
          communication: `
COMMUNICATION questions:
- Assess written and verbal communication abilities
- Test stakeholder management and collaboration skills
- MCQ format: best practices for communication scenarios, email/message choices
- Open-ended: role-play situations, explaining complex topics, conflict resolution
- Examples: explaining technical concepts, handling difficult conversations, presentation skills, active listening`,
          arithmetic: `
ARITHMETIC/QUANTITATIVE questions:
- Use role-specific calculations, metrics, and data analysis
- Include business math, estimations, and quantitative reasoning
- MCQ format: calculations with specific answer choices, data interpretation
- Open-ended: explain methodology, analyze trends, forecast scenarios
- Examples: budget calculations, performance metrics, ROI analysis, capacity planning, statistical analysis`,
          subjective: `
SUBJECTIVE/ROLE-BASED questions:
- Assess judgment, ethics, leadership, and role fit
- Explore past experiences and situational responses
- MCQ format: ethical dilemmas, best practices, approach selection
- Open-ended: behavioral questions, experience-based scenarios, vision and strategy
- Examples: handling failure, team conflicts, career motivations, leadership philosophy, cultural fit`,
          behavioral: `
BEHAVIORAL questions:
- Focus on past experiences and specific situations
- Use STAR method (Situation, Task, Action, Result)
- Assess soft skills, teamwork, and problem-solving in real scenarios
- Examples: conflict resolution, leadership moments, challenges overcome, teamwork examples`,
          technical: `
TECHNICAL questions:
- Assess domain-specific knowledge and practical skills
- Include hands-on scenarios and real-world applications
- MCQ format: best practices, tools, methodologies
- Open-ended: system design, code review, architecture decisions
- Examples: coding problems, design patterns, debugging scenarios, technology choices`,
          aptitude: `
APTITUDE questions:
- Test general cognitive abilities and problem-solving skills
- Include pattern recognition, logical reasoning, and quick thinking
- MCQ format: puzzles, sequences, logic problems
- Examples: number series, verbal reasoning, spatial reasoning, abstract thinking`,
          general: `
GENERAL questions:
- Cover broad professional and interpersonal topics
- Assess overall fit, motivation, and career alignment
- Include company culture, work ethic, and professional values
- Examples: career goals, work preferences, learning approach, professional development`,
          textCommunication: `
TEXT COMMUNICATION questions:
- Assess written communication clarity, tone, and professionalism
- Focus specifically on text-based interactions: emails, reports, chat messages, documentation
- MCQ format: choose the best-written response, identify tone errors, select the most professional phrasing
- Open-ended: draft a professional email, write a summary, compose a response to a stakeholder message
- Examples: writing a follow-up email, summarizing a project update in writing, crafting a clear and concise message under constraints, correcting poorly written communications`,
          reasoning_return: `
REASONING & RETURN questions:
- Combine logical reasoning with the ability to clearly communicate the conclusion or solution back
- Candidate must not only solve or analyse a problem but also articulate their thought process and return a structured response
- MCQ format: identify the correct reasoning step, choose the best explanation for a given outcome, select the most logically sound conclusion
- Open-ended: walk through a problem step-by-step and present findings, explain why a decision was made, justify an approach with evidence
- Examples: analysing a scenario and writing a structured recommendation, diagnosing an issue and explaining the fix, evaluating options and returning a ranked justification, solving a logic puzzle and describing each reasoning step`,
        };

        // Format-specific instructions
        const formatInstructions =
          questionFormat === 'mcq'
            ? 'ALL questions MUST be MULTIPLE-CHOICE (MCQ) format only.'
            : questionFormat === 'open-ended'
              ? 'ALL questions MUST be OPEN-ENDED format only.'
              : 'Include a mix of both open-ended and MCQ questions (at least 30% should be MCQ).';

        const response = await client.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `
You are an expert interview-question generator for hiring teams.

==================== MANDATORY RULES ====================

1. Generate EXACTLY ${questionCount} interview questions.
2. ALL questions MUST be of type: "${questionType}".
3. QUESTION FORMAT REQUIREMENT: ${formatInstructions}
4. All questions MUST be directly derived from the provided job post.
5. Questions MUST adapt to the experience level:
   - Entry-level → fundamentals, basic scenarios
   - Mid-level → applied problem-solving, real-world cases
   - Senior-level → decision-making, trade-offs, leadership
6. DO NOT generate generic or school-level questions.
7. expectedDuration MUST be in seconds (range: 60-300).
8. For open-ended questions: suggestedAnswers MUST be an array (can be empty but must exist).
9. For MCQ questions: 
   - options MUST be an array with exactly 4 choices
   - rightAnswer MUST contain the exact correct answer text from options
   - DO NOT include suggestedAnswers field
10. evaluationCriteria MUST be an array with at least 2 items.
11. id must be a unique integer starting from 1.
12. order must match the id.
13. difficulty must be one of: easy, medium, hard.
14. questionFormat must be one of: open-ended, mcq.
15. type must be: "${questionType}".
16. category MUST clearly reflect the role or skill being assessed.
17. isRequired MUST always be true.
18. Output ONLY valid JSON — no explanations, no markdown, no extra text.
19. CRITICAL: DO NOT generate questions that are duplicates or meaningfully similar to the existing questions provided.
    - Avoid questions covering the same topic, scenario, or concept
    - Generate unique questions that test different aspects of the role
    - If existing questions cover a topic, explore different angles or related topics

==================== TYPE-SPECIFIC GUIDELINES ====================

${typeGuidelines[questionType] || typeGuidelines['general']}

==================== OUTPUT FORMAT ====================

Return a JSON object with a "questions" array containing exactly ${questionCount} objects with TWO possible structures:

For OPEN-ENDED questions:
{
  "id": number,
  "question": string,
  "type": "${questionType}",
  "questionFormat": "open-ended",
  "expectedDuration": number,
  "difficulty": "easy | medium | hard",
  "category": string,
  "suggestedAnswers": string[],
  "evaluationCriteria": string[],
  "isRequired": true,
  "order": number
}

For MULTIPLE-CHOICE questions:
{
  "id": number,
  "question": string,
  "type": "${questionType}",
  "questionFormat": "mcq",
  "expectedDuration": number,
  "difficulty": "easy | medium | hard",
  "category": string,
  "options": [string, string, string, string],
  "rightAnswer": string,
  "evaluationCriteria": string[],
  "isRequired": true,
  "order": number
}

CRITICAL REQUIREMENTS:
- Total count MUST be exactly ${questionCount} questions
- ALL questions must be of type "${questionType}"
- ${formatInstructions}
- Include a good mix of difficulty levels
- MCQ questions must NOT have suggestedAnswers field
- Open-ended questions must NOT have options or rightAnswer fields
- rightAnswer MUST exactly match one of the options
- DO NOT create questions similar to the existing questions provided
`,
            },
            {
              role: 'user',
              content: `
Generate ${questionCount} interview questions of type "${questionType}" strictly following all system rules.

QUESTION FORMAT: ${
                questionFormat === 'mcq'
                  ? 'Generate ONLY MULTIPLE-CHOICE (MCQ) questions.'
                  : questionFormat === 'open-ended'
                    ? 'Generate ONLY OPEN-ENDED questions.'
                    : 'Generate a mix of both MCQ and open-ended questions.'
              }

==================== EXISTING QUESTIONS (AVOID DUPLICATES) ====================

${
  simplifiedExistingQuestions.length > 0
    ? `The following questions already exist. DO NOT generate similar or duplicate questions:\n\n${simplifiedExistingQuestions.map((q, idx) => `${idx + 1}. [${q.type}] [${q.questionFormat}] [${q.category}] ${q.question}`).join('\n')}\n\nIMPORTANT: Generate completely NEW questions that are meaningfully different from the above.`
    : 'No existing questions yet. You can generate any relevant questions.'
}

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

REMINDER: Generate EXACTLY ${questionCount} questions, ALL of type "${questionType}".
${
  questionFormat === 'mcq'
    ? 'ALL questions MUST be MCQ format.'
    : questionFormat === 'open-ended'
      ? 'ALL questions MUST be open-ended format.'
      : ''
}
Make them highly relevant to this specific role and company, and ensure they are NOT duplicates or similar to existing questions.
`,
            },
          ],
          temperature: 0.3,
          response_format: {
            type: 'json_object',
          },
        });

        let responseText = response.choices[0]?.message?.content ?? '';
        const evaluation = JSON.parse(responseText);
        console.log('Filtered questions evaluation', evaluation);
        let data: InterviewQuestion[] = evaluation?.questions ?? [];
        return data;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to generate filtered questions',
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getValidatedOpenAiClient],
  );

  // Get job responsibilities from job description using chatgtp openai
  const getJobPostResponsibilityFromJD = useCallback(
    async (jobDescription: string) => {
      setLoading(true);
      setError(null);
      try {
        const client = await getValidatedOpenAiClient();
        const response = await client.chat.completions.create({
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
            : 'Failed to generate responsibilities from job description',
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getValidatedOpenAiClient],
  );

  // Get job description from uploaded pdf using chatgtp openai
  const getJobDescriptionFromPDf = useCallback(
    async (pdfText: string) => {
      setLoading(true);
      setError(null);
      try {
        const client = await getValidatedOpenAiClient();
        const response = await client.chat.completions.create({
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
            : 'Failed to generate job description pdf',
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [getValidatedOpenAiClient],
  );

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
          : 'Failed to generate job description pdf',
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
          : 'Failed to generate job description pdf',
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
          : 'Failed to generate job description pdf',
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

  // Get performance comparison data
  const getPerformanceComparison = useCallback(async (jobPostId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await jobPostAPI.getPerformanceComparison(jobPostId);
      return data;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to fetch performance comparison',
      );
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
    getJobPostFilteredQuestions,
    getJobPostResponsibilityFromJD,
    getJobDescriptionFromPDf,
    getRecentCandidatesData,
    getAdminDashboard,
    getAnalyticsDashboard,
    getCandidateById,
    getPerformanceComparison,
  };
};
