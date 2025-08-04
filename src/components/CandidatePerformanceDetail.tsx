import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  User,
  Calendar,
  Clock,
  Award,
  TrendingUp,
  Play,
  Download,
  Share2,
  Eye,
  Star,
  MessageSquare,
  Video,
  Mic,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { Candidate } from "../types";
import { useJobPosts } from "../hooks/useJobPosts";
import { format } from "date-fns";

interface CandidatePerformanceDetailProps {
  candidateId: string;
  backText: string;
  onBack: () => void;
}

export function CandidatePerformanceDetail({
  candidateId,
  backText = "Back",
  onBack,
}: CandidatePerformanceDetailProps) {
  const { dispatch } = useApp();
  const { getCandidateById, error } = useJobPosts();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [candidateData, setCandidateData] = useState<Candidate>();
  let ignore = false;

  // Mock detailed candidate data
  const MockcandidateData = {
    id: candidateId,
    name: "Alice Johnson",
    email: "alice.johnson@email.com",
    phone: "+1 (555) 123-4567",
    position: "Senior Frontend Developer",
    company: "TechCorp Inc.",
    appliedDate: "2024-01-10",
    interviewDate: "2024-01-15",
    duration: 22,
    status: "completed",
    overallScore: 92,
    evaluation: {
      overall: 92,
      communication: 90,
      technical: 95,
      bodyLanguage: 88,
      confidence: 94,
      attire: 96,
      feedback:
        "Exceptional performance with strong technical knowledge and excellent communication skills. Demonstrated clear problem-solving approach and leadership potential. Minor areas for improvement in handling complex system design questions.",
      strengths: [
        "Outstanding technical expertise in React and TypeScript",
        "Clear and articulate communication style",
        "Strong problem-solving methodology",
        "Excellent professional presentation",
        "Good eye contact and confident body language",
        "Relevant industry experience and examples",
      ],
      improvements: [
        "Could elaborate more on system design approaches",
        "Consider providing more specific metrics in examples",
        "Opportunity to discuss team collaboration in more detail",
      ],
    },
    responses: [
      {
        questionId: "1",
        question: "Tell me about yourself and your professional background.",
        response:
          "I am a Senior Frontend Developer with 6 years of experience specializing in React, TypeScript, and modern web technologies. I have led multiple projects at my current company, including a complete redesign of our customer portal that increased user engagement by 40%.",
        duration: 180,
        score: 88,
        feedback:
          "Well-structured response with specific examples and metrics. Good professional summary.",
        timestamp: "2024-01-15T10:05:00Z",
        audioUrl: "/mock-audio-1.mp3",
        videoUrl: "/mock-video-1.mp4",
      },
      {
        questionId: "2",
        question:
          "Describe a challenging technical problem you solved recently.",
        response:
          "Recently, I tackled a performance issue where our React application was experiencing slow rendering with large datasets. I implemented virtualization using react-window and optimized our state management with useMemo and useCallback hooks, resulting in a 60% improvement in rendering performance.",
        duration: 210,
        score: 95,
        feedback:
          "Excellent technical depth with specific solutions and measurable outcomes. Demonstrates strong problem-solving skills.",
        timestamp: "2024-01-15T10:08:00Z",
        audioUrl: "/mock-audio-2.mp3",
        videoUrl: "/mock-video-2.mp4",
      },
      {
        questionId: "3",
        question: "How do you handle working in a team environment?",
        response:
          "I believe in collaborative development and clear communication. I regularly conduct code reviews, mentor junior developers, and use tools like Slack and Jira for project coordination. I also advocate for pair programming sessions to share knowledge and maintain code quality.",
        duration: 165,
        score: 85,
        feedback:
          "Good team collaboration examples. Could provide more specific scenarios of conflict resolution or leadership.",
        timestamp: "2024-01-15T10:12:00Z",
        audioUrl: "/mock-audio-3.mp3",
        videoUrl: "/mock-video-3.mp4",
      },
      {
        questionId: "4",
        question: "Where do you see yourself in 5 years?",
        response:
          "In 5 years, I see myself in a technical leadership role, possibly as a Staff Engineer or Engineering Manager, where I can influence technical decisions and mentor a larger team. I want to continue growing my expertise in emerging technologies while contributing to strategic product decisions.",
        duration: 145,
        score: 90,
        feedback:
          "Clear career vision with realistic goals. Shows ambition and leadership potential.",
        timestamp: "2024-01-15T10:15:00Z",
        audioUrl: "/mock-audio-4.mp3",
        videoUrl: "/mock-video-4.mp4",
      },
    ],
    skillAnalysis: {
      "Technical Knowledge": {
        score: 95,
        details:
          "Demonstrated exceptional understanding of React, TypeScript, and performance optimization. Provided specific examples with measurable outcomes.",
        trend: "excellent",
      },
      "Communication Skills": {
        score: 90,
        details:
          "Clear, articulate responses with good structure. Maintained professional tone throughout the interview.",
        trend: "excellent",
      },
      "Problem Solving": {
        score: 88,
        details:
          "Showed systematic approach to problem-solving with concrete examples. Could elaborate more on complex scenarios.",
        trend: "good",
      },
      "Leadership Potential": {
        score: 85,
        details:
          "Demonstrated mentoring experience and team collaboration. Shows potential for growth into leadership roles.",
        trend: "good",
      },
      "Cultural Fit": {
        score: 92,
        details:
          "Values align well with company culture. Shows enthusiasm for collaboration and continuous learning.",
        trend: "excellent",
      },
    },
    behavioralAnalysis: {
      eyeContact: 88,
      posture: 92,
      gestures: 85,
      facialExpressions: 90,
      voiceTone: 87,
      confidence: 94,
      engagement: 91,
    },
    comparisonData: {
      positionAverage: 76.8,
      industryAverage: 72.3,
      percentileRank: 95,
    },
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-100";
    if (score >= 80) return "text-blue-600 bg-blue-100";
    if (score >= 70) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getScoreGrade = (score: number) => {
    if (score >= 95) return "A+";
    if (score >= 90) return "A";
    if (score >= 85) return "A-";
    if (score >= 80) return "B+";
    if (score >= 75) return "B";
    if (score >= 70) return "B-";
    if (score >= 65) return "C+";
    return "C";
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "excellent":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "good":
        return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case "average":
        return <TrendingUp className="h-4 w-4 text-yellow-600" />;
      default:
        return <TrendingUp className="h-4 w-4 text-gray-600" />;
    }
  };

  const getjobpostdata = async () => {
    try {
      setLoading(true);
      const data: any = await getCandidateById(candidateId);
      console.log("data", data);
      if (data?.candidate) setCandidateData(data?.candidate ?? {});
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log("error", error);
    }
  };

  useEffect(() => {
    if (!ignore) {
      getjobpostdata();
    }
    return () => {
      ignore = true;
    };
  }, []);

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
                <span>{backText}</span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <User className="h-5 w-5 text-white" />
                </div>
                {!loading && (
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">
                      {candidateData?.name}
                    </h1>
                    <p className="text-sm text-gray-600">
                      {candidateData?.designation} •{" "}
                      {/* {candidateData?.company ?? ""} -- */}
                      {candidateData?.location ?? ""}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </button>
              <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="h-4 w-4" />
                <span>Export Report</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Candidate Summary Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading data...</span>
            </div>
          ) : (
            <div className="grid lg:grid-cols-4 gap-8">
              <div className="lg:col-span-1">
                <div className="text-center">
                  <div className="bg-gray-200 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-700">
                      {candidateData?.name
                        ?.split(" ")
                        ?.map((n: string) => n[0])
                        ?.join("")}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    {candidateData?.name}
                  </h2>
                  <p className="text-gray-600 mb-2">{candidateData?.email}</p>
                  <p className="text-gray-600">{candidateData?.mobile}</p>
                </div>
              </div>

              <div className="lg:col-span-3">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div
                      className={`text-4xl font-bold mb-2 ${
                        getScoreColor(candidateData?.overallScore ?? 0).split(
                          " "
                        )[0]
                      }`}
                    >
                      {candidateData?.overallScore}%
                    </div>
                    <div className="text-sm text-gray-600">Overall Score</div>
                    <div
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${getScoreColor(
                        candidateData?.overallScore ?? 0
                      )}`}
                    >
                      Grade: {getScoreGrade(candidateData?.overallScore ?? 0)}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900 mb-2">
                      {candidateData?.duration}m
                    </div>
                    <div className="text-sm text-gray-600">
                      Interview Duration
                    </div>
                    <div className="text-sm text-green-600 mt-2">
                      {/* {MockcandidateData.comparisonData.percentileRank}th percentile */}
                      --
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900 mb-2">
                      {candidateData?.attemptedQuestions}
                    </div>
                    <div className="text-sm text-gray-600">
                      Questions Answered
                    </div>
                    <div className="flex justify-center mt-2">
                      {/* {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < 4
                            ? "text-yellow-500 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))} */}
                      --
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">
                      Interview Details
                    </h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Applied:{" "}
                          {format(candidateData?.appliedDate, "dd/MM/yyyy")}
                          {/* {new Date(
                          candidateData.appliedDate
                        ).toLocaleDateString()} */}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>
                          Interviewed:{" "}
                          {format(candidateData?.interviewDate, "dd/MM/yyyy")}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Award className="h-4 w-4" />
                        <span>
                          Status:{" "}
                          {candidateData?.status !== undefined
                            ? candidateData?.status.charAt(0).toUpperCase() +
                              candidateData.status.slice(1)
                            : ""}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">
                      Performance Comparison
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          vs Position Average:
                        </span>
                        <span className="font-medium text-green-600">
                          {/* +
                        {(
                          candidateData.overallScore -
                          candidateData.comparisonData.positionAverage
                        ).toFixed(1)}
                        % */}
                          --
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          vs Industry Average:
                        </span>
                        <span className="font-medium text-green-600">
                          {/* +
                        {(
                          candidateData.overallScore -
                          candidateData.comparisonData.industryAverage
                        ).toFixed(1)}
                        % */}
                          --
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Percentile Rank:</span>
                        <span className="font-medium text-blue-600">
                          {/* {candidateData.comparisonData.percentileRank}th */}
                          --
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        {loading ? (
          <></>
        ) : (
          <>
            {/* Navigation Tabs */}
            <div className="bg-white rounded-xl shadow-sm mb-8">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: "overview", label: "Overview", icon: Award },
                    {
                      id: "responses",
                      label: "Response Analysis",
                      icon: MessageSquare,
                    },
                    {
                      id: "skills",
                      label: "Skill Breakdown",
                      icon: TrendingUp,
                    },
                    {
                      id: "behavioral",
                      label: "Behavioral Analysis",
                      icon: Eye,
                    },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <tab.icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === "overview" && (
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Performance Scores */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">
                      Performance Breakdown
                    </h2>
                    <div className="space-y-6">
                      {/* {[
                    {
                      label: "Communication Skills",
                      score: candidateData.evaluation.communication,
                      icon: "💬",
                    },
                    {
                      label: "Technical Knowledge",
                      score: candidateData.evaluation.technical,
                      icon: "🔧",
                    },
                    {
                      label: "Body Language",
                      score: candidateData.evaluation.bodyLanguage,
                      icon: "👤",
                    },
                    {
                      label: "Confidence Level",
                      score: candidateData.evaluation.confidence,
                      icon: "💪",
                    },
                    {
                      label: "Professional Attire",
                      score: candidateData.evaluation.attire,
                      icon: "👔",
                    },
                  ].map((item, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{item.icon}</span>
                          <span className="font-medium text-gray-900">
                            {item.label}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-gray-900">
                            {item.score}%
                          </span>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${getScoreColor(
                              item.score
                            )}`}
                          >
                            {getScoreGrade(item.score)}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-1000 ${
                            item.score >= 90
                              ? "bg-green-500"
                              : item.score >= 80
                              ? "bg-blue-500"
                              : item.score >= 70
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${item.score}%` }}
                        ></div>
                      </div>
                    </div>
                  ))} */}
                      --
                    </div>
                  </div>

                  {/* AI Feedback */}
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">
                      AI Evaluation Summary
                    </h2>
                    --
                    {/* <div className="bg-blue-50 p-6 rounded-xl mb-6">
                  <p className="text-gray-700 leading-relaxed">
                    {candidateData.evaluation.feedback}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-green-800 mb-3 flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Key Strengths</span>
                    </h3>
                    <ul className="space-y-2">
                      {candidateData.evaluation.strengths.map(
                        (strength, index) => (
                          <li
                            key={index}
                            className="text-sm text-gray-700 flex items-start space-x-2"
                          >
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span>{strength}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-blue-800 mb-3 flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Areas for Growth</span>
                    </h3>
                    <ul className="space-y-2">
                      {candidateData.evaluation.improvements.map(
                        (improvement, index) => (
                          <li
                            key={index}
                            className="text-sm text-gray-700 flex items-start space-x-2"
                          >
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span>{improvement}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </div> */}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="space-y-6">
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      Quick Stats
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Response Quality
                        </span>
                        <span className="font-semibold text-green-600">
                          Excellent
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Technical Depth
                        </span>
                        <span className="font-semibold text-green-600">
                          Advanced
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Communication
                        </span>
                        <span className="font-semibold text-blue-600">
                          Very Good
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Cultural Fit
                        </span>
                        <span className="font-semibold text-green-600">
                          Strong Match
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      Recommendation
                    </h3>
                    <div className="text-center">
                      <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Award className="h-8 w-8 text-green-600" />
                      </div>
                      <div className="text-lg font-bold text-green-800 mb-2">
                        Highly Recommended
                      </div>
                      <p className="text-sm text-gray-600">
                        {/* Exceptional candidate with strong technical skills and
                        excellent communication. Recommended for immediate
                        consideration. */}
                        --
                      </p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      Next Steps
                    </h3>
                    <div className="space-y-3">
                      <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm">
                        Schedule Technical Round
                      </button>
                      <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                        Send to Hiring Manager
                      </button>
                      <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                        Request References
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "responses" && (
              <div className="space-y-6">
                {candidateData?.StudentInterviewAnswer &&
                  candidateData?.StudentInterviewAnswer?.filter(
                    (que) => que?.answer?.length > 0
                  ).map((response, index) => (
                    <div
                      key={response.id}
                      className="bg-white rounded-xl shadow-sm p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                              Question {index + 1}
                            </span>
                            <span className="text-sm text-gray-500">
                              {response.responseTime}s
                            </span>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${getScoreColor(
                                response.score
                              )}`}
                            >
                              {response.score}%
                            </span>
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-3">
                            {response.Question?.question}
                          </h3>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100">
                            <Video className="h-4 w-4" />
                          </button>
                          <button className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100">
                            <Mic className="h-4 w-4" />
                          </button>
                          <button className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100">
                            <Play className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">
                          Candidate Response:
                        </h4>
                        <p className="text-gray-700 leading-relaxed">
                          {response.answer}
                        </p>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">
                          AI Analysis:
                        </h4>
                        <p className="text-blue-800 text-sm">
                          {response.aiEvaluation}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {activeTab === "skills" && (
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Skill Assessment
                  </h2>
                  <div className="space-y-6">
                    {/* {Object.entries(candidateData.skillAnalysis).map(
                  ([skill, data]) => (
                    <div key={skill}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">
                            {skill}
                          </span>
                          {getTrendIcon(data.trend)}
                        </div>
                        <span
                          className={`font-bold ${
                            getScoreColor(data.score).split(" ")[0]
                          }`}
                        >
                          {data.score}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div
                          className={`h-2 rounded-full ${
                            data.score >= 90
                              ? "bg-green-500"
                              : data.score >= 80
                              ? "bg-blue-500"
                              : data.score >= 70
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${data.score}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600">{data.details}</p>
                    </div>
                  )
                )} */}
                    --
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Skill Comparison
                  </h2>
                  <div className="space-y-4">
                    {/* {Object.entries(candidateData.skillAnalysis).map(
                  ([skill, data]) => (
                    <div
                      key={skill}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-900">
                          {skill}
                        </span>
                        <span className="text-sm text-gray-500">
                          vs Average
                        </span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Candidate: {data.score}%</span>
                            <span>Average: 72%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${(data.score / 100) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        <span
                          className={`text-sm font-medium ${
                            data.score > 72 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {data.score > 72 ? "+" : ""}
                          {(data.score - 72).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  )
                )} */}
                    --
                  </div>
                </div>
              </div>
            )}

            {activeTab === "behavioral" && (
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Behavioral Analysis
                  </h2>
                  <div className="space-y-6">
                    {/* {Object.entries(candidateData.behavioralAnalysis).map(
                  ([behavior, score]) => (
                    <div key={behavior}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900 capitalize">
                          {behavior.replace(/([A-Z])/g, " $1").trim()}
                        </span>
                        <span
                          className={`font-bold ${
                            getScoreColor(score).split(" ")[0]
                          }`}
                        >
                          {score}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
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
                    </div>
                  )
                )} */}
                    --
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Video Analysis Insights
                  </h2>
                  <div className="space-y-4">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-medium text-green-800 mb-2">
                        Positive Indicators
                      </h3>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• --</li>
                        {/* <li>• Maintained excellent eye contact throughout</li>
                    <li>• Appropriate facial expressions and engagement</li>
                    <li>• Clear and well-modulated voice tone</li> */}
                      </ul>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-medium text-blue-800 mb-2">
                        Areas for Improvement
                      </h3>
                      <ul className="text-sm text-blue-700 space-y-1">
                        {/* <li>• Could use more hand gestures for emphasis</li>
                    <li>• Occasional fidgeting during complex questions</li>
                    <li>• Voice pace could be slightly slower for clarity</li> */}
                        <li>• --</li>
                      </ul>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h3 className="font-medium text-yellow-800 mb-2">
                        Recommendations
                      </h3>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        {/* <li>• Practice power poses before interviews</li>
                    <li>• Use deliberate pauses for emphasis</li>
                    <li>• Incorporate more storytelling techniques</li> */}
                        <li>• --</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
