import React, { useState } from 'react';
import {
  ArrowLeft,
  Upload,
  Wand2,
  Plus,
  Trash2,
  Edit,
  Save,
  Download,
  FileSpreadsheet,
  AlertCircle,
  Users,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { JobPost, InterviewQuestion } from '../types';
import { useJobPosts } from '../hooks/useJobPosts';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min?url';
import { defaultQuestions } from './EditJobPost';
import {
  downloadSampleExcel,
  parseExcelFile,
  validateExcelStructure,
} from '../utils/excelUtils';
import {
  downloadSampleStudentExcel,
  parseStudentExcelFile,
  validateStudentExcelStructure,
} from '../utils/studentExcelUtils';
import type { Student } from '../utils/studentExcelUtils';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export function CreateJobPost() {
  const { dispatch } = useApp();
  const {
    createJobPost,
    loading,
    error,
    getJobPostOpenaiQuestions,
    getJobPostResponsibilityFromJD,
    getJobDescriptionFromPDf,
  } = useJobPosts();
  const [jdFromPdfLoading, setJdFromPdfLoading] = useState(false);
  const [continueLoading, setContinueLoading] = useState(false);
  const [questionsFromJdLoading, setQuestionsFromJdLoading] = useState(false);
  const [excelUploadLoading, setExcelUploadLoading] = useState(false);
  const [excelError, setExcelError] = useState<string>('');
  const [excelSuccess, setExcelSuccess] = useState<string>('');

  // Student List State
  const [studentListModal, setStudentListModal] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentUploadLoading, setStudentUploadLoading] = useState(false);
  const [studentError, setStudentError] = useState<string>('');
  const [studentSuccess, setStudentSuccess] = useState<string>('');

  const [step, setStep] = useState(1);
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
    currency: 'INR',
    enableVideoRecording: false,
  });
  const [questions, setQuestions] = useState<InterviewQuestion[]>([
    ...defaultQuestions,
  ]);
  const [editingQuestion, setEditingQuestion] = useState<
    InterviewQuestion | undefined
  >(undefined);
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    type: 'behavioral' as const,
    expectedDuration: 120,
    difficulty: 'medium' as const,
    category: '',
    suggestedAnswers: [''],
    evaluationCriteria: [''],
    isRequired: true,
  });

  const generateQuestionsFromJD = async () => {
    try {
      setQuestionsFromJdLoading(true);
      setExcelError('');
      setExcelSuccess('');
      const jobPostData: Omit<
        JobPost,
        'id' | 'createdAt' | 'updatedAt' | 'questions' | 'status' | 'createdBy'
      > = {
        title: formData.title,
        company: formData.company,
        department: formData.department,
        location: formData.location.filter((loc) => loc.trim()),
        type: formData.type,
        experience: formData.experience,
        description: formData.description,
        requirements: formData.requirements.filter((r) => r.trim()),
        responsibilities: formData.responsibilities.filter((r) => r.trim()),
        skills: formData.skills.filter((s) => s.trim()),
        salary:
          formData.salaryMin && formData.salaryMax
            ? {
                min: parseInt(formData.salaryMin),
                max: parseInt(formData.salaryMax),
                currency: formData.currency,
              }
            : undefined,
      };
      const generatedQuestions: InterviewQuestion[] =
        await getJobPostOpenaiQuestions(jobPostData);
      setQuestions([...defaultQuestions, ...generatedQuestions]);
      setQuestionsFromJdLoading(false);
    } catch (error) {
      setQuestionsFromJdLoading(false);
      console.log('generateQuestionsFromJD error', error);
    }
  };

  const handleDownloadSampleExcel = () => {
    try {
      setExcelError('');
      downloadSampleExcel();
      setExcelSuccess('Sample Excel template downloaded successfully!');
      setTimeout(() => setExcelSuccess(''), 3000);
    } catch (error) {
      setExcelError('Failed to download sample template');
      console.error('Download sample error:', error);
    }
  };

  const handleExcelUpload = async (file: File) => {
    try {
      setExcelUploadLoading(true);
      setExcelError('');
      setExcelSuccess('');

      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        throw new Error('Please upload an Excel file (.xlsx or .xls)');
      }

      const isValid = await validateExcelStructure(file);
      if (!isValid) {
        throw new Error(
          'Invalid Excel structure. Please download and use the sample template.'
        );
      }

      const parsedQuestions = await parseExcelFile(file);

      const updatedQuestions = [...questions];

      parsedQuestions.forEach((q, index) => {
        q.order = updatedQuestions.length + index + 1;
      });

      setQuestions([...updatedQuestions, ...parsedQuestions]);
      setExcelSuccess(
        `Successfully imported ${parsedQuestions.length} questions from Excel!`
      );
      setTimeout(() => setExcelSuccess(''), 5000);

      setExcelUploadLoading(false);
    } catch (error) {
      setExcelUploadLoading(false);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to upload Excel file';
      setExcelError(errorMessage);
      console.error('Excel upload error:', error);
    }
  };

  // Student List Functions
  const handleDownloadStudentTemplate = () => {
    try {
      setStudentError('');
      downloadSampleStudentExcel();
      setStudentSuccess(
        'Sample student list template downloaded successfully!'
      );
      setTimeout(() => setStudentSuccess(''), 3000);
    } catch (error) {
      setStudentError('Failed to download sample template');
      console.error('Download student template error:', error);
    }
  };

  const handleStudentExcelUpload = async (file: File) => {
    try {
      setStudentUploadLoading(true);
      setStudentError('');
      setStudentSuccess('');

      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        throw new Error('Please upload an Excel file (.xlsx or .xls)');
      }

      const isValid = await validateStudentExcelStructure(file);
      if (!isValid) {
        throw new Error(
          'Invalid Excel structure. Please download and use the sample template.'
        );
      }

      const parsedStudents = await parseStudentExcelFile(file);
      setStudents(parsedStudents);
      setStudentSuccess(
        `Successfully imported ${parsedStudents.length} students from Excel!`
      );
      setTimeout(() => setStudentSuccess(''), 5000);

      setStudentUploadLoading(false);
    } catch (error) {
      setStudentUploadLoading(false);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to upload Excel file';
      setStudentError(errorMessage);
      console.error('Student Excel upload error:', error);
    }
  };

  const handleRemoveStudent = (index: number) => {
    setStudents(students.filter((_, i) => i !== index));
  };

  const addQuestion = () => {
    const question: InterviewQuestion = {
      id: Date.now().toString(),
      ...newQuestion,
      order: questions.length + 1,
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
      isRequired: true,
    });
  };

  const updateQuestion = (
    id: string,
    updatedQuestion: Partial<InterviewQuestion>
  ) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, ...updatedQuestion } : q))
    );
    setEditingQuestion(undefined);
  };

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const addArrayField = (
    field: 'requirements' | 'responsibilities' | 'skills'
  ) => {
    setFormData({
      ...formData,
      [field]: [...formData[field], ''],
    });
  };

  const updateArrayField = (
    field: 'requirements' | 'responsibilities' | 'skills',
    index: number,
    value: string
  ) => {
    const updated = [...formData[field]];
    updated[index] = value;
    setFormData({ ...formData, [field]: updated });
  };

  const removeArrayField = (
    field: 'requirements' | 'responsibilities' | 'skills',
    index: number
  ) => {
    setFormData({
      ...formData,
      [field]: formData[field].filter((_, i) => i !== index),
    });
  };

  const extractTextFromPdf = async (file: File): Promise<void> => {
    try {
      setJdFromPdfLoading(true);
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        fullText +=
          content.items
            .map((item) => ('str' in item ? item.str : ''))
            .join(' ') + '\n';
      }
      let description: string = await getJobDescriptionFromPDf(fullText);
      setFormData({ ...formData, description: description });
      setJdFromPdfLoading(false);
    } catch (error) {
      setJdFromPdfLoading(false);
      console.log('extractTextFromPdf error', error);
    }
  };

  const handleSubmit = async (isDraft = false) => {
    try {
      setContinueLoading(true);
      const jobPostData = {
        title: formData.title,
        company: formData.company,
        department: formData.department,
        location: formData.location.filter((loc) => loc.trim()),
        type: formData.type,
        experience: formData.experience,
        description: formData.description,
        requirements: formData.requirements.filter((r) => r.trim()),
        responsibilities: formData.responsibilities.filter((r) => r.trim()),
        skills: formData.skills.filter((s) => s.trim()),
        salary:
          formData.salaryMin && formData.salaryMax
            ? {
                min: parseInt(formData.salaryMin),
                max: parseInt(formData.salaryMax),
                currency: formData.currency,
              }
            : undefined,
        // pass flag to backend so candidate app knows whether to record video
        enableVideoRecording: formData.enableVideoRecording,
        questions: questions,
        status: isDraft ? ('draft' as const) : ('active' as const),
        createdBy: 'admin',
        students: students, // Include students in job post data
      };

      await createJobPost(jobPostData);
      dispatch({ type: 'SET_VIEW', payload: 'job-posts' });
      setContinueLoading(false);
    } catch (err) {
      console.error('Failed to create job post:', err);
      setContinueLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white shadow-sm border-b border-gray-100'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between py-4'>
            <div className='flex items-center space-x-2 sm:space-x-4'>
              <button
                onClick={() =>
                  dispatch({ type: 'SET_VIEW', payload: 'job-posts' })
                }
                className='flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors'
              >
                <ArrowLeft className='h-5 w-5' />
                <span className='hidden sm:inline'>Back to Job Posts</span>
              </button>
              <h1 className='text-lg sm:text-2xl font-bold text-gray-900 truncate'>
                Create Job Post
              </h1>
            </div>
            <div className='flex items-center space-x-4'>
              <span className='text-sm text-gray-500'>Step {step} of 3</span>
            </div>
          </div>
        </div>
      </header>

      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8'>
        {/* Progress Bar */}
        <div className='mb-6 sm:mb-8'>
          <div className='w-full bg-gray-200 rounded-full h-2'>
            <div
              className='bg-blue-600 h-2 rounded-full transition-all duration-300'
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {step === 1 && (
          <div className='bg-white rounded-2xl shadow-lg p-4 sm:p-8'>
            <h2 className='text-xl sm:text-2xl font-bold text-gray-900 mb-6'>
              Job Details
            </h2>

            <div className='grid md:grid-cols-2 gap-4 sm:gap-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Job Title *
                </label>
                <input
                  type='text'
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  placeholder='e.g., Senior Software Engineer'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Company *
                </label>
                <input
                  type='text'
                  required
                  value={formData.company}
                  onChange={(e) =>
                    setFormData({ ...formData, company: e.target.value })
                  }
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  placeholder='Company name'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Department *
                </label>
                <input
                  type='text'
                  required
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  placeholder='e.g., Engineering, Product, Marketing'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Locations *
                </label>
                {formData.location.map((loc, index) => (
                  <div key={index} className='flex gap-2 mb-2'>
                    <input
                      type='text'
                      required
                      value={loc}
                      onChange={(e) => {
                        const newLocations = [...formData.location];
                        newLocations[index] = e.target.value;
                        setFormData({ ...formData, location: newLocations });
                      }}
                      className='flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      placeholder='e.g., San Francisco, CA or Remote'
                    />
                    {formData.location.length > 1 && (
                      <button
                        type='button'
                        onClick={() => {
                          const newLocations = formData.location.filter(
                            (_, i) => i !== index
                          );
                          setFormData({ ...formData, location: newLocations });
                        }}
                        className='px-1.5 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors'
                      >
                        <Trash2 className='h-4 w-4' />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type='button'
                  onClick={() => {
                    setFormData({
                      ...formData,
                      location: [...formData.location, ''],
                    });
                  }}
                  className='mt-2 flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium'
                >
                  <Plus className='h-4 w-4' />
                  Add Location
                </button>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Job Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as any })
                  }
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                >
                  <option value='full-time'>Full-time</option>
                  <option value='part-time'>Part-time</option>
                  <option value='contract'>Contract</option>
                  <option value='internship'>Internship</option>
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Experience Level *
                </label>
                <select
                  value={formData.experience}
                  onChange={(e) =>
                    setFormData({ ...formData, experience: e.target.value })
                  }
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                >
                  <option value=''>Select experience level</option>
                  <option value='entry'>Entry Level (0-1 years)</option>
                  <option value='junior'>Junior (2-3 years)</option>
                  <option value='mid'>Mid Level (4-6 years)</option>
                  <option value='senior'>Senior (7-10 years)</option>
                  <option value='lead'>Lead/Manager (10+ years)</option>
                </select>
              </div>
            </div>

            <div className='mt-6'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Job Description *
              </label>
              <div className='mb-4'>
                <div className='flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-2'>
                  <label
                    htmlFor='file-upload'
                    className='flex items-center space-x-2 cursor-pointer text-blue-600 hover:text-blue-700 text-sm'
                  >
                    <Upload className='h-4 w-4' />
                    <span>
                      {jdFromPdfLoading
                        ? 'Extracting Text...'
                        : 'Upload JD File'}
                    </span>
                  </label>
                  <input
                    disabled={jdFromPdfLoading}
                    id='file-upload'
                    type='file'
                    accept='.pdf,application/pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                    className='hidden'
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        extractTextFromPdf(file);
                      }
                    }}
                  />
                  <span className='text-gray-400 hidden sm:inline'>or</span>
                  <span className='text-sm text-gray-600'>
                    Type/paste description below
                  </span>
                </div>
              </div>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                rows={6}
                placeholder='Describe the role, responsibilities, and what makes this position exciting...'
              />
            </div>

            <div className='flex justify-end mt-8'>
              <button
                onClick={async () => {
                  setContinueLoading(true);
                  const generatedresponsibilities: string[] =
                    await getJobPostResponsibilityFromJD(formData.description);
                  setFormData({
                    ...formData,
                    responsibilities: generatedresponsibilities,
                  });
                  setStep(2);
                  setContinueLoading(false);
                }}
                className='w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors'
                disabled={
                  jdFromPdfLoading ||
                  !formData.title ||
                  !formData.company ||
                  !formData.description
                }
              >
                {continueLoading ? (
                  <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto'></div>
                ) : (
                  <>Continue</>
                )}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className='bg-white rounded-2xl shadow-lg p-4 sm:p-8'>
            <h2 className='text-xl sm:text-2xl font-bold text-gray-900 mb-6'>
              Requirements & Details
            </h2>

            {/* Requirements */}
            <div className='mb-8'>
              <label className='block text-sm font-medium text-gray-700 mb-4'>
                Requirements
              </label>
              {formData.requirements.map((req, index) => (
                <div key={index} className='flex items-center space-x-2 mb-2'>
                  <input
                    type='text'
                    value={req}
                    onChange={(e) =>
                      updateArrayField('requirements', index, e.target.value)
                    }
                    className='flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    placeholder='Enter requirement'
                  />
                  <button
                    onClick={() => removeArrayField('requirements', index)}
                    className='text-red-600 hover:text-red-700'
                  >
                    <Trash2 className='h-4 w-4' />
                  </button>
                </div>
              ))}
              <button
                onClick={() => addArrayField('requirements')}
                className='flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm'
              >
                <Plus className='h-4 w-4' />
                <span>Add Requirement</span>
              </button>
            </div>

            {/* Responsibilities */}
            <div className='mb-8'>
              <label className='block text-sm font-medium text-gray-700 mb-4'>
                Key Responsibilities
              </label>
              {formData.responsibilities.map((resp, index) => (
                <div key={index} className='flex items-center space-x-2 mb-2'>
                  <input
                    type='text'
                    value={resp}
                    onChange={(e) =>
                      updateArrayField(
                        'responsibilities',
                        index,
                        e.target.value
                      )
                    }
                    className='flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    placeholder='Enter responsibility'
                  />
                  <button
                    onClick={() => removeArrayField('responsibilities', index)}
                    className='text-red-600 hover:text-red-700'
                  >
                    <Trash2 className='h-4 w-4' />
                  </button>
                </div>
              ))}
              <button
                onClick={() => addArrayField('responsibilities')}
                className='flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm'
              >
                <Plus className='h-4 w-4' />
                <span>Add Responsibility</span>
              </button>
            </div>

            {/* Skills */}
            <div className='mb-8'>
              <label className='block text-sm font-medium text-gray-700 mb-4'>
                Required Skills
              </label>
              {formData.skills.map((skill, index) => (
                <div key={index} className='flex items-center space-x-2 mb-2'>
                  <input
                    type='text'
                    value={skill}
                    onChange={(e) =>
                      updateArrayField('skills', index, e.target.value)
                    }
                    className='flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    placeholder='Enter skill'
                  />
                  <button
                    onClick={() => removeArrayField('skills', index)}
                    className='text-red-600 hover:text-red-700'
                  >
                    <Trash2 className='h-4 w-4' />
                  </button>
                </div>
              ))}
              <button
                onClick={() => addArrayField('skills')}
                className='flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm'
              >
                <Plus className='h-4 w-4' />
                <span>Add Skill</span>
              </button>
            </div>

            {/* Salary */}
            <div className='mb-8'>
              <label className='block text-sm font-medium text-gray-700 mb-4'>
                Salary Range (Optional)
              </label>
              <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                <input
                  type='number'
                  value={formData.salaryMin}
                  onChange={(e) =>
                    setFormData({ ...formData, salaryMin: e.target.value })
                  }
                  className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  placeholder='Min salary'
                />
                <input
                  type='number'
                  value={formData.salaryMax}
                  onChange={(e) =>
                    setFormData({ ...formData, salaryMax: e.target.value })
                  }
                  className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  placeholder='Max salary'
                />
                <select
                  value={formData.currency}
                  onChange={(e) =>
                    setFormData({ ...formData, currency: e.target.value })
                  }
                  className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                >
                  <option value='INR'>INR</option>
                  <option value='USD'>USD</option>
                  <option value='SR'>SR</option>
                  <option value='EUR'>EUR</option>
                  <option value='GBP'>GBP</option>
                </select>
              </div>
            </div>

            {/* Interview Recording Options */}
            <div className='mb-8 border border-gray-200 rounded-lg p-4 bg-gray-50'>
              <h3 className='text-sm font-semibold text-gray-900 mb-2'>
                Interview Recording Options
              </h3>
              <p className='text-xs text-gray-500 mb-3'>
                Choose whether candidates record <strong>video + audio</strong>{' '}
                or <strong>audio only</strong> during the interview.
              </p>
              <label className='inline-flex items-start space-x-3 cursor-pointer'>
                <input
                  type='checkbox'
                  className='mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded'
                  checked={formData.enableVideoRecording}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      enableVideoRecording: e.target.checked,
                    })
                  }
                />
                <span className='text-sm text-gray-700'>
                  <span className='font-medium'>Enable Video Recording</span>
                  <span className='block text-xs text-gray-500 mt-1'>
                    When enabled, candidates will record both video and audio.
                    When disabled, they will only record audio responses.
                  </span>
                </span>
              </label>
            </div>

            <div className='flex flex-col sm:flex-row justify-between gap-4'>
              <button
                onClick={() => setStep(1)}
                className='w-full sm:w-auto border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors'
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className='w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors'
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className='space-y-6 sm:space-y-8'>
            {/* AI Question Generation */}
            <div className='bg-white rounded-2xl shadow-lg p-4 sm:p-8'>
              <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4'>
                <h2 className='text-xl sm:text-2xl font-bold text-gray-900'>
                  Interview Questions
                </h2>
                <button
                  onClick={generateQuestionsFromJD}
                  disabled={questionsFromJdLoading}
                  className='flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed w-full sm:w-auto'
                >
                  <Wand2 className='h-4 w-4' />
                  <span>Generate from JD</span>
                </button>
              </div>

              {/* Excel Upload Section */}
              <div className='mb-8 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200'>
                <div className='flex flex-col sm:flex-row items-start space-x-0 sm:space-x-3'>
                  <FileSpreadsheet className='h-5 w-5 text-green-600 mt-1 flex-shrink-0 hidden sm:block' />
                  <div className='flex-1'>
                    <h3 className='text-base sm:text-lg font-semibold text-gray-900 mb-2'>
                      Upload Questions from Excel
                    </h3>
                    <p className='text-sm text-gray-600 mb-4'>
                      Upload an Excel file with interview questions. Download
                      the sample template to see the required format.
                    </p>

                    <div className='flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3'>
                      <button
                        onClick={handleDownloadSampleExcel}
                        className='flex items-center justify-center space-x-2 bg-white border-2 border-green-600 text-green-600 px-4 py-2 rounded-lg hover:bg-green-50 transition-colors'
                      >
                        <Download className='h-4 w-4' />
                        <span className='text-sm sm:text-base'>
                          Download Template
                        </span>
                      </button>

                      <label
                        htmlFor='excel-upload'
                        className={`flex items-center justify-center space-x-2 cursor-pointer bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors ${
                          excelUploadLoading
                            ? 'opacity-50 cursor-not-allowed'
                            : ''
                        }`}
                      >
                        <Upload className='h-4 w-4' />
                        <span className='text-sm sm:text-base'>
                          {excelUploadLoading ? 'Uploading...' : 'Upload File'}
                        </span>
                      </label>
                      <input
                        id='excel-upload'
                        type='file'
                        accept='.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel'
                        className='hidden'
                        disabled={excelUploadLoading}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleExcelUpload(file);
                            e.target.value = '';
                          }
                        }}
                      />
                    </div>

                    {excelSuccess && (
                      <div className='mt-3 p-3 bg-green-100 border border-green-300 rounded-lg flex items-start space-x-2'>
                        <AlertCircle className='h-5 w-5 text-green-600 flex-shrink-0 mt-0.5' />
                        <p className='text-sm text-green-800'>{excelSuccess}</p>
                      </div>
                    )}

                    {excelError && (
                      <div className='mt-3 p-3 bg-red-100 border border-red-300 rounded-lg flex items-start space-x-2'>
                        <AlertCircle className='h-5 w-5 text-red-600 flex-shrink-0 mt-0.5' />
                        <div className='flex-1'>
                          <p className='text-sm text-red-800 whitespace-pre-line'>
                            {excelError}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Student List Upload Section */}
              <div className='mb-8 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200'>
                <div className='flex flex-col sm:flex-row items-start space-x-0 sm:space-x-3'>
                  <Users className='h-5 w-5 text-purple-600 mt-1 flex-shrink-0 hidden sm:block' />
                  <div className='flex-1'>
                    <h3 className='text-base sm:text-lg font-semibold text-gray-900 mb-2'>
                      Upload Student List (Optional)
                    </h3>
                    <p className='text-sm text-gray-600 mb-4'>
                      Pre-upload a list of students who will be taking this
                      interview.{' '}
                      {students.length > 0 &&
                        `(${students.length} student${
                          students.length !== 1 ? 's' : ''
                        } added)`}
                    </p>

                    <div className='flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3'>
                      <button
                        onClick={() => setStudentListModal(true)}
                        className='flex items-center justify-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors w-full sm:w-auto'
                      >
                        <Users className='h-4 w-4' />
                        <span className='text-sm sm:text-base'>
                          {students.length > 0
                            ? `Manage Students (${students.length})`
                            : 'Upload Student List'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {questionsFromJdLoading ? (
                <div className='flex justify-center items-center py-8'>
                  <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600'></div>
                  <span className='ml-3 text-gray-600'>
                    Generating questions...
                  </span>
                </div>
              ) : questions.length === 0 ? (
                <div className='text-center py-8 text-gray-500'>
                  <p>
                    No questions added yet. Generate questions from job
                    description, upload Excel file, or add manually.
                  </p>
                </div>
              ) : (
                <>
                  {/* Questions List */}
                  <div className='space-y-4 mb-8'>
                    {questions.map((question, index) => (
                      <div
                        key={question.id}
                        className='border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow'
                      >
                        {editingQuestion?.id === question.id ? (
                          <div className=''>
                            <h3 className='text-lg font-medium text-gray-900 mb-4'>
                              Update Question
                            </h3>
                            <div className='space-y-4'>
                              <textarea
                                value={editingQuestion.question}
                                onChange={(e) =>
                                  setEditingQuestion({
                                    ...editingQuestion,
                                    question: e.target.value,
                                  })
                                }
                                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                rows={3}
                                placeholder='Enter your interview question...'
                              />

                              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4'>
                                <select
                                  value={editingQuestion.type}
                                  onChange={(e) =>
                                    setEditingQuestion({
                                      ...editingQuestion,
                                      type: e.target.value as any,
                                    })
                                  }
                                  className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                >
                                  <option value='behavioral'>Behavioral</option>
                                  <option value='technical'>Technical</option>
                                  <option value='general'>General</option>
                                  <option value='situational'>
                                    Situational
                                  </option>
                                </select>

                                <select
                                  value={editingQuestion.difficulty}
                                  onChange={(e) =>
                                    setEditingQuestion({
                                      ...editingQuestion,
                                      difficulty: e.target.value as any,
                                    })
                                  }
                                  className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                >
                                  <option value='easy'>Easy</option>
                                  <option value='medium'>Medium</option>
                                  <option value='hard'>Hard</option>
                                </select>

                                <input
                                  type='number'
                                  value={editingQuestion.expectedDuration}
                                  onChange={(e) =>
                                    setEditingQuestion({
                                      ...editingQuestion,
                                      expectedDuration: parseInt(
                                        e.target.value
                                      ),
                                    })
                                  }
                                  className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                  placeholder='Duration (seconds)'
                                />

                                <input
                                  type='text'
                                  value={editingQuestion.category}
                                  onChange={(e) =>
                                    setEditingQuestion({
                                      ...editingQuestion,
                                      category: e.target.value,
                                    })
                                  }
                                  className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                  placeholder='Category'
                                />
                              </div>

                              <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                  Suggested Answer Points (Optional)
                                </label>
                                {editingQuestion !== undefined &&
                                  editingQuestion?.suggestedAnswers?.map(
                                    (answer, index) => (
                                      <div
                                        key={index}
                                        className='flex items-center space-x-2 mb-2'
                                      >
                                        <input
                                          type='text'
                                          value={answer}
                                          onChange={(e) => {
                                            const updated = [
                                              ...(editingQuestion?.suggestedAnswers ??
                                                []),
                                            ];
                                            updated[index] = e.target.value;
                                            setEditingQuestion({
                                              ...editingQuestion,
                                              suggestedAnswers: updated,
                                            });
                                          }}
                                          className='flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                          placeholder='Enter suggested answer point'
                                        />
                                        <button
                                          onClick={() => {
                                            const updated =
                                              editingQuestion?.suggestedAnswers?.filter(
                                                (_, i) => i !== index
                                              );
                                            setEditingQuestion({
                                              ...editingQuestion,
                                              suggestedAnswers: updated,
                                            });
                                          }}
                                          className='text-red-600 hover:text-red-700'
                                        >
                                          <Trash2 className='h-4 w-4' />
                                        </button>
                                      </div>
                                    )
                                  )}
                                <button
                                  onClick={() => {
                                    setEditingQuestion({
                                      ...editingQuestion,
                                      suggestedAnswers: [
                                        ...(editingQuestion?.suggestedAnswers ??
                                          []),
                                        '',
                                      ],
                                    });
                                  }}
                                  className='flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm'
                                >
                                  <Plus className='h-4 w-4' />
                                  <span>Add Answer Point</span>
                                </button>
                              </div>
                              <div className='flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 items-stretch sm:items-center'>
                                <button
                                  onClick={() =>
                                    updateQuestion(
                                      question?.id,
                                      editingQuestion
                                    )
                                  }
                                  disabled={!editingQuestion.question.trim()}
                                  className='w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400'
                                >
                                  Update Question
                                </button>
                                <button
                                  onClick={() => setEditingQuestion(undefined)}
                                  className='w-full sm:w-auto border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors'
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className='flex items-start justify-between mb-2'>
                              <div className='flex-1'>
                                <div className='flex flex-wrap items-center gap-2 mb-2'>
                                  <span className='bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium'>
                                    {question.type}
                                  </span>
                                  <span className='bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium'>
                                    {question.difficulty}
                                  </span>
                                  <span className='text-sm text-gray-500'>
                                    {question.expectedDuration}s
                                  </span>
                                </div>
                                <p className='text-gray-900 font-medium'>
                                  {question.question}
                                </p>
                                {question.category && (
                                  <p className='text-sm text-gray-600 mt-1'>
                                    Category: {question.category}
                                  </p>
                                )}
                              </div>
                              <div className='flex items-center space-x-2 ml-2'>
                                <button
                                  onClick={() => setEditingQuestion(question)}
                                  className='text-gray-600 hover:text-gray-900'
                                >
                                  <Edit className='h-4 w-4' />
                                </button>
                                {question.id !== 'aboutself' && (
                                  <button
                                    onClick={() => deleteQuestion(question.id)}
                                    className='text-red-600 hover:text-red-700'
                                  >
                                    <Trash2 className='h-4 w-4' />
                                  </button>
                                )}
                              </div>
                            </div>

                            {question.suggestedAnswers &&
                              question.suggestedAnswers.length > 0 && (
                                <div className='mt-3'>
                                  <p className='text-sm font-medium text-gray-700 mb-1'>
                                    Suggested Answer Points:
                                  </p>
                                  <ul className='text-sm text-gray-600 list-disc list-inside'>
                                    {question.suggestedAnswers.map(
                                      (answer, idx) => (
                                        <li key={idx}>{answer}</li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Add New Question */}
              <div className='border-t pt-6'>
                <h3 className='text-base sm:text-lg font-medium text-gray-900 mb-4'>
                  Add New Question Manually
                </h3>
                <div className='space-y-4'>
                  <textarea
                    value={newQuestion.question}
                    onChange={(e) =>
                      setNewQuestion({
                        ...newQuestion,
                        question: e.target.value,
                      })
                    }
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    rows={3}
                    placeholder='Enter your interview question...'
                  />

                  <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4'>
                    <select
                      value={newQuestion.type}
                      onChange={(e) =>
                        setNewQuestion({
                          ...newQuestion,
                          type: e.target.value as any,
                        })
                      }
                      className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    >
                      <option value='behavioral'>Behavioral</option>
                      <option value='technical'>Technical</option>
                      <option value='general'>General</option>
                      <option value='situational'>Situational</option>
                    </select>

                    <select
                      value={newQuestion.difficulty}
                      onChange={(e) =>
                        setNewQuestion({
                          ...newQuestion,
                          difficulty: e.target.value as any,
                        })
                      }
                      className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    >
                      <option value='easy'>Easy</option>
                      <option value='medium'>Medium</option>
                      <option value='hard'>Hard</option>
                    </select>

                    <input
                      type='number'
                      value={newQuestion.expectedDuration}
                      onChange={(e) =>
                        setNewQuestion({
                          ...newQuestion,
                          expectedDuration: parseInt(e.target.value),
                        })
                      }
                      className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      placeholder='Duration (seconds)'
                    />

                    <input
                      type='text'
                      value={newQuestion.category}
                      onChange={(e) =>
                        setNewQuestion({
                          ...newQuestion,
                          category: e.target.value,
                        })
                      }
                      className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      placeholder='Category'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Suggested Answer Points (Optional)
                    </label>
                    {newQuestion.suggestedAnswers.map((answer, index) => (
                      <div
                        key={index}
                        className='flex items-center space-x-2 mb-2'
                      >
                        <input
                          type='text'
                          value={answer}
                          onChange={(e) => {
                            const updated = [...newQuestion.suggestedAnswers];
                            updated[index] = e.target.value;
                            setNewQuestion({
                              ...newQuestion,
                              suggestedAnswers: updated,
                            });
                          }}
                          className='flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                          placeholder='Enter suggested answer point'
                        />
                        <button
                          onClick={() => {
                            const updated = newQuestion.suggestedAnswers.filter(
                              (_, i) => i !== index
                            );
                            setNewQuestion({
                              ...newQuestion,
                              suggestedAnswers: updated,
                            });
                          }}
                          className='text-red-600 hover:text-red-700'
                        >
                          <Trash2 className='h-4 w-4' />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() =>
                        setNewQuestion({
                          ...newQuestion,
                          suggestedAnswers: [
                            ...newQuestion.suggestedAnswers,
                            '',
                          ],
                        })
                      }
                      className='flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm'
                    >
                      <Plus className='h-4 w-4' />
                      <span>Add Answer Point</span>
                    </button>
                  </div>

                  <button
                    onClick={addQuestion}
                    disabled={!newQuestion.question.trim()}
                    className='w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400'
                  >
                    Add Question
                  </button>
                </div>
              </div>
            </div>

            {/* Final Actions */}
            <div className='bg-white rounded-2xl shadow-lg p-4 sm:p-8'>
              <div className='flex flex-col sm:flex-row justify-between gap-4'>
                <button
                  onClick={() => setStep(2)}
                  disabled={continueLoading}
                  className='w-full sm:w-auto border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors order-2 sm:order-1'
                >
                  Back
                </button>
                <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-4 order-1 sm:order-2 w-full sm:w-auto'>
                  <button
                    disabled={continueLoading}
                    onClick={() => handleSubmit(true)}
                    className='w-full sm:w-auto border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors'
                  >
                    Save as Draft
                  </button>
                  <button
                    disabled={continueLoading}
                    onClick={() => handleSubmit(false)}
                    className='w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors'
                  >
                    {continueLoading ? (
                      <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto'></div>
                    ) : (
                      <>Publish Job Post</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Student List Modal */}
      {studentListModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col'>
            {/* Modal Header */}
            <div className='flex justify-between items-center px-4 sm:px-6 py-4 border-b sticky top-0 bg-white z-10'>
              <div className='flex items-center space-x-3'>
                <Users className='h-6 w-6 text-purple-600' />
                <h2 className='text-lg sm:text-xl font-bold'>Student List</h2>
              </div>
              <button
                onClick={() => setStudentListModal(false)}
                className='text-gray-500 hover:text-gray-800 p-1'
              >
                <X className='h-6 w-6' />
              </button>
            </div>

            {/* Modal Content */}
            <div className='flex-1 overflow-y-auto p-4 sm:p-6'>
              {/* Step 1: Download Template */}
              <div className='mb-6 p-4 bg-green-50 rounded-lg border border-green-200'>
                <div className='flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-3'>
                  <Download className='h-5 w-5 text-green-600 mt-1 flex-shrink-0' />
                  <div className='flex-1'>
                    <h3 className='text-base sm:text-lg font-semibold text-gray-900 mb-2'>
                      Step 1: Download Template
                    </h3>
                    <p className='text-sm text-gray-600 mb-3'>
                      Download the Excel template, fill in student details
                      (name, email, phone number), and save it.
                    </p>
                    <button
                      onClick={handleDownloadStudentTemplate}
                      className='flex items-center justify-center space-x-2 bg-white border-2 border-green-600 text-green-600 px-4 py-2 rounded-lg hover:bg-green-50 transition-colors w-full sm:w-auto'
                    >
                      <Download className='h-4 w-4' />
                      <span className='text-sm sm:text-base'>
                        Download Template
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 2: Upload Student List */}
              <div className='mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200'>
                <div className='flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-3'>
                  <Upload className='h-5 w-5 text-purple-600 mt-1 flex-shrink-0' />
                  <div className='flex-1'>
                    <h3 className='text-base sm:text-lg font-semibold text-gray-900 mb-2'>
                      Step 2: Upload Student List
                    </h3>
                    <p className='text-sm text-gray-600 mb-3'>
                      This will add new students to the existing list.
                    </p>

                    <label
                      htmlFor='student-excel-upload'
                      className={`flex items-center justify-center space-x-2 cursor-pointer bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors w-full sm:w-auto ${
                        studentUploadLoading
                          ? 'opacity-50 cursor-not-allowed'
                          : ''
                      }`}
                    >
                      <Upload className='h-4 w-4' />
                      <span className='text-sm sm:text-base'>
                        {studentUploadLoading
                          ? 'Uploading...'
                          : 'Upload Excel File'}
                      </span>
                    </label>
                    <input
                      id='student-excel-upload'
                      type='file'
                      accept='.xlsx,.xls'
                      className='hidden'
                      disabled={studentUploadLoading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleStudentExcelUpload(file);
                          e.target.value = '';
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Success Message */}
              {studentSuccess && (
                <div className='mb-4 p-3 bg-green-100 border border-green-300 rounded-lg flex items-start space-x-2'>
                  <AlertCircle className='h-5 w-5 text-green-600 flex-shrink-0 mt-0.5' />
                  <p className='text-sm text-green-800'>{studentSuccess}</p>
                </div>
              )}

              {/* Error Message */}
              {studentError && (
                <div className='mb-4 p-3 bg-red-100 border border-red-300 rounded-lg flex items-start space-x-2'>
                  <AlertCircle className='h-5 w-5 text-red-600 flex-shrink-0 mt-0.5' />
                  <div className='flex-1'>
                    <p className='text-sm text-red-800 whitespace-pre-line'>
                      {studentError}
                    </p>
                  </div>
                </div>
              )}

              {/* Student List */}
              {students.length > 0 && (
                <div className='mt-6'>
                  <h3 className='text-base sm:text-lg font-semibold text-gray-900 mb-4'>
                    Uploaded Students ({students.length})
                  </h3>
                  <div className='space-y-3 max-h-[300px] overflow-y-auto pr-2'>
                    {students.map((student, index) => (
                      <div
                        key={index}
                        className='flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 gap-2'
                      >
                        <div className='flex-1 min-w-0'>
                          <p className='text-sm font-medium text-gray-900 truncate'>
                            {student.name}
                          </p>
                          <p className='text-xs text-gray-600 truncate'>
                            {student.email}
                          </p>
                          <p className='text-xs text-gray-600'>
                            {student.phoneNumber}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveStudent(index)}
                          className='text-red-600 hover:text-red-700 flex-shrink-0 self-end sm:self-center p-1'
                        >
                          <Trash2 className='h-4 w-4' />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className='border-t p-4 sm:p-6 bg-gray-50 sticky bottom-0'>
              <button
                onClick={() => setStudentListModal(false)}
                className='w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors'
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
