import React, { useState } from 'react';
import { LogIn, AlertCircle } from 'lucide-react';
import { userAPI } from '../services/api';
import { useApp } from '../context/AppContext';

export function Login() {
  const { dispatch } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('🔐 LOGIN ATTEMPT');
    console.log('📧 Email:', email);

    try {
      const response = await userAPI.login(email.trim(), password);

      console.log('✅ LOGIN RESPONSE:', response);

      if (!response?.user?.access_token) {
        console.error('❌ No access_token in response');
        throw new Error('Invalid response from server');
      }

      const { user } = response;

      console.log('👤 User Data:', {
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        hasToken: !!user.access_token,
      });

      // ✅ Check if token is stored (done automatically in api.ts)
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      console.log('💾 LocalStorage Check AFTER LOGIN:');
      console.log('  - Token stored:', !!storedToken);
      console.log('  - Token length:', storedToken?.length || 0);
      console.log('  - User stored:', !!storedUser);
      console.log('  - Token preview:', storedToken?.substring(0, 50) + '...');
      console.log('  - Full token:', storedToken);

      // Admin-only access
      if (user.isAdmin) {
        console.log('✅ Admin user - redirecting to dashboard');
        dispatch({ type: 'SET_VIEW', payload: 'admin' });
      } else {
        console.log('❌ Not an admin user');
        setError('Access denied. Admin privileges required.');
        // Clear auth if not admin
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        console.log('🗑️ LocalStorage cleared (non-admin)');
      }
    } catch (err: any) {
      console.error('❌ LOGIN ERROR:', err);
      console.error('Error details:', {
        message: err?.message,
        response: err?.response?.data,
        status: err?.response?.status,
      });

      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Login failed. Please try again.'
      );
    } finally {
      setLoading(false);
      console.log('🏁 Login process completed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <LogIn className="w-12 h-12 text-indigo-600" />
        </div>

        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
          Admin Login
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Sign in to access the admin dashboard
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              placeholder="Enter your email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              placeholder="Enter your password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:bg-gray-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => dispatch({ type: 'SET_VIEW', payload: 'register' })}
            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
            disabled={loading}
          >
            Don&apos;t have an account? Register
          </button>
        </div>
      </div>
    </div>
  );
}