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
  location: string;
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
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  shareableUrl?: string;
  applicants?: number;
  interviews?: number;
  candidates?: []
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
  appliedDate: string;
  interviewDate: string;
  duration: number;
  status: "completed" | "inprogress" | "scheduled",
  overallScore: number;
  scores: {
    communication: number;
    technical: number;
    problemSolving: number;
    leadership: number;
    bodyLanguage: number;
    confidence: number;
  },
  experienceLevel: string;
  skills: string[];
  resumeUrl: string;
  linkedinUrl: string;
  recommendation: string;
  notes: string;
  hasRecording: boolean;
  JobPost?: JobPost;
}

export interface InterviewSession {
  id: string;
  userId: string;
  jobPostId: string;
  applicationId?: string;
  startTime: Date;
  endTime?: Date;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  questions: InterviewQuestion[];
  responses: InterviewResponse[];
  evaluation?: InterviewEvaluation;
}

export interface InterviewQuestion {
  id: string;
  question: string;
  type: 'behavioral' | 'technical' | 'general' | 'situational';
  expectedDuration: number; // in seconds
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  suggestedAnswers?: string[];
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