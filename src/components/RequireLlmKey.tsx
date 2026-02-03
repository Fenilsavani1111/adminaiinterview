import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { userAPI } from '../services/api';

interface RequireLlmKeyProps {
  children: React.ReactNode;
}

/**
 * Guard component: only render children if the logged-in user has a jobPostLlmKey.
 * If missing, redirect to the LLM key manager page.
 */
export function RequireLlmKey({ children }: RequireLlmKeyProps) {
  const { dispatch } = useApp();
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        const resp = await userAPI.getProfile();
        const key = resp?.user?.jobPostLlmKey;
        const hasKey = Boolean(key && String(key).trim() !== '');

        if (!hasKey) {
          dispatch({ type: 'SET_VIEW', payload: 'llm-key' });
          setAllowed(false);
          return;
        }

        setAllowed(true);
      } catch {
        // If profile fails, ProtectedRoute will already redirect to login in most cases;
        // here we just prevent rendering.
        setAllowed(false);
      } finally {
        setChecking(false);
      }
    };

    check();
  }, [dispatch]);

  if (checking) return null;
  if (!allowed) return null;
  return <>{children}</>;
}

