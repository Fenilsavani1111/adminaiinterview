import React from 'react';
import { ArrowLeft, Download, Share2, Trophy, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function ResultsPage() {
  const { state, dispatch } = useApp();
  const session = state.currentSession;
  const evaluation = session?.evaluation;

  if (!session || !evaluation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No interview results found</p>
          <button
            onClick={() => dispatch({ type: 'SET_VIEW', payload: 'landing' })}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 70) return 'text-blue-600 bg-blue-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreGrade = (score: number) => {
    if (score >= 90) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 80) return 'A-';
    if (score >= 75) return 'B+';
    if (score >= 70) return 'B';
    if (score >= 65) return 'B-';
    if (score >= 60) return 'C+';
    return 'C';
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
                <Share2 className="h-5 w-5" />
                <span>Share Results</span>
              </button>
              <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="h-5 w-5" />
                <span>Download Report</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className={`p-4 rounded-full ${getScoreColor(evaluation.overall)}`}>
                <Trophy className="h-8 w-8" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Interview Complete!</h1>
            <p className="text-lg text-gray-600">
              Great job, {state.currentUser?.name}! Here's your detailed performance analysis.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {evaluation.overall}%
              </div>
              <div className="text-sm text-gray-600">Overall Score</div>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${getScoreColor(evaluation.overall)}`}>
                Grade: {getScoreGrade(evaluation.overall)}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {session.responses.length}
              </div>
              <div className="text-sm text-gray-600">Questions Answered</div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {Math.floor((new Date(session.endTime!).getTime() - new Date(session.startTime).getTime()) / (1000 * 60))}
              </div>
              <div className="text-sm text-gray-600">Minutes Duration</div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Detailed Scores */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Performance Breakdown</h2>
            
            <div className="space-y-6">
              {[
                { label: 'Communication Skills', score: evaluation.communication, icon: '💬' },
                { label: 'Technical Knowledge', score: evaluation.technical, icon: '🔧' },
                { label: 'Body Language', score: evaluation.bodyLanguage, icon: '👤' },
                { label: 'Confidence Level', score: evaluation.confidence, icon: '💪' },
                { label: 'Professional Attire', score: evaluation.attire, icon: '👔' }
              ].map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{item.icon}</span>
                      <span className="font-medium text-gray-900">{item.label}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-gray-900">{item.score}%</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getScoreColor(item.score)}`}>
                        {getScoreGrade(item.score)}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-1000 ${
                        item.score >= 80 ? 'bg-green-500' :
                        item.score >= 70 ? 'bg-blue-500' :
                        item.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${item.score}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feedback & Recommendations */}
          <div className="space-y-8">
            {/* AI Feedback */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">AI Feedback</h2>
              <div className="bg-blue-50 p-6 rounded-xl">
                <p className="text-gray-700 leading-relaxed">
                  {evaluation.feedback}
                </p>
              </div>
            </div>

            {/* Strengths */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <h2 className="text-2xl font-bold text-gray-900">Key Strengths</h2>
              </div>
              <div className="space-y-3">
                {evaluation.strengths.map((strength, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">{strength}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Areas for Improvement */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <TrendingUp className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Areas to Improve</h2>
              </div>
              <div className="space-y-3">
                {evaluation.improvements.map((improvement, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-700">{improvement}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-2xl shadow-lg p-8 mt-8 text-white">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Ready for Your Next Challenge?</h2>
            <p className="text-lg text-blue-100 mb-6">
              Keep practicing to improve your skills and confidence for real interviews.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => dispatch({ type: 'SET_VIEW', payload: 'profile' })}
                className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
              >
                Practice Again
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg hover:bg-white hover:text-blue-600 transition-colors font-semibold">
                Schedule Real Interview
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}