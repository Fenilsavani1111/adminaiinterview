import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Users,
  Calendar,
  TrendingUp,
  Award,
  Search,
  Eye,
  Download,
  Briefcase,
  Plus,
  BarChart3,
  Target,
  Zap,
  Activity,
  UserCheck,
  Mail,
  TrendingDown,
  LogOut,
  KeyRound,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Candidate } from '../types';
import { useJobPosts } from '../hooks/useJobPosts';
import { userAPI } from '../services/api';
import { CandidatePerformanceDetail } from './CandidatePerformanceDetail';
import Loader from './Loader';
import moment from 'moment';
import { exportCandidateReport } from './exportCandidateReport';

type SkillType = {
  skill: string;
  count: number;
  percentage: number;
};

interface SummaryStats {
  total_interview: number;
  average_score: number;
  active_jobs: number;
  inactive_jobs: number;
  interview_weekly_growth: number;
  total_candidates: number;
  candidate_monthly_growth: number;
  top_skills: SkillType[];
}

export function AdminDashboard() {
  const { dispatch } = useApp();
  const { getAdminDashboard, getCandidateById, getPerformanceComparison } =
    useJobPosts();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [summaryStates, setSummaryStates] = useState<SummaryStats>({
    total_interview: 0,
    average_score: 0,
    active_jobs: 0,
    inactive_jobs: 0,
    interview_weekly_growth: 0,
    total_candidates: 0,
    candidate_monthly_growth: 0,
    top_skills: [],
  });
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(
    null,
  );
  const [exportingCandidates, setExportingCandidates] = useState<Set<string>>(
    new Set(),
  );
  let ignore = false;

  // ✅ CHECK AUTHENTICATION ON MOUNT
  useEffect(() => {
    const checkAuth = async () => {
      console.log('🔍 Dashboard - Checking authentication on mount');
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');

      console.log('  - Token exists:', !!token);
      console.log('  - User exists:', !!userStr);

      // If there is no token, force login
      if (!token) {
        console.log('❌ No token found - redirecting to login');
        dispatch({ type: 'SET_VIEW', payload: 'login' });
        return;
      }

      // If user is present in localStorage, use it
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          console.log('✅ User authenticated:', user.email);

          // Ensure app context also knows current user
          dispatch({ type: 'SET_CURRENT_USER', payload: user });
          console.log('✅ Authentication verified - staying on dashboard');
          return;
        } catch (error) {
          console.error('❌ Error parsing user data:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          dispatch({ type: 'SET_VIEW', payload: 'login' });
          return;
        }
      }

      // No user in storage but token exists — try to fetch profile
      try {
        console.log(
          'ℹ️ Token present but no user in storage — fetching profile',
        );
        const profileResp = await userAPI.getProfile();
        if (profileResp?.success && profileResp.user) {
          const fetchedUser = profileResp.user;
          const storedToken = localStorage.getItem('token');

          const normalizedUser = {
            ...fetchedUser,
            access_token: storedToken || fetchedUser.access_token,
          };
          localStorage.setItem('user', JSON.stringify(normalizedUser));

          // Set current user in app context
          dispatch({ type: 'SET_CURRENT_USER', payload: normalizedUser });
          console.log('✅ Authentication verified via profile fetch');
          return;
        } else {
          console.log(
            '❌ Profile fetch did not return a valid user - redirecting to login',
          );
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          dispatch({ type: 'SET_VIEW', payload: 'login' });
          return;
        }
      } catch (err) {
        console.error('❌ Error fetching profile:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        dispatch({ type: 'SET_VIEW', payload: 'login' });
        return;
      }
    };

    checkAuth();
  }, [dispatch]);

  // ✅ LOGOUT HANDLER
  const handleLogout = () => {
    console.log('🚪 LOGOUT CLICKED FROM DASHBOARD');
    console.log('Before logout:');
    console.log(
      '  - Token:',
      localStorage.getItem('token')?.substring(0, 50) + '...',
    );
    console.log('  - User:', localStorage.getItem('user'));

    localStorage.removeItem('token');
    localStorage.removeItem('user');

    console.log('After clearing localStorage:');
    console.log('  - Token:', localStorage.getItem('token'));
    console.log('  - User:', localStorage.getItem('user'));
    console.log('✅ Logout complete - redirecting to landing');

    dispatch({ type: 'SET_VIEW', payload: 'landing' });
  };

  const filteredInterviews = candidates.filter((interview) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      (interview?.name?.toLowerCase().includes(searchLower) ?? false) ||
      (interview?.JobPost?.title?.toLowerCase().includes(searchLower) ?? false);
    const matchesFilter =
      filterStatus === 'all' || interview?.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // const getStatusColor = (status: string) => {
  //   switch (status) {
  //     case "completed":
  //       return "bg-green-100 text-green-800 border-green-200";
  //     case "inprogress":
  //       return "bg-blue-100 text-blue-800 border-blue-200";
  //     case "pending":
  //       return "bg-yellow-100 text-yellow-800 border-yellow-200";
  //     case "under_review":
  //       return "bg-yellow-100 text-yellow-800 border-yellow-200";
  //     case "completed":
  //       return "bg-green-100 text-green-800 border-green-200";
  //     default:
  //       return "bg-gray-100 text-gray-800 border-gray-200";
  //   }
  // };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-amber-600';
    return 'text-red-600';
  };

  const getRecommendationColor = (recommendation: string) => {
    if (recommendation?.includes?.('Highly'))
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    else if (recommendation?.includes?.('Recommended'))
      return 'bg-blue-50 text-blue-700 border-blue-200';
    else if (recommendation?.includes?.('Consider'))
      return 'bg-amber-50 text-amber-700 border-amber-200';
    else return 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getData = async () => {
    try {
      setLoading(true);
      let data = await getAdminDashboard();
      setCandidates(data?.recentCandidates ?? []);
      let candidates = data?.candidates ?? [];

      const allSkills: string[] = candidates.flatMap((item: Candidate) =>
        item?.skills?.map((skill) => skill.trim()),
      );

      const skillCounts: Record<string, number> = {};
      for (const skill of allSkills) {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      }

      const totalSkills = allSkills.length;

      const topFiveSkills: SkillType[] = Object.entries(skillCounts)
        .map(([skill, count]) => ({
          skill,
          count,
          percentage: parseFloat(((count / totalSkills) * 100).toFixed(2)),
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      setSummaryStates({ ...data?.summary, top_skills: topFiveSkills });
    } catch (error) {
      console.log('error', error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  // Handle export candidate report
  const handleExportCandidate = async (candidateId: string) => {
    try {
      // Add candidate to exporting set
      setExportingCandidates((prev) => new Set([...prev, candidateId]));

      // Get candidate data
      const candidateData = await getCandidateById(candidateId);
      if (!candidateData) {
        alert('Candidate data not found');
        return;
      }

      // Get comparison data
      const comparisonData = await getPerformanceComparison(
        candidateData.jobPostId,
      );

      // Export the report
      await exportCandidateReport(
        candidateData,
        comparisonData,
        (isExporting: boolean) => {
          if (!isExporting) {
            setExportingCandidates((prev) => {
              const newSet = new Set(prev);
              newSet.delete(candidateId);
              return newSet;
            });
          }
        },
      );
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export report. Please try again.');
      // Remove from exporting set on error
      setExportingCandidates((prev) => {
        const newSet = new Set(prev);
        newSet.delete(candidateId);
        return newSet;
      });
    }
  };

  useEffect(() => {
    if (!ignore) {
      getData();
    }
    return () => {
      ignore = true;
    };
  }, []);

  if (selectedCandidate) {
    return (
      <CandidatePerformanceDetail
        candidateId={selectedCandidate}
        backText="Back to Dashboard"
        onBack={() => setSelectedCandidate(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Modern Header with Logout Button */}
      <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() =>
                  dispatch({ type: 'SET_VIEW', payload: 'landing' })
                }
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-all duration-200 hover:bg-gray-100 px-3 py-2 rounded-lg"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="font-medium">Back to Home</span>
              </button>
              <div className="h-8 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <p className="text-sm text-gray-500">
                  Manage interviews and analyze performance
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() =>
                  dispatch({ type: 'SET_VIEW', payload: 'interview-analytics' })
                }
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2.5 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <BarChart3 className="h-4 w-4" />
                <span className="font-medium">Analytics</span>
              </button>
              <button
                onClick={() =>
                  dispatch({ type: 'SET_VIEW', payload: 'job-posts' })
                }
                className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-4 py-2.5 rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Briefcase className="h-4 w-4" />
                <span className="font-medium">Manage Jobs</span>
              </button>
              <button
                onClick={() =>
                  dispatch({ type: 'SET_VIEW', payload: 'llm-key' })
                }
                className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-4 py-2.5 rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <KeyRound className="h-4 w-4" />
                <span className="font-medium">LLM Keys</span>
              </button>
              <button className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2.5 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                <Download className="h-4 w-4" />
                <span className="font-medium">Export Data</span>
              </button>
              {/* ✅ LOGOUT BUTTON */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2.5 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <LogOut className="h-4 w-4" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <Loader message="Loading data..." />
        ) : (
          <>
            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Total Interviews
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {summaryStates.total_interview}
                    </p>
                    <div className="flex items-center mt-2">
                      {summaryStates.interview_weekly_growth > 0 ? (
                        <TrendingUp className="h-4 w-4 text-emerald-500 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span
                        className={`text-sm ${
                          summaryStates.interview_weekly_growth > 0
                            ? 'text-emerald-600'
                            : 'text-red-600'
                        } font-medium`}
                      >
                        {summaryStates.interview_weekly_growth >= 0 ? '+' : ''}
                        {summaryStates.interview_weekly_growth?.toFixed(2)}%
                        this week
                      </span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-2xl shadow-lg">
                    <Calendar className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Active Job Posts
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {summaryStates.active_jobs}
                    </p>
                    {summaryStates.total_interview ===
                    summaryStates?.active_jobs ? (
                      <div className="flex items-center mt-2">
                        <Activity className="h-4 w-4 text-emerald-500 mr-1" />
                        <span className="text-sm text-emerald-600 font-medium">
                          All active
                        </span>
                      </div>
                    ) : (
                      <></>
                    )}
                  </div>
                  <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-4 rounded-2xl shadow-lg">
                    <Briefcase className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Total Candidates
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {summaryStates.total_candidates}
                    </p>
                    <div className="flex items-center mt-2">
                      <UserCheck className="h-4 w-4 text-blue-500 mr-1" />
                      <span className="text-sm text-blue-600 font-medium">
                        {summaryStates.candidate_monthly_growth >= 0 ? '+' : ''}
                        {summaryStates.candidate_monthly_growth?.toFixed(2)}%
                        this month
                      </span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-2xl shadow-lg">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Average Score
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {summaryStates.average_score}
                    </p>
                    <div className="flex items-center mt-2">
                      <Target className="h-4 w-4 text-amber-500 mr-1" />
                      <span className="text-sm text-amber-600 font-medium">
                        Above target
                      </span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-4 rounded-2xl shadow-lg">
                    <Award className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Interview List */}
              <div className="lg:col-span-2">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">
                          Recent Interviews
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                          Latest candidate assessments and performance
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search candidates..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
                          />
                        </div>
                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm transition-all duration-200"
                        >
                          <option value="all">All Status</option>
                          <option value="pending">Pending</option>
                          <option value="inprogress">In Progress</option>
                          <option value="under_review">Under Review</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="space-y-4">
                      {filteredInterviews.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 px-2">
                              <div className="relative">
                                <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                  <span className="text-lg font-bold text-white">
                                    {item.name
                                      .split(' ')
                                      .map((n: string) => n[0])
                                      .join('')}
                                  </span>
                                </div>
                                <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                                  <div className="h-2 w-2 bg-white rounded-full"></div>
                                </div>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-1">
                                  <h3 className="text-lg font-bold text-gray-900">
                                    {item.name}
                                  </h3>
                                  {/* {item.overallScore >= 90 && (
                                    <Star className='h-5 w-5 text-amber-500 fill-current' />
                                  )} */}
                                </div>
                                <p className="text-sm font-medium text-gray-600">
                                  {item?.JobPost?.title}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {item?.JobPost?.company}
                                </p>
                                <div className="flex items-center space-x-2 mt-2">
                                  {item?.skills
                                    ?.slice(0, 3)
                                    ?.map((skill, index) => (
                                      <span
                                        key={index}
                                        className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg text-xs font-medium border border-blue-200"
                                      >
                                        {skill}
                                      </span>
                                    ))}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-6">
                              {(item?.status === 'completed' ||
                                item?.status === 'under_review') && (
                                <div className="text-center">
                                  <div
                                    className={`text-3xl font-bold mb-1 ${getScoreColor(
                                      item.categoryPercentage
                                        ?.overallPercentage ?? 0,
                                    )}`}
                                  >
                                    {item.categoryPercentage
                                      ?.overallPercentage ?? 0}
                                    %
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Overall Score
                                  </div>
                                </div>
                              )}

                              {item.duration ? (
                                <div className="text-center">
                                  <div className="text-lg font-bold text-gray-900 mb-1">
                                    {item.duration ?? 0}m
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Duration
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center"></div>
                              )}

                              <div className="text-center">
                                {item?.recommendations?.recommendation &&
                                item?.recommendations?.recommendation?.length >
                                  0 ? (
                                  <span
                                    className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getRecommendationColor(
                                      item.recommendations?.recommendation,
                                    )}`}
                                  >
                                    {item.recommendations?.recommendation}
                                  </span>
                                ) : (
                                  <></>
                                )}
                                {item.interviewDate ? (
                                  <div className="text-xs text-gray-500 mt-1">
                                    {moment(item.interviewDate).format(
                                      'DD-MM-YYYY',
                                    )}
                                  </div>
                                ) : (
                                  <div></div>
                                )}
                              </div>

                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => setSelectedCandidate(item.id)}
                                  className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                                  title="View Details"
                                >
                                  <Eye className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleExportCandidate(item.id)}
                                  disabled={exportingCandidates.has(item.id)}
                                  className={`p-2 rounded-lg transition-all duration-200 ${
                                    exportingCandidates.has(item.id)
                                      ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                                      : 'text-gray-600 hover:text-gray-700 hover:bg-gray-50'
                                  }`}
                                  title={
                                    exportingCandidates.has(item.id)
                                      ? 'Exporting...'
                                      : 'Download Report'
                                  }
                                >
                                  {exportingCandidates.has(item.id) ? (
                                    <div className="animate-spin h-5 w-5 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
                                  ) : (
                                    <Download className="h-5 w-5" />
                                  )}
                                </button>
                                <button
                                  onClick={() => {
                                    //  window.location.href = `mailto:candidate@example.com?subject=Interview Opportunity&body=Hi, we’d like to connect...`
                                    window.location.href = `mailto:${item.email}`;
                                  }}
                                  className="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200"
                                  title="Contact Candidate"
                                >
                                  <Mail className="h-5 w-5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Side Panel */}
              <div className="space-y-6">
                {/* Top Skills */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900">
                      Top Skills Assessed
                    </h3>
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    {summaryStates.top_skills.map((item, index) => (
                      <div key={index} className="group">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            {item.skill}
                          </span>
                          <span className="text-sm font-bold text-gray-900">
                            {Math.floor(item?.percentage)}%
                          </span>
                        </div>
                        <div className="relative">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2.5 rounded-full transition-all duration-1000 group-hover:from-purple-500 group-hover:to-blue-600"
                              style={{ width: `${item?.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900">
                      Recent Activity
                    </h3>
                    <div className="bg-emerald-100 p-2 rounded-lg">
                      <Activity className="h-5 w-5 text-emerald-600" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 group hover:bg-gray-50 p-3 rounded-lg transition-all duration-200">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 group-hover:scale-125 transition-transform duration-200"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          Carol Davis completed interview
                        </p>
                        <p className="text-xs text-gray-500">
                          2 hours ago • Score: 92
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 group hover:bg-gray-50 p-3 rounded-lg transition-all duration-200">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 group-hover:scale-125 transition-transform duration-200"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          New job post created: Data Analyst
                        </p>
                        <p className="text-xs text-gray-500">
                          3 hours ago • 5 applications
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 group hover:bg-gray-50 p-3 rounded-lg transition-all duration-200">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 group-hover:scale-125 transition-transform duration-200"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          Alice Johnson scored 85
                        </p>
                        <p className="text-xs text-gray-500">
                          5 hours ago • Highly recommended
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 group hover:bg-gray-50 p-3 rounded-lg transition-all duration-200">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 group-hover:scale-125 transition-transform duration-200"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          System maintenance completed
                        </p>
                        <p className="text-xs text-gray-500">
                          1 day ago • All systems operational
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900">
                      Quick Actions
                    </h3>
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <Zap className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <button
                      onClick={() =>
                        dispatch({ type: 'SET_VIEW', payload: 'llm-key' })
                      }
                      className="w-full text-left p-4 rounded-xl hover:bg-gradient-to-r hover:from-indigo-50 hover:to-blue-50 transition-all duration-200 border border-gray-200 hover:border-indigo-300 group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900 group-hover:text-indigo-700">
                            Manage LLM Keys
                          </div>
                          <div className="text-sm text-gray-500">
                            Set/clear LLM key for a user
                          </div>
                        </div>
                        <KeyRound className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 transition-colors duration-200" />
                      </div>
                    </button>
                    <button
                      onClick={() =>
                        dispatch({ type: 'SET_VIEW', payload: 'create-job' })
                      }
                      className="w-full text-left p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 border border-gray-200 hover:border-blue-300 group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900 group-hover:text-blue-700">
                            Create Job Post
                          </div>
                          <div className="text-sm text-gray-500">
                            Add new position with custom questions
                          </div>
                        </div>
                        <Plus className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors duration-200" />
                      </div>
                    </button>
                    <button
                      onClick={() =>
                        dispatch({
                          type: 'SET_VIEW',
                          payload: 'interview-analytics',
                        })
                      }
                      className="w-full text-left p-4 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 border border-gray-200 hover:border-purple-300 group"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900 group-hover:text-purple-700">
                            View Analytics
                          </div>
                          <div className="text-sm text-gray-500">
                            Detailed performance insights
                          </div>
                        </div>
                        <BarChart3 className="h-5 w-5 text-gray-400 group-hover:text-purple-600 transition-colors duration-200" />
                      </div>
                    </button>
                    <button className="w-full text-left p-4 rounded-xl hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 transition-all duration-200 border border-gray-200 hover:border-emerald-300 group">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900 group-hover:text-emerald-700">
                            Export All Results
                          </div>
                          <div className="text-sm text-gray-500">
                            Download comprehensive report
                          </div>
                        </div>
                        <Download className="h-5 w-5 text-gray-400 group-hover:text-emerald-600 transition-colors duration-200" />
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
