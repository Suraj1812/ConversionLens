import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { getJson, postJson } from '../api.js';
import { useToast } from '../toast/ToastProvider.jsx';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const toast = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transition, setTransition] = useState(null);
  const unauthorizedToastAtRef = useRef(0);

  useEffect(() => {
    let isActive = true;

    async function bootstrap() {
      try {
        const payload = await getJson('/auth/me', undefined, {
          suppressUnauthorizedEvent: true
        });

        if (isActive) {
          setUser(payload.user);
        }
      } catch (error) {
        if (isActive) {
          setUser(null);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    bootstrap();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    function handleUnauthorized() {
      setUser(null);
      setTransition(null);

      const now = Date.now();

      if (now - unauthorizedToastAtRef.current > 4000) {
        unauthorizedToastAtRef.current = now;
        toast.error({
          title: 'Session expired',
          description: 'Sign in again to keep using your analytics dashboard.'
        });
      }
    }

    window.addEventListener('shoplytics:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('shoplytics:unauthorized', handleUnauthorized);
    };
  }, [toast]);

  async function login(credentials) {
    setTransition({
      title: 'Signing you in',
      description: 'Opening your analytics workspace.'
    });

    try {
      const payload = await postJson('/auth/login', credentials, {
        suppressUnauthorizedEvent: true
      });

      setUser(payload.user);
      return payload.user;
    } catch (error) {
      setTransition(null);
      throw error;
    }
  }

  async function register(credentials) {
    setTransition({
      title: 'Creating your account',
      description: 'Securing access and preparing your dashboard.'
    });

    try {
      const payload = await postJson('/auth/register', credentials, {
        suppressUnauthorizedEvent: true
      });

      setUser(payload.user);
      return payload.user;
    } catch (error) {
      setTransition(null);
      throw error;
    }
  }

  async function logout() {
    setTransition({
      title: 'Signing you out',
      description: 'Closing your secure session.'
    });

    await postJson('/auth/logout', undefined, {
      suppressUnauthorizedEvent: true
    }).catch(() => null);

    setUser(null);
    toast.info({
      title: 'Signed out',
      description: 'Your session has been closed securely.'
    });
  }

  async function refresh() {
    const payload = await getJson('/auth/me', undefined, {
      suppressUnauthorizedEvent: true
    });
    setUser(payload.user);
    return payload.user;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refresh,
        register,
        clearTransition: () => setTransition(null),
        transition
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }

  return context;
}
