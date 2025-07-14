import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { InterviewQuestion, JobPost } from '../types';
import { useJobPosts } from '../hooks/useJobPosts';
import { ArrowLeft, Upload, Wand2, Plus, Trash2, Edit, Save } from 'lucide-react';
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min?url";

export function EditJobPost() {
  const { state, dispatch } = useApp();
  const [step, setStep] = useState(1);
  const { updateJobPost, loading, error, getJobPostOpenaiQuestions, getJobPostResponsibilityFromJD, getJobDescriptionFromPDf } = useJobPosts();
  const [jobPost, setJobPost] = useState<JobPost | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    department: '',
    location: '',
    type: 'full-time' as 'full-time' | 'part-time' | 'contract' | 'internship',
    experience: '',
    description: '',
    requirements: [''],
    responsibilities: [''],
    skills: [''],
    salaryMin: '',
    salaryMax: '',
    currency: 'USD'
  });
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<InterviewQuestion | undefined>(undefined);
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    type: 'behavioral' as const,
    expectedDuration: 120,
    difficulty: 'medium' as const,
    category: '',
    suggestedAnswers: [''],
    evaluationCriteria: [''],
    isRequired: true
  });

  const generateQuestionsFromJD = async () => {
    // Simulate AI question generation based on job description    
    const jobPostData: Omit<JobPost, "id" | "createdAt" | "updatedAt" | "questions" | "status" | "createdBy"> = {
      title: formData.title,
      company: formData.company,
      department: formData.department,
      location: formData.location,
      type: formData.type,
      experience: formData.experience,
      description: formData.description,
      requirements: formData.requirements.filter(r => r.trim()),
      responsibilities: formData.responsibilities.filter(r => r.trim()),
      skills: formData.skills.filter(s => s.trim()),
      salary: formData.salaryMin && formData.salaryMax ? {
        min: parseInt(formData.salaryMin),
        max: parseInt(formData.salaryMax),
        currency: formData.currency
      } : undefined,
    };
    const generatedQuestions: InterviewQuestion[] = await getJobPostOpenaiQuestions(jobPostData);
    setQuestions(generatedQuestions);
  };

  const addQuestion = () => {
    const question: InterviewQuestion = {
      id: Date.now().toString(),
      ...newQuestion,
      order: questions.length + 1
    };
    setQuestions([...questions, question]);
    setNewQuestion({
      question: '',
      type: 'behavioral',
      expectedDuration: 120,
      difficulty: 'medium',
      category: '',
      suggestedAnswers: [''],
      evaluationCriteria: [''],
      isRequired: true
    });
  };

  const updateQuestion = (id: string, updatedQuestion: Partial<InterviewQuestion>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updatedQuestion } : q));
    setEditingQuestion(undefined);
  };

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const addArrayField = (field: 'requirements' | 'responsibilities' | 'skills') => {
    setFormData({
      ...formData,
      [field]: [...formData[field], '']
    });
  };

  const updateArrayField = (field: 'requirements' | 'responsibilities' | 'skills', index: number, value: string) => {
    const updated = [...formData[field]];
    updated[index] = value;
    setFormData({ ...formData, [field]: updated });
  };

  const removeArrayField = (field: 'requirements' | 'responsibilities' | 'skills', index: number) => {
    setFormData({
      ...formData,
      [field]: formData[field].filter((_, i) => i !== index)
    });
  };

  const extractTextFromPdf = async (file: File): Promise<void> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      fullText += content.items.map(item => ("str" in item ? item.str : "")).join(" ") + "\n";
    }
    let description: string = await getJobDescriptionFromPDf(fullText);
    setFormData({ ...formData, description: description })
  };

  // Load job post data when component mounts
  useEffect(() => {
    if (state.currentJobPost) {
      const job = state.currentJobPost;
      setJobPost(job);

      // Populate form data
      setFormData({
        title: job.title,
        company: job.company,
        department: job.department,
        location: job.location,
        type: job.type,
        experience: job.experience,
        description: job.description,
        requirements: job.requirements.length > 0 ? job.requirements : [''],
        responsibilities: job.responsibilities.length > 0 ? job.responsibilities : [''],
        skills: job.skills.length > 0 ? job.skills : [''],
        salaryMin: job.salary?.min?.toString() || '',
        salaryMax: job.salary?.max?.toString() || '',
        currency: job.salary?.currency || 'USD'
      });
      setQuestions([...job.questions ?? []])
    }
  }, [state.currentJobPost]);

  const handleSubmit = async () => {
    if (!jobPost) return;

    try {
      const jobPostData = {
        title: formData.title,
        company: formData.company,
        department: formData.department,
        location: formData.location,
        type: formData.type,
        experience: formData.experience,
        description: formData.description,
        requirements: formData.requirements.filter(r => r.trim()),
        responsibilities: formData.responsibilities.filter(r => r.trim()),
        skills: formData.skills.filter(s => s.trim()),
        salary: formData.salaryMin && formData.salaryMax ? {
          min: parseInt(formData.salaryMin),
          max: parseInt(formData.salaryMax),
          currency: formData.currency
        } : undefined,
        status: jobPost.status // Keep the current status
      };

      await updateJobPost(jobPost.id, jobPostData);
      dispatch({ type: 'SET_VIEW', payload: 'job-posts' });
    } catch (err) {
      console.error('Failed to update job post:', err);
    }
  };

  if (!jobPost) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading job post...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => dispatch({ type: 'SET_VIEW', payload: 'job-posts' })}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Job Posts</span>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Update Job Post</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Step {step} of 3</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Job Details</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Senior Software Engineer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company *
                </label>
                <input
                  type="text"
                  required
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Company name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department *
                </label>
                <input
                  type="text"
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Engineering, Product, Marketing"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., San Francisco, CA or Remote"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience Level *
                </label>
                <select
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select experience level</option>
                  <option value="entry">Entry Level (0-1 years)</option>
                  <option value="junior">Junior (2-3 years)</option>
                  <option value="mid">Mid Level (4-6 years)</option>
                  <option value="senior">Senior (7-10 years)</option>
                  <option value="lead">Lead/Manager (10+ years)</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Description *
              </label>
              <div className="mb-4">
                <div className="flex items-center space-x-4 mb-2">
                  <label htmlFor="file-upload" className="flex items-center space-x-2 cursor-pointer text-blue-600 hover:text-blue-700 text-sm">
                    <Upload className="h-4 w-4" />
                    <span>Upload JD File</span>
                  </label>
                  <input id="file-upload" type="file" accept=".pdf,application/pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    className='hidden' onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        extractTextFromPdf(file);
                      }
                    }} />
                  <span className="text-gray-400">or</span>
                  <span className="text-sm text-gray-600">Type/paste description below</span>
                </div>
              </div>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={6}
                placeholder="Describe the role, responsibilities, and what makes this position exciting..."
              />
            </div>

            <div className="flex justify-end mt-8">
              <button
                onClick={async () => {
                  const generatedresponsibilities: string[] = await getJobPostResponsibilityFromJD(formData.description);
                  setFormData({ ...formData, responsibilities: generatedresponsibilities })
                  setStep(2);
                }}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                disabled={!formData.title || !formData.company || !formData.description}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Requirements & Details</h2>

            {/* Requirements */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Requirements
              </label>
              {formData.requirements.map((req, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={req}
                    onChange={(e) => updateArrayField('requirements', index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter requirement"
                  />
                  <button
                    onClick={() => removeArrayField('requirements', index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => addArrayField('requirements')}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Add Requirement</span>
              </button>
            </div>

            {/* Responsibilities */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Key Responsibilities
              </label>
              {formData.responsibilities.map((resp, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={resp}
                    onChange={(e) => updateArrayField('responsibilities', index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter responsibility"
                  />
                  <button
                    onClick={() => removeArrayField('responsibilities', index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => addArrayField('responsibilities')}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Add Responsibility</span>
              </button>
            </div>

            {/* Skills */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Required Skills
              </label>
              {formData.skills.map((skill, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={skill}
                    onChange={(e) => updateArrayField('skills', index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter skill"
                  />
                  <button
                    onClick={() => removeArrayField('skills', index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => addArrayField('skills')}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Add Skill</span>
              </button>
            </div>

            {/* Salary */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Salary Range (Optional)
              </label>
              <div className="grid grid-cols-3 gap-4">
                <input
                  type="number"
                  value={formData.salaryMin}
                  onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Min salary"
                />
                <input
                  type="number"
                  value={formData.salaryMax}
                  onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Max salary"
                />
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8">
            {/* AI Question Generation */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Interview Questions</h2>
                <button
                  onClick={generateQuestionsFromJD}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Wand2 className="h-4 w-4" />
                  <span>Generate from JD</span>
                </button>
              </div>

              {questions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No questions added yet. Generate questions from job description or add manually.</p>
                </div>
              )}

              {/* Questions List */}
              <div className="space-y-4 mb-8">
                {questions.map((question) => (
                  <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                    {editingQuestion?.id === question.id ?
                      <div className="">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Update Question</h3>
                        <div className="space-y-4">
                          <textarea
                            value={editingQuestion.question}
                            onChange={(e) => setEditingQuestion({ ...editingQuestion, question: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={3}
                            placeholder="Enter your interview question..."
                          />

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <select
                              value={editingQuestion.type}
                              onChange={(e) => setEditingQuestion({ ...editingQuestion, type: e.target.value as any })}
                              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="behavioral">Behavioral</option>
                              <option value="technical">Technical</option>
                              <option value="general">General</option>
                              <option value="situational">Situational</option>
                            </select>

                            <select
                              value={editingQuestion.difficulty}
                              onChange={(e) => setEditingQuestion({ ...editingQuestion, difficulty: e.target.value as any })}
                              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="easy">Easy</option>
                              <option value="medium">Medium</option>
                              <option value="hard">Hard</option>
                            </select>

                            <input
                              type="number"
                              value={editingQuestion.expectedDuration}
                              onChange={(e) => setEditingQuestion({ ...editingQuestion, expectedDuration: parseInt(e.target.value) })}
                              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Duration (seconds)"
                            />

                            <input
                              type="text"
                              value={editingQuestion.category}
                              onChange={(e) => setEditingQuestion({ ...editingQuestion, category: e.target.value })}
                              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Category"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Suggested Answer Points (Optional)
                            </label>
                            {editingQuestion !== undefined && editingQuestion?.suggestedAnswers?.map((answer, index) => (
                              <div key={index} className="flex items-center space-x-2 mb-2">
                                <input
                                  type="text"
                                  value={answer}
                                  onChange={(e) => {
                                    const updated = [...editingQuestion?.suggestedAnswers ?? []];
                                    updated[index] = e.target.value;
                                    setEditingQuestion({ ...editingQuestion, suggestedAnswers: updated });
                                  }}
                                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="Enter suggested answer point"
                                />
                                <button
                                  onClick={() => {
                                    const updated = editingQuestion?.suggestedAnswers?.filter((_, i) => i !== index);
                                    setEditingQuestion({ ...editingQuestion, suggestedAnswers: updated });
                                  }}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                            <button
                              onClick={() => {
                                setEditingQuestion({
                                  ...editingQuestion,
                                  suggestedAnswers: [...editingQuestion?.suggestedAnswers ?? [], '']
                                })
                              }}
                              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm"
                            >
                              <Plus className="h-4 w-4" />
                              <span>Add Answer Point</span>
                            </button>
                          </div>

                          <button
                            onClick={() => updateQuestion(question?.id, editingQuestion)}
                            disabled={!editingQuestion.question.trim()}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
                          >
                            Update Question
                          </button>
                        </div>
                      </div>
                      : <>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                                {question.type}
                              </span>
                              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">
                                {question.difficulty}
                              </span>
                              <span className="text-sm text-gray-500">{question.expectedDuration}s</span>
                            </div>
                            <p className="text-gray-900 font-medium">{question.question}</p>
                            {question.category && (
                              <p className="text-sm text-gray-600 mt-1">Category: {question.category}</p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setEditingQuestion(question)}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => deleteQuestion(question.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        {question.suggestedAnswers && question.suggestedAnswers.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-gray-700 mb-1">Suggested Answer Points:</p>
                            <ul className="text-sm text-gray-600 list-disc list-inside">
                              {question.suggestedAnswers.map((answer, idx) => (
                                <li key={idx}>{answer}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    }
                  </div>
                ))}
              </div>

              {/* Add New Question */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Question</h3>
                <div className="space-y-4">
                  <textarea
                    value={newQuestion.question}
                    onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Enter your interview question..."
                  />

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <select
                      value={newQuestion.type}
                      onChange={(e) => setNewQuestion({ ...newQuestion, type: e.target.value as any })}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="behavioral">Behavioral</option>
                      <option value="technical">Technical</option>
                      <option value="general">General</option>
                      <option value="situational">Situational</option>
                    </select>

                    <select
                      value={newQuestion.difficulty}
                      onChange={(e) => setNewQuestion({ ...newQuestion, difficulty: e.target.value as any })}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>

                    <input
                      type="number"
                      value={newQuestion.expectedDuration}
                      onChange={(e) => setNewQuestion({ ...newQuestion, expectedDuration: parseInt(e.target.value) })}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Duration (seconds)"
                    />

                    <input
                      type="text"
                      value={newQuestion.category}
                      onChange={(e) => setNewQuestion({ ...newQuestion, category: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Category"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Suggested Answer Points (Optional)
                    </label>
                    {newQuestion.suggestedAnswers.map((answer, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <input
                          type="text"
                          value={answer}
                          onChange={(e) => {
                            const updated = [...newQuestion.suggestedAnswers];
                            updated[index] = e.target.value;
                            setNewQuestion({ ...newQuestion, suggestedAnswers: updated });
                          }}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter suggested answer point"
                        />
                        <button
                          onClick={() => {
                            const updated = newQuestion.suggestedAnswers.filter((_, i) => i !== index);
                            setNewQuestion({ ...newQuestion, suggestedAnswers: updated });
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => setNewQuestion({
                        ...newQuestion,
                        suggestedAnswers: [...newQuestion.suggestedAnswers, '']
                      })}
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Answer Point</span>
                    </button>
                  </div>

                  <button
                    onClick={addQuestion}
                    disabled={!newQuestion.question.trim()}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
                  >
                    Add Question
                  </button>
                </div>
              </div>
            </div>

            {/* Final Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <div className="space-x-4">
                  <button
                    onClick={handleSubmit}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Update Job Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 