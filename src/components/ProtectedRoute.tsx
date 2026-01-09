// adminaiinterview/src/components/ProtectedRoute.tsx
import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import api, { userAPI } from '../services/api';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { dispatch } = useApp();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('token');

      // No token, redirect to login
      if (!token) {
        console.log('No token found, redirecting to login');
        dispatch({ type: 'SET_VIEW', payload: 'login' });
        setIsVerifying(false);
        return;
      }

      try {
        // Verify token is still valid by calling profile endpoint
        const response = await userAPI.getProfile();
        console.log('Profile response:', response);

        if (!response || !response.user) {
          throw new Error('Invalid profile response');
        }

        const profile = response.user;
        
        // Update local storage with fresh profile data
        localStorage.setItem('user', JSON.stringify({
          id: profile.id,
          username: profile.username,
          email: profile.email,
          name: profile.name,
          phoneNumber: profile.phoneNumber,
        }));

        console.log('Auth verified successfully');
        setIsAuthorized(true);
      } catch (error: any) {
        console.error('Auth verification failed:', error);
        
        // Token invalid or expired
        localStorage.clear();
        dispatch({ type: 'SET_VIEW', payload: 'login' });
      } finally {
        setIsVerifying(false);
      }
    };

    verifyAuth();
  }, [dispatch, requireAdmin]);

  // Show loading state while verifying
  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Verifying authentication...</p>
          <p className="text-gray-500 text-sm mt-2">Please wait...</p>
        </div>
      </div>
    );
  }

  // If not authorized, don't render anything (redirect handled above)
  if (!isAuthorized) {
    return null;
  }

  // User is authorized, render children
  return <>{children}</>;
}