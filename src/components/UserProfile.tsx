import React, { useState } from 'react';
import { User, ArrowLeft, Linkedin, Upload, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { User as UserType } from '../types';

export function UserProfile() {
  const { dispatch } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    experience: '',
    position: '',
    skills: '',
    linkedinUrl: '',
    resumeUrl: ''
  });
  const [step, setStep] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newUser: UserType = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      experience: formData.experience,
      position: formData.position,
      skills: formData.skills.split(',').map(skill => skill.trim()),
      linkedinUrl: formData.linkedinUrl,
      resumeUrl: formData.resumeUrl,
      createdAt: new Date()
    };

    dispatch({ type: 'ADD_USER', payload: newUser });
    dispatch({ type: 'SET_CURRENT_USER', payload: newUser });
    dispatch({ type: 'SET_VIEW', payload: 'interview' });
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <button 
              onClick={() => dispatch({ type: 'SET_VIEW', payload: 'landing' })}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Home</span>
            </button>
          </div>
        </div>
      </header>

      <div className="py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Profile Setup</span>
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
                    <p className="text-gray-600">Let's start with your basic details</p>
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
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <div className="bg-teal-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <CheckCircle className="h-8 w-8 text-teal-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Professional Details</h2>
                    <p className="text-gray-600">Tell us about your professional background</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Position *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.position}
                      onChange={(e) => setFormData({...formData, position: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="e.g., Senior Software Engineer, Product Manager"
                    />
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
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Continue
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
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Final Steps</h2>
                    <p className="text-gray-600">Optional: Upload your resume for better-tailored questions</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Resume (Optional)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">
                        Click to upload or drag and drop your resume
                      </p>
                      <p className="text-xs text-gray-500">
                        PDF, DOC, DOCX up to 10MB
                      </p>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setFormData({...formData, resumeUrl: e.target.files[0].name});
                          }
                        }}
                      />
                    </div>
                    {formData.resumeUrl && (
                      <p className="text-sm text-green-600 mt-2 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {formData.resumeUrl} uploaded successfully
                      </p>
                    )}
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium text-blue-900 mb-2">Ready to Start?</h3>
                    <p className="text-sm text-blue-700">
                      Your interview will be tailored based on your profile. The session will include behavioral, 
                      technical, and general questions relevant to your target position.
                    </p>
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
                      className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      Start Interview
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}