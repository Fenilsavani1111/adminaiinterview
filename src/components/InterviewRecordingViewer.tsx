import React, { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  FastForward,
  Rewind,
  Download,
  Share2,
  Eye,
  Clock,
  Calendar,
  User,
  Award,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { useJobPosts } from "../hooks/useJobPosts";
import { Candidate } from "../types";

interface InterviewRecordingViewerProps {
  candidateId: string;
  candidateName: string;
  jobTitle: string;
  company: string;
  onBack: () => void;
}

export function InterviewRecordingViewer({
  candidateId,
  candidateName,
  jobTitle,
  company,
  onBack,
}: InterviewRecordingViewerProps) {
  const { dispatch } = useApp();
  const { getCandidateById, error, loading } = useJobPosts();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [selectedQuestion, setSelectedQuestion] = useState(0);
  const [showTranscript, setShowTranscript] = useState(true);
  const [interviewData, setInterviewData] = useState<Candidate>();
  const [isloading, setIsloading] = useState(true);
  let ignore = false;

  // Mock interview recording data
  const MockInterviewData = {
    id: candidateId,
    candidateName,
    jobTitle,
    company,
    interviewDate: "2024-01-15",
    duration: 1320, // 22 minutes in seconds
    overallScore: 92,
    videoUrl: "/mock-interview-video.mp4", // This would be the actual video URL
    questions: [
      {
        id: "1",
        question: "Tell me about yourself and your professional background.",
        startTime: 0,
        endTime: 180,
        score: 88,
        transcript:
          "Hi, I'm Alice Johnson. I'm a Senior Frontend Developer with 6 years of experience specializing in React, TypeScript, and modern web technologies. I have led multiple projects at my current company, including a complete redesign of our customer portal that increased user engagement by 40%. I'm passionate about creating user-friendly interfaces and mentoring junior developers.",
        feedback:
          "Well-structured response with specific examples and metrics. Good professional summary.",
      },
      {
        id: "2",
        question:
          "Describe a challenging technical problem you solved recently.",
        startTime: 180,
        endTime: 390,
        score: 95,
        transcript:
          "Recently, I tackled a performance issue where our React application was experiencing slow rendering with large datasets. I implemented virtualization using react-window and optimized our state management with useMemo and useCallback hooks, resulting in a 60% improvement in rendering performance. The solution involved analyzing the component tree, identifying unnecessary re-renders, and implementing proper memoization strategies.",
        feedback:
          "Excellent technical depth with specific solutions and measurable outcomes. Demonstrates strong problem-solving skills.",
      },
      {
        id: "3",
        question: "How do you handle working in a team environment?",
        startTime: 390,
        endTime: 555,
        score: 85,
        transcript:
          "I believe in collaborative development and clear communication. I regularly conduct code reviews, mentor junior developers, and use tools like Slack and Jira for project coordination. I also advocate for pair programming sessions to share knowledge and maintain code quality. In my current role, I've helped establish coding standards and best practices that improved our team's productivity by 25%.",
        feedback:
          "Good team collaboration examples. Could provide more specific scenarios of conflict resolution or leadership.",
      },
      {
        id: "4",
        question: "Where do you see yourself in 5 years?",
        startTime: 555,
        endTime: 700,
        score: 90,
        transcript:
          "In 5 years, I see myself in a technical leadership role, possibly as a Staff Engineer or Engineering Manager, where I can influence technical decisions and mentor a larger team. I want to continue growing my expertise in emerging technologies while contributing to strategic product decisions. I'm particularly interested in exploring AI integration in frontend development and leading cross-functional initiatives.",
        feedback:
          "Clear career vision with realistic goals. Shows ambition and leadership potential.",
      },
    ],
    behavioralAnalysis: {
      eyeContact: 88,
      posture: 92,
      gestures: 85,
      facialExpressions: 90,
      voiceTone: 87,
      confidence: 94,
      engagement: 91,
    },
    technicalAssessment: {
      accuracy: 95,
      depth: 90,
      clarity: 88,
      problemSolving: 92,
    },
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const updateTime = () => setCurrentTime(video.currentTime);
      const updateDuration = () => setDuration(video.duration);

      video.addEventListener("timeupdate", updateTime);
      video.addEventListener("loadedmetadata", updateDuration);

      return () => {
        video.removeEventListener("timeupdate", updateTime);
        video.removeEventListener("loadedmetadata", updateDuration);
      };
    }
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (video) {
      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (video) {
      video.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const seekTo = (time: number) => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = time;
      setCurrentTime(time);
    }
  };

  const jumpToQuestion = (questionIndex: number) => {
    const question = MockInterviewData.questions[questionIndex];
    if (question) {
      seekTo(question.startTime);
      setSelectedQuestion(questionIndex);
    }
  };

  const changePlaybackSpeed = (speed: number) => {
    const video = videoRef.current;
    if (video) {
      video.playbackRate = speed;
      setPlaybackSpeed(speed);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getCurrentQuestion = () => {
    return (
      MockInterviewData.questions.find(
        (q) => currentTime >= q.startTime && currentTime <= q.endTime
      ) || MockInterviewData.questions[0]
    );
  };

  const currentQuestion = getCurrentQuestion();

  const getjobpostdata = async () => {
    try {
      setIsloading(true);
      const data: any = await getCandidateById(candidateId);
      console.log("data", data);
      if (data?.candidate) setInterviewData(data?.candidate ?? {});
      setIsloading(false);
    } catch (error) {
      setIsloading(false);
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

  const renderAnalysis = (title: string, score: number) => {
    return (
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-600 capitalize">{title}</span>
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
    );
  };

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
                <span>Back to Interview List</span>
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Interview Recording
                </h1>
                {!isloading && (
                  <p className="text-sm text-gray-600">
                    {interviewData?.name} • {interviewData?.designation} at{" "}
                    {interviewData?.location}
                    {/* {company} */}
                  </p>
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
                <span>Download</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isloading ? (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading data...</span>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Video Player */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Video Container */}
                <div className="relative bg-black aspect-video">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    poster="/interview-thumbnail.jpg"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  >
                    <source
                      src={interviewData?.interviewVideoLink ?? ""}
                      type="video/webm"
                    />
                    Your browser does not support the video tag.
                  </video>

                  {/* Video Overlay Controls */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                    <button
                      onClick={togglePlay}
                      className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-4 transition-all duration-200"
                    >
                      {isPlaying ? (
                        <Pause className="h-8 w-8 text-white" />
                      ) : (
                        <Play className="h-8 w-8 text-white ml-1" />
                      )}
                    </button>
                  </div>

                  {/* Current Question Indicator */}
                  {/* {currentQuestion && (
                    <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg">
                      <div className="text-sm font-medium">
                        Question{" "}
                        {MockInterviewData.questions.indexOf(currentQuestion) +
                          1}
                      </div>
                      <div className="text-xs opacity-80">
                        Score: {currentQuestion.score}%
                      </div>
                    </div>
                  )} */}
                </div>

                {/* Video Controls */}
                <div className="p-6 bg-gray-900 text-white">
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                    <div className="relative">
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-100"
                          style={{
                            width: `${(currentTime / duration) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={duration}
                        value={currentTime}
                        onChange={(e) => seekTo(Number(e.target.value))}
                        className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
                      />

                      {/* Question Markers */}
                      {MockInterviewData.questions.map((question, index) => (
                        <div
                          key={question.id}
                          className="absolute top-0 w-1 h-2 bg-yellow-400 cursor-pointer"
                          style={{
                            left: `${(question.startTime / duration) * 100}%`,
                          }}
                          onClick={() => jumpToQuestion(index)}
                          title={`Question ${index + 1}: ${question.question}`}
                        ></div>
                      ))}
                    </div>
                  </div>

                  {/* Control Buttons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => seekTo(Math.max(0, currentTime - 10))}
                        className="hover:text-blue-400 transition-colors"
                      >
                        <Rewind className="h-5 w-5" />
                      </button>
                      <button
                        onClick={togglePlay}
                        className="bg-blue-600 hover:bg-blue-700 rounded-full p-2 transition-colors"
                      >
                        {isPlaying ? (
                          <Pause className="h-5 w-5" />
                        ) : (
                          <Play className="h-5 w-5 ml-0.5" />
                        )}
                      </button>
                      <button
                        onClick={() =>
                          seekTo(Math.min(duration, currentTime + 10))
                        }
                        className="hover:text-blue-400 transition-colors"
                      >
                        <FastForward className="h-5 w-5" />
                      </button>
                      <button
                        onClick={toggleMute}
                        className="hover:text-blue-400 transition-colors"
                      >
                        {isMuted ? (
                          <VolumeX className="h-5 w-5" />
                        ) : (
                          <Volume2 className="h-5 w-5" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center space-x-4">
                      <select
                        value={playbackSpeed}
                        onChange={(e) =>
                          changePlaybackSpeed(Number(e.target.value))
                        }
                        className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm"
                      >
                        <option value={0.5}>0.5x</option>
                        <option value={0.75}>0.75x</option>
                        <option value={1}>1x</option>
                        <option value={1.25}>1.25x</option>
                        <option value={1.5}>1.5x</option>
                        <option value={2}>2x</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transcript Section */}
              {showTranscript && currentQuestion && (
                <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">
                      Live Transcript
                    </h3>
                    <button
                      onClick={() => setShowTranscript(!showTranscript)}
                      className="text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      Question{" "}
                      {MockInterviewData.questions.indexOf(currentQuestion) + 1}
                      : {currentQuestion.question}
                    </div>
                    <div className="text-gray-800 leading-relaxed">
                      {currentQuestion.transcript}
                    </div>
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm font-medium text-blue-900 mb-1">
                        AI Feedback:
                      </div>
                      <div className="text-sm text-blue-800">
                        {currentQuestion.feedback}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Interview Summary */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Interview Summary
                </h3>
                <div className="space-y-4">
                  {interviewData?.status === "completed" && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Overall Score
                        </span>
                        <span
                          className={`text-lg font-bold ${getScoreColor(
                            interviewData?.overallScore ?? 0
                          )}`}
                        >
                          {interviewData?.overallScore}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Duration</span>
                        <span className="text-sm font-medium text-gray-900">
                          {Math.floor((interviewData?.duration || 0) / 60)}{" "}
                          minutes
                        </span>
                      </div>
                    </>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Date</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(
                        interviewData?.interviewDate
                      ).toLocaleDateString()}
                    </span>
                  </div>
                  {interviewData?.status === "completed" && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Questions</span>
                      <span className="text-sm font-medium text-gray-900">
                        {interviewData?.attemptedQuestions}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Question Navigation */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Questions
                </h3>
                <div className="space-y-3">
                  {interviewData?.StudentInterviewAnswer &&
                    interviewData?.StudentInterviewAnswer.map((item, index) => (
                      <button
                        key={item.Question.id}
                        onClick={() => jumpToQuestion(index)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          selectedQuestion === index
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">
                            Question {index + 1}
                          </span>
                          <div className="flex items-center space-x-2">
                            <span
                              className={`text-sm font-bold ${getScoreColor(
                                item.score
                              )}`}
                            >
                              {item.score}%
                            </span>
                            {/* <span className="text-xs text-gray-500">
                              {formatTime(item.startTime)}
                            </span> */}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 line-clamp-2">
                          {item.Question.question}
                        </div>
                      </button>
                    ))}
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Performance Metrics
                </h3>

                {interviewData?.status === "completed" && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        Behavioral Analysis
                      </h4>
                      <div className="space-y-2">
                        {renderAnalysis(
                          "Eye Contact",
                          interviewData?.behavioral_analysis?.eye_contact ?? 0
                        )}
                        {renderAnalysis(
                          "Posture",
                          interviewData?.behavioral_analysis?.posture ?? 0
                        )}
                        {renderAnalysis(
                          "Gestures",
                          interviewData?.behavioral_analysis?.gestures ?? 0
                        )}
                        {renderAnalysis(
                          "Face Expressions",
                          interviewData?.behavioral_analysis
                            ?.facial_expressions ?? 0
                        )}
                        {renderAnalysis(
                          "Voice Tone",
                          interviewData?.behavioral_analysis?.voice_tone ?? 0
                        )}
                        {renderAnalysis(
                          "Confidence",
                          interviewData?.behavioral_analysis?.confidence ?? 0
                        )}
                        {renderAnalysis(
                          "Engagement",
                          interviewData?.behavioral_analysis?.engagement ?? 0
                        )}
                      </div>
                    </div>

                    {/* <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Technical Assessment
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(
                        MockInterviewData.technicalAssessment
                      ).map(([metric, score]) => (
                        <div
                          key={metric}
                          className="flex items-center justify-between"
                        >
                          <span className="text-xs text-gray-600 capitalize">
                            {metric.replace(/([A-Z])/g, " $1").trim()}
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
                      ))}
                    </div>
                  </div> */}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
