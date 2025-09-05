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
import { VideoPlayer } from "./VideoRecording";

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
  const { getCandidateById, error, loading } = useJobPosts();
  const videoRef = useRef<HTMLVideoElement | null>(null);
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
            <VideoPlayer
              src={interviewData?.interviewVideoLink}
              interviewData={interviewData as Candidate}
            />
          </div>
        )}
      </div>
    </div>
  );
}
