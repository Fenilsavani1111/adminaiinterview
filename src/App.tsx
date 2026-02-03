import { useEffect } from 'react';
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
import { EditJobPost } from './components/EditJobPost';
import { ViewJobPost } from './components/ViewJobPost';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { ProtectedRoute } from './components/ProtectedRoute';
import { UserLlmKeyManager } from './components/UserLlmKeyManager';
import { RequireLlmKey } from './components/RequireLlmKey';

function AppContent() {
  const { state, dispatch } = useApp();

  useEffect(() => {
    dispatch({ type: 'LOAD_DATA' });
  }, [dispatch]);

  // ============================================
  // AUTH VIEWS (Public - No Protection)
  // ============================================

  if (state.currentView === 'login') {
    return <Login />;
  }

  if (state.currentView === 'register') {
    return <Register />;
  }

  // ============================================
  // PROTECTED ADMIN VIEWS (Require Admin Auth)
  // ============================================

  if (
    ['admin', 'job-posts', 'create-job', 'edit-job', 'view-job', 'interview-analytics', 'llm-key'].includes(
      state.currentView
    )
  ) {
    return (
      <ProtectedRoute requireAdmin={true}>
        {state.currentView === 'admin' && <RequireLlmKey><AdminDashboard /></RequireLlmKey>}
        {state.currentView === 'job-posts' && <RequireLlmKey><JobPostManager /></RequireLlmKey>}
        {state.currentView === 'create-job' && (
          <RequireLlmKey>
            <CreateJobPost />
          </RequireLlmKey>
        )}
        {state.currentView === 'edit-job' && <RequireLlmKey><EditJobPost /></RequireLlmKey>}
        {state.currentView === 'view-job' && <RequireLlmKey><ViewJobPost /></RequireLlmKey>}
        {state.currentView === 'interview-analytics' && <InterviewAnalytics />}
        {state.currentView === 'llm-key' && <UserLlmKeyManager />}
      </ProtectedRoute>
    );
  }

  // ============================================
  // PUBLIC CANDIDATE VIEWS (No Protection)
  // ============================================

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