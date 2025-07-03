import React, { useState } from 'react';
import { ArrowLeft, Search, Filter, Download, Eye, Star, Calendar, Clock, User, Award, TrendingUp, Mail, Phone, Linkedin, FileText, BarChart3, Video, CheckCircle, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { InterviewRecordingViewer } from './InterviewRecordingViewer';

interface JobApplicationsListProps {
  jobId: string;
  jobTitle: string;
  company: string;
  onBack: () => void;
  showInterviewsOnly?: boolean;
}

export function JobApplicationsList({ jobId, jobTitle, company, onBack, showInterviewsOnly = false }: JobApplicationsListProps) {
  const { dispatch } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
  const [viewingRecording, setViewingRecording] = useState<{id: string, name: string} | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);

  // Mock applications data for the specific job position
  const mockApplications = [
    {
      id: '1',
      candidateName: 'Alice Johnson',
      email: 'alice.johnson@email.com',
      phone: '+1 (555) 123-4567',
      appliedDate: '2024-01-10',
      interviewDate: '2024-01-15',
      duration: 22,
      status: 'interviewed',
      overallScore: 92,
      scores: {
        communication: 90,
        technical: 95,
        problemSolving: 88,
        leadership: 94,
        bodyLanguage: 89,
        confidence: 93
      },
      experience: '6 years',
      skills: ['React', 'TypeScript', 'Node.js', 'GraphQL'],
      resumeUrl: '/resumes/alice-johnson.pdf',
      linkedinUrl: 'https://linkedin.com/in/alice-johnson',
      recommendation: 'Highly Recommended',
      notes: 'Exceptional technical skills and leadership potential',
      hasRecording: true,
      coverLetter: 'I am excited to apply for the Senior Frontend Developer position...',
      location: 'San Francisco, CA',
      currentCompany: 'TechStart Inc.',
      currentRole: 'Frontend Developer'
    },
    {
      id: '2',
      candidateName: 'Bob Smith',
      email: 'bob.smith@email.com',
      phone: '+1 (555) 234-5678',
      appliedDate: '2024-01-12',
      interviewDate: '2024-01-16',
      duration: 18,
      status: 'interviewed',
      overallScore: 85,
      scores: {
        communication: 87,
        technical: 82,
        problemSolving: 85,
        leadership: 80,
        bodyLanguage: 88,
        confidence: 86
      },
      experience: '4 years',
      skills: ['React', 'JavaScript', 'Python', 'AWS'],
      resumeUrl: '/resumes/bob-smith.pdf',
      linkedinUrl: 'https://linkedin.com/in/bob-smith',
      recommendation: 'Recommended',
      notes: 'Strong technical foundation with good growth potential',
      hasRecording: true,
      coverLetter: 'With 4 years of experience in frontend development...',
      location: 'New York, NY',
      currentCompany: 'WebCorp',
      currentRole: 'Software Engineer'
    },
    {
      id: '3',
      candidateName: 'Carol Davis',
      email: 'carol.davis@email.com',
      phone: '+1 (555) 345-6789',
      appliedDate: '2024-01-08',
      status: 'applied',
      experience: '3 years',
      skills: ['Vue.js', 'JavaScript', 'CSS', 'HTML'],
      resumeUrl: '/resumes/carol-davis.pdf',
      linkedinUrl: 'https://linkedin.com/in/carol-davis',
      notes: 'Good potential but needs more experience in required technologies',
      hasRecording: false,
      coverLetter: 'I am passionate about creating beautiful user interfaces...',
      location: 'Austin, TX',
      currentCompany: 'StartupXYZ',
      currentRole: 'Junior Developer'
    },
    {
      id: '4',
      candidateName: 'David Wilson',
      email: 'david.wilson@email.com',
      phone: '+1 (555) 456-7890',
      appliedDate: '2024-01-14',
      interviewDate: '2024-01-18',
      duration: 20,
      status: 'interviewed',
      overallScore: 88,
      scores: {
        communication: 85,
        technical: 90,
        problemSolving: 87,
        leadership: 84,
        bodyLanguage: 89,
        confidence: 91
      },
      experience: '5 years',
      skills: ['React', 'TypeScript', 'Docker', 'Kubernetes'],
      resumeUrl: '/resumes/david-wilson.pdf',
      linkedinUrl: 'https://linkedin.com/in/david-wilson',
      recommendation: 'Recommended',
      notes: 'Strong technical skills with excellent problem-solving abilities',
      hasRecording: true,
      coverLetter: 'As a seasoned frontend developer with DevOps experience...',
      location: 'Seattle, WA',
      currentCompany: 'CloudTech',
      currentRole: 'Senior Developer'
    },
    {
      id: '5',
      candidateName: 'Eva Martinez',
      email: 'eva.martinez@email.com',
      phone: '+1 (555) 567-8901',
      appliedDate: '2024-01-11',
      status: 'shortlisted',
      experience: '7 years',
      skills: ['React', 'TypeScript', 'GraphQL', 'MongoDB'],
      resumeUrl: '/resumes/eva-martinez.pdf',
      linkedinUrl: 'https://linkedin.com/in/eva-martinez',
      notes: 'Outstanding communication and leadership skills',
      hasRecording: false,
      coverLetter: 'I bring 7 years of experience in building scalable web applications...',
      location: 'Los Angeles, CA',
      currentCompany: 'BigTech Corp',
      currentRole: 'Lead Frontend Engineer'
    }
  ];

  // Filter applications based on showInterviewsOnly
  const filteredByType = showInterviewsOnly 
    ? mockApplications.filter(app => app.status === 'interviewed')
    : mockApplications;

  // If viewing a recording, show the recording viewer
  if (viewingRecording) {
    return (
      <InterviewRecordingViewer
        candidateId={viewingRecording.id}
        candidateName={viewingRecording.name}
        jobTitle={jobTitle}
        company={company}
        onBack={() => setViewingRecording(null)}
      />
    );
  }

  const filteredApplications = filteredByType.filter(application => {
    const matchesSearch = application.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         application.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         application.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterStatus === 'all' || application.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const sortedApplications = [...filteredApplications].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'name':
        aValue = a.candidateName;
        bValue = b.candidateName;
        break;
      case 'score':
        aValue = a.overallScore || 0;
        bValue = b.overallScore || 0;
        break;
      case 'date':
        aValue = new Date(a.appliedDate).getTime();
        bValue = new Date(b.appliedDate).getTime();
        break;
      case 'experience':
        aValue = parseInt(a.experience);
        bValue = parseInt(b.experience);
        break;
      default:
        aValue = new Date(a.appliedDate).getTime();
        bValue = new Date(b.appliedDate).getTime();
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied': return 'bg-blue-100 text-blue-800';
      case 'shortlisted': return 'bg-yellow-100 text-yellow-800';
      case 'interviewed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'Highly Recommended': return 'bg-green-100 text-green-800';
      case 'Recommended': return 'bg-blue-100 text-blue-800';
      case 'Consider': return 'bg-yellow-100 text-yellow-800';
      case 'Not Recommended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleApplicationSelection = (applicationId: string) => {
    setSelectedApplications(prev => 
      prev.includes(applicationId) 
        ? prev.filter(id => id !== applicationId)
        : [...prev, applicationId]
    );
  };

  const selectAllApplications = () => {
    if (selectedApplications.length === sortedApplications.length) {
      setSelectedApplications([]);
    } else {
      setSelectedApplications(sortedApplications.map(app => app.id));
    }
  };

  const interviewedCount = filteredByType.filter(app => app.status === 'interviewed').length;
  const averageScore = interviewedCount > 0 
    ? filteredByType.filter(app => app.overallScore).reduce((sum, app) => sum + (app.overallScore || 0), 0) / interviewedCount
    : 0;
  const highPerformers = filteredByType.filter(app => (app.overallScore || 0) >= 85).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button 
                onClick={onBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Job Posts</span>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {showInterviewsOnly ? 'Interviews' : 'Applications'} - {jobTitle}
                </h1>
                <p className="text-sm text-gray-600">
                  {company} • {sortedApplications.length} {showInterviewsOnly ? 'interviews' : 'applications'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {selectedApplications.length > 0 && (
                <span className="text-sm text-gray-600">
                  {selectedApplications.length} selected
                </span>
              )}
              <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="h-4 w-4" />
                <span>Export Results</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total {showInterviewsOnly ? 'Interviews' : 'Applications'}</p>
                <p className="text-3xl font-bold text-gray-900">{sortedApplications.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <User className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {showInterviewsOnly && (
            <>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Average Score</p>
                    <p className="text-3xl font-bold text-gray-900">{averageScore.toFixed(1)}%</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Award className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">High Performers</p>
                    <p className="text-3xl font-bold text-gray-900">{highPerformers}</p>
                    <p className="text-sm text-gray-500">Score ≥ 85%</p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Interviewed</p>
                <p className="text-3xl font-bold text-gray-900">{interviewedCount}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Video className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search candidates by name, email, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="applied">Applied</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="interviewed">Interviewed</option>
                <option value="rejected">Rejected</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="date">Sort by Date</option>
                <option value="name">Sort by Name</option>
                {showInterviewsOnly && <option value="score">Sort by Score</option>}
                <option value="experience">Sort by Experience</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        {/* Applications Grid */}
        <div className="grid gap-6">
          {sortedApplications.map((application) => (
            <div key={application.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedApplications.includes(application.id)}
                      onChange={() => toggleApplicationSelection(application.id)}
                      className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    
                    <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <span className="text-lg font-bold text-white">
                        {application.candidateName.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">{application.candidateName}</h3>
                        {application.overallScore && application.overallScore >= 90 && (
                          <Star className="h-5 w-5 text-yellow-500 fill-current" />
                        )}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(application.status)}`}>
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </span>
                      </div>
                      
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Contact</p>
                          <p className="text-sm font-medium text-gray-900">{application.email}</p>
                          <p className="text-sm text-gray-600">{application.phone}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Experience</p>
                          <p className="text-sm font-medium text-gray-900">{application.experience}</p>
                          <p className="text-sm text-gray-600">{application.currentRole} at {application.currentCompany}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Location</p>
                          <p className="text-sm font-medium text-gray-900">{application.location}</p>
                          <p className="text-sm text-gray-600">Applied: {new Date(application.appliedDate).toLocaleDateString()}</p>
                        </div>
                        {application.overallScore && (
                          <div>
                            <p className="text-sm text-gray-600">Interview Score</p>
                            <div className="flex items-center space-x-2">
                              <span className={`text-lg font-bold ${getScoreColor(application.overallScore).split(' ')[0]}`}>
                                {application.overallScore}%
                              </span>
                              {application.recommendation && (
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRecommendationColor(application.recommendation)}`}>
                                  {application.recommendation}
                                </span>
                              )}
                            </div>
                            {application.interviewDate && (
                              <p className="text-sm text-gray-600">
                                Interviewed: {new Date(application.interviewDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {application.skills.map((skill, index) => (
                            <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {application.scores && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 mb-2">Performance Breakdown</p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {Object.entries(application.scores).map(([skill, score]) => (
                              <div key={skill} className="flex items-center justify-between">
                                <span className="text-xs text-gray-600 capitalize">
                                  {skill.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                                <div className="flex items-center space-x-2">
                                  <div className="w-12 bg-gray-200 rounded-full h-1.5">
                                    <div 
                                      className={`h-1.5 rounded-full ${
                                        score >= 90 ? 'bg-green-500' :
                                        score >= 80 ? 'bg-blue-500' :
                                        score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                                      }`}
                                      style={{ width: `${score}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-xs font-medium text-gray-900 w-6">{score}%</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {application.notes && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm text-gray-700">{application.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    <div className="flex items-center space-x-2">
                      {application.hasRecording && (
                        <button 
                          onClick={() => setViewingRecording({
                            id: application.id,
                            name: application.candidateName
                          })}
                          className="p-2 text-purple-600 hover:text-purple-900 hover:bg-purple-50 rounded-lg transition-colors"
                          title="View Recording"
                        >
                          <Video className="h-5 w-5" />
                        </button>
                      )}
                      <button 
                        onClick={() => setSelectedApplication(application)}
                        className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button 
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                        title="Download Resume"
                      >
                        <FileText className="h-5 w-5" />
                      </button>
                      <button 
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                        title="Contact Candidate"
                      >
                        <Mail className="h-5 w-5" />
                      </button>
                      <button 
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                        title="View LinkedIn"
                      >
                        <Linkedin className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bulk Actions */}
        {selectedApplications.length > 0 && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">
                {selectedApplications.length} candidate(s) selected
              </span>
              <div className="flex space-x-2">
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm">
                  Move to Next Round
                </button>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                  Send Email
                </button>
                <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm">
                  Export Selected
                </button>
                <button 
                  onClick={() => setSelectedApplications([])}
                  className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Application Detail Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedApplication.candidateName}</h2>
                  <p className="text-gray-600">{selectedApplication.currentRole} at {selectedApplication.currentCompany}</p>
                </div>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Email</label>
                      <p className="text-gray-900">{selectedApplication.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Phone</label>
                      <p className="text-gray-900">{selectedApplication.phone}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Location</label>
                      <p className="text-gray-900">{selectedApplication.location}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">LinkedIn</label>
                      <a href={selectedApplication.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                        View Profile
                      </a>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Details</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Experience</label>
                      <p className="text-gray-900">{selectedApplication.experience}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Current Company</label>
                      <p className="text-gray-900">{selectedApplication.currentCompany}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Current Role</label>
                      <p className="text-gray-900">{selectedApplication.currentRole}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Skills</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedApplication.skills.map((skill: string, index: number) => (
                          <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {selectedApplication.coverLetter && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Cover Letter</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700">{selectedApplication.coverLetter}</p>
                  </div>
                </div>
              )}

              {selectedApplication.scores && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Interview Performance</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {Object.entries(selectedApplication.scores).map(([skill, score]) => (
                      <div key={skill} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {skill.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                score >= 90 ? 'bg-green-500' :
                                score >= 80 ? 'bg-blue-500' :
                                score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${score}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-bold text-gray-900">{score}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-6 flex justify-end space-x-4">
                <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                  Download Resume
                </button>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Contact Candidate
                </button>
                {selectedApplication.hasRecording && (
                  <button 
                    onClick={() => {
                      setSelectedApplication(null);
                      setViewingRecording({
                        id: selectedApplication.id,
                        name: selectedApplication.candidateName
                      });
                    }}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    View Recording
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}