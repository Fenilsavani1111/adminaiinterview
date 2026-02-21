import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  User,
  Calendar,
  Clock,
  Award,
  TrendingUp,
  Download,
  Eye,
  Star,
  MessageSquare,
  GraduationCap,
  MapPin,
  Mail,
  Phone,
  X,
  Bell,
  XCircle,
  AlertTriangle,
  Info,
  Shield,
} from 'lucide-react';
import { Candidate } from '../types';
import { useJobPosts } from '../hooks/useJobPosts';
import { format } from 'date-fns';
import { generateCandidatePdf } from './generateCandidatePdf';
import { exportCandidateReport } from './exportCandidateReport';

interface CandidatePerformanceDetailProps {
  candidateId: string;
  backText: string;
  onBack: () => void;
}

const camelToLabel = (str: string) => {
  return str
    .replace(/([A-Z])/g, ' $1') // insert space before capital letters
    .replace(/^./, (s) => s.toUpperCase()); // capitalize first letter
};

export function CandidatePerformanceDetail({
  candidateId,
  backText = 'Back',
  onBack,
}: CandidatePerformanceDetailProps) {
  const { getCandidateById, getPerformanceComparison } = useJobPosts();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [candidateData, setCandidateData] = useState<Candidate>();
  const [photoError, setPhotoError] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [alertSeverityFilter, setAlertSeverityFilter] = useState<
    'all' | 'info' | 'warning' | 'critical'
  >('all');
  const [alertTypeFilter, setAlertTypeFilter] = useState<string>('all');
  const [isPdfExporting, setIsPdfExporting] = useState(false);
  let ignore = false;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getQuestionScoreColor = (score: number, type: string) => {
    if (type === 'communication' || type === 'behavioral') {
      if (score >= 8) return 'text-green-600 bg-green-100';
      if (score >= 6) return 'text-blue-600 bg-blue-100';
      if (score >= 4) return 'text-yellow-600 bg-yellow-100';
      return 'text-red-600 bg-red-100';
    }
    if (score >= 1) return 'text-green-600 bg-green-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreGrade = (score: number) => {
    if (score >= 95) return 'A+';
    if (score >= 90) return 'A';
    if (score >= 85) return 'A-';
    if (score >= 80) return 'B+';
    if (score >= 75) return 'B';
    if (score >= 70) return 'B-';
    if (score >= 65) return 'C+';
    return 'C';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'excellent':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'good':
        return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case 'average':
        return <TrendingUp className="h-4 w-4 text-yellow-600" />;
      default:
        return <TrendingUp className="h-4 w-4 text-gray-600" />;
    }
  };

  const exportToPdf = async () => {
    if (!candidateData) return;
    try {
      setIsPdfExporting(true);
      const doc = await generateCandidatePdf(candidateData, comparisonData);

      // open the pdf in a new tab
      // const pdfUrl = URL.createObjectURL(new Blob([doc.output('blob')], { type: 'application/pdf' }));
      // window.open(pdfUrl, '_blank');
      doc.save(`${candidateData?.name || 'candidate'}_report.pdf`);
      setIsPdfExporting(false);
    } catch (err) {
      setIsPdfExporting(false);
      console.error('PDF export failed:', err);
      alert('Failed to export PDF. Please try again.');
    }
  };

  const getjobpostdata = async () => {
    try {
      setLoading(true);

      // Fetch candidate data first
      const candidateResponse = await getCandidateById(candidateId);

      // Extract job post ID for more targeted comparison
      const jobPostId =
        candidateResponse?.candidate?.JobPost?.id ||
        candidateResponse?.candidate?.jobPostId;

      // Fetch performance comparison with job post ID if available
      const comparisonResponse = await getPerformanceComparison(
        jobPostId,
      ).catch((err) => {
        console.log('Performance comparison fetch failed:', err);
        return null; // Continue even if comparison fails
      });

      if (candidateResponse?.candidate) {
        setCandidateData(candidateResponse.candidate ?? {});
      } else if (candidateResponse) {
        // Handle direct candidate data (fallback)
        setCandidateData((candidateResponse as any) ?? {});
      }

      if (comparisonResponse) {
        setComparisonData(comparisonResponse);
      }

      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log('error', error);
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
                          {candidateData?.location && ' • '}
                        </>
                      )}
                      {candidateData?.location ?? ''}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </button> */}
              <button
                onClick={async () =>
                  await exportCandidateReport(
                    candidateData!,
                    comparisonData,
                    setIsExporting,
                  )
                }
                disabled={loading || !candidateData || isExporting}
                className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    <span>Export Excel</span>
                  </>
                )}
              </button>
              <button
                onClick={exportToPdf}
                disabled={loading || !candidateData || isPdfExporting}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isPdfExporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Exporting PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    <span>Export PDF</span>
                  </>
                )}
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
                      <div
                        className="relative w-32 h-32 mx-auto cursor-pointer group"
                        onClick={() => setIsPhotoModalOpen(true)}
                      >
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
                        {/* {(candidateData?.status === "completed" || candidateData?.status === "under_review") && (
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
                              ?.split(' ')
                              ?.map((n: string) => n[0])
                              ?.join('')}
                          </span>
                        </div>
                        {/* Status Badge */}
                        {/* {(candidateData?.status === "completed" || candidateData?.status === "under_review") && (
                          <div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-2 border-4 border-white shadow-md">
                            <div className="w-3 h-3 bg-white rounded-full"></div>
                          </div>
                        )} */}
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
                        <span>
                          {candidateData?.mobile || candidateData?.phone}
                        </span>
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
                  {(candidateData?.status === 'completed' ||
                    candidateData?.status === 'under_review') && (
                    <>
                      <div className="text-center">
                        <div
                          className={`text-4xl font-bold mb-2 ${
                            getScoreColor(
                              candidateData?.categoryPercentage
                                ?.overallPercentage ?? 0,
                            ).split(' ')[0]
                          }`}
                        >
                          {candidateData?.categoryPercentage?.overallPercentage}
                          %
                        </div>
                        <div className="text-sm text-gray-600">
                          Overall Score
                        </div>
                        <div
                          className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${getScoreColor(
                            candidateData?.categoryPercentage
                              ?.overallPercentage ?? 0,
                          )}`}
                        >
                          Grade:{' '}
                          {getScoreGrade(
                            candidateData?.categoryPercentage
                              ?.overallPercentage ?? 0,
                          )}
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
                          Applied:{' '}
                          {format(candidateData?.appliedDate, 'dd/MM/yyyy')}
                        </span>
                      </div>
                      {(candidateData?.status === 'completed' ||
                        candidateData?.status === 'under_review') && (
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>
                            Interviewed:{' '}
                            {format(candidateData?.interviewDate, 'dd/MM/yyyy')}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <Award className="h-4 w-4" />
                        <span>
                          Status:{' '}
                          {candidateData?.status !== undefined
                            ? candidateData?.status.charAt(0).toUpperCase() +
                              candidateData?.status.slice(1)
                            : ''}
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
                            {candidateData.educations.map((edu, index) => {
                              // Map education type to display name
                              const getEducationTitle = (type: string) => {
                                const typeMap = {
                                  tenth: '10th Standard / SSC',
                                  twelfth: '12th Standard / HSC',
                                  plusTwo: '12th Standard / HSC',
                                  degree: "Bachelor's Degree",
                                  pg: 'Post Graduate Degree',
                                  master: "Master's Degree",
                                  phd: 'PhD / Doctorate',
                                };
                                return (
                                  typeMap[type as keyof typeof typeMap] || type
                                );
                              };

                              return (
                                <div
                                  key={index}
                                  className="bg-white p-4 rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all group"
                                >
                                  <div className="flex items-start space-x-3">
                                    <div className="bg-blue-100 p-2 rounded-lg group-hover:bg-blue-200 transition-colors flex-shrink-0">
                                      <GraduationCap className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      {/* Education Title and Stream */}
                                      <div className="font-semibold text-gray-900 text-sm mb-1">
                                        {getEducationTitle(edu.type)}
                                        {edu.stream && edu.stream.trim() && (
                                          <span className="text-gray-600 font-normal">
                                            {' '}
                                            - {edu.stream}
                                          </span>
                                        )}
                                      </div>

                                      {/* Institution Name */}
                                      {(edu.schoolName || edu.collegeName) && (
                                        <div className="flex items-center space-x-1 mb-2">
                                          <svg
                                            className="h-3.5 w-3.5 text-indigo-500 flex-shrink-0"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={2}
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16M3 21h18M9 21V9h6v12"
                                            />
                                          </svg>
                                          <span className="text-xs font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 truncate">
                                            {edu.schoolName || edu.collegeName}
                                          </span>
                                        </div>
                                      )}

                                      {/* Year and Percentage */}
                                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                        {edu.yearOfPassing &&
                                          edu.yearOfPassing.trim() && (
                                            <div className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-md">
                                              <Calendar className="h-3 w-3" />
                                              <span>
                                                Year: {edu.yearOfPassing}
                                              </span>
                                            </div>
                                          )}
                                        {edu.percentage &&
                                          edu.percentage.toString().trim() && (
                                            <div className="flex items-center space-x-1 bg-green-100 text-green-700 px-2 py-1 rounded-md font-medium">
                                              <Star className="h-3 w-3" />
                                              <span>
                                                {parseFloat(edu.percentage) > 10
                                                  ? `${edu.percentage}%`
                                                  : `${edu.percentage} CGPA`}
                                              </span>
                                            </div>
                                          )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
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

                    {/* Government ID Documents Section */}
                    {candidateData?.governmentProof &&
                      candidateData.governmentProof.length > 0 && (
                        <div>
                          <h3 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                            <div className="bg-emerald-100 p-1.5 rounded-lg">
                              <Shield className="h-4 w-4 text-emerald-600" />
                            </div>
                            <span>Government ID Documents</span>
                          </h3>
                          <div className="space-y-3">
                            {candidateData.governmentProof.map(
                              (proof, index) => {
                                const isVerified = !!proof.verified;
                                const docTypeLabel = proof.type
                                  ? proof.type.charAt(0).toUpperCase() +
                                    proof.type.slice(1)
                                  : 'Document';
                                const idLabel =
                                  proof.idProofType || `Govt ID ${index + 1}`;
                                return (
                                  <div
                                    key={index}
                                    className={`relative p-4 rounded-xl border-l-4 transition-all hover:shadow-md ${
                                      isVerified
                                        ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-500'
                                        : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-400'
                                    }`}
                                  >
                                    {/* Verified badge — top right */}
                                    <span
                                      className={`absolute top-3 right-3 inline-flex items-center space-x-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                                        isVerified
                                          ? 'bg-emerald-100 text-emerald-700'
                                          : 'bg-red-100 text-red-700'
                                      }`}
                                    >
                                      <span>{isVerified ? '✔' : '✘'}</span>
                                      <span>
                                        {isVerified
                                          ? 'Verified'
                                          : 'Not Verified'}
                                      </span>
                                    </span>

                                    {/* Label + Type */}
                                    <div className="mb-2 pr-28">
                                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                        {idLabel}
                                      </span>
                                      <div className="text-sm font-bold text-gray-900 mt-0.5">
                                        {docTypeLabel}
                                      </div>
                                    </div>

                                    {/* Value chip */}
                                    {proof.value && (
                                      <div className="flex items-center space-x-2">
                                        <span className="text-xs text-gray-500">
                                          Number:
                                        </span>
                                        <code className="text-xs font-mono font-semibold bg-white px-2.5 py-1 rounded-lg border border-gray-200 text-gray-800 tracking-wider">
                                          {String(proof.value)}
                                        </code>
                                      </div>
                                    )}
                                  </div>
                                );
                              },
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        {loading ? (
          <></>
        ) : (
          (candidateData?.status === 'under_review' ||
            candidateData?.status === 'completed') && (
            <>
              {/* Navigation Tabs */}
              <div className="bg-white rounded-xl shadow-sm mb-8">
                <div className="border-b border-gray-200">
                  <nav className="flex space-x-8 px-6">
                    {[
                      { id: 'overview', label: 'Overview', icon: Award },
                      {
                        id: 'responses',
                        label: 'Response Analysis',
                        icon: MessageSquare,
                      },
                      {
                        id: 'skills',
                        label: 'Skill Breakdown',
                        icon: TrendingUp,
                      },
                      {
                        id: 'behavioral',
                        label: 'Behavioral Analysis',
                        icon: Eye,
                      },
                      {
                        id: 'proctoring',
                        label: 'Proctoring Alerts',
                        icon: Shield,
                      },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                          activeTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
              {activeTab === 'overview' && (
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
                            label: 'Communication Skills',
                            score:
                              candidateData?.performanceBreakdown
                                ?.communicationSkills
                                ?.overallAveragePercentage ?? 0,
                            icon: '💬',
                          },
                          {
                            label: 'Technical Knowledge',
                            score:
                              candidateData?.performanceBreakdown
                                ?.technicalKnowledge
                                ?.overallAveragePercentage ?? 0,
                            icon: '🔧',
                          },
                          {
                            label: 'Body Language',
                            score:
                              candidateData?.performanceBreakdown?.body_language
                                ?.overallAveragePercentage ?? 0,
                            icon: '👤',
                          },
                          {
                            label: 'Confidence Level',
                            score:
                              candidateData?.performanceBreakdown
                                ?.confidenceLevel?.overallAveragePercentage ??
                              0,
                            icon: '💪',
                          },
                          {
                            label: 'Professional Attire',
                            score:
                              candidateData?.performanceBreakdown?.culturalFit
                                ?.overallAveragePercentage ?? 0,
                            icon: '👔',
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
                                    item.score,
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
                                    ? 'bg-green-500'
                                    : item.score >= 80
                                      ? 'bg-blue-500'
                                      : item.score >= 70
                                        ? 'bg-yellow-500'
                                        : 'bg-red-500'
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
                              ),
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
                              ),
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
                        {candidateData?.quickStats &&
                          Object.entries(candidateData?.quickStats ?? {}).map(
                            ([skill, data]: any) => (
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">
                                  {camelToLabel(skill)}
                                </span>
                                <span className="font-semibold text-green-600">
                                  {data}
                                </span>
                              </div>
                            ),
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

              {activeTab === 'responses' && (
                <div className="space-y-6">
                  {candidateData?.StudentInterviewAnswer &&
                    candidateData?.StudentInterviewAnswer?.filter(
                      (que) => que?.answer?.length > 0,
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
                                className={`px-2 py-1 rounded text-xs font-medium ${getQuestionScoreColor(
                                  response?.score,
                                  response?.Question.type,
                                )}`}
                              >
                                {response?.Question.type === 'communication' ||
                                response?.Question.type === 'behavioral'
                                  ? `${response?.score} out of 10`
                                  : response?.score}
                              </span>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-3">
                              {response?.Question?.question}
                            </h3>
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

              {activeTab === 'skills' && (
                <div className="grid lg:grid-cols-2 gap-8">
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">
                      Skill Assessment
                    </h2>
                    <div className="space-y-6">
                      {(() => {
                        const categoryScores = Object.keys(
                          candidateData?.categoryPercentage
                            ?.categoryWiseScore || {},
                        )
                          .filter(
                            (skill) =>
                              ![
                                'culturalFit',
                                'behavior',
                                'body_language',
                              ].includes(skill),
                          )
                          .map((skill) => {
                            const data =
                              candidateData?.categoryPercentage
                                ?.categoryWiseScore[skill];
                            const scoreRatio =
                              (data?.total ?? 0) > 0
                                ? Math.round(
                                    ((data?.score ?? 0) / (data?.total ?? 0)) *
                                      100,
                                  )
                                : 0;
                            let defaultSummary = '';
                            if (scoreRatio >= 90) {
                              defaultSummary =
                                'Excellent understanding and application of concepts.';
                            } else if (scoreRatio >= 80) {
                              defaultSummary =
                                'Strong grasp of core principles with good proficiency.';
                            } else if (scoreRatio >= 70) {
                              defaultSummary =
                                'Solid foundational knowledge, though some areas need refinement.';
                            } else if (scoreRatio >= 50) {
                              defaultSummary =
                                'Basic knowledge demonstrated; further improvement recommended.';
                            } else {
                              defaultSummary =
                                'Significant gaps identified; requires focused development.';
                            }

                            return {
                              skill,
                              scoreRatio,
                              scoreText: `${data?.score} / ${data?.total} (${scoreRatio}%)`,
                              summary: defaultSummary,
                            };
                          });

                        const performanceKeys = [
                          'confidenceLevel',
                          'leadershipPotential',
                          'culturalFit',
                        ];
                        const performanceScores = performanceKeys
                          .map((skill) => {
                            const data =
                              candidateData?.performanceBreakdown?.[skill];
                            if (!data) return null;
                            return {
                              skill:
                                skill === 'culturalFit'
                                  ? 'professionalAttire'
                                  : skill,
                              scoreRatio: data.overallAveragePercentage ?? 0,
                              scoreText: `${data.overallAveragePercentage ?? 0}%`,
                              summary: data.summary,
                            };
                          })
                          .filter(Boolean as any);

                        return [...categoryScores, ...performanceScores].map(
                          ({ skill, scoreRatio, scoreText, summary }: any) => (
                            <div key={skill}>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium text-gray-900 capitalize">
                                    {camelToLabel(skill)}
                                  </span>
                                  {getTrendIcon(skill)}
                                </div>
                                <span
                                  className={`font-bold ${getScoreColor(scoreRatio)}`}
                                >
                                  {scoreText}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    scoreRatio >= 90
                                      ? 'bg-green-500'
                                      : scoreRatio >= 80
                                        ? 'bg-blue-500'
                                        : scoreRatio >= 70
                                          ? 'bg-yellow-500'
                                          : 'bg-red-500'
                                  }`}
                                  style={{
                                    width: `${scoreRatio}%`,
                                  }}
                                ></div>
                              </div>
                              {summary && (
                                <p className="text-sm text-gray-600">
                                  {summary}
                                </p>
                              )}
                            </div>
                          ),
                        );
                      })()}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">
                      Skill Comparison
                    </h2>
                    {/* Comparison Data Info */}
                    {comparisonData && (
                      <div
                        className={`mb-4 p-3 rounded-lg border ${
                          comparisonData.totalCandidates > 0
                            ? 'bg-blue-50 border-blue-200'
                            : 'bg-yellow-50 border-yellow-200'
                        }`}
                      >
                        <div
                          className={`flex items-center space-x-2 text-sm ${
                            comparisonData.totalCandidates > 0
                              ? 'text-blue-800'
                              : 'text-yellow-800'
                          }`}
                        >
                          <TrendingUp className="h-4 w-4" />
                          <span>
                            {comparisonData.totalCandidates > 0
                              ? `Comparison based on ${comparisonData.totalCandidates} completed interviews`
                              : 'No completed interviews found for comparison yet'}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      {(() => {
                        const categoryComparisons = Object.keys(
                          candidateData?.categoryPercentage
                            ?.categoryWiseScore || {},
                        )
                          .filter(
                            (skill) =>
                              ![
                                'culturalFit',
                                'behavior',
                                'body_language',
                              ].includes(skill),
                          )
                          .map((skill) => {
                            const data =
                              candidateData?.categoryPercentage
                                ?.categoryWiseScore[skill];
                            const scoreRatio =
                              (data?.total ?? 0) > 0
                                ? Math.round(
                                    ((data?.score ?? 0) / (data?.total ?? 0)) *
                                      100,
                                  )
                                : 0;
                            return {
                              skill,
                              candidateScore: scoreRatio,
                              averageScore:
                                comparisonData?.averageScores?.[skill] || 0,
                            };
                          });

                        const performanceKeys = [
                          'confidenceLevel',
                          'leadershipPotential',
                          'culturalFit',
                        ];
                        const performanceComparisons = performanceKeys
                          .map((skill) => {
                            const data =
                              candidateData?.performanceBreakdown?.[skill];
                            if (!data) return null;
                            return {
                              skill:
                                skill === 'culturalFit'
                                  ? 'professionalAttire'
                                  : skill,
                              candidateScore:
                                data.overallAveragePercentage || 0,
                              averageScore:
                                comparisonData?.averageScores?.[skill] || 0,
                            };
                          })
                          .filter(Boolean as any);

                        return [
                          ...categoryComparisons,
                          ...performanceComparisons,
                        ].map(
                          ({ skill, candidateScore, averageScore }: any) => {
                            const difference = candidateScore - averageScore;
                            const isAboveAverage =
                              candidateScore > averageScore;

                            return (
                              <div
                                key={skill}
                                className={`border-2 rounded-xl p-5 transition-all ${
                                  isAboveAverage
                                    ? 'border-green-200 bg-green-50/50'
                                    : candidateScore === averageScore
                                      ? 'border-yellow-200 bg-yellow-50/50'
                                      : 'border-red-200 bg-red-50/50'
                                }`}
                              >
                                <div className="flex justify-between items-start mb-3">
                                  <div>
                                    <h4 className="font-semibold text-gray-900 text-lg">
                                      {camelToLabel(skill)}
                                    </h4>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-2xl font-bold text-gray-900">
                                      {candidateScore}%
                                    </div>
                                  </div>
                                </div>

                                {/* Performance Comparison Bar */}
                                <div className="space-y-3">
                                  <div className="flex justify-between text-sm text-gray-600">
                                    <span>
                                      Performance vs Others (
                                      {comparisonData?.totalCandidates || 0}{' '}
                                      candidates)
                                    </span>
                                    <span>Average: {averageScore}%</span>
                                  </div>

                                  <div className="relative">
                                    {/* Background track */}
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                      {/* Average marker */}
                                      <div
                                        className="absolute top-0 w-1 h-3 bg-gray-400 rounded"
                                        style={{ left: `${averageScore}%` }}
                                      ></div>
                                      {/* Candidate progress */}
                                      <div
                                        className={`h-3 rounded-full transition-all duration-500 ${
                                          isAboveAverage
                                            ? 'bg-gradient-to-r from-green-400 to-green-600'
                                            : candidateScore === averageScore
                                              ? 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                                              : 'bg-gradient-to-r from-red-400 to-red-600'
                                        }`}
                                        style={{
                                          width: `${Math.min(candidateScore, 100)}%`,
                                        }}
                                      ></div>
                                    </div>
                                  </div>

                                  {/* Performance message */}
                                  <div
                                    className={`text-sm p-3 rounded-lg ${
                                      isAboveAverage
                                        ? 'bg-green-100 text-green-800 border border-green-200'
                                        : candidateScore === averageScore
                                          ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                          : 'bg-red-100 text-red-800 border border-red-200'
                                    }`}
                                  >
                                    {comparisonData?.totalCandidates > 0 ? (
                                      isAboveAverage ? (
                                        <>
                                          ✅ <strong>Strong performance</strong>
                                          <br />
                                          This student scored{' '}
                                          <strong>
                                            {difference.toFixed(1)}%
                                          </strong>{' '}
                                          higher than the average of{' '}
                                          <strong>
                                            {comparisonData.totalCandidates}
                                          </strong>{' '}
                                          students in{' '}
                                          <strong>{camelToLabel(skill)}</strong>
                                          .
                                        </>
                                      ) : candidateScore === averageScore ? (
                                        <>
                                          ⚖️{' '}
                                          <strong>Average performance</strong>
                                          <br />
                                          This student’s score is on par with
                                          the average of{' '}
                                          <strong>
                                            {comparisonData.totalCandidates}
                                          </strong>{' '}
                                          students in{' '}
                                          <strong>{camelToLabel(skill)}</strong>
                                          .
                                        </>
                                      ) : (
                                        <>
                                          ⚠️ <strong>Needs improvement</strong>
                                          <br />
                                          This student scored{' '}
                                          <strong>
                                            {Math.abs(difference).toFixed(1)}%
                                          </strong>{' '}
                                          below the average of{' '}
                                          <strong>
                                            {comparisonData.totalCandidates}
                                          </strong>{' '}
                                          students in{' '}
                                          <strong>{camelToLabel(skill)}</strong>
                                          . Additional support is recommended.
                                        </>
                                      )
                                    ) : (
                                      <>
                                        ℹ️{' '}
                                        <strong>No comparison available</strong>
                                        <br />
                                        This student scored{' '}
                                        <strong>
                                          {candidateScore}%
                                        </strong> in{' '}
                                        <strong>{camelToLabel(skill)}</strong>.
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          },
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'behavioral' && (
                <div className="grid lg:grid-cols-2 gap-8">
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">
                      Behavioral Analysis
                    </h2>
                    <div className="space-y-6">
                      {renderAnalysis(
                        'Eye Contact',
                        candidateData?.behavioral_analysis?.eye_contact ?? 0,
                      )}
                      {renderAnalysis(
                        'Posture',
                        candidateData?.behavioral_analysis?.posture ?? 0,
                      )}
                      {renderAnalysis(
                        'Gestures',
                        candidateData?.behavioral_analysis?.gestures ?? 0,
                      )}
                      {renderAnalysis(
                        'Face Expressions',
                        candidateData?.behavioral_analysis
                          ?.facial_expressions ?? 0,
                      )}
                      {renderAnalysis(
                        'Voice Tone',
                        candidateData?.behavioral_analysis?.voice_tone ?? 0,
                      )}
                      {renderAnalysis(
                        'Confidence',
                        candidateData?.behavioral_analysis?.confidence ?? 0,
                      )}
                      {renderAnalysis(
                        'Engagement',
                        candidateData?.behavioral_analysis?.engagement ?? 0,
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
                            ),
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'proctoring' && (
                <div className="space-y-6">
                  {/* Proctoring Status Overview */}
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Shield className="h-5 w-5 text-blue-600" />
                      </div>
                      <h2 className="text-xl font-bold text-gray-900">
                        Proctoring Overview
                      </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 mb-6">
                      {/* Proctoring Status Card */}
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-blue-600 font-medium">
                              Status
                            </p>
                            <p className="text-lg font-bold text-blue-900 capitalize">
                              {candidateData?.proctoringStatus || 'N/A'}
                            </p>
                          </div>
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <Eye className="h-4 w-4 text-blue-600" />
                          </div>
                        </div>
                      </div>

                      {/* Total Alerts Card */}
                      <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-amber-600 font-medium">
                              Total Alerts
                            </p>
                            <p className="text-lg font-bold text-amber-900">
                              {candidateData?.proctoringAlerts?.length || 0}
                            </p>
                          </div>
                          <div className="bg-amber-100 p-2 rounded-lg">
                            <Bell className="h-4 w-4 text-amber-600" />
                          </div>
                        </div>
                      </div>

                      {/* Alert Severity Summary */}
                      <div className="bg-gradient-to-br from-rose-50 to-red-50 p-4 rounded-lg border border-rose-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-rose-600 font-medium">
                              Critical Alerts
                            </p>
                            <p className="text-lg font-bold text-rose-900">
                              {candidateData?.proctoringAlerts?.filter(
                                (alert: any) =>
                                  (alert.severity || 'info') === 'critical',
                              ).length || 0}
                            </p>
                          </div>
                          <div className="bg-rose-100 p-2 rounded-lg">
                            <XCircle className="h-4 w-4 text-rose-600" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Proctoring Alerts */}
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="bg-amber-100 p-2 rounded-lg">
                        <Bell className="h-5 w-5 text-amber-600" />
                      </div>
                      <h2 className="text-xl font-bold text-gray-900">
                        Proctoring Alerts
                      </h2>
                    </div>

                    {/* Alert Summary Stats */}
                    {candidateData?.proctoringAlerts &&
                      candidateData.proctoringAlerts.length > 0 && (
                        <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-3 bg-indigo-50 rounded-lg">
                            <Info className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
                            <p className="text-sm font-medium text-indigo-800">
                              {
                                candidateData.proctoringAlerts.filter(
                                  (alert: any) =>
                                    (alert.severity || 'info') === 'info',
                                ).length
                              }
                            </p>
                            <p className="text-xs text-indigo-600">Info</p>
                          </div>
                          <div className="text-center p-3 bg-amber-50 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                            <p className="text-sm font-medium text-amber-800">
                              {
                                candidateData.proctoringAlerts.filter(
                                  (alert: any) =>
                                    (alert.severity || 'info') === 'warning',
                                ).length
                              }
                            </p>
                            <p className="text-xs text-amber-600">Warnings</p>
                          </div>
                          <div className="text-center p-3 bg-rose-50 rounded-lg">
                            <XCircle className="w-5 h-5 text-rose-600 mx-auto mb-1" />
                            <p className="text-sm font-medium text-rose-800">
                              {
                                candidateData.proctoringAlerts.filter(
                                  (alert: any) =>
                                    (alert.severity || 'info') === 'critical',
                                ).length
                              }
                            </p>
                            <p className="text-xs text-rose-600">Critical</p>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <Bell className="w-5 h-5 text-gray-600 mx-auto mb-1" />
                            <p className="text-sm font-medium text-gray-800">
                              {candidateData.proctoringAlerts.length}
                            </p>
                            <p className="text-xs text-gray-600">Total</p>
                          </div>
                        </div>
                      )}

                    {/* Alerts Container with MatricsView Style */}
                    <div className="rounded-xl border border-slate-200/80 bg-gradient-to-br from-amber-50/40 to-rose-50/20 overflow-hidden">
                      <div className="flex flex-col gap-2 border-b border-amber-200/50 bg-white/60 px-3 py-2">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-amber-500" />
                          <span className="text-sm font-semibold text-slate-700">
                            Recent Alerts
                          </span>
                          {candidateData?.proctoringAlerts &&
                            candidateData.proctoringAlerts.length > 0 && (
                              <span className="ml-auto bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
                                {candidateData.proctoringAlerts.length} alert
                                {candidateData.proctoringAlerts.length !== 1
                                  ? 's'
                                  : ''}
                              </span>
                            )}
                        </div>

                        {/* Modern filter chips */}
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Severity filter */}
                          <div className="flex items-center gap-2">
                            {/* <span className='text-xs font-medium text-slate-500'>Severity:</span> */}
                            {[
                              { id: 'all', label: 'All' },
                              { id: 'info', label: 'Info' },
                              { id: 'warning', label: 'Warning' },
                              { id: 'critical', label: 'Critical' },
                            ].map((option) => (
                              <button
                                key={option.id}
                                onClick={() =>
                                  setAlertSeverityFilter(
                                    option.id as
                                      | 'all'
                                      | 'info'
                                      | 'warning'
                                      | 'critical',
                                  )
                                }
                                className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                                  alertSeverityFilter === option.id
                                    ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                }`}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>

                          {/* Type filter */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-slate-500">
                              Type:
                            </span>
                            <select
                              value={alertTypeFilter}
                              onChange={(e) =>
                                setAlertTypeFilter(e.target.value)
                              }
                              className="text-xs px-2.5 py-1 rounded-full border border-slate-200 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                            >
                              <option value="all">All types</option>
                              <option value="looking_away">Looking away</option>
                              <option value="multiple_faces_detected">
                                Multiple faces
                              </option>
                              <option value="low_engagement">
                                Low engagement
                              </option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="max-h-80 overflow-y-auto p-2">
                        {!candidateData?.proctoringAlerts ||
                        candidateData.proctoringAlerts.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                            <Shield className="w-12 h-12 mb-3 text-slate-300" />
                            <p className="text-sm font-medium">
                              No proctoring alerts
                            </p>
                            <p className="text-xs mt-1">
                              This candidate maintained proper conduct during
                              the interview
                            </p>
                          </div>
                        ) : (
                          <ul className="space-y-1.5">
                            {candidateData.proctoringAlerts
                              .filter((alert: any) => {
                                const sev = alert.severity || 'info';
                                const type = alert.type || 'unknown';

                                const matchesSeverity =
                                  alertSeverityFilter === 'all' ||
                                  sev === alertSeverityFilter;
                                const matchesType =
                                  alertTypeFilter === 'all' ||
                                  type === alertTypeFilter;

                                return matchesSeverity && matchesType;
                              })
                              .slice(0, 20)
                              .map((alert, index) => {
                                const alertObj =
                                  typeof alert === 'object' &&
                                  alert &&
                                  !Array.isArray(alert)
                                    ? alert
                                    : { message: String(alert) };
                                const severity =
                                  (alertObj as any).severity || 'info';
                                const isWarning = severity === 'warning';
                                const isError = severity === 'critical';

                                const Icon = isError
                                  ? XCircle
                                  : isWarning
                                    ? AlertTriangle
                                    : Info;
                                const borderColor = isError
                                  ? 'border-l-rose-400'
                                  : isWarning
                                    ? 'border-l-amber-400'
                                    : 'border-l-indigo-400';
                                const bgColor = isError
                                  ? 'bg-rose-50/60'
                                  : isWarning
                                    ? 'bg-amber-50/60'
                                    : 'bg-indigo-50/40';
                                const message =
                                  (alertObj as { message?: string }).message ??
                                  (typeof alert === 'string'
                                    ? alert
                                    : JSON.stringify(alert));

                                return (
                                  <li
                                    key={index}
                                    className={`flex items-start gap-2 px-2.5 py-1.5 rounded-r-lg border-l-2 ${borderColor} ${bgColor} hover:bg-opacity-80 transition-colors`}
                                  >
                                    <Icon className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-500" />
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between">
                                        <span className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                                          {(alertObj as any).type || 'unknown'}
                                        </span>
                                        {severity === 'info' && (
                                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-900/5 text-slate-500">
                                            {severity}
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-xs text-slate-700 block mt-0.5">
                                        {typeof message === 'string'
                                          ? message
                                          : JSON.stringify(message)}
                                      </span>
                                      {typeof alertObj.timestamp === 'string' ||
                                      typeof alertObj.timestamp === 'number' ||
                                      alertObj.timestamp instanceof Date ? (
                                        <span className="text-[10px] text-slate-400 mt-0.5 block">
                                          {new Date(
                                            alertObj.timestamp,
                                          ).toLocaleString()}
                                        </span>
                                      ) : null}
                                    </div>
                                    {(isError || isWarning) && (
                                      <span
                                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                                          isError
                                            ? 'bg-rose-100 text-rose-700'
                                            : 'bg-amber-100 text-amber-700'
                                        }`}
                                      >
                                        {isError ? 'Critical' : 'Warning'}
                                      </span>
                                    )}
                                  </li>
                                );
                              })}
                          </ul>
                        )}
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
                      <span>
                        {candidateData?.mobile || candidateData?.phone}
                      </span>
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
  if (score >= 90) return 'text-green-600 bg-green-100';
  if (score >= 80) return 'text-blue-600 bg-blue-100';
  if (score >= 70) return 'text-yellow-600 bg-yellow-100';
  return 'text-red-600 bg-red-100';
};

const renderAnalysis = (title: string, score: number) => {
  return (
    <div key={title}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-gray-900 capitalize">{title}</span>
        <span className={`font-bold ${getScoreColor(score).split(' ')[0]}`}>
          {score}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${
            score >= 90
              ? 'bg-green-500'
              : score >= 80
                ? 'bg-blue-500'
                : score >= 70
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
          }`}
          style={{
            width: `${score}%`,
          }}
        ></div>
      </div>
    </div>
  );
};
