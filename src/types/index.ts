export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  experience: string;
  position: string;
  skills: string[];
  linkedinUrl?: string;
  resumeUrl?: string;
  createdAt: Date;
}

export interface JobPost {
  id: string;
  title: string;
  company: string;
  department: string;
  location: string[];
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  experience: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  skills: string[];
  salary?: {
    min: number;
    max: number;
    currency: string;
  };
  questions: InterviewQuestion[];
  status: 'draft' | 'active' | 'paused' | 'closed';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  shareableUrl?: string;
  applicants?: number;
  interviews?: number;
  candidates?: [];
  // When true, candidates can record both video and audio responses.
  // When false or undefined, interviews are audio-only for this job.
  enableVideoRecording?: boolean;
  /** Scheduled interview start date/time (ISO string or null). */
  interviewStartDateTime?: string | null;
  /** Company/role logo image URL. */
  logoUrl?: string | null;
}

export interface JobApplication {
  id: string;
  jobPostId: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  experience: string;
  skills: string[];
  linkedinUrl?: string;
  resumeFile?: File;
  resumeUrl?: string;
  coverLetter?: string;
  appliedAt: Date;
  status: 'applied' | 'interviewed' | 'shortlisted' | 'rejected';
  interviewSessionId?: string;
}

export interface Candidate {
  id: string;
  jobPostId: string;
  name: string;
  email: string;
  phone: string;
  mobile?: string;
  interviewVideoLink?: string;
  appliedDate: any;
  interviewDate: any;
  duration: number;
  status: 'pending' | 'inprogress' | 'under_review' | 'completed';
  overallScore: number;
  scores: {
    communication: number;
    technical: number;
    problemSolving: number;
    leadership: number;
    bodyLanguage: number;
    confidence: number;
  };
  experienceLevel: string;
  skills: string[];
  resumeUrl: string;
  linkedinUrl: string;
  recommendation: string;
  notes: string;
  hasRecording: boolean;
  designation?: string;
  location?: string;
  attemptedQuestions: number;
  photoUrl?: string;
  highestQualification?: string;
  educations?: Array<{
    type: 'tenth' | 'degree' | 'pg' | 'master' | 'phd';
    stream?: string;
    percentage?: string;
    yearOfPassing?: string;
  }>;
  educationDetails?: Array<{
    type: 'tenth' | 'degree' | 'pg' | 'master' | 'phd';
    stream?: string;
    percentage?: string;
    yearOfPassing?: string;
  }>;
  JobPost?: JobPost;
  StudentInterviewAnswer?: StudentInterviewAnswer[];
  aiEvaluationSummary?: {
    summary?: string;
    keyStrengths?: string[];
    areasOfGrowth?: string[];
  };
  performanceBreakdown?: any;
  quickStats: any;
  recommendations?: {
    summary?: string;
    recommendation?: string;
  };
  behavioral_analysis: any;
  video_analysis_insights?: {
    areas_for_improvement?: string[];
    positive_indicators?: string[];
    recommendations?: string[];
  };
  categoryPercentage?: {
    totalScore: number;
    overallScore: number;
    overallPercentage: number;
    categoryWisePercentage: {
      [key: string]: number; // Dynamic keys for different categories like technical, confidence, leadership, etc.
    };
  };
  proctoringStatus?: string;
  proctoringAlerts?: Array<{ message?: string; type?: string;[k: string]: unknown }>;
  residenceLocation: string;
  region: string;
  governmentProof: any[];
  createdAt: string;
  updatedAt: string;
}

export interface StudentInterviewAnswer {
  id: string;
  answer: string;
  aiEvaluation: string;
  score: number;
  responseTime: number;
  Question: InterviewQuestion;
  start: number;
  end: number;
}

export interface InterviewSession {
  id: string;
  userId: string;
  jobPostId: string;
  applicationId?: string;
  startTime: Date;
  endTime?: Date;
  status: 'pending' | 'inprogress' | 'under_review' | 'completed' | 'cancelled';
  questions: InterviewQuestion[];
  responses: InterviewResponse[];
  evaluation?: InterviewEvaluation;
}

export interface InterviewQuestion {
  id: string;
  question: string;
  type: 'behavioral' | 'communication' | 'reasoning' | 'arithmetic' | 'subjective';
  expectedDuration: number; // in seconds
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  suggestedAnswers?: string[];
  options?: string[];
  rightAnswer?: string | null;
  evaluationCriteria?: string[];
  isRequired: boolean;
  order: number;
}

export interface InterviewResponse {
  questionId: string;
  response: string;
  duration: number;
  timestamp: Date;
  audioUrl?: string;
  videoUrl?: string;
  score?: number;
  feedback?: string;
}

export interface InterviewEvaluation {
  overall: number;
  communication: number;
  technical: number;
  bodyLanguage: number;
  confidence: number;
  attire: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  questionScores: { [questionId: string]: number };
}

export interface AdminStats {
  totalInterviews: number;
  completedInterviews: number;
  averageScore: number;
  topSkills: string[];
  recentInterviews: InterviewSession[];
  activeJobPosts: number;
  totalCandidates: number;
}
