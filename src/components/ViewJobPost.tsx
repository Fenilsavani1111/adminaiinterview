import { useEffect, useState } from 'react';
import { ArrowLeft, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { InterviewQuestion } from '../types';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export function ViewJobPost() {
  const { state, dispatch } = useApp();
  const [step, setStep] = useState(1);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    department: '',
    location: [''],
    type: 'full-time' as 'full-time' | 'part-time' | 'contract' | 'internship',
    experience: '',
    description: '',
    requirements: [''],
    responsibilities: [''],
    skills: [''],
    salaryMin: '',
    salaryMax: '',
    currency: 'USD',
    interviewStartDateTime: '',
  });

  const updateArrayField = (
    field: 'requirements' | 'responsibilities' | 'skills',
    index: number,
    value: string,
  ) => {
    const updated = [...formData[field]];
    updated[index] = value;
    setFormData({ ...formData, [field]: updated });
  };

  // Load job post data when component mounts
  useEffect(() => {
    if (state.currentJobPost) {
      const job = state.currentJobPost;
      // Populate form data
      setFormData({
        title: job.title,
        company: job.company,
        department: job.department,
        location: Array.isArray(job.location)
          ? job.location.length > 0
            ? job.location
            : ['']
          : job.location
            ? [job.location]
            : [''],
        type: job.type,
        experience: job.experience,
        description: job.description,
        requirements: job.requirements.length > 0 ? job.requirements : [''],
        responsibilities:
          job.responsibilities.length > 0 ? job.responsibilities : [''],
        skills: job.skills.length > 0 ? job.skills : [''],
        salaryMin: job.salary?.min?.toString() || '',
        salaryMax: job.salary?.max?.toString() || '',
        currency: job.salary?.currency || 'USD',
        interviewStartDateTime: job.interviewStartDateTime
          ? new Date(job.interviewStartDateTime).toLocaleString(undefined, {
              dateStyle: 'medium',
              timeStyle: 'short',
            })
          : '',
      });
      let damiquestions = job.questions?.sort((a: any, b: any) => a.id - b.id);
      setQuestions([...damiquestions]);
    }
  }, [state.currentJobPost]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() =>
                  dispatch({ type: 'SET_VIEW', payload: 'job-posts' })
                }
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Job Posts</span>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                View Job Post
              </h1>
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
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Job Details
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  required
                  disabled={true}
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
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
                  disabled={true}
                  value={formData.company}
                  onChange={(e) =>
                    setFormData({ ...formData, company: e.target.value })
                  }
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
                  disabled={true}
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Engineering, Product, Marketing"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Locations *
                </label>
                {formData.location.map((loc, index) => (
                  <input
                    key={index}
                    type="text"
                    required
                    disabled={true}
                    value={loc}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                    placeholder="e.g., San Francisco, CA or Remote"
                  />
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Type *
                </label>
                <select
                  disabled={true}
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as any })
                  }
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
                  disabled={true}
                  value={formData.experience}
                  onChange={(e) =>
                    setFormData({ ...formData, experience: e.target.value })
                  }
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
              <textarea
                disabled={true}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={6}
                placeholder="Describe the role, responsibilities, and what makes this position exciting..."
              />
            </div>

            <div className="flex justify-end mt-8">
              <button
                onClick={async () => {
                  setStep(2);
                }}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                disabled={
                  !formData.title || !formData.company || !formData.description
                }
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Requirements & Details
            </h2>

            {/* Requirements */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Requirements
              </label>
              {formData.requirements.map((req, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    disabled={true}
                    type="text"
                    value={req}
                    onChange={(e) =>
                      updateArrayField('requirements', index, e.target.value)
                    }
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter requirement"
                  />
                </div>
              ))}
            </div>

            {/* Responsibilities */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Key Responsibilities
              </label>
              {formData.responsibilities.map((resp, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    disabled={true}
                    type="text"
                    value={resp}
                    onChange={(e) =>
                      updateArrayField(
                        'responsibilities',
                        index,
                        e.target.value,
                      )
                    }
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter responsibility"
                  />
                </div>
              ))}
            </div>

            {/* Skills */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Required Skills
              </label>
              {formData.skills.map((skill, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    disabled={true}
                    type="text"
                    value={skill}
                    onChange={(e) =>
                      updateArrayField('skills', index, e.target.value)
                    }
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter skill"
                  />
                </div>
              ))}
            </div>

            {/* Interview Schedule */}
            {formData.interviewStartDateTime && (
              <div className="mb-8 rounded-xl border border-slate-200 bg-gradient-to-br from-indigo-50/80 to-white p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <label className="text-sm font-semibold text-slate-900">
                    Interview Start
                  </label>
                </div>
                <p className="text-base text-slate-700 font-medium">
                  {formData.interviewStartDateTime}
                </p>
              </div>
            )}

            {/* Salary */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Salary Range (Optional)
              </label>
              <div className="grid grid-cols-3 gap-4">
                <input
                  disabled={true}
                  type="number"
                  value={formData.salaryMin}
                  onChange={(e) =>
                    setFormData({ ...formData, salaryMin: e.target.value })
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Min salary"
                />
                <input
                  disabled={true}
                  type="number"
                  value={formData.salaryMax}
                  onChange={(e) =>
                    setFormData({ ...formData, salaryMax: e.target.value })
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Max salary"
                />
                <select
                  disabled={true}
                  value={formData.currency}
                  onChange={(e) =>
                    setFormData({ ...formData, currency: e.target.value })
                  }
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
                <h2 className="text-2xl font-bold text-gray-900">
                  Interview Questions
                </h2>
              </div>

              {questions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>
                    No questions added yet. Generate questions from job
                    description or add manually.
                  </p>
                </div>
              )}

              {/* Questions List */}
              <div className="space-y-4 mb-8">
                {questions.map((question) => (
                  <div
                    key={question.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                            {question.type}
                          </span>
                          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium">
                            {question.difficulty}
                          </span>
                          <span className="text-sm text-gray-500">
                            {question.expectedDuration}s
                          </span>
                        </div>
                        <p className="text-gray-900 font-medium">
                          {question.question}
                        </p>
                        {question.category && (
                          <p className="text-sm text-gray-600 mt-1">
                            Category: {question.category}
                          </p>
                        )}
                      </div>
                    </div>

                    {question.suggestedAnswers &&
                      question.suggestedAnswers.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            Suggested Answer Points:
                          </p>
                          <ul className="text-sm text-gray-600 list-disc list-inside">
                            {question.suggestedAnswers.map((answer, idx) => (
                              <li key={idx}>{answer}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </div>
                ))}
              </div>

              {/* Add New Question */}
              {/* <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Question</h3>
                <div className="space-y-4">
                  <textarea
                    disabled={true}
                    value={newQuestion.question}
                    onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Enter your interview question..."
                  />

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <select
                      disabled={true}
                      value={newQuestion.type}
                      onChange={(e) => setNewQuestion({ ...newQuestion, type: e.target.value as any })}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="behavioral">Behavioral</option>
                      <option value="technical">Technical</option>
                      <option value="general">General</option>
                    </select>

                    <select
                      disabled={true}
                      value={newQuestion.difficulty}
                      onChange={(e) => setNewQuestion({ ...newQuestion, difficulty: e.target.value as any })}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>

                    <input
                      disabled={true}
                      type="number"
                      value={newQuestion.expectedDuration}
                      onChange={(e) => setNewQuestion({ ...newQuestion, expectedDuration: parseInt(e.target.value) })}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Duration (seconds)"
                    />

                    <input
                      disabled={true}
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
                          disabled={true}
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

                      </div>
                    ))}
                  </div>
                </div>
              </div> */}
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
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
