import { useEffect, useState } from 'react';
import { ArrowLeft, Eye, EyeOff, KeyRound, RefreshCw, Save, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { userAPI, User as ApiUser } from '../services/api';

export function UserLlmKeyManager() {
  const { dispatch } = useApp();
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [saving, setSaving] = useState(false);

  const [currentUser, setCurrentUser] = useState<ApiUser | null>(null);
  const [llmKey, setLlmKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [jobPostLlmKey, setJobPostLlmKey] = useState('');
  const [showJobPostKey, setShowJobPostKey] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const isKeyEmpty = llmKey.trim() === '';
  const isJobPostKeyEmpty = jobPostLlmKey.trim() === '';
  const bothKeysSet = !isKeyEmpty && !isJobPostKeyEmpty;

  const fetchProfile = async () => {
    setStatus(null);
    setLoadingProfile(true);
    try {
      const resp = await userAPI.getProfile();
      if (!resp?.success || !resp?.user) throw new Error(resp?.message || 'Failed to load profile');
      setCurrentUser(resp.user);
      setLlmKey(resp.user.llmKey ?? '');
      setJobPostLlmKey(resp.user.jobPostLlmKey ?? '');
    } catch (e: any) {
      setStatus({ type: 'error', text: e?.message || 'Failed to load profile' });
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onBack = () => {
    // Both keys are required
    if (!bothKeysSet) {
      setStatus({ type: 'error', text: 'Both LLM key and Job post LLM key are required.' });
      return;
    }
    dispatch({ type: 'SET_VIEW', payload: 'admin' });
  };

  const onSave = async () => {
    setStatus(null);
    if (!currentUser?.id) {
      setStatus({ type: 'error', text: 'User profile not loaded.' });
      return;
    }
    if (isKeyEmpty) {
      setStatus({ type: 'error', text: 'LLM key is required.' });
      return;
    }

    setSaving(true);
    try {
      const resp = await userAPI.updateUserLlmKey(currentUser.id, llmKey.trim());
      if (!resp?.success) throw new Error(resp?.message || 'Failed to update LLM key');

      // refresh profile so current key + hasLlmKey are updated
      await fetchProfile();
      setStatus({ type: 'success', text: resp.message || 'LLM key updated.' });
    } catch (e: any) {
      setStatus({ type: 'error', text: e?.message || 'Failed to update LLM key' });
    } finally {
      setSaving(false);
    }
  };

  const onSaveJobPostKey = async () => {
    setStatus(null);
    if (!currentUser?.id) {
      setStatus({ type: 'error', text: 'User profile not loaded.' });
      return;
    }
    if (isJobPostKeyEmpty) {
      setStatus({ type: 'error', text: 'Job post LLM key is required.' });
      return;
    }

    setSaving(true);
    try {
      const resp = await userAPI.updateUserJobPostLlmKey(currentUser.id, jobPostLlmKey.trim());
      if (!resp?.success) throw new Error(resp?.message || 'Failed to update Job post LLM key');
      await fetchProfile();
      setStatus({ type: 'success', text: resp.message || 'Job post LLM key updated.' });
    } catch (e: any) {
      setStatus({ type: 'error', text: e?.message || 'Failed to update Job post LLM key' });
    } finally {
      setSaving(false);
    }
  };

  const onClear = async () => {
    setStatus(null);
    if (!currentUser?.id) {
      setStatus({ type: 'error', text: 'User profile not loaded.' });
      return;
    }

    setSaving(true);
    try {
      const resp = await userAPI.updateUserLlmKey(currentUser.id, null);
      if (!resp?.success) throw new Error(resp?.message || 'Failed to clear LLM key');
      await fetchProfile();
      setStatus({ type: 'success', text: resp.message || 'LLM key cleared.' });
    } catch (e: any) {
      setStatus({ type: 'error', text: e?.message || 'Failed to clear LLM key' });
    } finally {
      setSaving(false);
    }
  };

  const onClearJobPostKey = async () => {
    setStatus(null);
    if (!currentUser?.id) {
      setStatus({ type: 'error', text: 'User profile not loaded.' });
      return;
    }

    setSaving(true);
    try {
      const resp = await userAPI.updateUserJobPostLlmKey(currentUser.id, null);
      if (!resp?.success) throw new Error(resp?.message || 'Failed to clear Job post LLM key');
      await fetchProfile();
      setStatus({ type: 'success', text: resp.message || 'Job post LLM key cleared.' });
    } catch (e: any) {
      setStatus({ type: 'error', text: e?.message || 'Failed to clear Job post LLM key' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'>
      <header className='bg-white/80 backdrop-blur-lg shadow-sm border-b border-white/20 sticky top-0 z-50'>
        <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between py-4'>
            <div className='flex items-center space-x-4'>
              <button
                onClick={onBack}
                className='flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-all duration-200 hover:bg-gray-100 px-3 py-2 rounded-lg'
              >
                <ArrowLeft className='h-5 w-5' />
                <span className='font-medium'>Back</span>
              </button>
              <div className='h-8 w-px bg-gray-300'></div>
              <div>
                <h1 className='text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent'>
                  LLM Key Manager
                </h1>
                <p className='text-sm text-gray-500'>Set / clear a user&apos;s LLM key</p>
              </div>
            </div>
            <button
              onClick={() => fetchProfile()}
              disabled={loadingProfile}
              className='flex items-center space-x-2 bg-white/70 border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl hover:bg-white transition-all duration-200 shadow-sm disabled:opacity-60'
              title='Refresh'
            >
              <RefreshCw className={`h-4 w-4 ${loadingProfile ? 'animate-spin' : ''}`} />
              <span className='font-medium'>Refresh</span>
            </button>
          </div>
        </div>
      </header>

      <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {status && (
          <div
            className={`mb-6 rounded-xl border p-4 ${status.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
              }`}
          >
            {status.text}
          </div>
        )}

        {currentUser && (!currentUser.hasLlmKey || !currentUser.hasJobPostLlmKey) && (
          <div className='mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900'>
            Both <span className='font-semibold'>LLM key</span> and{' '}
            <span className='font-semibold'>Job post LLM key</span> are required. Please set both keys below.
          </div>
        )}

        <div className='bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Logged-in user</label>
              <div className='bg-white/80 border border-gray-200 rounded-xl p-4'>
                <div className='text-sm text-gray-600'>
                  <span className='font-medium text-gray-800'>Email:</span> {currentUser?.email ?? '—'}
                </div>
                <div className='text-sm text-gray-600 mt-1'>
                  <span className='font-medium text-gray-800'>Status:</span>{' '}
                  {currentUser
                    ? `LLM key: ${currentUser.hasLlmKey ? 'set' : 'not set'} • Job post LLM key: ${currentUser.hasJobPostLlmKey ? 'set' : 'not set'}`
                    : '—'}
                </div>
                {loadingProfile && <div className='text-sm text-gray-500 mt-2'>Loading profile…</div>}
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Your LLM key <span className='text-red-600'>*</span>
              </label>
              <div className='relative'>
                <KeyRound className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                <input
                  type={showKey ? 'text' : 'password'}
                  value={llmKey}
                  onChange={(e) => setLlmKey(e.target.value)}
                  placeholder='Your LLM key'
                  className='w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80'
                />
                <button
                  type='button'
                  onClick={() => setShowKey((v) => !v)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800'
                  title={showKey ? 'Hide key' : 'Show key'}
                >
                  {showKey ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                </button>
              </div>

              <div className='flex flex-col sm:flex-row gap-3 mt-6'>
                <button
                  onClick={onSave}
                  disabled={saving || !currentUser?.id || isKeyEmpty}
                  className='inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg disabled:opacity-60'
                >
                  <Save className='h-4 w-4' />
                  <span className='font-medium'>{saving ? 'Saving…' : 'Save key'}</span>
                </button>

                <button
                  onClick={onClear}
                  disabled={true}
                  className='inline-flex items-center justify-center space-x-2 bg-white/80 border border-gray-200 text-gray-800 px-4 py-3 rounded-xl hover:bg-white transition-all duration-200 shadow-sm disabled:opacity-60'
                  title='LLM key is required'
                >
                  <Trash2 className='h-4 w-4 text-red-600' />
                  <span className='font-medium'>Clear key</span>
                </button>
              </div>

              <div className='mt-8'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Your Job post LLM key <span className='text-red-600'>*</span>
                </label>
                <div className='relative'>
                  <KeyRound className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                  <input
                    type={showJobPostKey ? 'text' : 'password'}
                    value={jobPostLlmKey}
                    onChange={(e) => setJobPostLlmKey(e.target.value)}
                    placeholder='Your Job post LLM key'
                    className='w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80'
                  />
                  <button
                    type='button'
                    onClick={() => setShowJobPostKey((v) => !v)}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800'
                    title={showJobPostKey ? 'Hide key' : 'Show key'}
                  >
                    {showJobPostKey ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                  </button>
                </div>

                <div className='flex flex-col sm:flex-row gap-3 mt-6'>
                  <button
                    onClick={onSaveJobPostKey}
                    disabled={saving || !currentUser?.id || isJobPostKeyEmpty}
                    className='inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-4 py-3 rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 shadow-lg disabled:opacity-60'
                  >
                    <Save className='h-4 w-4' />
                    <span className='font-medium'>{saving ? 'Saving…' : 'Save job key'}</span>
                  </button>

                  <button
                    onClick={onClearJobPostKey}
                    disabled={true}
                    className='inline-flex items-center justify-center space-x-2 bg-white/80 border border-gray-200 text-gray-800 px-4 py-3 rounded-xl hover:bg-white transition-all duration-200 shadow-sm disabled:opacity-60'
                    title='Job post LLM key is required'
                  >
                    <Trash2 className='h-4 w-4 text-red-600' />
                    <span className='font-medium'>Clear job key</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

