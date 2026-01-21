import { Brain, Video, Award, ArrowRight, CheckCircle, Briefcase } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function LandingPage() {
  const { dispatch } = useApp();
  const token = localStorage.getItem('token');

  const handleGetStarted = () => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      // User is logged in, go to dashboard
      dispatch({ type: 'SET_VIEW', payload: 'admin' });
    } else {
      // Not logged in, go to register
      dispatch({ type: 'SET_VIEW', payload: 'register' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">InterviewAI</span>
            </div>
            <div className="flex items-center space-x-4">
              {!token && <button
                onClick={() => {
                  const token = localStorage.getItem('token');
                  if (token) {
                    // Already logged in, go to dashboard
                    dispatch({ type: 'SET_VIEW', payload: 'admin' });
                  } else {
                    // Not logged in, go to login
                    dispatch({ type: 'SET_VIEW', payload: 'login' });
                  }
                }}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Login
              </button>}
              <button
                onClick={handleGetStarted}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Master Your Next Interview with
              <span className="text-blue-600"> AI-Powered Practice</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Get real-time feedback on your communication skills, body language, and technical expertise.
              Practice with our advanced AI interviewer and land your dream job.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleGetStarted}
                className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg flex items-center justify-center space-x-2"
              >
                <span>Start Interview Practice</span>
                <ArrowRight className="h-5 w-5" />
              </button>
              <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg hover:border-gray-400 transition-colors font-semibold text-lg">
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need to Ace Your Interview
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our comprehensive platform evaluates every aspect of your interview performance
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="bg-blue-100 p-4 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Video className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Live Video Analysis</h3>
              <p className="text-gray-600">Real-time body language and facial expression evaluation</p>
            </div>

            <div className="text-center group">
              <div className="bg-teal-100 p-4 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:bg-teal-200 transition-colors">
                <Brain className="h-8 w-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered Questions</h3>
              <p className="text-gray-600">Tailored questions based on your role and experience</p>
            </div>

            <div className="text-center group">
              <div className="bg-green-100 p-4 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <Award className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Detailed Scoring</h3>
              <p className="text-gray-600">Comprehensive feedback on all interview aspects</p>
            </div>

            <div className="text-center group">
              <div className="bg-purple-100 p-4 rounded-2xl w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <Briefcase className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Job-Specific Practice</h3>
              <p className="text-gray-600">Practice with questions tailored to specific positions</p>
            </div>
          </div>
        </div>
      </section>

      {/* Evaluation Criteria */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Comprehensive Evaluation Criteria
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Our AI evaluates multiple dimensions of your interview performance to provide actionable insights.
              </p>

              <div className="space-y-4">
                {[
                  'Communication Skills & Clarity',
                  'Technical Knowledge & Problem Solving',
                  'Body Language & Confidence',
                  'Professional Attire & Presentation',
                  'Response Timing & Structure',
                  'Eye Contact & Engagement'
                ].map((criteria, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">{criteria}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="text-center mb-6">
                <div className="bg-blue-600 text-white text-lg font-bold py-2 px-4 rounded-lg inline-block">
                  Sample Score Report
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { label: 'Overall Score', score: 85, color: 'bg-blue-600' },
                  { label: 'Communication', score: 92, color: 'bg-green-600' },
                  { label: 'Technical Skills', score: 78, color: 'bg-yellow-600' },
                  { label: 'Body Language', score: 88, color: 'bg-teal-600' },
                  { label: 'Confidence', score: 81, color: 'bg-purple-600' }
                ].map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">{item.label}</span>
                      <span className="text-sm font-bold text-gray-900">{item.score}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`${item.color} h-2 rounded-full transition-all duration-1000`}
                        style={{ width: `${item.score}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Interview Skills?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of professionals who have improved their interview performance with InterviewAI
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg"
          >
            Start Your Free Practice Session
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold">InterviewAI</span>
          </div>
          <p className="text-gray-400">
            © 2024 InterviewAI. Empowering careers through AI-powered interview practice.
          </p>
        </div>
      </footer>
    </div>
  );
}