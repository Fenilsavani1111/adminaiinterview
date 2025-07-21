import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Search,
  Filter,
  Download,
  Eye,
  Star,
  Calendar,
  Clock,
  User,
  Award,
  TrendingUp,
  Mail,
  Phone,
  Linkedin,
  FileText,
  BarChart3,
  Video,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { InterviewRecordingViewer } from "./InterviewRecordingViewer";
import { useJobPosts } from "../hooks/useJobPosts";
import { Candidate } from "../types";

interface JobInterviewListingProps {
  jobId: string;
  jobTitle: string;
  tab: string;
  company: string;
  onBack: () => void;
}

export function JobInterviewListing({
  jobId,
  jobTitle,
  tab,
  company,
  onBack,
}: JobInterviewListingProps) {
  const { dispatch } = useApp();
  const { getJobPostById, loading, error } = useJobPosts();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [viewingRecording, setViewingRecording] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  // Mock interview data for the specific job position
  const mockInterviews = [
    {
      id: "1",
      candidateName: "Alice Johnson",
      email: "alice.johnson@email.com",
      phone: "+1 (555) 123-4567",
      appliedDate: "2024-01-10",
      interviewDate: "2024-01-15",
      duration: 22,
      status: "completed",
      overallScore: 92,
      scores: {
        communication: 90,
        technical: 95,
        problemSolving: 88,
        leadership: 94,
        bodyLanguage: 89,
        confidence: 93,
      },
      experience: "6 years",
      skills: ["React", "TypeScript", "Node.js", "GraphQL"],
      resumeUrl: "/resumes/alice-johnson.pdf",
      linkedinUrl: "https://linkedin.com/in/alice-johnson",
      recommendation: "Highly Recommended",
      notes: "Exceptional technical skills and leadership potential",
      hasRecording: true,
    },
    {
      id: "2",
      candidateName: "Bob Smith",
      email: "bob.smith@email.com",
      phone: "+1 (555) 234-5678",
      appliedDate: "2024-01-12",
      interviewDate: "2024-01-16",
      duration: 18,
      status: "completed",
      overallScore: 85,
      scores: {
        communication: 87,
        technical: 82,
        problemSolving: 85,
        leadership: 80,
        bodyLanguage: 88,
        confidence: 86,
      },
      experience: "4 years",
      skills: ["React", "JavaScript", "Python", "AWS"],
      resumeUrl: "/resumes/bob-smith.pdf",
      linkedinUrl: "https://linkedin.com/in/bob-smith",
      recommendation: "Recommended",
      notes: "Strong technical foundation with good growth potential",
      hasRecording: true,
    },
    {
      id: "3",
      candidateName: "Carol Davis",
      email: "carol.davis@email.com",
      phone: "+1 (555) 345-6789",
      appliedDate: "2024-01-08",
      interviewDate: "2024-01-14",
      duration: 25,
      status: "completed",
      overallScore: 78,
      scores: {
        communication: 82,
        technical: 75,
        problemSolving: 79,
        leadership: 76,
        bodyLanguage: 80,
        confidence: 77,
      },
      experience: "3 years",
      skills: ["Vue.js", "JavaScript", "CSS", "HTML"],
      resumeUrl: "/resumes/carol-davis.pdf",
      linkedinUrl: "https://linkedin.com/in/carol-davis",
      recommendation: "Consider",
      notes:
        "Good potential but needs more experience in required technologies",
      hasRecording: true,
    },
    {
      id: "4",
      candidateName: "David Wilson",
      email: "david.wilson@email.com",
      phone: "+1 (555) 456-7890",
      appliedDate: "2024-01-14",
      interviewDate: "2024-01-18",
      duration: 20,
      status: "completed",
      overallScore: 88,
      scores: {
        communication: 85,
        technical: 90,
        problemSolving: 87,
        leadership: 84,
        bodyLanguage: 89,
        confidence: 91,
      },
      experience: "5 years",
      skills: ["React", "TypeScript", "Docker", "Kubernetes"],
      resumeUrl: "/resumes/david-wilson.pdf",
      linkedinUrl: "https://linkedin.com/in/david-wilson",
      recommendation: "Recommended",
      notes: "Strong technical skills with excellent problem-solving abilities",
      hasRecording: true,
    },
    {
      id: "5",
      candidateName: "Eva Martinez",
      email: "eva.martinez@email.com",
      phone: "+1 (555) 567-8901",
      appliedDate: "2024-01-11",
      interviewDate: "2024-01-17",
      duration: 19,
      status: "completed",
      overallScore: 91,
      scores: {
        communication: 94,
        technical: 89,
        problemSolving: 90,
        leadership: 92,
        bodyLanguage: 93,
        confidence: 88,
      },
      experience: "7 years",
      skills: ["React", "TypeScript", "GraphQL", "MongoDB"],
      resumeUrl: "/resumes/eva-martinez.pdf",
      linkedinUrl: "https://linkedin.com/in/eva-martinez",
      recommendation: "Highly Recommended",
      notes: "Outstanding communication and leadership skills",
      hasRecording: true,
    },
    {
      id: "6",
      candidateName: "Frank Chen",
      email: "frank.chen@email.com",
      phone: "+1 (555) 678-9012",
      appliedDate: "2024-01-09",
      interviewDate: "2024-01-15",
      duration: 23,
      status: "completed",
      overallScore: 82,
      scores: {
        communication: 79,
        technical: 86,
        problemSolving: 83,
        leadership: 78,
        bodyLanguage: 81,
        confidence: 85,
      },
      experience: "4 years",
      skills: ["Angular", "TypeScript", "RxJS", "NgRx"],
      resumeUrl: "/resumes/frank-chen.pdf",
      linkedinUrl: "https://linkedin.com/in/frank-chen",
      recommendation: "Consider",
      notes: "Good technical skills but limited React experience",
      hasRecording: true,
    },
  ];

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

  const filteredInterviews = candidates.filter((interview) => {
    const matchesSearch =
      interview.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interview.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interview.skills.some((skill) =>
        skill.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesFilter =
      filterStatus === "all" || interview.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const sortedInterviews = [...filteredInterviews].sort((a, b) => {
    let aValue, bValue;

    switch (sortBy) {
      case "name":
        aValue = a.name;
        bValue = b.name;
        break;
      case "score":
        aValue = a.overallScore;
        bValue = b.overallScore;
        break;
      case "date":
        aValue = new Date(a.interviewDate).getTime();
        bValue = new Date(b.interviewDate).getTime();
        break;
      case "duration":
        aValue = a.duration;
        bValue = b.duration;
        break;
      default:
        aValue = new Date(a.interviewDate).getTime();
        bValue = new Date(b.interviewDate).getTime();
    }

    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-100";
    if (score >= 80) return "text-blue-600 bg-blue-100";
    if (score >= 70) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case "Highly Recommended":
        return "bg-green-100 text-green-800";
      case "Recommended":
        return "bg-blue-100 text-blue-800";
      case "Consider":
        return "bg-yellow-100 text-yellow-800";
      case "Not Recommended":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const toggleCandidateSelection = (candidateId: string) => {
    setSelectedCandidates((prev) =>
      prev.includes(candidateId)
        ? prev.filter((id) => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  const selectAllCandidates = () => {
    if (selectedCandidates.length === sortedInterviews.length) {
      setSelectedCandidates([]);
    } else {
      setSelectedCandidates(sortedInterviews.map((interview) => interview.id));
    }
  };

  const averageScore =
    sortedInterviews.reduce(
      (sum, interview) => sum + interview.overallScore,
      0
    ) / sortedInterviews.length;
  const highPerformers = sortedInterviews.filter(
    (interview) => interview.overallScore >= 85
  ).length;
  const averageDuration =
    sortedInterviews.reduce((sum, interview) => sum + interview.duration, 0) /
    sortedInterviews.length;

  const getjobpostdata = async () => {
    try {
      let job = await getJobPostById(jobId);
      setCandidates(job?.candidates ?? []);
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    getjobpostdata();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() =>
                  // dispatch({ type: "SET_VIEW", payload: "interview-analytics" })
                  onBack()
                }
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>
                  {tab === "interviewanalytics"
                    ? "Back to Analytics"
                    : "Back to Job Posts"}
                </span>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {jobTitle} Interviews
                </h1>
                <p className="text-sm text-gray-600">
                  {company} • {sortedInterviews.length} candidates interviewed
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {selectedCandidates.length > 0 && (
                <span className="text-sm text-gray-600">
                  {selectedCandidates.length} selected
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
                <p className="text-sm text-gray-600 mb-1">Total Interviews</p>
                <p className="text-3xl font-bold text-gray-900">
                  {sortedInterviews.length}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <User className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Average Score</p>
                <p className="text-3xl font-bold text-gray-900">
                  {averageScore.toFixed(1)}%
                </p>
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
                <p className="text-3xl font-bold text-gray-900">
                  {highPerformers}
                </p>
                <p className="text-sm text-gray-500">Score ≥ 85%</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Avg Duration</p>
                <p className="text-3xl font-bold text-gray-900">
                  {averageDuration.toFixed(1)}m
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
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
                <option value="completed">Completed</option>
                <option value="in-progress">In Progress</option>
                <option value="scheduled">Scheduled</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="date">Sort by Date</option>
                <option value="name">Sort by Name</option>
                <option value="score">Sort by Score</option>
                <option value="duration">Sort by Duration</option>
              </select>
              <button
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </button>
            </div>
          </div>
        </div>

        {/* Interview Results Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedCandidates.length === candidates.length}
                      onChange={selectAllCandidates}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Candidate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Overall Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance Breakdown
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Interview Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recommendation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedInterviews.map((interview: Candidate) => (
                  <tr key={interview.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedCandidates.includes(interview.id)}
                        onChange={() => toggleCandidateSelection(interview.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {interview.name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {interview.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {interview.email}
                          </div>
                          <div className="text-sm text-gray-500">
                            {interview.experienceLevel}
                            {/* {interview.experience} experience */}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {interview.skills
                              .slice(0, 3)
                              .map((skill: string, index: number) => (
                                <span
                                  key={index}
                                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                                >
                                  {skill}
                                </span>
                              ))}
                            {interview.skills.length > 3 && (
                              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                                +{interview.skills.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-center">
                        <div
                          className={`text-2xl font-bold mb-1 ${
                            getScoreColor(interview.overallScore ?? 0).split(
                              " "
                            )[0]
                          }`}
                        >
                          {interview.overallScore ?? 0}%
                        </div>
                        <div className="flex items-center justify-center">
                          {interview.overallScore >= 90 && (
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          )}
                          {interview.overallScore >= 85 &&
                            interview.overallScore < 90 && (
                              <TrendingUp className="h-4 w-4 text-green-500" />
                            )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        {Object.entries(interview.scores).map(
                          ([skill, score]) => (
                            <div
                              key={skill}
                              className="flex items-center justify-between"
                            >
                              <span className="text-xs text-gray-600 capitalize w-20">
                                {skill.replace(/([A-Z])/g, " $1").trim()}
                              </span>
                              <div className="flex items-center space-x-2">
                                <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                  <div
                                    className={`h-1.5 rounded-full ${
                                      score >= 90
                                        ? "bg-green-500"
                                        : score >= 80
                                        ? "bg-blue-500"
                                        : score >= 70
                                        ? "bg-yellow-500"
                                        : "bg-red-500"
                                    }`}
                                    style={{ width: `${score}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs font-medium text-gray-900 w-8">
                                  {score}%
                                </span>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {interview.interviewDate === null ? (
                          <></>
                        ) : (
                          <div className="flex items-center space-x-2 mb-1">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>
                              {new Date(
                                interview.interviewDate
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2 mb-1">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>{interview.duration ?? 0} minutes</span>
                        </div>
                        {interview.appliedDate === null ? (
                          <></>
                        ) : (
                          <div className="text-xs text-gray-500 mt-2">
                            Applied:{" "}
                            {new Date(
                              interview.appliedDate
                            ).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRecommendationColor(
                            interview.recommendation ?? ""
                          )}`}
                        >
                          {interview.recommendation ?? ""}
                        </span>
                        <div className="text-xs text-gray-500 mt-1 max-w-32">
                          {interview.notes ?? ""}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {interview.hasRecording && (
                          <button
                            onClick={() =>
                              setViewingRecording({
                                id: interview.id,
                                name: interview.name,
                              })
                            }
                            className="text-purple-600 hover:text-purple-900 transition-colors"
                            title="View Recording"
                          >
                            <Video className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            // Navigate to detailed candidate view
                            dispatch({
                              type: "SET_VIEW",
                              payload: "interview-analytics",
                            });
                            // This would typically set a selected candidate state
                          }}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          className="text-gray-600 hover:text-gray-900 transition-colors"
                          title="Download Resume"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                        <button
                          className="text-gray-600 hover:text-gray-900 transition-colors"
                          title="Contact Candidate"
                        >
                          <Mail className="h-4 w-4" />
                        </button>
                        <button
                          className="text-gray-600 hover:text-gray-900 transition-colors"
                          title="View LinkedIn"
                        >
                          <Linkedin className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedCandidates.length > 0 && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">
                {selectedCandidates.length} candidate(s) selected
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
                  onClick={() => setSelectedCandidates([])}
                  className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
