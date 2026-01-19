import { useEffect, useState } from "react";
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
  GraduationCap,
  MapPin,
  Mail,
  Phone,
  X,
} from "lucide-react";
import { Candidate } from "../types";
import { useJobPosts } from "../hooks/useJobPosts";
import { format } from "date-fns";

interface CandidatePerformanceDetailProps {
  candidateId: string;
  backText: string;
  onBack: () => void;
}

const camelToLabel = (str: string) => {
  return str
    .replace(/([A-Z])/g, " $1") // insert space before capital letters
    .replace(/^./, (s) => s.toUpperCase()); // capitalize first letter
};

export function CandidatePerformanceDetail({
  candidateId,
  backText = "Back",
  onBack,
}: CandidatePerformanceDetailProps) {
  const { getCandidateById } = useJobPosts();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [candidateData, setCandidateData] = useState<Candidate>();
  const [photoError, setPhotoError] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  let ignore = false;

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

  useEffect(() => {
    setPhotoError(false);
  }, [candidateData?.photoUrl]);

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
                {!loading && candidateData?.photoUrl && !photoError ? (
                  <img
                    src={candidateData.photoUrl}
                    alt={candidateData?.name}
                    className="w-10 h-10 rounded-lg object-cover border-2 border-blue-100 shadow-sm"
                    onError={() => setPhotoError(true)}
                  />
                ) : (
                  !loading && (
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  )
                )}
                {!loading && (
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">
                      {candidateData?.name}
                    </h1>
                    <p className="text-sm text-gray-600">
                      {candidateData?.designation && (
                        <>
                          {candidateData.designation}
                          {candidateData?.location && " • "}
                        </>
                      )}
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
                  {/* Photo Display */}
                  <div className="relative mb-4">
                    {candidateData?.photoUrl && !photoError ? (
                      <div className="relative w-32 h-32 mx-auto cursor-pointer group" onClick={() => setIsPhotoModalOpen(true)}>
                        <img
                          src={candidateData.photoUrl}
                          alt={candidateData?.name}
                          className="w-32 h-32 rounded-full object-cover border-4 border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105"
                          onError={() => setPhotoError(true)}
                         
                        />
                        <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                          <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        {/* Status Badge */}
                        {/* {candidateData?.status === "completed" && (
                          <div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-2 border-4 border-white shadow-md">
                            <div className="w-3 h-3 bg-white rounded-full"></div>
                          </div>
                        )} */}
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-full w-32 h-32 mx-auto flex items-center justify-center shadow-lg border-4 border-blue-100 hover:shadow-xl transition-shadow">
                          <span className="text-3xl font-bold text-white">
                            {candidateData?.name
                              ?.split(" ")
                              ?.map((n: string) => n[0])
                              ?.join("")}
                          </span>
                        </div>
                        {/* Status Badge */}
                        {candidateData?.status === "completed" && (
                          <div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-2 border-4 border-white shadow-md">
                            <div className="w-3 h-3 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    {candidateData?.name}
                  </h2>
                  {candidateData?.designation && (
                    <p className="text-sm font-medium text-blue-600 mb-3">
                      {candidateData.designation}
                    </p>
                  )}
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center justify-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="truncate">{candidateData?.email}</span>
                    </div>
                    {(candidateData?.mobile || candidateData?.phone) && (
                      <div className="flex items-center justify-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{candidateData?.mobile || candidateData?.phone}</span>
                      </div>
                    )}
                    {candidateData?.location && (
                      <div className="flex items-center justify-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{candidateData.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-3">
                <div className="grid md:grid-cols-3 gap-6">
                  {candidateData?.status === "completed" && (
                    <>
                      <div className="text-center">
                        <div
                          className={`text-4xl font-bold mb-2 ${
                            getScoreColor(
                              candidateData?.overallScore ?? 0
                            ).split(" ")[0]
                          }`}
                        >
                          {candidateData?.overallScore}%
                        </div>
                        <div className="text-sm text-gray-600">
                          Overall Score
                        </div>
                        <div
                          className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${getScoreColor(
                            candidateData?.overallScore ?? 0
                          )}`}
                        >
                          Grade:{" "}
                          {getScoreGrade(candidateData?.overallScore ?? 0)}
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="text-4xl font-bold text-gray-900 mb-2">
                          {candidateData?.duration}m
                        </div>
                        <div className="text-sm text-gray-600">
                          Interview Duration
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
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i <
                                Math.round(
                                  (candidateData?.attemptedQuestions /
                                    (candidateData?.StudentInterviewAnswer
                                      ?.length || 0)) *
                                    5
                                )
                                  ? "text-yellow-500 fill-current"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </>
                  )}
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
                        </span>
                      </div>
                      {candidateData?.status === "completed" && (
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>
                            Interviewed:{" "}
                            {format(candidateData?.interviewDate, "dd/MM/yyyy")}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <Award className="h-4 w-4" />
                        <span>
                          Status:{" "}
                          {candidateData?.status !== undefined
                            ? candidateData?.status.charAt(0).toUpperCase() +
                              candidateData?.status.slice(1)
                            : ""}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Education Section */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                      <div className="bg-blue-100 p-1.5 rounded-lg">
                        <GraduationCap className="h-4 w-4 text-blue-600" />
                      </div>
                      <span>Education</span>
                    </h3>
                    <div className="space-y-3">
                      {candidateData?.highestQualification && (
                        <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 p-4 rounded-xl border-l-4 border-blue-500 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-center space-x-2 mb-1">
                            <Award className="h-4 w-4 text-blue-600" />
                            <div className="text-sm font-bold text-gray-900">
                              Highest Qualification
                            </div>
                          </div>
                          <div className="text-base font-semibold text-gray-800 ml-6">
                            {candidateData.highestQualification}
                          </div>
                        </div>
                      )}
                      {candidateData?.educations &&
                        candidateData.educations.length > 0 && (
                          <div className="space-y-3">
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                              Education History
                            </div>
                            {candidateData.educations.map((edu, index) => (
                              <div
                                key={index}
                                className="bg-white p-4 rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all group"
                              >
                                <div className="flex items-start space-x-3">
                                  <div className="bg-blue-100 p-2 rounded-lg group-hover:bg-blue-200 transition-colors flex-shrink-0">
                                    <GraduationCap className="h-4 w-4 text-blue-600" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    {edu.degree && (
                                      <div className="font-semibold text-gray-900 text-sm mb-1">
                                        {edu.degree}
                                        {edu.fieldOfStudy &&
                                          ` - ${edu.fieldOfStudy}`}
                                      </div>
                                    )}
                                    {edu.institution && (
                                      <div className="text-sm text-gray-700 mb-2 flex items-center space-x-1">
                                        <MapPin className="h-3 w-3 text-gray-400" />
                                        <span>{edu.institution}</span>
                                      </div>
                                    )}
                                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                      {(edu.startDate || edu.endDate) && (
                                        <div className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-md">
                                          <Calendar className="h-3 w-3" />
                                          <span>
                                            {edu.startDate && edu.endDate
                                              ? `${edu.startDate} - ${edu.endDate}`
                                              : edu.startDate || edu.endDate}
                                          </span>
                                        </div>
                                      )}
                                      {edu.grade && (
                                        <div className="flex items-center space-x-1 bg-green-100 text-green-700 px-2 py-1 rounded-md font-medium">
                                          <Star className="h-3 w-3" />
                                          <span>Grade: {edu.grade}</span>
                                        </div>
                                      )}
                                    </div>
                                    {edu.description && (
                                      <div className="mt-2 text-xs text-gray-600 italic">
                                        {edu.description}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      {!candidateData?.highestQualification &&
                        (!candidateData?.educations ||
                          candidateData.educations.length === 0) && (
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                            <GraduationCap className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                            <div className="text-sm text-gray-500">
                              No education details available
                            </div>
                          </div>
                        )}
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
          candidateData?.status === "completed" && (
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
                        {[
                          {
                            label: "Communication Skills",
                            score:
                              candidateData?.performanceBreakdown
                                ?.communicationSkills
                                ?.overallAveragePercentage ?? 0,
                            icon: "💬",
                          },
                          {
                            label: "Technical Knowledge",
                            score:
                              candidateData?.performanceBreakdown
                                ?.technicalKnowledge
                                ?.overallAveragePercentage ?? 0,
                            icon: "🔧",
                          },
                          {
                            label: "Body Language",
                            score:
                              candidateData?.performanceBreakdown?.body_language
                                ?.overallAveragePercentage ?? 0,
                            icon: "👤",
                          },
                          {
                            label: "Confidence Level",
                            score:
                              candidateData?.performanceBreakdown
                                ?.confidenceLevel?.overallAveragePercentage ??
                              0,
                            icon: "💪",
                          },
                          {
                            label: "Professional Attire",
                            score:
                              candidateData?.performanceBreakdown?.culturalFit
                                ?.overallAveragePercentage ?? 0,
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
                        ))}
                      </div>
                    </div>

                    {/* AI Feedback */}
                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-6">
                        AI Evaluation Summary
                      </h2>
                      <div className="bg-blue-50 p-6 rounded-xl mb-6">
                        <p className="text-gray-700 leading-relaxed">
                          {candidateData?.aiEvaluationSummary?.summary}
                        </p>
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-semibold text-green-800 mb-3 flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>Key Strengths</span>
                          </h3>
                          <ul className="space-y-2">
                            {candidateData?.aiEvaluationSummary?.keyStrengths?.map(
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
                            {candidateData?.aiEvaluationSummary?.areasOfGrowth?.map(
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
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm p-6">
                      <h3 className="font-semibold text-gray-900 mb-4">
                        Quick Stats
                      </h3>
                      <div className="space-y-4">
                        {candidateData?.quickStats&&Object.entries(candidateData?.quickStats ?? {}).map(
                          ([skill, data]: any) => (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">
                                {camelToLabel(skill)}
                              </span>
                              <span className="font-semibold text-green-600">
                                {data}
                              </span>
                            </div>
                          )
                        )}
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
                          {candidateData?.recommendations?.recommendation}
                        </div>
                        <p className="text-sm text-gray-600">
                          {candidateData?.recommendations?.summary}
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
                        key={response?.id}
                        className="bg-white rounded-xl shadow-sm p-6"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                Question {index + 1}
                              </span>
                              <span className="text-sm text-gray-500">
                                {response?.responseTime}s
                              </span>
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${getScoreColor(
                                  response?.score
                                )}`}
                              >
                                {response?.score} out of 10
                              </span>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-3">
                              {response?.Question?.question}
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
                            {response?.answer}
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
                      {Object.entries(candidateData?.performanceBreakdown).map(
                        ([skill, data]: any) => {
                          if (
                            [
                              "culturalFit",
                              "behavior",
                              "body_language",
                            ].includes(skill)
                          )
                            return;
                          else
                            return (
                              <div key={skill}>
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-medium text-gray-900 capitalize">
                                      {camelToLabel(skill)}
                                    </span>
                                    {getTrendIcon(skill)}
                                  </div>
                                  <span
                                    className={`font-bold ${getScoreColor(
                                      data.overallAveragePercentage
                                    )}`}
                                  >
                                    {data.overallAveragePercentage ?? 0}%
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                  <div
                                    className={`h-2 rounded-full ${
                                      data.overallAveragePercentage >= 90
                                        ? "bg-green-500"
                                        : data.overallAveragePercentage >= 80
                                        ? "bg-blue-500"
                                        : data.overallAveragePercentage >= 70
                                        ? "bg-yellow-500"
                                        : "bg-red-500"
                                    }`}
                                    style={{
                                      width: `${data.overallAveragePercentage}%`,
                                    }}
                                  ></div>
                                </div>
                                <p className="text-sm text-gray-600">
                                  {data.summary}
                                </p>
                              </div>
                            );
                        }
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">
                      Skill Comparison
                    </h2>
                    <div className="space-y-4">
                      {Object.entries(candidateData?.performanceBreakdown).map(
                        ([skill, data]: any) => {
                          if (
                            [
                              "culturalFit",
                              "behavior",
                              "body_language",
                            ].includes(skill)
                          )
                            return;
                          else
                            return (
                              <div
                                key={skill}
                                className="border border-gray-200 rounded-lg p-4"
                              >
                                <div className="flex justify-between items-center mb-2">
                                  <span className="font-medium text-gray-900">
                                    {camelToLabel(skill)}
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    vs Average
                                  </span>
                                </div>
                                <div className="flex items-center space-x-4">
                                  <div className="flex-1">
                                    <div className="flex justify-between text-sm mb-1">
                                      <span>
                                        Candidate:{" "}
                                        {data?.overallAveragePercentage}%
                                      </span>
                                      <span>Average: 72%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div
                                        className="bg-blue-600 h-2 rounded-full"
                                        style={{
                                          width: `${
                                            (data?.overallAveragePercentage /
                                              100) *
                                            100
                                          }%`,
                                        }}
                                      ></div>
                                    </div>
                                  </div>
                                  <span
                                    className={`text-sm font-medium ${
                                      data?.overallAveragePercentage > 72
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }`}
                                  >
                                    {data?.overallAveragePercentage > 72
                                      ? "+"
                                      : ""}
                                    {(
                                      data?.overallAveragePercentage - 72
                                    ).toFixed(1)}
                                    %
                                  </span>
                                </div>
                              </div>
                            );
                        }
                      )}
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
                      {renderAnalysis(
                        "Eye Contact",
                        candidateData?.behavioral_analysis?.eye_contact ?? 0
                      )}
                      {renderAnalysis(
                        "Posture",
                        candidateData?.behavioral_analysis?.posture ?? 0
                      )}
                      {renderAnalysis(
                        "Gestures",
                        candidateData?.behavioral_analysis?.gestures ?? 0
                      )}
                      {renderAnalysis(
                        "Face Expressions",
                        candidateData?.behavioral_analysis
                          ?.facial_expressions ?? 0
                      )}
                      {renderAnalysis(
                        "Voice Tone",
                        candidateData?.behavioral_analysis?.voice_tone ?? 0
                      )}
                      {renderAnalysis(
                        "Confidence",
                        candidateData?.behavioral_analysis?.confidence ?? 0
                      )}
                      {renderAnalysis(
                        "Engagement",
                        candidateData?.behavioral_analysis?.engagement ?? 0
                      )}
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
                          {candidateData?.video_analysis_insights?.positive_indicators
                            ?.slice(1)
                            ?.map((item, i) => (
                              <li key={i}>• {item}</li>
                            ))}
                        </ul>
                      </div>

                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-medium text-blue-800 mb-2">
                          Areas for Improvement
                        </h3>
                        <ul className="text-sm text-blue-700 space-y-1">
                          {candidateData?.video_analysis_insights?.areas_for_improvement
                            ?.slice(1)
                            ?.map((item, i) => (
                              <li key={i}>• {item}</li>
                            ))}
                        </ul>
                      </div>

                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <h3 className="font-medium text-yellow-800 mb-2">
                          Recommendations
                        </h3>
                        <ul className="text-sm text-yellow-700 space-y-1">
                          {candidateData?.video_analysis_insights?.recommendations?.map(
                            (item, i) => (
                              <li key={i}>• {item}</li>
                            )
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )
        )}
      </div>

      {/* Photo Modal */}
      {isPhotoModalOpen && candidateData?.photoUrl && !photoError && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
          onClick={() => setIsPhotoModalOpen(false)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-purple-600">
              <div className="flex items-center space-x-3">
                <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {candidateData?.name}
                  </h3>
                  {candidateData?.designation && (
                    <p className="text-sm text-blue-100">
                      {candidateData.designation}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setIsPhotoModalOpen(false)}
                className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Image Container */}
            <div className="relative bg-gray-900 flex items-center justify-center p-8">
              <img
                src={candidateData.photoUrl}
                alt={candidateData?.name}
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
              />
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center space-x-4">
                  {candidateData?.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>{candidateData.email}</span>
                    </div>
                  )}
                  {(candidateData?.mobile || candidateData?.phone) && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>{candidateData?.mobile || candidateData?.phone}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setIsPhotoModalOpen(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const getScoreColor = (score: number) => {
  if (score >= 90) return "text-green-600 bg-green-100";
  if (score >= 80) return "text-blue-600 bg-blue-100";
  if (score >= 70) return "text-yellow-600 bg-yellow-100";
  return "text-red-600 bg-red-100";
};

const renderAnalysis = (title: string, score: number) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-gray-900 capitalize">{title}</span>
        <span className={`font-bold ${getScoreColor(score).split(" ")[0]}`}>
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
          style={{
            width: `${score}%`,
          }}
        ></div>
      </div>
    </div>
  );
};
