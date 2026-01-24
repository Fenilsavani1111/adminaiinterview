import React, { useState, useEffect, useRef } from 'react';
import { Camera, Mic, MicOff, Video, VideoOff, ArrowLeft, Clock, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { InterviewSession, InterviewQuestion, InterviewResponse } from '../types';

const sampleQuestions: InterviewQuestion[] = [
  {
    id: '1',
    question: 'Tell me about yourself and your professional background.',
    type: 'general',
    expectedDuration: 120,
  },
  {
    id: '2',
    question: 'Why are you interested in this position and our company?',
    type: 'behavioral',
    expectedDuration: 90,
  },
  {
    id: '3',
    question: 'Describe a challenging project you worked on and how you overcame obstacles.',
    type: 'behavioral',
    expectedDuration: 150,
  },
  {
    id: '4',
    question: 'How do you stay updated with the latest technologies in your field?',
    type: 'technical',
    expectedDuration: 90,
  },
  {
    id: '5',
    question: 'Where do you see yourself in the next 5 years?',
    type: 'general',
    expectedDuration: 90,
  },
];

export function InterviewInterface() {
  const { state, dispatch } = useApp();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [currentResponse, setCurrentResponse] = useState('');
  const [sessionStarted, setSessionStarted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (sessionStarted) {
      const timer = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [sessionStarted]);

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const startInterview = () => {
    if (!state.currentUser) return;

    const newSession: InterviewSession = {
      id: Date.now().toString(),
      userId: state.currentUser.id,
      startTime: new Date(),
      status: 'inprogress',
      questions: sampleQuestions,
      responses: [],
    };

    dispatch({ type: 'SET_CURRENT_SESSION', payload: newSession });
    setSessionStarted(true);
  };

  const recordResponse = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      // Start recording logic would go here
      setCurrentResponse('');
    } else {
      // End recording and save response
      if (state.currentSession) {
        const response: InterviewResponse = {
          questionId: sampleQuestions[currentQuestionIndex].id,
          response:
            currentResponse || `Response to: ${sampleQuestions[currentQuestionIndex].question}`,
          duration: Math.floor(Math.random() * 60) + 30,
          timestamp: new Date(),
        };

        const updatedSession = {
          ...state.currentSession,
          responses: [...state.currentSession.responses, response],
        };

        dispatch({ type: 'UPDATE_SESSION', payload: updatedSession });
      }
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < sampleQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setIsRecording(false);
      setCurrentResponse('');
    } else {
      completeInterview();
    }
  };

  const completeInterview = () => {
    if (state.currentSession) {
      const completedSession = {
        ...state.currentSession,
        endTime: new Date(),
        status: 'completed' as const,
        evaluation: {
          overall: Math.floor(Math.random() * 30) + 70,
          communication: Math.floor(Math.random() * 30) + 65,
          technical: Math.floor(Math.random() * 35) + 60,
          bodyLanguage: Math.floor(Math.random() * 25) + 70,
          confidence: Math.floor(Math.random() * 30) + 65,
          attire: Math.floor(Math.random() * 20) + 80,
          feedback:
            'Overall strong performance with good communication skills. Consider improving technical depth in responses.',
          strengths: ['Clear communication', 'Professional presence', 'Good eye contact'],
          improvements: ['Technical depth', 'Response structure', 'Confidence in complex topics'],
        },
      };

      dispatch({ type: 'UPDATE_SESSION', payload: completedSession });
      dispatch({ type: 'SET_VIEW', payload: 'results' });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!sessionStarted) {
    return (
      <div className='min-h-screen bg-gray-900 flex items-center justify-center'>
        <div className='max-w-4xl mx-auto px-4'>
          <div className='bg-white rounded-2xl shadow-2xl overflow-hidden'>
            <div className='p-8 text-center'>
              <div className='mb-8'>
                <div className='bg-blue-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center'>
                  <Video className='h-10 w-10 text-blue-600' />
                </div>
                <h1 className='text-3xl font-bold text-gray-900 mb-2'>
                  Ready for Your AI Interview?
                </h1>
                <p className='text-lg text-gray-600'>
                  Hi {state.currentUser?.name}! Let's begin your practice session for{' '}
                  {state.currentUser?.position}
                </p>
              </div>

              <div className='grid md:grid-cols-2 gap-8 mb-8'>
                <div className='bg-gray-50 p-6 rounded-xl'>
                  <h3 className='font-semibold text-gray-900 mb-4'>Camera Preview</h3>
                  <div className='aspect-video bg-gray-800 rounded-lg overflow-hidden relative'>
                    <video ref={videoRef} autoPlay muted className='w-full h-full object-cover' />
                    {!videoEnabled && (
                      <div className='absolute inset-0 bg-gray-800 flex items-center justify-center'>
                        <VideoOff className='h-8 w-8 text-gray-400' />
                      </div>
                    )}
                  </div>
                  <div className='flex justify-center space-x-4 mt-4'>
                    <button
                      onClick={() => setVideoEnabled(!videoEnabled)}
                      className={`p-3 rounded-full ${videoEnabled ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}
                    >
                      {videoEnabled ? (
                        <Video className='h-5 w-5' />
                      ) : (
                        <VideoOff className='h-5 w-5' />
                      )}
                    </button>
                    <button
                      onClick={() => setAudioEnabled(!audioEnabled)}
                      className={`p-3 rounded-full ${audioEnabled ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}
                    >
                      {audioEnabled ? <Mic className='h-5 w-5' /> : <MicOff className='h-5 w-5' />}
                    </button>
                  </div>
                </div>

                <div className='text-left'>
                  <h3 className='font-semibold text-gray-900 mb-4'>Interview Details</h3>
                  <div className='space-y-3'>
                    <div className='flex items-center space-x-3'>
                      <User className='h-5 w-5 text-gray-400' />
                      <span className='text-gray-700'>Position: {state.currentUser?.position}</span>
                    </div>
                    <div className='flex items-center space-x-3'>
                      <Clock className='h-5 w-5 text-gray-400' />
                      <span className='text-gray-700'>Estimated Duration: 15-20 minutes</span>
                    </div>
                    <div className='bg-blue-50 p-4 rounded-lg mt-4'>
                      <h4 className='font-medium text-blue-900 mb-2'>What to Expect:</h4>
                      <ul className='text-sm text-blue-700 space-y-1'>
                        <li>• {sampleQuestions.length} carefully selected questions</li>
                        <li>• Real-time analysis of your responses</li>
                        <li>• Body language and communication assessment</li>
                        <li>• Detailed feedback at the end</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className='flex justify-center space-x-4'>
                <button
                  onClick={() => dispatch({ type: 'SET_VIEW', payload: 'profile' })}
                  className='flex items-center space-x-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors'
                >
                  <ArrowLeft className='h-5 w-5' />
                  <span>Back</span>
                </button>
                <button
                  onClick={startInterview}
                  className='bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold'
                  disabled={!videoEnabled || !audioEnabled}
                >
                  Start Interview
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-900 text-white'>
      {/* Header */}
      <div className='bg-gray-800 border-b border-gray-700 p-4'>
        <div className='max-w-7xl mx-auto flex justify-between items-center'>
          <div className='flex items-center space-x-4'>
            <h1 className='text-xl font-semibold'>AI Interview Session</h1>
            <div className='flex items-center space-x-2 text-gray-300'>
              <Clock className='h-4 w-4' />
              <span>{formatTime(timeElapsed)}</span>
            </div>
          </div>
          <div className='text-sm text-gray-300'>
            Question {currentQuestionIndex + 1} of {sampleQuestions.length}
          </div>
        </div>
      </div>

      <div className='flex h-[calc(100vh-80px)]'>
        {/* Video Panel */}
        <div className='flex-1 p-6'>
          <div className='bg-gray-800 rounded-xl p-6 h-full'>
            <div className='aspect-video bg-gray-900 rounded-lg overflow-hidden relative mb-6'>
              <video ref={videoRef} autoPlay muted className='w-full h-full object-cover' />
              {!videoEnabled && (
                <div className='absolute inset-0 bg-gray-900 flex items-center justify-center'>
                  <VideoOff className='h-12 w-12 text-gray-400' />
                </div>
              )}

              {/* Recording Indicator */}
              {isRecording && (
                <div className='absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2'>
                  <div className='w-2 h-2 bg-white rounded-full animate-pulse'></div>
                  <span>Recording</span>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className='flex justify-center space-x-4'>
              <button
                onClick={() => setVideoEnabled(!videoEnabled)}
                className={`p-4 rounded-full ${videoEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'} transition-colors`}
              >
                {videoEnabled ? <Video className='h-6 w-6' /> : <VideoOff className='h-6 w-6' />}
              </button>

              <button
                onClick={recordResponse}
                className={`p-4 rounded-full ${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} transition-colors`}
              >
                <Mic className='h-6 w-6' />
              </button>

              <button
                onClick={() => setAudioEnabled(!audioEnabled)}
                className={`p-4 rounded-full ${audioEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'} transition-colors`}
              >
                {audioEnabled ? <Mic className='h-6 w-6' /> : <MicOff className='h-6 w-6' />}
              </button>
            </div>
          </div>
        </div>

        {/* Question Panel */}
        <div className='w-96 bg-gray-800 p-6'>
          <div className='space-y-6'>
            <div>
              <div className='flex items-center justify-between mb-4'>
                <span className='text-sm text-gray-400 uppercase tracking-wide'>
                  {sampleQuestions[currentQuestionIndex].type} Question
                </span>
                <span className='text-sm text-gray-400'>
                  {sampleQuestions[currentQuestionIndex].expectedDuration}s
                </span>
              </div>

              <div className='bg-gray-700 p-4 rounded-lg mb-6'>
                <p className='text-lg leading-relaxed'>
                  {sampleQuestions[currentQuestionIndex].question}
                </p>
              </div>
            </div>

            {/* Response Area */}
            <div>
              <label className='block text-sm font-medium text-gray-300 mb-2'>
                Your Response (Optional Notes)
              </label>
              <textarea
                value={currentResponse}
                onChange={(e) => setCurrentResponse(e.target.value)}
                className='w-full h-32 bg-gray-700 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                placeholder='Take notes while you speak...'
              />
            </div>

            {/* Progress */}
            <div>
              <div className='flex justify-between text-sm text-gray-400 mb-2'>
                <span>Progress</span>
                <span>
                  {currentQuestionIndex + 1}/{sampleQuestions.length}
                </span>
              </div>
              <div className='w-full bg-gray-700 rounded-full h-2'>
                <div
                  className='bg-blue-600 h-2 rounded-full transition-all duration-300'
                  style={{
                    width: `${((currentQuestionIndex + 1) / sampleQuestions.length) * 100}%`,
                  }}
                ></div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className='space-y-3'>
              {currentQuestionIndex < sampleQuestions.length - 1 ? (
                <button
                  onClick={nextQuestion}
                  className='w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium'
                  disabled={isRecording}
                >
                  Next Question
                </button>
              ) : (
                <button
                  onClick={completeInterview}
                  className='w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium'
                  disabled={isRecording}
                >
                  Complete Interview
                </button>
              )}

              <button
                onClick={() => dispatch({ type: 'SET_VIEW', payload: 'landing' })}
                className='w-full border border-gray-600 text-gray-300 py-3 rounded-lg hover:bg-gray-700 transition-colors'
              >
                Exit Interview
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
