import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Download,
  Share2,
} from "lucide-react";
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
  onBack,
}: InterviewRecordingViewerProps) {
  const { getCandidateById } = useJobPosts();
  const [interviewData, setInterviewData] = useState<Candidate>();
  const [isloading, setIsloading] = useState(true);
  let ignore = false;

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
