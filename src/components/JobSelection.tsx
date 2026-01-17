import React from 'react';
import { ArrowLeft, Briefcase, MapPin, Clock, Users, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function JobSelection() {
  const { state, dispatch } = useApp();

  const selectJob = (jobPost: any) => {
    dispatch({ type: 'SET_CURRENT_JOB_POST', payload: jobPost });
    dispatch({ type: 'SET_VIEW', payload: 'profile' });
  };

  // Mock job posts for demonstration
  const mockJobPosts = [
    {
      id: '1',
      title: 'Senior Frontend Developer',
      company: 'TechCorp Inc.',
      department: 'Engineering',
      location: 'San Francisco, CA',
      type: 'full-time' as const,
      experience: 'senior',
      description: 'We are looking for a Senior Frontend Developer to join our dynamic team...',
      requirements: ['5+ years React experience', 'TypeScript proficiency', 'Team leadership'],
      responsibilities: ['Lead frontend architecture', 'Mentor junior developers', 'Code reviews'],
      skills: ['React', 'TypeScript', 'Node.js', 'GraphQL'],
      salary: { min: 120000, max: 160000, currency: 'USD' },
      questions: [],
      status: 'active' as const,
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-15'),
      createdBy: 'admin'
    },
    {
      id: '2',
      title: 'Product Manager',
      company: 'InnovateLabs',
      department: 'Product',
      location: 'New York, NY',
      type: 'full-time' as const,
      experience: 'mid',
      description: 'Join our product team to drive innovation and user experience...',
      requirements: ['3+ years PM experience', 'Agile methodology', 'Data-driven mindset'],
      responsibilities: ['Product roadmap planning', 'Stakeholder management', 'User research'],
      skills: ['Product Strategy', 'Agile', 'Analytics', 'User Research'],
      salary: { min: 100000, max: 140000, currency: 'USD' },
      questions: [],
      status: 'active' as const,
      createdAt: new Date('2024-01-12'),
      updatedAt: new Date('2024-01-16'),
      createdBy: 'admin'
    },
    {
      id: '3',
      title: 'Data Scientist',
      company: 'DataFlow Solutions',
      department: 'Analytics',
      location: 'Remote',
      type: 'full-time' as const,
      experience: 'mid',
      description: 'Looking for a Data Scientist to extract insights from complex datasets...',
      requirements: ['Python/R proficiency', 'Machine Learning', 'Statistical analysis'],
      responsibilities: ['Model development', 'Data analysis', 'Reporting insights'],
      skills: ['Python', 'Machine Learning', 'SQL', 'Statistics'],
      salary: { min: 110000, max: 150000, currency: 'USD' },
      questions: [],
      status: 'active' as const,
      createdAt: new Date('2024-01-08'),
      updatedAt: new Date('2024-01-14'),
      createdBy: 'admin'
    }
  ];

  const getExperienceLabel = (exp: string) => {
    const labels: { [key: string]: string } = {
      'entry': 'Entry Level',
      'junior': 'Junior',
      'mid': 'Mid Level',
      'senior': 'Senior',
      'lead': 'Lead/Manager'
    };
    return labels[exp] || exp;
  };

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'full-time': 'bg-green-100 text-green-800',
      'part-time': 'bg-blue-100 text-blue-800',
      'contract': 'bg-yellow-100 text-yellow-800',
      'internship': 'bg-purple-100 text-purple-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <button 
              onClick={() => dispatch({ type: 'SET_VIEW', payload: 'landing' })}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Home</span>
            </button>
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Select Position</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Interview Position
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Select the position you'd like to interview for. Each role has tailored questions 
            designed to evaluate the specific skills and competencies required.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockJobPosts.map((job) => (
            <div key={job.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
              <div className="p-8">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {job.title}
                    </h3>
                    <p className="text-lg font-medium text-gray-700 mb-1">{job.company}</p>
                    <p className="text-sm text-gray-500">{job.department}</p>
                  </div>
                  <div className="flex items-center space-x-1 text-yellow-500">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="text-sm font-medium">4.8</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">
                      {Array.isArray(job.location) 
                        ? job.location.join(", ") 
                        : job.location || "Not specified"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">{getExperienceLabel(job.experience)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(job.type)}`}>
                      {job.type.charAt(0).toUpperCase() + job.type.slice(1).replace('-', ' ')}
                    </span>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                    {job.description}
                  </p>
                </div>

                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-2">Key Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.slice(0, 4).map((skill, index) => (
                      <span key={index} className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-medium">
                        {skill}
                      </span>
                    ))}
                    {job.skills.length > 4 && (
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs font-medium">
                        +{job.skills.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {job.salary && (
                  <div className="mb-6 p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-800">Salary Range</span>
                      <span className="text-sm font-bold text-green-900">
                        ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => selectJob(job)}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium group-hover:bg-blue-700"
                >
                  Start Interview for This Position
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
            <div className="bg-blue-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Don't See Your Position?</h3>
            <p className="text-gray-600 mb-4">
              We're constantly adding new positions. Contact our team to request a specific role 
              or create a custom interview experience.
            </p>
            <button className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors">
              Request Custom Position
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}