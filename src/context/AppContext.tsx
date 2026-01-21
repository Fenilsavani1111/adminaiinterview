import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { User, InterviewSession, AdminStats, JobPost, JobApplication } from '../types';

interface AppState {
  currentUser: User | null;
  currentSession: InterviewSession | null;
  currentJobPost: JobPost | null;
  currentApplication: JobApplication | null;
  users: User[];
  sessions: InterviewSession[];
  jobPosts: JobPost[];
  applications: JobApplication[];
  adminStats: AdminStats;
  currentView:
  | 'landing'
  | 'login'
  | 'register'
  | 'profile'
  | 'interview'
  | 'results'
  | 'admin'
  | 'job-posts'
  | 'create-job'
  | 'edit-job'
  | 'view-job'
  | 'job-selection'
  | 'job-application'
  | 'candidate-interview'
  | 'interview-analytics';
}

type AppAction =
  | { type: 'SET_CURRENT_USER'; payload: User }
  | { type: 'SET_CURRENT_SESSION'; payload: InterviewSession }
  | { type: 'SET_CURRENT_JOB_POST'; payload: JobPost }
  | { type: 'SET_CURRENT_APPLICATION'; payload: JobApplication }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'ADD_JOB_POST'; payload: JobPost }
  | { type: 'ADD_APPLICATION'; payload: JobApplication }
  | { type: 'UPDATE_JOB_POST'; payload: JobPost }
  | { type: 'DELETE_JOB_POST'; payload: string }
  | { type: 'UPDATE_SESSION'; payload: InterviewSession }
  | { type: 'SET_VIEW'; payload: AppState['currentView'] }
  | { type: 'LOAD_JOB_BY_URL'; payload: string }
  | { type: 'LOAD_DATA' };

const initialState: AppState = {
  currentUser: null,
  currentSession: null,
  currentJobPost: null,
  currentApplication: null,
  users: [],
  sessions: [],
  jobPosts: [],
  applications: [],
  adminStats: {
    totalInterviews: 0,
    completedInterviews: 0,
    averageScore: 0,
    topSkills: [],
    recentInterviews: [],
    activeJobPosts: 0,
    totalCandidates: 0,
  },
  currentView: 'landing',
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload };
    case 'SET_CURRENT_SESSION':
      return { ...state, currentSession: action.payload };
    case 'SET_CURRENT_JOB_POST':
      return { ...state, currentJobPost: action.payload };
    case 'SET_CURRENT_APPLICATION':
      return { ...state, currentApplication: action.payload };
    case 'ADD_USER':
      return { ...state, users: [...state.users, action.payload] };
    case 'ADD_JOB_POST':
      const jobWithUrl = {
        ...action.payload,
        shareableUrl: `${window.location.origin}/job/${action.payload.id}`
      };
      return { ...state, jobPosts: [...state.jobPosts, jobWithUrl] };
    case 'ADD_APPLICATION':
      return { ...state, applications: [...state.applications, action.payload] };
    case 'UPDATE_JOB_POST':
      const updatedJobPosts = state.jobPosts.map(job =>
        job.id === action.payload.id ? action.payload : job
      );
      return { ...state, jobPosts: updatedJobPosts };
    case 'DELETE_JOB_POST':
      return { ...state, jobPosts: state.jobPosts.filter(job => job.id !== action.payload) };
    case 'UPDATE_SESSION':
      const updatedSessions = state.sessions.map(session =>
        session.id === action.payload.id ? action.payload : session
      );
      return { ...state, sessions: updatedSessions, currentSession: action.payload };
    case 'LOAD_JOB_BY_URL':
      const jobId = action.payload;
      const job = state.jobPosts.find(j => j.id === jobId);
      if (job && job.status === 'active') {
        return { ...state, currentJobPost: job, currentView: 'job-application' };
      }
      return state;
    case 'SET_VIEW':
      return { ...state, currentView: action.payload };
    case 'LOAD_DATA':
      const savedData = localStorage.getItem('ai-interview-data');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        return { ...state, ...parsed };
      }
      return state;
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Save to localStorage whenever state changes
  React.useEffect(() => {
    localStorage.setItem('ai-interview-data', JSON.stringify({
      users: state.users,
      sessions: state.sessions,
      jobPosts: state.jobPosts,
      applications: state.applications,
      adminStats: state.adminStats,
    }));
  }, [state.users, state.sessions, state.jobPosts, state.applications, state.adminStats]);

  // Restore authentication and view on app start
  React.useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');

      if (token && userStr) {
        const user = JSON.parse(userStr);
        dispatch({ type: 'SET_CURRENT_USER', payload: user });
        // Automatically redirect to dashboard if user is logged in
        dispatch({ type: 'SET_VIEW', payload: 'admin' });
      }
    } catch (e) {
      console.error('❌ Error restoring auth state from localStorage', e);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, []);

  // Handle URL routing for job applications
  React.useEffect(() => {
    const path = window.location.pathname;
    const jobMatch = path.match(/^\/job\/(.+)$/);
    if (jobMatch) {
      dispatch({ type: 'LOAD_JOB_BY_URL', payload: jobMatch[1] });
    }
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}