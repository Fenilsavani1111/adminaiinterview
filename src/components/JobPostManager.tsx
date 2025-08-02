import React, { Fragment, useState } from "react";
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Users,
  Calendar,
  Briefcase,
  Share2,
  Copy,
  Mail,
  CheckCircle,
  Linkedin,
  Link,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { JobApplicationsList } from "./JobApplicationsList";
import { useJobPosts } from "../hooks/useJobPosts";
import { jobPostAPI } from "../services/api";
import { JobInterviewListing } from "./JobInterviewListing";

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
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null);
  const phoneRegex = /^(?:\+91|91)?[6-9]\d{9}$/;
  const [shareModalData, setShareModalData] = useState<{
    isOpenModal: boolean;
    activeTab: "Email" | "Whatsapp" | "Linkedin" | "Monstar";
    jobId: string;
    data: string;
    isValid: boolean;
    loading: boolean;
  }>({
    isOpenModal: false,
    activeTab: "Email",
    jobId: "",
    data: "",
    isValid: true,
    loading: false,
  });

  // Add dummy values for missing fields from API
  const processedJobPosts = jobPosts;
  // .map((job) => ({
  //   ...job,
  //   // Add dummy values for missing fields
  //   applicants: job.applicants,
  //   interviews: job.interviews,
  //   shareableUrl: job.shareableUrl || `${window.location.origin}/job/${job.id}`,
  //   department: job.department || "General",
  //   experience: job.experience || "mid",
  //   type: job.type || "full-time",
  //   status: job.status || "active",
  //   createdAt: job.createdAt || new Date(),
  //   updatedAt: job.updatedAt || new Date(),
  //   createdBy: job.createdBy || "admin",
  // }));

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

  const copyToClipboard = async (url: string, jobId: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(jobId);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  // share or open job post interview links
  const getJobLink = async (
    jobId: string,
    type: "open" | "whatsapp" | "linkedin" | "monstar" | "copy"
  ) => {
    try {
      if (type === "whatsapp") {
        if (shareModalData.data?.length <= 0) {
          alert("Please enter phone number.");
          return;
        }
      }
      // generate job post token interview link to send
      let response = await jobPostAPI.generateTokenForJobInterviewLink(jobId);
      if (response?.token?.length > 0) {
        let interviewlink = `https://aiinterview.deepvox.ai/?token=${response?.token}`;
        // let interviewlink = `http://localhost:5173/?token=${response?.token}`;
        if (type === "copy") {
          await navigator.clipboard.writeText(interviewlink);
          setCopiedUrl(jobId);
          setTimeout(() => setCopiedUrl(null), 2000);
        } else if (type === "open") {
          // open link
          window.open(interviewlink, "_blank");
        } else if (type === "whatsapp") {
          setShareModalData({
            ...shareModalData,
            loading: true,
          });
          // share job interview link in whatsapp
          const whatsappURL = `https://wa.me/${
            shareModalData?.data
          }?text=${encodeURIComponent(
            `Hi! Here is a link for interview: ${interviewlink}`
          )}`;
          window.open(whatsappURL, "_blank");
          setShareModalData({
            isOpenModal: false,
            activeTab: "Email",
            jobId: "",
            data: "",
            isValid: true,
            loading: false,
          });
        } else if (type === "linkedin") {
          setShareModalData({
            ...shareModalData,
            loading: true,
          });
          // share job interview link in linkedin as post
          const linkedinURL = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
            interviewlink
          )}`;
          window.open(linkedinURL, "_blank");
          setShareModalData({
            isOpenModal: false,
            activeTab: "Email",
            jobId: "",
            data: "",
            isValid: true,
            loading: false,
          });
        }
      }
    } catch (error) {
      console.log("Failed to open job Link:", error);
      alert("Failed to open job Link. Please try again.");
    }
  };

  const shareViaEmail = (job: any) => {
    const subject = encodeURIComponent(
      `Job Opportunity: ${job.title} at ${job.company}`
    );
    const body = encodeURIComponent(`Hi,

I wanted to share this exciting job opportunity with you:

Position: ${job.title}
Company: ${job.company}
Location: ${job.location}

This position includes an AI-powered interview process that provides immediate feedback and evaluation.

Apply here: ${job.shareableUrl}

Best regards`);

    window.open(`mailto:?subject=${subject}&body=${body}`);
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
    // Navigate to edit job post view
    dispatch({ type: "SET_VIEW", payload: "edit-job" });
    const job = jobPosts.find((j) => j.id === jobId);
    if (job) {
      dispatch({ type: "SET_CURRENT_JOB_POST", payload: job });
    }
  };
  const handleViewJob = (jobId: string) => {
    // Navigate to edit job post view
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
      setShareModalData({
        ...shareModalData,
        loading: true,
      });
      let emails = shareModalData.data?.split(",");
      await jobPostAPI.sendJobLink(shareModalData.jobId, emails);
      alert("Job link sent successfully!");
      setShareModalData({
        isOpenModal: false,
        activeTab: "Email",
        jobId: "",
        data: "",
        isValid: true,
        loading: false,
      });
    } catch (error) {
      console.log("Failed to send mail:", error);
      setShareModalData({
        isOpenModal: false,
        activeTab: "Email",
        jobId: "",
        data: "",
        isValid: true,
        loading: false,
      });
      alert("Failed to send job link. Please try again.");
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
                <span>Back to Dashboard</span>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Job Posts</h1>
            </div>
            <button
              onClick={() =>
                dispatch({ type: "SET_VIEW", payload: "create-job" })
              }
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Create Job Post</span>
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
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
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
                <p className="text-3xl font-bold text-gray-900">
                  {processedJobPosts.length}
                </p>
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
                  {
                    processedJobPosts.filter((job) => job.status === "draft")
                      .length
                  }
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
                  {processedJobPosts.reduce(
                    (sum, job) => sum + (job.applicants || 0),
                    0
                  )}
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
                  {processedJobPosts.reduce(
                    (sum, job) => sum + (job.interviews || 0),
                    0
                  )}
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

        {/* Job Posts Table */}
        {!loading && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
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
                          <div className="text-sm font-medium text-gray-900">
                            {job.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {job.company} • {job.department}
                          </div>
                          <div className="text-sm text-gray-500">
                            {job.location}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(
                              job.type
                            )}`}
                          >
                            {job.type.charAt(0).toUpperCase() +
                              job.type.slice(1).replace("-", " ")}
                          </span>
                          <br />
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              job.status
                            )}`}
                          >
                            {job.status.charAt(0).toUpperCase() +
                              job.status.slice(1)}
                          </span>
                        </div>
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
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => getJobLink(job.id, "copy")}
                            className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
                          >
                            {copiedUrl === job.id ? (
                              <>
                                <CheckCircle className="h-4 w-4" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4" />
                                <span>Copy URL</span>
                              </>
                            )}
                          </button>
                          {/* <button
                            onClick={() => {
                              getJobLink(job.id, "open");
                            }}
                            title="Open Link"
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <Link className="h-4 w-4" />
                          </button> */}
                          <button
                            onClick={() => {
                              setShareModalData({
                                isOpenModal: true,
                                activeTab: "Email",
                                jobId: job.id,
                                data: "",
                                isValid: true,
                                loading: false,
                              });
                            }}
                            title="Share"
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <Share2 className="h-4 w-4" />
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

        {/* Empty State */}
        {!loading && filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No job posts found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterStatus !== "all"
                ? "Try adjusting your search or filter criteria."
                : "Get started by creating your first job post."}
            </p>
            {!searchTerm && filterStatus === "all" && (
              <div className="mt-6">
                <button
                  onClick={() =>
                    dispatch({ type: "SET_VIEW", payload: "create-job" })
                  }
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

      {/* Share Modal */}
      {shareModalData.isOpenModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md shadow-lg">
            <div className="flex justify-between items-center px-4 py-2 border-b">
              <h2 className="text-lg font-bold">Share Job Post</h2>
              <button
                onClick={() => {
                  setShareModalData({
                    isOpenModal: false,
                    activeTab: "Email",
                    jobId: "",
                    data: "",
                    isValid: true,
                    loading: false,
                  });
                }}
                className="text-gray-500 hover:text-gray-800"
              >
                ✕
              </button>
            </div>

            {/* Share Tabs */}
            <div className="flex border-b">
              {/* {["Email", "Whatsapp", "Linkedin", "Monstar"].map((tab: any) => ( */}
              {["Email", "Whatsapp", "Linkedin"].map((tab: any) => (
                <button
                  key={tab}
                  className={`flex-1 py-2 text-sm font-medium ${
                    shareModalData.activeTab === tab
                      ? "border-b-2 border-blue-600 text-blue-600"
                      : "text-gray-700 hover:text-blue-700"
                  }`}
                  onClick={() => {
                    setShareModalData({
                      ...shareModalData,
                      activeTab: tab,
                    });
                  }}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-4 space-y-5">
              {shareModalData.activeTab === "Email" && (
                <Fragment>
                  {(() => {
                    const job = processedJobPosts.find(
                      (j) => j.id === shareModalData.jobId
                    );
                    if (!job) return null;

                    return (
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900">
                            {job.title}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {job.company} • {job.location}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-gray-700">
                            Email *
                          </label>
                          <input
                            type="text"
                            value={shareModalData.data}
                            onChange={(e) => {
                              const value = e.target.value;
                              setShareModalData({
                                ...shareModalData,
                                data: value,
                                // isValid: phoneRegex.test(value),
                              });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Example@gmail.com"
                          />
                          <p className="text-gray-500 text-sm">
                            Note: Add emails separated by commas (e.g.,
                            user1@example.com, user2@example.com)
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
                              onClick={() => {
                                setShareModalData({
                                  isOpenModal: false,
                                  activeTab: "Email",
                                  jobId: "",
                                  data: "",
                                  isValid: true,
                                  loading: false,
                                });
                              }}
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
                    const job = processedJobPosts.find(
                      (j) => j.id === shareModalData.jobId
                    );
                    if (!job) return null;

                    return (
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900">
                            {job.title}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {job.company} • {job.location}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-gray-700">
                            Phone Number *
                          </label>
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
                            <p className="text-red-500 text-sm">
                              Please enter valid phone number
                            </p>
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
                              onClick={() => {
                                setShareModalData({
                                  isOpenModal: false,
                                  activeTab: "Email",
                                  jobId: "",
                                  data: "",
                                  isValid: true,
                                  loading: false,
                                });
                              }}
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
                    const job = processedJobPosts.find(
                      (j) => j.id === shareModalData.jobId
                    );
                    if (!job) return null;

                    return (
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900">
                            {job.title}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {job.company} • {job.location}
                          </p>
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
                              onClick={() => {
                                setShareModalData({
                                  isOpenModal: false,
                                  activeTab: "Email",
                                  jobId: "",
                                  data: "",
                                  isValid: true,
                                  loading: false,
                                });
                              }}
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
              {/* {shareModalData.activeTab === "Monstar" && (
                <Fragment>
                  {(() => {
                    const job = processedJobPosts.find(
                      (j) => j.id === shareModalData.jobId
                    );
                    if (!job) return null;

                    return (
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900">
                            {job.title}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {job.company} • {job.location}
                          </p>
                        </div>
                        {shareModalData.loading ? (
                          <div className="flex justify-center mt-4">
                            <div className="h-6 w-6 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                              onClick={() => {
                                getJobLink(shareModalData.jobId, "monstar");
                              }}
                              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Submit
                            </button>
                            <button
                              onClick={() => {
                                setShareModalData({
                                  isOpenModal: false,
                                  activeTab: "Email",
                                  jobId: "",
                                  data: "",
                                  isValid: true,
                                  loading: false,
                                });
                              }}
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
              )} */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
