import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Rewind,
  FastForward,
  PictureInPicture2,
  Settings,
  Eye,
} from 'lucide-react';
import { Candidate } from '../types';

// --- Utility helpers ---
function formatTime(s: number) {
  if (!isFinite(s) || isNaN(s)) return '00:00';
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = Math.floor(s % 60);
  const h = hours > 0 ? String(hours).padStart(2, '0') + ':' : '';
  return `${h}${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Props allow swapping src easily if needed
type VideoPlayerProps = {
  src?: string;
  interviewData: Candidate;
};

export const VideoPlayer = ({ src, interviewData }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [bufferedEnd, setBufferedEnd] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [seeking, setSeeking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState(0);
  const [showTranscript, setShowTranscript] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getQuestionScoreColor = (score: number, type: string) => {
    if (type === 'communication' || type === 'behavioral') {
      if (score >= 8) return 'text-green-600 bg-green-100';
      if (score >= 6) return 'text-blue-600 bg-blue-100';
      if (score >= 4) return 'text-yellow-600 bg-yellow-100';
      return 'text-red-600 bg-red-100';
    }
    if (score >= 1) return 'text-green-600 bg-green-100';
    return 'text-red-600 bg-red-100';
  };

  const jumpToQuestion = (questionIndex: number) => {
    const question = interviewData?.StudentInterviewAnswer?.[questionIndex];
    let data = [...(interviewData?.StudentInterviewAnswer ?? [])];
    let newdata = data?.splice(0, questionIndex);
    let secs = newdata?.reduce((acc, curr) => acc + curr?.responseTime, 0) ?? 0;
    if (question) {
      seekTo(secs + 1);
      setSelectedQuestion(questionIndex);
    }
  };

  // --- Core controls ---
  const play = async () => {
    try {
      await videoRef.current?.play();
      setIsPlaying(true);
    } catch (e) {
      // Autoplay or other errors
    }
  };
  const pause = () => {
    videoRef.current?.pause();
    setIsPlaying(false);
  };
  const togglePlay = () => (isPlaying ? pause() : play());

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setIsMuted(v.muted);
  };

  const changeVolume = (val: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.volume = val;
    v.muted = val === 0;
    setVolume(val);
    setIsMuted(v.muted);
  };

  const seekBy = (delta: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.min(Math.max(0, v.currentTime + delta), duration || v.duration || 0);
  };

  const seekTo = (time: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = time;
  };

  const handleSeek = (clientX: number) => {
    const bar = document.getElementById('progress-bar');
    if (!bar || !duration) return;

    const rect = bar.getBoundingClientRect();
    const pct = (clientX - rect.left) / rect.width;
    const newTime = Math.min(Math.max(0, pct), 1) * duration;
    seekTo(newTime);
  };

  const setRate = (rate: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const requestPiP = async () => {
    const v = videoRef.current as any;
    if (document.pictureInPictureEnabled && v && !v.disablePictureInPicture) {
      try {
        if (document.pictureInPictureElement) {
          await (document as any).exitPictureInPicture();
        } else {
          await v.requestPictureInPicture();
        }
      } catch { }
    }
  };

  const toggleFullscreen = async () => {
    const el = containerRef.current as any;
    try {
      if (!document.fullscreenElement) {
        await el?.requestFullscreen?.();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch { }
  };

  // --- Duration Infinity fix for certain WebM streams ---
  const appliedInfinityHack = useRef(false);
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onLoadedMetadata = () => {
      setDuration(v.duration);
      if (v.duration === Infinity && !appliedInfinityHack.current) {
        // Seek to a very large time to force duration discovery
        const onTimeUpdate = () => {
          if (v.duration === Infinity) {
            setDuration(v.currentTime);
          }
          v.removeEventListener('timeupdate', onTimeUpdate);
          try {
            v.currentTime = 0;
          } catch { }
        };
        v.addEventListener('timeupdate', onTimeUpdate);
        try {
          v.currentTime = 1e101; // trigger duration computation
        } catch { }
        appliedInfinityHack.current = true;
      }
    };

    const onDurationChange = () => setDuration(v.duration);
    const onTimeUpdateMain = () => setCurrentTime(v.currentTime);
    const onProgress = () => {
      try {
        const b = v.buffered;
        if (b.length > 0) setBufferedEnd(b.end(b.length - 1));
      } catch { }
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onVolumeChange = () => {
      setVolume(v.volume);
      setIsMuted(v.muted);
    };
    const onError = () => {
      const mediaError = v.error;
      let msg = 'Playback error';
      if (mediaError) {
        switch (mediaError.code) {
          case mediaError.MEDIA_ERR_ABORTED:
            msg = 'Playback aborted';
            break;
          case mediaError.MEDIA_ERR_NETWORK:
            msg = 'Network error while fetching video';
            break;
          case mediaError.MEDIA_ERR_DECODE:
            msg = 'Decoding error (codec unsupported?)';
            break;
          case mediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            msg = 'Video format or server not supported';
            break;
        }
      }
      setError(msg);
    };

    v.addEventListener('loadedmetadata', onLoadedMetadata);
    v.addEventListener('durationchange', onDurationChange);
    v.addEventListener('timeupdate', onTimeUpdateMain);
    v.addEventListener('progress', onProgress);
    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);
    v.addEventListener('volumechange', onVolumeChange);
    v.addEventListener('error', onError);

    return () => {
      v.removeEventListener('loadedmetadata', onLoadedMetadata);
      v.removeEventListener('durationchange', onDurationChange);
      v.removeEventListener('timeupdate', onTimeUpdateMain);
      v.removeEventListener('progress', onProgress);
      v.removeEventListener('play', onPlay);
      v.removeEventListener('pause', onPause);
      v.removeEventListener('volumechange', onVolumeChange);
      v.removeEventListener('error', onError);
    };
  }, []);

  // Keyboard shortcuts on the container for accessibility
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case ' ': // space
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'm':
          toggleMute();
          break;
        case 'ArrowLeft':
        case 'j':
          seekBy(-5);
          break;
        case 'ArrowRight':
        case 'l':
          seekBy(10);
          break;
        case ',': // frame-ish back (0.1s)
          seekBy(-0.1);
          break;
        case '.': // frame-ish forward (0.1s)
          seekBy(0.1);
          break;
        case 'f':
          toggleFullscreen();
          break;
        case ']':
          setRate(Math.min(2, playbackRate + 0.25));
          break;
        case '[':
          setRate(Math.max(0.25, playbackRate - 0.25));
          break;
        default:
          break;
      }
    };
    el.addEventListener('keydown', onKey as any);
    return () => el.removeEventListener('keydown', onKey as any);
  }, [playbackRate]);

  // Derived values for progress bars
  const playedPct = useMemo(() => {
    if (!duration) return 0;
    return Math.min(100, Math.max(0, (currentTime / duration) * 100));
  }, [currentTime, duration]);

  const bufferedPct = useMemo(() => {
    if (!duration) return 0;
    return Math.min(100, Math.max(0, (bufferedEnd / duration) * 100));
  }, [bufferedEnd, duration]);

  const getCurrentQuestion = () => {
    const data = [...(interviewData?.StudentInterviewAnswer ?? [])];
    // Build an array of questions with start and end times
    const questionsWithTimes = data.map((v, i) => {
      const start =
        i === 0 ? 0 : data.slice(0, i).reduce((acc, curr) => acc + (curr.responseTime ?? 0), 0);
      const end = start + (v.responseTime ?? 0);
      return {
        ...v,
        start,
        end,
      };
    });
    // Find the current question based on currentTime
    return questionsWithTimes.find(
      (q) => currentTime >= (q.start ?? 0) && currentTime <= (q.end ?? 0)
    );
    // };
    //     end:
    //       i === 0
    //         ? data[i]?.responseTime
    //         : newdata[i - 1]?.end + data[i]?.responseTime,
    //   };
    // });
    // console.log(questionsWithTimes, currentTime);
    // return questionsWithTimes?.find((q) => currentTime >= q?.start && currentTime <= q?.end);
  };

  useEffect(() => {
    const damicurrentQuestion = getCurrentQuestion();
    setSelectedQuestion(
      interviewData?.StudentInterviewAnswer?.findIndex((v) => v.id === damicurrentQuestion?.id) ?? 0
    );
    setCurrentQuestion({ ...damicurrentQuestion });
  }, [currentTime]);

  return (
    <Fragment>
      <div className='lg:col-span-2'>
        {/* Video Control */}
        <div
          className={`group relative w-full max-w-5xl mx-auto rounded-2xl bg-black aspect-video shadow-xl`}
        >
          <div
            ref={containerRef}
            tabIndex={0}
            className={`group relative w-full rounded-t-2xl overflow-hidden bg-black shadow-xl`}
          >
            <video
              ref={videoRef}
              className='w-full h-auto outline-none'
              src={src}
              playsInline
              preload='metadata'
              onClick={togglePlay}
              onLoadedData={() => setIsLoadingVideo(false)}
              onCanPlay={() => setIsLoadingVideo(false)}
              onPlaying={() => setIsLoadingVideo(false)}
              onWaiting={() => setIsLoadingVideo(true)}
            />

            {/* Loading Overlay */}
            {isLoadingVideo && (
              <div className='absolute inset-0 flex items-center justify-center bg-black/40 z-30'>
                <div className='h-10 w-10 animate-spin rounded-full border-4 border-white border-t-transparent' />
              </div>
            )}

            {/* Error banner */}
            {error && (
              <div className='absolute top-2 left-2 right-2 z-20 rounded-xl bg-red-600/90 text-white px-4 py-2 text-sm'>
                {error}
              </div>
            )}

            {/* Big center play overlay when paused */}
            {!isPlaying && (
              <button
                onClick={togglePlay}
                className='absolute inset-0 h-16 w-16 rounded-full bg-white/10 hover:bg-white/20 text-white grid place-items-center backdrop-blur-sm'
                aria-label='Play'
                style={{
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <Play size={28} />
              </button>
            )}
          </div>
          {/* Controls */}
          <div className='bg-gray-900 p-4 rounded-b-2xl'>
            {/* Progress bar */}
            <div
              className='relative h-2 w-full cursor-pointer rounded-full bg-white/20'
              id='progress-bar'
              onMouseDown={(e) => {
                setSeeking(true);
                handleSeek(e.clientX);

                const onMove = (ev: MouseEvent) => handleSeek(ev.clientX);
                const onUp = () => {
                  setSeeking(false);
                  window.removeEventListener('mousemove', onMove);
                  window.removeEventListener('mouseup', onUp);
                };

                window.addEventListener('mousemove', onMove);
                window.addEventListener('mouseup', onUp);
              }}
            >
              <div
                className='absolute inset-y-0 left-0 rounded-full'
                style={{
                  width: `${bufferedPct}%`,
                  background: 'rgba(255,255,255,0.35)',
                }}
              />
              <div
                className='absolute inset-y-0 left-0 rounded-full'
                style={{ width: `${playedPct}%`, background: 'white' }}
              />
            </div>

            <div className='mt-3 flex items-center justify-between gap-3'>
              <div className='flex items-center gap-2'>
                <button
                  onClick={() => seekBy(-10)}
                  className='rounded-2xl bg-white/10 hover:bg-white/20 p-2 text-white'
                  aria-label='Rewind 10s'
                >
                  <Rewind size={20} />
                </button>
                <button
                  onClick={togglePlay}
                  className='rounded-2xl bg-white/10 hover:bg-white/20 p-2 text-white'
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>
                <button
                  onClick={() => seekBy(15)}
                  className='rounded-2xl bg-white/10 hover:bg-white/20 p-2 text-white'
                  aria-label='Forward 15s'
                >
                  <FastForward size={20} />
                </button>

                {/* Time */}
                <div className='ml-2 text-xs text-white/90 tabular-nums'>
                  {formatTime(currentTime)} / {formatTime(duration || 0)}
                </div>
              </div>

              {/* Center controls */}
              <div className='flex items-center gap-3'>
                {/* Volume */}
                <button
                  onClick={toggleMute}
                  className='rounded-2xl bg-white/10 hover:bg-white/20 p-2 text-white'
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                <input
                  aria-label='Volume'
                  type='range'
                  min={0}
                  max={1}
                  step={0.01}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => changeVolume(parseFloat(e.target.value))}
                  className='w-28 accent-white'
                />

                {/* Speed */}
                <div className='relative'>
                  <details className='group/speed relative'>
                    <summary className='list-none cursor-pointer rounded-2xl bg-white/10 hover:bg-white/20 px-3 py-2 text-xs text-white flex items-center gap-1'>
                      <Settings size={16} /> {playbackRate.toFixed(2)}x
                    </summary>
                    <div className='absolute right-0 mt-2 w-32 rounded-xl bg-zinc-900/95 p-2 shadow-2xl ring-1 ring-white/10 z-50'>
                      {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((r) => (
                        <button
                          key={r}
                          onClick={() => setRate(r)}
                          className={`w-full rounded-lg px-3 py-2 text-left text-sm text-white/90 hover:bg-white/10 ${playbackRate === r ? 'bg-white/10' : ''
                            }`}
                        >
                          {r.toFixed(2)}x
                        </button>
                      ))}
                    </div>
                  </details>
                </div>
              </div>

              <div className='flex items-center gap-2'>
                <button
                  onClick={requestPiP}
                  className='rounded-2xl bg-white/10 hover:bg-white/20 p-2 text-white'
                  aria-label='Picture in Picture'
                >
                  <PictureInPicture2 size={20} />
                </button>

                <button
                  onClick={toggleFullscreen}
                  className='rounded-2xl bg-white/10 hover:bg-white/20 p-2 text-white'
                  aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                >
                  {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Transcript Section */}
        {showTranscript && currentQuestion && (
          <div className='bg-white rounded-2xl shadow-lg p-6 mt-6'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-bold text-gray-900'>Live Transcript</h3>
              <button
                onClick={() => setShowTranscript(!showTranscript)}
                className='text-gray-600 hover:text-gray-900 transition-colors'
              >
                <Eye className='h-5 w-5' />
              </button>
            </div>
            <div className='bg-gray-50 p-4 rounded-lg'>
              <div className='text-sm font-medium text-gray-700 mb-2'>
                Question{' '}
                {(interviewData?.StudentInterviewAnswer?.findIndex?.(
                  (que) => que.id === currentQuestion.id
                ) || 0) + 1}
                : {currentQuestion?.Question?.question}
              </div>
              <div className='text-gray-800 leading-relaxed'>{currentQuestion?.answer}</div>
              <div className='mt-3 p-3 bg-blue-50 rounded-lg'>
                <div className='text-sm font-medium text-blue-900 mb-1'>AI Feedback:</div>
                <div className='text-sm text-blue-800'>{currentQuestion?.aiEvaluation}</div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Sidebar */}
      <div className='space-y-6'>
        {/* Interview Summary */}
        <div className='bg-white rounded-2xl shadow-lg p-6'>
          <h3 className='text-lg font-bold text-gray-900 mb-4'>Interview Summary</h3>
          <div className='space-y-4'>
            {(interviewData?.status === 'completed' ||
              interviewData?.status === 'under_review') && (
                <>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-gray-600'>Overall Score</span>
                    <span
                      className={`text-lg font-bold ${getScoreColor(
                        interviewData?.overallScore ?? 0
                      )}`}
                    >
                      {interviewData?.overallScore}%
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-gray-600'>Duration</span>
                    <span className='text-sm font-medium text-gray-900'>
                      {interviewData?.duration || 0} minutes
                    </span>
                  </div>
                </>
              )}
            <div className='flex items-center justify-between'>
              <span className='text-sm text-gray-600'>Date</span>
              <span className='text-sm font-medium text-gray-900'>
                {new Date(interviewData?.interviewDate).toLocaleDateString()}
              </span>
            </div>
            {(interviewData?.status === 'completed' ||
              interviewData?.status === 'under_review') && (
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-gray-600'>Questions</span>
                  <span className='text-sm font-medium text-gray-900'>
                    {interviewData?.attemptedQuestions}
                  </span>
                </div>
              )}
          </div>
        </div>

        {/* Question Navigation */}
        <div className='bg-white rounded-2xl shadow-lg p-6'>
          <h3 className='text-lg font-bold text-gray-900 mb-4'>Questions</h3>
          <div className='space-y-3'>
            {interviewData?.StudentInterviewAnswer &&
              interviewData?.StudentInterviewAnswer.map((item, index) => (
                <button
                  key={item.Question.id}
                  onClick={() => jumpToQuestion(index)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${selectedQuestion === index
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-sm font-medium text-gray-900'>Question {index + 1}</span>
                    <div className='flex items-center space-x-2'>
                      <span className={`text-sm font-bold ${getQuestionScoreColor(item.score, item.Question.type)}`}>
                        {item.Question.type === 'communication' || item.Question.type === 'behavioral' ? `${item.score} out of 10` : item.score}
                      </span>
                      {/* <span className="text-xs text-gray-500">
                              {formatTime(item.startTime)}
                            </span> */}
                    </div>
                  </div>
                  <div className='text-sm text-gray-600 line-clamp-2'>{item.Question.question}</div>
                </button>
              ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className='bg-white rounded-2xl shadow-lg p-6'>
          <h3 className='text-lg font-bold text-gray-900 mb-4'>Performance Metrics</h3>

          {(interviewData?.status === 'completed' || interviewData?.status === 'under_review') && (
            <div className='space-y-4'>
              <div>
                <h4 className='text-sm font-medium text-gray-700 mb-3'>Behavioral Analysis</h4>
                <div className='space-y-2'>
                  {renderAnalysis(
                    'Eye Contact',
                    interviewData?.behavioral_analysis?.eye_contact ?? 0
                  )}
                  {renderAnalysis('Posture', interviewData?.behavioral_analysis?.posture ?? 0)}
                  {renderAnalysis('Gestures', interviewData?.behavioral_analysis?.gestures ?? 0)}
                  {renderAnalysis(
                    'Face Expressions',
                    interviewData?.behavioral_analysis?.facial_expressions ?? 0
                  )}
                  {renderAnalysis(
                    'Voice Tone',
                    interviewData?.behavioral_analysis?.voice_tone ?? 0
                  )}
                  {renderAnalysis(
                    'Confidence',
                    interviewData?.behavioral_analysis?.confidence ?? 0
                  )}
                  {renderAnalysis(
                    'Engagement',
                    interviewData?.behavioral_analysis?.engagement ?? 0
                  )}
                </div>
              </div>

              {/* <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Technical Assessment
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(
                        MockInterviewData.technicalAssessment
                      ).map(([metric, score]) => (
                        <div
                          key={metric}
                          className="flex items-center justify-between"
                        >
                          <span className="text-xs text-gray-600 capitalize">
                            {metric.replace(/([A-Z])/g, " $1").trim()}
                          </span>
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${
                                  score >= 90
                                    ? "bg-green-500"
                                    : score >= 80
                                    ? "bg-blue-500"
                                    : score >= 70
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                                }`}
                                style={{ width: `${score}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-medium text-gray-900 w-8">
                              {score}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div> */}
            </div>
          )}
        </div>
      </div>
    </Fragment>
  );
};

const renderAnalysis = (title: string, score: number) => {
  return (
    <div className='flex items-center justify-between'>
      <span className='text-xs text-gray-600 capitalize'>{title}</span>
      <div className='flex items-center space-x-2'>
        <div className='w-16 bg-gray-200 rounded-full h-1.5'>
          <div
            className={`h-1.5 rounded-full ${score >= 90
              ? 'bg-green-500'
              : score >= 80
                ? 'bg-blue-500'
                : score >= 70
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
            style={{ width: `${score}%` }}
          ></div>
        </div>
        <span className='text-xs font-medium text-gray-900 w-8'>{score}%</span>
      </div>
    </div>
  );
};
