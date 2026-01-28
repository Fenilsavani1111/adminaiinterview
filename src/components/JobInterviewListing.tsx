import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Search,
  Download,
  Eye,
  Star,
  Calendar,
  Clock,
  User,
  Award,
  TrendingUp,
  Mail,
  Linkedin,
  FileText,
  Video,
} from 'lucide-react';
import { InterviewRecordingViewer } from './InterviewRecordingViewer';
import { useJobPosts } from '../hooks/useJobPosts';
import { Candidate, JobPost } from '../types';
import { CandidatePerformanceDetail } from './CandidatePerformanceDetail';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

interface JobInterviewListingProps {
  jobId: string;
  jobTitle: string;
  tab: string;
  company: string;
  onBack: () => void;
}

const formatDate = (date?: string) => (date ? new Date(date).toISOString().split('T')[0] : 'N/A');

const formatEducations = (educations: any[]) => {
  if (!Array.isArray(educations) || educations.length === 0) return 'N/A';

  const qualificationMap: Record<string, string> = {
    tenth: '10th',
    twelfth: '12th',
    degree: 'Degree',
    pg: 'PG',
  };

  return educations
    .map((e) => {
      const qualification = qualificationMap[e.type] || e.type;
      const score = e.percentage ? e.percentage : '';
      const year = e.yearOfPassing ? e.yearOfPassing : '';

      // Build string like "10th (8.8) - 2014" or "PG" if both empty
      if (score || year) {
        return `${qualification}${score ? ` (${score})` : ''}${year ? ` - ${year}` : ''}`;
      }
      return qualification;
    })
    .join(' | ');
};

const yesNo = (val: boolean | undefined) => (val === true ? 'Yes' : val === false ? 'No' : 'N/A');

function secondsToHrMin(seconds: number) {
  const hr = Math.floor(seconds / 3600);
  const min = Math.floor((seconds % 3600) / 60);
  return `${hr} hr ${min} min`;
}

const formatCategoryPercentage = (categoryPercentage: any) => {
  if (!categoryPercentage) return 'N/A';

  const { overallScore, totalScore, overallPercentage, categoryWisePercentage } =
    categoryPercentage;

  let text = `Overall Score: ${overallScore ?? 0} / ${totalScore ?? 0}\n`;
  text += `Overall Percentage: ${overallPercentage ?? 0}%\n\n`;
  text += `Category-wise Percentage:\n\n`;

  if (categoryWisePercentage && typeof categoryWisePercentage === 'object') {
    Object.entries(categoryWisePercentage).forEach(([key, value]) => {
      text += `${key}: ${value}%\n\n`;
    });
  }

  return text.trim();
};

