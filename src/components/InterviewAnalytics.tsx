import React, { useState } from "react";
import {
  ArrowLeft,
  TrendingUp,
  Users,
  Clock,
  Award,
  Filter,
  Calendar,
  Download,
  Eye,
  Star,
  BarChart3,
  PieChart,
  Activity,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { CandidatePerformanceDetail } from "./CandidatePerformanceDetail";
import { JobInterviewListing } from "./JobInterviewListing";

export function InterviewAnalytics() {
  const { dispatch } = useApp();
  const [selectedJobPost, setSelectedJobPost] = useState<string>("all");
  const [dateRange, setDateRange] = useState("30");
  const [selectedMetric, setSelectedMetric] = useState("overall");
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(
    null
  );
  const [selectedJobForListing, setSelectedJobForListing] = useState<{
    id: string;
    title: string;
    company: string;
  } | null>(null);

  // Mock analytics data
  const mockAnalytics = {
    overview: {
      totalInterviews: 247,
      completedInterviews: 198,
      averageScore: 76.8,
      averageDuration: 18.5,
      passRate: 68.2,
      topPerformingJob: "Senior Frontend Developer",
    },
    jobPerformance: [
      {
        jobId: "1",
        title: "Senior Frontend Developer",
        company: "TechCorp Inc.",
        totalInterviews: 32,
        averageScore: 82.4,
        passRate: 75.0,
        averageDuration: 22.3,
        topSkillScores: {
          "Technical Skills": 85,
          Communication: 88,
          "Problem Solving": 79,
          Leadership: 81,
        },
      },
      {
        jobId: "2",
        title: "Product Manager",
        company: "InnovateLabs",
        averageScore: 78.6,
        totalInterviews: 28,
        passRate: 71.4,
        averageDuration: 19.8,
        topSkillScores: {
          "Strategic Thinking": 82,
          Communication: 85,
          Leadership: 76,
          Analytics: 74,
        },
      },
      {
        jobId: "3",
        title: "Data Scientist",
        company: "DataFlow Solutions",
        totalInterviews: 45,
        averageScore: 74.2,
        passRate: 62.2,
        averageDuration: 25.1,
        topSkillScores: {
          "Technical Skills": 78,
          "Problem Solving": 81,
          Communication: 69,
          Analytics: 85,
        },
      },
    ],
    candidatePerformance: [
      {
        id: "1",
        name: "Alice Johnson",
        position: "Senior Frontend Developer",
        overallScore: 92,
        interviewDate: "2024-01-15",
        duration: 22,
        skillScores: {
          "Technical Skills": 95,
          Communication: 90,
          "Problem Solving": 88,
          Leadership: 94,
        },
        status: "excellent",
      },
      {
        id: "2",
        name: "Bob Smith",
        position: "Product Manager",
        overallScore: 85,
        interviewDate: "2024-01-14",
        duration: 18,
        skillScores: {
          "Strategic Thinking": 88,
          Communication: 87,
          Leadership: 82,
          Analytics: 83,
        },
        status: "good",
      },
      {
        id: "3",
        name: "Carol Davis",
        position: "Data Scientist",
        overallScore: 78,
        interviewDate: "2024-01-14",
        duration: 25,
        skillScores: {
          "Technical Skills": 82,
          "Problem Solving": 85,
          Communication: 70,
          Analytics: 75,
        },
        status: "average",
      },
      {
        id: "4",
        name: "David Wilson",
        position: "DevOps Engineer",
        overallScore: 88,
        interviewDate: "2024-01-13",
        duration: 20,
        skillScores: {
          "Technical Skills": 90,
          "Problem Solving": 85,
          Communication: 82,
          Leadership: 86,
        },
        status: "good",
      },
      {
        id: "5",
        name: "Eva Martinez",
        position: "UI/UX Designer",
        overallScore: 91,
        interviewDate: "2024-01-12",
        duration: 19,
        skillScores: {
          "Design Skills": 95,
          Communication: 88,
          Creativity: 92,
          "User Research": 89,
        },
        status: "excellent",
      },
    ],
    trends: {
      weeklyScores: [72, 75, 78, 76, 79, 81, 77],
      monthlyInterviews: [45, 52, 48, 61, 58, 67],
      skillTrends: {
        "Technical Skills": [75, 77, 79, 81, 78, 82],
        Communication: [82, 84, 83, 85, 87, 86],
        "Problem Solving": [70, 72, 75, 73, 76, 78],
        Leadership: [68, 71, 74, 76, 75, 79],
      },
    },
  };

  // If a candidate is selected, show their detailed performance
  if (selectedCandidate) {
    return <CandidatePerformanceDetail candidateId={selectedCandidate} />;
  }

  // If a job is selected for listing, show the interview listing
  if (selectedJobForListing) {
    return (
      <JobInterviewListing
        jobId={selectedJobForListing.id}
        jobTitle={selectedJobForListing.title}
        company={selectedJobForListing.company}
        onBack={() => {
          dispatch({ type: "SET_VIEW", payload: "interview-analytics" });
          setSelectedJobForListing(null);
        }}
        tab="interviewanalytics"
      />
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "bg-green-100 text-green-800";
      case "good":
        return "bg-blue-100 text-blue-800";
      case "average":
        return "bg-yellow-100 text-yellow-800";
      case "poor":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600";
    if (score >= 75) return "text-blue-600";
    if (score >= 65) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => dispatch({ type: "SET_VIEW", payload: "admin" })}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Dashboard</span>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                Interview Performance Analytics
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="h-4 w-4" />
                <span>Export Report</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Position
              </label>
              <select
                value={selectedJobPost}
                onChange={(e) => setSelectedJobPost(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Positions</option>
                {mockAnalytics.jobPerformance.map((job) => (
                  <option key={job.jobId} value={job.jobId}>
                    {job.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 3 months</option>
                <option value="365">Last year</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Metric
              </label>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="overall">Overall Score</option>
                <option value="technical">Technical Skills</option>
                <option value="communication">Communication</option>
                <option value="duration">Interview Duration</option>
              </select>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Interviews</p>
                <p className="text-3xl font-bold text-gray-900">
                  {mockAnalytics.overview.totalInterviews}
                </p>
                <p className="text-sm text-green-600 mt-1">
                  ↑ 12% from last month
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Average Score</p>
                <p className="text-3xl font-bold text-gray-900">
                  {mockAnalytics.overview.averageScore}%
                </p>
                <p className="text-sm text-green-600 mt-1">
                  ↑ 3.2% from last month
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
                <p className="text-sm text-gray-600 mb-1">Pass Rate</p>
                <p className="text-3xl font-bold text-gray-900">
                  {mockAnalytics.overview.passRate}%
                </p>
                <p className="text-sm text-red-600 mt-1">
                  ↓ 1.8% from last month
                </p>
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
                  {mockAnalytics.overview.averageDuration}m
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  ↑ 0.5m from last month
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Job Performance Analysis */}
          <div className="lg:col-span-2 space-y-8">
            {/* Performance by Job Position */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Performance by Job Position
                </h2>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Detailed Analysis
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                {mockAnalytics.jobPerformance.map((job, index) => (
                  <div
                    key={job.jobId}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {job.title}
                        </h3>
                        <p className="text-sm text-gray-600">{job.company}</p>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-2xl font-bold ${getScoreColor(
                            job.averageScore
                          )}`}
                        >
                          {job.averageScore}%
                        </div>
                        <button
                          onClick={() =>
                            setSelectedJobForListing({
                              id: job.jobId,
                              title: job.title,
                              company: job.company,
                            })
                          }
                          className="text-sm text-blue-600 hover:text-blue-800 underline cursor-pointer"
                        >
                          {job.totalInterviews} interviews
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">
                          {job.passRate}%
                        </div>
                        <div className="text-xs text-gray-500">Pass Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">
                          {job.averageDuration}m
                        </div>
                        <div className="text-xs text-gray-500">
                          Avg Duration
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-900">
                          {job.totalInterviews}
                        </div>
                        <div className="text-xs text-gray-500">
                          Total Interviews
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-green-600">
                          {Math.round(
                            job.totalInterviews * (job.passRate / 100)
                          )}
                        </div>
                        <div className="text-xs text-gray-500">Qualified</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Skill Performance
                      </h4>
                      <div className="space-y-2">
                        {Object.entries(job.topSkillScores).map(
                          ([skill, score]) => (
                            <div
                              key={skill}
                              className="flex items-center justify-between"
                            >
                              <span className="text-sm text-gray-600">
                                {skill}
                              </span>
                              <div className="flex items-center space-x-2">
                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{ width: `${score}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium text-gray-900 w-8">
                                  {score}%
                                </span>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Performers */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Individual Candidate Performance
                </h2>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  View All
                </button>
              </div>

              <div className="space-y-4">
                {mockAnalytics.candidatePerformance.map((candidate, index) => (
                  <div
                    key={candidate.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedCandidate(candidate.id)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-gray-200 rounded-full">
                        <span className="text-sm font-medium text-gray-700">
                          {candidate.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {candidate.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {candidate.position}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(
                            candidate.interviewDate
                          ).toLocaleDateString()}{" "}
                          • {candidate.duration}m
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-xl font-bold ${getScoreColor(
                          candidate.overallScore
                        )} flex items-center space-x-2`}
                      >
                        <span>{candidate.overallScore}%</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCandidate(candidate.id);
                          }}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                      <div
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          candidate.status
                        )}`}
                      >
                        {candidate.status.charAt(0).toUpperCase() +
                          candidate.status.slice(1)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Side Analytics */}
          <div className="space-y-8">
            {/* Performance Trends */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Performance Trends
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Weekly Average Scores</span>
                    <span>Last 7 weeks</span>
                  </div>
                  <div className="flex items-end space-x-1 h-20">
                    {mockAnalytics.trends.weeklyScores.map((score, index) => (
                      <div
                        key={index}
                        className="flex-1 bg-blue-200 rounded-t"
                        style={{ height: `${(score / 100) * 100}%` }}
                      >
                        <div
                          className="bg-blue-600 rounded-t h-full"
                          style={{ height: `${score}%` }}
                        ></div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Monthly Interviews</span>
                    <span>Last 6 months</span>
                  </div>
                  <div className="flex items-end space-x-1 h-16">
                    {mockAnalytics.trends.monthlyInterviews.map(
                      (count, index) => (
                        <div
                          key={index}
                          className="flex-1 bg-green-200 rounded-t"
                        >
                          <div
                            className="bg-green-600 rounded-t"
                            style={{
                              height: `${
                                (count /
                                  Math.max(
                                    ...mockAnalytics.trends.monthlyInterviews
                                  )) *
                                100
                              }%`,
                            }}
                          ></div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Skill Analysis */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Skill Performance Analysis
              </h3>

              <div className="space-y-4">
                {Object.entries(mockAnalytics.trends.skillTrends).map(
                  ([skill, scores]) => {
                    const avgScore =
                      scores.reduce((a, b) => a + b, 0) / scores.length;
                    const trend = scores[scores.length - 1] - scores[0];

                    return (
                      <div key={skill}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            {skill}
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-bold text-gray-900">
                              {avgScore.toFixed(1)}%
                            </span>
                            <span
                              className={`text-xs ${
                                trend >= 0 ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {trend >= 0 ? "↑" : "↓"}{" "}
                              {Math.abs(trend).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${avgScore}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            {/* Quick Insights */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Quick Insights
              </h3>

              <div className="space-y-4">
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Top Performing Role
                    </span>
                  </div>
                  <p className="text-sm text-green-700">
                    {mockAnalytics.overview.topPerformingJob} has the highest
                    average score at 82.4%
                  </p>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <Activity className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      Communication Excellence
                    </span>
                  </div>
                  <p className="text-sm text-blue-700">
                    Communication skills show consistent improvement across all
                    positions
                  </p>
                </div>

                <div className="p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">
                      Duration Insight
                    </span>
                  </div>
                  <p className="text-sm text-yellow-700">
                    Longer interviews (20+ min) correlate with higher scores
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
