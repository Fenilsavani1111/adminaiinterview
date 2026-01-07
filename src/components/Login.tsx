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

    try {
      // ✅ FIX: pass email as first argument, password as second
      const response = await userAPI.login(email.trim(), password);

      if (!response?.user?.access_token) {
        throw new Error('Invalid response from server');
      }

      const { user } = response;

      // Store token
      localStorage.setItem('token', user.access_token);

      // Store user info
      localStorage.setItem(
        'user',
        JSON.stringify({
          id: user.id,
          username: user.username,
          email: user.email,
          isAdmin: user.isAdmin || false,
        })
      );

      // Admin-only access
      if (user.isAdmin) {
        dispatch({ type: 'SET_VIEW', payload: 'admin' });
      } else {
        setError('Access denied. Admin privileges required.');
        localStorage.clear();
      }
    } catch (err: any) {
      console.error('Login error:', err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Login failed. Please try again.'
      );
    } finally {
      setLoading(false);
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
            <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Password */}
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-indigo-400"
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
