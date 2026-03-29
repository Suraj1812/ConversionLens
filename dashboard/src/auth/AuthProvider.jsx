import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { clearStoredSessionToken, getJson, getStoredSessionToken, postJson, setStoredSessionToken } from '../api.js';
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
      if (!getStoredSessionToken()) {
        if (isActive) {
          setUser(null);
          setLoading(false);
        }

        return;
      }

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
      clearStoredSessionToken();
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

      setStoredSessionToken(payload.sessionToken);
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

    clearStoredSessionToken();
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
