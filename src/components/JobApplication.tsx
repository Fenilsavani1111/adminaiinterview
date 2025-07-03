import React, { useState } from 'react';
import { Upload, User, Mail, Phone, Linkedin, FileText, ArrowRight, Building, MapPin, Clock, DollarSign, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { JobApplication as JobApplicationType, User as UserType } from '../types';

export function JobApplication() {
  const { state, dispatch } = useApp();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    experience: '',
    skills: '',
    linkedinUrl: '',
    coverLetter: '',
    resumeFile: null as File | null
  });
  const [dragActive, setDragActive] = useState(false);

  const jobPost = state.currentJobPost;

  if (!jobPost) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h1>
          <p className="text-gray-600">This job posting is no longer available or has been removed.</p>
        </div>
      </div>
    );
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || file.name.endsWith('.doc') || file.name.endsWith('.docx')) {
        setFormData({ ...formData, resumeFile: file });
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, resumeFile: e.target.files[0] });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create application
    const application: JobApplicationType = {
      id: Date.now().toString(),
      jobPostId: jobPost.id,
      candidateName: formData.name,
      candidateEmail: formData.email,
      candidatePhone: formData.phone,
      experience: formData.experience,
      skills: formData.skills.split(',').map(skill => skill.trim()),
      linkedinUrl: formData.linkedinUrl,
      resumeFile: formData.resumeFile,
      resumeUrl: formData.resumeFile?.name,
      coverLetter: formData.coverLetter,
      appliedAt: new Date(),
      status: 'applied'
    };

    // Create user for interview
    const user: UserType = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      experience: formData.experience,
      position: jobPost.title,
      skills: formData.skills.split(',').map(skill => skill.trim()),
      linkedinUrl: formData.linkedinUrl,
      resumeUrl: formData.resumeFile?.name,
      createdAt: new Date()
    };

    dispatch({ type: 'ADD_APPLICATION', payload: application });
    dispatch({ type: 'ADD_USER', payload: user });
    dispatch({ type: 'SET_CURRENT_USER', payload: user });
    dispatch({ type: 'SET_CURRENT_APPLICATION', payload: application });
    dispatch({ type: 'SET_VIEW', payload: 'candidate-interview' });
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Building className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">{jobPost.company}</h1>
            </div>
            <h2 className="text-xl text-gray-700">{jobPost.title}</h2>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Job Details Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Job Details</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">{jobPost.location}</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700 capitalize">{jobPost.type.replace('-', ' ')}</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700 capitalize">{jobPost.experience} Level</span>
                </div>
                
                {jobPost.salary && (
                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-700">
                      ${jobPost.salary.min.toLocaleString()} - ${jobPost.salary.max.toLocaleString()} {jobPost.salary.currency}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-3">Required Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {jobPost.skills.slice(0, 6).map((skill, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">AI Interview Process</span>
                </div>
                <p className="text-sm text-green-700">
                  After submitting your application, you'll immediately start an AI-powered video interview tailored to this position.
                </p>
              </div>
            </div>
          </div>

          {/* Application Form */}
          <div className="lg:col-span-2">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Application Progress</span>
                <span className="text-sm font-medium text-gray-600">{step}/3</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(step / 3) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8">
              <form onSubmit={handleSubmit}>
                {step === 1 && (
                  <div className="space-y-6">
                    <div className="text-center mb-8">
                      <div className="bg-blue-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <User className="h-8 w-8 text-blue-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Personal Information</h2>
                      <p className="text-gray-600">Tell us about yourself</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Enter your email"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Enter your phone number"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          LinkedIn Profile
                        </label>
                        <div className="relative">
                          <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="url"
                            value={formData.linkedinUrl}
                            onChange={(e) => setFormData({...formData, linkedinUrl: e.target.value})}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="linkedin.com/in/yourprofile"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={nextStep}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
                      >
                        <span>Continue</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <div className="text-center mb-8">
                      <div className="bg-teal-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <FileText className="h-8 w-8 text-teal-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Professional Background</h2>
                      <p className="text-gray-600">Share your experience and skills</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Years of Experience *
                      </label>
                      <select
                        required
                        value={formData.experience}
                        onChange={(e) => setFormData({...formData, experience: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        <option value="">Select experience level</option>
                        <option value="entry">0-1 years (Entry Level)</option>
                        <option value="junior">2-3 years (Junior)</option>
                        <option value="mid">4-6 years (Mid Level)</option>
                        <option value="senior">7-10 years (Senior)</option>
                        <option value="lead">10+ years (Lead/Manager)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Key Skills *
                      </label>
                      <textarea
                        required
                        value={formData.skills}
                        onChange={(e) => setFormData({...formData, skills: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        rows={3}
                        placeholder="Enter your key skills separated by commas (e.g., JavaScript, React, Node.js, Python)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cover Letter (Optional)
                      </label>
                      <textarea
                        value={formData.coverLetter}
                        onChange={(e) => setFormData({...formData, coverLetter: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        rows={4}
                        placeholder="Why are you interested in this position? What makes you a great fit?"
                      />
                    </div>

                    <div className="flex justify-between">
                      <button
                        type="button"
                        onClick={prevStep}
                        className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={nextStep}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
                      >
                        <span>Continue</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <div className="text-center mb-8">
                      <div className="bg-green-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Upload className="h-8 w-8 text-green-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Resume</h2>
                      <p className="text-gray-600">Upload your resume to complete your application</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4">
                        Resume/CV *
                      </label>
                      <div 
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                      >
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-lg font-medium text-gray-900 mb-2">
                          {formData.resumeFile ? formData.resumeFile.name : 'Drop your resume here'}
                        </p>
                        <p className="text-sm text-gray-600 mb-4">
                          or click to browse files
                        </p>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileChange}
                          className="hidden"
                          id="resume-upload"
                          required
                        />
                        <label
                          htmlFor="resume-upload"
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer inline-block"
                        >
                          Choose File
                        </label>
                        <p className="text-xs text-gray-500 mt-2">
                          PDF, DOC, DOCX up to 10MB
                        </p>
                      </div>
                      
                      {formData.resumeFile && (
                        <div className="mt-4 p-4 bg-green-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span className="text-green-800 font-medium">{formData.resumeFile.name}</span>
                            <span className="text-green-600 text-sm">
                              ({(formData.resumeFile.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="bg-blue-50 p-6 rounded-lg">
                      <h3 className="font-medium text-blue-900 mb-2">Ready for AI Interview?</h3>
                      <p className="text-sm text-blue-700 mb-4">
                        After submitting your application, you'll immediately start a personalized AI video interview. 
                        The interview will be tailored to the {jobPost.title} position and will evaluate your:
                      </p>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Communication skills and clarity</li>
                        <li>• Technical knowledge relevant to the role</li>
                        <li>• Professional presentation and body language</li>
                        <li>• Problem-solving approach</li>
                      </ul>
                    </div>

                    <div className="flex justify-between">
                      <button
                        type="button"
                        onClick={prevStep}
                        className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center space-x-2"
                      >
                        <span>Submit & Start Interview</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}