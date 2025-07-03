import React, { useState } from 'react';
import { ArrowLeft, Users, Calendar, TrendingUp, Award, Search, Filter, Eye, Download, Star, Briefcase, Plus, BarChart3, Clock, Target, Zap, ChevronRight, Activity, UserCheck, FileText, Mail } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function AdminDashboard() {
  const { state, dispatch } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  // Mock data for demonstration
  const mockStats = {
    totalInterviews: 247,
    completedInterviews: 198,
    averageScore: 76.8,
    topSkills: ['JavaScript', 'React', 'Python', 'Node.js', 'SQL'],
    activeJobPosts: 12,
    totalCandidates: 156,
    weeklyGrowth: 12.5,
    monthlyGrowth: 8.3
  };

  const mockInterviews = [
    {
      id: '1',
      userName: 'Alice Johnson',
      position: 'Senior Frontend Developer',
      score: 92,
      status: 'completed',
      date: '2024-01-15',
      duration: 22,
      avatar: 'AJ',
      company: 'TechCorp Inc.',
      skills: ['React', 'TypeScript', 'Node.js'],
      recommendation: 'Highly Recommended'
    },
    {
      id: '2',
      userName: 'Bob Smith',
      position: 'Product Manager',
      score: 85,
      status: 'completed',
      date: '2024-01-14',
      duration: 18,
      avatar: 'BS',
      company: 'InnovateLabs',
      skills: ['Strategy', 'Analytics', 'Leadership'],
      recommendation: 'Recommended'
    },
    {
      id: '3',
      userName: 'Carol Davis',
      position: 'Data Scientist',
      score: 78,
      status: 'completed',
      date: '2024-01-14',
      duration: 25,
      avatar: 'CD',
      company: 'DataFlow Solutions',
      skills: ['Python', 'ML', 'Statistics'],
      recommendation: 'Consider'
    },
    {
      id: '4',
      userName: 'David Wilson',
      position: 'DevOps Engineer',
      score: 88,
      status: 'completed',
      date: '2024-01-15',
      duration: 20,
      avatar: 'DW',
      company: 'CloudTech',
      skills: ['AWS', 'Docker', 'Kubernetes'],
      recommendation: 'Recommended'
    },
    {
      id: '5',
      userName: 'Eva Martinez',
      position: 'UI/UX Designer',
      score: 91,
      status: 'completed',
      date: '2024-01-13',
      duration: 19,
      avatar: 'EM',
      company: 'DesignStudio',
      skills: ['Figma', 'Research', 'Prototyping'],
      recommendation: 'Highly Recommended'
    }
  ];

  const filteredInterviews = mockInterviews.filter(interview => {
    const matchesSearch = interview.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         interview.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || interview.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-amber-600';
    return 'text-red-600';
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'Highly Recommended': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Recommended': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Consider': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Modern Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => dispatch({ type: 'SET_VIEW', payload: 'landing' })}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-all duration-200 hover:bg-gray-100 px-3 py-2 rounded-lg"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="font-medium">Back to Home</span>
              </button>
              <div className="h-8 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-sm text-gray-500">Manage interviews and analyze performance</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => dispatch({ type: 'SET_VIEW', payload: 'interview-analytics' })}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2.5 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <BarChart3 className="h-4 w-4" />
                <span className="font-medium">Analytics</span>
              </button>
              <button 
                onClick={() => dispatch({ type: 'SET_VIEW', payload: 'job-posts' })}
                className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-4 py-2.5 rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Briefcase className="h-4 w-4" />
                <span className="font-medium">Manage Jobs</span>
              </button>
              <button className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2.5 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                <Download className="h-4 w-4" />
                <span className="font-medium">Export Data</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Interviews</p>
                <p className="text-3xl font-bold text-gray-900">{mockStats.totalInterviews}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-emerald-500 mr-1" />
                  <span className="text-sm text-emerald-600 font-medium">+{mockStats.weeklyGrowth}% this week</span>
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
                <p className="text-sm font-medium text-gray-600 mb-1">Active Job Posts</p>
                <p className="text-3xl font-bold text-gray-900">{mockStats.activeJobPosts}</p>
                <div className="flex items-center mt-2">
                  <Activity className="h-4 w-4 text-emerald-500 mr-1" />
                  <span className="text-sm text-emerald-600 font-medium">All active</span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-4 rounded-2xl shadow-lg">
                <Briefcase className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Candidates</p>
                <p className="text-3xl font-bold text-gray-900">{mockStats.totalCandidates}</p>
                <div className="flex items-center mt-2">
                  <UserCheck className="h-4 w-4 text-blue-500 mr-1" />
                  <span className="text-sm text-blue-600 font-medium">+{mockStats.monthlyGrowth}% this month</span>
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
                <p className="text-sm font-medium text-gray-600 mb-1">Average Score</p>
                <p className="text-3xl font-bold text-gray-900">{mockStats.averageScore}%</p>
                <div className="flex items-center mt-2">
                  <Target className="h-4 w-4 text-amber-500 mr-1" />
                  <span className="text-sm text-amber-600 font-medium">Above target</span>
                </div>
              </div>
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-4 rounded-2xl shadow-lg">
                <Award className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Enhanced Interview List */}
          <div className="lg:col-span-2">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Recent Interviews</h2>
                    <p className="text-sm text-gray-600 mt-1">Latest candidate assessments and performance</p>
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
                      <option value="completed">Completed</option>
                      <option value="in-progress">In Progress</option>
                      <option value="scheduled">Scheduled</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  {filteredInterviews.map((interview) => (
                    <div key={interview.id} className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                              <span className="text-lg font-bold text-white">{interview.avatar}</span>
                            </div>
                            <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                              <div className="h-2 w-2 bg-white rounded-full"></div>
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-1">
                              <h3 className="text-lg font-bold text-gray-900">{interview.userName}</h3>
                              {interview.score >= 90 && <Star className="h-5 w-5 text-amber-500 fill-current" />}
                            </div>
                            <p className="text-sm font-medium text-gray-600">{interview.position}</p>
                            <p className="text-xs text-gray-500">{interview.company}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              {interview.skills.slice(0, 3).map((skill, index) => (
                                <span key={index} className="bg-blue-50 text-blue-700 px-2 py-1 rounded-lg text-xs font-medium border border-blue-200">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-6">
                          <div className="text-center">
                            <div className={`text-3xl font-bold mb-1 ${getScoreColor(interview.score)}`}>
                              {interview.score}%
                            </div>
                            <div className="text-xs text-gray-500">Overall Score</div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-900 mb-1">{interview.duration}m</div>
                            <div className="text-xs text-gray-500">Duration</div>
                          </div>
                          
                          <div className="text-center">
                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getRecommendationColor(interview.recommendation)}`}>
                              {interview.recommendation}
                            </span>
                            <div className="text-xs text-gray-500 mt-1">
                              {new Date(interview.date).toLocaleDateString()}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => setSelectedUser(interview.id)}
                              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                              title="View Details"
                            >
                              <Eye className="h-5 w-5" />
                            </button>
                            <button 
                              className="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200"
                              title="Download Report"
                            >
                              <Download className="h-5 w-5" />
                            </button>
                            <button 
                              className="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                              title="Contact Candidate"
                            >
                              <Mail className="h-5 w-5" />
                            </button>
                            <ChevronRight className="h-5 w-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-all duration-200" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Side Panel */}
          <div className="space-y-6">
            {/* Top Skills with Enhanced Design */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Top Skills Assessed</h3>
                <div className="bg-blue-100 p-2 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="space-y-4">
                {mockStats.topSkills.map((skill, index) => {
                  const percentage = Math.random() * 40 + 60;
                  return (
                    <div key={index} className="group">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">{skill}</span>
                        <span className="text-sm font-bold text-gray-900">{Math.floor(percentage)}%</span>
                      </div>
                      <div className="relative">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2.5 rounded-full transition-all duration-1000 group-hover:from-purple-500 group-hover:to-blue-600"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Enhanced Recent Activity */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                <div className="bg-emerald-100 p-2 rounded-lg">
                  <Activity className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 group hover:bg-gray-50 p-3 rounded-lg transition-all duration-200">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 group-hover:scale-125 transition-transform duration-200"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Carol Davis completed interview</p>
                    <p className="text-xs text-gray-500">2 hours ago • Score: 92%</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 group hover:bg-gray-50 p-3 rounded-lg transition-all duration-200">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 group-hover:scale-125 transition-transform duration-200"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">New job post created: Data Analyst</p>
                    <p className="text-xs text-gray-500">3 hours ago • 5 applications</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 group hover:bg-gray-50 p-3 rounded-lg transition-all duration-200">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 group-hover:scale-125 transition-transform duration-200"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Alice Johnson scored 85%</p>
                    <p className="text-xs text-gray-500">5 hours ago • Highly recommended</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 group hover:bg-gray-50 p-3 rounded-lg transition-all duration-200">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 group-hover:scale-125 transition-transform duration-200"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">System maintenance completed</p>
                    <p className="text-xs text-gray-500">1 day ago • All systems operational</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Quick Actions */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Quick Actions</h3>
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Zap className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <div className="space-y-3">
                <button 
                  onClick={() => dispatch({ type: 'SET_VIEW', payload: 'create-job' })}
                  className="w-full text-left p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 border border-gray-200 hover:border-blue-300 group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 group-hover:text-blue-700">Create Job Post</div>
                      <div className="text-sm text-gray-500">Add new position with custom questions</div>
                    </div>
                    <Plus className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors duration-200" />
                  </div>
                </button>
                <button 
                  onClick={() => dispatch({ type: 'SET_VIEW', payload: 'interview-analytics' })}
                  className="w-full text-left p-4 rounded-xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 border border-gray-200 hover:border-purple-300 group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 group-hover:text-purple-700">View Analytics</div>
                      <div className="text-sm text-gray-500">Detailed performance insights</div>
                    </div>
                    <BarChart3 className="h-5 w-5 text-gray-400 group-hover:text-purple-600 transition-colors duration-200" />
                  </div>
                </button>
                <button className="w-full text-left p-4 rounded-xl hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 transition-all duration-200 border border-gray-200 hover:border-emerald-300 group">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 group-hover:text-emerald-700">Export All Results</div>
                      <div className="text-sm text-gray-500">Download comprehensive report</div>
                    </div>
                    <Download className="h-5 w-5 text-gray-400 group-hover:text-emerald-600 transition-colors duration-200" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}