export function JobInterviewListing({
  jobId,
  jobTitle,
  tab,
  company,
  onBack,
}: JobInterviewListingProps) {
  const { getJobPostById } = useJobPosts();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [viewingRecording, setViewingRecording] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [jobpost, setJobpost] = useState<JobPost | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedInterview, setSelectedInterview] = useState<Candidate | null>(null);
  let ignore = false;
  const [exporting, setExporting] = useState(false);

  const filteredInterviews = candidates
    .filter((interview) => interview?.interviewDate)
    .filter((interview) => {
      const matchesSearch =
        interview.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interview.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        interview.skills.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesFilter = filterStatus === 'all' || interview.status === filterStatus;
      return matchesSearch && matchesFilter;
    });

  const sortedInterviews = [...filteredInterviews].sort((a, b) => {
    let aValue, bValue;

    switch (sortBy) {
      case 'name':
        aValue = a.name;
        bValue = b.name;
        break;
      case 'score':
        aValue = a.overallScore;
        bValue = b.overallScore;
        break;
      case 'date':
        aValue = new Date(a.interviewDate).getTime();
        bValue = new Date(b.interviewDate).getTime();
        break;
      case 'duration':
        aValue = a.duration;
        bValue = b.duration;
        break;
      default:
        aValue = new Date(a.interviewDate).getTime();
        bValue = new Date(b.interviewDate).getTime();
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getRecommendationColor = (recommendation: string) => {
    if (recommendation?.includes?.('Highly'))
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    else if (recommendation?.includes?.('Recommended'))
      return 'bg-blue-50 text-blue-700 border-blue-200';
    else if (recommendation?.includes?.('Consider'))
      return 'bg-amber-50 text-amber-700 border-amber-200';
    else return 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const toggleCandidateSelection = (candidateId: string) => {
    setSelectedCandidates((prev) =>
      prev.includes(candidateId) ? prev.filter((id) => id !== candidateId) : [...prev, candidateId]
    );
  };

  const selectAllCandidates = () => {
    if (selectedCandidates.length === sortedInterviews.length) {
      setSelectedCandidates([]);
    } else {
      setSelectedCandidates(sortedInterviews.map((interview) => interview.id));
    }
  };

  const exportToExcel = async () => {
    setExporting(true);
    if (!candidates || candidates.length === 0) {
      console.warn('No data to export');
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Students Report');

    const headers = [
      'Job Title',
      'Job Created User',
      'Job Created Date',
      'Total Assessment Count',
      'Assessment Name',
      'Assessment Type',
      'Assessment Duration',
      'Assessment Created Date',
      'Total Invite Count',
      'Invited User Email',
      'Invited Date',
      'Submission Status',
      'Category Percentage',
      'Percentage',
      'Proctoring Status',
      'Region',
      'Location',
      'Residence Location',
      'Resume Link',
      'Education Details',
      'Govt ID 1 Proof',
      'Govt ID 1 Verified',
      'Govt ID 2 Proof',
      'Govt ID 2 Verified',
    ];

    worksheet.addRow(headers);
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { horizontal: 'center', vertical: 'middle' };

    // ✅ ADD SORTING / FILTER DROPDOWNS
    worksheet.autoFilter = {
      from: {
        row: 1,
        column: 1,
      },
      to: {
        row: 1,
        column: headers.length,
      },
    };

    // ✅ FREEZE HEADER ROW
    worksheet.views = [
      {
        state: 'frozen',
        ySplit: 1,
      },
    ];

    candidates
      ?.sort((a, b) => Number(a.id) - Number(b.id))
      ?.filter((interview) => interview?.interviewDate)
      ?.forEach((item) => {
        worksheet.addRow([
          item.designation || '', // Job Title
          'Demo testing', // Job Created User
          jobpost?.createdAt ? formatDate(jobpost?.createdAt) : 'N/A', // Job Created Date
          jobpost?.interviews ?? 0, // Total Assessment Count
          jobpost?.title || 'N/A', // Assessment Name
          'MIXED_QUESTIONS', // jobpost?.type || "N/A",                         // Assessment Type

          // Assessment Duration (safe reduce)
          Array.isArray(jobpost?.questions)
            ? secondsToHrMin(
                jobpost.questions.reduce((acc, q) => acc + (q.expectedDuration || 0), 0)
              )
            : 0,

          jobpost?.createdAt ? formatDate(jobpost?.createdAt) : 'N/A', // Assessment Created Date
          jobpost?.applicants ?? 0, // Total Invite Count
          item.email, // Invited User Email
          formatDate(item.appliedDate), // Invited Date
          item.status?.replace(/_/g, ' ') || 'Pending', // Submission Status

          formatCategoryPercentage(item.categoryPercentage), // Category Percentage
          item.categoryPercentage?.overallPercentage ?? 0, // Percentage

          item.proctoringStatus || 'N/A', // Proctoring Status
          item.region || 'N/A', // Region
          item.location || 'N/A', // Location
          item.residenceLocation || 'N/A', // Residence Location
          item.resumeUrl || 'N/A', // Resume Link

          formatEducations(item?.educations ?? []), // Education Details

          item.governmentProof?.[0]?.value || 'N/A',
          yesNo(item.governmentProof?.[0]?.verified), // Govt ID 1 Verified

          item.governmentProof?.[1]?.value || 'N/A',
          yesNo(item.governmentProof?.[1]?.verified), // Govt ID 2 Verified
        ]);
      });

    worksheet.columns.forEach((col) => {
      col.width = 22;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    saveAs(blob, 'recruitment_progress_report.xlsx');
    setExporting(false);
  };

  const averageScore =
    sortedInterviews.reduce((sum, interview) => sum + interview.overallScore, 0) /
    sortedInterviews.length;
  const highPerformers = sortedInterviews.filter(
    (interview) => interview.overallScore >= 85
  ).length;
  const averageDuration =
    sortedInterviews.reduce((sum, interview) => sum + interview.duration, 0) /
    sortedInterviews.length;

  const handleDownloadResume = async (resumeUrl: string, name: string) => {
    try {
      const response = await fetch(resumeUrl);
      if (!response.ok) {
        throw new Error('Download failed');
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `${name}_Resume.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error while downloading:', err);
    }
  };

  const getData = async () => {
    try {
      setLoading(true);
      let job = await getJobPostById(jobId);
      setCandidates(job?.candidates ?? []);
      if (job?.post) setJobpost({ ...job?.post });
    } catch (error) {
      console.log('error', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!ignore) {
      getData();
    }
    return () => {
      ignore = true;
    };
  }, []);

  // If a candidate is selected, show their detailed performance
  if (selectedInterview) {
    return (
      <CandidatePerformanceDetail
        candidateId={selectedInterview?.id}
        backText='Back to Job Interview'
        onBack={() => setSelectedInterview(null)}
      />
    );
  }

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

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white shadow-sm border-b border-gray-100'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between py-4'>
            <div className='flex items-center space-x-4'>
              <button
                onClick={onBack}
                className='flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors'
              >
                <ArrowLeft className='h-5 w-5' />
                <span>
                  {tab === 'interviewanalytics' ? 'Back to Analytics' : 'Back to Job Posts'}
                </span>
              </button>
              <div>
                <h1 className='text-2xl font-bold text-gray-900'>{jobTitle} Interviews</h1>
                <p className='text-sm text-gray-600'>
                  {company} • {sortedInterviews.length} candidates interviewed
                </p>
              </div>
            </div>
            <div className='flex items-center space-x-4'>
              {selectedCandidates.length > 0 && (
                <span className='text-sm text-gray-600'>{selectedCandidates.length} selected</span>
              )}
              {candidates?.length > 0 && (
                <button
                  onClick={() => exportToExcel()}
                  disabled={loading}
                  className='flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors'
                >
                  {exporting ? (
                    <span>Exporting Results...</span>
                  ) : (
                    <>
                      <Download className='h-4 w-4' />
                      <span>Export Results</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Summary Stats */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
          <div className='bg-white rounded-xl shadow-sm p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-600 mb-1'>Total Interviews</p>
                <p className='text-3xl font-bold text-gray-900'>{jobpost?.interviews ?? 0}</p>
              </div>
              <div className='bg-blue-100 p-3 rounded-lg'>
                <User className='h-6 w-6 text-blue-600' />
              </div>
            </div>
          </div>

          <div className='bg-white rounded-xl shadow-sm p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-600 mb-1'>Average Score</p>
                <p className='text-3xl font-bold text-gray-900'>
                  {Number.isNaN(averageScore) ? '0' : averageScore.toFixed(1)}
                </p>
              </div>
              <div className='bg-green-100 p-3 rounded-lg'>
                <Award className='h-6 w-6 text-green-600' />
              </div>
            </div>
          </div>

          <div className='bg-white rounded-xl shadow-sm p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-600 mb-1'>High Performers</p>
                <p className='text-3xl font-bold text-gray-900'>{highPerformers}</p>
                <p className='text-sm text-gray-500'>Score ≥ 85</p>
              </div>
              <div className='bg-yellow-100 p-3 rounded-lg'>
                <TrendingUp className='h-6 w-6 text-yellow-600' />
              </div>
            </div>
          </div>

          <div className='bg-white rounded-xl shadow-sm p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-600 mb-1'>Avg Duration</p>
                <p className='text-3xl font-bold text-gray-900'>
                  {Number.isNaN(averageDuration) ? '0' : averageDuration.toFixed(1)}m
                </p>
              </div>
              <div className='bg-purple-100 p-3 rounded-lg'>
                <Clock className='h-6 w-6 text-purple-600' />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className='bg-white rounded-xl shadow-sm p-6 mb-8'>
          <div className='flex flex-col lg:flex-row gap-4'>
            <div className='flex-1'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                <input
                  type='text'
                  placeholder='Search candidates by name, email, or skills...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>
            </div>
            <div className='flex gap-4'>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              >
                <option value='all'>All Status</option>
                <option value='pending'>Pending</option>
                <option value='inprogress'>In Progress</option>
                <option value='under_review'>Under Review</option>
                <option value='completed'>Completed</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              >
                <option value='date'>Sort by Date</option>
                <option value='name'>Sort by Name</option>
                <option value='score'>Sort by Score</option>
                <option value='duration'>Sort by Duration</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className='px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        {/* Interview Results Table */}
        <div className='bg-white rounded-xl shadow-sm overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left'>
                    <input
                      type='checkbox'
                      checked={selectedCandidates.length === candidates.length}
                      onChange={selectAllCandidates}
                      className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                    />
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Candidate
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Overall Score
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Performance Breakdown
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Interview Details
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Recommendation
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {loading ? (
                  <tr>
                    <td colSpan={7}>
                      <div className='w-full flex justify-center items-center py-12'>
                        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
                        <span className='ml-3 text-gray-600'>Loading data...</span>
                      </div>
                    </td>
                  </tr>
                ) : sortedInterviews?.length === 0 ? (
                  <tr>
                    <td className='px-6 py-4 text-center' colSpan={7}>
                      No interview records found
                    </td>
                  </tr>
                ) : (
                  sortedInterviews.map((interview: Candidate) => (
                    <tr key={interview.id} className='hover:bg-gray-50'>
                      <td className='px-6 py-4'>
                        <input
                          type='checkbox'
                          checked={selectedCandidates.includes(interview.id)}
                          onChange={() => toggleCandidateSelection(interview.id)}
                          className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                        />
                      </td>
                      <td className='px-6 py-4'>
                        <div className='flex items-center'>
                          <div className='h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center'>
                            <span className='text-sm font-medium text-gray-700'>
                              {interview.name
                                .split(' ')
                                .map((n: string) => n[0])
                                .join('')}
                            </span>
                          </div>
                          <div className='ml-4'>
                            <div className='text-sm font-medium text-gray-900'>
                              {interview.name}
                            </div>
                            <div className='text-sm text-gray-500'>{interview.email}</div>
                            <div className='text-sm text-gray-500'>
                              {interview.experienceLevel}
                              {/* {interview.experience} experience */}
                            </div>
                            <div className='flex flex-wrap gap-1 mt-1'>
                              {interview?.skills?.length > 0 &&
                                interview?.skills
                                  ?.slice(0, 3)
                                  .map((skill: string, index: number) => (
                                    <span
                                      key={index}
                                      className='bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs'
                                    >
                                      {skill}
                                    </span>
                                  ))}
                              {interview.skills.length > 3 && (
                                <span className='bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs'>
                                  +{interview.skills.length - 3}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4'>
                        {(interview?.status === 'completed' ||
                          interview?.status === 'under_review') && (
                          <div className='text-center'>
                            <div
                              className={`text-2xl font-bold mb-1 ${
                                getScoreColor(interview.overallScore ?? 0).split(' ')[0]
                              }`}
                            >
                              {interview.overallScore ?? 0}
                            </div>
                            <div className='flex items-center justify-center'>
                              {interview.overallScore >= 90 && (
                                <Star className='h-4 w-4 text-yellow-500 fill-current' />
                              )}
                              {interview.overallScore >= 85 && interview.overallScore < 90 && (
                                <TrendingUp className='h-4 w-4 text-green-500' />
                              )}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className='px-6 py-4'>
                        {interview?.performanceBreakdown && (
                          <div className='space-y-2'>
                            {Object.entries(interview.scores).map(([skill, score]) => (
                              <div key={skill} className='flex items-center justify-between'>
                                <span className='text-xs text-gray-600 capitalize w-20'>
                                  {skill.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                                <div className='flex items-center space-x-2'>
                                  <div className='w-16 bg-gray-200 rounded-full h-1.5'>
                                    <div
                                      className={`h-1.5 rounded-full ${
                                        score >= 90
                                          ? 'bg-green-500'
                                          : score >= 80
                                            ? 'bg-blue-500'
                                            : score >= 70
                                              ? 'bg-yellow-500'
                                              : 'bg-red-500'
                                      }`}
                                      style={{ width: `${score}%` }}
                                    ></div>
                                  </div>
                                  <span className='text-xs font-medium text-gray-900 w-8'>
                                    {score}%
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className='px-6 py-4'>
                        <div className='text-sm text-gray-900'>
                          {interview.interviewDate === null ? (
                            <></>
                          ) : (
                            <div className='flex items-center space-x-2 mb-1'>
                              <Calendar className='h-4 w-4 text-gray-400' />
                              <span>{new Date(interview.interviewDate).toLocaleDateString()}</span>
                            </div>
                          )}
                          <div className='flex items-center space-x-2 mb-1'>
                            <Clock className='h-4 w-4 text-gray-400' />
                            <span>{interview.duration ?? 0} minutes</span>
                          </div>
                          {interview.appliedDate === null ? (
                            <></>
                          ) : (
                            <div className='text-xs text-gray-500 mt-2'>
                              Applied: {new Date(interview.appliedDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className='px-6 py-4'>
                        {interview?.recommendations && (
                          <div>
                            <span
                              className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border text-center ${getRecommendationColor(
                                interview?.recommendations?.recommendation ?? ''
                              )}`}
                            >
                              {interview.recommendations?.recommendation ?? ''}
                            </span>
                            <div className='text-xs text-gray-500 text-center mt-1 max-w-32'>
                              {interview.recommendations?.summary}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className='px-6 py-4'>
                        <div className='flex items-center space-x-2'>
                          {interview.hasRecording && (
                            <button
                              onClick={() =>
                                setViewingRecording({
                                  id: interview.id,
                                  name: interview.name,
                                })
                              }
                              className='text-purple-600 hover:text-purple-900 transition-colors'
                              title='View Recording'
                            >
                              <Video className='h-4 w-4' />
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedInterview(interview)}
                            className='text-blue-600 hover:text-blue-900 transition-colors'
                            title='View Details'
                          >
                            <Eye className='h-4 w-4' />
                          </button>
                          {interview?.resumeUrl && (
                            <button
                              onClick={() =>
                                handleDownloadResume(interview.resumeUrl, interview.name)
                              }
                              className='text-gray-600 hover:text-gray-900 transition-colors'
                              title='Download Resume'
                            >
                              <FileText className='h-4 w-4' />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              //  window.location.href = `mailto:candidate@example.com?subject=Interview Opportunity&body=Hi, we’d like to connect...`
                              window.location.href = `mailto:${interview.email}`;
                            }}
                            className='text-gray-600 hover:text-gray-900 transition-colors'
                            title='Contact Candidate'
                          >
                            <Mail className='h-4 w-4' />
                          </button>
                          {interview.linkedinUrl && (
                            <button
                              onClick={() => window.open(interview.linkedinUrl, '_blank')}
                              className='text-gray-600 hover:text-gray-900 transition-colors'
                              title='View LinkedIn'
                            >
                              <Linkedin className='h-4 w-4' />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedCandidates.length > 0 && (
          <div className='fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg border border-gray-200 p-4'>
            <div className='flex items-center space-x-4'>
              <span className='text-sm font-medium text-gray-700'>
                {selectedCandidates.length} candidate(s) selected
              </span>
              <div className='flex space-x-2'>
                <button className='bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm'>
                  Move to Next Round
                </button>
                <button className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm'>
                  Send Email
                </button>
                <button className='bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm'>
                  Export Selected
                </button>
                <button
                  onClick={() => setSelectedCandidates([])}
                  className='border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm'
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
