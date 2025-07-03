import React, { useState } from 'react';
import { ArrowLeft, Upload, Wand2, Plus, Trash2, Edit, Save } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { JobPost, InterviewQuestion } from '../types';
import { useJobPosts } from '../hooks/useJobPosts';

export function CreateJobPost() {
  const { dispatch } = useApp();
  const { createJobPost, loading, error } = useJobPosts();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    department: '',
    location: '',
    type: 'full-time' as const,
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
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
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

  const generateQuestionsFromJD = () => {
    // Simulate AI question generation based on job description
    const generatedQuestions: InterviewQuestion[] = [
      {
        id: Date.now().toString() + '1',
        question: `Tell me about your experience with ${formData.skills[0] || 'the required technologies'} and how you've applied it in previous roles.`,
        type: 'technical',
        expectedDuration: 180,
        difficulty: 'medium',
        category: 'Technical Skills',
        suggestedAnswers: [
          'Detailed explanation of hands-on experience',
          'Specific projects and outcomes',
          'Challenges faced and solutions implemented'
        ],
        evaluationCriteria: [
          'Technical depth and accuracy',
          'Real-world application examples',
          'Problem-solving approach'
        ],
        isRequired: true,
        order: 1
      },
      {
        id: Date.now().toString() + '2',
        question: `Describe a challenging project where you had to ${formData.responsibilities[0] || 'take on significant responsibility'}. How did you approach it?`,
        type: 'behavioral',
        expectedDuration: 150,
        difficulty: 'medium',
        category: 'Leadership & Problem Solving',
        suggestedAnswers: [
          'STAR method response (Situation, Task, Action, Result)',
          'Clear problem identification',
          'Systematic approach to solution'
        ],
        evaluationCriteria: [
          'Problem-solving methodology',
          'Leadership and initiative',
          'Results and impact'
        ],
        isRequired: true,
        order: 2
      },
      {
        id: Date.now().toString() + '3',
        question: `Why are you interested in this ${formData.title} position, and what makes you a good fit for our ${formData.department} team?`,
        type: 'general',
        expectedDuration: 120,
        difficulty: 'easy',
        category: 'Motivation & Fit',
        suggestedAnswers: [
          'Alignment with career goals',
          'Understanding of company/role',
          'Relevant skills and experience'
        ],
        evaluationCriteria: [
          'Research and preparation',
          'Genuine interest and enthusiasm',
          'Cultural fit assessment'
        ],
        isRequired: true,
        order: 3
      }
    ];
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
    setEditingQuestion(null);
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

  const handleSubmit = async () => {
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
        questions: questions,
        status: 'draft' as const,
        createdBy: 'admin'
      };

      await createJobPost(jobPostData);
      dispatch({ type: 'SET_VIEW', payload: 'job-posts' });
    } catch (err) {
      console.error('Failed to create job post:', err);
      // Error is already handled by the hook
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
                onClick={() => dispatch({ type: 'SET_VIEW', payload: 'job-posts' })}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Job Posts</span>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Create Job Post</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Step {step} of 3</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </div>
              <span className={`text-sm ${step >= 1 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                Job Details
              </span>
            </div>
            <div className="flex-1 h-px bg-gray-200 mx-4"></div>
            <div className="flex items-center space-x-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
              <span className={`text-sm ${step >= 2 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                Requirements & Skills
              </span>
            </div>
            <div className="flex-1 h-px bg-gray-200 mx-4"></div>
            <div className="flex items-center space-x-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                3
              </div>
              <span className={`text-sm ${step >= 3 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                Interview Questions
              </span>
            </div>
          </div>
        </div>

        {/* Step 1: Job Details */}
        {step === 1 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Job Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Senior Frontend Developer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company *</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., TechCorp Inc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Engineering"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., San Francisco, CA"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level *</label>
                <select
                  value={formData.experience}
                  onChange={(e) => setFormData({...formData, experience: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select experience level</option>
                  <option value="entry">Entry Level</option>
                  <option value="junior">Junior</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior</option>
                  <option value="lead">Lead</option>
                  <option value="principal">Principal</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Provide a detailed description of the role, responsibilities, and what makes this position exciting..."
                />
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setStep(2)}
                disabled={!formData.title || !formData.company || !formData.location || !formData.experience}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next: Requirements & Skills
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Requirements & Skills */}
        {step === 2 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Requirements & Skills</h2>
            
            {/* Requirements */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">Requirements</label>
                <button
                  onClick={() => addArrayField('requirements')}
                  className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Requirement</span>
                </button>
              </div>
              {formData.requirements.map((req, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={req}
                    onChange={(e) => updateArrayField('requirements', index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 5+ years of React experience"
                  />
                  <button
                    onClick={() => removeArrayField('requirements', index)}
                    className="p-2 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Responsibilities */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">Responsibilities</label>
                <button
                  onClick={() => addArrayField('responsibilities')}
                  className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Responsibility</span>
                </button>
              </div>
              {formData.responsibilities.map((resp, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={resp}
                    onChange={(e) => updateArrayField('responsibilities', index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Lead frontend architecture decisions"
                  />
                  <button
                    onClick={() => removeArrayField('responsibilities', index)}
                    className="p-2 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Skills */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">Required Skills</label>
                <button
                  onClick={() => addArrayField('skills')}
                  className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Skill</span>
                </button>
              </div>
              {formData.skills.map((skill, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={skill}
                    onChange={(e) => updateArrayField('skills', index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., React, TypeScript, Node.js"
                  />
                  <button
                    onClick={() => removeArrayField('skills', index)}
                    className="p-2 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Salary Range */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-4">Salary Range (Optional)</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Minimum</label>
                  <input
                    type="number"
                    value={formData.salaryMin}
                    onChange={(e) => setFormData({...formData, salaryMin: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 80000"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Maximum</label>
                  <input
                    type="number"
                    value={formData.salaryMax}
                    onChange={(e) => setFormData({...formData, salaryMax: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 120000"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Currency</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({...formData, currency: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="CAD">CAD</option>
                    <option value="AUD">AUD</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setStep(3)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next: Interview Questions
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Interview Questions */}
        {step === 3 && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Interview Questions</h2>
              <button
                onClick={generateQuestionsFromJD}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Wand2 className="h-4 w-4" />
                <span>Generate Questions</span>
              </button>
            </div>

            {/* Existing Questions */}
            {questions.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Interview Questions ({questions.length})</h3>
                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900">Question {index + 1}</h4>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setEditingQuestion(question.id)}
                            className="p-1 text-gray-400 hover:text-blue-600"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteQuestion(question.id)}
                            className="p-1 text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-2">{question.question}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          question.type === 'technical' ? 'bg-blue-100 text-blue-800' :
                          question.type === 'behavioral' ? 'bg-green-100 text-green-800' :
                          question.type === 'general' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {question.type}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                          question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {question.difficulty}
                        </span>
                        <span>{question.expectedDuration}s</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add New Question */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Question</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
                  <textarea
                    value={newQuestion.question}
                    onChange={(e) => setNewQuestion({...newQuestion, question: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your interview question..."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select
                      value={newQuestion.type}
                      onChange={(e) => setNewQuestion({...newQuestion, type: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="behavioral">Behavioral</option>
                      <option value="technical">Technical</option>
                      <option value="general">General</option>
                      <option value="situational">Situational</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                    <select
                      value={newQuestion.difficulty}
                      onChange={(e) => setNewQuestion({...newQuestion, difficulty: e.target.value as any})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration (seconds)</label>
                    <input
                      type="number"
                      value={newQuestion.expectedDuration}
                      onChange={(e) => setNewQuestion({...newQuestion, expectedDuration: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="30"
                      max="600"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <input
                    type="text"
                    value={newQuestion.category}
                    onChange={(e) => setNewQuestion({...newQuestion, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Technical Skills, Leadership, Problem Solving"
                  />
                </div>
                <button
                  onClick={addQuestion}
                  disabled={!newQuestion.question.trim()}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Question</span>
                </button>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !formData.title || !formData.company || !formData.location || !formData.experience}
                className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Create Job Post</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}