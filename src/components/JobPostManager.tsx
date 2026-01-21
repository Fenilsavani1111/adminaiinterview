import React, { Fragment, useState, useEffect } from "react";
import {
  ArrowLeft,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Users,
  Calendar,
  Briefcase,
  Share2,
  Copy,
  CheckCircle,
  Upload as UploadIcon,
  Send,
  X,
  AlertCircle,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { JobApplicationsList } from "./JobApplicationsList";
import { useJobPosts } from "../hooks/useJobPosts";
import { jobPostAPI, studentAPI, Student } from "../services/api";
import { JobInterviewListing } from "./JobInterviewListing";
import { StudentListManager } from "./StudentListManager";

export function JobPostManager() {
  const { state, dispatch } = useApp();
  const { jobPosts, loading, error, deleteJobPost } = useJobPosts();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [selectedJobForApplications, setSelectedJobForApplications] = useState<{
    id: string;
    title: string;
    company: string;
  } | null>(null);
  const [selectedJobForInterviews, setSelectedJobForInterviews] = useState<{
    id: string;
    title: string;
    company: string;
  } | null>(null);

  // Candidate List Modal State (renamed from Student List)
  const [candidateListModal, setCandidateListModal] = useState<{
    isOpen: boolean;
    jobId: string;
    jobTitle: string;
  }>({
    isOpen: false,
    jobId: "",
    jobTitle: "",
  });

  const [candidateCounts, setCandidateCounts] = useState<Record<string, number>>({});
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null);
  const phoneRegex = /^(?:\+91|91)?[6-9]\d{9}$/;

  const [shareModalData, setShareModalData] = useState<{
    isOpenModal: boolean;
    activeTab: "Email" | "Whatsapp" | "Linkedin" | "CandidateList";
    jobId: string;
    data: string;
    isValid: boolean;
    loading: boolean;
    jobToken: string;
    students: Student[];
    loadingStudents: boolean;
    emailMessage: string;
  }>({
    isOpenModal: false,
    activeTab: "Email",
    jobId: "",
    data: "",
    isValid: true,
    loading: false,
    jobToken: "",
    students: [],
    loadingStudents: false,
    emailMessage: "",
  });

  // Helper function to reset share modal
  const resetShareModal = () => {
    setShareModalData({
      isOpenModal: false,
      activeTab: "Email",
      jobId: "",
      data: "",
      isValid: true,
      loading: false,
      jobToken: "",
      students: [],
      loadingStudents: false,
      emailMessage: "",
    });
  };

  const processedJobPosts = jobPosts;

  // Load candidate counts for all job posts
  useEffect(() => {
    const loadCandidateCounts = async () => {
      const counts: Record<string, number> = {};
      for (const job of jobPosts) {
        try {
          const response = await studentAPI.getStudentCount(job.id);
          counts[job.id] = response.count || 0;
        } catch (err) {
          console.error(`Failed to fetch candidate count for job ${job.id}:`, err);
          counts[job.id] = 0;
        }
      }
      setCandidateCounts(counts);
    };

    if (jobPosts.length > 0) {
      loadCandidateCounts();
    }
  }, [jobPosts]);

  // Handle opening candidate list modal
  const handleOpenCandidateList = (jobId: string, jobTitle: string) => {
    setCandidateListModal({
      isOpen: true,
      jobId,
      jobTitle,
    });
  };

  // Handle closing candidate list modal and refresh count
  const handleCloseCandidateList = async () => {
    const jobId = candidateListModal.jobId;
    setCandidateListModal({
      isOpen: false,
      jobId: "",
      jobTitle: "",
    });

    // Refresh candidate count for the job
    if (jobId) {
      try {
        const response = await studentAPI.getStudentCount(jobId);
        setCandidateCounts(prev => ({
          ...prev,
          [jobId]: response.count || 0
        }));
      } catch (err) {
        console.error('Failed to refresh candidate count:', err);
      }
    }
  };

  // Load candidates when Candidate List tab is opened
  const loadCandidatesForJob = async (jobId: string) => {
    try {
      setShareModalData(prev => ({ ...prev, loadingStudents: true }));
      const response = await studentAPI.getStudentsByJobPost(jobId);
      setShareModalData(prev => ({
        ...prev,
        students: response.students || [],
        loadingStudents: false
      }));
    } catch (err) {
      console.error('Failed to load candidates:', err);
      setShareModalData(prev => ({
        ...prev,
        students: [],
        loadingStudents: false
      }));
    }
  };

  // Generate token when share modal opens
  const generateJobToken = async (jobId: string) => {
    try {
      console.log('🔑 Generating token for job:', jobId);
      const response = await jobPostAPI.generateTokenForJobInterviewLink(jobId);
      console.log('✅ Token response:', response);
      if (response?.token) {
        return response.token;
      }
      return null;
    } catch (err) {
      console.error('❌ Failed to generate token:', err);
      return null;
    }
  };

  // If viewing applications for a specific job, show the applications list
  if (selectedJobForApplications) {
    return (
      <JobApplicationsList
        jobId={selectedJobForApplications.id}
        jobTitle={selectedJobForApplications.title}
        company={selectedJobForApplications.company}
        onBack={() => setSelectedJobForApplications(null)}
      />
    );
  }

  // If viewing interviews for a specific job, show the interviews list
  if (selectedJobForInterviews) {
    return (
      <JobInterviewListing
        jobId={selectedJobForInterviews.id}
        jobTitle={selectedJobForInterviews.title}
        company={selectedJobForInterviews.company}
        onBack={() => setSelectedJobForInterviews(null)}
        tab="jobposts"
      />
    );
  }

  const filteredJobs = processedJobPosts.filter((job) => {
    const matchesSearch =
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.department?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || job.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "closed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      "full-time": "bg-blue-100 text-blue-800",
      "part-time": "bg-purple-100 text-purple-800",
      contract: "bg-orange-100 text-orange-800",
      internship: "bg-teal-100 text-teal-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  // share or open job post interview links
  const getJobLink = async (
    jobId: string,
    type: "open" | "whatsapp" | "linkedin" | "copy"
  ) => {
    try {
      if (type === "whatsapp") {
        if (shareModalData.data?.length <= 0) {
          alert("Please enter phone number.");
          return;
        }
      }
      let response = await jobPostAPI.generateTokenForJobInterviewLink(jobId);
      if (response?.token?.length > 0) {
        let interviewlink = `https://aiinterview.deepvox.ai/?token=${response?.token}`;
        if (type === "copy") {
          await navigator.clipboard.writeText(interviewlink);
          setCopiedUrl(jobId);
          setTimeout(() => setCopiedUrl(null), 2000);
        } else if (type === "open") {
          window.open(interviewlink, "_blank");
        } else if (type === "whatsapp") {
          setShareModalData({ ...shareModalData, loading: true });
          const whatsappURL = `https://wa.me/${shareModalData?.data}?text=${encodeURIComponent(
            `Hi! Here is a link for interview: ${interviewlink}`
          )}`;
          window.open(whatsappURL, "_blank");
          resetShareModal();
        } else if (type === "linkedin") {
          setShareModalData({ ...shareModalData, loading: true });
          const linkedinURL = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
            interviewlink
          )}`;
          window.open(linkedinURL, "_blank");
          resetShareModal();
        }
      }
    } catch (error) {
      console.log("Failed to open job Link:", error);
      alert("Failed to open job Link. Please try again.");
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this job post? This action cannot be undone."
      )
    ) {
      setDeletingJobId(jobId);
      try {
        await deleteJobPost(jobId);
      } catch (err) {
        console.error("Failed to delete job post:", err);
      } finally {
        setDeletingJobId(null);
      }
    }
  };

  const handleEditJob = (jobId: string) => {
    dispatch({ type: "SET_VIEW", payload: "edit-job" });
    const job = jobPosts.find((j) => j.id === jobId);
    if (job) {
      dispatch({ type: "SET_CURRENT_JOB_POST", payload: job });
    }
  };

  const handleViewJob = (jobId: string) => {
    dispatch({ type: "SET_VIEW", payload: "view-job" });
    const job = jobPosts.find((j) => j.id === jobId);
    if (job) {
      dispatch({ type: "SET_CURRENT_JOB_POST", payload: job });
    }
  };

  const handleSubmit = async () => {
    if (!shareModalData.data) {
      alert("Please enter an email address.");
      return;
    }
    try {
      setShareModalData({ ...shareModalData, loading: true });
      let emails = shareModalData.data?.split(",");
      await jobPostAPI.sendJobLink(shareModalData.jobId, emails);
      alert("Job link sent successfully!");
      resetShareModal();
    } catch (error) {
      console.log("Failed to send mail:", error);
      resetShareModal();
      alert("Failed to send job link. Please try again.");
    }
  };

  // Handle sending candidate list emails
  const handleSendCandidateEmails = async () => {
    if (shareModalData.students.length === 0) {
      alert("No candidates found to send emails.");
      return;
    }

    if (!window.confirm(`Send examination link to ${shareModalData.students.length} candidate(s)?`)) {
      return;
    }

    try {
      setShareModalData(prev => ({ ...prev, loading: true }));

      // Get the custom message template or use default
      const job = processedJobPosts.find((j) => j.id === shareModalData.jobId);
      const interviewLink = shareModalData.jobToken
        ? `https://aiinterview.deepvox.ai/?token=${shareModalData.jobToken}`
        : '';

      const messageTemplate = shareModalData.emailMessage || `Dear {studentName},

You have been invited to participate in an interview for the position of ${job?.title} at ${job?.company}.

Please use the examination link provided to access the interview. This link is unique to you and should not be shared with others.

Interview Link: ${interviewLink}

Please complete the interview at your earliest convenience. If you have any questions, please contact the HR department.

Best regards,
HR Team`;

      // Send emails with candidate data for personalization
      await jobPostAPI.sendStudentExamLink(
        shareModalData.jobId,
        shareModalData.students.map(s => s.email),
        messageTemplate,
        shareModalData.students.map(s => ({ name: s.name, email: s.email }))
      );

      alert(`Examination link sent successfully to ${shareModalData.students.length} candidate(s)!`);

      resetShareModal();
    } catch (error: any) {
      console.error("Failed to send candidate emails:", error);
      alert(error?.response?.data?.message || "Failed to send emails. Please try again.");
      setShareModalData(prev => ({ ...prev, loading: false }));
    }
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
                <span className="hidden sm:inline">Back to Dashboard</span>
              </button>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Job Posts</h1>
            </div>
            <button
              onClick={() => dispatch({ type: "SET_VIEW", payload: "create-job" })}
              className="flex items-center space-x-2 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span className="hidden sm:inline">Create Job Post</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Jobs</p>
                <p className="text-3xl font-bold text-gray-900">{processedJobPosts.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Jobs</p>
                <p className="text-3xl font-bold text-gray-900">
                  {processedJobPosts.filter((job) => job.status === "draft").length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Applicants</p>
                <p className="text-3xl font-bold text-gray-900">
                  {processedJobPosts.reduce((sum, job) => sum + (job.applicants || 0), 0)}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Interviews</p>
                <p className="text-3xl font-bold text-gray-900">
                  {processedJobPosts.reduce((sum, job) => sum + (job.interviews || 0), 0)}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Eye className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search job posts..."
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
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="draft">Draft</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading job posts...</span>
          </div>
        )}

        {/* Job Posts Table - Desktop */}
        {!loading && (
          <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type & Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recording
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applicants
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Interviews
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Share URL
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{job.title}</div>
                          <div className="text-sm text-gray-500">
                            {job.company} • {job.department}
                          </div>
                          <div className="text-sm text-gray-500">
                            {Array.isArray(job.location)
                              ? job.location.join(", ")
                              : job.location || "Not specified"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(job.type)}`}>
                            {job.type.charAt(0).toUpperCase() + job.type.slice(1).replace("-", " ")}
                          </span>
                          <br />
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(job.status)}`}>
                            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${job.enableVideoRecording
                              ? "bg-indigo-100 text-indigo-800"
                              : "bg-gray-100 text-gray-700"
                            }`}
                        >
                          {job.enableVideoRecording ? "Video + Audio" : "Audio Only"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() =>
                            setSelectedJobForApplications({
                              id: job.id,
                              title: job.title,
                              company: job.company,
                            })
                          }
                          className="text-blue-600 hover:text-blue-800 font-medium underline cursor-pointer"
                        >
                          {job.applicants}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() =>
                            setSelectedJobForInterviews({
                              id: job.id,
                              title: job.title,
                              company: job.company,
                            })
                          }
                          className="text-purple-600 hover:text-purple-800 font-medium underline cursor-pointer"
                        >
                          {job.interviews}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col space-y-2">
                          {/* Copy URL / Share buttons */}
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => getJobLink(job.id, "copy")}
                              className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-xs"
                            >
                              {copiedUrl === job.id ? (
                                <>
                                  <CheckCircle className="h-3 w-3" />
                                  <span>Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3 w-3" />
                                  <span>Copy URL</span>
                                </>
                              )}
                            </button>
                            <button
                              onClick={async () => {
                                // Open modal with loading state
                                setShareModalData({
                                  isOpenModal: true,
                                  activeTab: "Email",
                                  jobId: job.id,
                                  data: "",
                                  isValid: true,
                                  loading: false,
                                  jobToken: "",
                                  students: [],
                                  loadingStudents: false,
                                  emailMessage: "",
                                });

                                // Generate token and load candidates in background
                                const token = await generateJobToken(job.id);
                                await loadCandidatesForJob(job.id);

                                // Update with token
                                if (token) {
                                  setShareModalData(prev => ({
                                    ...prev,
                                    jobToken: token
                                  }));
                                }
                              }}
                              title="Share"
                              className="text-gray-600 hover:text-gray-900"
                            >
                              <Share2 className="h-3 w-3" />
                            </button>
                          </div>

                          {/* Candidate List Upload Button */}
                          <button
                            onClick={() => handleOpenCandidateList(job.id, job.title)}
                            className="flex items-center space-x-1 text-purple-600 hover:text-purple-700 text-xs font-medium"
                          >
                            <UploadIcon className="h-3 w-3" />
                            <span>
                              {candidateCounts[job.id] > 0
                                ? `${candidateCounts[job.id]} Candidate${candidateCounts[job.id] !== 1 ? 's' : ''}`
                                : 'Upload List'}
                            </span>
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewJob(job.id)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEditJob(job.id)}
                            className="text-gray-600 hover:text-gray-900 transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteJob(job.id)}
                            disabled={deletingJobId === job.id}
                            className="text-red-600 hover:text-red-900 transition-colors disabled:opacity-50"
                          >
                            {deletingJobId === job.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Job Posts List - Mobile */}
        {!loading && (
          <div className="md:hidden space-y-4">
            {filteredJobs.map(job => (
              <div key={job.id} className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="text-md font-bold text-gray-900">{job.title}</div>
                    <div className="text-sm text-gray-600">{job.company} • {job.department}</div>
                    <div className="text-sm text-gray-500 mt-1">{job.location}</div>
                  </div>
                  <div className="flex items-center space-x-2 ml-2">
                    <button onClick={() => handleViewJob(job.id)} className="p-2 text-blue-600"><Eye className="h-5 w-5" /></button>
                    <button onClick={() => handleEditJob(job.id)} className="p-2 text-gray-600"><Edit className="h-5 w-5" /></button>
                    <button onClick={() => handleDeleteJob(job.id)} disabled={deletingJobId === job.id} className="p-2 text-red-600 disabled:opacity-50">
                      {deletingJobId === job.id ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                      ) : (
                        <Trash2 className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(job.type)}`}>
                      {job.type.charAt(0).toUpperCase() + job.type.slice(1).replace("-", " ")}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(job.status)}`}>
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 text-sm text-center">
                  <button
                    onClick={() => setSelectedJobForApplications({ id: job.id, title: job.title, company: job.company })}
                    className="bg-gray-50 p-2 rounded-lg"
                  >
                    <div className="font-bold text-blue-600">{job.applicants}</div>
                    <div className="text-xs text-gray-600">Applicants</div>
                  </button>
                  <button
                    onClick={() => setSelectedJobForInterviews({ id: job.id, title: job.title, company: job.company })}
                    className="bg-gray-50 p-2 rounded-lg"
                  >
                    <div className="font-bold text-purple-600">{job.interviews}</div>
                    <div className="text-xs text-gray-600">Interviews</div>
                  </button>
                </div>

                <div className="mt-4 border-t pt-4 flex flex-col space-y-3">
                  <button
                    onClick={() => getJobLink(job.id, "copy")}
                    className="flex items-center justify-center space-x-2 text-blue-600 hover:text-blue-700 text-sm"
                  >
                    {copiedUrl === job.id ? (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        <span>Copied Interview URL!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span>Copy Interview URL</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleOpenCandidateList(job.id, job.title)}
                    className="flex items-center justify-center space-x-2 text-purple-600 hover:text-purple-700 text-sm font-medium"
                  >
                    <UploadIcon className="h-4 w-4" />
                    <span>
                      {candidateCounts[job.id] > 0
                        ? `${candidateCounts[job.id]} Candidate${candidateCounts[job.id] !== 1 ? 's' : ''}`
                        : 'Upload Candidate List'}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No job posts found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterStatus !== "all"
                ? "Try adjusting your search or filter criteria."
                : "Get started by creating your first job post."}
            </p>
            {!searchTerm && filterStatus === "all" && (
              <div className="mt-6">
                <button
                  onClick={() => dispatch({ type: "SET_VIEW", payload: "create-job" })}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Job Post
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Candidate List Manager Modal */}
      <StudentListManager
        jobPostId={candidateListModal.jobId}
        jobTitle={candidateListModal.jobTitle}
        isOpen={candidateListModal.isOpen}
        onClose={handleCloseCandidateList}
      />

      {/* Share Modal - FIXED TABS */}
      {shareModalData.isOpenModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl shadow-lg max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center px-4 py-3 border-b">
              <h2 className="text-lg font-bold">Share Job Post</h2>
              <button
                onClick={resetShareModal}
                className="text-gray-500 hover:text-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* FIXED Share Tabs - Now properly visible */}
            <div className="flex border-b bg-gray-50">
              {[
                { id: "Email", label: "Email" },
                { id: "Whatsapp", label: "WhatsApp" },
                { id: "Linkedin", label: "LinkedIn" },
                { id: "CandidateList", label: "Candidate List" }
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={`flex-1 py-3 px-3 text-sm font-medium transition-all ${shareModalData.activeTab === tab.id
                      ? "border-b-2 border-blue-600 text-blue-600 bg-white"
                      : "text-gray-600 hover:text-blue-600 hover:bg-gray-100"
                    }`}
                  onClick={() => {
                    setShareModalData({
                      ...shareModalData,
                      activeTab: tab.id as any,
                    });
                    if (tab.id === "CandidateList") {
                      loadCandidatesForJob(shareModalData.jobId);
                    }
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-4 space-y-4 overflow-y-auto flex-1">
              {shareModalData.activeTab === "Email" && (
                <Fragment>
                  {(() => {
                    const job = processedJobPosts.find((j) => j.id === shareModalData.jobId);
                    if (!job) return null;

                    return (
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900">{job.title}</h4>
                          <p className="text-sm text-gray-600">{job.company} • {job.location}</p>
                        </div>
                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-gray-700">Email *</label>
                          <input
                            type="text"
                            value={shareModalData.data}
                            onChange={(e) => {
                              const value = e.target.value;
                              setShareModalData({
                                ...shareModalData,
                                data: value,
                              });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Example@gmail.com"
                          />
                          <p className="text-gray-500 text-sm">
                            Note: Add emails separated by commas (e.g., user1@example.com, user2@example.com)
                          </p>
                        </div>
                        {shareModalData.loading ? (
                          <div className="flex justify-center mt-4">
                            <div className="h-6 w-6 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                              onClick={handleSubmit}
                              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Submit
                            </button>
                            <button
                              onClick={resetShareModal}
                              className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              Close
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </Fragment>
              )}

              {shareModalData.activeTab === "Whatsapp" && (
                <Fragment>
                  {(() => {
                    const job = processedJobPosts.find((j) => j.id === shareModalData.jobId);
                    if (!job) return null;

                    return (
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900">{job.title}</h4>
                          <p className="text-sm text-gray-600">{job.company} • {job.location}</p>
                        </div>
                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-gray-700">Phone Number *</label>
                          <input
                            type="text"
                            value={shareModalData.data}
                            onChange={(e) => {
                              const value = e.target.value;
                              setShareModalData({
                                ...shareModalData,
                                data: value,
                                isValid: phoneRegex.test(value),
                              });
                            }}
                            maxLength={10}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter Mobile number"
                          />
                          {!shareModalData.isValid && (
                            <p className="text-red-500 text-sm">Please enter valid phone number</p>
                          )}
                        </div>
                        {shareModalData.loading ? (
                          <div className="flex justify-center mt-4">
                            <div className="h-6 w-6 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                              onClick={() => {
                                getJobLink(shareModalData.jobId, "whatsapp");
                              }}
                              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Submit
                            </button>
                            <button
                              onClick={resetShareModal}
                              className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              Close
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </Fragment>
              )}

              {shareModalData.activeTab === "Linkedin" && (
                <Fragment>
                  {(() => {
                    const job = processedJobPosts.find((j) => j.id === shareModalData.jobId);
                    if (!job) return null;

                    return (
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900">{job.title}</h4>
                          <p className="text-sm text-gray-600">{job.company} • {job.location}</p>
                        </div>
                        {shareModalData.loading ? (
                          <div className="flex justify-center mt-4">
                            <div className="h-6 w-6 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                              onClick={() => {
                                getJobLink(shareModalData.jobId, "linkedin");
                              }}
                              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Submit
                            </button>
                            <button
                              onClick={resetShareModal}
                              className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              Close
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </Fragment>
              )}

              {/* Candidate List Tab */}
              {shareModalData.activeTab === "CandidateList" && (
                <div className="space-y-4">
                  {(() => {
                    const job = processedJobPosts.find((j) => j.id === shareModalData.jobId);
                    if (!job) return null;

                    const interviewLink = shareModalData.jobToken
                      ? `https://aiinterview.deepvox.ai/?token=${shareModalData.jobToken}`
                      : 'Loading token...';

                    return (
                      <>
                        {/* Job Details */}
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                          <h4 className="font-bold text-gray-900 text-lg">{job.title}</h4>
                          <p className="text-sm text-gray-700 mt-1">{job.company} • {job.location}</p>
                          <div className="mt-3 pt-3 border-t border-blue-200">
                            <p className="text-xs font-medium text-gray-600 mb-1">Interview Link:</p>
                            <div className="flex items-center space-x-2">
                              {shareModalData.jobToken ? (
                                <>
                                  <code className="flex-1 text-xs bg-white px-2 py-1 rounded border border-gray-300 overflow-x-auto">
                                    {interviewLink}
                                  </code>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(interviewLink);
                                      alert('Link copied!');
                                    }}
                                    className="text-blue-600 hover:text-blue-700"
                                    title="Copy link"
                                  >
                                    <Copy className="h-4 w-4" />
                                  </button>
                                </>
                              ) : (
                                <div className="flex items-center space-x-2 text-gray-500">
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                  <span className="text-xs">Generating link...</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Email Description - Editable */}
                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                          <h5 className="font-semibold text-gray-900 mb-2 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-2 text-yellow-600" />
                            Email Description (Editable)
                          </h5>
                          <textarea
                            value={shareModalData.emailMessage || `Dear {studentName},

You have been invited to participate in an interview for the position of ${job.title} at ${job.company}.

Please use the examination link provided to access the interview. This link is unique to you and should not be shared with others.

Interview Link: ${interviewLink}

Please complete the interview at your earliest convenience. If you have any questions, please contact the HR department.

Best regards,
HR Team`}
                            onChange={(e) => setShareModalData(prev => ({ ...prev, emailMessage: e.target.value }))}
                            className="w-full min-h-[300px] px-3 py-2 text-sm text-gray-700 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-y"
                            placeholder="Enter email message..."
                          />
                          <div className="mt-2 space-y-1">
                            <p className="text-xs text-gray-600">
                              ℹ️ You can edit this message before sending. Use <code className="bg-gray-200 px-1 rounded">{'{studentName}'}</code> to personalize with each candidate's name.
                            </p>
                            <p className="text-xs text-blue-600">
                              Example: "Dear {'{studentName}'}" will become "Dear John" for each candidate.
                            </p>
                          </div>
                        </div>

                        {/* Candidate List */}
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                            <h5 className="font-semibold text-gray-900 flex items-center">
                              <Users className="h-4 w-4 mr-2" />
                              Candidate List ({shareModalData.students.length})
                            </h5>
                          </div>

                          {shareModalData.loadingStudents ? (
                            <div className="flex justify-center items-center py-8">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                              <span className="ml-3 text-gray-600 text-sm">Loading candidates...</span>
                            </div>
                          ) : shareModalData.students.length === 0 ? (
                            <div className="text-center py-8">
                              <Users className="mx-auto h-8 w-8 text-gray-300" />
                              <p className="mt-2 text-sm text-gray-500">No candidates uploaded yet</p>
                              <p className="text-xs text-gray-400 mt-1">Upload candidate list to send exam links</p>
                            </div>
                          ) : (
                            <div className="max-h-64 overflow-y-auto">
                              <table className="w-full">
                                <thead className="bg-gray-50 sticky top-0">
                                  <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">#</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Name</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Email</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Phone</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                  {shareModalData.students.map((student, index) => (
                                    <tr key={student.id || index} className="hover:bg-gray-50">
                                      <td className="px-4 py-2 text-sm text-gray-500">{index + 1}</td>
                                      <td className="px-4 py-2 text-sm text-gray-900">{student.name}</td>
                                      <td className="px-4 py-2 text-sm text-gray-600">{student.email}</td>
                                      <td className="px-4 py-2 text-sm text-gray-600">{student.phoneNumber || student.mobile}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        {shareModalData.loading ? (
                          <div className="flex justify-center py-4">
                            <div className="h-6 w-6 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                              onClick={handleSendCandidateEmails}
                              disabled={shareModalData.students.length === 0}
                              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                            >
                              <Send className="h-4 w-4" />
                              <span>Send to {shareModalData.students.length} Candidate{shareModalData.students.length !== 1 ? 's' : ''}</span>
                            </button>
                            <button
                              onClick={resetShareModal}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}