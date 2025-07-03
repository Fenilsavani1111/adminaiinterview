import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LandingPage } from './components/LandingPage';
import { UserProfile } from './components/UserProfile';
import { InterviewInterface } from './components/InterviewInterface';
import { ResultsPage } from './components/ResultsPage';
import { AdminDashboard } from './components/AdminDashboard';
import { JobSelection } from './components/JobSelection';
import { JobPostManager } from './components/JobPostManager';
import { CreateJobPost } from './components/CreateJobPost';
import { JobApplication } from './components/JobApplication';
import { CandidateInterview } from './components/CandidateInterview';
import { InterviewAnalytics } from './components/InterviewAnalytics';

function AppContent() {
  const { state, dispatch } = useApp();

  useEffect(() => {
    dispatch({ type: 'LOAD_DATA' });
  }, [dispatch]);

  switch (state.currentView) {
    case 'job-selection':
      return <JobSelection />;
    case 'profile':
      return <UserProfile />;
    case 'interview':
      return <InterviewInterface />;
    case 'candidate-interview':
      return <CandidateInterview />;
    case 'job-application':
      return <JobApplication />;
    case 'results':
      return <ResultsPage />;
    case 'admin':
      return <AdminDashboard />;
    case 'job-posts':
      return <JobPostManager />;
    case 'create-job':
      return <CreateJobPost />;
    case 'edit-job':
      return <CreateJobPost />;
    case 'interview-analytics':
      return <InterviewAnalytics />;
    default:
      return <LandingPage />;
  }
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;